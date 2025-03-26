import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from '../chat.entity';
import { Message } from '../message.entity';
import { MessageService } from '../message/message.service';

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService, private readonly messageService: MessageService) {}

  @Query(() => Chat, { nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string): Promise<Chat | null> {
    return this.chatService.findOne(id);
  }

  @Query(() => [Chat])
  async getChats(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Mutation(() => Chat)
  async createChat(@Args('userId', { type: () => ID }) userId: string): Promise<Chat> {
    return this.chatService.create({ userId });
  }

  @Mutation(() => Boolean)
  async deleteChat(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.chatService.remove(id);
    return true;
  }

  @Query(() => [Message])
  async getMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
  ): Promise<Message[]> {
    return this.chatService.getMessages(chatId, limit, offset);
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args('senderId', { type: () => ID }) senderId: string,
  ): Promise<Message> {
    return this.chatService.sendMessage(chatId, content, senderId);
  }
}
