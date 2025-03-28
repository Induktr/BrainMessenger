import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Import Prisma namespace
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PubSub } from 'graphql-subscriptions';
// Removed: import { Call } from './call.entity';
// Removed: import { InjectRepository } from '@nestjs/typeorm';
// Removed: import { Repository } from 'typeorm';
// Removed: import { v4 as uuidv4 } from 'uuid'; // Prisma handles ID generation

const pubSub = new PubSub();

@Injectable()
export class CallService {
  constructor(
    private prisma: PrismaService, // Inject PrismaService
  ) {}

  // Return type will be Prisma.Call once model is defined
  async initiateCall(callerId: string, calleeId: string, chatId: string) {
    // Prisma handles ID generation
    const call = await this.prisma.call.create({
      data: {
        callerId, // Assuming relation fields will be added later
        calleeId, // Assuming relation fields will be added later
        chatId,   // Assuming relation fields will be added later
        status: 'ringing',
      },
    });
    // TODO: Define Call model in schema.prisma and uncomment pubSub if needed
    // pubSub.publish('callEvents', { callEvents: call });
    return call;
  }

  // Return type will be Prisma.Call once model is defined
  async acceptCall(callId: string) {
    try {
      const call = await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'in_progress' },
      });
      // TODO: Define Call model in schema.prisma and uncomment pubSub if needed
      // pubSub.publish('callEvents', { callEvents: call });
      return call;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Call with ID ${callId} not found`);
      }
      throw error;
    }
  }

  async endCall(callId: string): Promise<boolean> {
    try {
      const call = await this.prisma.call.update({
        where: { id: callId },
        data: { status: 'ended' },
      });
      // TODO: Define Call model in schema.prisma and uncomment pubSub if needed
      // pubSub.publish('callEvents', { callEvents: call });
      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Call with ID ${callId} not found for ending.`);
        return false; // Indicate call was not found
      }
      throw error;
    }
  }
}
