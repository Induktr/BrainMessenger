import { Field, ObjectType } from '@nestjs/graphql';
import { ChatDto } from './chat.dto';
import { UserDto } from '../../user/dto/user.dto'; // Assuming UserDto exists

@ObjectType()
export class ChannelDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  chatId: string;

  @Field(() => ChatDto)
  chat: ChatDto;

  @Field(() => String)
  ownerId: string;

  @Field(() => UserDto)
  owner: UserDto;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Number)
  subscribersCount: number;

  @Field(() => Boolean)
  isPublic: boolean;
}