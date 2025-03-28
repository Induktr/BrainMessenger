import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Import Prisma types

@Injectable()
export class CallHistoryService {
  constructor(private prisma: PrismaService) {} // Inject PrismaService

  // Define return type using Prisma utility type
  async getCallHistory(userId: string): Promise<Prisma.CallGetPayload<{
    include: { caller: true, callee: true, chat: true }
  }>[]> {
    console.log(`Retrieving call history for user ${userId}`);
    return this.prisma.call.findMany({
      where: {
        OR: [ // User was either the caller or the callee
          { callerId: userId },
          { calleeId: userId },
        ],
      },
      include: { // Include related data needed for display
        caller: true, // Includes User object for caller
        callee: true, // Includes User object for callee
        chat: true,   // Includes Chat object
      },
      orderBy: {
        createdAt: 'desc', // Order by most recent first
      },
      // Add take/skip for pagination if needed later
      // take: limit,
      // skip: offset,
    });
  }
}
