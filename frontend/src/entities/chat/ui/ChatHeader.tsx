import React, { useState } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons';
import { ChatHeaderProps } from '@/entities/chat/model/chat.types';
import UserProfileModal from '@/entities/user/ui/UserProfileModal';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId, partnerId, title, status, avatar, onOpenChannelDetails }) => {
  const [showDetailsUserModal, setShowDetailsUserModal] = useState(false);

  const handleOpenUserDetails = () => {
    setShowDetailsUserModal(true);
  };

  const handleCloseUserDetails = () => {
    setShowDetailsUserModal(false);
  };

  const { dynamicStatus } = useStatusTyping(chatId, status);

  const { letter, color } = generateAvatarData(title);

  return (
    <header className="app-header">
      {showDetailsUserModal && (
        <UserProfileModal
          onClose={handleCloseUserDetails}
          isOpen={showDetailsUserModal}
          userId={partnerId || chatId}
          status={dynamicStatus}
        />
      )}
      <div className="header-left-section" onClick={handleOpenUserDetails}>
        {avatar ? (
          <Image src={avatar} alt={title} className="header-avatar" width={40} height={40} />
        ) : (
          <div className="avatar-placeholder header-avatar" style={{ backgroundColor: color }}>
            <span>{letter}</span>
          </div>
        )}
        <div className="header-user-info">
          <h1 className="header-title">{title}</h1>
          <p className="header-status">{dynamicStatus}</p>
        </div>
      </div>
      <div className="header-right-section">
        <div onClick={onOpenChannelDetails} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Image
            src={ICONS.options}
            alt="Options"
            className="header-icon"
            width={24}
            height={24}
          />
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;