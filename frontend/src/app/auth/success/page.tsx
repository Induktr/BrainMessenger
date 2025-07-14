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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-textPrimary-dark p-4">
      <h1 className="text-2xl font-bold text-center">{t('auth_success_page.processing')}</h1>
      <p className="text-center">{t('auth_success_page.redirecting')}</p>

      {showEmailVerificationModal && currentUser && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={showEmailVerificationModal}>
          <div className="verification-modal-content">
            <h3>{t('verification.title')}</h3>
            <p>{t('verification.prompt', { email: currentUser.email })}</p>
            <Input
              id="verificationCode"
              label={t('verification.placeholder')}
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={verificationError}
            />
            <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail}>
              {isVerifyingEmail ? t('verification.verifying') : t('verification.verify_button')}
            </Button>
            <Button onClick={handleResendVerificationEmail} disabled={isResendingCode}>
              {isResendingCode ? t('verification.sending') : t('verification.resend_button')}
            </Button>
            {resendSuccess && <p className="success-message">{t('verification.sent_success')}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuthSuccessPage;