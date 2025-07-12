import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsDate } from 'class-validator';

@InputType()
export class BanUserInput {
  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsString()
  reason: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  bannedUntil?: Date;
}