'use client';

import { create } from 'zustand';
import {
  AnomalyDetectionState,
  AnomalyEvent,
  AnomalyDetectionConfig,
  SensorBaseline,
  MLModelState,
  AnomalySeverity,
  AnomalyType,
  AnomalyPattern,
} from '../types/anomaly.types';
import { v4 as uuidv4 } from 'uuid';

// Default configuration
const DEFAULT_CONFIG: AnomalyDetectionConfig = {
  confidenceThreshold: 0.7,
  severityThreshold: AnomalySeverity.MEDIUM,
  slidingWindowSize: 5000,
  updateInterval: 1000,
  algorithms: {
    isolation_forest: true,
    local_outlier_factor: true,
    statistical: true,
    ml_model: false,
  },
  anomalyThresholds: {
    [AnomalyType.UNEXPECTED_ACCELERATION]: {
      threshold: 0.7,
      windowSize: 2000,
      enableAlert: true,
    },
    [AnomalyType.UNEXPECTED_DECELERATION]: {
      threshold: 0.7,
      windowSize: 2000,
      enableAlert: true,
    },
    [AnomalyType.UNUSUAL_ROTATION]: {
      threshold: 0.75,
      windowSize: 3000,
      enableAlert: true,
    },
    [AnomalyType.EXCESSIVE_VIBRATION]: {
      threshold: 0.8,
      windowSize: 1000,
      enableAlert: true,
    },
    [AnomalyType.SUDDEN_MOVEMENT]: {
      threshold: 0.8,
      windowSize: 2000,
      enableAlert: true,
    },
    [AnomalyType.CPU_SPIKE]: {
      threshold: 0.7,
      windowSize: 5000,
      enableAlert: true,
    },
    [AnomalyType.MEMORY_LEAK]: {
      threshold: 0.75,
      windowSize: 10000,
      enableAlert: true,
    },
    [AnomalyType.TEMPERATURE_SPIKE]: {
      threshold: 0.7,
      windowSize: 5000,
      enableAlert: true,
    },
    [AnomalyType.THERMAL_THROTTLING]: {
      threshold: 0.8,
      windowSize: 5000,
      enableAlert: true,
    },
    [AnomalyType.PATTERN_DEVIATION]: {
      threshold: 0.65,
      windowSize: 5000,
      enableAlert: true,
    },
    [AnomalyType.PERIODIC_ANOMALY]: {
      threshold: 0.7,
      windowSize: 10000,
      enableAlert: false,
    },
    [AnomalyType.DRIFT_DETECTED]: {
      threshold: 0.65,
      windowSize: 15000,
      enableAlert: true,
    },
  },
};

// Default ML model state
const DEFAULT_ML_MODEL_STATE: MLModelState = {
  isReady: false,
  isTraining: false,
  version: '0.1.0',
  lastTrained: 0,
  samplesUsed: 0,
};

export const useAnomalyStore = create<AnomalyDetectionState>((set, get) => ({
  // Initial state
  currentAnomalies: [],
  recentAnomalies: [],
  anomalyCount: 0,
  anomalyRate: 0,
  detectedPatterns: new Map(),
  baselines: new Map(),
  mlModel: DEFAULT_ML_MODEL_STATE,
  config: DEFAULT_CONFIG,
  isDetecting: false,
  isUpdatingBaseline: false,
  lastDetectionTime: 0,

  // Add a new anomaly
  addAnomaly: (anomaly: AnomalyEvent) =>
    set((state) => {
      // Keep only anomalies from last hour (3600000 ms)
      const oneHourAgo = Date.now() - 3600000;
      const filteredRecent = state.recentAnomalies.filter(
        (a) => a.timestamp > oneHourAgo
      );

      // Update patterns
      const patterns = new Map(state.detectedPatterns);
      const existing = patterns.get(anomaly.type);
      
      if (existing) {
        existing.occurrences++;
        existing.lastSeen = anomaly.timestamp;
        existing.averageSeverity = anomaly.severity;
      } else {
        patterns.set(anomaly.type, {
          id: uuidv4(),
          type: anomaly.type,
          features: [],
          mean: [],
          std: [],
          frequency: 1,
          averageSeverity: anomaly.severity,
          occurrences: 1,
          firstSeen: anomaly.timestamp,
          lastSeen: anomaly.timestamp,
        });
      }

      // Calculate anomaly rate (per hour)
      const anomaliesInHour = filteredRecent.length + 1;
      const anomalyRate = (anomaliesInHour / 60) * 60; // per hour

      return {
        currentAnomalies: [anomaly, ...state.currentAnomalies].slice(0, 50),
        recentAnomalies: [anomaly, ...filteredRecent].slice(0, 100),
        anomalyCount: state.anomalyCount + 1,
        anomalyRate,
        detectedPatterns: patterns,
        lastDetectionTime: anomaly.timestamp,
      };
    }),

  // Acknowledge an anomaly
  acknowledgeAnomaly: (id: string, notes?: string) =>
    set((state) => {
      const updatedCurrent = state.currentAnomalies.map((a) =>
        a.id === id ? { ...a, acknowledged: true, acknowledgedAt: Date.now(), notes } : a
      );
      const updatedRecent = state.recentAnomalies.map((a) =>
        a.id === id ? { ...a, acknowledged: true, acknowledgedAt: Date.now(), notes } : a
      );

      return {
        currentAnomalies: updatedCurrent,
        recentAnomalies: updatedRecent,
      };
    }),

  // Clear all anomalies
  clearAnomalies: () =>
    set({
      currentAnomalies: [],
      recentAnomalies: [],
      anomalyCount: 0,
      detectedPatterns: new Map(),
    }),

  // Update configuration
  setConfig: (config: Partial<AnomalyDetectionConfig>) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  // Update baseline
  updateBaseline: (baseline: SensorBaseline) =>
    set((state) => {
      const baselines = new Map(state.baselines);
      baselines.set(`${baseline.sensorType}`, baseline);
      return { baselines };
    }),

  // Update ML model state
  setMLModelState: (modelState: Partial<MLModelState>) =>
    set((state) => ({
      mlModel: { ...state.mlModel, ...modelState },
    })),

  // Train ML model
  trainMLModel: async () => {
    const state = get();
    
    set((state) => ({
      mlModel: {
        ...state.mlModel,
        isTraining: true,
        trainingProgress: 0,
      },
    }));

    try {
      // Simulate training process
      for (let i = 0; i < 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        set((state) => ({
          mlModel: { ...state.mlModel, trainingProgress: i },
        }));
      }

      set((state) => ({
        mlModel: {
          ...state.mlModel,
          isTraining: false,
          isReady: true,
          trainingProgress: 100,
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.91,
          f1Score: 0.90,
          lastTrained: Date.now(),
          samplesUsed: 5000,
          version: '0.2.0',
        },
      }));
    } catch (error) {
      set((state) => ({
        mlModel: {
          ...state.mlModel,
          isTraining: false,
          trainingError: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  },

  // Reset patterns
  resetPatterns: () =>
    set({
      detectedPatterns: new Map(),
      anomalyCount: 0,
      anomalyRate: 0,
    }),
}));
