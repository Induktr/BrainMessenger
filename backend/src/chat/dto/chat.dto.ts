import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto';
import { MessageDto } from '../../message/dto/message.dto';
import { ChannelDto } from './channel.dto';

@ObjectType()
export class ChatDto {

  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field()
  type: string;

  @Field(() => String, { nullable: true })
  lastMessageSnippet: string | null;

  @Field(() => String, { nullable: true })
  lastMessageTimestamp: string | null; // Or use a proper DateTime type if available in GraphQL

  @Field()
  unreadCount: number;

  // Add participants field later if needed for chat details
  @Field(() => [UserDto])
  participants: UserDto[];

  // Make messages nullable and items nullable
  @Field(() => [MessageDto], { nullable: 'itemsAndList' })
  messages: (MessageDto | null)[] | null;

  // Add calls field later if needed
  // @Field(() => [CallDto])
  // calls: CallDto[];
  @Field(() => ChannelDto, { nullable: true })
  channel?: ChannelDto;
}