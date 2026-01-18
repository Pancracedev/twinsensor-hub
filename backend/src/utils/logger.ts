import pino from 'pino';
import config from './config.js';

const pinoConfig = config.isDevelopment
  ? {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }
  : {
      level: config.logLevel,
    };

export const logger = pino(pinoConfig);

export default logger;
