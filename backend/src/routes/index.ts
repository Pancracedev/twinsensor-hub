import { Router } from 'express';
import { deviceController, sessionController, sensorController } from '../controllers/index.js';

const router = Router();

// ============================================================================
// Device Routes
// ============================================================================

/**
 * POST /api/devices
 * Create a new device
 */
router.post('/devices', deviceController.createDevice);

/**
 * GET /api/devices
 * Get all devices
 */
router.get('/devices', deviceController.getAllDevices);

/**
 * GET /api/devices/:id
 * Get device by ID
 */
router.get('/devices/:id', deviceController.getDevice);

/**
 * PUT /api/devices/:id
 * Update device
 */
router.put('/devices/:id', deviceController.updateDevice);

/**
 * DELETE /api/devices/:id
 * Delete device
 */
router.delete('/devices/:id', deviceController.deleteDevice);

// ============================================================================
// Session Routes
// ============================================================================

/**
 * POST /api/sessions
 * Create new session
 */
router.post('/sessions', sessionController.createSession);

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
router.get('/sessions/:id', sessionController.getSession);

/**
 * GET /api/devices/:deviceId/sessions
 * Get sessions for device
 */
router.get('/devices/:deviceId/sessions', sessionController.getDeviceSessions);

/**
 * DELETE /api/sessions/:id
 * End session
 */
router.delete('/sessions/:id', sessionController.endSession);

// ============================================================================
// Sensor Data Routes
// ============================================================================

/**
 * GET /api/devices/:deviceId/sensor-data
 * Get sensor data for device
 */
router.get('/devices/:deviceId/sensor-data', sensorController.getSensorData);

/**
 * GET /api/devices/:deviceId/buffer-stats
 * Get buffer statistics
 */
router.get('/devices/:deviceId/buffer-stats', sensorController.getBufferStats);

/**
 * DELETE /api/devices/:deviceId/buffer
 * Clear device buffer
 */
router.delete('/devices/:deviceId/buffer', sensorController.clearBuffer);

// ============================================================================
// Health Check
// ============================================================================

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
