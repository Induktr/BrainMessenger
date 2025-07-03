'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DeepWorkContextType {
  isDeepWorkActive: boolean;
  toggleDeepWork: () => void;
}

const DeepWorkContext = createContext<DeepWorkContextType | undefined>(undefined);

export const DeepWorkProvider = ({ children }: { children: ReactNode }) => {
  const [isDeepWorkActive, setIsDeepWorkActive] = useState(false);

  const toggleDeepWork = () => {
    setIsDeepWorkActive(prev => !prev);
  };

  return (
    <DeepWorkContext.Provider value={{ isDeepWorkActive, toggleDeepWork }}>
      {children}
    </DeepWorkContext.Provider>
  );
};

export const useDeepWork = () => {
  const context = useContext(DeepWorkContext);
  if (context === undefined) {
    throw new Error('useDeepWork must be used within a DeepWorkProvider');
  }
  return context;
};
