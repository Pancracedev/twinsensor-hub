/**
 * Sensor Type Definitions
 * Types for real-time sensor data and monitoring (Phase 2)
 */

// Individual sensor readings
export interface SensorReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  accuracy?: number;
}

export interface AccelerometerReading extends SensorReading {
  unit: 'm/s²';
}

export interface GyroscopeReading extends SensorReading {
  unit: 'rad/s';
}

export interface MagnetometerReading extends SensorReading {
  unit: 'μT';
}

// Device orientation from sensors
export interface DeviceOrientation {
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  euler: {
    x: number; // Roll
    y: number; // Pitch
    z: number; // Yaw
  };
  timestamp: number;
  accuracy: number; // 0-1 confidence
}

// Performance metrics
export interface PerformanceMetrics {
  cpu: number; // 0-100%
  memory: number; // 0-100%
  temperature: number; // Celsius
  battery: number; // 0-100%
  charging: boolean;
  timestamp: number;
}

// Sensor stream state
export interface SensorStreamState {
  isStreaming: boolean;
  sampleRate: number; // Hz
  dataLoss: number; // 0-1 (percentage)
  latency: number; // ms
  lastReadingTime: number;
  readingsPerSecond: number;
}

// Aggregated sensor data for display
export interface SensorDataPoint {
  timestamp: number;
  accelerometer: SensorReading;
  gyroscope: SensorReading;
  magnetometer?: MagnetometerReading;
  performance?: PerformanceMetrics;
  orientation?: DeviceOrientation;
}

// Historical buffer metadata
export interface BufferMetadata {
  startTime: number;
  endTime: number;
  totalReadings: number;
  averageSampleRate: number;
  dataGaps: number;
}
