import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateChatInput {
  @Field()
  type: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => [ID])
  participantIds: string[];
}