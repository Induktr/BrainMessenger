import { Field, ObjectType } from '@nestjs/graphql';
import { BaseChatDto } from './base-chat.dto';
import { UserDto } from '../../user/dto/user.dto'; // Assuming UserDto exists

@ObjectType()
export class ChannelDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  chatId: string;

  @Field(() => BaseChatDto)
  chat: BaseChatDto;

  @Field(() => String)
  ownerId: string;

  @Field(() => UserDto)
  owner: UserDto;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Number)
  joinsCount: number;

  @Field(() => Boolean)
  isPublic: boolean;
}