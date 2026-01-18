import type { Request, Response, NextFunction } from 'express';
import { AuthService, type ITokenPayload } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      token?: string;
    }
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      logger.debug({ path: req.path }, 'No token provided');
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    try {
      const payload = AuthService.verifyToken(token);
      req.user = payload;
      req.token = token;
      next();
    } catch (tokenError) {
      logger.warn(
        { error: (tokenError as Error).message },
        'Token verification failed'
      );
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    logger.error({ error }, 'Auth middleware error');
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to optionally verify JWT token
 * Does not fail if token is missing, but validates if present
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload = AuthService.verifyToken(token);
        req.user = payload;
        req.token = token;
      } catch (error) {
        logger.debug({ error }, 'Optional token verification failed');
        // Don't fail, just continue without user
      }
    }

    next();
  } catch (error) {
    logger.error({ error }, 'Optional auth middleware error');
    next(); // Continue anyway for optional auth
  }
};

/**
 * Middleware to verify device ID matches token
 */
export const verifyDeviceOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const deviceIdFromParam = req.params.deviceId;
  const deviceIdFromToken = req.user.deviceId;

  if (deviceIdFromParam !== deviceIdFromToken) {
    logger.warn(
      { paramDeviceId: deviceIdFromParam, tokenDeviceId: deviceIdFromToken },
      'Device ownership verification failed'
    );
    res.status(403).json({ error: 'Forbidden: Device mismatch' });
    return;
  }

  next();
};
