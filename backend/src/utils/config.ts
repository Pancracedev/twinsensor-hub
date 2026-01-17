import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Socket.io
  socket: {
    maxReconnectionAttempts: parseInt(
      process.env.SOCKET_MAX_RECONNECTION_ATTEMPTS || '10',
      10
    ),
    reconnectionDelayMs: parseInt(
      process.env.SOCKET_RECONNECTION_DELAY_MS || '1000',
      10
    ),
  },

  // Logging
  logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',

  // CORS
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),

  // Session
  sessionTimeoutMs: parseInt(
    process.env.SESSION_TIMEOUT_MS || '3600000',
    10
  ),

  // Sensor Configuration
  sensor: {
    bufferSize: parseInt(process.env.SENSOR_BUFFER_SIZE || '1000', 10),
    cleanupIntervalMs: parseInt(
      process.env.SENSOR_CLEANUP_INTERVAL_MS || '60000',
      10
    ),
  },
};

export default config;
