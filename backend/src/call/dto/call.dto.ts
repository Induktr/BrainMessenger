import { ObjectType, Field, ID } from '@nestjs/graphql';
// Import related DTOs if you want to return nested objects
// import { UserDto } from '../../user/dto/user.dto';
// import { ChatDto } from '../../chat/dto/chat.dto';

@ObjectType()
export class CallDto {
  @Field(() => ID)
  id: string;

  @Field()
  callerId: string; // Keep simple IDs for now

  @Field()
  calleeId: string; // Keep simple IDs for now

  @Field()
  chatId: string; // Keep simple IDs for now

  @Field()
  status: string;

  // Add other fields like createdAt, updatedAt if needed in GraphQL API
  // @Field()
  // createdAt: Date;
  // @Field()
  // updatedAt: Date;
}