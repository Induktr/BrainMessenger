import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CallHistoryService } from './call-history.service';
import { CallDto } from '../call/dto/call.dto'; // Use CallDto for return type
import { Prisma } from '@prisma/client'; // Import Prisma types for mapping

// Define a type for the Prisma Call payload with includes from the service
type PrismaCallWithIncludes = Prisma.CallGetPayload<{
  include: { caller: true, callee: true, chat: true }
}>;

// Helper function to map Prisma Call to CallDto (similar to CallResolver)
// TODO: Consider moving mapping logic to a shared place or using a library
const mapCallToDto = (call: PrismaCallWithIncludes | null): CallDto | null => {
  if (!call) return null;
  return {
    id: call.id,
    callerId: call.callerId,
    calleeId: call.calleeId,
    chatId: call.chatId,
    status: call.status,
    // Map other fields if added to CallDto and included in service
    // createdAt: call.createdAt,
    // updatedAt: call.updatedAt,
  };
};

@Resolver(() => CallDto) // Resolve CallDto
export class CallHistoryResolver {
  constructor(private readonly callHistoryService: CallHistoryService) {}

  // TODO: Add authentication guard to ensure only the logged-in user can get their history
  @Query(() => [CallDto], { name: 'getCallHistory' }) // Define query name
  async getCallHistory(
    // TODO: Get userId from authenticated user context instead of argument
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<CallDto[]> {
    const history = await this.callHistoryService.getCallHistory(userId);
    // Map results and filter out potential nulls if mapping fails
    return history.map(call => mapCallToDto(call as PrismaCallWithIncludes)).filter(dto => dto !== null) as CallDto[];
  }
}