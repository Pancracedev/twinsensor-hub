/**
 * Mobile Sensors Service
 * Handles device orientation, motion, and acceleration sensors
 * Uses DeviceOrientationEvent and DeviceMotionEvent APIs
 */

'use client';

export interface DeviceOrientation {
  alpha: number; // Rotation around Z axis (0-360)
  beta: number;  // Rotation around X axis (-180 to 180)
  gamma: number; // Rotation around Y axis (-90 to 90)
}

export interface DeviceMotion {
  x: number;
  y: number;
  z: number;
}

export interface DeviceAcceleration extends DeviceMotion {
  timestamp: number;
}

export interface DeviceRotationRate extends DeviceMotion {
  timestamp: number;
}

type OrientationCallback = (orientation: DeviceOrientation) => void;
type MotionCallback = (motion: DeviceMotion) => void;
type AccelerationCallback = (acceleration: DeviceAcceleration) => void;

export class MobileSensorService {
  private static instance: MobileSensorService;
  private orientationCallbacks: Set<OrientationCallback> = new Set();
  private motionCallbacks: Set<MotionCallback> = new Set();
  private accelerationCallbacks: Set<AccelerationCallback> = new Set();
  private isListening = false;
  private permissionGranted = false;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): MobileSensorService {
    if (!MobileSensorService.instance) {
      MobileSensorService.instance = new MobileSensorService();
    }
    return MobileSensorService.instance;
  }

  /**
   * Request permission for device sensors (iOS 13+)
   */
  public async requestPermission(): Promise<boolean> {
    if (!('DeviceOrientationEvent' in window)) {
      console.warn('DeviceOrientationEvent not supported');
      return false;
    }

    // iOS 13+ requires explicit permission
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        this.permissionGranted = permission === 'granted';
        return this.permissionGranted;
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }

    // Android and other browsers don't require explicit permission
    this.permissionGranted = true;
    return true;
  }

  /**
   * Setup event listeners for sensors
   */
  private setupEventListeners(): void {
    // DeviceOrientation event
    window.addEventListener('deviceorientation', (event: DeviceOrientationEvent) => {
      const orientation: DeviceOrientation = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      };
      this.notifyOrientationCallbacks(orientation);
    });

    // DeviceMotion event
    window.addEventListener('devicemotion', (event: DeviceMotionEvent) => {
      // Acceleration with gravity
      if (event.acceleration) {
        const acceleration: DeviceAcceleration = {
          x: event.acceleration.x || 0,
          y: event.acceleration.y || 0,
          z: event.acceleration.z || 0,
          timestamp: event.timeStamp,
        };
        this.notifyAccelerationCallbacks(acceleration);
      }

      // Rotation rate (gyroscope)
      if (event.rotationRate) {
        const motion: DeviceMotion = {
          x: event.rotationRate.alpha || 0,
          y: event.rotationRate.beta || 0,
          z: event.rotationRate.gamma || 0,
        };
        this.notifyMotionCallbacks(motion);
      }
    });
  }

  /**
   * Subscribe to orientation changes
   */
  public subscribeToOrientation(callback: OrientationCallback): () => void {
    this.orientationCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.orientationCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to motion changes
   */
  public subscribeToMotion(callback: MotionCallback): () => void {
    this.motionCallbacks.add(callback);

    return () => {
      this.motionCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to acceleration changes
   */
  public subscribeToAcceleration(callback: AccelerationCallback): () => void {
    this.accelerationCallbacks.add(callback);

    return () => {
      this.accelerationCallbacks.delete(callback);
    };
  }

  /**
   * Notify all orientation subscribers
   */
  private notifyOrientationCallbacks(orientation: DeviceOrientation): void {
    this.orientationCallbacks.forEach((callback) => {
      try {
        callback(orientation);
      } catch (error) {
        console.error('Error in orientation callback:', error);
      }
    });
  }

  /**
   * Notify all motion subscribers
   */
  private notifyMotionCallbacks(motion: DeviceMotion): void {
    this.motionCallbacks.forEach((callback) => {
      try {
        callback(motion);
      } catch (error) {
        console.error('Error in motion callback:', error);
      }
    });
  }

  /**
   * Notify all acceleration subscribers
   */
  private notifyAccelerationCallbacks(acceleration: DeviceAcceleration): void {
    this.accelerationCallbacks.forEach((callback) => {
      try {
        callback(acceleration);
      } catch (error) {
        console.error('Error in acceleration callback:', error);
      }
    });
  }

  /**
   * Check if sensors are supported
   */
  public isSensorSupported(): boolean {
    return (
      'DeviceOrientationEvent' in window ||
      'DeviceMotionEvent' in window
    );
  }

  /**
   * Check if permission was granted
   */
  public hasPermission(): boolean {
    return this.permissionGranted;
  }

  /**
   * Check if listening to sensors
   */
  public isListeningToSensors(): boolean {
    return this.isListening && this.permissionGranted;
  }

  /**
   * Start listening to sensors
   */
  public startListening(): void {
    if (this.isListening) return;
    this.isListening = true;
  }

  /**
   * Stop listening to sensors
   */
  public stopListening(): void {
    this.isListening = false;
  }

  /**
   * Get current status
   */
  public getStatus(): {
    supported: boolean;
    permissionGranted: boolean;
    isListening: boolean;
  } {
    return {
      supported: this.isSensorSupported(),
      permissionGranted: this.permissionGranted,
      isListening: this.isListening,
    };
  }
}

// Export singleton instance
export const mobileSensorService = MobileSensorService.getInstance();
