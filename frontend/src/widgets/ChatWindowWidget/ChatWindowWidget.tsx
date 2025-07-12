'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/user-auth/ui/AuthContext';
import ChatMessage from '@/entities/message/ui/ChatMessage';
import ChatInput from '@/features/send-message/ui/ChatInput';
import Spinner from '@/shared/ui/Spinner/Spinner';
import ImageGallery from '@/features/gallery-images/ui/ImageGallery';
import ChatHeader from '@/entities/chat/ui/ChatHeader';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useChat } from '@/hooks/useChat';

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

  if (!chatId) return <p>{t('chatWindow.selectChatPrompt')}</p>;
  if (loading) return <Spinner />;
  if (error) return <p>{t('chatWindow.loadError', { message: error.message })}</p>;

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
    <div className="chat-area-container">
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
      <div className="chat-messages-list">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender.id === user?.id;
          return (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={isCurrentUser}
              onEditMessage={() => setEditingMessage({ id: msg.id, content: msg.content })}
              onAudioEnded={() => {}}
              currentlyPlayingAudio={null}
              setCurrentlyPlayingAudio={() => {}}
              isSelected={false}
              isSelecting={false}
              onShowGlobalAudioControls={() => {}}
              isPoorConnection={false}
              isRecentMessage={true}
              currentUserId={user?.id}
              onImageClick={handleImageClick}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-panel">
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
          <div>
            <button onClick={handleSubscribeToChannel}>{t('chatWindow.subscribeButton')}</button>
            <p>{t('chatWindow.subscribePrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindowWidget;