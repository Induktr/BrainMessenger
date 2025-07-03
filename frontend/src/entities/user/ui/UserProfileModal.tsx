'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from '@/entities/user/model/user.queries';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons';
import { useAuth } from '@/features/user-auth/ui/AuthContext'; // To check if it's the current user
import { UserProfileModalProps } from '@/entities/user/model/user.types';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';

import type { User } from '@/entities/user/model/user.types';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId, status }) => {
  const { user: currentUser } = useAuth(); // Get current authenticated user
  const { data, loading, error } = useQuery<{ getUser: User }>(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId || !isOpen, // Skip query if no userId or modal is not open
  });

  const user = data?.getUser;
  const isCurrentUserProfile = currentUser?.id === userId; // Check if viewing own profile

  const { dynamicStatus } = useStatusTyping(userId, status || 'offline' || 'online');

  if (loading) return <Modal isOpen={isOpen} onClose={onClose}><p>Loading user profile...</p></Modal>;
  if (error) return <Modal isOpen={isOpen} onClose={onClose}><p>Error loading user profile: {error.message}</p></Modal>;
  if (!user) return <Modal isOpen={isOpen} onClose={onClose}><p>User not found.</p></Modal>;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="myaccount-modal-content">
        <div className="myaccount-header">
          <button className="myaccount-close-button" onClick={onClose}>
            <Image src={ICONS.closeModal} alt="Close" width={24} height={24} className="icon" />
          </button>
          <h2 className="myaccount-header-title">User Profile</h2>
          {/* Placeholder for options icon - hidden if not current user */}
          {isCurrentUserProfile && (
            <div className="myaccount-header-options">
              {/* You can add an edit icon here if needed for own profile */}
            </div>
          )}
        </div>

        <div className="myaccount-user-info-section">
          <div className="myaccount-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.name}'s avatar`} className="myaccount-avatar-image" />
            ) : (
              <div className="default-avatar"></div>
            )}
          </div>
          <div className="myaccount-name-status">
            <h2 className="myaccount-user-name">{user.name || user.username || 'Unknown User'}</h2>
            <p className={`myaccount-user-status ${dynamicStatus === 'offline' ? {lastSeen: dynamicStatus} : 'online'}`}>
              {dynamicStatus}
            </p>
          </div>
          {user.bio && (
            <p className="myaccount-user-description">{user.bio}</p>
          )}
        </div>

        <div className="myaccount-separator"></div>

        <div className="myaccount-detailed-info">
          <div className="myaccount-info-item">
            <div className="myaccount-info-icon">
              <Image src={ICONS.mail} alt="Email" width={24} height={24} className="icon" />
            </div>
            <div className="myaccount-info-text">
              <span className="myaccount-info-label">Email:</span>
              <span className="myaccount-info-value">{user.email}</span>
            </div>
          </div>

          {user.username && (
            <div className="myaccount-info-item">
              <div className="myaccount-info-icon">
                <Image src={ICONS.usernameDog} alt="Username" width={24} height={24} className="icon" />
              </div>
              <div className="myaccount-info-text">
                <span className="myaccount-info-label">Username:</span>
                <span className="myaccount-info-value">{user.username}</span>
              </div>
            </div>
          )}

          {/* Add other read-only fields as needed, e.g., isVerified */}
          <div className="myaccount-info-item">
            <div className="myaccount-info-icon">
              <Image src={ICONS.shield} alt="Verified" width={24} height={24} className="icon" />
            </div>
            <div className="myaccount-info-text">
              <span className="myaccount-info-label">Verified:</span>
              <span className={`myaccount-info-value ${user.isVerified ? 'myaccount-info-value-green' : ''}`}>
                {user.isVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
        {/* No edit buttons or input fields for other users */}
      </div>
    </Modal>
  );
};

export default UserProfileModal;