export const SOCKET_EVENTS = {
  // Connection events
  CLIENT_CONNECT: 'client:connect',
  CLIENT_DISCONNECT: 'client:disconnect',
  SERVER_CONNECTED: 'server:connected',
  SERVER_DISCONNECTED: 'server:disconnected',
  SERVER_ERROR: 'server:error',

  // Heartbeat events
  CLIENT_HEARTBEAT: 'client:heartbeat',
  SERVER_HEARTBEAT_ACK: 'server:heartbeat:ack',

  // Sensor events
  CLIENT_SENSOR_DATA: 'client:sensor:data',
  CLIENT_PERFORMANCE_METRICS: 'client:performance:metrics',
  SERVER_SENSOR_RECEIVED: 'server:sensor:received',
  SERVER_PERFORMANCE_RECEIVED: 'server:performance:received',

  // Anomaly events
  SERVER_ANOMALY_DETECTED: 'server:anomaly:detected',
  SERVER_ANOMALIES_BATCH: 'server:anomalies:batch',

  // Device events
  CLIENT_DEVICE_UPDATE: 'client:device:update',
  SERVER_DEVICE_UPDATED: 'server:device:updated',

  // Session events
  CLIENT_SESSION_START: 'client:session:start',
  CLIENT_SESSION_END: 'client:session:end',
  SERVER_SESSION_ACTIVE: 'server:session:active',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  DEVICE_ALREADY_EXISTS: 'DEVICE_ALREADY_EXISTS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SOCKET_CONNECTION_FAILED: 'SOCKET_CONNECTION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;
