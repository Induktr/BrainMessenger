'use client';

import React, { 
  useState, 
  useRef 
} from 'react';
import { 
  useEffect,
  useMemo
} from 'react';
import {
  useTranslation
} from 'react-i18next';
import { 
  useForm, 
  SubmitHandler 
} from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import InputCell from '@/shared/ui/InputCell/InputCell';
import { 
  useRouter 
} from 'next/navigation';
import ProgressIndicator from '@/shared/ui/ProgressIndicator/ProgressIndicator';
import { 
  useMutation 
} from '@apollo/client';
import { 
  REGISTER_USER, 
  VERIFY_EMAIL, 
  SEND_VERIFICATION_EMAIL 
} from '@/entities/user/model/user.queries'; // Import mutations
import { 
  Castle, 
  Man, 
  UsernameDog, 
  Mail, 
  ArrowRight,
  ArrowBack, 
  Eye, 
  EyeOff 
} from '@/shared/assets/Icons/icons';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { 
  RegisterFormInputs 
} from '@/features/user-auth/model/user-auth.types';
import { 
  variantsStylesIcons
} from '@/shared/assets/variantStyles/variantStyles';
import GoogleAuthButton from '@/entities/google-auth/ui/GoogleAuthButton';
import AuthPrompt from '@/shared/ui/AuthPrompt/AuthPrompt';
import { 
  useFeedbackAnimation 
} from '@/hooks/useFeedbackAnimation';
import AuthLayout from '@/shared/ui/AuthLayout/AuthLayout';

const iconComponents: { [key: string]: React.ElementType } = {
  Castle,
  Man,
  UsernameDog,
  Mail,
};

const RegisterPage = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const stepsData = t('register_page.steps', { returnObjects: true });
  const registrationSteps: any[] = Array.isArray(stepsData) ? stepsData : [];
  const currentStepConfig = registrationSteps[currentStep - 1] || {};
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string[]>(Array(8).fill('')); // State for the 8-digit code
  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(Array(8).fill(null).map(() => React.createRef())); // Refs for input cells
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<RegisterFormInputs>({
    mode: 'onChange'
  });
  const password = watch('password', '');
  const email = watch('email'); // Watch the email field
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null); // New state to store the registered email
  const router = useRouter();
  const [registerUser, { error: errorRegistration }] = useMutation(REGISTER_USER);
  const [verifyEmail, { loading: loadingVerification, error: errorVerification }] = useMutation(VERIFY_EMAIL); // Use useMutation for verification
  const [resendVerificationCode, { loading: loadingResend, error: errorResend }] = useMutation(SEND_VERIFICATION_EMAIL); // Use useMutation for resending code
  const [verificationSuccess, setVerificationSuccess] = useState(false); // State for verification success
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const { triggerAnimation: triggerGlitch, animationClassName: glitchClassName } = useFeedbackAnimation('glitch-effect', 400);
  const { triggerAnimation: triggerJiggle, animationClassName: jiggleClassName } = useFeedbackAnimation('jiggle-effect', 300);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const prevPasswordRef = useRef(password);

  const getPasswordSuggestion = useMemo(() => (pass: string): string => {
    if (!pass) return ''; // Do not show suggestion if input is empty
    if (pass.length < 8) return '...'; // Suggest length requirement first
    if (!/[A-Z]/.test(pass)) return 'A';
    if (!/[a-z]/.test(pass)) return 'a';
    if (!/[0-9]/.test(pass)) return '1';
    if (!/[^A-Za-z0-9]/.test(pass)) return '!';
    return ''; // All conditions met
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPassword) {
      timer = setTimeout(() => {
        setIsSuggestionVisible(true);
      }, 1000);
    } else {
      setIsSuggestionVisible(false);
    }
    return () => clearTimeout(timer);
  }, [showPassword]);

  useEffect(() => {
    // --- Animation Optimization ---
    // Only run animations if the password field is visible
    if (!showPassword || !isSuggestionVisible) {
      return;
    }

    const suggestion = getPasswordSuggestion(password);
    // Timer-based jiggle
    const interval = setInterval(() => {
      if (suggestion) {
        triggerJiggle();
      }
    }, 5000);

    // Incorrect input jiggle
    const lastChar = password.slice(-1);
    const prevSuggestion = getPasswordSuggestion(prevPasswordRef.current);

    if (password.length > prevPasswordRef.current.length && prevSuggestion) {
        let isCharInvalid = false;
        if (prevSuggestion === 'A' && !/[A-Z]/.test(lastChar)) isCharInvalid = true;
        else if (prevSuggestion === 'a' && !/[a-z]/.test(lastChar)) isCharInvalid = true;
        else if (prevSuggestion === '1' && !/[0-9]/.test(lastChar)) isCharInvalid = true;
        else if (prevSuggestion === '!' && !/[^A-Za-z0-9]/.test(lastChar)) isCharInvalid = true;
        
        if(isCharInvalid) {
            triggerJiggle();
        }
    }

    prevPasswordRef.current = password;
    return () => clearInterval(interval);
  }, [password, getPasswordSuggestion, triggerJiggle, showPassword, isSuggestionVisible]);

  // Function to handle resending the verification code
  const handleResendCode = async () => { // Removed emailToResend parameter
    if (!registeredEmail) {
      console.error("No registered email found to resend verification code.");
      alert(t('register_page.resend_code_unavailable'));
      return;
    }
    try {
      console.log("Attempting to resend verification code for email:", registeredEmail);
      const response = await resendVerificationCode({ variables: { email: registeredEmail } }); // Use registeredEmail

      if (response.data && response.data.resendVerificationCode) { // Check the correct response field
        console.log("Resend code successful:", response.data.resendVerificationCode);
        // Optionally show a message to the user that the code has been resent
        alert(t('register_page.code_resent_success')); // Added alert for user feedback
      } else {
        console.error('Resend code failed: No data received.');
        alert(t('register_page.resend_code_failed_generic')); // Added alert for user feedback
      }
    } catch (e) {
      console.error('Resend code error:', e);
      // Handle error (e.g., display error message to the user)
      alert(t('register_page.resend_code_failed_with_error', { error: e })); // Added alert with error message
    }
  };

  // Function to handle resending the verification code
  const handleNext = async () => {
    // If this is the step before the verification step, trigger registration
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
          console.log("Registration successful:", response.data.register);
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
      router.push('/'); // Navigate to welcome page
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

  // Function to handle code verification submission
  const handleVerificationSubmit = async (emailToVerify: string) => {
    const enteredCode = confirmationCode.join('');
    if (enteredCode.length !== 8) {
      console.log('Please enter the complete 8-digit code.');
      return;
    }

    setVerificationStatus('checking');

    try {
      const response = await verifyEmail({
        variables: {
          email: emailToVerify,
          code: enteredCode,
        },
      });

      if (response.data && response.data.verifyEmail === true) {
        setVerificationStatus('success');
        setTimeout(() => router.push('/login'), 1000); // Redirect after success animation
      } else {
        setVerificationStatus('error');
        triggerGlitch();
        console.error('Verification failed: Invalid code or verification returned false.');
      }
    } catch (e: unknown) {
      setVerificationStatus('error');
      triggerGlitch();
      console.error('Verification error:', e);
    }
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = async () => {
    if (currentStep < registrationSteps.length) {
      await handleNext();
    }
    // For the last step, submission is handled by the dedicated verification button.
  };

  // Check if any of the confirmation code input fields have content
  const isCodeInputStarted = confirmationCode.some(code => code !== '');

    const handleCodeInputChange = (index: number, value: string) => {
    console.log(`Input change at index ${index}: "${value}"`); // Log input change
    const newCode = [...confirmationCode];
    newCode[index] = value;
    setConfirmationCode(newCode);
    console.log('Updated confirmationCode state:', newCode); // Log updated state

    // Move focus to the next input cell if a digit was entered
    if (value !== '' && index < 7) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && confirmationCode[index] === '' && index > 0) {
      // If backspacing in an empty cell, move focus to the previous cell
      inputRefs.current[index - 1]?.current?.focus();
    } else if (event.key === 'Backspace' && confirmationCode[index] !== '') {
      // If backspacing in a non-empty cell, clear the current cell
      const newCode = [...confirmationCode];
      newCode[index] = '';
      setConfirmationCode(newCode);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const codeArray = pastedData.slice(0, 8).split('');
    const newCode = [...confirmationCode];
    codeArray.forEach((char, index) => {
      if (index < 8) {
        newCode[index] = char;
      }
    });
    setConfirmationCode(newCode);
    // Focus the last input cell that was filled
    const lastFilledIndex = Math.min(codeArray.length, 8) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.current?.focus();
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
              <div className="text-center">
                <div className={`flex justify-center gap-2 mb-4 ${verificationStatus === 'checking' ? 'neural-check-animation' : ''} ${glitchClassName}`}>
                  {confirmationCode.map((digit, index) => (
                    <InputCell
                      key={index}
                      value={digit}
                      onChange={(value) => handleCodeInputChange(index, value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      inputRef={inputRefs.current[index] as React.RefObject<HTMLInputElement>}
                      className={
                        verificationStatus === 'success' ? 'bg-green-500/20 border-green-500' :
                        verificationStatus === 'error' ? 'bg-red-500/20 border-red-500' : ''
                      }
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => handleVerificationSubmit(registeredEmail || '')}
                  className="w-full"
                  disabled={loadingVerification || !isCodeInputStarted}
                >
                  {loadingVerification ? t('register_page.verifying_button') : t('register_page.verify_button')}
                </Button>
                <button onClick={handleResendCode} className="text-sm text-[var(--color-accent)] mt-4 hover:underline" disabled={loadingResend}>
                  {loadingResend ? t('register_page.resending_code_button') : t('register_page.resend_code_button')}
                </button>
                {errorVerification && <p className="text-[var(--color-danger)] text-sm mt-2">{errorVerification.message}</p>}
                {errorResend && <p className="text-[var(--color-danger)] text-sm mt-2">{errorResend.message}</p>}
              </div>
            ) : (
              currentStepConfig.fields?.map((field: any) => (
                <Input
                  key={field.name}
                  id={field.name}
                  placeholder={field.label}
                  type={field.type === 'password' && showPassword ? 'text' : field.type}
                  registration={register(field.name as keyof RegisterFormInputs, {
                    required: t(`validation.${field.name}.required`),
                    minLength: {
                      value: field.name === 'name' ? 2 : field.name === 'password' ? 8 : 0,
                      message: t(`validation.${field.name}.minLength`)
                    },
                    maxLength: {
                      value: field.name === 'name' ? 50 : 255,
                      message: t(`validation.${field.name}.maxLength`)
                    },
                    validate: (value) => {
                      if (field.name === 'password') {
                        if (!/[A-Z]/.test(value)) return t('validation.password.uppercase');
                        if (!/[0-9]/.test(value)) return t('validation.password.digit');
                        if (!/[!@#$%^&*]/.test(value)) return t('validation.password.specialChar');
                      }
                      if (field.name === 'email') {
                        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return t('validation.email.invalid');
                        if (!/@gmail\.com$/.test(value)) return t('validation.email.gmailOnly');
                      }
                      return true;
                    }
                  })}
                  error={errors[field.name as keyof RegisterFormInputs]?.message}
                  icon={
                    field.icon && iconComponents[field.icon]
                      ? React.createElement(iconComponents[field.icon], { className: `${variantsStylesIcons.iconSecondary} w-6 h-6` })
                      : null
                  }
                  rightIcon={
                    field.type === 'password' && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                        {showPassword ? <EyeOff className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} /> : <Eye className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />}
                      </button>
                    )
                  }
                  suggestion={
                    field.type === 'password' && showPassword && isSuggestionVisible
                      ? getPasswordSuggestion(password)
                      : ''
                  }
                  suggestionClassName={field.name === 'password' ? jiggleClassName : ''}
                  suggestionContainerClassName={field.name === 'password' && isSuggestionVisible ? 'fade-in-up-effect' : 'opacity-0'}
                  // Pass the watched value to the Input component so the suggestion can use it
                  {...(field.name === 'password' && { value: password })}
                />
              ))
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
