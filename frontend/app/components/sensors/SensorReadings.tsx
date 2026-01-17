/**
 * Sensor Readings Component
 * Displays raw sensor readings for accelerometer and gyroscope
 */

'use client';

import { useSensorData } from '../../hooks';
import { calculateMagnitude } from '../../utils';

interface SensorDisplayProps {
  label: string;
  reading?: {
    x: number;
    y: number;
    z: number;
  };
  unit: string;
  decimals?: number;
}

const SensorDisplay = ({ label, reading, unit, decimals = 2 }: SensorDisplayProps) => {
  if (!reading) {
    return (
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">{label}</div>
        <div className="text-center text-gray-500 text-sm">No data</div>
      </div>
    );
  }

  const magnitude = calculateMagnitude(reading.x, reading.y, reading.z);

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="font-mono">
          <div className="text-gray-500">X</div>
          <div className="text-white">{reading.x.toFixed(decimals)}</div>
        </div>
        <div className="font-mono">
          <div className="text-gray-500">Y</div>
          <div className="text-white">{reading.y.toFixed(decimals)}</div>
        </div>
        <div className="font-mono">
          <div className="text-gray-500">Z</div>
          <div className="text-white">{reading.z.toFixed(decimals)}</div>
        </div>
      </div>
      <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
        <span className="text-gray-400">Magnitude</span>
        <span className="text-yellow-400 font-mono">{magnitude.toFixed(decimals)} {unit}</span>
      </div>
    </div>
  );
};

export const SensorReadings = () => {
  const { latestAccelerometerReading, latestGyroscopeReading } = useSensorData();

  return (
    <div className="space-y-3">
      <SensorDisplay
        label="Accelerometer"
        reading={latestAccelerometerReading ? {
          x: latestAccelerometerReading.x,
          y: latestAccelerometerReading.y,
          z: latestAccelerometerReading.z,
        } : undefined}
        unit="m/s²"
        decimals={3}
      />
      <SensorDisplay
        label="Gyroscope"
        reading={latestGyroscopeReading ? {
          x: latestGyroscopeReading.x,
          y: latestGyroscopeReading.y,
          z: latestGyroscopeReading.z,
        } : undefined}
        unit="rad/s"
        decimals={3}
      />
    </div>
  );
};
