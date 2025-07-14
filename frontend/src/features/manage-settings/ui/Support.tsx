'use client';

import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { ICONS } from '@/shared/assets/Icons/icons';
import { SupportProps } from '@/features/manage-settings/model/settings.types'
import { useTranslation } from 'react-i18next';

const Support: React.FC<SupportProps> = ({ onBack, onClose, isOpen }) => {
  const { t } = useTranslation();
  return (
    <div className="support-modal-content">
      {/* Header */}
      <div className="support-header">
        <Button className="support-back-button" onClick={onBack}>
          <img src={ICONS.arrowLeft} alt="Back" className="icon" style={{ transform: 'rotate(0deg)' }} />
        </Button>
        <h2 className="support-header-title">{t('support.headerTitle')}</h2>
        <Button className="support-close-button" onClick={onClose}>
          <img src={ICONS.closeModal} alt="Close" className="icon" />
        </Button>
      </div>

      {/* Separator */}
      <div className="support-separator"></div>

      {/* Body */}
      <div className="support-body">
        <h3 className="support-section-title">{t('support.ourPhilosophy')}</h3>
        <p className="support-text">
          {t('support.descriptionPhilosophy')}
        </p>

        <h3 className="support-section-title">{t('support.howToReachUs')}</h3>
        <p className="support-text">
          {t('support.descriptionHowToReachUs')}
        </p>
        <ul className="support-channels-list">
          <li className="support-channel-item">
            <strong>{t('support.email')}:</strong> <a href="mailto:support@brainmessenger.com" className="support-link">support@brainmessenger.com</a>
            <p className="support-channel-description">{t('support.descriptionEmail')}</p>
          </li>
          <li className="support-channel-item">
            <strong>{t('support.inAppFeedbackForm')}:</strong>
            <p className="support-channel-description">{t('support.descriptionInAppFeedbackForm')}</p>
          </li>
        </ul>

        <h3 className="support-section-title">{t('support.forMoreInformation')}</h3>
        <p className="support-text">
          {t('support.descriptionForMoreInformation')}
        </p>
      </div>
    </div>
  );
};

export default Support;