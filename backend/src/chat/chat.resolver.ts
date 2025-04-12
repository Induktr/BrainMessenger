import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Prisma } from '@prisma/client';
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from '../message/dto/message.dto';
import { UserDto } from '../user/dto/user.dto';
import { MessageService } from '../message/message.service';

// Define more specific types for Prisma payloads with includes
type PrismaMessageWithSender = Prisma.MessageGetPayload<{ include: { sender: true } }>;
type PrismaChatWithIncludes = Prisma.ChatGetPayload<{ include: { user: true, messages: { include: { sender: true } } } }>;

// Helper function to map Prisma Message to MessageDto
const mapMessageToDto = (message: PrismaMessageWithSender | null): MessageDto | null => {
  if (!message) return null;
  return {
    ...message,
    // Ensure sender is mapped correctly, handling potential null
    sender: message.sender ? {
      id: message.sender.id,
      email: message.sender.email,
      name: message.sender.name,
      isVerified: message.sender.isVerified, // Добавлено поле isVerified
    } : null, // Return null if sender is null/not included
  };
};

// Helper function to map Prisma Chat to ChatDto
const mapChatToDto = (chat: PrismaChatWithIncludes | null): ChatDto | null => {
  if (!chat) return null;
  return {
    ...chat,
    // Ensure user is mapped correctly, handling potential null
    user: chat.user ? {
      id: chat.user.id,
      email: chat.user.email,
      name: chat.user.name,
      isVerified: chat.user.isVerified, // Добавлено поле isVerified
    } : null, // Return null if user is null/not included
    // Map messages array, handling potential null messages within the array
    messages: chat.messages ? chat.messages.map(mapMessageToDto) : null, // Allow null list or map to MessageDto | null
  };
};


@Resolver(() => ChatDto)
export class ChatResolver {
  constructor(private readonly chatService: ChatService, private readonly messageService: MessageService) {}

  @Query(() => ChatDto, { nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string): Promise<ChatDto | null> {
    const chat = await this.chatService.findOne(id);
    // Type assertion might be needed if TS still complains, but mapping handles null
    return mapChatToDto(chat as PrismaChatWithIncludes | null);
  }

  @Query(() => [ChatDto])
  async getChats(): Promise<ChatDto[]> {
    const chats = await this.chatService.findAll();
     // Filter out null results if mapChatToDto can return null for an item
    return chats.map(chat => mapChatToDto(chat as PrismaChatWithIncludes)).filter(dto => dto !== null) as ChatDto[];
  }

  @Mutation(() => ChatDto)
  async createChat(@Args('userId', { type: () => ID }) userId: string): Promise<ChatDto> {
    const chatData: Prisma.ChatCreateInput = {
      user: { connect: { id: userId } },
      name: 'New Chat', // Placeholder name
      type: 'PRIVATE', // Placeholder type
    };
    const newChat = await this.chatService.create(chatData);
    // create should not return null, so direct mapping is likely safe
    return mapChatToDto(newChat as PrismaChatWithIncludes) as ChatDto;
  }

  @Mutation(() => Boolean)
  async deleteChat(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.chatService.remove(id);
    return true;
  }

  @Query(() => [MessageDto], { nullable: 'itemsAndList' }) // Allow null list and items
  async getMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
  ): Promise<(MessageDto | null)[] | null> { // Update return type
    const messages = await this.chatService.getMessages(chatId, limit, offset);
    // Assuming getMessages returns array or throws, not null list
    return messages.map(msg => mapMessageToDto(msg as PrismaMessageWithSender));
  }

  @Mutation(() => MessageDto, { nullable: true }) // Allow null return if sender is somehow null
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args('senderId', { type: () => ID }) senderId: string,
  ): Promise<MessageDto | null> { // Update return type
    const newMessage = await this.chatService.sendMessage(chatId, content, senderId);
    return mapMessageToDto(newMessage as PrismaMessageWithSender);
  }
}
