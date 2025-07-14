'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import InputCell from '@/shared/ui/InputCell/InputCell';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/shared/ui/ProgressIndicator/ProgressIndicator';
import { useMutation } from '@apollo/client';
import { REGISTER_USER, VERIFY_EMAIL, SEND_VERIFICATION_EMAIL } from '@/entities/user/model/user.queries'; // Import mutations
import { ICONS } from '@/shared/assets/Icons/icons';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { IMAGES } from '@/shared/assets/Images/images';
import { RegisterFormInputs } from '@/features/user-auth/model/user-auth.types';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
    const [confirmationCode, setConfirmationCode] = useState<string[]>(Array(8).fill('')); // State for the 8-digit code
    const inputRefs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(Array(8).fill(null).map(() => React.createRef())); // Refs for input cells
    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<RegisterFormInputs>();
    const email = watch('email'); // Watch the email field
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null); // New state to store the registered email
    const router = useRouter();
    const [registerUser, { error: errorRegistration }] = useMutation(REGISTER_USER);
    const [verifyEmail, { loading: loadingVerification, error: errorVerification }] = useMutation(VERIFY_EMAIL); // Use useMutation for verification
    const [resendVerificationCode, { loading: loadingResend, error: errorResend }] = useMutation(SEND_VERIFICATION_EMAIL); // Use useMutation for resending code
    const [verificationSuccess, setVerificationSuccess] = useState(false); // State for verification success
    const [currentView, setCurrentView] = useState('');
   
   
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
    let isStepValid = false;
    if (currentStep === 1) {
       isStepValid = await trigger('password');
     } else if (currentStep === 2) {
       isStepValid = await trigger('name');
     } else if (currentStep === 3) { // New step for username
       isStepValid = await trigger('username');
     } else if (currentStep === 4) { // Email step is now step 4
        isStepValid = await trigger('email');
        if (isStepValid) {
          // Trigger registration mutation after email step (now step 4)
          try {
            const response = await registerUser({
              variables: {
                email: watch('email'), // Use watch to get the current email value
                password: watch('password'), // Use watch to get the current password value
                name: watch('name'), // Use watch to get the current name value
                username: watch('username'), // Pass the username value
              },
            });

            if (response.data && response.data.register) { // Check for direct UserDto object
              console.log("Registration successful:", response.data.register); // Log the direct UserDto
              setRegisteredEmail(watch('email')); // Store the email after successful registration
              setCurrentStep(currentStep + 1); // Move to step 5
            }
          } catch (e) {
            console.error('Registration error:', e);
            // Error will be handled by the useMutation hook and displayed
          }
        }
        return; // Prevent default step increment
     }

     if (isStepValid && currentStep < 5) { // Total steps are now 5
       setCurrentStep(currentStep + 1);
     }
   };

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
       // Optionally show an error message to the user
       return;
     }
 
     try {
       const response = await verifyEmail({
         variables: {
           email: emailToVerify, // Use the passed email
           code: enteredCode,
         },
       });

       console.log("Frontend received response:", response); // Log the full response object

       if (response.data && response.data.verifyEmail === true) {
         console.log("Verification successful for email:", watch('email'));
         setVerificationSuccess(true);
         // Redirect to login page after successful verification to obtain tokens
         router.push('/login');
       } else {
          console.error('Verification failed: Invalid code or verification returned false.');
          // Optionally show a generic verification failed message
       }
     } catch (e: unknown) { // Catch and type the error
       console.error('Verification error:', e);
       // Handle error (e.g., display error message to the user)
       // The error message from the backend should be displayed by the useMutation hook
     }
   };

   const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
     if (currentStep === 5) { // Check for step 5 (email verification)
       // Call the verification handler with the current email from form data
       await handleVerificationSubmit(data.email);
     } else {
       // This part should ideally not be reached if handleNext is used for steps 1-4
       // Remove the log as it's no longer relevant
       // console.log("Form submitted on a step other than 5.");
     }
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

   // Function to determine the text to display based on the current step
   const getStepText = (step: number, email?: string) => {
     switch (step) {
       case 1:
         return t('register_page.create_password_placeholder');
       case 2:
         return t('register_page.your_name_placeholder');
       case 3:
         return t('register_page.username_placeholder'); // Text for the new username step
       case 4:
         return t('register_page.email_placeholder');
       case 5:
         return t('register_page.welcome_prompt', { email: email }); // Use email from watch
       default:
         return "";
     }
   };


   return (
     <div className="welcome-container"> {/* Reusing welcome-container for centering */}
     {currentView === 'smallSettings' && <SmallSettings isOpen={currentView === 'smallSettings'} onClose={handleClose} />}
          <div className="burger-menu-container"> {/* Reusing burger-menu-container */}
              <Image src={ICONS.burgerMenu} alt={t('register_page.burger_menu_alt')} className="icon" onClick={handleSmallSettingsClick} width={24} height={24} /> {/* Use img tag */}
          </div>
       <div className="main-content-area"> {/* Reusing main-content-area */}
         {/* Logo */}
         {/* You might want to add the logo here */}
       <div className="icon-container-steps">
         <Image
           src={IMAGES.logoBrainMessenger}
           alt={t('register_page.logo_alt')} // Added alt text
           width={175} // Example width, adjust as needed
           height={175} // Example height, adjust as needed
           className="logo"
         />
       </div>
   
   
         {/* Step Content */}
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {currentStep === 1 && (
             <>
               <h2 className="step-heading">{t('register_page.step_prefix')} {currentStep}</h2> {/* Added heading based on mockup */}
               <div className="input-button-container"> {/* Container for input and button */}
                 <Input
                   placeholder={t('register_page.create_password_placeholder')}
                   id="password"
                   type="password"
                   iconPath={ICONS.castle} // Use iconPath prop
                   registration={register('password', {
                     required: t('register_page.input_field_empty'), // Figma message
                     minLength: { value: 6, message: t('register_page.password_too_short') }, // Figma message
                     maxLength: { value: 50, message: t('register_page.password_too_long') }, // Added maxLength based on common practices
                     pattern: {
                       value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()]).*$/, // Requires at least one capital letter and one special character
                       message: t('register_page.password_requirements'), // Combined Figma messages
                     },
                   })}
                 />
                 <Button type="button" onClick={handleNext} className="next-button-step">
                   <Image src={ICONS.arrowRight} alt={t('register_page.next_button_alt')} className="icon-container-size-lg" width={24} height={24} /> {/* Use img tag */}
                 </Button>
               </div>
               {errors.password && <p className="input-error-message">{errors.password.message}</p>}
               {errorRegistration && (
                 errorRegistration.graphQLErrors && errorRegistration.graphQLErrors.length > 0 ? (
                   errorRegistration.graphQLErrors.map((err, index) => (
                     <p key={index} className="input-error-message">{t('register_page.registration_error')} {err.message}</p>
                   ))
                 ) : (
                   <p className="input-error-message">{t('register_page.registration_error')} {errorRegistration.message}</p>
                 )
               )}
             </>
           )}
           {currentStep === 2 && (
             <>
               {/* Progress Indicator for Step 2 */}
               <div className="progress-indicator-container">
                 <h2 className="step-heading">{t('register_page.step_prefix')} {currentStep}</h2>
                 <ProgressIndicator currentStep={currentStep} totalSteps={5} />
               </div>
               <div className="input-button-container">
                 <Input
                   placeholder={t('register_page.your_name_placeholder')}
                   id="name"
                   type="text"
                   iconPath={ICONS.man} // Use iconPath prop
                   registration={register('name', {
                     required: t('register_page.input_field_empty'),
                     minLength: { value: 2, message: t('register_page.name_too_short') },
                     maxLength: { value: 50, message: t('register_page.name_too_long') },
                   })}
                 />
                 <Button type="button" onClick={handleNext} className="next-button-step">
                   <Image src={ICONS.arrowRight} alt={t('register_page.next_button_alt')} className="icon" width={24} height={24} /> {/* Use img tag */}
                 </Button>
               </div>
               {errors.name && <p className="input-error-message">{errors.name.message}</p>}
               {errorRegistration && (
                 errorRegistration.graphQLErrors && errorRegistration.graphQLErrors.length > 0 ? (
                   errorRegistration.graphQLErrors.map((err, index) => (
                     <p key={index} className="input-error-message">{t('register_page.registration_error')} {err.message}</p>
                   ))
                 ) : (
                   <p className="input-error-message">{t('register_page.registration_error')} {errorRegistration.message}</p>
                 )
               )}
             </>
           )}
           {currentStep === 3 && (
             <>
               {/* Progress Indicator for Step 3 */}
               <div className="progress-indicator-container">
                 <h2 className="step-heading">{t('register_page.step_prefix')} {currentStep}</h2>
                 <ProgressIndicator currentStep={currentStep} totalSteps={5} />
               </div>
               <div className="input-button-container">
                 <Input
                   placeholder={t('register_page.username_placeholder')}
                   id="username"
                   type="text"
                   iconPath={ICONS.usernameDog} // Assuming you have an icon for username
                   registration={register('username', {
                     // Removed 'required' validation to make username optional
                     minLength: { value: 3, message: t('register_page.username_too_short') },
                     maxLength: { value: 20, message: t('register_page.username_too_long') },
                     // You might want to add a pattern for valid username characters
                   })}
                 />
                 <Button type="button" onClick={handleNext} className="next-button-step">
                   <Image src={ICONS.arrowRight} alt={t('register_page.next_button_alt')} className="icon" width={24} height={24} /> {/* Use img tag */}
                 </Button>
               </div>
               {errors.username && <p className="input-error-message">{errors.username.message}</p>}
               {errorRegistration && (
                 errorRegistration.graphQLErrors && errorRegistration.graphQLErrors.length > 0 ? (
                   errorRegistration.graphQLErrors.map((err, index) => (
                     <p key={index} className="input-error-message">{t('register_page.registration_error')} {err.message}</p>
                   ))
                 ) : (
                   <p className="input-error-message">{t('register_page.registration_error')} {errorRegistration.message}</p>
                 )
               )}
             </>
           )}
           {currentStep === 4 && (
             <>
               {/* Progress Indicator for Step 4 */}
               <div className="progress-indicator-container">
                 <h2 className="step-heading">{t('register_page.step_prefix')} {currentStep}</h2>
                 <ProgressIndicator currentStep={currentStep} totalSteps={5} />
               </div>
               <div className="input-button-container">
                 <Input
                   placeholder={t('register_page.email_placeholder')}
                   id="email"
                   type="email"
                   iconPath={ICONS.mail} // Use iconPath prop
                   registration={register('email', {
                     required: t('register_page.input_field_empty'),
                     pattern: {
                       value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                       message: t('register_page.invalid_email_format'),
                     },
                   })}
                 />
                 <Button type="button" onClick={handleNext} className="next-button-step">
                   <Image src={ICONS.arrowRight} alt={t('register_page.next_button_alt')} className="icon" width={24} height={24} /> {/* Use img tag */}
                 </Button>
               </div>
               {errors.email && <p className="input-error-message">{errors.email.message}</p>}
               {errorRegistration && (
                 errorRegistration.graphQLErrors && errorRegistration.graphQLErrors.length > 0 ? (
                   errorRegistration.graphQLErrors.map((err, index) => (
                     <p key={index} className="input-error-message">{t('register_page.registration_error')} {err.message}</p>
                   ))
                 ) : (
                   <p className="input-error-message">{t('register_page.registration_error')} {errorRegistration.message}</p>
                 )
               )}
             </>
           )}
            {currentStep === 5 && (
             <>
               {/* Progress Indicator for Step 5 */}
               <p className="step-description">{getStepText(currentStep, email)}</p> {/* Pass email to getStepText */}
               <div className="progress-indicator-container"> {/* Added container for centering */}
                 <h2 className="step-heading">{t('register_page.step_prefix')} {currentStep}</h2>
                 <ProgressIndicator currentStep={currentStep} totalSteps={5} />
               </div>
               {/* Confirmation code input cells */}
               <div className="confirmation-code-input-container"> {/* Container for input cells */}
                 {confirmationCode.map((value, index) => (
                   <InputCell
                     className="confirmation-code-input"
                     key={index}
                     value={value}
                     onChange={(val) => handleCodeInputChange(index, val)}
                     onKeyDown={(e) => handleKeyDown(index, e)} // Add onKeyDown handler
                     onPaste={handlePaste} // Add onPaste handler
                     inputRef={inputRefs.current[index]}
                   />
                 ))}
               </div>
                <Button className="custom-button" type="submit" disabled={loadingVerification || !isCodeInputStarted}> {/* Disable button while loading or if code input not started */}
                   {loadingVerification ? t('register_page.verifying_button') : t('register_page.confirm_button')}
                </Button>
                {errorVerification && (
                  errorVerification.graphQLErrors && errorVerification.graphQLErrors.length > 0 ? (
                    errorVerification.graphQLErrors.map((err, index) => (
                      <p key={index} className="input-error-message text-center">{t('register_page.verification_error_prefix')} {err.message}</p>
                    ))
                  ) : (
                    <p className="input-error-message text-center">{t('register_page.verification_error_prefix')} {errorVerification.message}</p>
                  )
                )}
                {errorResend && ( // Display resend error
                  errorResend.graphQLErrors && errorResend.graphQLErrors.length > 0 && (
                    errorResend.graphQLErrors.map((err, index) => (
                     <p key={index} className="input-error-message text-center">{t('register_page.resend_error_prefix')} {errorResend.message}</p>
                    ))
                  )
                )}
                {verificationSuccess && <p className="success-message text-center">{t('register_page.verification_success_redirect')}</p>}
                {!verificationSuccess && ( // Only show button if verification is not successful
                  <Button onClick={handleResendCode} className="confirmation-send-code-button-container" disabled={loadingResend || verificationSuccess}> {/* Call handleResendCode without arguments */}
                     {loadingResend ? t('register_page.sending_button') : t('register_page.get_code_again_button')} {/* Change button text while loading */}
                  </Button>
                )}
              </>
            )}

        </form>

        <Button
          type="button"
          className="sign-with-google-button" // Added mt-4 for margin-top
          onClick={() => window.location.href = 'http://localhost:4000/auth/google'} // Removed /api/ prefix
        >
          <Image src={ICONS.google} alt="Google icon" width={20} height={20} />
          <span>{t('register_page.sign_up_with_google')}</span>
        </Button>

        {/* Back Button */}
        {currentStep >= 1 && (
          <Button type="button" onClick={handleBack} className="back-button-top-left">
            <Image src={ICONS.arrowBack} alt={t('register_page.back_button_alt')} className="icon svg-icon" width={24} height={24} />
          </Button>
        )}
        {currentStep !== 4 && (<p className="text-center text-sm text-textSecondary-dark">
          {t('register_page.already_have_account')}{' '}
          <Link href="/login" className="text-primary-DEFAULT hover:underline">
            {t('register_page.login_link')}
          </Link>
        </p>)}
      </div>
      </div>
      );
    };

export default RegisterPage;
