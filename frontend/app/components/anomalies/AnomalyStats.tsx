import React from 'react';
import { AnomalySeverity } from '@/app/types/anomaly.types';

interface AnomalyStatsProps {
  totalAnomalies: number;
  anomalyRate: number;
  recentCount: number;
  bySeverity: Record<AnomalySeverity, number>;
}

export function AnomalyStats({
  totalAnomalies,
  anomalyRate,
  recentCount,
  bySeverity,
}: AnomalyStatsProps) {
  const severityIcons: Record<AnomalySeverity, string> = {
    [AnomalySeverity.LOW]: '🔵',
    [AnomalySeverity.MEDIUM]: '🟡',
    [AnomalySeverity.HIGH]: '🟠',
    [AnomalySeverity.CRITICAL]: '🔴',
  };

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {totalAnomalies}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Rate/hour</div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {anomalyRate.toFixed(1)}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Recent</div>
          <div className="mt-2 text-2xl font-bold text-cyan-600">
            {recentCount}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Critical</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {bySeverity[AnomalySeverity.CRITICAL] || 0}
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">
          By Severity
        </h3>
        <div className="space-y-3">
          {Object.entries(severityIcons).map(([severity, icon]) => (
            <div key={severity} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="capitalize text-zinc-700 dark:text-zinc-300">
                  {severity}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      severity === 'critical'
                        ? 'bg-red-500'
                        : severity === 'high'
                          ? 'bg-orange-500'
                          : severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${
                        totalAnomalies > 0
                          ? ((bySeverity[severity as AnomalySeverity] || 0) / totalAnomalies) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  {bySeverity[severity as AnomalySeverity] || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
