import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import { formatErrorResponse } from '../utils/index.js';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';

/**
 * Logging middleware
 */
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      },
      `${req.method} ${req.path} ${res.statusCode}`
    );
  });

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      path: _req.path,
      method: _req.method,
    },
    'Request error'
  );

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const code = error.code || ERROR_CODES.INTERNAL_ERROR;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json(formatErrorResponse(code, message));
};

/**
 * Not found middleware
 */
export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.warn({ path: _req.path }, 'Route not found');
  res.status(HTTP_STATUS.NOT_FOUND).json(
    formatErrorResponse(
      ERROR_CODES.INVALID_REQUEST,
      `Route not found: ${_req.path}`
    )
  );
};

/**
 * Validation error middleware
 */
export const validationErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error.statusCode === 400 && error.validation) {
    logger.warn(
      { errors: error.validation },
      'Validation error'
    );

    res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'Validation error',
      )
    );
    return;
  }

  _next(error);
};
