import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export interface ITokenPayload {
  deviceId: string;
  sessionId: string;
  type: 'device' | 'session';
  iat?: number;
  exp?: number;
}

export interface IAuthCredentials {
  deviceId: string;
  sessionId: string;
}

export class AuthService {
  private static readonly JWT_SECRET = config.jwtSecret;
  private static readonly JWT_EXPIRY = '24h';

  /**
   * Generate JWT token for device session
   */
  static generateToken(credentials: IAuthCredentials): string {
    try {
      const payload: ITokenPayload = {
        deviceId: credentials.deviceId,
        sessionId: credentials.sessionId,
        type: 'device',
      };

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRY,
        algorithm: 'HS256',
      });

      logger.info({
        action: 'generateToken',
        deviceId: credentials.deviceId,
        sessionId: credentials.sessionId,
      });

      return token;
    } catch (error) {
      logger.error({
        action: 'generateToken',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): ITokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as ITokenPayload;

      logger.debug({
        action: 'verifyToken',
        deviceId: decoded.deviceId,
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn({
          action: 'verifyToken',
          error: 'Token expired',
        });
        throw new Error('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn({
          action: 'verifyToken',
          error: 'Invalid token',
        });
        throw new Error('Invalid token');
      }

      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  static refreshToken(token: string): string {
    try {
      const decoded = this.verifyToken(token);

      const newPayload: ITokenPayload = {
        deviceId: decoded.deviceId,
        sessionId: decoded.sessionId,
        type: decoded.type,
      };

      const newToken = jwt.sign(newPayload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRY,
        algorithm: 'HS256',
      });

      logger.info({
        action: 'refreshToken',
        deviceId: decoded.deviceId,
      });

      return newToken;
    } catch (error) {
      logger.error({
        action: 'refreshToken',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): ITokenPayload | null {
    try {
      return jwt.decode(token) as ITokenPayload | null;
    } catch (error) {
      logger.error({
        action: 'decodeToken',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as ITokenPayload | null;
      if (!decoded || !decoded.exp) return true;

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}
