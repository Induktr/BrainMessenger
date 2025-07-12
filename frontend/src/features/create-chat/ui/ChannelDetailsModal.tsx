import React, { useState, useEffect } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons';
import { useMutation } from '@apollo/client';
import { UPDATE_CHANNEL_PRIVACY, DELETE_CHANNEL } from '@/entities/channel/model/channel.queries';
import { useNotification } from '@/features/manage-notifications/ui/NotificationContext';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import { ChannelDetailsModalProps, ChannelDto, UserDto } from '@/features/create-chat/model/create-chat.types';

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
  const { t } = useTranslation();

  const [updateChannelPrivacy] = useMutation(UPDATE_CHANNEL_PRIVACY, {
    onCompleted: (data) => {
      showNotification(t('notifications.success'), t('channelDetailsModal.notifications.privacySet', { status: data.updateChannelPrivacy.isPublic ? t('channelDetailsModal.public') : t('channelDetailsModal.private') }));
    },
    onError: (error) => {
      console.error('Error updating channel privacy:', error);
      showNotification(t('notifications.error'), t('channelDetailsModal.notifications.privacyError', { message: error.message }));
    },
  });

  const [deleteChannelMutation] = useMutation(DELETE_CHANNEL, {
    onCompleted: () => {
      showNotification(t('notifications.success'), t('channelDetailsModal.notifications.deletedSuccess'));
      onChannelDeleted();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting channel:', error);
      showNotification(t('notifications.error'), t('channelDetailsModal.notifications.deletedError', { message: error.message }));
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
        <h2>{t('channelDetailsModal.title')}</h2>
        <Button onClick={onClose} className="modal-close-button">
          <Image src={ICONS.closeModal} alt={t('channelDetailsModal.alt.close')} width={24} height={24} />
        </Button>
      </div>
      <div className="channel-details-modal-content">
        <div className="channel-avatar-section">
          <Image src={ICONS.channel} alt={t('channelDetailsModal.alt.avatar')} width={80} height={80} className="rounded-full" />
        </div>
        <div className="channel-info-section">
          <h3>{t('channelDetailsModal.nameLabel')} {channel.chatId}</h3> {/* Assuming chatId is the channel name for now */}
          {channel.description && <p>{t('channelDetailsModal.descriptionLabel')} {channel.description}</p>}
          <p>{t('channelDetailsModal.subscribersLabel')} {channel.subscribersCount}</p>
          <p>{t('channelDetailsModal.ownerLabel')} {channel.owner.name || channel.owner.username}</p>
        </div>

        {isOwner && (
          <div className="channel-settings-section">
            <div className="toggle-switch-container">
              <label htmlFor="public-toggle">{t('channelDetailsModal.publicToggleLabel')}</label>
              <input
                type="checkbox"
                id="public-toggle"
                checked={isPublic}
                onChange={handleTogglePrivacy}
                className="toggle-switch"
              />
            </div>
            <Button onClick={handleDeleteChannelClick} className="delete-channel-button">
              {t('channelDetailsModal.deleteButton')}
            </Button>
          </div>
        )}
      </div>

      {showDeleteConfirmModal && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDeleteChannel}
          title={t('channelDetailsModal.confirmDelete.title')}
          message={t('channelDetailsModal.confirmDelete.message', { channelName: channel.chatId })}
          confirmText={t('channelDetailsModal.confirmDelete.confirmText')}
          cancelText={t('channelDetailsModal.confirmDelete.cancelText')}
        />
      )}
    </Modal>
  );
};

export default ChannelDetailsModal;