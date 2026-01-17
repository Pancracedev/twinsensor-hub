import express, { Express } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import config from './utils/config.js';
import logger from './utils/logger.js';
import apiRoutes from './routes/index.js';
import {
  loggingMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware/index.js';
import deviceService from './services/device.service.js';
import dataBufferService from './services/index.js';
import { SOCKET_EVENTS } from './utils/constants.js';
import type {
  SocketConnectionEvent,
  SocketHeartbeat,
  SensorDataPoint,
} from './types/index.js';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// ============================================================================
// Express Middleware
// ============================================================================

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// ============================================================================
// Routes
// ============================================================================

app.use('/api', apiRoutes);

// ============================================================================
// Socket.io Event Handlers
// ============================================================================

io.on('connection', (socket: Socket) => {
  logger.info({ socketId: socket.id }, 'Client connected');

  /**
   * Handle client connection
   */
  socket.on(SOCKET_EVENTS.CLIENT_CONNECT, (event: SocketConnectionEvent) => {
    try {
      const { deviceId, sessionId } = event;

      logger.info(
        { socketId: socket.id, deviceId, sessionId },
        'Client device connected'
      );

      // Create or update device
      deviceService.createDevice(deviceId, `Device ${deviceId}`, 'phone', 'Unknown');
      deviceService.setDeviceOnline(deviceId, true);

      // Create or retrieve session
      let session = deviceService.getSession(sessionId);
      if (!session) {
        session = deviceService.createSession(deviceId);
      }

      // Join socket to room
      socket.join(deviceId);

      // Send connected confirmation
      socket.emit(SOCKET_EVENTS.SERVER_CONNECTED, {
        sessionId: session.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error({ error, socketId: socket.id }, 'Error handling client connect');
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, {
        code: 'CONNECTION_ERROR',
        message: 'Failed to establish connection',
        recoverable: true,
      });
    }
  });

  /**
   * Handle sensor data
   */
  socket.on(SOCKET_EVENTS.CLIENT_SENSOR_DATA, (data: SensorDataPoint) => {
    try {
      const { deviceId, sessionId } = data;

      // Update session heartbeat
      const session = deviceService.getSession(sessionId);
      if (session) {
        deviceService.updateSessionHeartbeat(sessionId);
      }

      // Store sensor data
      dataBufferService.addData(deviceId, data);

      // Acknowledge receipt
      socket.emit(SOCKET_EVENTS.SERVER_SENSOR_RECEIVED, {
        timestamp: Date.now(),
      });

      // Broadcast to other connected clients for this device
      io.to(deviceId).emit(SOCKET_EVENTS.SERVER_SENSOR_RECEIVED, {
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error(
        { error, socketId: socket.id },
        'Error handling sensor data'
      );
    }
  });

  /**
   * Handle heartbeat
   */
  socket.on(SOCKET_EVENTS.CLIENT_HEARTBEAT, (event: SocketHeartbeat) => {
    try {
      const { sessionId } = event;

      // Update session heartbeat
      if (sessionId) {
        deviceService.updateSessionHeartbeat(sessionId);
      }

      // Send heartbeat acknowledgment
      socket.emit(SOCKET_EVENTS.SERVER_HEARTBEAT_ACK, {
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error(
        { error, socketId: socket.id },
        'Error handling heartbeat'
      );
    }
  });

  /**
   * Handle disconnection
   */
  socket.on(SOCKET_EVENTS.CLIENT_DISCONNECT, (event?: any) => {
    try {
      const deviceId = event?.deviceId;
      const sessionId = event?.sessionId;

      logger.info(
        { socketId: socket.id, deviceId, sessionId },
        'Client disconnected'
      );

      // Update device offline status
      if (deviceId) {
        deviceService.setDeviceOnline(deviceId, false);
      }

      // End session
      if (sessionId) {
        deviceService.endSession(sessionId);
      }

      socket.leave(deviceId || '');
    } catch (error) {
      logger.error(
        { error, socketId: socket.id },
        'Error handling disconnect'
      );
    }
  });

  /**
   * Handle socket disconnection
   */
  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Socket disconnected');
  });

  /**
   * Handle errors
   */
  socket.on('error', (error: any) => {
    logger.error({ error, socketId: socket.id }, 'Socket error');
  });
});

// ============================================================================
// Error Handling
// ============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// Cleanup
// ============================================================================

setInterval(() => {
  const cleaned = deviceService.cleanupExpiredSessions(config.sessionTimeoutMs);
  if (cleaned > 0) {
    logger.debug({ count: cleaned }, 'Cleaned up expired sessions');
  }
}, 30000);

// ============================================================================
// Server Start
// ============================================================================

export function startServer(): void {
  httpServer.listen(config.port, config.host, () => {
    logger.info(
      { port: config.port, host: config.host },
      `🚀 Server running at http://${config.host}:${config.port}`
    );
    logger.info(
      { url: `http://${config.host}:${config.port}/api/health` },
      'Health check available'
    );
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, httpServer, io };
