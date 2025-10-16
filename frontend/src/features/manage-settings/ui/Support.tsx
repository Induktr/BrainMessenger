'use client';

import React from 'react';
import { 
  SupportProps 
} from '@/features/manage-settings/model/settings.types'
import { 
  useTranslation 
} from 'react-i18next';
import Link from 'next/link';
import ContentSection from '@/shared/ui/ContentSection/ContentSection';
import ModalHeader from '@/shared/ui/ModalHeader/ModalHeader';

const Support: React.FC<SupportProps> = ({ onBack, onClose, isOpen }) => {
  const { t } = useTranslation();

  const supportSections = [
    {
      title: t('support.ourPhilosophy'),
      content: <p>{t('support.descriptionPhilosophy')}</p>,
    },
    {
      title: t('support.howToReachUs'),
      content: (
        <>
          <p>{t('support.descriptionHowToReachUs')}</p>
          <ul className="mt-2 space-y-2">
            <li>
              <strong className="text-sm lg:text-base sm:text-sm text-[var(--color-text-primary)]">{t('support.email')}:</strong>{' '}
              <Link href="mailto:support@brainmessenger.com">
                support@brainmessenger.com
              </Link>
              <p className="text-sm mt-1">{t('support.descriptionEmail')}</p>
            </li>
            <li>
              <strong className="text-sm lg:text-base sm:text-sm text-[var(--color-text-primary)]">{t('support.inAppFeedbackForm')}:</strong>
              <p className="text-sm mt-1">{t('support.descriptionInAppFeedbackForm')}</p>
            </li>
          </ul>
        </>
      ),
    },
    {
      title: t('support.forMoreInformation'),
      content: <p>{t('support.descriptionForMoreInformation')}</p>,
    },
  ];

  return (
    <div className="p-6 text-[var(--color-text-primary)]">
      <ModalHeader
        title={t('support.headerTitle')}
        onBack={onBack}
        onClose={onClose}
      />

      {/* Body */}
      <div className="pt-6 space-y-4">
        {supportSections.map((section, index) => (
          <ContentSection key={index} title={section.title}>
            {section.content}
          </ContentSection>
        ))}
      </div>
    </div>
  );
};

export default Support;