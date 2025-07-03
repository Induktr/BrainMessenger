import React from 'react';

interface ChatListItemProps {
  chat: {
    id: string;
    name: string;
    lastMessageSnippet?: string; // Make optional
    timestamp?: string; // Make optional
    unreadCount?: number; // Make optional
    username?: string; // Add username as optional
    avatarUrl?: string; // Add avatarUrl as optional
    type: string; // Add type field
  };
  isActive: boolean; // To indicate the currently selected chat
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {/* Avatar Placeholder */}
      <div className="chat-list-item-avatar"></div>

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