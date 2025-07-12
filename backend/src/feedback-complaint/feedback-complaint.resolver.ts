import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FeedbackComplaintService } from './feedback-complaint.service';
import { FeedbackComplaint } from './entities/feedback-complaint.entity';
import { CreateFeedbackComplaintInput } from './dto/create-feedback-complaint.input';
import { UpdateFeedbackComplaintInput } from './dto/update-feedback-complaint.input';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedbackComplaintStatus } from '@prisma/client';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Resolver(() => FeedbackComplaint)
export class FeedbackComplaintResolver {
  constructor(
    private readonly feedbackComplaintService: FeedbackComplaintService,
  ) {}

  @Mutation(() => FeedbackComplaint)
  @UseGuards(GqlAuthGuard)
  createFeedbackComplaint(
    @Args('createFeedbackComplaintInput')
    createFeedbackComplaintInput: CreateFeedbackComplaintInput,
    @CurrentUser() user: User,
  ) {
    return this.feedbackComplaintService.create(
      createFeedbackComplaintInput,
      user.id,
    );
  }

  @Query(() => [FeedbackComplaint], { name: 'feedbackComplaints' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  findAll(
    @Args('status', { type: () => FeedbackComplaintStatus, nullable: true })
    status?: FeedbackComplaintStatus,
  ) {
    return this.feedbackComplaintService.findAll(status);
  }

  @Query(() => FeedbackComplaint, { name: 'feedbackComplaint' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.feedbackComplaintService.findOne(id);
  }

  @Mutation(() => FeedbackComplaint)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  updateFeedbackComplaint(
    @Args('updateFeedbackComplaintInput')
    updateFeedbackComplaintInput: UpdateFeedbackComplaintInput,
  ) {
    return this.feedbackComplaintService.update(
      updateFeedbackComplaintInput.id,
      updateFeedbackComplaintInput,
    );
  }

  @Mutation(() => FeedbackComplaint)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  removeFeedbackComplaint(@Args('id', { type: () => String }) id: string) {
    return this.feedbackComplaintService.remove(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async banUser(
    @Args('userId', { type: () => String }) userId: string,
    @Args('reason', { type: () => String }) reason: string,
    @Args('durationDays', { type: () => Int }) durationDays: number,
  ): Promise<boolean> {
    await this.feedbackComplaintService.banUser(userId, reason, durationDays);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async deleteComplaintMessage(
    @Args('messageId', { type: () => String }) messageId: string,
  ): Promise<boolean> {
    await this.feedbackComplaintService.deleteMessage(messageId);
    return true;
  }
}