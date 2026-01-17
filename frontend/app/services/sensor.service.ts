/**
 * Sensor Service
 * Handles parsing, validation, and processing of real-time sensor data
 */

import { SensorReading, SensorDataPoint, DeviceOrientation } from '../types';
import {
  calculateDeviceOrientation,
  calculateMagnitude,
  calculateAcceleration,
} from '../utils';

class SensorService {
  private lastProcessedTimestamp = 0;
  private droppedPackets = 0;
  private totalPackets = 0;

  /**
   * Parse raw accelerometer data
   */
  public parseAccelerometerData(data: any): SensorReading {
    return {
      x: parseFloat(data.x) || 0,
      y: parseFloat(data.y) || 0,
      z: parseFloat(data.z) || 0,
      timestamp: data.timestamp || Date.now(),
      accuracy: parseFloat(data.accuracy) || 1,
    };
  }

  /**
   * Parse raw gyroscope data
   */
  public parseGyroscopeData(data: any): SensorReading {
    return {
      x: parseFloat(data.x) || 0,
      y: parseFloat(data.y) || 0,
      z: parseFloat(data.z) || 0,
      timestamp: data.timestamp || Date.now(),
      accuracy: parseFloat(data.accuracy) || 1,
    };
  }

  /**
   * Parse raw magnetometer data
   */
  public parseMagnetometerData(data: any): SensorReading {
    return {
      x: parseFloat(data.x) || 0,
      y: parseFloat(data.y) || 0,
      z: parseFloat(data.z) || 0,
      timestamp: data.timestamp || Date.now(),
      accuracy: parseFloat(data.accuracy) || 1,
    };
  }

  /**
   * Parse performance metrics data
   */
  public parsePerformanceMetrics(data: any): any {
    return {
      cpu: Math.max(0, Math.min(100, parseFloat(data.cpu) || 0)),
      memory: Math.max(0, Math.min(100, parseFloat(data.memory) || 0)),
      temperature: parseFloat(data.temperature) || 0,
      battery: Math.max(0, Math.min(100, parseFloat(data.battery) || 0)),
      charging: Boolean(data.charging),
      timestamp: data.timestamp || Date.now(),
    };
  }

  /**
   * Validate sensor reading
   */
  public isValidReading(reading: SensorReading): boolean {
    // Check for NaN or Infinity
    if (
      !Number.isFinite(reading.x) ||
      !Number.isFinite(reading.y) ||
      !Number.isFinite(reading.z)
    ) {
      return false;
    }

    // Check timestamp is recent (within last 5 seconds)
    const now = Date.now();
    if (reading.timestamp < now - 5000 || reading.timestamp > now + 1000) {
      return false;
    }

    // Check values are within reasonable range for accelerometer
    const magnitude = calculateMagnitude(reading.x, reading.y, reading.z);
    if (magnitude > 50) {
      // Max 5g for phones
      return false;
    }

    return true;
  }

  /**
   * Detect packet loss
   */
  public detectPacketLoss(
    currentTimestamp: number,
    expectedSampleRate: number
  ): boolean {
    this.totalPackets++;

    if (this.lastProcessedTimestamp > 0) {
      const timeDelta = currentTimestamp - this.lastProcessedTimestamp;
      const expectedDelta = 1000 / expectedSampleRate;

      // If gap is more than 1.5x expected, it's a dropped packet
      if (timeDelta > expectedDelta * 1.5) {
        this.droppedPackets++;
        return true;
      }
    }

    this.lastProcessedTimestamp = currentTimestamp;
    return false;
  }

  /**
   * Calculate data loss percentage
   */
  public getDataLossPercentage(): number {
    if (this.totalPackets === 0) return 0;
    return this.droppedPackets / this.totalPackets;
  }

  /**
   * Reset packet loss tracking
   */
  public resetPacketTracking(): void {
    this.droppedPackets = 0;
    this.totalPackets = 0;
    this.lastProcessedTimestamp = 0;
  }

  /**
   * Calculate average readings per second
   */
  public getReadingsPerSecond(readings: SensorReading[]): number {
    if (readings.length < 2) return 0;

    const firstTimestamp = readings[0].timestamp;
    const lastTimestamp = readings[readings.length - 1].timestamp;
    const timeDelta = (lastTimestamp - firstTimestamp) / 1000;

    if (timeDelta === 0) return 0;

    return readings.length / timeDelta;
  }

  /**
   * Aggregate multiple readings into a single data point
   */
  public aggregateReadings(
    accelerometer: SensorReading,
    gyroscope: SensorReading,
    magnetometer?: SensorReading
  ): SensorDataPoint {
    const orientation = calculateDeviceOrientation(accelerometer, magnetometer);

    return {
      timestamp: accelerometer.timestamp,
      accelerometer,
      gyroscope,
      magnetometer,
      orientation,
    };
  }

  /**
   * Downsample readings for display (reduce points for performance)
   */
  public downsampleReadings(
    readings: SensorReading[],
    factor: number
  ): SensorReading[] {
    if (factor <= 1) return readings;

    const downsampled: SensorReading[] = [];
    for (let i = 0; i < readings.length; i += factor) {
      downsampled.push(readings[i]);
    }

    // Always include last point
    if (downsampled[downsampled.length - 1] !== readings[readings.length - 1]) {
      downsampled.push(readings[readings.length - 1]);
    }

    return downsampled;
  }

  /**
   * Get statistics for a set of readings
   */
  public getReadingStatistics(readings: SensorReading[]): any {
    if (readings.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        stddev: 0,
      };
    }

    // Calculate for magnitude
    const magnitudes = readings.map((r) =>
      calculateMagnitude(r.x, r.y, r.z)
    );

    const min = Math.min(...magnitudes);
    const max = Math.max(...magnitudes);
    const average = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;

    // Calculate standard deviation
    const variance =
      magnitudes.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      magnitudes.length;
    const stddev = Math.sqrt(variance);

    return { min, max, average, stddev };
  }
}

export const sensorService = new SensorService();
