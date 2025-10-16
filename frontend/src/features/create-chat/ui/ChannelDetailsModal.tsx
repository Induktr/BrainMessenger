import React, { useState, useEffect } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import { CloseModal, Channel } from '@/shared/assets/Icons/icons';
import { useMutation } from '@apollo/client';
import { UPDATE_CHANNEL_PRIVACY, DELETE_CHANNEL } from '@/entities/channel/model/channel.queries';
import { useNotification } from '@/app/providers/NotificationProvider/NotificationContext';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import { ChannelDetailsModalProps } from '@/features/create-chat/model/create-chat.types';

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
      showNotification({
        id: new Date().toISOString(),
        chatId: channel.id,
        sender: { id: 'system', name: t('notifications.success') },
        content: t('channelDetailsModal.notifications.privacySet', { status: data.updateChannelPrivacy.isPublic ? t('channelDetailsModal.public') : t('channelDetailsModal.private') }),
        createdAt: new Date().toISOString(),
      });
    },
    onError: (error) => {
      console.error('Error updating channel privacy:', error);
      showNotification({
        id: new Date().toISOString(),
        chatId: channel.id,
        sender: { id: 'system', name: t('notifications.error') },
        content: t('channelDetailsModal.notifications.privacyError', { message: error.message }),
        createdAt: new Date().toISOString(),
      });
    },
  });

  const [deleteChannelMutation] = useMutation(DELETE_CHANNEL, {
    onCompleted: () => {
      showNotification({
        id: new Date().toISOString(),
        chatId: channel.id,
        sender: { id: 'system', name: t('notifications.success') },
        content: t('channelDetailsModal.notifications.deletedSuccess'),
        createdAt: new Date().toISOString(),
      });
      onChannelDeleted();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting channel:', error);
      showNotification({
        id: new Date().toISOString(),
        chatId: channel.id,
        sender: { id: 'system', name: t('notifications.error') },
        content: t('channelDetailsModal.notifications.deletedError', { message: error.message }),
        createdAt: new Date().toISOString(),
      });
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
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('channelDetailsModal.title')}</h2>
        <Button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <CloseModal alt={t('channelDetailsModal.alt.close')} width={24} height={24} />
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <Channel alt={t('channelDetailsModal.alt.avatar')} width={80} height={80} className="rounded-full" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('channelDetailsModal.nameLabel')} {channel.chatId}</h3>
          {channel.description && <p className="text-sm text-[var(--color-text-secondary)]">{t('channelDetailsModal.descriptionLabel')} {channel.description}</p>}
          <p className="text-sm text-[var(--color-text-secondary)]">{t('channelDetailsModal.subscribersLabel')} {channel.subscribersCount}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('channelDetailsModal.ownerLabel')} {channel.owner.name || channel.owner.username}</p>
        </div>

        {isOwner && (
          <div className="pt-6 space-y-4 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <label htmlFor="public-toggle" className="text-[var(--color-text-primary)]">{t('channelDetailsModal.publicToggleLabel')}</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="public-toggle"
                  checked={isPublic}
                  onChange={handleTogglePrivacy}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--color-success)]"></div>
              </label>
            </div>
            <Button onClick={handleDeleteChannelClick} className="w-full bg-[var(--color-error)] hover:bg-red-700 text-white">
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