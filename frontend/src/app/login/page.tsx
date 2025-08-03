'use client';

import React, { 
  useState
} from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  useForm, 
  SubmitHandler 
} from 'react-hook-form';
import { 
  useMutation 
} from '@apollo/client';
import { 
  useRouter 
} from 'next/navigation';

import { 
  LOGIN_USER,
  SEND_VERIFICATION_EMAIL,
  VERIFY_EMAIL
} from '@/entities/user/model/user.queries';
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext';

import AuthLayout from '@/shared/ui/AuthLayout/AuthLayout';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import LoginForm, { 
  LoginFormInputs 
} from '@/features/user-auth/ui/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUserState, showEmailVerificationModal, setShowEmailVerificationModal, refetchUser } = useAuth();

  // State for the main login form
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  // State for the settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // State for the email verification modal
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Mutations
  const [loginUser, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_USER);
  const [sendVerificationEmailMutation, { loading: isSendingVerificationEmail }] = useMutation(SEND_VERIFICATION_EMAIL);
  const [verifyEmailMutation, { loading: isVerifyingEmail }] = useMutation(VERIFY_EMAIL);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await loginUser({
        variables: { email: data.email, password: data.password },
      });

      if (response.data?.login?.access_token) {
        localStorage.setItem('access_token', response.data.login.access_token);
        localStorage.setItem('refresh_token', response.data.login.refresh_token);
        setUserState(response.data.login.user);

        if (response.data.login.user.isVerified) {
          router.replace('/chat');
        } else {
          setShowEmailVerificationModal(true);
        }
      } else {
        console.error('Login failed: No access token received');
      }
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const handleEmailVerificationModalClose = () => {
    setShowEmailVerificationModal(false);
    setVerificationCode('');
    setVerificationError('');
    setResendSuccess(false);
    setIsResendingCode(false);
  };

  const handleResendVerificationEmail = async () => {
    if (!user || isResendingCode) return;
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
  const handleBack = () => {
    router.push('/register');
  }

  const handleVerifyEmail = async () => {
    if (!user) return;
    setVerificationError('');
    try {
      const response = await verifyEmailMutation({ variables: { code: verificationCode } });
      if (response.data?.verifyEmail) {
        await refetchUser();
        handleEmailVerificationModalClose();
        router.replace('/chat'); // Redirect to chat after successful verification
      }
    } catch (error: any) {
      setVerificationError(error.message || t('login_page.verification_error'));
    }
  };

  return (
    <>
      <AuthLayout
        subtitle={t('login_page.field_password_email_prompt')}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isSettingsOpen={isSettingsOpen}
        onSettingsClose={() => setIsSettingsOpen(false)}
        handleBackPage={handleBack}
      >
        <LoginForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          loading={loginLoading}
          apiError={loginError}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleSubmit={handleSubmit}
        />
      </AuthLayout>

      {showEmailVerificationModal && user && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={showEmailVerificationModal}>
          <div className="p-6 bg-[var(--color-surface)] rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('verification.title')}</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">{t('verification.prompt', { email: user.email })}</p>
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
      )}
    </>
  );
};

export default LoginPage;