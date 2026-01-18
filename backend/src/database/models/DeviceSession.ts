/**
 * DeviceSession Schema and Model
 * Represents a session/connection for a device
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceSession extends Document {
  sessionId: string;
  deviceId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  duration?: number; // in milliseconds
  readingsCount: number;
  anomaliesCount: number;
}

const deviceSessionSchema = new Schema<IDeviceSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String, required: true, index: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    isActive: { type: Boolean, default: true },
    duration: Number,
    readingsCount: { type: Number, default: 0 },
    anomaliesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'device_sessions',
  }
);

// Indexes
deviceSessionSchema.index({ deviceId: 1, isActive: 1 });
deviceSessionSchema.index({ startTime: -1 });
deviceSessionSchema.index({ sessionId: 1, deviceId: 1 });

export const DeviceSession = mongoose.model<IDeviceSession>('DeviceSession', deviceSessionSchema);
