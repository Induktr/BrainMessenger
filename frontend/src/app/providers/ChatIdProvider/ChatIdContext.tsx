'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatIdContextType } from '@/entities/chat/model/chat.types';

const ChatIdContext = createContext<ChatIdContextType | undefined>(undefined);

export const ChatIdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatId, setChatId] = useState<string | null>(null);

  return (
    <ChatIdContext.Provider value={{ chatId, setChatId }}>
      {children}
    </ChatIdContext.Provider>
  );
};

export const useChatId = () => {
  const context = useContext(ChatIdContext);
  if (context === undefined) {
    throw new Error('useChatId must be used within a ChatIdProvider');
  }
  return context;
};