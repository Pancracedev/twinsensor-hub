import { Request } from 'express';

/**
 * Extract string parameter from Express request
 * Handles both single string and array cases
 */
export function getStringParam(param: string | string[] | undefined): string {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Extract query parameter as number
 */
export function getNumberQuery(query: any): number | undefined {
  if (!query) return undefined;
  const str = Array.isArray(query) ? query[0] : String(query);
  const num = parseInt(str, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Type-safe extraction of request params
 */
export function extractParams<T extends Record<string, any>>(req: Request): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(req.params)) {
    result[key] = getStringParam(value);
  }
  return result as T;
}
