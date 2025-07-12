export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

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
  role: UserRole;
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
  role?: UserRole;
}

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  status: string;
}