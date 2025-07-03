'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useApolloClient, useMutation, gql, useSubscription } from '@apollo/client'; // Added useSubscription
import { GET_CURRENT_USER, UPDATE_LAST_ACTIVE, REFRESH_TOKEN_MUTATION } from '@/entities/user/model/user.queries';
import { NEW_MESSAGE_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions'; // Corrected import for NEW_MESSAGE_SUBSCRIPTION
import { useRouter, usePathname } from 'next/navigation';
import { setAccessTokenForApollo } from '@/apollo-client';
import NotificationDropdown from '@/features/manage-notifications/ui/NotificationDropdown'; // Import NotificationDropdown
import Spinner from '@/shared/ui/Spinner/Spinner'; // Import LazyLoading
import Image from 'next/image'; // Import Image component
import { Message, AuthContextType } from '@/features/user-auth/model/user-auth.types';

import type { User } from '@/entities/user/model/user.types';

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
  const [isClientMounted, setIsClientMounted] = useState(false); // Add isClientMounted state
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [offlineTimer, setOfflineTimer] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<Message | null>(null);

  const [updateLastActive] = useMutation(UPDATE_LAST_ACTIVE, {
    update(cache, { data }) {
      const existingUser = cache.readQuery<{ getCurrentUser: User }>({ query: GET_CURRENT_USER });

      if (existingUser && data?.updateLastActive) {
        const updatedUser = {
          ...existingUser.getCurrentUser,
          lastActiveAt: data.updateLastActive.lastActiveAt,
          status: data.updateLastActive.status,
        };

        cache.writeQuery({
          query: GET_CURRENT_USER,
          data: { getCurrentUser: updatedUser },
        });
      }
    },
  });

  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION); // Initialize refreshToken mutation

  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();

const logout = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setUser(null);
    setAccessToken(null);
    setAccessTokenForApollo(null); // Clear Apollo Client's token on logout
    client.clearStore();
    router.replace('/login');
  }, [client, router]); // Add client and router as dependencies for useCallback
  const { data, loading, error, refetch } = useQuery<{ getCurrentUser: User }>(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
    skip: !accessToken, // Only skip if no accessToken is present
    onCompleted: (data) => {
      if (data && data.getCurrentUser) {
        setUser(data.getCurrentUser);
      } else {
        setUser(null);
      }
      setIsInitializing(false); // Set to false after query completes
    },
    onError: (err) => {
      setUser(null);
      // Rely on Apollo Client's errorLink to handle token refresh and logout
      // if (err.graphQLErrors && err.graphQLErrors.some(e => e.extensions?.code === 'UNAUTHENTICATED')) {
      //   logout();
      // }
      setIsInitializing(false); // Set to false after query errors
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');

      if (storedAccessToken) {
        setAccessToken(storedAccessToken);
        setAccessTokenForApollo(storedAccessToken);
        // isInitializing will be set to false by the GET_CURRENT_USER query's onCompleted/onError
      } else if (storedRefreshToken) {
        refreshTokenMutation({ variables: { refreshToken: storedRefreshToken } })
          .then(response => {
            const newAccessToken = response.data?.refreshToken?.access_token;
            const newRefreshToken = response.data?.refreshToken?.refresh_token;
            const newUser = response.data?.refreshToken?.user;

            if (newAccessToken && newRefreshToken && newUser) {
              localStorage.setItem('access_token', newAccessToken);
              localStorage.setItem('refresh_token', newRefreshToken);
              setAccessToken(newAccessToken);
              setAccessTokenForApollo(newAccessToken);
              setUser(newUser);
            } else {
              logout();
            }
          })
          .catch(err => {
            console.error('AuthContext - Error refreshing token on startup:', err);
            logout();
          })
          .finally(() => {
            // isInitializing will be set to false by the GET_CURRENT_USER query's onCompleted/onError
            // If refresh fails and logout is called, logout will also clear state.
          });
      } else {
        // If no tokens at all, then initialization is complete and no user is logged in.
        setIsInitializing(false);
      }
    } else {
      // For SSR or environments without window, set to false
      setIsInitializing(false);
    }
  }, [logout, refreshTokenMutation]); // Add logout and refreshTokenMutation as dependencies

  // Effect to set isClientMounted to true after initial render on the client
  useEffect(() => {
    setIsClientMounted(true);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined' || !user || isInitializing || !isClientMounted) return; // Add isClientMounted check

    let activityInterval: NodeJS.Timeout;

    const updateActiveStatus = async () => {
      try {
        const { data } = await updateLastActive();
        if (data?.updateLastActive) {
          setUser(data.updateLastActive);
        }
      } catch (err) {
        // console.error('AuthContext - Error updating last active timestamp:', err);
      }
    };

    const startActivityTracking = () => {
      updateActiveStatus();
      activityInterval = setInterval(updateActiveStatus, 10000);
    };

    const stopActivityTracking = () => {
      clearInterval(activityInterval);
    };

    const handleFocus = async () => {
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        setOfflineTimer(null);
      }

      try {
        const { data } = await updateLastActive();
        if (data?.updateLastActive) {
          setUser(data.updateLastActive);
        }
        setIsOnline(true);
      } catch (err) {
        // console.error('AuthContext - Error updating last active timestamp on focus:', err);
      }

      startActivityTracking();
    };

    const handleBlur = () => {
      setIsOnline(false);
      stopActivityTracking();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    if (document.hasFocus()) {
      startActivityTracking();
    } else {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      stopActivityTracking();
    };
  }, [user, offlineTimer, updateLastActive, refetch, isInitializing]); // Add isInitializing dependency

  // Effect to handle redirection based on authentication state
  useEffect(() => {
    const publicPaths = ['/login', '/register', '/'];

    console.log('AuthContext Redirect Effect:', {
      isInitializing,
      loading,
      user: user ? { id: user.id, isVerified: user.isVerified } : null,
      pathname,
    });

    if (!isInitializing && !loading && !user) {
      if (!publicPaths.includes(pathname || '')) {
        console.log('AuthContext: Redirecting to /login (unauthenticated)');
        router.replace('/login');
      }
    } else if (!isInitializing && !loading && user) {
      if (pathname === '/login' || pathname === '/register') {
        if (!user.isVerified) {
          console.log('AuthContext: Showing email verification modal (unverified user on login/register page)');
          setShowEmailVerificationModal(true);
        } else {
          console.log('AuthContext: Redirecting to /chat (authenticated and verified user on login/register page)');
          router.replace('/chat');
        }
      } else if (pathname === '/') {
        if (user.isVerified) {
          console.log('AuthContext: Redirecting to /chat (authenticated and verified user on root page)');
          router.replace('/chat');
        } else {
          console.log('AuthContext: Showing email verification modal (unverified user on root page)');
          setShowEmailVerificationModal(true);
        }
      }
    }
  }, [user, loading, isInitializing, pathname, router, setShowEmailVerificationModal]);



  // Placeholder for currentChatId - in a real app, this would come from router params or another context
  const currentChatId = pathname?.startsWith('/chat/') ? pathname.split('/')[2] : null;

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: currentChatId || '' }, // Pass currentChatId to subscription
    skip: !currentChatId, // Skip subscription if no chat is active
    onData: ({ data }) => {
      const newMessage = data.data?.newMessage;
      if (newMessage && newMessage.sender.id !== user?.id && newMessage.chatId !== currentChatId) {
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

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Render children only after the component has mounted on the client */}
      {isClientMounted ? (
        isInitializing ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
            <Spinner className="lazy-loading-logo-container">
              <Image src="/images/logo.png" alt="BrainMessenger Logo" width={120} height={120} />
            </Spinner>
          </div>
        ) : (
          children
        )
      ) : (
        // Optionally render a minimal loading state on the server and during initial client render
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
           <Spinner className="lazy-loading-logo-container">
             <Image src="/images/logo.png" alt="BrainMessenger Logo" width={120} height={120} />
           </Spinner>
         </div>
      )}
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
