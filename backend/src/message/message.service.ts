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
      include: { sender: true, attachments: true }, // Include sender and attachments
    });
  }
 
  async findMany(ids: string[]) {
    return this.prisma.message.findMany({
      where: { id: { in: ids } },
      include: { sender: true, attachments: true },
    });
  }
 
  async findAll() {
    return this.prisma.message.findMany({
      include: { sender: true, attachments: true }, // Include sender and attachments
    });
  }

  async create(data: Prisma.MessageCreateInput) {
    console.log('[MessageService] create called with data:', data);
    return this.prisma.message.create({
      data,
      include: { sender: true, attachments: true }, // Include sender and attachments
    });
  }

  async update(id: string, data: Prisma.MessageUpdateInput) {
    try {
      return await this.prisma.message.update({
        where: { id },
        data,
        include: { sender: true, attachments: true }, // Include sender and attachments
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
        include: { sender: true, attachments: true }, // Include sender and attachments
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
      include: { sender: true, attachments: true }, // Include sender and attachments
      orderBy: {
        createdAt: 'desc',
      }
    });
  }
}
