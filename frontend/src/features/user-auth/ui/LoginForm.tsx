import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, FieldErrors, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import GoogleAuthButton from '@/entities/google-auth/ui/GoogleAuthButton';
import { Mail, Castle, Eye, EyeOff } from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/variantStyles/variantStyles';

// Define the shape of the form inputs
export interface LoginFormInputs {
  email: string;
  password: string;
}

// Define the props for the LoginForm component
interface LoginFormProps {
  onSubmit: SubmitHandler<LoginFormInputs>;
  register: UseFormRegister<LoginFormInputs>;
  errors: FieldErrors<LoginFormInputs>;
  loading: boolean;
  apiError: any; // Using 'any' for now, can be refined
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSubmit: (handler: SubmitHandler<LoginFormInputs>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  register,
  errors,
  loading,
  apiError,
  showPassword,
  setShowPassword,
  handleSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          placeholder={t('login_page.email_label')}
          type="email"
          registration={register('email', { required: t('login_page.email_required') })}
          error={errors.email?.message}
          icon={<Mail className={`${variantsStylesIcons.iconAccent} w-6 h-6`} />}
        />
        <Input
          id="password"
          placeholder={t('login_page.password_label')}
          type={showPassword ? 'text' : 'password'}
          registration={register('password', { required: t('login_page.password_required') })}
          error={errors.password?.message}
          icon={<Castle className={`${variantsStylesIcons.iconAccent} w-6 h-6`} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
              {showPassword ? (
                <EyeOff className={`${variantsStylesIcons.iconAccent} w-6 h-6`} />
              ) : (
                <Eye className={`${variantsStylesIcons.iconAccent} w-6 h-6`} />
              )}
            </button>
          }
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('login_page.logging_in') : t('login_page.login_button')}
        </Button>
        {apiError && (
          <div className="text-danger text-sm text-center">
            {apiError.graphQLErrors && apiError.graphQLErrors.length > 0
              ? apiError.graphQLErrors.map((err: any, index: number) => <p key={index}>{err.message}</p>)
              : <p>{apiError.message}</p>}
          </div>
        )}
      </form>

      <div className="mt-6">
        <GoogleAuthButton type='login' />
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        {t('login_page.no_account_prompt')}{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          {t('login_page.register_link')}
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
