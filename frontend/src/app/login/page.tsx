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
  LOGIN_USER
} from '@/entities/user/model/user.queries';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';

import AuthLayout from '@/shared/ui/AuthLayout/AuthLayout';
import LoginForm, { LoginFormInputs } from '@/features/user-auth/ui/LoginForm';
import EmailVerificationModal from '@/features/user-auth/ui/EmailVerificationModal';
import { AppRoutes } from '@/shared/config/paths';

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUserState, showEmailVerificationModal, setShowEmailVerificationModal, refetchUser } = useAuth();

  // State for the main login form
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  // State for the settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mutations
  const [loginUser, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_USER);

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
          router.replace(AppRoutes.CHAT);
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

  const handleBack = () => {
    router.push(AppRoutes.REGISTER);
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

      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onSuccess={() => router.replace(AppRoutes.CHAT)}
        user={user}
      />
    </>
  );
};

export default LoginPage;