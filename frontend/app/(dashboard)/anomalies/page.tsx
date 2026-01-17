'use client';

import { useState, useEffect } from 'react';
import { useAnomalyStore } from '@/app/stores/anomalyStore';
import { useAnomalyDetection } from '@/app/hooks/useAnomalyDetection';
import { AnomalyList } from '@/app/components/anomalies/AnomalyList';
import { AnomalyStats } from '@/app/components/anomalies/AnomalyStats';
import { AnomalyConfig } from '@/app/components/anomalies/AnomalyConfig';
import { AnomalySeverity } from '@/app/types/anomaly.types';

export default function AnomaliesPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'statistics' | 'config'>('current');

  // Anomaly detection hook
  useAnomalyDetection();

  // Store actions and data
  const currentAnomalies = useAnomalyStore((state) => state.currentAnomalies);
  const recentAnomalies = useAnomalyStore((state) => state.recentAnomalies);
  const anomalyCount = useAnomalyStore((state) => state.anomalyCount);
  const anomalyRate = useAnomalyStore((state) => state.anomalyRate);
  const config = useAnomalyStore((state) => state.config);
  const acknowledgeAnomaly = useAnomalyStore((state) => state.acknowledgeAnomaly);
  const setConfig = useAnomalyStore((state) => state.setConfig);
  const mlModel = useAnomalyStore((state) => state.mlModel);
  const trainMLModel = useAnomalyStore((state) => state.trainMLModel);

  // Calculate severity breakdown
  const bySeverity = {
    [AnomalySeverity.LOW]: recentAnomalies.filter(
      (a) => a.severity === AnomalySeverity.LOW
    ).length,
    [AnomalySeverity.MEDIUM]: recentAnomalies.filter(
      (a) => a.severity === AnomalySeverity.MEDIUM
    ).length,
    [AnomalySeverity.HIGH]: recentAnomalies.filter(
      (a) => a.severity === AnomalySeverity.HIGH
    ).length,
    [AnomalySeverity.CRITICAL]: recentAnomalies.filter(
      (a) => a.severity === AnomalySeverity.CRITICAL
    ).length,
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeAnomaly(id);
  };

  const handleRemove = (id: string) => {
    // In a real app, this would delete the anomaly
    // For now, we'll just acknowledge it
    handleAcknowledge(id);
  };

  const handleConfigChange = (newConfig: {
    confidenceThreshold: number;
    severityThreshold: AnomalySeverity;
  }) => {
    setConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 p-6 dark:from-cyan-950/20 dark:to-blue-950/20">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          🤖 AI Anomaly Detection
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Real-time anomaly detection using advanced ML algorithms
        </p>
      </div>

      {/* ML Model Status */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              ML Model Status
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {mlModel.isReady
                ? `✓ Ready (v${mlModel.version}, ${mlModel.accuracy ? (mlModel.accuracy * 100).toFixed(1) : 'N/A'}% accuracy)`
                : 'Not trained yet'}
            </p>
            {mlModel.isTraining && (
              <div className="mt-2 w-full max-w-xs">
                <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${mlModel.trainingProgress || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => trainMLModel()}
            disabled={mlModel.isTraining}
            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 disabled:opacity-50 dark:bg-cyan-700 dark:hover:bg-cyan-600 transition-colors"
          >
            {mlModel.isTraining ? 'Training...' : 'Train Model'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {['current', 'statistics', 'config'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            {tab === 'current' && `Current Anomalies (${currentAnomalies.length})`}
            {tab === 'statistics' && 'Statistics'}
            {tab === 'config' && 'Configuration'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'current' && (
          <div className="space-y-4">
            {currentAnomalies.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-12 text-center dark:border-green-800 dark:bg-green-950/20">
                <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                  ✓ No Current Anomalies
                </p>
                <p className="mt-2 text-green-600 dark:text-green-400">
                  All systems are operating normally
                </p>
              </div>
            ) : (
              <AnomalyList
                anomalies={currentAnomalies}
                onAcknowledge={handleAcknowledge}
                onRemove={handleRemove}
              />
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <AnomalyStats
            totalAnomalies={anomalyCount}
            anomalyRate={anomalyRate}
            recentCount={recentAnomalies.length}
            bySeverity={bySeverity}
          />
        )}

        {activeTab === 'config' && (
          <AnomalyConfig
            confidenceThreshold={config.confidenceThreshold}
            severityThreshold={config.severityThreshold}
            onConfigChange={handleConfigChange}
          />
        )}
      </div>

      {/* Recent Activity */}
      {recentAnomalies.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">
            Recent Activity (Last Hour)
          </h3>
          <div className="space-y-2 text-sm">
            {recentAnomalies.slice(0, 10).map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <div className="flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {anomaly.type.replace(/_/g, ' ')}
                  </span>
                  <span className={`ml-2 text-xs ${
                    anomaly.severity === AnomalySeverity.CRITICAL
                      ? 'text-red-600'
                      : anomaly.severity === AnomalySeverity.HIGH
                        ? 'text-orange-600'
                        : anomaly.severity === AnomalySeverity.MEDIUM
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(anomaly.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
