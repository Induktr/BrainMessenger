import { ObjectType, Field } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto';
import { ChatDto } from './chat.dto';

@ObjectType()
export class GlobalSearchResultDto {
  @Field(() => [UserDto])
  users: UserDto[];

  @Field(() => [ChatDto])
  chats: ChatDto[];
}