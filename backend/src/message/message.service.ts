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
      include: { sender: true }, // Include sender
    });
  }

  async findAll() {
    return this.prisma.message.findMany({
      include: { sender: true }, // Include sender
    });
  }

  async create(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({
      data,
      include: { sender: true }, // Include sender
    });
  }

  async update(id: string, data: Prisma.MessageUpdateInput) {
    try {
      return await this.prisma.message.update({
        where: { id },
        data,
        include: { sender: true }, // Include sender
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record to update not found
      }
      throw error; // Re-throw other errors
    }
  }

  async remove(id: string): Promise<void> {
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

  async getMessagesByChatId(chatId: string, limit?: number, offset?: number) {
    return this.prisma.message.findMany({
      where: { chatId },
      take: limit,
      skip: offset,
      include: { sender: true }, // Include sender
      orderBy: {
        createdAt: 'desc',
      }
    });
  }
}
