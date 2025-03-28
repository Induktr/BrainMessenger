import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto';
// Import ChatDto later when it's created
// import { ChatDto } from '../../chat/dto/chat.dto';

@ObjectType()
export class MessageDto {
  @Field(() => ID)
  id: string;

  // @Field(() => ChatDto) // Add later
  // chat: ChatDto;

  @Field()
  chatId: string; // Keep simple ID for now

  @Field()
  content: string;

  // Make sender nullable in GraphQL schema
  @Field(() => UserDto, { nullable: true })
  sender: UserDto | null; // Allow null in TS type

  @Field()
  senderId: string;

  @Field()
  createdAt: Date;
}