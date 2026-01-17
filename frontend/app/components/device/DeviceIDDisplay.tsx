'use client';

import { useDevice } from '../../hooks';
import { useState } from 'react';
import { Card, Button } from '../common';

export const DeviceIDDisplay = () => {
  const { deviceId } = useDevice();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (deviceId) {
      navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="text-center">
      <h3 className="text-lg font-semibold mb-4">Your Device ID</h3>
      <p className="font-mono text-2xl text-blue-600 dark:text-blue-400 mb-4 break-all">
        {deviceId || 'Generating...'}
      </p>
      <Button onClick={copyToClipboard} size="sm">
        {copied ? '✓ Copied!' : 'Copy ID'}
      </Button>
    </Card>
  );
};
