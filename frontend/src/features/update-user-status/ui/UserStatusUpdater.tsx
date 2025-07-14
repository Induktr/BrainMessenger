'use client';

import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import { UPDATE_LAST_ACTIVE_MUTATION, GET_CURRENT_USER } from '@/entities/user/model/user.queries';

// This component handles periodically updating the user's last active status
export default function UserStatusUpdater() {
  const { user } = useAuth();
  const [updateLastActive] = useMutation(UPDATE_LAST_ACTIVE_MUTATION, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });

  useEffect(() => {
    if (user) {
      // Immediately update status on login/app load
      updateLastActive();

      // Set up an interval to update the status every 15 seconds
      const intervalId = setInterval(() => {
        updateLastActive();
      }, 15000); // 15 seconds

      // Clear the interval on component unmount or when the user logs out
      return () => clearInterval(intervalId);
    }
  }, [user, updateLastActive]);

  return null; // This component does not render anything
}
