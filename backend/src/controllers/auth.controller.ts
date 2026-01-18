import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import deviceService from '../services/device.service.js';
import { generateUUID } from '../utils/index.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  /**
   * Register a new device and generate auth token
   */
  static async registerDevice(req: Request, res: Response): Promise<void> {
    try {
      const { deviceName, deviceType, osVersion } = req.body;

      // Validate required fields
      if (!deviceName || !deviceType) {
        res.status(400).json({
          error: 'Missing required fields: deviceName, deviceType',
        });
        return;
      }

      // Create device (service expects id, name, type, osVersion)
      const id = generateUUID();
      const device = deviceService.createDevice(
        id,
        deviceName,
        (deviceType as 'phone' | 'tablet' | 'wearable'),
        osVersion || 'unknown'
      );

      // Create session
      const session = deviceService.createSession(device.id);

      // Generate token
      const token = AuthService.generateToken({
        deviceId: device.id,
        sessionId: session.sessionId,
      });

      logger.info(
        { deviceId: device.id, sessionId: session.sessionId },
        'Device registered successfully'
      );

      res.status(201).json({
        success: true,
        device: {
          deviceId: device.id,
          name: device.name,
          type: device.type,
          createdAt: device.createdAt,
        },
        session: {
          sessionId: session.sessionId,
          startTime: session.startedAt,
        },
        token,
        expiresIn: '24h',
      });
    } catch (error) {
      logger.error({ error }, 'Device registration failed');
      res.status(500).json({
        error: 'Device registration failed',
      });
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const newToken = AuthService.refreshToken(req.token);

      logger.info(
        { deviceId: req.user?.deviceId },
        'Token refreshed successfully'
      );

      res.status(200).json({
        success: true,
        token: newToken,
        expiresIn: '24h',
      });
    } catch (error) {
      logger.error({ error }, 'Token refresh failed');
      res.status(401).json({
        error: 'Failed to refresh token',
      });
    }
  }

  /**
   * Validate current token
   */
  static async validateToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No valid token' });
        return;
      }

      res.status(200).json({
        success: true,
        valid: true,
        user: {
          deviceId: req.user.deviceId,
          sessionId: req.user.sessionId,
          type: req.user.type,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Token validation failed');
      res.status(500).json({
        error: 'Token validation failed',
      });
    }
  }

  /**
   * Logout device (invalidate session)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

  deviceService.endSession(req.user.sessionId);

      logger.info(
        { deviceId: req.user.deviceId, sessionId: req.user.sessionId },
        'Device logged out'
      );

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Logout failed');
      res.status(500).json({
        error: 'Logout failed',
      });
    }
  }
}
