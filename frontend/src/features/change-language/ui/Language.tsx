'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { ICONS } from '@/shared/assets/Icons/icons';
import Button from '@/shared/ui/Button/Button';
import { LanguageProps } from '@/features/change-language/model/change-language.types';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n'; // Adjust path as needed

const Language: React.FC<LanguageProps> = ({ isOpen, onClose, onBack }) => {
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="language-modal-content">
        {/* Header */}
        <div className="language-header">
          <Button className="language-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={ICONS.arrowLeft} alt={t('languageModal.alt.back')} className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="language-header-title">{t('languageModal.headerTitle')}</h2> {/* Title based on screenshot */}
          <Button className="language-close-button" onClick={onClose}>
            <img src={ICONS.closeModal} alt={t('languageModal.alt.close')} className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Separator */}
        <div className="language-separator"></div>

        {/* Interface Language Label */}
        <p className="language-interface-label">{t('languageModal.interfaceLabel')}</p>

        {/* Language Options List */}
        <div className="language-options-list">
          <div className="language-option" onClick={() => changeLanguage('en')}>
            <div className="language-option-icon"><img src={ICONS.en} alt={t('language.english')} className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">{t('language.english')}</p>
          </div>
          <div className="language-option" onClick={() => changeLanguage('ua')}>
            <div className="language-option-icon"><img src={ICONS.ua} alt={t('language.ukrainian')} className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">{t('language.ukrainian')}</p>
          </div>
          <div className="language-option" onClick={() => changeLanguage('ru')}>
            <div className="language-option-icon"><img src={ICONS.ru} alt={t('language.russian')} className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">{t('language.russian')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Language;