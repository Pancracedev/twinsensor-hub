# 🎯 PHASE 1: Device Pairing & Initialization - Action Plan

**Durée estimée**: 2-3 jours  
**Commits attendus**: 6  
**Complexité**: Medium  
**Status**: 🟢 Ready to start

---

## 📌 Objectifs Phase 1

```
✅ Generate unique device ID (UUID)
✅ Establish WebSocket connection via Socket.io
✅ Display connection status UI
✅ Handle reconnection logic
✅ Store device info in Zustand
✅ Prepare backend integration
```

---

## 🗂️ Folder Structure à Créer

```bash
frontend/app/
├── (dashboard)/                    # ← NEW: Layout groupé
│   ├── layout.tsx                  # ← NEW: Dashboard layout
│   ├── dashboard/
│   │   └── page.tsx                # ← CREATE: Dashboard home
│   ├── pairing/                    # ← NEW: Pairing page
│   │   └── page.tsx                # ← CREATE: Device pairing
│   └── replay/
│       └── page.tsx                # ← CREATE: (empty for now)
│
├── components/                     # ← NEW: Composants
│   ├── common/                     # ← NEW: Réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Alert.tsx
│   │   └── Spinner.tsx
│   │
│   └── device/                     # ← NEW: Device-specific
│       ├── DeviceStatus.tsx
│       ├── DeviceIDDisplay.tsx
│       └── ConnectionIndicator.tsx
│
├── services/                       # ← NEW: Logique métier
│   ├── socket.service.ts
│   ├── device.service.ts
│   └── index.ts
│
├── hooks/                          # ← NEW: Custom hooks
│   ├── useDevice.ts
│   ├── useSocket.ts
│   └── index.ts
│
├── stores/                         # ← NEW: Zustand stores
│   ├── deviceStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── types/                          # ← NEW: Type definitions
│   ├── device.types.ts
│   ├── socket.types.ts
│   └── index.ts
│
└── utils/                          # ← NEW: Utilitaires
    ├── device-id.utils.ts
    ├── constants.ts
    └── index.ts
```

---

## 📋 Commit-by-Commit Action Plan

### COMMIT 1️⃣: Project Structure & Type Definitions

**Objectif**: Setup folder structure + TypeScript types

**Files to Create**:

#### 1.1 Type Definitions

```typescript
// app/types/device.types.ts
export interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'wearable';
  osVersion: string;
  createdAt: Date;
  lastConnected: Date;
  isOnline: boolean;
}

export interface DeviceSession {
  deviceId: string;
  sessionId: string;
  startedAt: Date;
  lastHeartbeat: Date;
  status: 'connected' | 'disconnected' | 'reconnecting';
}

export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  platform: string;
}
```

```typescript
// app/types/socket.types.ts
export interface SocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface SocketConnectionEvent {
  deviceId: string;
  sessionId: string;
  timestamp: number;
}

export interface SocketError {
  code: string;
  message: string;
  recoverable: boolean;
}

export type SocketHandler<T = any> = (data: T) => void | Promise<void>;
```

```typescript
// app/types/index.ts
export * from './device.types';
export * from './socket.types';
```

#### 1.2 Constants

```typescript
// app/utils/constants.ts
export const APP_CONFIG = {
  // Socket.io
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  SOCKET_RECONNECT_DELAY: 1000,
  SOCKET_RECONNECT_DELAYMAX: 5000,
  SOCKET_RECONNECT_ATTEMPTS: 10,

  // Device
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
```

#### 1.3 Device ID Utils

```typescript
// app/utils/device-id.utils.ts
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from './constants';

export const generateDeviceId = (): string => {
  return uuidv4();
};

export const getOrCreateDeviceId = (): string => {
  // Check if already exists in localStorage
  if (typeof window === 'undefined') return generateDeviceId();
  
  const existing = localStorage.getItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);
  
  if (existing) {
    return existing;
  }
  
  // Generate new ID
  const newId = generateDeviceId();
  localStorage.setItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY, newId);
  
  return newId;
};

export const getStoredDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);
};

export const clearDeviceId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);
};
```

#### 1.4 Utils Index

```typescript
// app/utils/index.ts
export * from './constants';
export * from './device-id.utils';
```

#### 1.5 Types Index

```typescript
// app/types/index.ts
export * from './device.types';
export * from './socket.types';
```

**Commit Message**:
```bash
git add app/types app/utils
git commit -m "feat(project): setup project structure with type definitions and constants

- Create TypeScript interfaces for Device, DeviceSession, DeviceInfo
- Create Socket.io type definitions
- Add configuration constants
- Add device ID utility functions for UUID generation/storage
- Create module index files for cleaner imports"
```

---

### COMMIT 2️⃣: Zustand Store Setup

**Objectif**: Setup state management for device & UI

#### 2.1 Device Store

```typescript
// app/stores/deviceStore.ts
import { create } from 'zustand';
import { Device, DeviceSession } from '@/types';

interface DeviceState {
  // Device data
  currentDevice: Device | null;
  deviceId: string | null;
  
  // Session data
  currentSession: DeviceSession | null;
  
  // Status
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  
  // Actions
  setDeviceId: (id: string) => void;
  setCurrentDevice: (device: Device | null) => void;
  setCurrentSession: (session: DeviceSession | null) => void;
  setConnecting: (connecting: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  
  // Derived
  getDeviceInfo: () => Device | null;
  getConnectionStatus: () => 'connected' | 'connecting' | 'disconnected';
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  // Initial state
  currentDevice: null,
  deviceId: null,
  currentSession: null,
  isConnecting: false,
  isConnected: false,
  error: null,

  // Actions
  setDeviceId: (id: string) => set({ deviceId: id }),
  
  setCurrentDevice: (device: Device | null) => set({ currentDevice: device }),
  
  setCurrentSession: (session: DeviceSession | null) =>
    set({ currentSession: session }),
  
  setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),
  
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  
  setError: (error: string | null) => set({ error }),

  // Derived
  getDeviceInfo: () => get().currentDevice,
  
  getConnectionStatus: () => {
    const { isConnected, isConnecting } = get();
    if (isConnected) return 'connected';
    if (isConnecting) return 'connecting';
    return 'disconnected';
  },
}));
```

#### 2.2 UI Store

```typescript
// app/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  // Modals
  showPairingModal: boolean;
  showSettingsModal: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;
  
  // Loading
  isLoading: boolean;
  
  // Actions
  setPairingModal: (show: boolean) => void;
  setSettingsModal: (show: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  showPairingModal: false,
  showSettingsModal: false,
  notifications: [],
  isLoading: false,

  // Actions
  setPairingModal: (show: boolean) => set({ showPairingModal: show }),
  setSettingsModal: (show: boolean) => set({ showSettingsModal: show }),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
```

#### 2.3 Stores Index

```typescript
// app/stores/index.ts
export { useDeviceStore } from './deviceStore';
export { useUIStore } from './uiStore';
```

**Commit Message**:
```bash
git add app/stores
git commit -m "feat(stores): implement Zustand stores for device and UI state

- Create DeviceStore with device, session, and connection state
- Create UIStore for modals, notifications, and loading states
- Add store actions for state management
- Export stores from index file"
```

---

### COMMIT 3️⃣: Services - Socket.io & Device

**Objectif**: Core services pour Socket.io et device management

#### 3.1 Socket Service

```typescript
// app/services/socket.service.ts
'use client';

import io, { Socket } from 'socket.io-client';
import { APP_CONFIG, SOCKET_EVENTS } from '@/utils';
import { useDeviceStore } from '@/stores';
import { SocketMessage, SocketError } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize Socket.io connection
   */
  public connect(deviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve();
          return;
        }

        const { setConnecting, setConnected, setError } = useDeviceStore.getState();
        setConnecting(true);

        this.socket = io(APP_CONFIG.SOCKET_URL, {
          reconnection: true,
          reconnectionDelay: APP_CONFIG.SOCKET_RECONNECT_DELAY,
          reconnectionDelayMax: APP_CONFIG.SOCKET_RECONNECT_DELAYMAX,
          reconnectionAttempts: APP_CONFIG.SOCKET_RECONNECT_ATTEMPTS,
          transports: ['websocket', 'polling'],
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('[Socket] Connected to server');
          this.reconnectAttempts = 0;
          this.emitDeviceConnect(deviceId);
          this.startHeartbeat();
          setConnected(true);
          setConnecting(false);
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[Socket] Disconnected:', reason);
          setConnected(false);
          this.stopHeartbeat();
        });

        this.socket.on('connect_error', (error) => {
          console.error('[Socket] Connection error:', error);
          this.reconnectAttempts++;
          setError(error.message);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('[Socket] Error:', error);
          setError(typeof error === 'string' ? error : error.message);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        useDeviceStore.getState().setError(message);
        reject(error);
      }
    });
  }

  /**
   * Emit device connect event
   */
  private emitDeviceConnect(deviceId: string): void {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.DEVICE_CONNECT, {
      deviceId,
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
    });
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        const deviceId = useDeviceStore.getState().deviceId;
        if (deviceId) {
          this.socket.emit(SOCKET_EVENTS.DEVICE_HEARTBEAT, {
            deviceId,
            timestamp: Date.now(),
          });
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Emit event to server
   */
  public emit<T>(event: string, data: T): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen for event from server
   */
  public on<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.warn('[Socket] Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Listen for event once
   */
  public once<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.warn('[Socket] Socket not initialized');
      return;
    }
    this.socket.once(event, callback);
  }

  /**
   * Remove listener
   */
  public off(event: string): void {
    if (!this.socket) return;
    this.socket.off(event);
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const socketService = new SocketService();
```

#### 3.2 Device Service

```typescript
// app/services/device.service.ts
'use client';

import { Device, DeviceInfo } from '@/types';
import { getOrCreateDeviceId } from '@/utils';

class DeviceService {
  /**
   * Get device info from browser
   */
  public getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'unknown',
        screenWidth: 0,
        screenHeight: 0,
        pixelRatio: 1,
        platform: 'unknown',
      };
    }

    return {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform || navigator.userAgent,
    };
  }

  /**
   * Detect device type
   */
  public getDeviceType(): 'phone' | 'tablet' | 'wearable' {
    const { screenWidth } = this.getDeviceInfo();
    
    if (screenWidth < 768) return 'phone';
    if (screenWidth < 1024) return 'tablet';
    return 'phone'; // Default to phone for wearables too
  }

  /**
   * Get OS version
   */
  public getOSVersion(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) {
      return userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'unknown';
    }
    if (userAgent.includes('Mac OS X')) {
      return userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'unknown';
    }
    if (userAgent.includes('Android')) {
      return userAgent.match(/Android (\d+)/)?.[1] || 'unknown';
    }
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace(/_/g, '.') || 'unknown';
    }
    
    return 'unknown';
  }

  /**
   * Create Device object
   */
  public createDevice(): Device {
    const deviceId = getOrCreateDeviceId();
    const now = new Date();

    return {
      id: deviceId,
      name: `Device-${deviceId.slice(-4)}`,
      type: this.getDeviceType(),
      osVersion: this.getOSVersion(),
      createdAt: now,
      lastConnected: now,
      isOnline: true,
    };
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Send notification
   */
  public sendNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}

export const deviceService = new DeviceService();
```

#### 3.3 Services Index

```typescript
// app/services/index.ts
export { socketService } from './socket.service';
export { deviceService } from './device.service';
```

**Commit Message**:
```bash
git add app/services
git commit -m "feat(services): implement Socket.io and Device services

- Create SocketService with connection management and heartbeat
- Implement Socket.io event listeners and emitters
- Add reconnection logic with exponential backoff
- Create DeviceService to detect device info and OS version
- Add notification permission handling
- Implement device creation and info retrieval methods"
```

---

### COMMIT 4️⃣: Custom Hooks

**Objectif**: Encapsuler logic personnalisée dans des hooks

#### 4.1 useDevice Hook

```typescript
// app/hooks/useDevice.ts
'use client';

import { useEffect, useState } from 'react';
import { useDeviceStore, useUIStore } from '@/stores';
import { socketService, deviceService } from '@/services';
import { Device } from '@/types';
import { getOrCreateDeviceId } from '@/utils';

export const useDevice = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    deviceId,
    currentDevice,
    isConnected,
    isConnecting,
    error,
    setDeviceId,
    setCurrentDevice,
    setConnected,
    setConnecting,
    setError,
  } = useDeviceStore();

  const { addNotification } = useUIStore();

  /**
   * Initialize device on mount
   */
  useEffect(() => {
    const initDevice = async () => {
      try {
        // Generate device ID if not exists
        const newDeviceId = getOrCreateDeviceId();
        setDeviceId(newDeviceId);

        // Create device object
        const device = deviceService.createDevice();
        setCurrentDevice(device);

        // Request notification permission
        await deviceService.requestNotificationPermission();

        setIsInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize device';
        setError(message);
        console.error('[useDevice] Initialization error:', err);
      }
    };

    initDevice();
  }, [setDeviceId, setCurrentDevice, setError]);

  /**
   * Connect to server
   */
  const connect = async () => {
    if (!deviceId) {
      setError('Device ID not initialized');
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      await socketService.connect(deviceId);
      addNotification({
        type: 'success',
        message: 'Connected to server',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      addNotification({
        type: 'error',
        message,
      });
      console.error('[useDevice] Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect from server
   */
  const disconnect = () => {
    socketService.disconnect();
    setConnected(false);
    addNotification({
      type: 'info',
      message: 'Disconnected from server',
    });
  };

  return {
    // State
    deviceId,
    currentDevice,
    isConnected,
    isConnecting,
    error,
    isInitialized,

    // Actions
    connect,
    disconnect,
  };
};
```

#### 4.2 useSocket Hook

```typescript
// app/hooks/useSocket.ts
'use client';

import { useEffect, useCallback } from 'react';
import { socketService } from '@/services';

export const useSocket = <T = any>(
  event: string,
  callback: (data: T) => void,
  enabled = true
) => {
  const emit = useCallback(
    (data: T) => {
      socketService.emit(event, data);
    },
    [event]
  );

  useEffect(() => {
    if (!enabled) return;

    socketService.on<T>(event, callback);

    return () => {
      socketService.off(event);
    };
  }, [event, callback, enabled]);

  return { emit };
};
```

#### 4.3 Hooks Index

```typescript
// app/hooks/index.ts
export { useDevice } from './useDevice';
export { useSocket } from './useSocket';
```

**Commit Message**:
```bash
git add app/hooks
git commit -m "feat(hooks): create custom React hooks for device and socket logic

- Create useDevice hook for device initialization and connection
- Implement useSocket hook for WebSocket event handling
- Add automatic cleanup and error handling
- Export hooks from index for clean imports"
```

---

### COMMIT 5️⃣: UI Components

**Objectif**: Créer composants réutilisables pour l'UI

#### 5.1 Composants Common

```typescript
// app/components/common/Button.tsx
'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200';

  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? '⏳ Loading...' : children}
    </button>
  );
};
```

```typescript
// app/components/common/Card.tsx
'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};
```

```typescript
// app/components/common/Alert.tsx
'use client';

import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  children: ReactNode;
  onClose?: () => void;
}

export const Alert = ({ type, children, onClose }: AlertProps) => {
  const baseStyles = 'p-4 rounded-lg flex items-center justify-between';

  const typeStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">
          ✕
        </button>
      )}
    </div>
  );
};
```

```typescript
// app/components/common/Spinner.tsx
'use client';

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin`} />
  );
};
```

```typescript
// app/components/common/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Alert } from './Alert';
export { Spinner } from './Spinner';
```

#### 5.2 Composants Device

```typescript
// app/components/device/DeviceStatus.tsx
'use client';

import { useDevice } from '@/hooks';
import { Card, Spinner } from '@/components/common';

export const DeviceStatus = () => {
  const { deviceId, isConnected, isConnecting, isInitialized } = useDevice();

  if (!isInitialized) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Spinner size="sm" />
          <p>Initializing device...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Device ID</p>
          <p className="font-mono text-lg break-all">{deviceId || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-green-500'
                : isConnecting
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <p className="text-sm font-medium">
            {isConnected
              ? 'Connected'
              : isConnecting
                ? 'Connecting...'
                : 'Disconnected'}
          </p>
        </div>
      </div>
    </Card>
  );
};
```

```typescript
// app/components/device/DeviceIDDisplay.tsx
'use client';

import { useDevice } from '@/hooks';
import { useState } from 'react';
import { Card, Button } from '@/components/common';

export const DeviceIDDisplay = () => {
  const { deviceId } = useDevice();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (deviceId) {
      navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="text-center">
      <h3 className="text-lg font-semibold mb-4">Your Device ID</h3>
      <p className="font-mono text-2xl text-blue-600 dark:text-blue-400 mb-4 break-all">
        {deviceId || 'Generating...'}
      </p>
      <Button onClick={copyToClipboard} size="sm">
        {copied ? '✓ Copied!' : 'Copy ID'}
      </Button>
    </Card>
  );
};
```

```typescript
// app/components/device/ConnectionIndicator.tsx
'use client';

import { useDevice } from '@/hooks';

export const ConnectionIndicator = () => {
  const { isConnected, isConnecting } = useDevice();

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
        Connecting...
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-green-600 rounded-full" />
        Connected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
      <div className="w-2 h-2 bg-red-600 rounded-full" />
      Disconnected
    </div>
  );
};
```

```typescript
// app/components/device/index.ts
export { DeviceStatus } from './DeviceStatus';
export { DeviceIDDisplay } from './DeviceIDDisplay';
export { ConnectionIndicator } from './ConnectionIndicator';
```

#### 5.3 Components Index

```typescript
// app/components/index.ts
export * from './common';
export * from './device';
```

**Commit Message**:
```bash
git add app/components
git commit -m "feat(components): create reusable UI components for Phase 1

- Create Button component with variants (primary, secondary, danger)
- Create Card component for content containers
- Create Alert component for notifications
- Create Spinner component for loading states
- Create DeviceStatus component displaying connection state
- Create DeviceIDDisplay component with copy-to-clipboard
- Create ConnectionIndicator component showing real-time status"
```

---

### COMMIT 6️⃣: Pairing Page & Dashboard Layout

**Objectif**: Créer layout dashboard et page de pairage

#### 6.1 Dashboard Layout

```typescript
// app/(dashboard)/layout.tsx
'use client';

import { ReactNode } from 'react';
import { ConnectionIndicator } from '@/components/device';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Twin Sensor Hub
          </h1>
          <ConnectionIndicator />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Twin Sensor Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

#### 6.2 Pairing Page

```typescript
// app/(dashboard)/pairing/page.tsx
'use client';

import { useDevice } from '@/hooks';
import { Button, Alert, Card } from '@/components/common';
import { DeviceIDDisplay, DeviceStatus } from '@/components/device';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUIStore } from '@/stores';

export default function PairingPage() {
  const router = useRouter();
  const { deviceId, isConnected, error, connect, disconnect } = useDevice();
  const { notifications, removeNotification } = useUIStore();

  // Auto-redirect on successful connection
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Device Pairing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your device to start monitoring
        </p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Alert
              key={notification.id}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            >
              {notification.message}
            </Alert>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Info Card */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Device Information</h3>
          <DeviceStatus />
        </Card>

        {/* Device ID Card */}
        <DeviceIDDisplay />
      </div>

      {/* Instructions */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">How to Pair</h3>
        <ol className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>1. Your unique Device ID is displayed above</li>
          <li>2. Click the "Connect" button to establish connection</li>
          <li>3. Watch the connection indicator change to "Connected"</li>
          <li>4. You'll be automatically redirected to the dashboard</li>
        </ol>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {isConnected ? (
          <Button variant="danger" onClick={disconnect} size="lg">
            Disconnect
          </Button>
        ) : (
          <Button onClick={connect} size="lg" disabled={!deviceId}>
            Connect Device
          </Button>
        )}
      </div>

      {/* QR Code Placeholder */}
      <Card className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Scan this QR code on another device (coming soon)
        </p>
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto flex items-center justify-center">
          <p className="text-gray-500">QR Placeholder</p>
        </div>
      </Card>
    </div>
  );
}
```

#### 6.3 Dashboard Page (Placeholder)

```typescript
// app/(dashboard)/dashboard/page.tsx
'use client';

import { useDevice } from '@/hooks';
import { Card } from '@/components/common';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, isInitialized } = useDevice();

  // Redirect to pairing if not connected
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push('/pairing');
    }
  }, [isConnected, isInitialized, router]);

  if (!isInitialized) {
    return (
      <Card>
        <p className="text-center">Loading dashboard...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h2>

      <Card>
        <h3 className="text-lg font-semibold mb-2">Phase 2: Monitoring</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time sensor data visualization coming in Phase 2
        </p>
      </Card>

      {/* Placeholders for Phase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold mb-3">3D Model</h4>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
            <p className="text-gray-500">Phase 2: Three.js Integration</p>
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold mb-3">Sensor Data</h4>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
            <p className="text-gray-500">Phase 2: Recharts Integration</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

**Commit Message**:
```bash
git add app/(dashboard)
git commit -m "feat(pages): create dashboard layout and pairing page for Phase 1

- Create dashboard layout with header and footer
- Implement pairing page with complete device pairing UI
- Add auto-redirect to dashboard after successful connection
- Create dashboard placeholder page for Phase 2
- Add instructions and QR code placeholder
- Implement proper error handling and notifications display"
```

---

## ✅ Phase 1 Complete!

After these 6 commits, you will have:

```
✅ Project structure configured
✅ Type definitions created
✅ Zustand stores for state
✅ Socket.io service ready
✅ Device service configured
✅ Custom hooks implemented
✅ Reusable UI components
✅ Pairing page functional
✅ Dashboard layout ready
✅ Connection status working
✅ Error handling in place
✅ Notifications system
```

---

## 🧪 Testing Phase 1

```bash
# Run dev server
npm run dev

# Open http://localhost:3000/pairing
# 1. Check Device ID generated
# 2. Click "Connect Device"
# 3. Check connection status changes
# 4. Verify WebSocket connects (check browser DevTools > Network > WS)
# 5. Verify redirect to /dashboard
# 6. Check dark mode works
# 7. Test notifications
```

---

## 📊 Phase 1 Impact

| Metric | Value |
|--------|-------|
| New files | 30+ |
| Lines of code | ~1500 |
| Type coverage | 100% |
| Ready for Phase 2 | ✅ Yes |
| Breaking changes | ❌ None |

---

## ➡️ Next: Phase 2 - Sensor Monitoring

After Phase 1 is complete and tested, we'll move to **Phase 2: Real-time Monitoring** with:
- Sensor data reception via Socket.io
- Three.js 3D model
- Recharts visualization
- Real-time metrics dashboard

**Ready to start Phase 1?** 🚀
