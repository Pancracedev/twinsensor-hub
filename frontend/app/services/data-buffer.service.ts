/**
 * Data Buffer Service
 * Manages time-series buffer for real-time sensor data
 */

import { SensorReading, SensorDataPoint, BufferMetadata } from '../types';
import { SENSOR_CONFIG } from '../utils';

class DataBufferService {
  private buffer: SensorDataPoint[] = [];
  private maxSize: number;
  private bufferDuration: number;

  constructor(
    maxSize: number = SENSOR_CONFIG.MAX_BUFFER_SIZE,
    bufferDuration: number = SENSOR_CONFIG.BUFFER_DURATION
  ) {
    this.maxSize = maxSize;
    this.bufferDuration = bufferDuration;
  }

  /**
   * Add a data point to the buffer
   */
  public addDataPoint(dataPoint: SensorDataPoint): void {
    this.buffer.push(dataPoint);

    // Maintain buffer size
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }

    // Remove old data (older than bufferDuration)
    this.cleanOldData();
  }

  /**
   * Add multiple data points
   */
  public addDataPoints(dataPoints: SensorDataPoint[]): void {
    dataPoints.forEach((dp) => this.addDataPoint(dp));
  }

  /**
   * Get all data points in buffer
   */
  public getAllData(): SensorDataPoint[] {
    return [...this.buffer];
  }

  /**
   * Get data points from the last N milliseconds
   */
  public getDataSince(timeMs: number): SensorDataPoint[] {
    const cutoffTime = Date.now() - timeMs;
    return this.buffer.filter((dp) => dp.timestamp >= cutoffTime);
  }

  /**
   * Get latest N data points
   */
  public getLatestDataPoints(count: number): SensorDataPoint[] {
    return this.buffer.slice(-count);
  }

  /**
   * Get the most recent data point
   */
  public getLatestDataPoint(): SensorDataPoint | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  /**
   * Get data points for a specific time range
   */
  public getDataInRange(
    startTime: number,
    endTime: number
  ): SensorDataPoint[] {
    return this.buffer.filter(
      (dp) => dp.timestamp >= startTime && dp.timestamp <= endTime
    );
  }

  /**
   * Get specific sensor readings (accelerometer, gyroscope, etc.)
   */
  public getAccelerometerReadings(): SensorReading[] {
    return this.buffer.map((dp) => dp.accelerometer);
  }

  public getGyroscopeReadings(): SensorReading[] {
    return this.buffer.map((dp) => dp.gyroscope);
  }

  public getMagnetometerReadings(): SensorReading[] {
    return this.buffer
      .filter((dp) => dp.magnetometer)
      .map((dp) => dp.magnetometer!);
  }

  /**
   * Get buffer metadata
   */
  public getMetadata(): BufferMetadata {
    if (this.buffer.length === 0) {
      return {
        startTime: 0,
        endTime: 0,
        totalReadings: 0,
        averageSampleRate: 0,
        dataGaps: 0,
      };
    }

    const startTime = this.buffer[0].timestamp;
    const endTime = this.buffer[this.buffer.length - 1].timestamp;
    const duration = (endTime - startTime) / 1000; // in seconds

    // Count gaps (time difference > 1.5x expected)
    let dataGaps = 0;
    const avgSampleRate = this.buffer.length / (duration > 0 ? duration : 1);
    const expectedDelta = 1000 / avgSampleRate;

    for (let i = 1; i < this.buffer.length; i++) {
      const timeDelta = this.buffer[i].timestamp - this.buffer[i - 1].timestamp;
      if (timeDelta > expectedDelta * 1.5) {
        dataGaps++;
      }
    }

    return {
      startTime,
      endTime,
      totalReadings: this.buffer.length,
      averageSampleRate: avgSampleRate,
      dataGaps,
    };
  }

  /**
   * Get buffer size
   */
  public getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Clear all data
   */
  public clear(): void {
    this.buffer = [];
  }

  /**
   * Remove old data points outside buffer duration
   */
  private cleanOldData(): void {
    const cutoffTime = Date.now() - this.bufferDuration;
    const initialSize = this.buffer.length;

    this.buffer = this.buffer.filter((dp) => dp.timestamp >= cutoffTime);

    // Debug: log if data was removed
    if (this.buffer.length < initialSize) {
      console.debug(
        `DataBuffer: Removed ${initialSize - this.buffer.length} old data points`
      );
    }
  }

  /**
   * Resample buffer to specific sample rate
   */
  public resampleToRate(targetSampleRate: number): SensorDataPoint[] {
    if (this.buffer.length === 0) return [];

    const targetDelta = 1000 / targetSampleRate;
    const resampled: SensorDataPoint[] = [];
    let nextTime = this.buffer[0].timestamp;

    for (const dp of this.buffer) {
      if (dp.timestamp >= nextTime) {
        resampled.push(dp);
        nextTime += targetDelta;
      }
    }

    return resampled;
  }

  /**
   * Get memory usage estimate
   */
  public getMemoryUsageEstimate(): number {
    // Rough estimate: each SensorDataPoint ~500 bytes
    return this.buffer.length * 500;
  }

  /**
   * Export buffer as CSV (for debugging/export)
   */
  public exportAsCSV(): string {
    const headers = [
      'timestamp',
      'accel_x',
      'accel_y',
      'accel_z',
      'gyro_x',
      'gyro_y',
      'gyro_z',
    ];

    const rows = this.buffer.map((dp) => [
      dp.timestamp,
      dp.accelerometer.x.toFixed(3),
      dp.accelerometer.y.toFixed(3),
      dp.accelerometer.z.toFixed(3),
      dp.gyroscope.x.toFixed(3),
      dp.gyroscope.y.toFixed(3),
      dp.gyroscope.z.toFixed(3),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }
}

export const dataBufferService = new DataBufferService();
