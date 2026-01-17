/**
 * Device Type Definitions
 * Types for device information, sessions, and state management
 */

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
