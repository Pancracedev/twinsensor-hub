import React from 'react';
import { AnomalyEvent, AnomalySeverity } from '@/app/types/anomaly.types';
import { AnomalyAlert } from './AnomalyAlert';

interface AnomalyListProps {
  anomalies: AnomalyEvent[];
  onAcknowledge?: (id: string) => void;
  onRemove?: (id: string) => void;
  maxDisplay?: number;
}

export function AnomalyList({
  anomalies,
  onAcknowledge,
  onRemove,
  maxDisplay = 10,
}: AnomalyListProps) {
  const displayedAnomalies = anomalies.slice(0, maxDisplay);

  if (anomalies.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/20">
        <p className="text-lg font-semibold text-green-700 dark:text-green-300">
          ✓ No Anomalies Detected
        </p>
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          All systems operating normally
        </p>
      </div>
    );
  }

  // Sort by severity (critical first) and then by timestamp (newest first)
  const sortedAnomalies = [...displayedAnomalies].sort((a, b) => {
    const severityOrder: Record<AnomalySeverity, number> = {
      [AnomalySeverity.CRITICAL]: 0,
      [AnomalySeverity.HIGH]: 1,
      [AnomalySeverity.MEDIUM]: 2,
      [AnomalySeverity.LOW]: 3,
    };

    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    return b.timestamp - a.timestamp;
  });

  return (
    <div className="space-y-3">
      {sortedAnomalies.map((anomaly) => (
        <AnomalyAlert
          key={anomaly.id}
          anomaly={anomaly}
          onAcknowledge={() => onAcknowledge?.(anomaly.id)}
          onDismiss={() => onRemove?.(anomaly.id)}
        />
      ))}

      {anomalies.length > maxDisplay && (
        <div className="rounded-lg bg-zinc-100 p-3 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          +{anomalies.length - maxDisplay} more anomalies...
        </div>
      )}
    </div>
  );
}
