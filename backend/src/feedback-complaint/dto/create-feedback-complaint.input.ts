import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';
import { FeedbackComplaintStatus } from '@prisma/client'; // Import from Prisma client for validation

@InputType()
export class CreateFeedbackComplaintInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  type: string; // e.g., "FEEDBACK", "COMPLAINT"

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  subject: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => FeedbackComplaintStatus, { nullable: true })
  @IsOptional()
  @IsIn(Object.values(FeedbackComplaintStatus))
  status?: FeedbackComplaintStatus; // Keep as FeedbackComplaintStatus for GraphQL

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  messageId?: string;
}