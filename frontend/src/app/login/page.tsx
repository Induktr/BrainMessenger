'use client';

import React, { useState } from 'react'; // Добавляем useState
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import Modal from '@/shared/ui/Modal/Modal'; // Импортируем Modal
import { useMutation } from '@apollo/client'; // Import useMutation
import { LOGIN_USER, SEND_VERIFICATION_EMAIL, VERIFY_EMAIL } from '@/entities/user/model/user.queries';
import { useRouter } from 'next/navigation'; // Import useRouter
import Image from 'next/image';
import { IMAGES } from '@/shared/assets/Images/images'
import { useAuth } from '@/features/user-auth/ui/AuthContext'; // Import useAuth hook
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { ICONS } from '@/shared/assets/Icons/icons';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const [sendVerificationEmailMutation, { loading: isSendingVerificationEmail, error: sendVerificationEmailError }] = useMutation(SEND_VERIFICATION_EMAIL);
  const [verifyEmailMutation, { loading: isVerifyingEmail, error: verifyEmailError }] = useMutation(VERIFY_EMAIL);
  const [currentView, setCurrentView] = useState('');

  const router = useRouter();
  const { user, setUserState, showEmailVerificationModal, setShowEmailVerificationModal, refetchUser } = useAuth(); // Получаем новые состояния и функции из AuthContext

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSmallSettingsClick = () => {
    setCurrentView('smallSettings')
  }

  const handleClose = () => {
    setCurrentView('')
  }

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await loginUser({
        variables: {
          email: data.email,
          password: data.password,
        },
      });

      if (response.data && response.data.login && response.data.login.access_token && response.data.login.refresh_token) {
        // Store both access_token and refresh_token in localStorage
        localStorage.setItem('access_token', response.data.login.access_token);
        console.log("Login page - access_token set in localStorage:", response.data.login.access_token);
        localStorage.setItem('refresh_token', response.data.login.refresh_token);
        console.log("Login page - refresh_token set in localStorage:", response.data.login.refresh_token);
        console.log("Login successful, tokens stored.");
        // Verify tokens are in localStorage immediately after setting
        const verifiedAccessToken = localStorage.getItem('access_token');
        const verifiedRefreshToken = localStorage.getItem('refresh_token');
        console.log("Login page - Verified access_token in localStorage:", verifiedAccessToken ? 'Present' : 'Missing');
        console.log("Login page - Verified refresh_token in localStorage:", verifiedRefreshToken ? 'Present' : 'Missing');
        // Update AuthContext state with the logged-in user data
        // Update AuthContext state with the logged-in user data
        // Update AuthContext state with the logged-in user data
        setUserState(response.data.login.user);
        console.log("Login page - Updated AuthContext user state.");

        // Direct redirection based on verification status
        if (response.data.login.user.isVerified) {
          router.replace('/chat'); // Redirect to chat if verified
        } else {
          setShowEmailVerificationModal(true); // Show modal if not verified
        }
      } else {
        // Handle cases where login was not successful but no error was thrown
        console.error('Login failed: No access token received');
        // Optionally show a generic login failed message
      }
    } catch (e: unknown) { // Catch and type the error
      console.error('Login error:', e);
      // Handle error (e.g., display error message to the user)
      // You might want to set a state variable to display the error on the form
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
      await sendVerificationEmailMutation({ variables: { email: user.email } }); // Pass user.email as a variable
      setResendSuccess(true);
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      setVerificationError(error.message || 'Failed to resend verification email.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    setVerificationError('');
    try {
      const response = await verifyEmailMutation({
        variables: { code: verificationCode }, // Removed email variable
      });
      if (response.data && response.data.verifyEmail) {
        // If verification is successful, refetch user data to update isVerified status
        // and then close the modal.
        refetchUser();
        handleEmailVerificationModalClose();
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setVerificationError(error.message || 'Invalid verification code or email.');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-textPrimary-dark p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-surface-dark rounded-lg shadow-md">
        {currentView === 'smallSettings' && <SmallSettings isOpen={currentView === 'smallSettings'} onClose={handleClose} />}
        <div className="burger-menu-container"> {/* Reusing burger-menu-container */}
          <Image src={ICONS.burgerMenu} alt="Burger Menu" className="icon" onClick={handleSmallSettingsClick} width={24} height={24} /> {/* Use img tag */}
        </div>
        <div className="icon-container-steps">
          <Image
            src={IMAGES.logoBrainMessenger}
            alt="BrainMessenger Logo" // Added alt text
            width={175} // Example width, adjust as needed
            height={175} // Example height, adjust as needed
            className="logo"
          />
        </div>
          <h1 className="text-2xl font-bold text-center text-textPrimary-dark">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email:"
              type="email"
              registration={register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <Input
              id="password"
              label="Password:"
              type="password"
              registration={register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            {error && (
              error.graphQLErrors && error.graphQLErrors.length > 0 ? (
                error.graphQLErrors.map((err, index) => (
                  <p key={index} className="input-error-message text-center">Login failed: {err.message}</p>
                ))
              ) : (
                <p className="input-error-message text-center">Login failed: {error.message}</p>
              )
            )}
          </form>
          <p className="text-center text-sm text-textSecondary-dark">
            Dont have an account?{' '}
            <Link href="/register" className="text-primary-DEFAULT hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerificationModal && user && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={showEmailVerificationModal}>
          <div className="verification-modal-content">
            <h3>Verify Your Email</h3>
            <p>Please enter the verification code sent to {user.email}.</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code"
              className="verification-modal-input"
            />
            {verificationError && <p className="error-message">{verificationError}</p>}
            <Button onClick={handleVerifyEmail} disabled={isVerifyingEmail}>
              {isVerifyingEmail ? 'Verifying...' : 'Verify'}
            </Button>
            <Button onClick={handleResendVerificationEmail} disabled={isResendingCode}>
              {isResendingCode ? 'Sending...' : 'Resend Code'}
            </Button>
            {resendSuccess && <p className="success-message">Verification email sent!</p>}
          </div>
        </Modal>
      )}
    </>
  );
};

export default LoginPage;