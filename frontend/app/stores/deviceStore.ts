'use client';

import { create } from 'zustand';
import { Device, DeviceSession } from '../types';

interface DeviceState {
  // Device data
  currentDevice: Device | null;
  deviceId: string | null;

  // Session data
  currentSession: DeviceSession | null;

  // Status
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  setDeviceId: (id: string) => void;
  setCurrentDevice: (device: Device | null) => void;
  setCurrentSession: (session: DeviceSession | null) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;

  // Derived
  getDeviceInfo: () => Device | null;
  getConnectionStatus: () => 'connected' | 'connecting' | 'disconnected';
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  // Initial state
  currentDevice: null,
  deviceId: null,
  currentSession: null,
  isConnecting: false,
  isConnected: false,
  error: null,

  // Actions
  setDeviceId: (id: string) => set({ deviceId: id }),

  setCurrentDevice: (device: Device | null) => set({ currentDevice: device }),

  setCurrentSession: (session: DeviceSession | null) =>
    set({ currentSession: session }),

  setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setError: (error: string | null) => set({ error }),

  // Derived
  getDeviceInfo: () => get().currentDevice,

  getConnectionStatus: () => {
    const { isConnected, isConnecting } = get();
    if (isConnected) return 'connected';
    if (isConnecting) return 'connecting';
    return 'disconnected';
  },
}));
