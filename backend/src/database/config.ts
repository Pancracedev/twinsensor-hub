/**
 * Database Configuration
 * MongoDB setup and initialization
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export interface MongoDBConfig {
  url: string;
  options?: mongoose.ConnectOptions;
}

/**
 * Connect to MongoDB
 */
export async function connectDatabase(): Promise<void> {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/twinsensor-hub';

    logger.info('Connecting to MongoDB...');

    await mongoose.connect(mongoUrl, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('✓ MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed');
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('✓ MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection failed');
    throw error;
  }
}

/**
 * Get connection status
 */
export function getDatabaseStatus(): {
  connected: boolean;
  url?: string;
} {
  return {
    connected: mongoose.connection.readyState === 1,
    url: mongoose.connection.host,
  };
}
