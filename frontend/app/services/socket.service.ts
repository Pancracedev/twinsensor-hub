'use client';

import io, { Socket } from 'socket.io-client';
import { APP_CONFIG, SOCKET_EVENTS } from '../utils';
import { useDeviceStore } from '../stores';
import { SocketMessage } from '../types';

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
