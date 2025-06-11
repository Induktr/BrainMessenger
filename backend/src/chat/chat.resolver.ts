import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Prisma, ChatType } from '@prisma/client'; // Import Prisma and ChatType enum
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from '../message/dto/message.dto';
import { UserDto } from '../user/dto/user.dto';
import { ChannelDto } from './dto/channel.dto'; // Import ChannelDto
import { MessageService } from '../message/message.service';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { CreateChatInput } from './dto/create-chat.input';
import { CreateChannelInput } from './dto/create-channel.input'; // Import CreateChannelInput
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/interfaces/user.interface';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';

import { Inject } from '@nestjs/common';

@Resolver(() => ChatDto)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @Inject(PubSub) private readonly pubSub: PubSub,
  ) {}

  @Query(() => ChatDto, { nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string): Promise<ChatDto | null> {
    const chat = await this.chatService.findOne(id);
    if (!chat) return null;

    const chatDto: ChatDto = {
      id: chat.id,
      name: chat.name,
      type: chat.type,
      lastMessageSnippet: chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : null,
      lastMessageTimestamp: chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].createdAt.toISOString() : null,
      unreadCount: 0,
      messages: chat.messages ? chat.messages.map(msg => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          email: msg.sender.email,
          name: msg.sender.name,
          username: msg.sender.username,
          isVerified: msg.sender.isVerified,
          avatarUrl: msg.sender.avatarUrl,
          bio: msg.sender.bio,
          status: msg.sender.lastActiveAt ? (new Date(msg.sender.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          roles: msg.sender.roles || [],
        } as UserDto,
        attachments: msg.attachments ? msg.attachments.map(att => ({
          id: att.id,
          url: att.url,
          filename: att.filename,
          mimetype: att.mimetype,
          size: att.size,
          createdAt: att.createdAt,
        })) : [],
        deletedForUserIds: (msg as any).deletedForUserIds || [],
      })) : [],
      participants: chat.participants ? chat.participants.map(p => ({
        id: p.user.id,
        email: p.user.email,
        name: p.user.name,
        username: p.user.username,
        isVerified: p.user.isVerified,
        avatarUrl: p.user.avatarUrl,
        bio: p.user.bio,
        status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
        roles: p.user.roles || [],
      })) as UserDto[] : [],
      channel: chat.channel ? {
        id: chat.channel.id,
        chatId: chat.channel.chatId,
        chat: {
          id: chat.channel.chat.id,
          name: chat.channel.chat.name,
          type: chat.channel.chat.type,
          lastMessageSnippet: null,
          lastMessageTimestamp: null,
          unreadCount: 0,
          messages: [],
          participants: [],
        },
        ownerId: chat.channel.ownerId,
        owner: {
          id: chat.channel.owner.id,
          email: chat.channel.owner.email,
          name: chat.channel.owner.name,
          username: chat.channel.owner.username,
          isVerified: chat.channel.owner.isVerified,
          avatarUrl: chat.channel.owner.avatarUrl,
          bio: chat.channel.owner.bio,
          status: chat.channel.owner.lastActiveAt ? (new Date(chat.channel.owner.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          roles: chat.channel.owner.roles || [],
        },
        description: chat.channel.description,
        subscribersCount: chat.channel.subscribersCount,
        isPublic: chat.channel.isPublic,
      } : undefined,
    };
    return chatDto;
  }

  @Query(() => [ChatDto])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getChats(@CurrentUser() user: User): Promise<ChatDto[]> {
    console.log('[ChatResolver] getChats called by user:', user ? user.id : 'undefined user');
    const chats = await this.chatService.findAllForUser(user.id);
    console.log('[ChatResolver] getChats returning', chats.length, 'chats.');
    return chats;
  }

  @Query(() => [ChatDto])
  async searchChannels(
    @Args('name', { type: () => String }) name: string,
  ): Promise<ChatDto[]> {
    const channels = await this.chatService.searchChannelsByName(name);
    return channels.map(channelChat => ({
      id: channelChat.id,
      name: channelChat.name,
      type: channelChat.type,
      lastMessageSnippet: null,
      lastMessageTimestamp: null,
      unreadCount: 0,
      messages: [],
      participants: channelChat.participants.map(p => ({
        id: p.user.id,
        email: p.user.email,
        name: p.user.name,
        username: p.user.username,
        isVerified: p.user.isVerified,
        avatarUrl: p.user.avatarUrl,
        bio: p.user.bio,
        status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
        roles: p.user.roles || [],
      })),
      channel: channelChat.channel ? {
        id: channelChat.channel.id,
        chatId: channelChat.channel.chatId,
        chat: {
          id: channelChat.channel.chat.id,
          name: channelChat.channel.chat.name,
          type: channelChat.channel.chat.type,
          lastMessageSnippet: null,
          lastMessageTimestamp: null,
          unreadCount: 0,
          messages: [],
          participants: [],
        },
        ownerId: channelChat.channel.ownerId,
        owner: {
          id: channelChat.channel.owner.id,
          email: channelChat.channel.owner.email,
          name: channelChat.channel.owner.name,
          username: channelChat.channel.owner.username,
          isVerified: channelChat.channel.owner.isVerified,
          avatarUrl: channelChat.channel.owner.avatarUrl,
          bio: channelChat.channel.owner.bio,
          status: channelChat.channel.owner.lastActiveAt ? (new Date(channelChat.channel.owner.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          roles: channelChat.channel.owner.roles || [],
        },
        description: channelChat.channel.description,
        subscribersCount: channelChat.channel.subscribersCount,
        isPublic: channelChat.channel.isPublic,
      } : undefined,
    }));
  }

  @Mutation(() => ChatDto)
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    const participantIds = [...new Set([...createChatInput.participantIds, user.id])];

    const newChat = await this.chatService.create(
      createChatInput.type as ChatType,
      createChatInput.name,
      participantIds,
    );
    return newChat;
  }

  @Mutation(() => ChatDto)
  async createChannel(
    @Args('createChannelInput') createChannelInput: CreateChannelInput,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    if (!user) {
      throw new Error('Authentication required to create a channel.');
    }
    return this.chatService.createChannel(
      user.id,
      createChannelInput.name,
      createChannelInput.description,
    );
  }

  @Mutation(() => Boolean)
  async subscribeToChannel(
    @Args('channelId', { type: () => ID }) channelId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('Authentication required to subscribe to a channel.');
    }
    await this.chatService.subscribeToChannel(channelId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async unsubscribeFromChannel(
    @Args('channelId', { type: () => ID }) channelId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('Authentication required to unsubscribe from a channel.');
    }
    await this.chatService.unsubscribeFromChannel(channelId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteChannel(
    @Args('channelId', { type: () => ID }) channelId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('Authentication required to delete a channel.');
    }
    return this.chatService.deleteChannel(channelId, user.id);
  }

  @Mutation(() => ChatDto)
  async findOrCreatePrivateChat(
    @Args('otherUserId', { type: () => ID }) otherUserId: string,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    return this.chatService.findOrCreatePrivateChat(user.id, otherUserId);
  }

  @Mutation(() => Boolean)
  async deleteChat(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.chatService.remove(id);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteChatHistoryForUser(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('Authentication required.');
    }
    await this.messageService.markMessagesAsDeletedForUser(chatId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteChatAndRemoveUser(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('Authentication required.');
    }
    await this.chatService.deleteChatAndRemoveUser(chatId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async deleteMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const message = await this.messageService.findOne(messageId);
    if (!message || message.senderId !== user.id) {
      throw new Error('Unauthorized to delete this message.');
    }
    await this.messageService.deleteMessage(messageId);
    return true;
  }
 
  @Mutation(() => Boolean)
  async deleteMessages(
    @Args('messageIds', { type: () => [ID] }) messageIds: string[],
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const messagesToDelete = await this.messageService.findMany(messageIds);
 
    for (const message of messagesToDelete) {
      if (message.senderId !== user.id) {
        throw new Error('Unauthorized to delete one or more messages.');
      }
    }
 
    await this.messageService.deleteManyMessages(messageIds);
    return true;
  }
 
  @Mutation(() => MessageDto)
  async updateMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('content') content: string,
    @CurrentUser() user: User,
  ): Promise<MessageDto> {
    const message = await this.messageService.findOne(messageId);
    if (!message || message.senderId !== user.id) {
      throw new Error('Unauthorized to update this message.');
    }
    const updatedMessage = await this.messageService.updateMessage(messageId, content);
    if (!updatedMessage) {
      throw new Error('Message not found or could not be updated.');
    }
    const messageDto: MessageDto = {
      id: updatedMessage.id,
      chatId: updatedMessage.chatId,
      content: updatedMessage.content,
      senderId: updatedMessage.senderId,
      createdAt: updatedMessage.createdAt,
      sender: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        status: user.lastActiveAt && !isNaN(new Date(user.lastActiveAt).getTime()) ? (new Date(user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
        roles: user.roles || [],
      } as UserDto,
      attachments: updatedMessage.attachments?.map(att => ({
        id: att.id,
        url: att.url,
        filename: att.filename,
        mimetype: att.mimetype,
        size: att.size,
        createdAt: att.createdAt,
      })),
      deletedForUserIds: (updatedMessage as any).deletedForUserIds || [],
    };
    return messageDto;
  }

  @Query(() => [MessageDto], { nullable: 'itemsAndList' })
  async getMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
  ): Promise<(MessageDto | null)[] | null> {
    const messages = await this.messageService.getMessagesByChatId(chatId, limit, offset);
    return messages
      .filter(msg => !(msg as any).deletedForUserIds.includes(user.id))
      .map(msg => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          username: msg.sender.username,
          email: msg.sender.email,
          isVerified: msg.sender.isVerified,
          avatarUrl: msg.sender.avatarUrl,
          bio: msg.sender.bio,
          status: msg.sender.lastActiveAt ? (new Date(msg.sender.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          roles: msg.sender.roles || [],
        } as UserDto,
        attachments: msg.attachments ? msg.attachments.map(att => ({
          id: att.id,
          url: att.url,
          filename: att.filename,
          mimetype: att.mimetype,
          size: att.size,
          createdAt: att.createdAt,
        })) : [],
        deletedForUserIds: (msg as any).deletedForUserIds || [],
      }));
  }

  @Mutation(() => MessageDto, { nullable: true })
  @Roles('user')
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files: FileUpload[] | undefined,
    @CurrentUser() user: User,
  ): Promise<MessageDto | null> {
    console.log('[ChatResolver] sendMessage called by user:', user ? user.id : 'undefined user', user ? user.email : 'undefined email');
    const newMessage = await this.chatService.sendMessage(chatId, content, user.id, files);
    console.log('[ChatResolver] Message created in DB:', newMessage.id);

    const messageDto: MessageDto = {
       id: newMessage.id,
       chatId: newMessage.chatId,
       content: newMessage.content,
       senderId: newMessage.senderId,
       createdAt: newMessage.createdAt,
       sender: {
         id: user.id,
         name: user.name,
         username: user.username || null,
         email: user.email,
         isVerified: user.isVerified,
         avatarUrl: user.avatarUrl || null,
         bio: user.bio || null,
         status: user.lastActiveAt && !isNaN(new Date(user.lastActiveAt).getTime()) ? (new Date(user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
         roles: user.roles || [],
       } as UserDto,
       attachments: newMessage.attachments?.map(att => ({
         id: att.id,
         url: att.url,
         filename: att.filename,
         mimetype: att.mimetype,
         size: att.size,
         createdAt: att.createdAt,
       })) || [],
       deletedForUserIds: (newMessage as any).deletedForUserIds || [],
     };

    console.log('[ChatResolver] Message DTO mapped:', messageDto.id);

    if (messageDto) {
      console.log('[ChatResolver] Publishing new message to PubSub:', messageDto.id);
      console.log('[ChatResolver] MessageDto being published (JSON):', JSON.stringify(messageDto, null, 2));
      this.pubSub.publish('newMessage', { newMessage: messageDto });
    } else {
      console.warn('[ChatResolver] Attempted to publish a null/undefined messageDto.');
    }

    return messageDto;
  }

  @Subscription(() => MessageDto, {
    resolve: (payload) => {
      console.log('[ChatResolver - Subscription resolve] Received payload:', payload);
      if (!payload || !payload.newMessage) {
        console.error('[ChatResolver - Subscription resolve] Payload or newMessage is undefined:', payload);
        throw new Error('Invalid subscription payload: newMessage is missing.');
      }
      return payload;
    },
  })
  newMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User,
  ): AsyncIterator<MessageDto> {
    return (this.pubSub as any).asyncIterator('newMessage');
  }
}
