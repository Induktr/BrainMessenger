'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from '@/entities/user/model/user.queries';
import Image from 'next/image';
import { Account, CloseModal } from '@/shared/assets/Icons/icons';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext'; // To check if it's the current user
import { UserProfileModalProps } from '@/entities/user/model/user.types';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';
import { useTranslation } from 'react-i18next';
import { Mail, UsernameDog, Shield } from '@/shared/assets/Icons/icons'; // Import icons for email and username

import type { User } from '@/entities/user/model/user.types';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId, status }) => {
  const { user: currentUser } = useAuth(); // Get current authenticated user
  const { data, loading, error } = useQuery<{ getUser: User }>(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId || !isOpen, // Skip query if no userId or modal is not open
  });

  const user = data?.getUser;
  const isCurrentUserProfile = currentUser?.id === userId; // Check if viewing own profile

  const { t } = useTranslation();

  const { dynamicStatus } = useStatusTyping(userId, status || 'offline' || 'online');

  if (loading) return <Modal isOpen={isOpen} onClose={onClose}><p>Loading user profile...</p></Modal>;
  if (error) return <Modal isOpen={isOpen} onClose={onClose}><p>Error loading user profile: {error.message}</p></Modal>;
  if (!user) return <Modal isOpen={isOpen} onClose={onClose}><p>User not found.</p></Modal>;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-[var(--color-text-primary)] rounded-[10px]">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-2xl font-semibold">{t('user_profile.header_title')}</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <CloseModal alt="Close" width={24} height={24} />
          </button>
        </div>

        <div className="flex flex-col text-[16px] items-center py-6">
          <div className="relative">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.name}'s avatar`} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--color-disabled)] flex items-center justify-center">
                <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">{user.name || user.username || 'Unknown User'}</h2>
          <p className={`mt-1 ${dynamicStatus === 'online' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
            {dynamicStatus}
          </p>
          {user.bio && (
            <p className="text-[var(--color-text-secondary)] mt-4">{user.bio}</p>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
          {user.name && (
            <div className="flex items-center">
              <Account alt="Account" width={20} height={20} className="text-[var(--color-text-secondary)] mr-4" />
              <div>
                <p className="text-[var(--color-text-secondary)]">{t('user_profile.name_label')}</p>
                <p className="text-[var(--color-gradient-start)] font-medium">{user.name}</p>
              </div>
            </div>
          )}

          {user.username && (
            <div className="flex items-center">
              <UsernameDog alt="Username" width={20} height={20} className="text-[var(--color-text-secondary)] mr-4" />
              <div>
                <p className="text-[var(--color-text-secondary)]">{t('user_profile.user_name_label')}</p>
                <p className="text-[var(--color-gradient-start)] font-medium">@{user.username}</p>
              </div>
            </div>
          )}


          <div className="flex items-center">
            <Shield alt="Verified" width={20} height={20} className="text-[var(--color-text-secondary)] mr-4" />
            <div>
              <p className="text-[var(--color-text-secondary)]">{t('user_profile.verified_label')}</p>
              <p className={`font-medium ${user.isVerified ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                {user.isVerified ? t('user_profile.yes') : t('user_profile.no')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;