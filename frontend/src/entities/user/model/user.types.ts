export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  username: string | null;
  status: string;
  lastActiveAt?: string | null;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  status: string;
}