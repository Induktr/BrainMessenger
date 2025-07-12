import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class DeleteMessageInput {
  @Field(() => String)
  @IsUUID()
  messageId: string;
}