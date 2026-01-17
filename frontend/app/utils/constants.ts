/**
 * Application Constants
 * Configuration values for the entire application
 */

export const APP_CONFIG = {
  // Socket.io configuration
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  SOCKET_RECONNECT_DELAY: 1000,
  SOCKET_RECONNECT_DELAYMAX: 5000,
  SOCKET_RECONNECT_ATTEMPTS: 10,

  // Device storage keys
  DEVICE_ID_STORAGE_KEY: 'twin-sensor:device-id',
  DEVICE_SESSION_STORAGE_KEY: 'twin-sensor:session-id',

  // Features
  ENABLE_NOTIFICATIONS: true,
  ENABLE_BACKGROUND_SYNC: true,
};

export const SOCKET_EVENTS = {
  // Client to Server
  DEVICE_CONNECT: 'device:connect',
  DEVICE_DISCONNECT: 'device:disconnect',
  DEVICE_HEARTBEAT: 'device:heartbeat',

  // Server to Client
  DEVICE_CONNECTED: 'device:connected',
  DEVICE_DISCONNECTED: 'device:disconnected',
  SERVER_ERROR: 'server:error',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
