'use client';

import React, { useState } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import { ICONS } from '@/shared/assets/Icons/icons';
import Image from 'next/image';
import { useMutation } from '@apollo/client'; // Import useMutation
import { useTranslation } from 'react-i18next';
import { CREATE_CHANNEL } from '@/entities/channel/model/channel.queries'; // Import CREATE_CHANNEL mutation
import { CreateChannelModalProps } from '@/features/create-chat/model/create-chat.types';

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
      // Optionally, show an error message to the user
    },
  });

  const handleCreateClick = async () => {
    try {
      await createChannel({
        variables: {
          name: channelName,
          description: channelDescription || null, // Send null if description is empty
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
      <div className="create-channel-modal-content">
        {/* Header */}
        <div className="create-channel-header">
          <h2 className="create-channel-header-title">{t('createChannelModal.title')}</h2>
          <Button className="create-channel-close-button" onClick={handleCloseClick}>
            <Image src={ICONS.closeModal} alt={t('createChannelModal.alt.close')} className="icon" width={24} height={24} /> {/* Use img tag */}
          </Button> 
        </div>

        {/* Form */}
        <div className="create-channel-form">
          <div className="create-channel-input-group">
            <label className="create-channel-label">{t('createChannelModal.nameLabel')}</label>
            <Input
              placeholder={t('createChannelModal.namePlaceholder')}
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <div className="create-channel-input-group">
            <label className="create-channel-label">{t('createChannelModal.descriptionLabel')}</label>
             <textarea
              className="create-channel-textarea"
              placeholder={t('createChannelModal.descriptionPlaceholder')}
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Create Button */}
        <div className="create-channel-button-container">
           <Button
             className="create-channel-button-state-disabled"
             onClick={handleCreateClick}
             disabled={loading || !channelName.trim()} // Disable if loading or name is empty
           >
             {loading ? t('createChannelModal.creatingButton') : t('createChannelModal.createButton')}
           </Button>
           {error && <p className="error-message">{t('createChannelModal.errorMessage', { message: error.message })}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;