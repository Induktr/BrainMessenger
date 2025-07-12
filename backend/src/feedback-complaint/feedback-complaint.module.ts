import { Module } from '@nestjs/common';
import { FeedbackComplaintService } from './feedback-complaint.service';
import { FeedbackComplaintResolver } from './feedback-complaint.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [PrismaModule, MessageModule],
  providers: [FeedbackComplaintResolver, FeedbackComplaintService],
})
export class FeedbackComplaintModule {}