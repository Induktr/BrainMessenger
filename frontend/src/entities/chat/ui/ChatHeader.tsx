import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Options } from '@/shared/assets/Icons/icons';
import { ChatHeaderProps } from '@/entities/chat/model/chat.types';
import UserProfileModal from '@/entities/user/ui/UserProfileModal';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId, partnerId, title, status, avatar, onOpenChannelDetails, onBackButtonClick }) => {
  const [showDetailsUserModal, setShowDetailsUserModal] = useState(false);

  const handleOpenUserDetails = () => {
    setShowDetailsUserModal(true);
  };

  const handleCloseUserDetails = () => {
    setShowDetailsUserModal(false);
  };

  const { dynamicStatus } = useStatusTyping(chatId, status);

  const { letter, color } = generateAvatarData(title);

  const isTyping = dynamicStatus.includes('typing');

  return (
    <header className="flex items-center justify-between p-3 border-b border-border bg-[var(--color-surface)] sticky top-0 z-10">
      {showDetailsUserModal && (
        <UserProfileModal
          onClose={handleCloseUserDetails}
          isOpen={showDetailsUserModal}
          userId={partnerId || chatId}
          status={dynamicStatus}
        />
      )}

      <div className="flex items-center gap-3">
        {onBackButtonClick && (
          <button 
            onClick={onBackButtonClick} 
            className="p-2 rounded-full hover:bg-surface-dark transition-colors md:hidden"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary" />
          </button>
        )}
        <button onClick={handleOpenUserDetails} className="flex items-center gap-3 text-left">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: avatar ? 'transparent' : color }}
          >
            {avatar ? (
              <img src={avatar} alt={title} width={40} height={40} className="rounded-full" />
            ) : (
              <span>{letter}</span>
            )}
          </div>
          <div>
            <h1 className="font-semibold text-text-primary leading-tight">{title}</h1>
            <p className={`text-sm leading-tight ${isTyping ? 'text-accent' : 'text-text-secondary'}`}>
              {dynamicStatus}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center">
        <button 
          onClick={onOpenChannelDetails} 
          className="p-2 rounded-full hover:bg-surface-dark transition-colors"
        >
          <Options className="w-6 h-6 text-text-primary" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;