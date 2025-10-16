import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { SEND_VERIFICATION_EMAIL, VERIFY_EMAIL } from '@/entities/user/model/user.queries';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import { User } from '@/entities/user/model/user.types';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const { t } = useTranslation();
  const { refetchUser } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [sendVerificationEmailMutation] = useMutation(SEND_VERIFICATION_EMAIL);
  const [verifyEmailMutation, { loading: isVerifyingEmail }] = useMutation(VERIFY_EMAIL);

  useEffect(() => {
    // Reset state when modal is closed/opened
    if (!isOpen) {
      setVerificationCode('');
      setVerificationError('');
      setResendSuccess(false);
      setIsResendingCode(false);
    }
  }, [isOpen]);

  const handleResendVerificationEmail = async () => {
    if (!user) return;
    setIsResendingCode(true);
    setResendSuccess(false);
    setVerificationError('');
    try {
      await sendVerificationEmailMutation({ variables: { email: user.email } });
      setResendSuccess(true);
    } catch (error: any) {
      setVerificationError(error.message || t('login_page.resend_email_failed'));
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    setVerificationError('');
    try {
      const response = await verifyEmailMutation({ variables: { code: verificationCode } });
      if (response.data?.verifyEmail) {
        await refetchUser();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      setVerificationError(error.message || t('login_page.verification_error'));
    }
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="p-6 bg-[var(--color-surface)] rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('verification.title')}</h3>
        <p className="text-[var(--color-text-secondary)] mb-6">{t('verification.prompt', { email: user?.email })}</p>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder={t('verification.placeholder')}
          className="w-full p-3 mb-4 bg-[var(--color-input-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
        {verificationError && <p className="mt-1 text-sm text-[var(--color-danger)] mb-4">{verificationError}</p>}
        <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail} className="w-full mb-3" variant="primary">
          {isVerifyingEmail ? t('verification.verifying') : t('verification.verify_button')}
        </Button>
        <Button onClick={handleResendVerificationEmail} disabled={isResendingCode} className="w-full" variant="secondary">
          {isResendingCode ? t('verification.sending') : t('verification.resend_button')}
        </Button>
        {resendSuccess && <p className="mt-3 text-sm text-[var(--color-success)]">{t('verification.sent_success')}</p>}
      </div>
    </Modal>
  );
};

export default EmailVerificationModal;