'use client';

import React, { 
  useState 
} from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext';
import ChatMessage from '@/entities/message/ui/ChatMessage';
import ChatInput from '@/features/send-message/ui/ChatInput';
import Spinner from '@/shared/ui/Spinner/Spinner';
import ImageGallery from '@/features/gallery-images/ui/ImageGallery';
import Button from '@/shared/ui/Button/Button';
import ChatHeader from '@/entities/chat/ui/ChatHeader';
import { useGlobalAudio } from '@/app/providers/GlobalAudioProvider/GlobalAudioContext';
import GlobalAudioControls from '@/features/manage-audio-player/ui/GlobalAudioControls';
import {
  useScrollToBottom
} from '@/hooks/useScrollToBottom';
import { 
  useChat 
} from '@/hooks/useChat';

interface ChatWindowWidgetProps {
  chatId: string;
  isChannel: boolean;
  isChannelOwner: boolean;
  isSubscribedToChannel: boolean;
  onSubscribe: () => Promise<void>;
  onUnsubscribe: () => Promise<void>;
  onSendMessageOrUpdate: (content: string, files: File[]) => Promise<void>;
  onOpenContextMenu: (event: React.MouseEvent) => void;
  onBackButtonClick: () => void; // Add this prop
}

const ChatWindowWidget: React.FC<ChatWindowWidgetProps> = ({
  chatId,
  isChannel,
  isChannelOwner,
  isSubscribedToChannel,
  onOpenContextMenu,
  onBackButtonClick, // Destructure the new prop
}) => {
  const { user } = useAuth();
  const { showGlobalControls } = useGlobalAudio();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    messages,
    chatDetails,
    loading,
    error,
    editingMessage,
    setEditingMessage,
    handleSendMessageOrUpdate,
    handleSubscribeToChannel,
    handleUnsubscribeFromChannel,
  } = useChat(chatId);
  const messagesEndRef = useScrollToBottom(messages);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const { t } = useTranslation();

  if (!chatId) return <p className="text-center text-[var(--color-text-secondary)] p-4">{t('chatWindow.selectChatPrompt')}</p>;
  if (loading) return <div className="flex items-center justify-center h-full bg-[var(--color-background)]"><Spinner className="w-10 h-10 text-[var(--color-accent)]" /></div>;
  if (error) return <p className="text-center text-[var(--color-danger)] p-4">{t('chatWindow.loadError', { message: error.message })}</p>;

  const getChatPartner = () => {
    if (!chatDetails || !user) return null;
    if (chatDetails.participants.length === 2) {
      return chatDetails.participants.find((u) => u.id !== user.id);
    }
    return null;
  };

  const chatPartner = getChatPartner();

  const getTitle = () => {
    if (chatDetails?.name) return chatDetails.name;
    if (chatPartner) return chatPartner.name;
    return t('chat_page.chat_title');
  };

  const getStatus = () => {
    if (chatPartner) {
      if (chatPartner.isOnline) return t('chat_page.online_status');
      if (chatPartner.lastSeen) {
        return `${t('chat_page.last_seen_prefix')} ${new Date(
          chatPartner.lastSeen
        ).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}`;
      }
      return t('chat_page.offline_status');
    }
    if (chatDetails) {
      const onlineCount = chatDetails.participants.filter(u => u.isOnline).length;
      return t('chat_page.members_count', { count: onlineCount });
    }
    return '...';
  };

  const getAvatar = () => {
    if (chatDetails?.avatarUrl) return chatDetails.avatarUrl;
    if (chatPartner?.avatarUrl) return chatPartner.avatarUrl;
    return undefined;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {selectedImage && <ImageGallery />}
      <ChatHeader
        chatId={chatId}
        partnerId={chatPartner?.id}
        title={getTitle()}
        status={getStatus()}
        avatar={getAvatar()}
        onOpenChannelDetails={onOpenContextMenu}
        onBackButtonClick={onBackButtonClick}
      />
      {showGlobalControls && <GlobalAudioControls />}
      <div className="flex-1 bg-[var(--color-background)] overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={msg.sender.id === user?.id}
            onEditMessage={() => setEditingMessage({ id: msg.id, content: msg.content })}
            onAudioEnded={() => {}}
            currentlyPlayingAudio={null}
            setCurrentlyPlayingAudio={() => {}}
            isSelected={false}
            isSelecting={false}
            isPoorConnection={false}
            isRecentMessage={true}
            currentUserId={user?.id}
            onImageClick={handleImageClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] sticky bottom-0">
        <ChatInput
          chatId={chatId}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          isChannel={isChannel}
          isChannelOwner={isChannelOwner}
          isSubscribedToChannel={isSubscribedToChannel}
          onSubscribe={handleSubscribeToChannel}
          onUnsubscribe={handleUnsubscribeFromChannel}
          onSendMessageOrUpdate={handleSendMessageOrUpdate}
        />
        {isChannel && !isSubscribedToChannel && (
          <div className="mt-3 text-center">
            <Button onClick={handleSubscribeToChannel} variant="primary" size="md">
              {t('chatWindow.subscribeButton')}
            </Button>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">{t('chatWindow.subscribePrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindowWidget;