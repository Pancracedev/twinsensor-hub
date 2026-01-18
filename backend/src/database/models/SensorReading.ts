/**
 * SensorReading Schema and Model
 * Represents sensor data readings
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
}

export interface GyroscopeReading {
  x: number;
  y: number;
  z: number;
}

export interface ISensorReading extends Document {
  deviceId: string;
  sessionId: string;
  timestamp: Date;
  accelerometer: AccelerometerReading;
  gyroscope: GyroscopeReading;
  magnetometer?: AccelerometerReading;
  temperature?: number;
  humidity?: number;
  isAnomaly: boolean;
  anomalyScore?: number;
}

const sensorReadingSchema = new Schema<ISensorReading>(
  {
    deviceId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    accelerometer: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    gyroscope: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    magnetometer: {
      x: Number,
      y: Number,
      z: Number,
    },
    temperature: Number,
    humidity: Number,
    isAnomaly: { type: Boolean, default: false, index: true },
    anomalyScore: Number,
  },
  {
    timestamps: true,
    collection: 'sensor_readings',
  }
);

// Indexes for fast queries
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });
sensorReadingSchema.index({ sessionId: 1, timestamp: -1 });
sensorReadingSchema.index({ timestamp: -1 });
sensorReadingSchema.index({ isAnomaly: 1, timestamp: -1 });

// TTL index: delete readings older than 30 days
sensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export const SensorReading = mongoose.model<ISensorReading>(
  'SensorReading',
  sensorReadingSchema
);
