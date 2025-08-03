'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL, SEND_VERIFICATION_EMAIL } from '@/entities/user/model/user.queries';
import Modal from '@/shared/ui/Modal/Modal';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';

const AuthSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserState, user: currentUser, refetchUser } = useAuth();
  const { t } = useTranslation();

  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [verifyEmailMutation, { loading: isVerifyingEmail }] = useMutation(VERIFY_EMAIL);
  const [sendVerificationEmailMutation, { loading: isSendingVerificationEmail }] = useMutation(SEND_VERIFICATION_EMAIL);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userDataString = searchParams.get('user');

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      console.log('AuthSuccessPage: Tokens received and stored.');

      if (userDataString) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataString));
          setUserState(userData);
          console.log('AuthSuccessPage: User data received and set in AuthContext.');

          if (!userData.isVerified) {
            setShowEmailVerificationModal(true);
          } else {
            router.replace('/chat');
          }
        } catch (error) {
          console.error('AuthSuccessPage: Failed to parse user data from URL:', error);
          router.replace('/login?error=auth_failed');
        }
      } else {
        console.error('AuthSuccessPage: Missing user data in URL.');
        router.replace('/login?error=auth_failed');
      }
    } else {
      console.error('AuthSuccessPage: Missing access_token or refresh_token in URL.');
      router.replace('/login?error=auth_failed');
    }
  }, [searchParams, router, setUserState]);

  const handleEmailVerificationModalClose = () => {
    setShowEmailVerificationModal(false);
    setVerificationCode('');
    setVerificationError('');
    setResendSuccess(false);
    setIsResendingCode(false);
  };

  const handleResendVerificationEmail = async () => {
    if (!currentUser || isResendingCode) return;
    setIsResendingCode(true);
    setResendSuccess(false);
    setVerificationError('');
    try {
      await sendVerificationEmailMutation({ variables: { email: currentUser.email } });
      setResendSuccess(true);
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      setVerificationError(error.message || t('login_page.resend_email_failed'));
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!currentUser) return;
    setVerificationError('');
    try {
      const response = await verifyEmailMutation({
        variables: { code: verificationCode },
      });
      if (response.data && response.data.verifyEmail) {
        refetchUser(); // Refetch user data to update isVerified status
        handleEmailVerificationModalClose();
        router.replace('/chat'); // Redirect to chat after successful verification
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setVerificationError(error.message || t('login_page.verification_error'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary p-4">
      <h1 className="text-2xl font-bold text-center mb-2">{t('auth_success_page.processing')}</h1>
      <p className="text-center text-text-secondary mb-4">{t('auth_success_page.redirecting')}</p>

      {showEmailVerificationModal && currentUser && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={showEmailVerificationModal}>
          <div className="p-6 bg-surface rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-text-primary mb-4">{t('verification.title')}</h3>
            <p className="text-text-secondary mb-6">{t('verification.prompt', { email: currentUser.email })}</p>
            <Input
              id="verificationCode"
              label={t('verification.placeholder')}
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={verificationError}
            />
            {verificationError && <p className="mt-1 text-sm text-danger mb-4">{verificationError}</p>}
            <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail} className="w-full mb-3" variant="primary">
              {isVerifyingEmail ? t('verification.verifying') : t('verification.verify_button')}
            </Button>
            <Button onClick={handleResendVerificationEmail} disabled={isResendingCode} className="w-full" variant="secondary">
              {isResendingCode ? t('verification.sending') : t('verification.resend_button')}
            </Button>
            {resendSuccess && <p className="mt-3 text-sm text-success">{t('verification.sent_success')}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuthSuccessPage;