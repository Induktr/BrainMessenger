'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { 
  ArrowLeft, 
  ArrowRight, 
  En, 
  Ua, 
  Ru,
  CloseModal
} from '@/shared/assets/Icons/icons';
import Button from '@/shared/ui/Button/Button';
import { LanguageProps } from '@/features/change-language/model/change-language.types';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n'; // Adjust path as needed
import { useLanguage } from '@/app/providers/LanguageProvider/LanguageСontext';
import { variantsStylesIcons } from '@/shared/assets/variantStyles/variantStyles';

const Language: React.FC<LanguageProps> = ({ isOpen, onClose, onBack }) => {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toggleLanguage();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="p-5 bg-[var(--color-input-background)] rounded-lg text-[var(--color-text-primary)] w-full max-w-sm mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
          </Button>
          <h2 className="text-lg font-bold">{t('languageModal.headerTitle')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <CloseModal className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
          </Button>
        </div>

        {/* Separator */}
        <div className="border-t border-[var(--color-border)]"></div>

        {/* Interface Language Label */}
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{t('languageModal.interfaceLabel')}</p>

        {/* Language Options List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center p-3 rounded-lg hover:bg-[var(--color-surface-dark)] cursor-pointer transition-colors" onClick={() => changeLanguage('en')}>
            <div className={`${variantsStylesIcons.iconAccent} w-6 h-6 mr-3`}><En /></div>
            <p className="font-semibold">{t('language.english')}</p>
          </div>
          <div className="flex items-center p-3 rounded-lg hover:bg-[var(--color-surface-dark)] cursor-pointer transition-colors" onClick={() => changeLanguage('ua')}>
            <div className={`${variantsStylesIcons.iconAccent} w-6 h-6 mr-3`}><Ua /></div>
            <p className="font-semibold">{t('language.ukrainian')}</p>
          </div>
          <div className="flex items-center p-3 rounded-lg hover:bg-[var(--color-surface-dark)] cursor-pointer transition-colors" onClick={() => changeLanguage('ru')}>
            <div className={`${variantsStylesIcons.iconAccent} w-6 h-6 mr-3`}><Ru /></div>
            <p className="font-semibold">{t('language.russian')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Language;