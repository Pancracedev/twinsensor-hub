/**
 * useSensorData Hook
 * Custom hook for real-time sensor data streaming (Phase 2)
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSensorStore } from '../stores';
import { useSocket } from './useSocket';
import { sensorService, dataBufferService } from '../services';
import { SOCKET_EVENTS, SENSOR_CONFIG } from '../utils';
import { SensorReading } from '../types';

export const useSensorData = () => {
  const {
    setAccelerometerReading,
    setGyroscopeReading,
    setMagnetometerReading,
    setOrientation,
    addAccelerometerReading,
    addGyroscopeReading,
    addMagnetometerReading,
    setStreamState,
    streamState,
  } = useSensorStore();

  const { emit: emitSocket } = useSocket(
    SOCKET_EVENTS.CLIENT_SENSOR_DATA,
    () => {},
    false
  );

  const latencyRef = useRef<number>(0);
  const lastPacketTimeRef = useRef<number>(Date.now());
  const packetsRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(Date.now());

  /**
   * Handle incoming accelerometer data
   */
  const handleAccelerometerData = useCallback(
    (data: any) => {
      try {
        const reading = sensorService.parseAccelerometerData(data);

        if (!sensorService.isValidReading(reading)) {
          console.warn('Invalid accelerometer reading:', reading);
          return;
        }

        // Detect packet loss
        const hasPacketLoss = sensorService.detectPacketLoss(
          reading.timestamp,
          streamState.sampleRate
        );

        // Add to store and buffer
        setAccelerometerReading(reading);
        addAccelerometerReading(reading);
        dataBufferService.addDataPoint({
          timestamp: reading.timestamp,
          accelerometer: reading,
          gyroscope: useSensorStore.getState().latestGyroscopeReading || reading,
        });

        // Update latency
        latencyRef.current = Date.now() - reading.timestamp;

        // Update metrics
        packetsRef.current++;
        const now = Date.now();
        const timeDelta = now - lastPacketTimeRef.current;

        if (timeDelta >= 1000) {
          const readingsPerSecond = packetsRef.current;
          const dataLoss = sensorService.getDataLossPercentage();

          setStreamState({
            readingsPerSecond,
            dataLoss,
            latency: latencyRef.current,
          });

          packetsRef.current = 0;
          lastPacketTimeRef.current = now;
        }
      } catch (error) {
        console.error('Error handling accelerometer data:', error);
      }
    },
    [streamState.sampleRate, setAccelerometerReading, addAccelerometerReading, setStreamState]
  );

  /**
   * Handle incoming gyroscope data
   */
  const handleGyroscopeData = useCallback(
    (data: any) => {
      try {
        const reading = sensorService.parseGyroscopeData(data);

        if (!sensorService.isValidReading(reading)) {
          return;
        }

        setGyroscopeReading(reading);
        addGyroscopeReading(reading);
      } catch (error) {
        console.error('Error handling gyroscope data:', error);
      }
    },
    [setGyroscopeReading, addGyroscopeReading]
  );

  /**
   * Handle incoming magnetometer data
   */
  const handleMagnetometerData = useCallback(
    (data: any) => {
      try {
        const reading = sensorService.parseMagnetometerData(data);

        if (!sensorService.isValidReading(reading)) {
          return;
        }

        setMagnetometerReading(reading);
        addMagnetometerReading(reading);

        // Update orientation with new magnetometer data
        const accelReading = useSensorStore.getState().latestAccelerometerReading;
        if (accelReading) {
          const orientation = sensorService.aggregateReadings(
            accelReading,
            useSensorStore.getState().latestGyroscopeReading || accelReading,
            reading
          );
          if (orientation.orientation) {
            setOrientation(orientation.orientation);
          }
        }
      } catch (error) {
        console.error('Error handling magnetometer data:', error);
      }
    },
    [setMagnetometerReading, addMagnetometerReading, setOrientation]
  );

  /**
   * Request sensor stream from device
   */
  const startSensorStream = useCallback(
    (sampleRate: number = SENSOR_CONFIG.DEFAULT_SAMPLE_RATE) => {
      setStreamState({
        isStreaming: true,
        sampleRate,
      });

      emitSocket({
        sampleRate,
        duration: 0, // 0 = continuous
      });

      sensorService.resetPacketTracking();
    },
    [emitSocket, setStreamState]
  );

  /**
   * Stop sensor stream
   */
  const stopSensorStream = useCallback(() => {
    setStreamState({
      isStreaming: false,
    });

    emitSocket({});
  }, [emitSocket, setStreamState]);

  /**
   * Get buffer data for display
   */
  const getBufferData = useCallback(() => {
    return dataBufferService.getAllData();
  }, []);

  /**
   * Get latest orientation
   */
  const getLatestOrientation = useCallback(() => {
    return useSensorStore.getState().latestOrientation;
  }, []);

  /**
   * Clear all sensor data
   */
  const clearSensorData = useCallback(() => {
    dataBufferService.clear();
    sensorService.resetPacketTracking();
  }, []);

  // Setup Socket.io listeners
  useEffect(() => {
    const { emit: emitAccel } = useSocket(
      SOCKET_EVENTS.SERVER_SENSOR_RECEIVED,
      handleAccelerometerData,
      streamState.isStreaming
    );

    const { emit: emitGyro } = useSocket(
      SOCKET_EVENTS.SERVER_SENSOR_RECEIVED,
      handleGyroscopeData,
      streamState.isStreaming
    );

    const { emit: emitMag } = useSocket(
      SOCKET_EVENTS.SERVER_SENSOR_RECEIVED,
      handleMagnetometerData,
      streamState.isStreaming
    );

    return () => {
      // Cleanup on unmount
    };
  }, [streamState.isStreaming, handleAccelerometerData, handleGyroscopeData, handleMagnetometerData]);

  return {
    // State
    streamState,
    latestAccelerometerReading: useSensorStore(
      (state) => state.latestAccelerometerReading
    ),
    latestGyroscopeReading: useSensorStore(
      (state) => state.latestGyroscopeReading
    ),
    latestMagnetometerReading: useSensorStore(
      (state) => state.latestMagnetometerReading
    ),
    latestOrientation: useSensorStore(
      (state) => state.latestOrientation
    ),

    // Methods
    startSensorStream,
    stopSensorStream,
    getBufferData,
    getLatestOrientation,
    clearSensorData,
  };
};
