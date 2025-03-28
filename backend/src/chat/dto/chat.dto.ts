import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto';
import { MessageDto } from '../../message/dto/message.dto';

@ObjectType()
export class ChatDto {
  @Field(() => ID)
  id: string;

  // Make user nullable
  @Field(() => UserDto, { nullable: true })
  user: UserDto | null;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field()
  type: string;

  // Make messages nullable and items nullable
  @Field(() => [MessageDto], { nullable: 'itemsAndList' })
  messages: (MessageDto | null)[] | null;

  // Add calls field later if needed
  // @Field(() => [CallDto])
  // calls: CallDto[];
}