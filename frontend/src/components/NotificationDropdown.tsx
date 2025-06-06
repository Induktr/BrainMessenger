'use client';

import React from 'react';
import Image from 'next/image';
import { icons } from '@/app/lib/constants';

interface Message {
  id: string;
  chatId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    username?: string | null;
    status?: string;
    bio?: string | null;
  };
  content: string;
  createdAt: string;
  attachments?: {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
  }[];
}

interface NotificationDropdownProps {
  message: Message | null;
  isVisible: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ message, isVisible, onClose }) => {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className={`notification-dropdown ${isVisible ? 'show' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-sender-info">
            {message.sender.avatarUrl ? (
              <img src={message.sender.avatarUrl} alt={`${message.sender.name}'s avatar`} width={32} height={32} className="rounded-full notification-avatar" />
            ) : (
              <div className="default-avatar notification-avatar"></div>
            )}
            <span className="notification-sender-name">{message.sender.name || message.sender.username || 'Unknown User'}</span>
          </div>
          <button onClick={onClose} className="notification-close-button">
            <Image src={icons.closeModal} alt="Close" width={16} height={16} />
          </button>
        </div>
        <p className="notification-message-content">{message.content}</p>
      </div>
    </div>
  );
};

export default NotificationDropdown;