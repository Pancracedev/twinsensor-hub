import React, { useState } from 'react';
import { AnomalyType, AnomalySeverity } from '@/app/types/anomaly.types';
import { Button } from '@/app/components/common/Button';

interface AnomalyConfigProps {
  confidenceThreshold: number;
  severityThreshold: AnomalySeverity;
  onConfigChange?: (config: {
    confidenceThreshold: number;
    severityThreshold: AnomalySeverity;
  }) => void;
}

export function AnomalyConfig({
  confidenceThreshold,
  severityThreshold,
  onConfigChange,
}: AnomalyConfigProps) {
  const [localConfidence, setLocalConfidence] = useState(confidenceThreshold);
  const [localSeverity, setLocalSeverity] = useState(severityThreshold);

  const handleSave = () => {
    onConfigChange?.({
      confidenceThreshold: localConfidence,
      severityThreshold: localSeverity,
    });
  };

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
        Detection Configuration
      </h3>

      {/* Confidence Threshold */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confidence Threshold
          </label>
          <span className="text-sm font-semibold text-cyan-600">
            {(localConfidence * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={localConfidence}
          onChange={(e) => setLocalConfidence(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer rounded-lg bg-zinc-200 accent-cyan-600 dark:bg-zinc-800"
        />
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Minimum confidence required to report an anomaly
        </p>
      </div>

      {/* Severity Threshold */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Minimum Severity to Alert
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {['low', 'medium', 'high', 'critical'].map((severity) => (
            <button
              key={severity}
              onClick={() => setLocalSeverity(severity as AnomalySeverity)}
              className={`rounded px-3 py-2 text-xs font-medium transition-colors ${
                localSeverity === severity
                  ? severity === 'critical'
                    ? 'bg-red-500 text-white'
                    : severity === 'high'
                      ? 'bg-orange-500 text-white'
                      : severity === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-blue-500 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Only report anomalies with this severity or higher
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
