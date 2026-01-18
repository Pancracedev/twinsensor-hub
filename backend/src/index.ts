import { startServer } from './server.js';
import { connectDatabase } from './database/config.js';
import logger from './utils/logger.js';

/**
 * Main entry point
 */
async function main() {
  try {
    logger.info('Starting Twin Sensor Hub Backend Server...');
    
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');
    
    // Start Express server
    startServer();
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
