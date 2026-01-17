'use client';

import { useDevice } from '../../hooks';

export const ConnectionIndicator = () => {
  const { isConnected, isConnecting } = useDevice();

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
        Connecting...
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-green-600 rounded-full" />
        Connected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
      <div className="w-2 h-2 bg-red-600 rounded-full" />
      Disconnected
    </div>
  );
};
