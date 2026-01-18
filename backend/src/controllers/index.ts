import { Request, Response } from 'express';
import deviceService from '../services/device.service.js';
import dataBufferService from '../services/index.js';
import logger from '../utils/logger.js';
import {
  formatSuccessResponse,
  formatErrorResponse,
} from '../utils/index.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';
import { getStringParam, getNumberQuery } from '../utils/request-helpers.js';

/**
 * Device Controller
 */
export const deviceController = {
  /**
   * Create new device
   */
  createDevice: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, name, type, osVersion } = req.body;

      if (!id || !name || !type) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatErrorResponse(ERROR_CODES.INVALID_REQUEST, 'Missing required fields')
        );
        return;
      }

      const device = deviceService.createDevice(id, name, type, osVersion);

      res.status(HTTP_STATUS.CREATED).json(
        formatSuccessResponse(device, 'Device created successfully')
      );
    } catch (error) {
      logger.error({ error }, 'Error creating device');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to create device')
      );
    }
  },

  /**
   * Get device by ID
   */
  getDevice: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const device = deviceService.getDevice(id);

      if (!device) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          formatErrorResponse(ERROR_CODES.DEVICE_NOT_FOUND, 'Device not found')
        );
        return;
      }

      res.json(formatSuccessResponse(device));
    } catch (error) {
      logger.error({ error }, 'Error fetching device');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch device')
      );
    }
  },

  /**
   * Get all devices
   */
  getAllDevices: async (_req: Request, res: Response): Promise<void> => {
    try {
      const devices = deviceService.getAllDevices();
      res.json(
        formatSuccessResponse({
          devices,
          total: devices.length,
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error fetching devices');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch devices')
      );
    }
  },

  /**
   * Update device
   */
  updateDevice: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getStringParam(req.params.id);
      const updates = req.body;

      const device = deviceService.updateDevice(id, updates);

      if (!device) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          formatErrorResponse(ERROR_CODES.DEVICE_NOT_FOUND, 'Device not found')
        );
        return;
      }

      res.json(formatSuccessResponse(device, 'Device updated successfully'));
    } catch (error) {
      logger.error({ error }, 'Error updating device');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to update device')
      );
    }
  },

  /**
   * Delete device
   */
  deleteDevice: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getStringParam(req.params.id);
      const deleted = deviceService.deleteDevice(id);

      if (!deleted) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          formatErrorResponse(ERROR_CODES.DEVICE_NOT_FOUND, 'Device not found')
        );
        return;
      }

      res.json(formatSuccessResponse(null, 'Device deleted successfully'));
    } catch (error) {
      logger.error({ error }, 'Error deleting device');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to delete device')
      );
    }
  },
};

/**
 * Session Controller
 */
export const sessionController = {
  /**
   * Create session
   */
  createSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { deviceId } = req.body;

      if (!deviceId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatErrorResponse(ERROR_CODES.INVALID_REQUEST, 'deviceId is required')
        );
        return;
      }

      const session = deviceService.createSession(deviceId);

      res.status(HTTP_STATUS.CREATED).json(
        formatSuccessResponse(session, 'Session created successfully')
      );
    } catch (error) {
      logger.error({ error }, 'Error creating session');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to create session')
      );
    }
  },

  /**
   * Get session
   */
  getSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getStringParam(req.params.id);
      const session = deviceService.getSession(id);

      if (!session) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          formatErrorResponse(ERROR_CODES.SESSION_NOT_FOUND, 'Session not found')
        );
        return;
      }

      res.json(formatSuccessResponse(session));
    } catch (error) {
      logger.error({ error }, 'Error fetching session');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch session')
      );
    }
  },

  /**
   * Get device sessions
   */
  getDeviceSessions: async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceId = getStringParam(req.params.deviceId);
      const sessions = deviceService.getDeviceSessions(deviceId);

      res.json(
        formatSuccessResponse({
          sessions,
          total: sessions.length,
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error fetching sessions');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch sessions')
      );
    }
  },

  /**
   * End session
   */
  endSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getStringParam(req.params.id);
      const session = deviceService.endSession(id);

      if (!session) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          formatErrorResponse(ERROR_CODES.SESSION_NOT_FOUND, 'Session not found')
        );
        return;
      }

      res.json(formatSuccessResponse(session, 'Session ended successfully'));
    } catch (error) {
      logger.error({ error }, 'Error ending session');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to end session')
      );
    }
  },
};

/**
 * Sensor Controller
 */
export const sensorController = {
  /**
   * Get sensor data
   */
  getSensorData: async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceId = getStringParam(req.params.deviceId);
      const count = getNumberQuery(req.query.count);

      const data = dataBufferService.getData(
        deviceId,
        count
      );

      res.json(
        formatSuccessResponse({
          data,
          total: data.length,
        })
      );
    } catch (error) {
      logger.error({ error }, 'Error fetching sensor data');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch sensor data')
      );
    }
  },

  /**
   * Get buffer statistics
   */
  getBufferStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceId = getStringParam(req.params.deviceId);
      const stats = dataBufferService.getBufferStats(deviceId);

      res.json(formatSuccessResponse(stats));
    } catch (error) {
      logger.error({ error }, 'Error fetching buffer stats');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch buffer stats')
      );
    }
  },

  /**
   * Clear buffer
   */
  clearBuffer: async (req: Request, res: Response): Promise<void> => {
    try {
      const deviceId = getStringParam(req.params.deviceId);
      dataBufferService.clearDeviceBuffer(deviceId);

      res.json(
        formatSuccessResponse(null, 'Buffer cleared successfully')
      );
    } catch (error) {
      logger.error({ error }, 'Error clearing buffer');
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatErrorResponse(ERROR_CODES.INTERNAL_ERROR, 'Failed to clear buffer')
      );
    }
  },
};
