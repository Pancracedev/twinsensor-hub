/**
 * useMobileSensors Hook
 * Custom hook for accessing mobile device sensors
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  mobileSensorService,
  type DeviceOrientation,
  type DeviceMotion,
  type DeviceAcceleration,
} from '../services';

export interface UseMobileSensorsResult {
  // Sensor data
  orientation: DeviceOrientation | null;
  motion: DeviceMotion | null;
  acceleration: DeviceAcceleration | null;

  // Status
  isSupported: boolean;
  hasPermission: boolean;
  isListening: boolean;

  // Controls
  requestPermission: () => Promise<boolean>;
  startListening: () => void;
  stopListening: () => void;
}

export const useMobileSensors = (): UseMobileSensorsResult => {
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);
  const [motion, setMotion] = useState<DeviceMotion | null>(null);
  const [acceleration, setAcceleration] = useState<DeviceAcceleration | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Initialize service on mount
  useEffect(() => {
    mobileSensorService.initialize();
  }, []);

  // Request permission for sensors
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await mobileSensorService.requestPermission();
    return granted;
  }, []);

  // Start listening to sensors
  const startListening = useCallback((): void => {
    mobileSensorService.startListening();
    setIsListening(true);
  }, []);

  // Stop listening to sensors
  const stopListening = useCallback((): void => {
    mobileSensorService.stopListening();
    setIsListening(false);
  }, []);

  // Subscribe to sensor updates
  useEffect(() => {
    // Subscribe to orientation
    const unsubscribeOrientation = mobileSensorService.subscribeToOrientation((data) => {
      setOrientation(data);
    });

    // Subscribe to motion
    const unsubscribeMotion = mobileSensorService.subscribeToMotion((data) => {
      setMotion(data);
    });

    // Subscribe to acceleration
    const unsubscribeAcceleration = mobileSensorService.subscribeToAcceleration((data) => {
      setAcceleration(data);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeOrientation();
      unsubscribeMotion();
      unsubscribeAcceleration();
    };
  }, []);

  return {
    // Data
    orientation,
    motion,
    acceleration,

    // Status
    isSupported: mobileSensorService.isSensorSupported(),
    hasPermission: mobileSensorService.hasPermission(),
    isListening,

    // Controls
    requestPermission,
    startListening,
    stopListening,
  };
};
