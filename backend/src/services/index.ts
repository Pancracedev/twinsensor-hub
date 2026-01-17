import type { SensorDataPoint } from '../types/index.js';
import logger from '../utils/logger.js';

interface BufferEntry {
  data: SensorDataPoint;
  timestamp: number;
}

/**
 * Data Buffer Service - Manages sensor data storage and retrieval
 */
class DataBufferService {
  private buffer: Map<string, BufferEntry[]> = new Map();
  private readonly maxBufferSize: number;
  private readonly bufferDurationMs: number;

  constructor(maxBufferSize: number = 1000, bufferDurationMs: number = 60000) {
    this.maxBufferSize = maxBufferSize;
    this.bufferDurationMs = bufferDurationMs;
  }

  /**
   * Add sensor data to buffer
   */
  addData(deviceId: string, data: SensorDataPoint): void {
    if (!this.buffer.has(deviceId)) {
      this.buffer.set(deviceId, []);
    }

    const deviceBuffer = this.buffer.get(deviceId)!;
    deviceBuffer.push({
      data,
      timestamp: Date.now(),
    });

    // Trim old entries
    this.trimBuffer(deviceId);
  }

  /**
   * Get data for device
   */
  getData(deviceId: string, count?: number): SensorDataPoint[] {
    const deviceBuffer = this.buffer.get(deviceId);
    if (!deviceBuffer) return [];

    const data = deviceBuffer.map((entry) => entry.data);
    return count ? data.slice(-count) : data;
  }

  /**
   * Get data within time range
   */
  getDataByTimeRange(
    deviceId: string,
    startTime: number,
    endTime: number
  ): SensorDataPoint[] {
    const deviceBuffer = this.buffer.get(deviceId);
    if (!deviceBuffer) return [];

    return deviceBuffer
      .filter((entry) => entry.timestamp >= startTime && entry.timestamp <= endTime)
      .map((entry) => entry.data);
  }

  /**
   * Get latest data point
   */
  getLatestData(deviceId: string): SensorDataPoint | null {
    const deviceBuffer = this.buffer.get(deviceId);
    if (!deviceBuffer || deviceBuffer.length === 0) return null;

    return deviceBuffer[deviceBuffer.length - 1].data;
  }

  /**
   * Get buffer statistics
   */
  getBufferStats(deviceId: string): {
    size: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
    memoryMB: number;
  } {
    const deviceBuffer = this.buffer.get(deviceId);
    if (!deviceBuffer || deviceBuffer.length === 0) {
      return {
        size: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        memoryMB: 0,
      };
    }

    const oldestTimestamp = deviceBuffer[0].timestamp;
    const newestTimestamp = deviceBuffer[deviceBuffer.length - 1].timestamp;

    // Rough estimation
    const memoryMB =
      (deviceBuffer.length * 200) / (1024 * 1024); // ~200 bytes per entry

    return {
      size: deviceBuffer.length,
      oldestTimestamp,
      newestTimestamp,
      memoryMB,
    };
  }

  /**
   * Clear device buffer
   */
  clearDeviceBuffer(deviceId: string): void {
    this.buffer.delete(deviceId);
    logger.info({ deviceId }, 'Device buffer cleared');
  }

  /**
   * Clear all buffers
   */
  clearAllBuffers(): void {
    this.buffer.clear();
    logger.info('All buffers cleared');
  }

  /**
   * Cleanup old entries
   */
  private trimBuffer(deviceId: string): void {
    const deviceBuffer = this.buffer.get(deviceId);
    if (!deviceBuffer) return;

    const now = Date.now();

    // Remove entries older than buffer duration
    let trimmedCount = 0;
    while (
      deviceBuffer.length > 0 &&
      now - deviceBuffer[0].timestamp > this.bufferDurationMs
    ) {
      deviceBuffer.shift();
      trimmedCount++;
    }

    // Remove entries if buffer size exceeded
    if (deviceBuffer.length > this.maxBufferSize) {
      const removed = deviceBuffer.length - this.maxBufferSize;
      deviceBuffer.splice(0, removed);
      trimmedCount += removed;
    }

    if (trimmedCount > 0) {
      logger.debug(
        { deviceId, trimmedCount },
        'Buffer entries trimmed'
      );
    }
  }

  /**
   * Get all devices with data
   */
  getAllDevices(): string[] {
    return Array.from(this.buffer.keys());
  }
}

export default new DataBufferService();
