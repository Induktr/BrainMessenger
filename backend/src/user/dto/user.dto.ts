import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;
  
  @Field(() => String, { nullable: true }) // Add username field and make it nullable
  username: string | null;
  
  @Field(() => Boolean) // Добавляем поле isVerified
  isVerified: boolean;

  @Field(() => Boolean, { nullable: true })
  twoFactorEnabled?: boolean;

  @Field(() => String, { nullable: true })
  twoFactorMethod?: string;

  @Field(() => String, { nullable: true })
  recoveryEmail?: string;

// Добавьте другие поля по мере необходимости, например:
@Field(() => String, { nullable: true }) // Явное указание типа GraphQL
avatarUrl: string | null;

@Field(() => String, { nullable: true }) // Add bio field
bio: string | null;

@Field(() => String, { nullable: true }) // Make status field nullable
status?: string;

@Field(() => [String], { nullable: true }) // Add roles field as an array of strings, make it nullable
roles?: string[];

// Не включайте пароль в DTO!
}