import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button/Button';
import { BanUserModalProps } from '@/entities/admin/model/admin.types';
import Modal from '@/shared/ui/Modal/Modal';
import Input from '@/shared/ui/Input/Input';

export const BanUserModal: FC<BanUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(7);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason, duration);
    onClose();
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDuration(value);
  };

  const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-text-primary">{t('banUserModal.title', { userName })}</h2>
      <div className="space-y-4">
        <Input
          id="duration"
          type="number"
          label={t('banUserModal.durationLabel')}
          value={duration}
          onChange={handleDurationChange}
        />
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">
            {t('banUserModal.reasonLabel')}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={handleReasonChange}
            rows={4}
            className="w-full p-2 rounded-lg border bg-input-background border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            placeholder={t('banUserModal.reasonPlaceholder')}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={onClose} variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} variant="danger">
            {t('banUserModal.confirmButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

