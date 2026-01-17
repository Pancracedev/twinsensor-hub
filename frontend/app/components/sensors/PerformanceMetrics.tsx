/**
 * Performance Metrics Component
 * Displays CPU, memory, temperature, and battery status
 */

'use client';

import { usePerformanceMetrics } from '../../hooks';

interface MetricGaugeProps {
  label: string;
  value: number;
  max?: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon?: string;
}

const MetricGauge = ({ label, value, max = 100, unit, status, icon }: MetricGaugeProps) => {
  const percentage = (value / max) * 100;
  const statusColors = {
    normal: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  const statusTextColors = {
    normal: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300 flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </span>
        <span className={`text-sm font-mono font-bold ${statusTextColors[status]}`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded h-2">
        <div
          className={`h-full rounded transition-all ${statusColors[status]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export const PerformanceMetrics = () => {
  const {
    latestMetrics,
    getStatusIndicators,
    getFormattedMetrics,
    getTrend,
    getAlertMessages,
  } = usePerformanceMetrics();

  if (!latestMetrics) {
    return (
      <div className="bg-gray-800/50 p-4 rounded-lg text-center text-gray-400">
        <p className="text-sm">Waiting for performance data...</p>
      </div>
    );
  }

  const statuses = getStatusIndicators();
  const formatted = getFormattedMetrics();
  const alerts = getAlertMessages();

  const cpuTrend = getTrend('cpu');
  const memoryTrend = getTrend('memory');
  const temperatureTrend = getTrend('temperature');

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-lg space-y-1">
          {alerts.map((alert, idx) => (
            <p key={idx} className="text-sm text-red-400">
              {alert}
            </p>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricGauge
          label="CPU"
          value={latestMetrics.cpu}
          unit="%"
          status={statuses.cpu}
          icon={cpuTrend === 'up' ? '📈' : cpuTrend === 'down' ? '📉' : '→'}
        />
        <MetricGauge
          label="Memory"
          value={latestMetrics.memory}
          unit="%"
          status={statuses.memory}
          icon={memoryTrend === 'up' ? '📈' : memoryTrend === 'down' ? '📉' : '→'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricGauge
          label="Temperature"
          value={latestMetrics.temperature}
          max={100}
          unit="°C"
          status={statuses.temperature}
          icon={temperatureTrend === 'up' ? '🔥' : '❄️'}
        />
        <MetricGauge
          label="Battery"
          value={latestMetrics.battery}
          unit="%"
          status="normal"
          icon={latestMetrics.charging ? '🔌' : '🔋'}
        />
      </div>

      {/* Status Summary */}
      <div className="bg-gray-800/50 p-3 rounded-lg text-xs">
        <div className="text-gray-400 mb-2">Status Summary</div>
        <div className="space-y-1 font-mono text-gray-300">
          <div className="flex justify-between">
            <span>CPU:</span>
            <span className={statuses.cpu === 'critical' ? 'text-red-400' : statuses.cpu === 'warning' ? 'text-yellow-400' : 'text-green-400'}>
              {statuses.cpu.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={statuses.memory === 'critical' ? 'text-red-400' : statuses.memory === 'warning' ? 'text-yellow-400' : 'text-green-400'}>
              {statuses.memory.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Temperature:</span>
            <span className={statuses.temperature === 'critical' ? 'text-red-400' : statuses.temperature === 'warning' ? 'text-yellow-400' : 'text-green-400'}>
              {statuses.temperature.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
