import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  // Добавьте другие поля по мере необходимости, например:
  // @Field()
  // twoFactorEnabled: boolean;

  // Не включайте пароль в DTO!
}