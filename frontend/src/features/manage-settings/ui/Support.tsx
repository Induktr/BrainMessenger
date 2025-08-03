'use client';

import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { 
  ArrowLeft, 
  CloseModal 
} from '@/shared/assets/Icons/icons';
import { 
  SupportProps 
} from '@/features/manage-settings/model/settings.types'
import { 
  useTranslation 
} from 'react-i18next';
import { 
  variantsStylesIcons 
} from '@/shared/assets/variantStyles/variantStyles';

const Support: React.FC<SupportProps> = ({ onBack, onClose, isOpen }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft alt="Back" className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
        </Button>
        <h2 className="text-lg font-semibold">{t('support.headerTitle')}</h2>
        <Button variant="ghost" onClick={onClose}>
          <CloseModal alt="Close" className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
        </Button>
      </div>

      {/* Body */}
      <div className="pt-6 space-y-4">
        <div>
          <h3 className="font-semibold text-md mb-2">{t('support.ourPhilosophy')}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('support.descriptionPhilosophy')}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-md mb-2">{t('support.howToReachUs')}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('support.descriptionHowToReachUs')}
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>{t('support.email')}:</strong> <a href="mailto:support@brainmessenger.com" className="text-[var(--color-accent)] hover:underline">support@brainmessenger.com</a>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{t('support.descriptionEmail')}</p>
            </li>
            <li>
              <strong>{t('support.inAppFeedbackForm')}:</strong>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{t('support.descriptionInAppFeedbackForm')}</p>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-md mb-2">{t('support.forMoreInformation')}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('support.descriptionForMoreInformation')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;