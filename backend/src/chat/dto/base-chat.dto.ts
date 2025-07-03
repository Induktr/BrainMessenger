import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ChatType } from '@prisma/client';

// Register the enum with GraphQL
registerEnumType(ChatType, {
  name: 'ChatType',
});

@ObjectType()
export class BaseChatDto {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => ChatType)
  type: ChatType;
}
