'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '../../hooks';
import {
  Button,
  Card,
  Alert,
  Spinner,
  DeviceStatus,
  DeviceIDDisplay,
} from '../../components';

export default function PairingPage() {
  const router = useRouter();
  const {
    deviceId,
    currentDevice,
    isConnected,
    isConnecting,
    error,
    isInitialized,
    connect,
    disconnect,
  } = useDevice();

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Auto-redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected && isInitialized) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isInitialized, router]);

  const handleConnect = async () => {
    try {
      setConnectionError(null);
      await connect();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect to device';
      setConnectionError(errorMessage);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnectionError(null);
      disconnect();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to disconnect';
      setConnectionError(errorMessage);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <Spinner size="lg" />
            <p className="text-gray-400">Initializing device...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Device Pairing</h1>
        <p className="text-gray-400">
          Connect your mobile device to Twin Sensor Hub
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Device Information */}
        <Card>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Device Information</h2>

            {/* Current Device Status */}
            <div className="space-y-4">
              <DeviceStatus />

              {/* Device Details */}
              {currentDevice && (
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Device ID</span>
                    <span className="text-xs text-gray-500">{deviceId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Device Type</span>
                    <span className="text-sm font-mono capitalize">
                      {currentDevice.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">OS</span>
                    <span className="text-sm font-mono">
                      {currentDevice.osVersion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Screen Size</span>
                    <span className="text-sm font-mono">
                      {currentDevice.deviceInfo.screenWidth}×{currentDevice.deviceInfo.screenHeight}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right: Connection Controls */}
        <Card>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Connection Controls</h2>

            {/* Status Indicator */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected
                      ? 'bg-green-500'
                      : isConnecting
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                  }`}
                />
                <span className="text-sm">
                  {isConnected ? (
                    <span className="text-green-400 font-medium">Connected</span>
                  ) : isConnecting ? (
                    <span className="text-yellow-400 font-medium">Connecting...</span>
                  ) : (
                    <span className="text-red-400 font-medium">Disconnected</span>
                  )}
                </span>
              </div>
            </div>

            {/* Connection Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect to Device'}
              </Button>

              <Button
                onClick={handleDisconnect}
                variant="secondary"
                disabled={!isConnected && !isConnecting}
                className="w-full"
              >
                Disconnect
              </Button>
            </div>

            {/* Copy Device ID */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">
                Share this ID with your device:
              </p>
              <DeviceIDDisplay />
            </div>

            {/* Success Message */}
            {isConnected && (
              <Alert type="success">
                Device connected successfully! Redirecting to dashboard...
              </Alert>
            )}
          </div>
        </Card>
      </div>

      {/* Error Messages */}
      {(error || connectionError) && (
        <Alert type="error">
          {connectionError || error || 'An error occurred'}
        </Alert>
      )}

      {/* Instructions */}
      <Card className="bg-blue-950/30 border border-blue-900/50">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400">Setup Instructions</h3>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-gray-300">
              <span className="font-medium">Install the Twin Sensor mobile app</span>
              <span className="text-gray-400 ml-2">(iOS / Android)</span>
            </li>
            <li className="text-gray-300">
              <span className="font-medium">Open the app and go to Settings</span>
            </li>
            <li className="text-gray-300">
              <span className="font-medium">Enter the Device ID above</span> or scan the
              QR code
            </li>
            <li className="text-gray-300">
              <span className="font-medium">Tap &quot;Connect&quot;</span> on both devices
            </li>
            <li className="text-gray-300">
              <span className="font-medium">Wait for confirmation</span> and enjoy
              real-time monitoring
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
