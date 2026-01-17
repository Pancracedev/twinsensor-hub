# Phase 2: Real-time Monitoring - Implementation Plan

**Status**: Starting Implementation  
**Branch**: `feature/phase-2-realtime-monitoring`  
**Estimated Duration**: 2-3 hours  
**Complexity**: Medium  

---

## 🎯 Phase 2 Objectives

Transform the Phase 1 foundation into a fully functional real-time monitoring system that:
1. ✅ Receives live sensor data from connected devices
2. ✅ Displays real-time motion analytics (accelerometer, gyroscope)
3. ✅ Visualizes 3D device orientation using Three.js
4. ✅ Plots sensor data trends with Recharts
5. ✅ Handles high-frequency data streams efficiently
6. ✅ Provides responsive, smooth visualizations

---

## 📦 Dependencies to Install

```bash
npm install recharts three zustand-immer lucide-react
npm install --save-dev @types/three
```

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^2.10.0 | Real-time charts and graphs |
| `three` | ^r128 | 3D device orientation visualization |
| `zustand-immer` | ^1.1.0 | Immer middleware for mutable state |
| `lucide-react` | ^0.308.0 | Icon library for gauges |

---

## 🏗️ Architecture Overview

### Data Flow: Backend → Frontend → UI

```
Device Sensors
    ↓
Backend (WebSocket)
    ↓
Socket.io Events
    ↓
useSocket Hook
    ↓
sensorStore (Zustand + Immer)
    ↓
Components (Charts, 3D Model)
    ↓
Visual Display
```

### New Store: Sensor Data Management

```typescript
sensorStore {
  // Raw sensor data (last 100 readings)
  accelerometerData: AccelerometerReading[]
  gyroscopeData: GyroscopeReading[]
  
  // Current values (for gauges)
  currentAcceleration: Vector3
  currentRotation: Vector3
  
  // Metrics
  maxAcceleration: number
  averageAcceleration: number
  
  // State flags
  isReceivingData: boolean
  lastDataTimestamp: number
  dataFrequency: number (Hz)
}
```

---

## 📋 Implementation Steps

### Step 1: Create Socket Events & Types
**File**: `app/types/sensor.types.ts`

```typescript
interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  magnitude: number;
}

interface GyroscopeReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}
```

**File**: `app/utils/constants.ts` (extend)
- Add `SENSOR_EVENTS` constants
- Add `CHART_CONFIG` (colors, refresh rates)

---

### Step 2: Create Sensor Data Store
**File**: `app/stores/sensorStore.ts`

Use Zustand with Immer middleware for efficient state updates:

```typescript
interface SensorState {
  // Data buffers
  accelerometerData: AccelerometerReading[]
  gyroscopeData: GyroscopeReading[]
  
  // Current values
  currentAcceleration: Vector3
  currentRotation: Vector3
  
  // Computed metrics
  maxAcceleration: number
  averageAcceleration: number
  isReceivingData: boolean
  
  // Actions
  addAccelerometerReading(reading: AccelerometerReading): void
  addGyroscopeReading(reading: GyroscopeReading): void
  clearData(): void
}
```

**Key Feature**: Auto-trim buffers to last 500 readings

---

### Step 3: Create Sensor Data Service
**File**: `app/services/sensor.service.ts`

Calculations and data processing:

```typescript
class SensorService {
  calculateMagnitude(x, y, z): number
  calculateStats(readings): { max, avg, min }
  formatChartData(readings): ChartPoint[]
  normalize(value, max): number (0-1)
}
```

---

### Step 4: Create Monitoring Components

#### Dashboard Components (`app/components/monitoring/`)

1. **`SensorGauge.tsx`**
   - Circular gauge showing current acceleration
   - Color coding (green/yellow/red)
   - Real-time needle animation

2. **`AccelerationChart.tsx`**
   - Line chart with 3-axis display
   - Real-time data streaming
   - Customizable time window

3. **`RotationChart.tsx`**
   - Angular velocity visualization
   - Gyroscope data display
   - Degree indicators

4. **`Device3DModel.tsx`**
   - Three.js 3D representation
   - Real-time rotation
   - Material design

5. **`SensorMetrics.tsx`**
   - Stats cards (max, avg, current)
   - Data frequency display
   - Connection quality

6. **`SensorLegend.tsx`**
   - Color-coded axes (X/Y/Z)
   - Units and scale info

---

### Step 5: Create Sensor Hooks
**File**: `app/hooks/useSensor.ts`

```typescript
export const useSensor = () => {
  // Listen to 'sensor:acceleration' event
  // Listen to 'sensor:rotation' event
  // Update sensorStore
  // Return: { acceleration, rotation, stats, isReceiving }
}
```

---

### Step 6: Create Dashboard Page
**File**: `app/(dashboard)/dashboard/page.tsx` (update)

Layout:
```
Header (Device Status)
├── Left Column (50%)
│   ├── 3D Device Model
│   └── Sensor Metrics
├── Right Column (50%)
│   ├── Acceleration Chart
│   └── Rotation Chart
└── Footer (Controls & Status)
```

---

## 📊 Expected Socket.io Events

### From Backend to Frontend

```typescript
// Acceleration event (High frequency: 50-100Hz)
socket.on('sensor:acceleration', (data) => {
  {
    x: number,
    y: number,
    z: number,
    timestamp: number
  }
});

// Rotation event (Moderate frequency: 25-50Hz)
socket.on('sensor:rotation', (data) => {
  {
    x: number,
    y: number,
    z: number,
    timestamp: number
  }
});

// Connection quality event
socket.on('sensor:quality', (data) => {
  {
    dataFrequency: number (Hz),
    latency: number (ms),
    packetLoss: number (%)
  }
});
```

---

## 🎨 UI/UX Design

### Color Scheme
- **X-Axis**: Red (#ef4444)
- **Y-Axis**: Green (#22c55e)
- **Z-Axis**: Blue (#3b82f6)
- **Alert**: Yellow (#eab308) / Orange (#f97316)
- **Critical**: Red (#dc2626)

### Responsive Grid
```
Desktop (1920px+):
[3D Model (40%) | Metrics (20%) | Charts (40%)]

Tablet (1024px):
[3D Model (50%)]
[Acceleration Chart (100%)]
[Rotation Chart (100%)]

Mobile (640px):
[Metrics (100%)]
[3D Model (100%)]
[Charts (100%)]
```

---

## ⚡ Performance Optimization

### Data Buffer Management
- **Max Buffer Size**: 500 readings per sensor
- **Auto-trim**: Remove oldest when exceed 500
- **Memory Efficient**: ~2-3MB for full buffers

### Chart Optimization
- **Recharts Config**: `isAnimationActive={false}` for real-time
- **Update Frequency**: 1000/30 = ~33ms (30 FPS)
- **Re-render Batching**: Debounce store updates

### 3D Model Performance
- **LOD**: Simple geometry (rotate, no animation)
- **Frame Rate**: 60 FPS target
- **Update**: Only on rotation change

---

## 🔧 Implementation Phases (Sub-commits)

### Phase 2.1: Types & Constants
- Create `sensor.types.ts`
- Extend `constants.ts`
- Create `sensor.service.ts`

### Phase 2.2: State Management
- Create `sensorStore.ts` with Immer
- Implement buffer management
- Add computed selectors

### Phase 2.3: Base Components
- `SensorGauge.tsx`
- `SensorLegend.tsx`
- `SensorMetrics.tsx`

### Phase 2.4: Chart Components
- `AccelerationChart.tsx`
- `RotationChart.tsx`
- Integrate Recharts

### Phase 2.5: 3D Component
- `Device3DModel.tsx`
- Three.js setup
- Rotation sync

### Phase 2.6: Monitoring Page
- Update dashboard layout
- Integrate all components
- Add real-time hooks

### Phase 2.7: Optimization & Polish
- Performance tuning
- Error handling
- Mobile responsiveness

---

## 📝 File Checklist

```
app/
├── types/
│   ├── sensor.types.ts          [NEW]
│   └── index.ts                 [UPDATE]
├── services/
│   ├── sensor.service.ts        [NEW]
│   └── index.ts                 [UPDATE]
├── stores/
│   ├── sensorStore.ts           [NEW]
│   └── index.ts                 [UPDATE]
├── hooks/
│   ├── useSensor.ts             [NEW]
│   └── index.ts                 [UPDATE]
├── components/
│   ├── monitoring/              [NEW FOLDER]
│   │   ├── SensorGauge.tsx
│   │   ├── AccelerationChart.tsx
│   │   ├── RotationChart.tsx
│   │   ├── Device3DModel.tsx
│   │   ├── SensorMetrics.tsx
│   │   ├── SensorLegend.tsx
│   │   └── index.ts
│   └── index.ts                 [UPDATE]
└── (dashboard)/
    └── dashboard/page.tsx       [UPDATE]
```

---

## ✅ Testing Strategy

### Unit Tests
- [ ] Sensor calculations (magnitude, stats)
- [ ] Data buffer management
- [ ] Store updates

### Integration Tests
- [ ] Socket.io event handling
- [ ] Real-time data flow
- [ ] UI updates on data arrival

### Performance Tests
- [ ] High-frequency data (100Hz+)
- [ ] Memory usage with full buffers
- [ ] Chart rendering performance
- [ ] 3D model frame rate

### Manual Testing
- [ ] Desktop responsiveness
- [ ] Mobile responsiveness
- [ ] Real device connection
- [ ] Error recovery

---

## 🚀 Build & Deployment

### Build Command
```bash
npm run build
```

Expected: ✅ Passes without errors

### Bundle Size Impact
- Recharts: ~80KB (gzipped)
- Three.js: ~100KB (gzipped)
- Total Phase 2: ~180KB

### Performance Metrics
- First Paint: < 2s
- Interactive: < 3.5s
- Largest Paint: < 4s

---

## 📚 Documentation

Files to create:
- `PHASE-2-PLAN.md` ← This file
- `PHASE-2-IMPLEMENTATION.md` - Step-by-step guide
- `SENSOR-INTEGRATION.md` - Socket.io event documentation

---

## 💡 Advanced Features (Post-Phase 2)

These can be added after core Phase 2 is complete:

- **Data Recording**: Save sensor data to IndexedDB
- **Zoom & Pan**: Interactive chart exploration
- **Data Export**: Download CSV/JSON
- **Alerts**: Trigger notifications on thresholds
- **Comparison**: Multi-device overlay
- **Calibration**: Device-specific tuning

---

## 🎯 Success Criteria

Phase 2 is complete when:

✅ Real-time acceleration data displays  
✅ Real-time rotation data displays  
✅ 3D model rotates with device  
✅ Charts update smoothly (30+ FPS)  
✅ Mobile responsive (tested on 3 viewports)  
✅ No memory leaks (buffer auto-trim)  
✅ Build succeeds & passes lint  
✅ Documentation complete  

---

## ⏱️ Timeline Estimate

| Task | Duration |
|------|----------|
| Types & Store | 20 min |
| Services & Hooks | 25 min |
| Base Components | 30 min |
| Chart Components | 35 min |
| 3D Component | 25 min |
| Integration & Polish | 30 min |
| Testing & Documentation | 20 min |
| **Total** | **~2.5 hours** |

---

**Start Date**: January 17, 2026  
**Phase 1 Status**: ✅ Complete  
**Phase 2 Status**: 🚀 Ready to Start  

Next: Begin implementation!
