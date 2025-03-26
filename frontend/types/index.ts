export type User = {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
};

export type Chat = {
  id: string;
  name: string;
  type: 'personal' | 'group' | 'channel';
  lastMessage?: Message;
  participants?: User[];
};

export type Message = {
  id: string;
  content: string;
  sender: User;
  senderId?: string;
  createdAt: string;
  chat?: {
    id: string;
  };
  attachments?: Attachment[];
};

export type Attachment = {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
};

export type Call = {
  id: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'ongoing' | 'ended' | 'missed';
  caller: User;
  participants: User[];
  startedAt?: string;
  endedAt?: string;
};

export type AuthResponse = {
  id: string;
  username: string;
  email: string;
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  encryptionEnabled: boolean;
  privacySettings: PrivacySettings;
};

export type PrivacySettings = {
  profileVisibility: 'public' | 'contacts' | 'private';
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceiptsEnabled: boolean;
};

export interface Window {
  ethereum: any;
};
