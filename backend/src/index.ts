import { startServer } from './server.js';
import logger from './utils/logger.js';

/**
 * Main entry point
 */
async function main() {
  try {
    logger.info('Starting Twin Sensor Hub Backend Server...');
    startServer();
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
