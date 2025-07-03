import type { UserDto } from '@/entities/user/model/user.types';

export interface ChannelDto {
  id: string;
  chatId: string;
  description?: string | null;
  subscribersCount: number;
  isPublic: boolean;
  owner: UserDto;
}