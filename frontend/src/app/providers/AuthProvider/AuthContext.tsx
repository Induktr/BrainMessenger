'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useQuery, useApolloClient, useMutation, useSubscription } from '@apollo/client';
import { GET_CURRENT_USER, UPDATE_LAST_ACTIVE, REFRESH_TOKEN_MUTATION } from '@/entities/user/model/user.queries';
import { NEW_MESSAGE_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions';
import { useRouter, usePathname } from 'next/navigation';
import { setAccessTokenForApollo } from '@/apollo-client';
import NotificationDropdown from '@/features/manage-notifications/ui/NotificationDropdown';
import Spinner from '@/shared/ui/Spinner/Spinner';
import Image from 'next/image';
import { Message, AuthContextType } from '@/features/user-auth/model/user-auth.types';
import type { User } from '@/entities/user/model/user.types';
import { AppRoutes } from '@/shared/config/paths';

// Create the context with default values
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<Message | null>(null);

  const [updateLastActive] = useMutation(UPDATE_LAST_ACTIVE);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();

  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const offlineTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopActivityTracking = useCallback(() => {
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    if (offlineTimerRef.current) {
      clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[Auth] Logout process initiated.');
  
    // Stop all background activity and clear local React state.
    stopActivityTracking();
    setUser(null);
    setAccessToken(null);
    setAccessTokenForApollo(null);
  
    // Clear all data from localStorage to ensure a clean state.
    if (typeof window !== 'undefined') {
      localStorage.clear();
      console.log('[Auth] All data cleared from localStorage.');
    }
  
    // Reset Apollo Client store to clear cache.
    try {
      await client.resetStore();
      console.log('[Auth] Apollo Client store reset successfully.');
    } catch (error) {
      console.error('[Auth] Error resetting Apollo Client store:', error);
    }
  
    // Force a redirect to the login page to ensure a full refresh.
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [client, stopActivityTracking]);

  const { loading, error, refetch } = useQuery<{ getCurrentUser: User }>(GET_CURRENT_USER, {
    fetchPolicy: 'network-only',
    skip: !accessToken,
    onCompleted: (data) => {
      setUser(data?.getCurrentUser ?? null);
      setIsInitializing(false);
    },
    onError: () => {
      setUser(null);
      setIsInitializing(false);
    },
  });
  
  const updateActiveStatus = useCallback(async () => {
    if (user && localStorage.getItem('access_token')) {
      try {
        await updateLastActive();
      } catch (err) {
        // console.error('Error updating last active status:', err);
      }
    }
  }, [user, updateLastActive]);

  const startActivityTracking = useCallback(() => {
    stopActivityTracking();
    updateActiveStatus();
    activityIntervalRef.current = setInterval(updateActiveStatus, 60000);
  }, [stopActivityTracking, updateActiveStatus]);

  const handleFocus = useCallback(() => {
    if (offlineTimerRef.current) {
      clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
    if (!activityIntervalRef.current) {
      startActivityTracking();
    }
  }, [startActivityTracking]);

  const handleBlur = useCallback(() => {
    offlineTimerRef.current = setTimeout(() => {
      stopActivityTracking();
    }, 300000); // 5 minutes
  }, [stopActivityTracking]);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');

      if (storedAccessToken) {
        setAccessToken(storedAccessToken);
        setAccessTokenForApollo(storedAccessToken);
      } else if (storedRefreshToken) {
        refreshTokenMutation({ variables: { refreshToken: storedRefreshToken } })
          .then(response => {
            const newAccessToken = response.data?.refreshToken?.access_token;
            if (newAccessToken) {
              localStorage.setItem('access_token', newAccessToken);
              const newRefreshToken = response.data?.refreshToken?.refresh_token;
              if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
              
              setAccessToken(newAccessToken);
              setAccessTokenForApollo(newAccessToken);
            } else {
              logout();
            }
          })
          .catch(() => {
            logout();
          });
      } else {
        setIsInitializing(false);
      }
    } else {
      setIsInitializing(false);
    }
  }, [logout, refreshTokenMutation]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
        handleFocus();
      } else {
        handleBlur();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, handleFocus, handleBlur]);

  useEffect(() => {
    if (isInitializing ?? loading) return;

    const publicPaths = [AppRoutes.LOGIN, AppRoutes.REGISTER, AppRoutes.WELCOME];
    const isPublicPath = publicPaths.includes(pathname);

    if (user) {
      const isModeratorOrAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
      if (isPublicPath) {
        router.replace(isModeratorOrAdmin ? AppRoutes.ADMIN : AppRoutes.CHAT);
      } else if (isModeratorOrAdmin && !pathname.startsWith(AppRoutes.ADMIN)) {
        router.replace(AppRoutes.ADMIN);
      } else if (!isModeratorOrAdmin && pathname.startsWith(AppRoutes.ADMIN)) {
        router.replace(AppRoutes.CHAT);
      }
    } else {
      if (!isPublicPath) {
        router.replace(AppRoutes.LOGIN);
      }
    }
  }, [user, isInitializing, loading, pathname, router]);

  const currentChatId = pathname?.startsWith('/chat/') ? pathname.split('/')[2] : null;
  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: currentChatId || '' },
    skip: !currentChatId || !user,
    onData: ({ data }) => {
      const newMessage = data.data?.newMessage;
      if (newMessage && newMessage.sender.id !== user?.id) {
        setNotificationMessage(newMessage);
        setShowNotification(true);
      }
    },
    onError: (err) => {
      console.error("Error in NEW_MESSAGE_SUBSCRIPTION:", err);
    }
  });

  const closeNotification = () => {
    setShowNotification(false);
    setNotificationMessage(null);
  };

  const contextValue: AuthContextType = {
    user,
    queryLoading: loading,
    error,
    refetchUser: refetch,
    setUserState: setUser,
    isInitializing,
    logout,
    showEmailVerificationModal,
    setShowEmailVerificationModal,
    showNotification,
    notificationMessage,
    closeNotification,
  };

  const renderLoading = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
      <Spinner className="lazy-loading-logo-container">
        <Image src="/images/logo.png" alt="BrainMessenger Logo" width={120} height={120} />
      </Spinner>
    </div>
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {isClientMounted && !isInitializing ? children : renderLoading()}
      <NotificationDropdown
        message={notificationMessage}
        isVisible={showNotification}
        onClose={closeNotification}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
