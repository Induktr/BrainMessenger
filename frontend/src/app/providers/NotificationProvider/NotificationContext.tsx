'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Notification, NotificationContextType } from '@/features/manage-notifications/model/notification.types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationSound = typeof Audio !== 'undefined' ? new Audio('/sound/notification.mp3') : null;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((newNotification: Notification) => {
    setNotification(newNotification);
    if (notificationSound) {
      notificationSound.play().catch(error => console.error("Error playing notification sound:", error));
    }
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};