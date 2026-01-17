import type { Device, DeviceSession } from '../types/index.js';
import { generateUUID, generateSessionId } from '../utils/index.js';
import logger from '../utils/logger.js';

/**
 * Device Service - Manages device operations
 */
class DeviceService {
  private devices: Map<string, Device> = new Map();
  private sessions: Map<string, DeviceSession> = new Map();

  /**
   * Create a new device
   */
  createDevice(id: string, name: string, type: 'phone' | 'tablet' | 'wearable', osVersion: string): Device {
    if (this.devices.has(id)) {
      logger.warn({ deviceId: id }, 'Device already exists');
      return this.devices.get(id)!;
    }

    const device: Device = {
      id,
      name,
      type,
      osVersion,
      deviceInfo: {
        userAgent: '',
        screenWidth: 0,
        screenHeight: 0,
        pixelRatio: 1,
        platform: '',
        osVersion,
      },
      createdAt: new Date(),
      lastConnected: new Date(),
      isOnline: false,
    };

    this.devices.set(id, device);
    logger.info({ deviceId: id }, 'Device created');

    return device;
  }

  /**
   * Get device by ID
   */
  getDevice(id: string): Device | null {
    return this.devices.get(id) || null;
  }

  /**
   * Get all devices
   */
  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  /**
   * Update device
   */
  updateDevice(id: string, updates: Partial<Device>): Device | null {
    const device = this.devices.get(id);
    if (!device) {
      logger.warn({ deviceId: id }, 'Device not found for update');
      return null;
    }

    const updated = { ...device, ...updates };
    this.devices.set(id, updated);
    logger.info({ deviceId: id }, 'Device updated');

    return updated;
  }

  /**
   * Delete device
   */
  deleteDevice(id: string): boolean {
    const deleted = this.devices.delete(id);
    if (deleted) {
      logger.info({ deviceId: id }, 'Device deleted');
    }
    return deleted;
  }

  /**
   * Update device online status
   */
  setDeviceOnline(id: string, isOnline: boolean): Device | null {
    const device = this.getDevice(id);
    if (!device) return null;

    return this.updateDevice(id, {
      isOnline,
      lastConnected: new Date(),
    });
  }

  /**
   * Create a session for device
   */
  createSession(deviceId: string): DeviceSession {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const session: DeviceSession = {
      id: generateUUID(),
      deviceId,
      sessionId: generateSessionId(),
      startedAt: new Date(),
      lastHeartbeat: new Date(),
      status: 'connected',
      isActive: true,
    };

    this.sessions.set(session.id, session);
    logger.info({ deviceId, sessionId: session.id }, 'Session created');

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(id: string): DeviceSession | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Get sessions for device
   */
  getDeviceSessions(deviceId: string): DeviceSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.deviceId === deviceId
    );
  }

  /**
   * Update session heartbeat
   */
  updateSessionHeartbeat(id: string): DeviceSession | null {
    const session = this.getSession(id);
    if (!session) return null;

    session.lastHeartbeat = new Date();
    this.sessions.set(id, session);

    return session;
  }

  /**
   * End session
   */
  endSession(id: string): DeviceSession | null {
    const session = this.getSession(id);
    if (!session) return null;

    session.status = 'disconnected';
    session.isActive = false;
    this.sessions.set(id, session);
    logger.info({ sessionId: id }, 'Session ended');

    return session;
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): DeviceSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.isActive
    );
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(timeoutMs: number): number {
    const now = Date.now();
    let count = 0;

    for (const [id, session] of this.sessions.entries()) {
      const timeSinceHeartbeat = now - session.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > timeoutMs) {
        this.endSession(id);
        count++;
      }
    }

    if (count > 0) {
      logger.info({ count }, 'Expired sessions cleaned up');
    }

    return count;
  }
}

export default new DeviceService();
