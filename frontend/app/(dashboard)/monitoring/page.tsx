'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice, useSensorData, usePerformanceMetrics } from '../../hooks';
import {
  Button,
  Card,
  Alert,
  Spinner,
  SensorStatus,
  PerformanceMetrics,
  SensorReadings,
  DeviceOrientationDisplay,
} from '../../components';

export default function MonitoringPage() {
  const router = useRouter();
  const { isConnected, isInitialized } = useDevice();
  const { startSensorStream, stopSensorStream, streamState } = useSensorData();
  const { latestMetrics, getAlertMessages } = usePerformanceMetrics();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'detailed' | 'performance'>('overview');

  // Redirect if not connected
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push('/pairing');
    }
  }, [isConnected, isInitialized, router]);

  // Initialize sensor streaming
  useEffect(() => {
    if (isConnected && !streamState.isStreaming) {
      setIsLoading(true);
      startSensorStream(60); // 60 Hz
      
      // Give it time to connect
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, streamState.isStreaming, startSensorStream]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <Spinner size="lg" />
            <p className="text-gray-400">Initializing monitoring...</p>
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

  const alerts = getAlertMessages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Real-time Monitoring</h1>
        <p className="text-gray-400">
          {streamState.isStreaming
            ? 'Live sensor data streaming'
            : 'Starting sensor stream...'}
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: string, idx: number) => (
            <Alert key={idx} type="warning">
              {alert}
            </Alert>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-800">
        {(
          [
            { id: 'overview' as const, label: 'Overview' },
            { id: 'detailed' as const, label: 'Detailed Data' },
            { id: 'performance' as const, label: 'Performance' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="py-12">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-400">Connecting to sensor stream...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Orientation */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Device Orientation</h2>
                    <DeviceOrientationDisplay />
                  </div>
                </Card>
              </div>

              {/* Right: Status & Performance */}
              <div className="space-y-4">
                <Card>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Stream Status</h2>
                    <SensorStatus />
                  </div>
                </Card>

                <Card>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Performance</h2>
                    {latestMetrics ? (
                      <PerformanceMetrics />
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Waiting for performance data...
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Detailed Data Tab */}
          {selectedTab === 'detailed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Raw Sensor Data</h2>
                  <SensorReadings />
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Stream Status</h2>
                  <SensorStatus />
                </div>
              </Card>
            </div>
          )}

          {/* Performance Tab */}
          {selectedTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Performance Metrics</h2>
                  {latestMetrics ? (
                    <PerformanceMetrics />
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Waiting for performance data...
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Data Quality</h2>
                  <SensorStatus />
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Control Buttons */}
      <Card className="flex space-x-3">
        <Button
          onClick={() => {
            if (streamState.isStreaming) {
              stopSensorStream();
            } else {
              setIsLoading(true);
              startSensorStream(60);
              setTimeout(() => setIsLoading(false), 500);
            }
          }}
          variant={streamState.isStreaming ? 'secondary' : 'primary'}
        >
          {streamState.isStreaming ? 'Stop Streaming' : 'Start Streaming'}
        </Button>

        <Button onClick={() => router.push('/pairing')} variant="secondary">
          Back to Pairing
        </Button>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-950/30 border border-blue-900/50">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-400">Phase 2: Real-time Monitoring</h3>
          <p className="text-gray-300 text-sm">
            You can now see live sensor data from your connected device. The system is monitoring
            accelerometer, gyroscope, and performance metrics in real-time.
          </p>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>Orientation tracking with Euler angles and quaternions</li>
            <li>Raw sensor readings at configurable sample rates</li>
            <li>Real-time performance metrics (CPU, memory, temperature)</li>
            <li>Data quality and latency monitoring</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
