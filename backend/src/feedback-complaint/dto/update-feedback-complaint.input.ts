import { CreateFeedbackComplaintInput } from './create-feedback-complaint.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { FeedbackComplaintStatus } from '@prisma/client'; // Import from Prisma client for validation

@InputType()
export class UpdateFeedbackComplaintInput extends PartialType(
  CreateFeedbackComplaintInput,
) {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => FeedbackComplaintStatus, { nullable: true })
  @IsOptional()
  @IsIn(Object.values(FeedbackComplaintStatus))
  status?: FeedbackComplaintStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  moderatorNotes?: string;
}