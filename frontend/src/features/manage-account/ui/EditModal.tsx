import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import { 
  useTranslation 
} from 'react-i18next';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingField: 'name' | 'username' | 'email' | null;
  editValue: string;
  setEditValue: (value: string) => void;
  editError: string;
  isVerified?: boolean;
  onResendVerificationEmail?: () => void;
  isResendingCode?: boolean;
  resendSuccess?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingField,
  editValue,
  setEditValue,
  editError,
  isVerified,
  onResendVerificationEmail,
  isResendingCode,
  resendSuccess,
}) => {
  const { t } = useTranslation();

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="text-[var(--color-text-primary)] rounded-[10px]">
        <h3 className="text-lg font-semibold mb-4">{t('myAccount.editModal.title', { field: editingField })}</h3>
        <input
          type={editingField === 'email' ? 'email' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-2 rounded-lg bg-[var(--color-input-background)] border border-[var(--color-border)] focus:outline-none"
        />
        {editingField === 'email' && (
          <div className="mt-4 text-sm">
            <p>
              {t('myAccount.editModal.statusLabel')}{' '}
              <span className={isVerified ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                {isVerified ? t('myAccount.editModal.verified') : t('myAccount.editModal.notVerified')}
              </span>
            </p>
            {!isVerified && (
              <Button onClick={onResendVerificationEmail} disabled={isResendingCode} variant="secondary" size="sm" className="mt-2">
                {isResendingCode ? t('myAccount.editModal.sending') : t('myAccount.editModal.resendButton')}
              </Button>
            )}
            {resendSuccess && <p className="text-[var(--color-success)] mt-2">{t('myAccount.verifyModal.resendSuccess')}</p>}
            {editError && <p className="text-[var(--color-danger)] mt-2">{editError}</p>}
          </div>
        )}
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={onClose} variant="secondary">{t('myAccount.buttons.cancel')}</Button>
          <Button onClick={onSave}>{t('myAccount.buttons.save')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditModal;