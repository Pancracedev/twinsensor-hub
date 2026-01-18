import { SensorReading, type ISensorReading } from '../models/SensorReading.js';
import { logger } from '../../utils/logger.js';

export class SensorReadingRepository {
  /**
   * Create a new sensor reading
   */
  async create(readingData: Partial<ISensorReading>): Promise<ISensorReading> {
    try {
      const reading = new SensorReading(readingData);
      const savedReading = await reading.save();
      logger.debug({ deviceId: savedReading.deviceId }, 'Sensor reading saved');
      return savedReading.toObject();
    } catch (error) {
      logger.error({ error }, 'Failed to create sensor reading');
      throw error;
    }
  }

  /**
   * Find readings by device ID
   */
  async findByDeviceId(deviceId: string, limit: number = 100): Promise<ISensorReading[]> {
    try {
      const readings = await SensorReading.find({ deviceId })
        .sort({ timestamp: -1 })
        .limit(limit);
      return readings.map((r: any) => r.toObject());
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to find readings by device');
      throw error;
    }
  }

  /**
   * Find readings by session ID
   */
  async findBySessionId(sessionId: string, limit: number = 100): Promise<ISensorReading[]> {
    try {
      const readings = await SensorReading.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit);
      return readings.map((r: any) => r.toObject());
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to find readings by session');
      throw error;
    }
  }

  /**
   * Find anomalous readings
   */
  async findAnomalies(deviceId: string, limit: number = 100): Promise<ISensorReading[]> {
    try {
      const readings = await SensorReading.find({
        deviceId,
        isAnomaly: true,
      })
        .sort({ timestamp: -1 })
        .limit(limit);
      return readings.map((r: any) => r.toObject());
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to find anomalies');
      throw error;
    }
  }

  /**
   * Count readings for device
   */
  async countByDeviceId(deviceId: string): Promise<number> {
    try {
      return await SensorReading.countDocuments({ deviceId });
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to count readings');
      throw error;
    }
  }

  /**
   * Get latest reading for device
   */
  async getLatestByDeviceId(deviceId: string): Promise<ISensorReading | null> {
    try {
      const reading = await SensorReading.findOne({ deviceId }).sort({
        timestamp: -1,
      });
      return reading ? reading.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to get latest reading');
      throw error;
    }
  }
}

export default new SensorReadingRepository();
