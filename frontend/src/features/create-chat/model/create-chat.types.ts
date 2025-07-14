import { ChannelDto } from '@/entities/channel/model/channel.types';
import { UserDto } from '@/entities/user/model/user.types';

export interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (channelName: string, channelDescription: string) => void; // Added onCreate prop
}

export interface ChannelDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: ChannelDto;
    isOwner: boolean;
    onChannelDeleted: () => void;
}