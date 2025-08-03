'use client';

import React, { useState } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import { CloseModal } from '@/shared/assets/Icons/icons';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { CREATE_CHANNEL } from '@/entities/channel/model/channel.queries';
import { CreateChannelModalProps } from '@/features/create-chat/model/create-chat.types';
import { variantsStylesIcons } from '@/shared/assets/variantStyles/variantStyles';

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose }) => {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const { t } = useTranslation();

  const [createChannel, { loading, error }] = useMutation(CREATE_CHANNEL, {
    onCompleted: (data) => {
      console.log('Channel created:', data.createChannel);
      setChannelName('');
      setChannelDescription('');
      onClose();
    },
    onError: (err) => {
      console.error('Error creating channel:', err);
    },
  });

  const handleCreateClick = async () => {
    try {
      await createChannel({
        variables: {
          name: channelName,
          description: channelDescription || null,
        },
      });
    } catch (e) {
      // Error handled by onError in useMutation
    }
  };

  const handleCloseClick = () => {
    setChannelName('');
    setChannelDescription('');
    onClose();
  };

  return (
    <Modal onClose={handleCloseClick} isOpen={isOpen}>
      <div className="rounded-[10px]">
        {/* Header */}
        <div className={`${variantsStylesIcons.iconSecondary} flex justify-between items-center pb-4 border-b border-[var(--color-border)]`}>
          <h2 className="text-lg font-semibold">{t('createChannelModal.title')}</h2>
          <Button variant="ghost" size="icon" onClick={handleCloseClick}>
            <CloseModal alt={t('createChannelModal.alt.close')} className="w-6 h-6" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-6 mt-6">
          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {t('createChannelModal.nameLabel')}
            </label>
            <Input
              type="text"
              id="channelName"
              placeholder={t('createChannelModal.namePlaceholder')}
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="channelDescription" className="block text-[16px] font-medium text-[var(--color-text-secondary)] mb-2">
              {t('createChannelModal.descriptionLabel')}
            </label>
            <textarea
              id="channelDescription"
              className="w-full p-2 rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none resize-none"
              placeholder={t('createChannelModal.descriptionPlaceholder')}
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Create Button */}
        <div className="mt-8">
          <Button
            className="w-full !text-[var(--color-background)]"
            onClick={handleCreateClick}
            disabled={loading || !channelName.trim()}
          >
            {loading ? t('createChannelModal.creatingButton') : t('createChannelModal.createButton')}
          </Button>
          {error && <p className="text-sm text-[var(--color-error)] mt-2 text-center">{t('createChannelModal.errorMessage', { message: error.message })}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;