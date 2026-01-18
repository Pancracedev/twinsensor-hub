/**
 * Anomaly Schema and Model
 * Represents detected anomalies
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAnomaly extends Document {
  deviceId: string;
  sessionId: string;
  timestamp: Date;
  type: 'motion' | 'acceleration' | 'temperature' | 'pattern' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  value?: number;
  threshold?: number;
  isResolved: boolean;
  resolvedAt?: Date;
}

const anomalySchema = new Schema<IAnomaly>(
  {
    deviceId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    type: {
      type: String,
      enum: ['motion', 'acceleration', 'temperature', 'pattern', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    description: { type: String, required: true },
    value: Number,
    threshold: Number,
    isResolved: { type: Boolean, default: false, index: true },
    resolvedAt: Date,
  },
  {
    timestamps: true,
    collection: 'anomalies',
  }
);

// Indexes
anomalySchema.index({ deviceId: 1, timestamp: -1 });
anomalySchema.index({ sessionId: 1, timestamp: -1 });
anomalySchema.index({ severity: 1, isResolved: 1 });
anomalySchema.index({ timestamp: -1 });

export const Anomaly = mongoose.model<IAnomaly>('Anomaly', anomalySchema);
