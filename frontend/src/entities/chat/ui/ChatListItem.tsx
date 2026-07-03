import { ChatListItemProps } from '@/entities/chat/model/chat.types';
import Avatar from '@/shared/ui/Avatar/Avatar';
import { FC } from 'react';

const ChatListItem: FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  return (
    <div
      className={`flex items-center p-2 md:p-3 cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'bg-[var(--color-gradient-start)]/30'
          : 'hover:bg-[var(--color-surface)]'
      }`}
      onClick={onClick}
    >
      <div className="relative mr-3 md:mr-4">
        <Avatar
          src={chat.avatarUrl}
          name={chat.name}
          className="w-10 h-10 md:w-12 md:h-12"
          textClassName="text-lg md:text-xl text-white"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm md:text-base font-semibold truncate text-[var(--color-text-primary)]">{chat.name}</h3>
          <span className="text-xs md:text-sm text-[var(--color-text-secondary)]">{chat.timestamp}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] truncate">{chat.lastMessageSnippet}</p>
          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
            <span className="bg-[var(--color-accent)] text-white text-xs font-bold rounded-full px-2 py-0.5">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;