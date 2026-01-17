/**
 * Device ID Utility Functions
 * Generate, store, and retrieve unique device identifiers
 */

import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from './constants';

/**
 * Generate a new UUID v4
 */
export const generateDeviceId = (): string => {
  return uuidv4();
};

/**
 * Get or create a device ID
 * If device ID exists in localStorage, return it
 * Otherwise generate new ID and store it
 */
export const getOrCreateDeviceId = (): string => {
  // Handle SSR - don't access localStorage on server
  if (typeof window === 'undefined') return generateDeviceId();

  const existing = localStorage.getItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  // Generate new ID
  const newId = generateDeviceId();
  localStorage.setItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY, newId);

  return newId;
};

/**
 * Get stored device ID (returns null if not found)
 */
export const getStoredDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);
};

/**
 * Clear device ID from storage
 */
export const clearDeviceId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(APP_CONFIG.DEVICE_ID_STORAGE_KEY);
};
