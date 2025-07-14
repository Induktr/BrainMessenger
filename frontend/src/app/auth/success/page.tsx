'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth hook
import { useTranslation } from 'react-i18next';

const AuthSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserState } = useAuth(); // Get setUserState from AuthContext
  const { t } = useTranslation();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userDataString = searchParams.get('user'); // Assuming user data is also passed

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      console.log('AuthSuccessPage: Tokens received and stored.');

      if (userDataString) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataString));
          setUserState(userData); // Update AuthContext with user data
          console.log('AuthSuccessPage: User data received and set in AuthContext.');
        } catch (error) {
          console.error('AuthSuccessPage: Failed to parse user data from URL:', error);
        }
      }

      // Redirect to the chat page or dashboard
      router.replace('/chat');
    } else {
      console.error('AuthSuccessPage: Missing access_token or refresh_token in URL.');
      // Optionally redirect to login with an error message
      router.replace('/login?error=auth_failed');
    }
  }, [searchParams, router, setUserState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-textPrimary-dark p-4">
      <h1 className="text-2xl font-bold text-center">{t('auth_success_page.processing')}</h1>
      <p className="text-center">{t('auth_success_page.redirecting')}</p>
    </div>
  );
};

export default AuthSuccessPage;