import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto'; // Import UserDto

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string; // Add refresh_token field

  @Field(() => UserDto) // Use UserDto
 user: UserDto; // Use UserDto
}
