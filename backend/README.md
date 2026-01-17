# 🚀 Twin Sensor Hub Backend

Real-time motion analysis and anomaly detection server for the Twin Sensor Hub project.

## 📋 Features

- ✅ Express.js REST API
- ✅ Socket.io real-time communication
- ✅ Device management and session tracking
- ✅ Sensor data buffering and validation
- ✅ TypeScript strict mode
- ✅ Comprehensive logging with Pino
- ✅ CORS support
- ✅ Error handling and validation
- ✅ Graceful shutdown

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Real-time**: Socket.io 4
- **Language**: TypeScript 5
- **Logging**: Pino
- **Validation**: Zod (ready)
- **Testing**: Vitest (ready)

## 📁 Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # Express + Socket.io setup
├── types/
│   └── index.ts         # Shared TypeScript types
├── services/
│   ├── device.service.ts    # Device management
│   ├── sensor.service.ts    # Sensor validation
│   └── index.ts            # Data buffer service
├── controllers/
│   └── index.ts         # API controllers
├── routes/
│   └── index.ts         # API routes
├── middleware/
│   └── index.ts         # Express middleware
├── models/              # Database models (ready)
└── utils/
    ├── config.ts        # Configuration
    ├── logger.ts        # Logger setup
    ├── constants.ts     # Constants
    └── index.ts         # Utilities
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install express socket.io cors dotenv uuid pino pino-pretty
npm install --save-dev @types/express @types/node @types/cors typescript ts-node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin vitest
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
NODE_ENV=development
HOST=localhost
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Device Management

#### Create Device
```bash
POST /api/devices
Content-Type: application/json

{
  "id": "device-uuid",
  "name": "My Device",
  "type": "phone",
  "osVersion": "iOS 17.2"
}
```

#### Get All Devices
```bash
GET /api/devices
```

#### Get Device by ID
```bash
GET /api/devices/:id
```

#### Update Device
```bash
PUT /api/devices/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "isOnline": true
}
```

#### Delete Device
```bash
DELETE /api/devices/:id
```

### Session Management

#### Create Session
```bash
POST /api/sessions
Content-Type: application/json

{
  "deviceId": "device-uuid"
}
```

#### Get Session
```bash
GET /api/sessions/:id
```

#### Get Device Sessions
```bash
GET /api/devices/:deviceId/sessions
```

#### End Session
```bash
DELETE /api/sessions/:id
```

### Sensor Data

#### Get Sensor Data
```bash
GET /api/devices/:deviceId/sensor-data?count=100
```

#### Get Buffer Statistics
```bash
GET /api/devices/:deviceId/buffer-stats
```

#### Clear Buffer
```bash
DELETE /api/devices/:deviceId/buffer
```

### Health Check
```bash
GET /api/health
```

## 🔌 Socket.io Events

### Connection Events

#### Client → Server

```javascript
// Connect device
emit('client:connect', {
  deviceId: 'device-uuid',
  sessionId: 'session-uuid',
  timestamp: Date.now()
})

// Send heartbeat
emit('client:heartbeat', {
  deviceId: 'device-uuid',
  sessionId: 'session-uuid',
  timestamp: Date.now()
})

// Send sensor data
emit('client:sensor:data', {
  deviceId: 'device-uuid',
  sessionId: 'session-uuid',
  sensorReading: {
    timestamp: Date.now(),
    accelerometer: { x: 0.5, y: -0.2, z: 9.8 },
    gyroscope: { x: 0.1, y: 0.05, z: -0.1 },
    magnetometer: { x: 20, y: 10, z: 40 },
    orientation: { alpha: 0, beta: 0, gamma: 0 }
  },
  performanceMetrics: {
    timestamp: Date.now(),
    cpu: 45,
    memory: 60,
    temperature: 35,
    fps: 60
  }
})

// Disconnect
emit('client:disconnect', {
  deviceId: 'device-uuid',
  sessionId: 'session-uuid',
  timestamp: Date.now()
})
```

#### Server → Client

```javascript
// Connected confirmation
'server:connected' → {
  sessionId: 'session-uuid',
  timestamp: Date.now()
}

// Sensor data received
'server:sensor:received' → {
  timestamp: Date.now()
}

// Heartbeat acknowledgment
'server:heartbeat:ack' → {
  timestamp: Date.now()
}

// Server error
'server:error' → {
  code: 'ERROR_CODE',
  message: 'Error description',
  recoverable: true/false
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `HOST` | localhost | Server host |
| `CORS_ORIGIN` | http://localhost:3000 | CORS allowed origins |
| `LOG_LEVEL` | info | Logger level (debug, info, warn, error) |
| `SOCKET_MAX_RECONNECTION_ATTEMPTS` | 10 | Max reconnection attempts |
| `SOCKET_RECONNECTION_DELAY_MS` | 1000 | Reconnection delay |
| `SESSION_TIMEOUT_MS` | 3600000 | Session timeout (1 hour) |
| `SENSOR_BUFFER_SIZE` | 1000 | Max sensor data buffer size |
| `SENSOR_CLEANUP_INTERVAL_MS` | 60000 | Buffer cleanup interval |

## 📊 Data Types

### Device
```typescript
interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'wearable';
  osVersion: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastConnected: Date;
  isOnline: boolean;
}
```

### Session
```typescript
interface DeviceSession {
  id: string;
  deviceId: string;
  sessionId: string;
  startedAt: Date;
  lastHeartbeat: Date;
  status: 'connected' | 'disconnected' | 'reconnecting';
  isActive: boolean;
}
```

### Sensor Reading
```typescript
interface SensorReading {
  timestamp: number;
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  magnetometer: { x: number; y: number; z: number };
  orientation: { alpha: number; beta: number; gamma: number };
}
```

## 📝 Logging

Logs are output to console with colors in development:

```
[2026-01-17 10:30:45] info: 🚀 Server running at http://localhost:3001
[2026-01-17 10:30:46] info: POST /api/devices 201 45ms
[2026-01-17 10:30:47] debug: Device created (device-uuid)
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 📦 Production Deployment

### Build
```bash
npm run build
```

### Run
```bash
PORT=3001 NODE_ENV=production npm start
```

### Docker (Optional)
```bash
docker build -t twinsensor-hub-backend .
docker run -p 3001:3001 twinsensor-hub-backend
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port
PORT=3002 npm run dev
```

### Socket.io connection fails
- Check CORS_ORIGIN matches frontend URL
- Verify firewall allows port 3001
- Check frontend Socket.io URL matches server

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Related Documentation

- [Frontend Guide](../frontend/README.md)
- [Type Definitions](./src/types/index.ts)
- [Socket.io Docs](https://socket.io/docs/)
- [Express.js Docs](https://expressjs.com/)

## 📄 License

MIT

## 👨‍💻 Author

Pancrace Dev
