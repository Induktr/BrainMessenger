import { Message } from '@/features/user-auth/model/user-auth.types';

export interface Notification {
    id: string;
    chatId: string;
    sender: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      username?: string | null;
      status?: string;
      bio?: string | null;
    };
    content: string;
    createdAt: string;
    attachments?: {
      id: string;
      url: string;
      filename: string;
      mimetype: string;
    }[];
}

export interface NotificationContextType {
    notification: Notification | null;
    showNotification: (notification: Notification) => void;
    clearNotification: () => void;
}

export interface NotificationDropdownProps {
  message: Notification | null;
  isVisible: boolean;
  onClose: () => void;
}