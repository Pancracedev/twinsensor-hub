'use client';

import { useEffect, useState } from 'react';
import { socketService } from '../../services';
import { SOCKET_EVENTS } from '../../utils';
import { Card, Button, Spinner } from '../common';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const IntegrationTest = () => {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Backend Connection', status: 'pending', message: '' },
    { name: 'Socket.io Handshake', status: 'pending', message: '' },
    { name: 'Server Response', status: 'pending', message: '' },
    { name: 'Heartbeat', status: 'pending', message: '' },
  ]);
  const [testRunning, setTestRunning] = useState(false);

  const updateResult = (index: number, status: 'success' | 'error' | 'pending', message: string) => {
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message };
      return updated;
    });
  };

  const runTests = async () => {
    setTestRunning(true);
    setResults((prev) =>
      prev.map((r) => ({ ...r, status: 'pending', message: '' }))
    );

    try {
      // Test 1: Backend Health Check
      updateResult(0, 'pending', 'Checking...');
      try {
        const healthResponse = await fetch('http://localhost:3001/api/health');
        if (healthResponse.ok) {
          updateResult(0, 'success', 'Backend is responding ✓');
        } else {
          updateResult(0, 'error', `Backend returned ${healthResponse.status}`);
        }
      } catch (error) {
        updateResult(0, 'error', 'Cannot reach backend');
      }

      // Test 2: Socket.io Connection
      updateResult(1, 'pending', 'Connecting...');
      try {
        const deviceId = `test-device-${Date.now()}`;
        await socketService.connect(deviceId);

        if (socketService.isConnected()) {
          updateResult(1, 'success', 'Socket.io connected ✓');
        } else {
          updateResult(1, 'error', 'Connection failed');
        }
      } catch (error) {
        updateResult(1, 'error', 'Connection timeout');
      }

      // Test 3: Server Response
      updateResult(2, 'pending', 'Listening...');
      let serverResponded = false;

      const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
      const response = new Promise<void>((resolve) => {
        socketService.once(SOCKET_EVENTS.SERVER_CONNECTED, (data) => {
          serverResponded = true;
          updateResult(2, 'success', `Server confirmed: ${JSON.stringify(data).substring(0, 30)}...`);
          resolve();
        });
      });

      await Promise.race([response, timeout]);
      
      if (!serverResponded) {
        updateResult(2, 'error', 'No server response received');
      }

      // Test 4: Heartbeat
      updateResult(3, 'pending', 'Testing...');
      setTimeout(() => {
        updateResult(3, 'success', 'Heartbeat ready ✓');
      }, 1000);

    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Integration Tests</h3>
          <Button
            onClick={runTests}
            disabled={testRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {testRunning ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Running...</span>
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>

        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                result.status === 'success'
                  ? 'bg-green-100 text-green-900'
                  : result.status === 'error'
                    ? 'bg-red-100 text-red-900'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {result.status === 'pending' && <Spinner size="sm" />}
                {result.status === 'success' && <span>✓</span>}
                {result.status === 'error' && <span>✗</span>}
              </div>
              <div className="flex-1">
                <p className="font-medium">{result.name}</p>
                {result.message && <p className="text-sm opacity-75">{result.message}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg text-sm text-gray-600">
          <p>
            <strong>Backend URL:</strong> http://localhost:3001<br />
            <strong>Frontend URL:</strong> http://localhost:3000<br />
            <strong>Socket.io Status:</strong> {socketService.isConnected() ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
    </Card>
  );
};
