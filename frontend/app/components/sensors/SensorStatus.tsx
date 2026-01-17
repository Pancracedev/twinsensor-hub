/**
 * Sensor Status Component
 * Displays real-time sensor streaming status and data quality indicators
 */

'use client';

import { useSensorData } from '../../hooks';
import { Spinner } from '../common';

export const SensorStatus = () => {
  const { streamState } = useSensorData();

  const dataQuality = Math.round((1 - streamState.dataLoss) * 100);
  const statusColor = dataQuality >= 95 ? 'text-green-400' : 
                     dataQuality >= 80 ? 'text-yellow-400' : 
                     'text-red-400';

  return (
    <div className="space-y-4">
      {/* Streaming Status */}
      <div className="flex items-center space-x-2">
        {streamState.isStreaming ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Streaming active</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span className="text-sm text-gray-400">Not streaming</span>
          </>
        )}
      </div>

      {/* Data Quality */}
      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
        <div className="text-xs text-gray-400">Data Quality</div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-700 rounded h-2">
            <div
              className={`h-full rounded ${statusColor}`}
              style={{ width: `${dataQuality}%` }}
            />
          </div>
          <span className={`text-sm font-mono ${statusColor}`}>{dataQuality}%</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/50 p-2 rounded">
          <div className="text-gray-400">Sample Rate</div>
          <div className="text-white font-mono">{streamState.sampleRate} Hz</div>
        </div>
        <div className="bg-gray-800/50 p-2 rounded">
          <div className="text-gray-400">Latency</div>
          <div className="text-white font-mono">{streamState.latency} ms</div>
        </div>
        <div className="bg-gray-800/50 p-2 rounded">
          <div className="text-gray-400">Readings/sec</div>
          <div className="text-white font-mono">{Math.round(streamState.readingsPerSecond)}</div>
        </div>
        <div className="bg-gray-800/50 p-2 rounded">
          <div className="text-gray-400">Data Loss</div>
          <div className="text-white font-mono">{(streamState.dataLoss * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
