'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n'; // Adjust path as needed
import Button from '@/shared/ui/Button/Button';
import { ICONS } from '@/shared/assets/Icons/icons';

const LanguageSwitcherAdmin: React.FC = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="admin-language-switcher">
      <h3 className="admin-language-switcher-title">{t('languageSwitcherAdmin.title')}</h3>
      <div className="admin-language-options-list">
        <Button className="admin-language-option" onClick={() => changeLanguage('en')}>
          <div className="admin-language-option-icon"><img src={ICONS.en} alt={t('languageSwitcherAdmin.alt.en')} className="icon" /></div>
          <p className="admin-language-option-text">{t('language.english')}</p>
        </Button>
        <Button className="admin-language-option" onClick={() => changeLanguage('ua')}>
          <div className="admin-language-option-icon"><img src={ICONS.ua} alt={t('languageSwitcherAdmin.alt.ua')} className="icon" /></div>
          <p className="admin-language-option-text">{t('language.ukrainian')}</p>
        </Button>
        <Button className="admin-language-option" onClick={() => changeLanguage('ru')}>
          <div className="admin-language-option-icon"><img src={ICONS.ru} alt={t('languageSwitcherAdmin.alt.ru')} className="icon" /></div>
          <p className="admin-language-option-text">{t('language.russian')}</p>
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcherAdmin;