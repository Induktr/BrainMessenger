'use client';

import { FC } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { CloseModal } from '@/shared/assets/Icons/icons';
import { Button } from '@/shared/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import { AllNotificationsModalProps } from '@/features/manage-notifications/model/notification.types';

const AllNotificationsModal: FC<AllNotificationsModalProps> = ({ isOpen, onClose, notifications }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-[10px]">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold">{t('notifications.title')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <CloseModal className="w-6 h-6" />
          </Button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-8">{t('notifications.noNotifications')}</p>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} className="border-b border-[var(--color-border)] pb-4 last:border-b-0">
                <p className="font-bold">{notification.sender.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{notification.content}</p>
                <p className="text-xs text-[var(--color-text-secondary)]/70 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default AllNotificationsModal;