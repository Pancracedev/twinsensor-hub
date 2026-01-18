/**
 * usePerformanceMetrics Hook
 * Custom hook for monitoring device performance (Phase 2)
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePerformanceStore } from '../stores';
import { useSocket } from './useSocket';
import { sensorService } from '../services';
import { SOCKET_EVENTS } from '../utils';
import { PerformanceMetrics } from '../types';

export const usePerformanceMetrics = () => {
  const {
    latestMetrics,
    metricsHistory,
    cpuAverage,
    memoryAverage,
    temperatureAverage,
    activeAlerts,
    addMetrics,
    getCPUStatus,
    getMemoryStatus,
    getTemperatureStatus,
    clearMetricsData,
  } = usePerformanceStore();

  /**
   * Handle incoming performance metrics
   */
  const handlePerformanceData = useCallback(
    (data: any) => {
      try {
        const metrics = sensorService.parsePerformanceMetrics(data);
        addMetrics(metrics);
      } catch (error) {
        console.error('Error handling performance metrics:', error);
      }
    },
    [addMetrics]
  );

  /**
   * Get formatted metrics for display
   */
  const getFormattedMetrics = useCallback(() => {
    if (!latestMetrics) return null;

    return {
      cpu: `${Math.round(latestMetrics.cpu)}%`,
      memory: `${Math.round(latestMetrics.memory)}%`,
      temperature: `${Math.round(latestMetrics.temperature)}°C`,
      battery: `${Math.round(latestMetrics.battery)}%`,
      charging: latestMetrics.charging,
    };
  }, [latestMetrics]);

  /**
   * Get status indicators
   */
  const getStatusIndicators = useCallback(
    () => ({
      cpu: getCPUStatus(),
      memory: getMemoryStatus(),
      temperature: getTemperatureStatus(),
    }),
    [getCPUStatus, getMemoryStatus, getTemperatureStatus]
  );

  /**
   * Check if any critical alerts are active
   */
  const hasCriticalAlerts = useCallback(
    () =>
      activeAlerts.some((alert) =>
        ['CPU_CRITICAL', 'MEMORY_CRITICAL', 'TEMPERATURE_CRITICAL'].includes(alert)
      ),
    [activeAlerts]
  );

  /**
   * Get alert messages
   */
  const getAlertMessages = useCallback((): string[] => {
    const messages: string[] = [];

    activeAlerts.forEach((alert) => {
      switch (alert) {
        case 'CPU_CRITICAL':
          messages.push('⚠️ CPU usage is critical');
          break;
        case 'CPU_WARNING':
          messages.push('⚠️ CPU usage is high');
          break;
        case 'MEMORY_CRITICAL':
          messages.push('⚠️ Memory usage is critical');
          break;
        case 'MEMORY_WARNING':
          messages.push('⚠️ Memory usage is high');
          break;
        case 'TEMPERATURE_CRITICAL':
          messages.push('⚠️ Device temperature is critical');
          break;
        case 'TEMPERATURE_WARNING':
          messages.push('⚠️ Device temperature is high');
          break;
      }
    });

    return messages;
  }, [activeAlerts]);

  /**
   * Get trend indicator (up, down, stable)
   */
  const getTrend = useCallback(
    (metric: 'cpu' | 'memory' | 'temperature'): 'up' | 'down' | 'stable' => {
      if (metricsHistory.length < 2) return 'stable';

      const recent = metricsHistory.slice(-10);
      const first = recent[0];
      const last = recent[recent.length - 1];

      const currentValue = last[metric];
      const previousValue = first[metric];

      const change = ((currentValue - previousValue) / previousValue) * 100;

      if (change > 5) return 'up';
      if (change < -5) return 'down';
      return 'stable';
    },
    [metricsHistory]
  );

  // Setup Socket.io listener for performance data
  useEffect(() => {
    useSocket(
      SOCKET_EVENTS.SERVER_PERFORMANCE_RECEIVED,
      handlePerformanceData,
      true
    );

    return () => {
      // Cleanup on unmount
    };
  }, [handlePerformanceData]);

  return {
    // State
    latestMetrics,
    metricsHistory,
    cpuAverage,
    memoryAverage,
    temperatureAverage,
    activeAlerts,

    // Methods
    getFormattedMetrics,
    getStatusIndicators,
    hasCriticalAlerts,
    getAlertMessages,
    getTrend,
    clearMetricsData,
  };
};
