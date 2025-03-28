import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { CallService } from './call.service';
import { CallDto } from './dto/call.dto'; // Import CallDto
import { Prisma } from '@prisma/client'; // Import Prisma types if needed for mapping

// Define a type for the Prisma Call payload if includes are added later
type PrismaCallPayload = Prisma.CallGetPayload<{
  // include: { caller: true, callee: true, chat: true } // Example includes
}>;

// Helper function to map Prisma Call to CallDto
const mapCallToDto = (call: PrismaCallPayload | null): CallDto | null => {
  if (!call) return null;
  // Simple mapping for now, assuming service returns basic Call object
  // If includes are added to service, map related DTOs here
  return {
    id: call.id,
    callerId: call.callerId,
    calleeId: call.calleeId,
    chatId: call.chatId,
    status: call.status,
    // createdAt: call.createdAt, // Uncomment if added to DTO/Schema
    // updatedAt: call.updatedAt, // Uncomment if added to DTO/Schema
  };
};

@Resolver(() => CallDto) // Use CallDto
export class CallResolver {
  constructor(private readonly callService: CallService) {}

  @Mutation(() => CallDto) // Use CallDto
  async initiateCall(
    @Args('calleeId', { type: () => ID }) calleeId: string,
    @Args('chatId', { type: () => ID }) chatId: string,
  ): Promise<CallDto> { // Return CallDto
    const callerId = 'user1'; // TODO: Replace with actual caller ID from context/auth
    const call = await this.callService.initiateCall(callerId, calleeId, chatId);
    // Assuming initiateCall returns a Prisma Call object compatible with PrismaCallPayload
    return mapCallToDto(call as PrismaCallPayload) as CallDto; // Map result
  }

  @Mutation(() => CallDto, { nullable: true }) // Allow null if call not found
  async acceptCall(@Args('callId', { type: () => ID }) callId: string): Promise<CallDto | null> { // Return CallDto | null
    const call = await this.callService.acceptCall(callId);
    return mapCallToDto(call as PrismaCallPayload | null); // Map result
  }

  @Mutation(() => Boolean)
  async endCall(@Args('callId', { type: () => ID }) callId: string): Promise<boolean> {
    return this.callService.endCall(callId); // Service already returns boolean
  }
}
