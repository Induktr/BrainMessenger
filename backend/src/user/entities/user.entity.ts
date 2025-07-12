import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { User as UserModel, UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles within the application',
});

@ObjectType()
export class User implements UserModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  // Password is not exposed via GraphQL
  password: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  username: string | null;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => Boolean)
  isBanned: boolean;

  @Field(() => Boolean)
  twoFactorEnabled: boolean;

  @Field(() => String, { nullable: true })
  twoFactorMethod: string | null;

  @Field(() => String, { nullable: true })
  recoveryEmail: string | null;

  @Field(() => String, { nullable: true })
  recoveryPhone: string | null;

  @Field(() => String, { nullable: true })
  verificationCode: string | null;

  @Field(() => Date, { nullable: true })
  verificationCodeExpiresAt: Date | null;

  @Field(() => Int)
  verificationAttempts: number;

  @Field(() => Date, { nullable: true })
  lastVerificationAttempt: Date | null;

  // Refresh token fields are not exposed via GraphQL
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => Date, { nullable: true })
  lastActiveAt: Date | null;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String, { nullable: true })
  banReason: string | null;

  @Field(() => String, { nullable: true })
  bannedUntil: Date | null;
}