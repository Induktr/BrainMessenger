import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../chat.entity';
import { Message } from '../message.entity';
import { MessageService } from '../message/message.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    private messageService: MessageService,
  ) {}

  async findOne(id: string): Promise<Chat | null> {
    return this.chatRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Chat[]> {
    return this.chatRepository.find();
  }

  async create(chat: Partial<Chat>): Promise<Chat> {
    const newChat = this.chatRepository.create(chat);
    return this.chatRepository.save(newChat);
  }

  async update(id: string, chat: Partial<Chat>): Promise<Chat | null> {
    await this.chatRepository.update(id, chat);
    return this.chatRepository.findOne({ where: { id } });
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    return this.messageService.getMessagesByChatId(chatId, limit, offset);
  }

  async sendMessage(chatId: string, content: string, senderId: string): Promise<Message> {
    return this.messageService.create({ chatId, content, senderId });
  }

  async remove(id: string): Promise<void> {
    await this.chatRepository.delete(id);
  }
}
