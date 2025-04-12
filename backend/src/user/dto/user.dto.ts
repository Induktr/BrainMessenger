import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;
@Field(() => Boolean) // Добавляем поле isVerified
isVerified: boolean;

// Добавьте другие поля по мере необходимости, например:
// @Field({ nullable: true }) // Пример необязательного поля
// avatarUrl?: string;

// Не включайте пароль в DTO!
}