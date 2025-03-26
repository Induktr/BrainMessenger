import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { CallService } from './call.service';
import { Call } from './call.entity';

@Resolver(() => Call)
export class CallResolver {
  constructor(private readonly callService: CallService) {}

  @Mutation(() => Call)
  async initiateCall(
    @Args('calleeId', { type: () => ID }) calleeId: string,
    @Args('chatId', { type: () => ID }) chatId: string,
  ): Promise<Call> {
    const callerId = 'user1'; // Replace with actual caller ID from context
    return this.callService.initiateCall(callerId, calleeId, chatId);
  }

  @Mutation(() => Call)
  async acceptCall(@Args('callId', { type: () => ID }) callId: string): Promise<Call> {
    // Implement accept call logic here
    return this.callService.acceptCall(callId);
  }

  @Mutation(() => Boolean)
  async endCall(@Args('callId', { type: () => ID }) callId: string): Promise<boolean> {
    // Implement end call logic here
    return this.callService.endCall(callId);
  }
}
