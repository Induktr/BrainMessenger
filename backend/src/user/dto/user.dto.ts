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
  twoFactorEnabled: boolean | null;

  @Field(() => String, { nullable: true })
  twoFactorMethod: string | null;

  @Field(() => String, { nullable: true })
  recoveryEmail: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => String, { nullable: true })
  status?: string | null;

  @Field(() => [String], { nullable: true })
  roles: string[] | null;

// Не включайте пароль в DTO!
}