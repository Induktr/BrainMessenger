import type { UserDto } from '@/entities/user/model/user.types';
import type { ChannelDto } from '@/entities/channel/model/channel.types';

export interface Chat {
  id: string;
  name: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  username?: string;
  avatarUrl?: string;
  type: 'PRIVATE' | 'GROUP' | 'CHANNEL';
  participants: UserDto[];
  channel?: ChannelDto;
}

export interface ChatListItemProps {
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

export interface ChatIdContextType {
  chatId: string | null;
  setChatId: (id: string | null) => void;
}

export interface ChatHeaderProps {
  chatId: string;
  partnerId?: string;
  title: string;
  status: string;
  avatar?: string;
  onOpenChannelDetails: (event: React.MouseEvent) => void;
}