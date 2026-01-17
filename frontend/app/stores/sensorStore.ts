/**
 * Sensor Store
 * Zustand store for real-time sensor data state management (Phase 2)
 */

import { create } from 'zustand';
import {
  SensorReading,
  SensorDataPoint,
  SensorStreamState,
  DeviceOrientation,
} from '../types';

interface SensorState {
  // Current readings
  latestAccelerometerReading: SensorReading | null;
  latestGyroscopeReading: SensorReading | null;
  latestMagnetometerReading: SensorReading | null;
  latestOrientation: DeviceOrientation | null;

  // Historical data
  accelerometerHistory: SensorReading[];
  gyroscopeHistory: SensorReading[];
  magnetometerHistory: SensorReading[];

  // Stream state
  streamState: SensorStreamState;

  // Statistics
  selectedTimeWindow: number; // ms (30000, 60000, etc.)

  // Actions
  setAccelerometerReading: (reading: SensorReading) => void;
  setGyroscopeReading: (reading: SensorReading) => void;
  setMagnetometerReading: (reading: SensorReading) => void;
  setOrientation: (orientation: DeviceOrientation) => void;

  setAccelerometerHistory: (readings: SensorReading[]) => void;
  setGyroscopeHistory: (readings: SensorReading[]) => void;
  setMagnetometerHistory: (readings: SensorReading[]) => void;

  addAccelerometerReading: (reading: SensorReading) => void;
  addGyroscopeReading: (reading: SensorReading) => void;
  addMagnetometerReading: (reading: SensorReading) => void;

  setStreamState: (state: Partial<SensorStreamState>) => void;
  setSelectedTimeWindow: (timeMs: number) => void;

  clearSensorData: () => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  // Initial state
  latestAccelerometerReading: null,
  latestGyroscopeReading: null,
  latestMagnetometerReading: null,
  latestOrientation: null,

  accelerometerHistory: [],
  gyroscopeHistory: [],
  magnetometerHistory: [],

  streamState: {
    isStreaming: false,
    sampleRate: 60,
    dataLoss: 0,
    latency: 0,
    lastReadingTime: 0,
    readingsPerSecond: 0,
  },

  selectedTimeWindow: 30000, // 30 seconds

  // Setters
  setAccelerometerReading: (reading) =>
    set({ latestAccelerometerReading: reading }),

  setGyroscopeReading: (reading) =>
    set({ latestGyroscopeReading: reading }),

  setMagnetometerReading: (reading) =>
    set({ latestMagnetometerReading: reading }),

  setOrientation: (orientation) =>
    set({ latestOrientation: orientation }),

  setAccelerometerHistory: (readings) =>
    set({ accelerometerHistory: readings }),

  setGyroscopeHistory: (readings) =>
    set({ gyroscopeHistory: readings }),

  setMagnetometerHistory: (readings) =>
    set({ magnetometerHistory: readings }),

  addAccelerometerReading: (reading) =>
    set((state) => {
      const history = [...state.accelerometerHistory, reading];
      // Keep last 1000 readings in memory
      if (history.length > 1000) {
        history.shift();
      }
      return { accelerometerHistory: history, latestAccelerometerReading: reading };
    }),

  addGyroscopeReading: (reading) =>
    set((state) => {
      const history = [...state.gyroscopeHistory, reading];
      if (history.length > 1000) {
        history.shift();
      }
      return { gyroscopeHistory: history, latestGyroscopeReading: reading };
    }),

  addMagnetometerReading: (reading) =>
    set((state) => {
      const history = [...state.magnetometerHistory, reading];
      if (history.length > 1000) {
        history.shift();
      }
      return { magnetometerHistory: history, latestMagnetometerReading: reading };
    }),

  setStreamState: (newState) =>
    set((state) => ({
      streamState: { ...state.streamState, ...newState },
    })),

  setSelectedTimeWindow: (timeMs) =>
    set({ selectedTimeWindow: timeMs }),

  clearSensorData: () =>
    set({
      latestAccelerometerReading: null,
      latestGyroscopeReading: null,
      latestMagnetometerReading: null,
      latestOrientation: null,
      accelerometerHistory: [],
      gyroscopeHistory: [],
      magnetometerHistory: [],
      streamState: {
        isStreaming: false,
        sampleRate: 60,
        dataLoss: 0,
        latency: 0,
        lastReadingTime: 0,
        readingsPerSecond: 0,
      },
    }),
}));
