'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '../../hooks';
import { Card, Spinner, DeviceStatus, ConnectionIndicator } from '../../components';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, isInitialized } = useDevice();

  // Redirect to pairing if not connected
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push('/pairing');
    }
  }, [isConnected, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <Spinner size="lg" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <Spinner size="lg" />
            <p className="text-gray-400">Redirecting to pairing...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Real-time Monitoring</h1>
        <p className="text-gray-400">
          Monitor motion and performance metrics from your connected device
        </p>
      </div>

      {/* Device Status Card */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Device Status</h2>
          <DeviceStatus />
        </div>
      </Card>

      {/* Coming Soon - Phase 2 Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Motion Analytics',
            description: 'Real-time acceleration and gyroscope data',
            icon: '📊',
          },
          {
            title: 'Performance Metrics',
            description: 'CPU, memory, and temperature tracking',
            icon: '⚡',
          },
          {
            title: 'AI Anomaly Detection',
            description: 'Automatic anomaly detection and alerts',
            icon: '🤖',
          },
        ].map((feature, idx) => (
          <Card key={idx} className="bg-gray-800/30">
            <div className="space-y-3 text-center">
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
              <p className="text-xs text-gray-500 pt-2">Coming in Phase 2</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-950/30 border border-blue-900/50">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-400">Phase 1 Complete</h3>
          <p className="text-gray-300">
            You have successfully connected your device! Phase 1 setup is complete. Real-time
            monitoring features will be available in Phase 2.
          </p>
          <div className="text-sm text-blue-300 pt-2">
            Current device is <span className="font-mono">connected</span> and ready for monitoring.
          </div>
        </div>
      </Card>
    </div>
  );
}
