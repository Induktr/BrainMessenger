import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findOne(id: string): Promise<Message | null> {
    return this.messageRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = this.messageRepository.create(message);
    return this.messageRepository.save(newMessage);
  }

  async update(id: string, message: Partial<Message>): Promise<Message | null> {
    await this.messageRepository.update(id, message);
    return this.messageRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  }

  async getMessagesByChatId(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatId },
      take: limit,
      skip: offset,
    });
  }
}
