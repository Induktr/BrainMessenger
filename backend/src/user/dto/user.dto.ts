import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
});

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

  @Field(() => Boolean, { nullable: true })
  isOnline?: boolean;

  @Field(() => String, { nullable: true })
  lastSeen?: string;

  @Field(() => UserRole)
  role: UserRole;

// Не включайте пароль в DTO!
}