import { Device, type IDevice } from '../models/Device.js';
import { logger } from '../../utils/logger.js';

export class DeviceRepository {
  /**
   * Create a new device
   */
  async create(deviceData: Partial<IDevice>): Promise<IDevice> {
    try {
      const device = new Device(deviceData);
      const savedDevice = await device.save();
      logger.info({ deviceId: savedDevice.deviceId }, 'Device created in MongoDB');
      return savedDevice.toObject();
    } catch (error) {
      logger.error({ error }, 'Failed to create device');
      throw error;
    }
  }

  /**
   * Find device by ID
   */
  async findById(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await Device.findOne({ deviceId });
      return device ? device.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to find device');
      throw error;
    }
  }

  /**
   * Find all devices
   */
  async findAll(): Promise<IDevice[]> {
    try {
      const devices = await Device.find({});
      return devices.map((device: any) => device.toObject());
    } catch (error) {
      logger.error({ error }, 'Failed to find all devices');
      throw error;
    }
  }

  /**
   * Find all active devices
   */
  async findAllActive(): Promise<IDevice[]> {
    try {
      const devices = await Device.find({ isActive: true });
      return devices.map((device: any) => device.toObject());
    } catch (error) {
      logger.error({ error }, 'Failed to find active devices');
      throw error;
    }
  }

  /**
   * Update device
   */
  async update(deviceId: string, updates: Partial<IDevice>): Promise<IDevice | null> {
    try {
      const device = await Device.findOneAndUpdate({ deviceId }, updates, {
        new: true,
      });
      if (device) {
        logger.info({ deviceId }, 'Device updated in MongoDB');
      }
      return device ? device.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to update device');
      throw error;
    }
  }

  /**
   * Delete device by ID
   */
  async delete(deviceId: string): Promise<boolean> {
    try {
      const result = await Device.deleteOne({ deviceId });
      if (result.deletedCount > 0) {
        logger.info({ deviceId }, 'Device deleted from MongoDB');
      }
      return result.deletedCount > 0;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to delete device');
      throw error;
    }
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await Device.findOneAndUpdate(
        { deviceId },
        { lastSeen: new Date() },
        { new: true }
      );
      return device ? device.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to update lastSeen');
      throw error;
    }
  }

  /**
   * Deactivate device
   */
  async deactivate(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await Device.findOneAndUpdate(
        { deviceId },
        { isActive: false, lastSeen: new Date() },
        { new: true }
      );
      if (device) {
        logger.info({ deviceId }, 'Device deactivated');
      }
      return device ? device.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to deactivate device');
      throw error;
    }
  }

  /**
   * Activate device
   */
  async activate(deviceId: string): Promise<IDevice | null> {
    try {
      const device = await Device.findOneAndUpdate(
        { deviceId },
        { isActive: true, lastSeen: new Date() },
        { new: true }
      );
      if (device) {
        logger.info({ deviceId }, 'Device activated');
      }
      return device ? device.toObject() : null;
    } catch (error) {
      logger.error({ error, deviceId }, 'Failed to activate device');
      throw error;
    }
  }

  /**
   * Count all devices
   */
  async count(): Promise<number> {
    try {
      return await Device.countDocuments();
    } catch (error) {
      logger.error({ error }, 'Failed to count devices');
      throw error;
    }
  }

  /**
   * Count active devices
   */
  async countActive(): Promise<number> {
    try {
      return await Device.countDocuments({ isActive: true });
    } catch (error) {
      logger.error({ error }, 'Failed to count active devices');
      throw error;
    }
  }
}

export default new DeviceRepository();
