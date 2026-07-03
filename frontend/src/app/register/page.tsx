'use client';

import { 
  useState, 
  useMemo 
} from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  useForm, 
  SubmitHandler 
} from 'react-hook-form';
import { 
  useRouter 
} from 'next/navigation';
import { Button } from '@/shared/ui/Button/Button';
import ProgressIndicator from '@/shared/ui/ProgressIndicator/ProgressIndicator';
import { 
  useMutation 
} from '@apollo/client/react';
import { 
  REGISTER_USER
} from '@/entities/user/model/user.queries'; // Import mutations
import { 
  ArrowRight
} from '@/shared/assets/Icons/icons';
import VerificationCodeInput from '@/features/user-auth/ui/VerificationCodeInput';
import RegistrationFormFields from '@/features/user-auth/ui/RegistrationFormFields';
import { 
  RegisterFormInputs 
} from '@/features/user-auth/model/user-auth.types';
import { 
  variantsStylesIcons
} from '@/shared/assets/VariantStyles/variantStyles';
import GoogleAuthButton from '@/entities/google-auth/ui/GoogleAuthButton';
import AuthPrompt from '@/shared/ui/AuthPrompt/AuthPrompt';
import AuthLayout from '@/shared/ui/AuthLayout/AuthLayout';
import { AppRoutes } from '@/shared/config/paths';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const stepsData = t('register_page.steps', { returnObjects: true });
  const registrationSteps: any[] = Array.isArray(stepsData) ? stepsData : [];
  const currentStepConfig = registrationSteps[currentStep - 1] || {};
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormInputs>({
    mode: 'onChange'
  });

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const router = useRouter();
  const [registerUser, { error: errorRegistration }] = useMutation(REGISTER_USER);
  const [currentView, setCurrentView] = useState('');

  const handleNext = async () => {
    if (currentStep === registrationSteps.length - 1) {
      try {
        const response = await registerUser({
          variables: {
            email: watch('email'),
            password: watch('password'),
            name: watch('name'),
            username: watch('username'),
          },
        });

        if (response.data && response.data.register) {
          setRegisteredEmail(watch('email'));
          setCurrentStep(currentStep + 1);
        }
      } catch (e) {
        console.error('Registration error:', e);
      }
    } else if (currentStep < registrationSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentFields = currentStepConfig.fields?.map((field: any) => field.name as keyof RegisterFormInputs) || [];
  const watchedValues = watch(currentFields);
  const isNextButtonDisabled = useMemo(() => {
    if (!currentFields.length) return false;
    const hasEmptyFields = watchedValues.some((value: string) => !value);
    const hasErrors = currentFields.some((field: keyof RegisterFormInputs) => errors[field]);
    return hasEmptyFields || hasErrors;
  }, [watchedValues, errors, currentFields]);

  const handleBack = () => {
    if (currentStep === 1) {
      router.push(AppRoutes.WELCOME); // Navigate to welcome page
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSmallSettingsClick = () => {
    setCurrentView('smallSettings')
  }

  const handleClose = () => {
    setCurrentView('')
  }

  const onVerificationSuccess = () => {
    router.push(AppRoutes.LOGIN);
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = async () => {
    if (currentStep < registrationSteps.length) {
      await handleNext();
    }
  };

  return (
    <AuthLayout
      subtitle={currentStepConfig.subtitle}
      onSettingsClick={handleSmallSettingsClick}
      isSettingsOpen={currentView === 'smallSettings'}
      onSettingsClose={handleClose}
      handleBackPage={handleBack}
    >
      <div className="w-full max-w-md">
            <AuthPrompt
              textKey={currentStepConfig.prompt}
              textKeyOptions={
                currentStepConfig.component === 'VerificationCodeInput'
                  ? { email: registeredEmail }
                  : undefined
              }
            />

        <ProgressIndicator currentStep={currentStep} totalSteps={registrationSteps.length} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>

            {currentStepConfig.component === 'VerificationCodeInput' ? (
              <VerificationCodeInput
                email={registeredEmail || ''}
                onSuccess={onVerificationSuccess}
              />
            ) : (
              <RegistrationFormFields
                fields={currentStepConfig.fields || []}
                register={register}
                errors={errors}
                watch={watch}
              />
            )}
          </div>

          {currentStep < registrationSteps.length && (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full flex items-center transparent justify-center"
              disabled={isNextButtonDisabled}
            >
              {t('register_page.next_button')}
              <ArrowRight className={`${variantsStylesIcons.iconPrimary} w-5 h-5 ml-3`} />
            </Button>
          )}

          {errorRegistration && <p className="text-[var(--color-danger)] text-sm text-center mt-2">{errorRegistration.message}</p>}
        </form>

        <div className="mt-6 text-center">
          <GoogleAuthButton type='register' />
             <AuthPrompt
            textKey="register_page.already_have_account"
            linkTextKey={t("register_page.login_link")}
            optionPage="login"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
