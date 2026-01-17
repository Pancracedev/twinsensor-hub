/**
 * Socket.io Type Definitions
 * Types for WebSocket communication and events
 */

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
