'use client';

import { useEffect, useCallback } from 'react';
import { socketService } from '../services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSocket = <T = any>(
  event: string,
  callback: (data: T) => void,
  enabled = true
) => {
  const emit = useCallback(
    (data: T) => {
      socketService.emit(event, data);
    },
    [event]
  );

  useEffect(() => {
    if (!enabled) return;

    socketService.on<T>(event, callback);

    return () => {
      socketService.off(event);
    };
  }, [event, callback, enabled]);

  return { emit };
};
