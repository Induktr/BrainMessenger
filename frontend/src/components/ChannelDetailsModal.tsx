import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Image from 'next/image';
import { icons } from '@/app/lib/constants';
import { useMutation } from '@apollo/client';
import { UPDATE_CHANNEL_PRIVACY, DELETE_CHANNEL } from '@/graphql/queries';
import { useNotification } from '@/context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

interface UserDto {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  status?: string;
}

interface ChannelDto {
  id: string;
  chatId: string;
  description?: string | null;
  subscribersCount: number;
  isPublic: boolean;
  owner: UserDto;
}

interface ChannelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ChannelDto;
  isOwner: boolean;
  onChannelDeleted: () => void;
}

const ChannelDetailsModal: React.FC<ChannelDetailsModalProps> = ({
  isOpen,
  onClose,
  channel,
  isOwner,
  onChannelDeleted,
}) => {
  const [isPublic, setIsPublic] = useState(channel.isPublic);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const { showNotification } = useNotification();

  const [updateChannelPrivacy] = useMutation(UPDATE_CHANNEL_PRIVACY, {
    onCompleted: (data) => {
      showNotification('Success', `Channel is now ${data.updateChannelPrivacy.isPublic ? 'public' : 'private'}.`);
    },
    onError: (error) => {
      console.error('Error updating channel privacy:', error);
      showNotification('Error', `Failed to update channel privacy: ${error.message}`);
    },
  });

  const [deleteChannelMutation] = useMutation(DELETE_CHANNEL, {
    onCompleted: () => {
      showNotification('Success', 'Channel deleted successfully!');
      onChannelDeleted();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting channel:', error);
      showNotification('Error', `Failed to delete channel: ${error.message}`);
    },
  });

  useEffect(() => {
    setIsPublic(channel.isPublic);
  }, [channel.isPublic]);

  const handleTogglePrivacy = async () => {
    try {
      await updateChannelPrivacy({
        variables: {
          channelId: channel.id,
          isPublic: !isPublic,
        },
      });
      setIsPublic(prev => !prev);
    } catch (error) {
      // Error handled by onError in useMutation
    }
  };

  const handleDeleteChannelClick = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteChannel = async () => {
    try {
      await deleteChannelMutation({ variables: { channelId: channel.id } });
      setShowDeleteConfirmModal(false);
    } catch (error) {
      // Error handled by onError in useMutation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Channel Details</h2>
        <Button onClick={onClose} className="modal-close-button">
          <Image src={icons.closeModal} alt="Close" width={24} height={24} />
        </Button>
      </div>
      <div className="channel-details-modal-content">
        <div className="channel-avatar-section">
          <Image src={icons.channel} alt="Channel Avatar" width={80} height={80} className="rounded-full" />
        </div>
        <div className="channel-info-section">
          <h3>Name: {channel.chatId}</h3> {/* Assuming chatId is the channel name for now */}
          {channel.description && <p>Description: {channel.description}</p>}
          <p>Subscribers: {channel.subscribersCount}</p>
          <p>Owner: {channel.owner.name || channel.owner.username}</p>
        </div>

        {isOwner && (
          <div className="channel-settings-section">
            <div className="toggle-switch-container">
              <label htmlFor="public-toggle">Public Channel:</label>
              <input
                type="checkbox"
                id="public-toggle"
                checked={isPublic}
                onChange={handleTogglePrivacy}
                className="toggle-switch"
              />
            </div>
            <Button onClick={handleDeleteChannelClick} className="delete-channel-button">
              Delete Channel
            </Button>
          </div>
        )}
      </div>

      {showDeleteConfirmModal && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDeleteChannel}
          title="Confirm Delete Channel"
          message={`Are you sure you want to delete the channel "${channel.chatId}"? This action cannot be undone.`}
          confirmText="Delete Channel"
          cancelText="Cancel"
        />
      )}
    </Modal>
  );
};

export default ChannelDetailsModal;