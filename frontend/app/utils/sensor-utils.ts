/**
 * Sensor Utilities
 * Math and conversion utilities for sensor data processing
 */

import { SensorReading, DeviceOrientation } from '../types';

/**
 * Convert accelerometer and magnetometer data to device orientation
 * Using simple rotation matrix calculation (simplified for phase 2)
 */
export function calculateDeviceOrientation(
  accelerometer: SensorReading,
  magnetometer?: SensorReading
): DeviceOrientation {
  // Normalize accelerometer
  const accelMagnitude = Math.sqrt(
    accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
  );

  const ax = accelerometer.x / accelMagnitude;
  const ay = accelerometer.y / accelMagnitude;
  const az = accelerometer.z / accelMagnitude;

  // Calculate pitch (rotation around X axis)
  const pitch = Math.asin(-ay);

  // Calculate roll (rotation around Y axis)
  const roll = Math.atan2(ax, az);

  // Calculate yaw (rotation around Z axis) - requires magnetometer
  let yaw = 0;
  if (magnetometer) {
    // Simplified yaw calculation
    const mx = magnetometer.x;
    const my = magnetometer.y;
    yaw = Math.atan2(my, mx);
  }

  // Convert Euler to Quaternion for smooth 3D rotation
  // Using simplified approach: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sr = Math.sin(roll * 0.5);

  const quaternion = {
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  };

  return {
    quaternion,
    euler: {
      x: roll,
      y: pitch,
      z: yaw,
    },
    timestamp: accelerometer.timestamp,
    accuracy: 0.95, // Simplified for phase 2
  };
}

/**
 * Linear interpolation (LERP) for smooth quaternion transitions
 */
export function lerpQuaternion(
  q1: DeviceOrientation['quaternion'],
  q2: DeviceOrientation['quaternion'],
  t: number
): DeviceOrientation['quaternion'] {
  // Ensure shortest path
  let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
  const q2Copy = { ...q2 };

  if (dot < 0) {
    q2Copy.x = -q2Copy.x;
    q2Copy.y = -q2Copy.y;
    q2Copy.z = -q2Copy.z;
    q2Copy.w = -q2Copy.w;
    dot = -dot;
  }

  // Linear interpolation
  const t1 = 1 - t;
  return {
    x: q1.x * t1 + q2Copy.x * t,
    y: q1.y * t1 + q2Copy.y * t,
    z: q1.z * t1 + q2Copy.z * t,
    w: q1.w * t1 + q2Copy.w * t,
  };
}

/**
 * Calculate magnitude of a 3D vector
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculate acceleration magnitude (useful for detecting motion)
 */
export function calculateAcceleration(reading: SensorReading): number {
  const magnitude = calculateMagnitude(reading.x, reading.y, reading.z);
  // Subtract gravity (~9.81 m/s²) for net acceleration
  return Math.max(0, magnitude - 9.81);
}

/**
 * Normalize a 3D vector to unit length
 */
export function normalizeVector(
  x: number,
  y: number,
  z: number
): { x: number; y: number; z: number } {
  const magnitude = calculateMagnitude(x, y, z);
  if (magnitude === 0) return { x: 0, y: 0, z: 0 };

  return {
    x: x / magnitude,
    y: y / magnitude,
    z: z / magnitude,
  };
}

/**
 * Calculate the angle between two 3D vectors
 */
export function calculateAngleBetweenVectors(
  v1: { x: number; y: number; z: number },
  v2: { x: number; y: number; z: number }
): number {
  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const magnitude1 = calculateMagnitude(v1.x, v1.y, v1.z);
  const magnitude2 = calculateMagnitude(v2.x, v2.y, v2.z);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  const cosAngle = dotProduct / (magnitude1 * magnitude2);
  // Clamp to avoid NaN from floating point errors
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/**
 * Detect if device is stationary (low acceleration)
 */
export function isDeviceStationary(
  reading: SensorReading,
  threshold: number = 0.5
): boolean {
  const acceleration = calculateAcceleration(reading);
  return acceleration < threshold;
}

/**
 * Calculate moving average of sensor readings
 */
export function calculateMovingAverage(
  readings: SensorReading[],
  windowSize: number = 5
): SensorReading | null {
  if (readings.length === 0) return null;

  const window = readings.slice(-windowSize);
  const avgX = window.reduce((sum, r) => sum + r.x, 0) / window.length;
  const avgY = window.reduce((sum, r) => sum + r.y, 0) / window.length;
  const avgZ = window.reduce((sum, r) => sum + r.z, 0) / window.length;

  return {
    x: avgX,
    y: avgY,
    z: avgZ,
    timestamp: readings[readings.length - 1].timestamp,
  };
}

/**
 * Detect sudden motion/impact
 */
export function detectMotionEvent(
  currentReading: SensorReading,
  previousReadings: SensorReading[] = [],
  accelerationThreshold: number = 20
): boolean {
  const currentAccel = calculateAcceleration(currentReading);
  if (currentAccel < accelerationThreshold) return false;

  // Check if recent readings were below threshold (indicates a sudden change)
  if (previousReadings.length > 0) {
    const avgPreviousAccel =
      previousReadings.reduce((sum, r) => sum + calculateAcceleration(r), 0) /
      previousReadings.length;
    return currentAccel - avgPreviousAccel > accelerationThreshold * 0.5;
  }

  return currentAccel > accelerationThreshold;
}

/**
 * Format sensor value for display
 */
export function formatSensorValue(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format timestamp as HH:MM:SS
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
