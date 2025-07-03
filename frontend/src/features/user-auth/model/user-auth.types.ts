import type { User } from '@/entities/user/model/user.types';

export interface AuthContextType {
  user: User | null;
  queryLoading: boolean; // Renamed 'loading' to 'queryLoading'
  error: any;
  refetchUser: () => void;
  setUserState: (user: User | null) => void;
  logout: () => void;
  isInitializing: boolean;
  showEmailVerificationModal: boolean;
  setShowEmailVerificationModal: (show: boolean) => void;
  showNotification: boolean;
  notificationMessage: Message | null;
  closeNotification: () => void;
}

export interface Message { // Define Message interface here for NotificationDropdown
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

export interface RegisterFormInputs {
  email: string;
  password: string;
  name: string; // Added name field
  username: string; // Added username field
  confirmPassword: string;
}