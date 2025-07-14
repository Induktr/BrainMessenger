'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n';

type Language = 'en' | 'ru' | 'ua';

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'ru', 'ua'].includes(savedLanguage)) {
      return savedLanguage;
    }
  }
  return 'en';
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.body.setAttribute('data-language', language);
    i18n.changeLanguage(language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prevLanguage) => {
      if (prevLanguage === 'en') return 'ru';
      if (prevLanguage === 'ru') return 'ua';
      return 'en';
    });
  };

  const setLanguage = (newLanguage: Language) => {
    if (['en', 'ru', 'ua'].includes(newLanguage)) {
      setLanguageState(newLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};