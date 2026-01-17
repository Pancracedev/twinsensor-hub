import React from 'react';
import { AnomalyEvent, AnomalySeverity } from '@/app/types/anomaly.types';

interface AnomalyAlertProps {
  anomaly: AnomalyEvent;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
}

export function AnomalyAlert({
  anomaly,
  onDismiss,
  onAcknowledge,
}: AnomalyAlertProps) {
  const severityColors: Record<AnomalySeverity, { bg: string; border: string; text: string; icon: string }> = {
    [AnomalySeverity.LOW]: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: '🔵',
    },
    [AnomalySeverity.MEDIUM]: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '🟡',
    },
    [AnomalySeverity.HIGH]: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: '🟠',
    },
    [AnomalySeverity.CRITICAL]: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '🔴',
    },
  };

  const colors = severityColors[anomaly.severity];

  return (
    <div
      className={`rounded-lg border ${colors.border} ${colors.bg} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{colors.icon}</span>
            <h3 className={`font-semibold ${colors.text}`}>
              {anomaly.type.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <span className={`ml-auto inline-block rounded px-2 py-1 text-xs font-medium ${colors.text}`}>
              {anomaly.severity}
            </span>
          </div>
          <p className={`mt-1 text-sm ${colors.text} opacity-75`}>
            {anomaly.description}
          </p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className={colors.text}>
              Confidence: {(anomaly.confidence * 100).toFixed(1)}%
            </span>
            <span className={colors.text}>
              Deviation: {anomaly.baselineDeviation.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!anomaly.acknowledged && (
            <button
              onClick={onAcknowledge}
              className={`rounded px-3 py-1 text-xs font-medium text-white transition-colors ${
                anomaly.severity === AnomalySeverity.CRITICAL
                  ? 'bg-red-500 hover:bg-red-600'
                  : anomaly.severity === AnomalySeverity.HIGH
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              ✓ Acknowledge
            </button>
          )}
          {anomaly.acknowledged && (
            <span className="rounded px-3 py-1 text-xs font-medium text-gray-500">
              ✓ Acknowledged
            </span>
          )}
          <button
            onClick={onDismiss}
            className="rounded px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
