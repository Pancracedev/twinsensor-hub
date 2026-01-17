'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✓ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('✗ Service Worker registration failed:', error);
        });
    }

    // Handle app installation prompt
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('✓ Install prompt ready');
    });

    // Monitor when app is installed
    window.addEventListener('appinstalled', () => {
      console.log('✓ PWA installed');
      deferredPrompt = null;
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('✓ Notifications enabled');
        }
      });
    }

    // Background Sync registration
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        const syncReg = registration as any;
        if (syncReg.sync) {
          syncReg.sync.register('sync-data').catch((err: Error) => {
            console.warn('Background sync registration failed:', err);
          });
        }
      });
    }

    // Check for updates periodically
    const checkUpdates = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          registration?.update();
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkUpdates);
  }, []);

  return null;
}
