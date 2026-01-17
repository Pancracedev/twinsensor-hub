/**
 * Performance Store
 * Zustand store for device performance metrics (Phase 2)
 */

import { create } from 'zustand';
import { PerformanceMetrics } from '../types';
import { SENSOR_CONFIG } from '../utils';

interface PerformanceState {
  // Current metrics
  latestMetrics: PerformanceMetrics | null;

  // Historical data
  metricsHistory: PerformanceMetrics[];

  // Aggregated values
  cpuAverage: number;
  memoryAverage: number;
  temperatureAverage: number;

  // Alerts
  activeAlerts: string[];

  // Actions
  setLatestMetrics: (metrics: PerformanceMetrics) => void;
  addMetrics: (metrics: PerformanceMetrics) => void;
  setMetricsHistory: (metrics: PerformanceMetrics[]) => void;

  clearMetricsData: () => void;

  // Derived state
  getCPUStatus: () => 'normal' | 'warning' | 'critical';
  getMemoryStatus: () => 'normal' | 'warning' | 'critical';
  getTemperatureStatus: () => 'normal' | 'warning' | 'critical';
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  // Initial state
  latestMetrics: null,
  metricsHistory: [],

  cpuAverage: 0,
  memoryAverage: 0,
  temperatureAverage: 0,

  activeAlerts: [],

  // Setters
  setLatestMetrics: (metrics) =>
    set((state) => {
      // Update averages
      const allMetrics = [...state.metricsHistory, metrics];
      const maxHistorySize = 300; // 5 minutes @ 1 reading/sec

      if (allMetrics.length > maxHistorySize) {
        allMetrics.shift();
      }

      const cpuAverage = allMetrics.reduce((sum, m) => sum + m.cpu, 0) / allMetrics.length;
      const memoryAverage = allMetrics.reduce((sum, m) => sum + m.memory, 0) / allMetrics.length;
      const temperatureAverage =
        allMetrics.reduce((sum, m) => sum + m.temperature, 0) / allMetrics.length;

      // Check for alerts
      const alerts: string[] = [];
      if (metrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_CRITICAL) {
        alerts.push('CPU_CRITICAL');
      } else if (metrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_WARNING) {
        alerts.push('CPU_WARNING');
      }

      if (metrics.memory >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL) {
        alerts.push('MEMORY_CRITICAL');
      } else if (metrics.memory >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
        alerts.push('MEMORY_WARNING');
      }

      if (
        metrics.temperature >=
        SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_CRITICAL
      ) {
        alerts.push('TEMPERATURE_CRITICAL');
      } else if (
        metrics.temperature >=
        SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_WARNING
      ) {
        alerts.push('TEMPERATURE_WARNING');
      }

      return {
        latestMetrics: metrics,
        metricsHistory: allMetrics,
        cpuAverage,
        memoryAverage,
        temperatureAverage,
        activeAlerts: alerts,
      };
    }),

  addMetrics: (metrics) =>
    set((state) => {
      const history = [...state.metricsHistory, metrics];
      const maxHistorySize = 300;

      if (history.length > maxHistorySize) {
        history.shift();
      }

      const cpuAverage = history.reduce((sum, m) => sum + m.cpu, 0) / history.length;
      const memoryAverage = history.reduce((sum, m) => sum + m.memory, 0) / history.length;
      const temperatureAverage =
        history.reduce((sum, m) => sum + m.temperature, 0) / history.length;

      // Check for alerts
      const alerts: string[] = [];
      if (metrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_CRITICAL) {
        alerts.push('CPU_CRITICAL');
      } else if (metrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_WARNING) {
        alerts.push('CPU_WARNING');
      }

      if (metrics.memory >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL) {
        alerts.push('MEMORY_CRITICAL');
      } else if (metrics.memory >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
        alerts.push('MEMORY_WARNING');
      }

      if (
        metrics.temperature >=
        SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_CRITICAL
      ) {
        alerts.push('TEMPERATURE_CRITICAL');
      } else if (
        metrics.temperature >=
        SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_WARNING
      ) {
        alerts.push('TEMPERATURE_WARNING');
      }

      return {
        latestMetrics: metrics,
        metricsHistory: history,
        cpuAverage,
        memoryAverage,
        temperatureAverage,
        activeAlerts: alerts,
      };
    }),

  setMetricsHistory: (metrics) =>
    set((state) => {
      if (metrics.length === 0) {
        return {
          metricsHistory: [],
          cpuAverage: 0,
          memoryAverage: 0,
          temperatureAverage: 0,
        };
      }

      const cpuAverage = metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length;
      const memoryAverage = metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length;
      const temperatureAverage =
        metrics.reduce((sum, m) => sum + m.temperature, 0) / metrics.length;

      return {
        metricsHistory: metrics,
        cpuAverage,
        memoryAverage,
        temperatureAverage,
        latestMetrics: metrics[metrics.length - 1],
      };
    }),

  clearMetricsData: () =>
    set({
      latestMetrics: null,
      metricsHistory: [],
      cpuAverage: 0,
      memoryAverage: 0,
      temperatureAverage: 0,
      activeAlerts: [],
    }),

  // Derived state
  getCPUStatus: () => {
    const state = get();
    if (!state.latestMetrics) return 'normal';

    if (state.latestMetrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_CRITICAL) {
      return 'critical';
    }
    if (state.latestMetrics.cpu >= SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.CPU_WARNING) {
      return 'warning';
    }
    return 'normal';
  },

  getMemoryStatus: () => {
    const state = get();
    if (!state.latestMetrics) return 'normal';

    if (
      state.latestMetrics.memory >=
      SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL
    ) {
      return 'critical';
    }
    if (
      state.latestMetrics.memory >=
      SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.MEMORY_WARNING
    ) {
      return 'warning';
    }
    return 'normal';
  },

  getTemperatureStatus: () => {
    const state = get();
    if (!state.latestMetrics) return 'normal';

    if (
      state.latestMetrics.temperature >=
      SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_CRITICAL
    ) {
      return 'critical';
    }
    if (
      state.latestMetrics.temperature >=
      SENSOR_CONFIG.PERFORMANCE_THRESHOLDS.TEMPERATURE_WARNING
    ) {
      return 'warning';
    }
    return 'normal';
  },
}));
