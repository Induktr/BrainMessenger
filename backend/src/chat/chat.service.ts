import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Import Prisma namespace
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MessageService } from '../message/message.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}

  async findOne(id: string) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: { user: true, messages: true }, // Include related user and messages
    });
  }

  async findAll() {
    return this.prisma.chat.findMany({
      include: { user: true, messages: true }, // Include related user and messages
    });
  }

  async create(data: Prisma.ChatCreateInput) {
    return this.prisma.chat.create({
      data,
      include: { user: true, messages: true }, // Include related user and messages
    });
  }

  async update(id: string, data: Prisma.ChatUpdateInput) {
    try {
      return await this.prisma.chat.update({
        where: { id },
        data,
        include: { user: true, messages: true }, // Include related user and messages
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record to update not found
      }
      throw error; // Re-throw other errors
    }
  }

  // MessageService needs to be updated to include 'sender' for this to work correctly with MessageDto
  async getMessages(chatId: string, limit?: number, offset?: number) {
    return this.messageService.getMessagesByChatId(chatId, limit, offset);
  }

  // MessageService needs to be updated to include 'sender' for this to work correctly with MessageDto
  async sendMessage(chatId: string, content: string, senderId: string) {
    const messageData: Prisma.MessageCreateInput = {
      content,
      chat: { connect: { id: chatId } },
      sender: { connect: { id: senderId } },
    };
    return this.messageService.create(messageData);
  }

  async remove(id: string): Promise<void> {
    try {
      // Consider cascading deletes or handling related messages if necessary
      // Prisma might require deleting related messages first if not handled by DB constraints
      await this.prisma.message.deleteMany({ where: { chatId: id } }); // Example: Delete messages first
      await this.prisma.chat.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Chat with ID ${id} not found for deletion.`);
        return;
      }
      throw error; // Re-throw other errors
    }
  }
}
