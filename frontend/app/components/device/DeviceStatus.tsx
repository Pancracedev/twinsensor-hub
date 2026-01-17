'use client';

import { useDevice } from '../../hooks';
import { Card, Spinner } from '../common';

export const DeviceStatus = () => {
  const { deviceId, isConnected, isConnecting, isInitialized } = useDevice();

  if (!isInitialized) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Spinner size="sm" />
          <p>Initializing device...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Device ID</p>
          <p className="font-mono text-lg break-all">{deviceId || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-green-500'
                : isConnecting
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <p className="text-sm font-medium">
            {isConnected
              ? 'Connected'
              : isConnecting
                ? 'Connecting...'
                : 'Disconnected'}
          </p>
        </div>
      </div>
    </Card>
  );
};
