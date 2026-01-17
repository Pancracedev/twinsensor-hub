'use client';

import { useEffect, useState } from 'react';
import { useDeviceStore, useUIStore } from '../stores';
import { socketService, deviceService } from '../services';
import { getOrCreateDeviceId } from '../utils';

export const useDevice = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    deviceId,
    currentDevice,
    isConnected,
    isConnecting,
    error,
    setDeviceId,
    setCurrentDevice,
    setConnected,
    setConnecting,
    setError,
  } = useDeviceStore();

  const { addNotification } = useUIStore();

  /**
   * Initialize device on mount
   */
  useEffect(() => {
    const initDevice = async () => {
      try {
        // Generate device ID if not exists
        const newDeviceId = getOrCreateDeviceId();
        setDeviceId(newDeviceId);

        // Create device object
        const device = deviceService.createDevice();
        setCurrentDevice(device);

        // Request notification permission
        await deviceService.requestNotificationPermission();

        setIsInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize device';
        setError(message);
        console.error('[useDevice] Initialization error:', err);
      }
    };

    initDevice();
  }, [setDeviceId, setCurrentDevice, setError]);

  /**
   * Connect to server
   */
  const connect = async () => {
    if (!deviceId) {
      setError('Device ID not initialized');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      await socketService.connect(deviceId);
      addNotification({
        type: 'success',
        message: 'Connected to server',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
      console.error('[useDevice] Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect from server
   */
  const disconnect = () => {
    socketService.disconnect();
    setConnected(false);
    addNotification({
      type: 'info',
      message: 'Disconnected from server',
    });
  };

  return {
    // State
    deviceId,
    currentDevice,
    isConnected,
    isConnecting,
    error,
    isInitialized,

    // Actions
    connect,
    disconnect,
  };
};
