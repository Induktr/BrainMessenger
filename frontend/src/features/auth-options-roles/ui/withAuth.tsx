'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import Spinner from '@/shared/ui/Spinner/Spinner';
import Image from 'next/image';
import { WithAuthOptions } from '@/features/auth-options-roles/model/auth-options-roles.types'

const withAuth = (WrappedComponent: React.ComponentType, options?: WithAuthOptions) => {
  const { requiredRoles = [], redirectPath = '/login' } = options || {};

  const ComponentWithAuth = (props: any) => {
    const { user, isInitializing, queryLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isInitializing && !queryLoading) {
        if (!user) {
          // Not authenticated, redirect to login
          router.replace(redirectPath);
        } else if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
          // Authenticated but unauthorized role, redirect to chat or a specific unauthorized page
          router.replace('/chat'); // Redirect to a default authenticated page
        }
      }
    }, [user, isInitializing, queryLoading, router, requiredRoles, redirectPath]);

    if (isInitializing || queryLoading || !user || (requiredRoles.length > 0 && !requiredRoles.includes(user.role))) {
      // Show a loading spinner or a minimal loading state while authenticating or if unauthorized
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
          <Spinner className="lazy-loading-logo-container">
            <Image src="/images/logo.png" alt="BrainMessenger Logo" width={120} height={120} />
          </Spinner>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;