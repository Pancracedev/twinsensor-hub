# 🔗 Frontend-Backend Integration Guide

## Overview

The Twin Sensor Hub now has a fully integrated frontend-backend system with real-time Socket.io communication.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React Components (Device, Sensors, Anomalies)       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │ Zustand Stores (device, sensor, anomaly, UI)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │ Socket.io Service (connect, emit, listen)           │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP + WebSocket
                          │ (localhost:3001)
┌─────────────────────────▼──────────────────────────────────┐
│                  Backend (Express + Socket.io)             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Socket.io Server (11 event handlers)                │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │ Services (Device, Sensor, DataBuffer)               │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │ REST API (15 endpoints)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Event Mapping

The frontend and backend communicate through standardized Socket.io events:

### Client → Server Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `client:connect` | `{ deviceId, sessionId, timestamp }` | Device connection handshake |
| `client:heartbeat` | `{ deviceId, timestamp }` | Keep-alive signal (30s interval) |
| `client:sensor:data` | `{ deviceId, data, timestamp }` | Stream sensor readings |
| `client:performance:metrics` | `{ deviceId, metrics, timestamp }` | Send performance data |
| `client:device:update` | `{ deviceId, updates, timestamp }` | Update device properties |
| `client:session:start` | `{ deviceId, sessionId, timestamp }` | Begin measurement session |
| `client:session:end` | `{ deviceId, sessionId, timestamp }` | End measurement session |

### Server → Client Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `server:connected` | `{ deviceId, sessionId, timestamp }` | Confirm connection established |
| `server:heartbeat:ack` | `{ timestamp, latency }` | Heartbeat acknowledgment |
| `server:sensor:received` | `{ readingId, status, timestamp }` | Confirm sensor data receipt |
| `server:performance:received` | `{ metricsId, status, timestamp }` | Confirm metrics receipt |
| `server:anomaly:detected` | `{ anomalyId, type, severity, timestamp }` | Alert on detected anomaly |
| `server:anomalies:batch` | `{ anomalies: [], timestamp }` | Batch anomaly report |
| `server:device:updated` | `{ deviceId, updates, timestamp }` | Device properties updated |
| `server:session:active` | `{ sessionId, isActive, timestamp }` | Session status update |
| `server:error` | `{ code, message, timestamp }` | Error notification |

## Frontend Constants

Located in `frontend/app/utils/constants.ts`:

```typescript
export const SOCKET_EVENTS = {
  // Client to Server
  CLIENT_CONNECT: 'client:connect',
  CLIENT_DISCONNECT: 'client:disconnect',
  CLIENT_HEARTBEAT: 'client:heartbeat',
  CLIENT_SENSOR_DATA: 'client:sensor:data',
  CLIENT_PERFORMANCE_METRICS: 'client:performance:metrics',

  // Server to Client
  SERVER_CONNECTED: 'server:connected',
  SERVER_DISCONNECTED: 'server:disconnected',
  SERVER_ERROR: 'server:error',
  SERVER_HEARTBEAT_ACK: 'server:heartbeat:ack',
  SERVER_SENSOR_RECEIVED: 'server:sensor:received',
  SERVER_PERFORMANCE_RECEIVED: 'server:performance:received',
  SERVER_ANOMALY_DETECTED: 'server:anomaly:detected',
  SERVER_ANOMALIES_BATCH: 'server:anomalies:batch',

  // Device events
  CLIENT_DEVICE_UPDATE: 'client:device:update',
  SERVER_DEVICE_UPDATED: 'server:device:updated',

  // Session events
  CLIENT_SESSION_START: 'client:session:start',
  CLIENT_SESSION_END: 'client:session:end',
  SERVER_SESSION_ACTIVE: 'server:session:active',
};
```

## Backend Socket.io Server

Located in `backend/src/server.ts`:

The backend initializes a Socket.io server that:

1. **Accepts connections** from frontend devices
2. **Manages device sessions** with UUID and timestamps
3. **Validates sensor data** before storing
4. **Broadcasts anomaly alerts** in real-time
5. **Handles heartbeat** signals for connection health
6. **Manages graceful disconnection** and cleanup

### Event Handlers

```typescript
socket.on('client:connect', (data) => {
  // Create device session
  // Validate deviceId
  // Emit server:connected response
});

socket.on('client:sensor:data', (data) => {
  // Validate sensor reading
  // Store in data buffer
  // Check for anomalies
  // Emit server:sensor:received
});

socket.on('client:heartbeat', (data) => {
  // Track latency
  // Emit server:heartbeat:ack
});

socket.on('disconnect', () => {
  // Clean up expired sessions
  // Log disconnection
});
```

## Frontend Integration Points

### Socket.io Service (`app/services/socket.service.ts`)

```typescript
// Connect to backend
await socketService.connect(deviceId);

// Emit event
socketService.emit('client:sensor:data', {
  deviceId,
  data: sensorReading,
  timestamp: Date.now(),
});

// Listen for event
socketService.on('server:sensor:received', (data) => {
  console.log('Server acknowledged:', data);
});

// Check connection status
if (socketService.isConnected()) {
  console.log('Connected to backend');
}
```

### Custom Hooks

1. **useDevice** - Device initialization and connection
2. **useSensorData** - Stream sensor readings
3. **usePerformanceMetrics** - Monitor device metrics
4. **useAnomalyDetection** - Real-time anomaly alerts
5. **useSocket** - Generic Socket.io listener hook

## Testing Integration

### Manual Testing Steps

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to Test Page**:
   ```
   http://localhost:3000/test
   ```

4. **Run Integration Tests**:
   - Click "Run Tests" button
   - Verify all tests pass:
     - ✓ Backend Connection
     - ✓ Socket.io Handshake
     - ✓ Server Response
     - ✓ Heartbeat

### API Endpoints for Testing

#### Health Check
```bash
curl http://localhost:3001/api/health
```

#### Create Device
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{ "name": "Test Device" }'
```

#### Get Device
```bash
curl http://localhost:3001/api/devices/{deviceId}
```

#### Create Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{ "deviceId": "{deviceId}" }'
```

#### Get Sensor Data
```bash
curl http://localhost:3001/api/sensors/data/{deviceId}
```

#### Get Buffer Stats
```bash
curl http://localhost:3001/api/sensors/buffer/{deviceId}
```

## Data Flow Example: Device Connection

### Step 1: Frontend Initialization
```
App loads → useDevice hook runs → generateDeviceId → Store in localStorage
```

### Step 2: User Clicks Connect
```
connect() → socketService.connect(deviceId)
→ Socket.io connects to ws://localhost:3001
→ Emit 'client:connect' event with deviceId
```

### Step 3: Backend Receives Connection
```
socket.on('client:connect') → Create device session
→ Validate deviceId → Store in DeviceService
→ Emit 'server:connected' response
```

### Step 4: Frontend Receives Confirmation
```
socket.on('server:connected') → Update deviceStore.connected
→ Start heartbeat interval → UI shows "Connected"
```

### Step 5: Heartbeat Loop (every 30 seconds)
```
Frontend: Emit 'client:heartbeat' with deviceId
↓
Backend: Receive, validate, emit 'server:heartbeat:ack'
↓
Frontend: Update latency metrics
```

## Data Flow Example: Sensor Streaming

### Step 1: Frontend Starts Streaming
```
Component mounts → useSensorData hook → Listen on 'server:sensor:received'
```

### Step 2: Sensor Data Generated
```
Browser receives accelerometer data from device sensors
→ parseAccelerometerData() → validate → 
→ Emit 'client:sensor:data' to backend
```

### Step 3: Backend Receives and Processes
```
socket.on('client:sensor:data') →
Validate with SensorService →
Store in DataBufferService →
Check for anomalies →
Emit 'server:sensor:received' confirmation
```

### Step 4: Frontend Updates UI
```
socket.on('server:sensor:received') →
Update sensorStore with latest reading →
Add to data buffer for charts →
Update performance metrics
```

### Step 5: Anomaly Detection (if triggered)
```
Backend detects anomaly →
Emit 'server:anomaly:detected' event →
Frontend receives → 
Add to anomalyStore →
UI shows alert and adds to anomaly history
```

## Error Handling

### Connection Errors
- Frontend: `connect_error` event triggers UI error state
- Backend: Logs error and closes connection
- User: Sees error message and can retry

### Validation Errors
- Frontend: Invalid data caught by `SensorService.isValidReading()`
- Backend: Request validation middleware rejects bad data
- Response: 400 Bad Request with error details

### Session Errors
- Expired sessions cleaned up by backend (1 hour TTL)
- Orphaned connections detected and terminated
- Heartbeat failures trigger reconnection

### Server Errors
- 500 errors sent via `server:error` event
- Frontend catches and displays to user
- Automatic reconnection after backoff

## Performance Considerations

### Frontend Optimizations
- Sensor data buffered locally before sending
- Batched updates reduce re-renders
- Zustand stores for efficient state management
- Socket.io reconnection with exponential backoff

### Backend Optimizations
- In-memory data buffer (configurable size)
- Session cleanup on disconnect
- Event validation before processing
- Async anomaly detection

### Network Optimizations
- WebSocket transport for real-time updates
- Heartbeat interval: 30 seconds
- Session timeout: 1 hour
- Buffer trimming: auto-cleanup old data

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: `Error: Failed to connect to backend`

**Solutions**:
1. Check backend is running: `npm run dev` in backend folder
2. Verify backend URL in `.env.local`: `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`
3. Check CORS settings in backend: Should allow `http://localhost:3000`
4. Check firewall: Port 3001 must be accessible

### Events Not Received

**Problem**: Socket connected but no events received

**Solutions**:
1. Verify event names match (case-sensitive)
2. Check console for emit/on logs
3. Verify listener registered before event emission
4. Check Socket.io version compatibility (4.7+)

### High Latency

**Problem**: Heartbeat latency > 100ms

**Solutions**:
1. Check network conditions
2. Reduce sensor data send frequency
3. Profile backend with `NODE_DEBUG=* npm run dev`
4. Check CPU/Memory usage

### Session Timeout

**Problem**: "Session expired" error after 1 hour

**Solutions**:
1. Reconnect device: Click disconnect then connect
2. Extend session TTL in backend config
3. Implement session refresh token

## Next Steps

1. **Implement Database Layer**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Add Authentication**: JWT tokens for device identification
3. **Implement Offline Mode**: Queue events when disconnected
4. **Add Data Persistence**: Store sensor readings in database
5. **Real Sensor Integration**: Connect to actual device sensors
6. **Performance Dashboard**: Track metrics over time

## References

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Express.js Guide](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
