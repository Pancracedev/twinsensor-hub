/**
 * Device Orientation Display Component
 * Shows the current device orientation in Euler angles
 * (Phase 2A - placeholder for 3D visualization in Phase 2B)
 */

'use client';

import { useSensorData } from '../../hooks';
import { formatSensorValue } from '../../utils';

export const DeviceOrientationDisplay = () => {
  const { latestOrientation } = useSensorData();

  if (!latestOrientation) {
    return (
      <div className="bg-gray-800/50 p-4 rounded-lg text-center text-gray-400">
        <p className="text-sm">Waiting for orientation data...</p>
      </div>
    );
  }

  const { euler } = latestOrientation;
  const rollDeg = (euler.x * 180) / Math.PI;
  const pitchDeg = (euler.y * 180) / Math.PI;
  const yawDeg = (euler.z * 180) / Math.PI;

  return (
    <div className="space-y-3">
      {/* 3D Visualization Placeholder */}
      <div className="bg-gray-800/50 rounded-lg p-8 aspect-square flex items-center justify-center border border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-2">📱</div>
          <div className="text-xs text-gray-400">3D Visualization</div>
          <div className="text-xs text-gray-500 mt-1">(Coming in Phase 2)</div>
        </div>
      </div>

      {/* Euler Angles */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Roll</div>
          <div className="text-lg font-mono text-blue-400">{rollDeg.toFixed(1)}°</div>
          <div className="text-xs text-gray-500 mt-1">X-axis</div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Pitch</div>
          <div className="text-lg font-mono text-green-400">{pitchDeg.toFixed(1)}°</div>
          <div className="text-xs text-gray-500 mt-1">Y-axis</div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Yaw</div>
          <div className="text-lg font-mono text-red-400">{yawDeg.toFixed(1)}°</div>
          <div className="text-xs text-gray-500 mt-1">Z-axis</div>
        </div>
      </div>

      {/* Quaternion Display */}
      <div className="bg-gray-800/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Quaternion</div>
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="font-mono">
            <div className="text-gray-500">W</div>
            <div className="text-white">{latestOrientation.quaternion.w.toFixed(3)}</div>
          </div>
          <div className="font-mono">
            <div className="text-gray-500">X</div>
            <div className="text-white">{latestOrientation.quaternion.x.toFixed(3)}</div>
          </div>
          <div className="font-mono">
            <div className="text-gray-500">Y</div>
            <div className="text-white">{latestOrientation.quaternion.y.toFixed(3)}</div>
          </div>
          <div className="font-mono">
            <div className="text-gray-500">Z</div>
            <div className="text-white">{latestOrientation.quaternion.z.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
