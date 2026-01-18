/**
 * Device Schema and Model
 * Represents a connected device
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  type: 'mobile' | 'tablet' | 'wearable' | 'other';
  osType: 'iOS' | 'Android' | 'Windows' | 'Other';
  osVersion?: string;
  brand?: string;
  deviceModel?: string;
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['mobile', 'tablet', 'wearable', 'other'], default: 'mobile' },
    osType: { type: String, enum: ['iOS', 'Android', 'Windows', 'Other'], required: true },
    osVersion: String,
    brand: String,
    deviceModel: String,
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'devices',
  }
);

// Index for queries
deviceSchema.index({ deviceId: 1, isActive: 1 });
deviceSchema.index({ createdAt: -1 });

export const Device = mongoose.model<IDevice>('Device', deviceSchema);
