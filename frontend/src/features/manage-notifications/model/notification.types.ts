import { Message } from '@/features/user-auth/model/user-auth.types';

export interface Notification {
    id: string;
    senderName: string;
    messageSnippet: string;
    avatarUrl?: string | null;
}

export interface NotificationContextType {
    notification: Notification | null;
    showNotification: (senderName: string, messageSnippet: string, avatarUrl?: string | null) => void;
    clearNotification: () => void;
}

export interface NotificationDropdownProps {
  message: Message | null;
  isVisible: boolean;
  onClose: () => void;
}