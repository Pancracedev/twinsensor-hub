/**
 * Shared type definitions for Twin Sensor Hub Backend
 */

// ============================================================================
// Device Types
// ============================================================================

export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  platform: string;
  osVersion: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'wearable';
  osVersion: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastConnected: Date;
  isOnline: boolean;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  sessionId: string;
  startedAt: Date;
  lastHeartbeat: Date;
  status: 'connected' | 'disconnected' | 'reconnecting';
  isActive: boolean;
}

// ============================================================================
// Sensor Types
// ============================================================================

export interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
  accuracy?: number;
}

export interface GyroscopeReading {
  x: number;
  y: number;
  z: number;
  accuracy?: number;
}

export interface MagnetometerReading {
  x: number;
  y: number;
  z: number;
  accuracy?: number;
}

export interface DeviceOrientation {
  alpha: number; // Rotation around Z axis (0-360)
  beta: number;  // Rotation around X axis (-180 to 180)
  gamma: number; // Rotation around Y axis (-90 to 90)
  quaternion?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
}

export interface SensorReading {
  timestamp: number;
  accelerometer: AccelerometerReading;
  gyroscope: GyroscopeReading;
  magnetometer: MagnetometerReading;
  orientation: DeviceOrientation;
}

export interface PerformanceMetrics {
  timestamp: number;
  cpu: number; // Percentage 0-100
  memory: number; // Percentage 0-100
  temperature: number; // Celsius
  fps: number;
}

export interface SensorStreamState {
  isStreaming: boolean;
  sampleRate: number;
  latency: number;
  dataQuality: number; // 0-100
  packetLoss: number; // 0-100
}

export interface SensorDataPoint {
  deviceId: string;
  sessionId: string;
  sensorReading: SensorReading;
  performanceMetrics: PerformanceMetrics;
}

// ============================================================================
// Socket.io Event Types
// ============================================================================

export interface SocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface SocketConnectionEvent {
  deviceId: string;
  sessionId: string;
  timestamp: number;
}

export interface SocketError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface SocketHeartbeat {
  deviceId: string;
  sessionId: string;
  timestamp: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Anomaly Types
// ============================================================================

export type AnomalyType =
  | 'UNEXPECTED_ACCELERATION'
  | 'UNEXPECTED_DECELERATION'
  | 'UNUSUAL_ROTATION'
  | 'EXCESSIVE_VIBRATION'
  | 'SUDDEN_MOVEMENT'
  | 'CPU_SPIKE'
  | 'MEMORY_LEAK'
  | 'TEMPERATURE_SPIKE'
  | 'THERMAL_THROTTLING'
  | 'PATTERN_DEVIATION'
  | 'PERIODIC_ANOMALY'
  | 'DRIFT_DETECTED';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Anomaly {
  id: string;
  deviceId: string;
  sessionId: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  score: number;
  description: string;
  metadata: Record<string, any>;
  detectedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

// ============================================================================
// Request/Response DTOs
// ============================================================================

export interface CreateDeviceDTO {
  name: string;
  type: 'phone' | 'tablet' | 'wearable';
  osVersion: string;
  deviceInfo: DeviceInfo;
}

export interface UpdateDeviceDTO {
  name?: string;
  lastConnected?: Date;
  isOnline?: boolean;
}

export interface SensorDataDTO {
  sensorReading: SensorReading;
  performanceMetrics: PerformanceMetrics;
}

export interface AnomalyDTO {
  type: AnomalyType;
  severity: AnomalySeverity;
  score: number;
  description: string;
  metadata?: Record<string, any>;
}
