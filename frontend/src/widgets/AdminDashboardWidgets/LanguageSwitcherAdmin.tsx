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

const languages = [
  { code: 'en', nameKey: 'language.english', altKey: 'languageSwitcherAdmin.alt.en', Icon: En },
  { code: 'ua', nameKey: 'language.ukrainian', altKey: 'languageSwitcherAdmin.alt.ua', Icon: Ua },
  { code: 'ru', nameKey: 'language.russian', altKey: 'languageSwitcherAdmin.alt.ru', Icon: Ru },
];

const LanguageButton: React.FC<{ lang: typeof languages[0], onClick: (code: string) => void }> = ({ lang, onClick }) => {
  const { t } = useTranslation();
  return (
    <Button className="flex items-center p-3 rounded-lg bg-background hover:bg-border transition-colors duration-200" onClick={() => onClick(lang.code)}>
      <div className="mr-3"><lang.Icon alt={t(lang.altKey)} className="w-6 h-6" /></div>
      <p className="text-text-primary">{t(lang.nameKey)}</p>
    </Button>
  );
};

const LanguageSwitcherAdmin: React.FC = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-4">{t('languageSwitcherAdmin.title')}</h3>
      <div className="flex flex-col space-y-3">
        {languages.map((lang) => (
          <LanguageButton key={lang.code} lang={lang} onClick={changeLanguage} />
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcherAdmin;