'use client';

import { useEffect, useRef } from 'react';
import { useAnomalyStore } from '@/app/stores/anomalyStore';
import { useSensorStore } from '@/app/stores/sensorStore';
import { usePerformanceStore } from '@/app/stores/performanceStore';
import { anomalyDetectionService } from '@/app/services/anomaly.service';
import { AnomalyEvent, AnomalySeverity } from '@/app/types/anomaly.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook for anomaly detection
 * Monitors sensor data for anomalies and generates alerts
 */
export function useAnomalyDetection() {
  const addAnomaly = useAnomalyStore((state) => state.addAnomaly);
  const config = useAnomalyStore((state) => state.config);
  const baselines = useAnomalyStore((state) => state.baselines);
  const updateBaseline = useAnomalyStore((state) => state.updateBaseline);

  // Sensor data
  const currentAccelerometer = useSensorStore((state) => state.latestAccelerometerReading);
  const currentGyroscope = useSensorStore((state) => state.latestGyroscopeReading);
  const currentMagnetometer = useSensorStore((state) => state.latestMagnetometerReading);
  const accelerometerHistory = useSensorStore((state) => state.accelerometerHistory);
  const gyroscopeHistory = useSensorStore((state) => state.gyroscopeHistory);

  // Performance data
  const latestMetrics = usePerformanceStore((state) => state.latestMetrics);

  const detectionRef = useRef<NodeJS.Timeout | null>(null);
  const recentSensorValuesRef = useRef<number[][]>([]);

  useEffect(() => {
    // Build baseline if needed
    if (baselines.size === 0 && accelerometerHistory.length > 100) {
      const accelValues = accelerometerHistory.slice(-300).map((reading: any) => [
        reading.x,
        reading.y,
        reading.z,
      ]);
      
      if (accelValues.length > 0) {
        const baseline = anomalyDetectionService.calculateBaseline(
          'accelerometer',
          accelValues
        );
        updateBaseline(baseline);
      }
    }

    // Update sensor history
    if (currentAccelerometer) {
      recentSensorValuesRef.current.push([
        currentAccelerometer.x,
        currentAccelerometer.y,
        currentAccelerometer.z,
      ]);
      if (recentSensorValuesRef.current.length > 50) {
        recentSensorValuesRef.current.shift();
      }
    }
  }, [accelerometerHistory, currentAccelerometer, baselines, updateBaseline]);

  // Main anomaly detection loop
  useEffect(() => {
    const detectAnomalies = () => {
      const detections: Array<{
        anomaly: AnomalyEvent;
        type: string;
      }> = [];

      // Detect motion anomalies
      if (currentAccelerometer && currentGyroscope) {
        const motionAnomalies = anomalyDetectionService.detectMotionAnomalies(
          [currentAccelerometer.x, currentAccelerometer.y, currentAccelerometer.z],
          [currentGyroscope.x, currentGyroscope.y, currentGyroscope.z]
        );

        for (const motionAnomaly of motionAnomalies) {
          const threshold = config.anomalyThresholds[motionAnomaly.type];
          
          if (
            threshold &&
            motionAnomaly.score >= threshold.threshold &&
            threshold.enableAlert
          ) {
            const severity = anomalyDetectionService.determineSeverity(
              motionAnomaly.score
            );

            const severityOrder: Record<AnomalySeverity, number> = {
              [AnomalySeverity.LOW]: 0,
              [AnomalySeverity.MEDIUM]: 1,
              [AnomalySeverity.HIGH]: 2,
              [AnomalySeverity.CRITICAL]: 3,
            };

            if (severityOrder[severity] >= severityOrder[config.severityThreshold as AnomalySeverity]) {
              detections.push({
                anomaly: {
                  id: uuidv4(),
                  timestamp: Date.now(),
                  type: motionAnomaly.type,
                  severity,
                  confidence: motionAnomaly.score,
                  description: `${motionAnomaly.type.replace(/_/g, ' ')}: Accel X=${currentAccelerometer.x.toFixed(2)} Y=${currentAccelerometer.y.toFixed(2)} Z=${currentAccelerometer.z.toFixed(2)}`,
                  sensorValues: {
                    accelX: currentAccelerometer.x,
                    accelY: currentAccelerometer.y,
                    accelZ: currentAccelerometer.z,
                    gyroX: currentGyroscope.x,
                    gyroY: currentGyroscope.y,
                    gyroZ: currentGyroscope.z,
                  },
                  windowSize: config.slidingWindowSize,
                  baselineDeviation: (motionAnomaly.score * 100),
                  acknowledged: false,
                },
                type: 'motion',
              });
            }
          }
        }
      }

      // Detect performance anomalies
      if (latestMetrics) {
        const perfAnomalies = anomalyDetectionService.detectPerformanceAnomalies(
          latestMetrics.cpu,
          latestMetrics.memory,
          latestMetrics.temperature
        );

        for (const perfAnomaly of perfAnomalies) {
          const threshold = config.anomalyThresholds[perfAnomaly.type];
          
          if (
            threshold &&
            perfAnomaly.score >= threshold.threshold &&
            threshold.enableAlert
          ) {
            const severity = anomalyDetectionService.determineSeverity(
              perfAnomaly.score
            );

            const severityOrder: Record<AnomalySeverity, number> = {
              [AnomalySeverity.LOW]: 0,
              [AnomalySeverity.MEDIUM]: 1,
              [AnomalySeverity.HIGH]: 2,
              [AnomalySeverity.CRITICAL]: 3,
            };

            if (severityOrder[severity] >= severityOrder[config.severityThreshold as AnomalySeverity]) {
              detections.push({
                anomaly: {
                  id: uuidv4(),
                  timestamp: Date.now(),
                  type: perfAnomaly.type,
                  severity,
                  confidence: perfAnomaly.score,
                  description: `${perfAnomaly.type.replace(/_/g, ' ')}: CPU=${latestMetrics.cpu.toFixed(1)}% Memory=${latestMetrics.memory.toFixed(1)}% Temp=${latestMetrics.temperature.toFixed(1)}°C`,
                  sensorValues: {
                    cpu: latestMetrics.cpu,
                    memory: latestMetrics.memory,
                    temperature: latestMetrics.temperature,
                  },
                  windowSize: config.slidingWindowSize,
                  baselineDeviation: (perfAnomaly.score * 100),
                  acknowledged: false,
                },
                type: 'performance',
              });
            }
          }
        }
      }

      // Detect statistical anomalies
      if (currentAccelerometer && baselines.has('accelerometer')) {
        const accelBaseline = baselines.get('accelerometer')!;
        const accelValues = [
          currentAccelerometer.x,
          currentAccelerometer.y,
          currentAccelerometer.z,
        ];

        const statAnomalies = anomalyDetectionService.detectAnomalies(
          accelValues,
          accelBaseline,
          recentSensorValuesRef.current,
          config
        );

        for (const statAnomaly of statAnomalies) {
          const threshold = config.anomalyThresholds[statAnomaly.type];
          
          if (
            threshold &&
            statAnomaly.confidence >= threshold.threshold &&
            threshold.enableAlert
          ) {
            const severity = anomalyDetectionService.determineSeverity(statAnomaly.score);
            const severityOrder: Record<AnomalySeverity, number> = {
              [AnomalySeverity.LOW]: 0,
              [AnomalySeverity.MEDIUM]: 1,
              [AnomalySeverity.HIGH]: 2,
              [AnomalySeverity.CRITICAL]: 3,
            };

            if (severityOrder[severity] >= severityOrder[config.severityThreshold as AnomalySeverity]) {
              detections.push({
                anomaly: {
                  id: uuidv4(),
                  timestamp: Date.now(),
                  type: statAnomaly.type,
                  severity,
                  confidence: statAnomaly.confidence,
                  description: `${statAnomaly.type.replace(/_/g, ' ')}: Statistical deviation detected`,
                  sensorValues: { x: accelValues[0], y: accelValues[1], z: accelValues[2] },
                  windowSize: threshold.windowSize,
                  baselineDeviation: (statAnomaly.score * 100),
                  acknowledged: false,
                },
                type: 'statistical',
              });
            }
          }
        }
      }

      // Add all detections to store
      for (const detection of detections) {
        addAnomaly(detection.anomaly);

        // Log for debugging
        console.debug(
          `[Anomaly] ${detection.anomaly.type}: ${detection.anomaly.severity} (confidence: ${detection.anomaly.confidence.toFixed(2)})`
        );
      }
    };

    // Set up detection interval
    detectionRef.current = setInterval(
      detectAnomalies,
      config.updateInterval
    );

    return () => {
      if (detectionRef.current) {
        clearInterval(detectionRef.current);
      }
    };
  }, [
    config,
    baselines,
    currentAccelerometer,
    currentGyroscope,
    latestMetrics,
    addAnomaly,
  ]);

  return {
    isDetecting: true,
  };
}
