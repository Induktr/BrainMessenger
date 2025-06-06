'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import Input from '@/components/Input'; // Assuming an Input component exists
import Button from '@/components/Button'; // Assuming a Button component exists
import { icons } from '../app/lib/constants';
import Image from 'next/image';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (channelName: string, channelDescription: string) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');

  const handleCreateClick = () => {
    onCreate(channelName, channelDescription);
    setChannelName('');
    setChannelDescription('');
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
          <h2 className="create-channel-header-title">Create New Channel</h2>
          <Button className="create-channel-close-button" onClick={handleCloseClick}>
            <Image src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Form */}
        <div className="create-channel-form">
          <div className="create-channel-input-group">
            <label className="create-channel-label">Channel Name</label>
            <Input
              placeholder="Enter title..."
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <div className="create-channel-input-group">
            <label className="create-channel-label">Description (optional)</label>
             <textarea
              className="create-channel-textarea"
              placeholder="Tell us what your channel is about..."
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Create Button */}
        <div className="create-channel-button-container">
           <Button className="create-channel-button-state-disabled" onClick={handleCreateClick}>Create Channel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;