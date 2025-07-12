import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { FeedbackComplaint as FeedbackComplaintModel, FeedbackComplaintStatus } from '@prisma/client';
import { User } from '../../user/entities/user.entity'; // Assuming User entity exists
import { MessageDto } from '../../message/dto/message.dto';

registerEnumType(FeedbackComplaintStatus, {
  name: 'FeedbackComplaintStatus',
  description: 'Status of a feedback or complaint',
});

@ObjectType()
export class FeedbackComplaint implements FeedbackComplaintModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  userId: string | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => String, { nullable: true })
  messageId: string | null;

  @Field(() => MessageDto, { nullable: true })
  message?: MessageDto | null;

  @Field(() => String)
  type: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  content: string;

  @Field(() => FeedbackComplaintStatus)
  status: FeedbackComplaintStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  moderatorNotes: string | null;
}