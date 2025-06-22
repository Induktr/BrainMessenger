import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Import Prisma namespace and specific error type
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// Message type will be inferred from PrismaClient return types

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
    });
  }
 
  async findMany(ids: string[]) {
    return this.prisma.message.findMany({
      where: { id: { in: ids } },
      include: { sender: true, attachments: true, reactions: true },
    });
  }
 
  async findAll() {
    return this.prisma.message.findMany({
      include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
    });
  }

  async create(data: Prisma.MessageCreateInput) {
    console.log('[MessageService] create called with data:', data);
    return this.prisma.message.create({
      data,
      include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
    });
  }

  async update(id: string, data: Prisma.MessageUpdateInput) {
    try {
      return await this.prisma.message.update({
        where: { id },
        data,
        include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record to update not found
      }
      throw error; // Re-throw other errors
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await this.prisma.message.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Message with ID ${id} not found for deletion.`);
        return;
      }
      throw error; // Re-throw other errors
    }
  }
 
  async deleteManyMessages(ids: string[]): Promise<void> {
    try {
      await this.prisma.message.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      // Handle errors, e.g., if some messages are not found
      console.error('Error deleting many messages:', error);
      throw error;
    }
  }
 
  async updateMessage(id: string, content: string) {
    try {
      return await this.prisma.message.update({
        where: { id },
        data: { content },
        include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Message to update not found
      }
      throw error; // Re-throw other errors
    }
  }

  async markMessagesAsDeletedForUser(chatId: string, userId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        chatId: chatId,
      },
      data: {
        deletedForUserIds: {
          push: userId,
        },
      },
    });
  }

  async getMessagesByChatId(chatId: string, limit?: number, offset?: number) {
    return this.prisma.message.findMany({
      where: { chatId },
      take: limit,
      skip: offset,
      include: { sender: true, attachments: true, reactions: true }, // Include sender, attachments, and reactions
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    // Check if the user has any existing reaction on this message
    const existingUserReaction = await this.prisma.messageReaction.findFirst({
      where: {
        messageId: messageId,
        userId: userId,
      },
    });

    // If an existing reaction is found and it's the same emoji, do nothing
    if (existingUserReaction && existingUserReaction.emoji === emoji) {
      return existingUserReaction;
    }

    // If an existing reaction is found and it's a different emoji, delete it
    if (existingUserReaction) {
      await this.prisma.messageReaction.delete({
        where: {
          id: existingUserReaction.id,
        },
      });
    }

    // Create the new reaction
    return this.prisma.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    try {
      await this.prisma.messageReaction.delete({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId,
            emoji,
          },
        },
      });
      return true; // Indicate successful deletion
    } catch (error) {
      // Handle case where reaction does not exist
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Reaction not found for message ${messageId}, user ${userId}, emoji ${emoji}.`);
        return false; // Indicate reaction not found
      }
      throw error; // Re-throw other errors
    }
  }
}
