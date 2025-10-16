import React, { useState } from 'react';
import { ArrowLeft, Options } from '@/shared/assets/Icons/icons';
import { ChatHeaderProps } from '@/entities/chat/model/chat.types';
import UserProfileModal from '@/entities/user/ui/UserProfileModal';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';
import Avatar from '@/shared/ui/Avatar/Avatar';
import Button from '@/shared/ui/Button/Button';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId, partnerId, title, status, avatar, onOpenChannelDetails, onBackButtonClick }) => {
  const [showDetailsUserModal, setShowDetailsUserModal] = useState(false);

  const handleOpenUserDetails = () => {
    setShowDetailsUserModal(true);
  };

  const handleCloseUserDetails = () => {
    setShowDetailsUserModal(false);
  };

  const { dynamicStatus } = useStatusTyping(chatId, status);
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
          <Button 
            onClick={onBackButtonClick} 
            className="md:hidden"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />
          </Button>
        )}
        <button onClick={handleOpenUserDetails} className="flex items-center gap-3 text-left">
          <Avatar src={avatar} name={title} size="md" />
          <div>
            <h1 className="font-semibold text-[16px] text-[--color-text-primary] lg:text-[24px] sm:text-[16px] leading-tight">{title}</h1>
            <p className={`text-sm lg:text-[16px] leading-tight ${isTyping ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-secondary)]'}`}>
              {dynamicStatus}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center">
        <Button 
          onClick={onOpenChannelDetails} 
          variant="ghost"
        >
          <Options className={`${variantsStylesIcons.iconSecondary} w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5`} />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;