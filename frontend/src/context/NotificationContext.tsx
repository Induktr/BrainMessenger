'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Notification {
  id: string;
  senderName: string;
  messageSnippet: string;
  avatarUrl?: string | null;
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (senderName: string, messageSnippet: string, avatarUrl?: string | null) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((senderName: string, messageSnippet: string, avatarUrl?: string | null) => {
    setNotification({
      id: Date.now().toString(), // Unique ID for each notification
      senderName,
      messageSnippet,
      avatarUrl,
    });
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