# Twin Sensor Hub

> A Progressive Web App for monitoring and managing twin sensors with real-time data synchronization, 3D visualization, and advanced anomaly detection.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

---

## 🎯 Features

### Frontend (Vercel)
- ✅ **3D Phone Visualization** - Real-time 3D model with Three.js gyroscope synchronization
- ✅ **Mobile Sensors** - Access to DeviceOrientation and DeviceMotion APIs
- ✅ **Real-time Updates** - Socket.io integration for instant data synchronization
- ✅ **Progressive Web App** - Installable, works offline with service workers
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS
- ✅ **Authentication** - JWT-based device registration and session management

### Backend (Railway)
- ✅ **JWT Authentication** - Secure token generation, validation, and refresh
- ✅ **REST API** - Full CRUD operations for device management
- ✅ **MongoDB Integration** - Persistent data storage with Mongoose ORM
- ✅ **Socket.io Server** - Real-time bidirectional communication
- ✅ **Repository Pattern** - Clean architecture with DeviceRepository and SensorReadingRepository
- ✅ **Error Handling** - Comprehensive error management and logging

---

## 📦 Project Structure

```
twinsensor-hub/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   ├── services/                 # Business logic
│   │   ├── repositories/             # Data access layer
│   │   ├── models/                   # MongoDB schemas
│   │   ├── middleware/               # Auth & validation
│   │   ├── database/                 # DB configuration
│   │   ├── utils/                    # Utilities & constants
│   │   └── index.ts                  # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js web application
│   ├── app/
│   │   ├── components/               # React components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API & Socket.io clients
│   │   ├── stores/                   # Zustand state management
│   │   ├── types/                    # TypeScript definitions
│   │   ├── utils/                    # Helper functions
│   │   ├── (dashboard)/              # Dashboard routes
│   │   └── layout.tsx                # Root layout
│   ├── public/                       # Static assets
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Pancracedev/twinsensor-hub.git
cd twinsensor-hub
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URL and JWT_SECRET
npm start
```

Backend runs on `http://localhost:3001`

**3. Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env.local`:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=7d
MONGO_URL=mongodb://localhost:27017/twinsensor
SOCKET_RECONNECT_DELAY=1000
SOCKET_RECONNECT_DELAYMAX=5000
SOCKET_RECONNECT_ATTEMPTS=5
```

### Frontend Environment Variables
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Production (Vercel + Railway)

**Railway Backend:**
1. Set environment variables in Railway Dashboard:
   - `JWT_SECRET` - Secure random string (32+ chars)
   - `MONGO_URL` - MongoDB Atlas connection string
   - `NODE_ENV=production`

**Vercel Frontend:**
1. Set environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_API_URL` - Railway backend URL
   - `NEXT_PUBLIC_SOCKET_URL` - Railway backend URL

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new device |
| POST | `/api/auth/refresh` | Refresh authentication token |
| GET | `/api/auth/validate` | Validate current token |
| POST | `/api/auth/logout` | Logout device |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

---

## 🔌 Real-time Events (Socket.io)

### Client → Server
- `device:connect` - Register device connection
- `device:heartbeat` - Send periodic heartbeat
- `sensor:reading` - Send sensor data

### Server → Client
- `device:connected` - Device registration confirmed
- `device:disconnected` - Device disconnected
- `sensor:update` - New sensor data available

---

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```

### Device Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-001",
    "deviceName": "iPhone 13",
    "osType": "iOS"
  }'
```

---

## 📱 Mobile Testing

### Access on Local Network
```bash
# Find your machine IP
hostname -I

# On mobile phone, navigate to:
http://<YOUR_IP>:3000
```

### Required Permissions (iOS/Android)
- Camera (optional)
- Motion & Orientation sensors
- Location (optional)

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript 5.6, Tailwind CSS, Zustand, Socket.io-client, Three.js
- **Backend**: Express.js 5.2, TypeScript 5.3, Socket.io 4.8, Mongoose, JWT
- **Database**: MongoDB 6.0
- **DevOps**: Vercel (frontend), Railway (backend)

### Design Patterns
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic separation
- **Lazy Initialization** - SSR-safe service instantiation
- **Zustand Stores** - Lightweight state management
- **Custom Hooks** - Reusable React logic

---

## 📊 Database Schema

### Device Collection
```typescript
{
  _id: ObjectId,
  deviceId: string,
  deviceName: string,
  osType: "iOS" | "Android" | "Web",
  isActive: boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SensorReading Collection
```typescript
{
  _id: ObjectId,
  deviceId: string,
  accelerometer: { x: number, y: number, z: number },
  gyroscope: { x: number, y: number, z: number },
  magnetometer: { x: number, y: number, z: number },
  isAnomaly: boolean,
  timestamp: Date,
  createdAt: Date
}
```

---

## 🔒 Security

- ✅ JWT-based authentication
- ✅ CORS protection with whitelist
- ✅ Environment variable isolation
- ✅ MongoDB connection pooling
- ✅ Helmet.js for HTTP headers
- ✅ Input validation middleware

---

## 📈 Performance Optimizations

- 🚀 Code splitting with Next.js dynamic imports
- 🚀 Image optimization with Next.js Image component
- 🚀 Database indexing on frequently queried fields
- 🚀 Connection pooling for MongoDB
- 🚀 Real-time updates via WebSocket (Socket.io)
- 🚀 Service worker for offline capabilities

---

## 🐛 Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Update `backend/src/index.ts` CORS whitelist with your frontend URL.

### Socket.io Connection Failed
```
WebSocket connection to 'ws://localhost:3001' failed
```
**Solution**: Ensure backend is running and CORS is properly configured. Check Network tab in DevTools.

### MongoDB Connection Error
```
MongoNetworkError: connect ECONNREFUSED
```
**Solution**: Verify MongoDB is running. Check `MONGO_URL` in environment variables.

---

## 📝 Git Workflow

### Branches
- `main` - Production-ready code
- `feature/phase-1-project-setup` - Development branch

### Commit Convention
```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- 📧 Email: support@twinsensorhub.dev
- 🐛 Issues: [GitHub Issues](https://github.com/Pancracedev/twinsensor-hub/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Pancracedev/twinsensor-hub/discussions)

---

## 🙏 Acknowledgments

- Three.js for 3D visualization
- Socket.io for real-time communication
- Mongoose for MongoDB ORM
- Next.js team for the amazing framework

---

**Last Updated**: January 18, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
