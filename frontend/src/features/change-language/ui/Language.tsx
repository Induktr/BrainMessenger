'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { En, Ua, Ru } from '@/shared/assets/Icons/icons';
import ModalHeader from '@/shared/ui/ModalHeader/ModalHeader';
import ListItem from '@/shared/ui/ListItem/ListItem';
import { LanguageProps } from '@/features/change-language/model/change-language.types';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n'; // Adjust path as needed
import { useLanguage } from '@/app/providers/LanguageProvider/LanguageСontext';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

const Language: React.FC<LanguageProps> = ({ isOpen, onClose, onBack }) => {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toggleLanguage();
  };

  const languages = [
    {
      code: 'en',
      icon: <En />,
      name: t('language.english'),
    },
    {
      code: 'ua',
      icon: <Ua />,
      name: t('language.ukrainian'),
    },
    {
      code: 'ru',
      icon: <Ru />,
      name: t('language.russian'),
    },
  ];

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="p-5 bg-[var(--color-input-background)] rounded-lg text-[var(--color-text-primary)] w-full max-w-sm mx-auto flex flex-col gap-4">
        <ModalHeader
          title={t('languageModal.headerTitle')}
          onBack={onBack}
          onClose={onClose}
          className="!pb-0 !border-none"
        />

        {/* Interface Language Label */}
        <p className="text-sm lg:text-base sm:text-sm font-medium text-[var(--color-text-secondary)] pt-4 border-t border-[var(--color-border)]">
          {t('languageModal.interfaceLabel')}
        </p>

        {/* Language Options List */}
        <div className="flex flex-col gap-2 text-sm lg:text-base sm:text-sm">
          {languages.map((lang) => (
            <ListItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              icon={<div className={`${variantsStylesIcons.iconAccent} w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5`}>{lang.icon}</div>}
              text={lang.name}
              className="hover:bg-[var(--color-surface-dark)]"
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default Language;