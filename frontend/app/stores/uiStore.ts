'use client';

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  // Modals
  showPairingModal: boolean;
  showSettingsModal: boolean;

  // Notifications
  notifications: Notification[];

  // Loading
  isLoading: boolean;

  // Actions
  setPairingModal: (show: boolean) => void;
  setSettingsModal: (show: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  showPairingModal: false,
  showSettingsModal: false,
  notifications: [],
  isLoading: false,

  // Actions
  setPairingModal: (show: boolean) => set({ showPairingModal: show }),

  setSettingsModal: (show: boolean) => set({ showSettingsModal: show }),

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
