'use client';

import React, { useState } from 'react';
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
}

const ChatWindowWidget: React.FC<ChatWindowWidgetProps> = ({
  chatId,
  isChannel,
  isChannelOwner,
  isSubscribedToChannel,
  onOpenContextMenu,
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

  if (loading) return <Spinner />;
  if (error) return <p>Error loading messages: {error.message}</p>;

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
    return 'Chat';
  };

  const getStatus = () => {
    if (chatPartner) {
      if (chatPartner.isOnline) return 'online';
      if (chatPartner.lastSeen) {
        return `last seen ${new Date(
          chatPartner.lastSeen
        ).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}`;
      }
      return 'offline';
    }
    if (chatDetails) {
      const onlineCount = chatDetails.participants.filter(u => u.isOnline).length;
      return `${onlineCount} members`;
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
      </div>
    </div>
  );
};

export default ChatWindowWidget;