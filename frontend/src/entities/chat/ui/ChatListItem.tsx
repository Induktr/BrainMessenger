import React from 'react';
import { ChatListItemProps } from '@/entities/chat/model/chat.types';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  const { letter, color } = generateAvatarData(chat.name);

  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-list-item-avatar">
        {chat.avatarUrl ? (
          <img src={chat.avatarUrl} alt={chat.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder" style={{ backgroundColor: color }}>
            <span>{letter}</span>
          </div>
        )}
      </div>

      <div className="chat-list-item-content">
        <div className="chat-list-item-header">
          <h3 className="chat-list-item-name">{chat.name}</h3>
          <span className="chat-list-item-timestamp">{chat.timestamp}</span>
        </div>
        <div className="chat-list-item-snippet">
          <p>{chat.lastMessageSnippet}</p>
          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
            <span className="chat-list-item-unread-count">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;