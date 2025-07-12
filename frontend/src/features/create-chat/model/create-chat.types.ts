export interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (channelName: string, channelDescription: string) => void; // Added onCreate prop
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
}
  
export interface ChannelDto {
    id: string;
    chatId: string;
    name: string;
    description?: string | null;
    subscribersCount: number;
    isPublic: boolean;
    owner: UserDto;
}
  
export interface ChannelDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: ChannelDto;
    isOwner: boolean;
    onChannelDeleted: () => void;
}