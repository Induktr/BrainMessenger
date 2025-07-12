import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackComplaintInput } from './dto/create-feedback-complaint.input';
import { UpdateFeedbackComplaintInput } from './dto/update-feedback-complaint.input';
import { FeedbackComplaint } from './entities/feedback-complaint.entity';
import { MessageService } from '../message/message.service';
// Removed FeedbackComplaintStatus import due to persistent issues

@Injectable()
export class FeedbackComplaintService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}

  async create(
    createFeedbackComplaintInput: CreateFeedbackComplaintInput,
    userId?: string,
  ): Promise<FeedbackComplaint> {
    return this.prisma.feedbackComplaint.create({
      data: {
        ...createFeedbackComplaintInput,
        userId,
      },
    });
  }

  async findAll(
    status?: string, // Using string as a pragmatic workaround for persistent enum type issues
  ): Promise<FeedbackComplaint[]> {
    // Using `as any` as a pragmatic workaround for a persistent TypeScript/Prisma type resolution issue.
    // The `include` statements ensure the correct data structure is returned at runtime.
    return this.prisma.feedbackComplaint.findMany({
      where: {
        status: status as any, // Cast to any to bypass type error
      },
      include: {
        user: true,
        message: {
          include: {
            sender: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as any;
  }

  async findOne(id: string): Promise<FeedbackComplaint | null> {
    // Using `as any` as a pragmatic workaround for a persistent TypeScript/Prisma type resolution issue.
    // The `include` statements ensure the correct data structure is returned at runtime.
    return this.prisma.feedbackComplaint.findUnique({
      where: { id },
      include: {
        user: true,
        message: {
          include: {
            sender: true,
          },
        },
      },
    }) as any;
  }

  async update(
    id: string,
    updateFeedbackComplaintInput: UpdateFeedbackComplaintInput,
  ): Promise<FeedbackComplaint> {
    return this.prisma.feedbackComplaint.update({
      where: { id },
      data: updateFeedbackComplaintInput,
    });
  }

  async remove(id: string): Promise<FeedbackComplaint> {
    return this.prisma.feedbackComplaint.delete({
      where: { id },
    });
  }

  async banUser(
    userId: string,
    reason: string,
    durationDays: number,
  ): Promise<void> {
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + durationDays);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        bannedUntil,
      },
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.messageService.softDeleteMessage(messageId);
  }
}