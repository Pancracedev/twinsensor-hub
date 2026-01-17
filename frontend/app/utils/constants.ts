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

  // Phase 2: Sensor data events
  DATA_REQUEST_STREAM: 'data:request-stream',
  DATA_STOP_STREAM: 'data:stop-stream',
  SENSOR_ACCELEROMETER: 'sensor:accelerometer',
  SENSOR_GYROSCOPE: 'sensor:gyroscope',
  SENSOR_MAGNETOMETER: 'sensor:magnetometer',
  DEVICE_PERFORMANCE: 'device:performance',

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

// Phase 2: Sensor configuration
export const SENSOR_CONFIG = {
  // Data buffer (keep last 60 seconds)
  BUFFER_DURATION: 60000, // ms
  MAX_BUFFER_SIZE: 6000, // 60s @ 100Hz

  // Sample rates (Hz)
  DEFAULT_SAMPLE_RATE: 60,
  HIGH_SAMPLE_RATE: 100,
  LOW_SAMPLE_RATE: 30,

  // Real-time display
  CHART_DISPLAY_WINDOW: 30000, // 30 seconds
  CHART_MAX_POINTS: 300,
  CHART_DOWNSAMPLE_FACTOR: 1,

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    CPU_WARNING: 75,
    CPU_CRITICAL: 90,
    MEMORY_WARNING: 80,
    MEMORY_CRITICAL: 95,
    TEMPERATURE_WARNING: 60,
    TEMPERATURE_CRITICAL: 80,
  },

  // Connection quality
  ACCEPTABLE_LATENCY: 100, // ms
  ACCEPTABLE_DATA_LOSS: 0.05, // 5%

  // 3D Visualization
  ANIMATION_FRAME_TARGET: 60, // FPS
  QUATERNION_LERP_FACTOR: 0.1, // Smooth interpolation
};
