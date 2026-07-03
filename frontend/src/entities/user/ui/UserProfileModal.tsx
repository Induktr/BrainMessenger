'use client';

import { FC } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { useQuery } from '@apollo/client/react';
import { GET_USER_BY_ID } from '@/entities/user/model/user.queries';
import { Account, CloseModal } from '@/shared/assets/Icons/icons';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import Avatar from '@/shared/ui/Avatar/Avatar';
import { UserProfileModalProps } from '@/entities/user/model/user.types';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';
import { useTranslation } from 'react-i18next';
import { UsernameDog, Shield } from '@/shared/assets/Icons/icons';
import { Button } from '@/shared/ui/Button/Button';

import type { User } from '@/entities/user/model/user.types';

const UserProfileModal: FC<UserProfileModalProps> = ({ isOpen, onClose, userId, status }) => {
  const { user: currentUser } = useAuth();
  const { data, loading, error } = useQuery<{ getUser: User }>(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId || !isOpen,
  });

  const user = data?.getUser;
  const isCurrentUserProfile = currentUser?.id === userId;
  const { t } = useTranslation();

  const { dynamicStatus } = useStatusTyping(userId, status || 'offline' || 'online');

  if (loading) return <Modal isOpen={isOpen} onClose={onClose}><p>Loading user profile...</p></Modal>;
  if (error) return <Modal isOpen={isOpen} onClose={onClose}><p>Error loading user profile: {error.message}</p></Modal>;
  if (!user) return <Modal isOpen={isOpen} onClose={onClose}><p>User not found.</p></Modal>;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-[var(--color-text-primary)] rounded-[10px]">
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-[20px] lg:text-2xl sm:text-[20px] font-semibold">{t('user_profile.header_title')}</h2>
          <Button onClick={onClose} variant="ghost" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            <CloseModal alt="Close" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <div className="flex flex-col text-[16px] items-center py-6">
          <div className="relative">
            <Avatar
              src={user.avatarUrl}
              name={user.name || user.username || 'U'}
              size="xl"
              className="w-[80px] h-[80px] lg:w-[120px] lg:h-[120px] sm:w-[80px] sm:h-[80px]"
              textClassName="text-base lg:text-[20px] sm:text-base"
            />
          </div>
          <h2 className="text-base lg:text-[20px] sm:text-base font-bold mt-4">{user.name || user.username || 'Unknown User'}</h2>
          <p className={`mt-1 text-sm lg:text-base sm:text-sm ${dynamicStatus === 'online' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
            {dynamicStatus}
          </p>
          {user.bio && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-4">{user.bio}</p>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
          {user.name && (
            <div className="flex items-center">
              <Account alt="Account" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5 mr-4" />
              <div>
                <p className="text-sm lg:text-base sm:text-sm text-[var(--color-text-secondary)]">{t('user_profile.name_label')}</p>
                <p className="text-sm lg:text-base sm:text-sm text-[var(--color-gradient-start)] font-medium">{user.name}</p>
              </div>
            </div>
          )}

          {user.username && (
            <div className="flex items-center">
              <UsernameDog alt="Username" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5 mr-4" />
              <div>
                <p className="text-sm lg:text-base sm:text-sm text-[var(--color-text-secondary)]">{t('user_profile.user_name_label')}</p>
                <p className="text-sm lg:text-base sm:text-sm text-[var(--color-gradient-start)] font-medium">@{user.username}</p>
              </div>
            </div>
          )}


          <div className="flex items-center">
            <Shield alt="Verified" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5 mr-4" />
            <div>
              <p className="text-sm lg:text-base sm:text-sm text-[var(--color-text-secondary)]">{t('user_profile.verified_label')}</p>
              <p className={`text-sm lg:text-base sm:text-sm font-medium ${user.isVerified ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
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