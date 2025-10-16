import React from 'react';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

interface ChatLayoutProps {
  isChatViewActive: boolean;
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
  welcomeScreen: React.ReactNode;
  selectedChat: boolean;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  isChatViewActive,
  sidebar,
  chatWindow,
  welcomeScreen,
  selectedChat,
}) => {
  return (
    <div className="flex flex-col md:flex-row h-full bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {/* Sidebar - Mobile First */}
      <div
        className={`
          ${isChatViewActive ? 'hidden' : 'flex'}
          md:flex flex-col
          w-full md:w-[320px] lg:w-[380px]
          border-r border-[var(--color-border)]
          bg-[var(--color-surface)]
        `}
      >
        {sidebar}
      </div>

      {/* Chat Window - Mobile First */}
      <div
        className={`
          ${isChatViewActive ? 'flex' : 'hidden'}
          md:flex flex-col flex-1
          ${variantsStylesIcons.iconSecondary}
        `}
      >
        {selectedChat ? chatWindow : welcomeScreen}
      </div>
    </div>
  );
};

export default ChatLayout;