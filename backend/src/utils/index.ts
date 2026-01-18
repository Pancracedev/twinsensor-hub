import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique UUID
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Format error response
 */
export function formatErrorResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: getCurrentTimestamp(),
  };
}

/**
 * Format success response
 */
export function formatSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: getCurrentTimestamp(),
  };
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse device type from user agent
 */
export function parseDeviceType(
  userAgent: string
): 'phone' | 'tablet' | 'wearable' {
  const ua = userAgent.toLowerCase();

  if (ua.includes('watch') || ua.includes('wearable')) {
    return 'wearable';
  }

  if (
    ua.includes('ipad') ||
    ua.includes('tablet') ||
    ua.includes('kindle') ||
    (ua.includes('android') && !ua.includes('mobile'))
  ) {
    return 'tablet';
  }

  return 'phone';
}

/**
 * Parse OS version from user agent
 */
export function parseOSVersion(userAgent: string): string {
  const ua = userAgent;

  // Windows
  const windows = ua.match(/Windows NT ([\d.]+)/);
  if (windows) return `Windows ${windows[1]}`;

  // macOS
  const macos = ua.match(/Mac OS X ([\d_]+)/);
  if (macos) return `macOS ${macos[1].replace(/_/g, '.')}`;

  // iOS
  const ios = ua.match(/OS ([\d_]+)/);
  if (ios) return `iOS ${ios[1].replace(/_/g, '.')}`;

  // Android
  const android = ua.match(/Android ([\d.]+)/);
  if (android) return `Android ${android[1]}`;

  return 'Unknown';
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round to specific decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
