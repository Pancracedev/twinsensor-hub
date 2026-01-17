'use client';

import { Device, DeviceInfo } from '../types';
import { getOrCreateDeviceId } from '../utils';

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
    return 'phone'; // Default to phone
  }

  /**
   * Get OS version
   */
  public getOSVersion(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) {
      return userAgent.match(/Windows NT ([\d.]+)/)?.[1] || 'unknown';
    }
    if (userAgent.includes('Mac OS X')) {
      return userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'unknown';
    }
    if (userAgent.includes('Android')) {
      return userAgent.match(/Android ([\d.]+)/)?.[1] || 'unknown';
    }
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'unknown';
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
