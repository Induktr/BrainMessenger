'use client';

import React from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import i18n from '../../i18n'; // Adjust path as needed
import Button from '@/shared/ui/Button/Button';
import { 
  En, 
  Ru, 
  Ua 
} from '@/shared/assets/Icons/icons';

const LanguageSwitcherAdmin: React.FC = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">{t('languageSwitcherAdmin.title')}</h3>
      <div className="flex flex-col space-y-3">
        <Button className="flex items-center p-3 rounded-lg bg-background hover:bg-border transition-colors duration-200" onClick={() => changeLanguage('en')}>
          <div className="mr-3"><En alt={t('languageSwitcherAdmin.alt.en')} className="w-6 h-6" /></div>
          <p className="text-text-primary">{t('language.english')}</p>
        </Button>
        <Button className="flex items-center p-3 rounded-lg bg-background hover:bg-border transition-colors duration-200" onClick={() => changeLanguage('ua')}>
          <div className="mr-3"><Ua alt={t('languageSwitcherAdmin.alt.ua')} className="w-6 h-6" /></div>
          <p className="text-text-primary">{t('language.ukrainian')}</p>
        </Button>
        <Button className="flex items-center p-3 rounded-lg bg-background hover:bg-border transition-colors duration-200" onClick={() => changeLanguage('ru')}>
          <div className="mr-3"><Ru alt={t('languageSwitcherAdmin.alt.ru')} className="w-6 h-6" /></div>
          <p className="text-text-primary">{t('language.russian')}</p>
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcherAdmin;