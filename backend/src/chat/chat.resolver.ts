import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql'; // Added Subscription
import { ChatService } from './chat.service';
import { Prisma } from '@prisma/client';
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from '../message/dto/message.dto';
import { UserDto } from '../user/dto/user.dto';
import { MessageService } from '../message/message.service';
import { PubSub, withFilter } from 'graphql-subscriptions'; // Import PubSub and withFilter
import { CreateChatInput } from './dto/create-chat.input'; // Assuming a new input type for createChat
import { UseGuards, UseInterceptors } from '@nestjs/common'; // Import UseGuards, UseInterceptors
import { CacheTTL } from '@nestjs/cache-manager'; // Import CacheTTL
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import your JWT auth guard
import { RolesGuard } from '../auth/roles.guard'; // Import RolesGuard
import { Roles } from '../auth/roles.decorator'; // Import Roles decorator
import { CurrentUser } from '../auth/current-user.decorator'; // Import your CurrentUser decorator
import { User } from '../auth/interfaces/user.interface'; // Import custom User interface
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts'; // Import GraphQLUpload and FileUpload
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor'; // Import UserCacheInterceptor

import { Inject } from '@nestjs/common'; // Import Inject

// Remove helper mapping functions as service now returns data closer to DTO

@Resolver(() => ChatDto)
@UseGuards(JwtAuthGuard) // Re-enabled to ensure user context is available
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @Inject(PubSub) private readonly pubSub: PubSub, // Inject PubSub
  ) {}

  @Query(() => ChatDto, { nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string): Promise<ChatDto | null> {
    const chat = await this.chatService.findOne(id);
    if (!chat) return null;

    // Manually map the Prisma Chat object to ChatDto
    // This is a simplified mapping; a more robust solution might be needed
    // depending on the exact data required by the frontend for a single chat view.
    // For now, we'll include participants and messages.
    return {
      id: chat.id,
      name: chat.name,
      type: chat.type,
      lastMessageSnippet: chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : null,
      lastMessageTimestamp: chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].createdAt.toISOString() : null,
      unreadCount: 0, // Unread count is not applicable for a single chat view in this context
      messages: chat.messages ? chat.messages.map(msg => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt, // Keep as Date for MessageDto
        sender: { // Map sender to UserDto
          id: msg.sender.id,
          email: msg.sender.email,
          name: msg.sender.name,
          username: msg.sender.username, // Include username field
          isVerified: msg.sender.isVerified,
          avatarUrl: msg.sender.avatarUrl, // Include avatarUrl
          bio: msg.sender.bio, // Include bio field
          status: msg.sender.lastActiveAt ? (new Date(msg.sender.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline', // Include status field
          roles: msg.sender.roles || [], // Include roles, default to empty array if null/undefined
        } as UserDto,
        attachments: msg.attachments ? msg.attachments.map(att => ({
          id: att.id,
          url: att.url,
          filename: att.filename,
          mimetype: att.mimetype,
          size: att.size,
          createdAt: att.createdAt,
        })) : [],
        deletedForUserIds: (msg as any).deletedForUserIds || [], // Explicitly cast to any to access deletedForUserIds
      })) : [],
      // Add participants mapping if needed in ChatDto
      participants: chat.participants ? chat.participants.map(p => ({
        id: p.user.id,
        email: p.user.email,
        name: p.user.name,
        username: p.user.username,
        isVerified: p.user.isVerified,
        avatarUrl: p.user.avatarUrl,
        bio: p.user.bio,
        status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline', // Include status field
        roles: p.user.roles || [], // Include roles, default to empty array if null/undefined
      })) as UserDto[] : [],
    };
  }

  @Query(() => [ChatDto])
  @UseGuards(JwtAuthGuard) // Ensure user is authenticated
  @UseInterceptors(UserCacheInterceptor) // Apply UserCacheInterceptor
  @CacheTTL(60) // Cache for 60 seconds
  async getChats(@CurrentUser() user: User): Promise<ChatDto[]> {
    console.log('[ChatResolver] getChats called by user:', user ? user.id : 'undefined user');
    // Service now returns data in a shape closer to ChatDto
    const chats = await this.chatService.findAllForUser(user.id);
    console.log('[ChatResolver] getChats returning', chats.length, 'chats.');
    return chats;
  }

  @Mutation(() => ChatDto)
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: User, // Get the authenticated user
  ): Promise<ChatDto> {
    // Ensure the creating user is included in participants
    const participantIds = [...new Set([...createChatInput.participantIds, user.id])];

    const newChat = await this.chatService.create(
      createChatInput.type,
      createChatInput.name,
      participantIds,
    );
    // Service now returns data in ChatDto shape
    return newChat;
  }

  @Mutation(() => ChatDto)
  async findOrCreatePrivateChat(
    @Args('otherUserId', { type: () => ID }) otherUserId: string,
    @CurrentUser() user: User, // Get the authenticated user
  ): Promise<ChatDto> {
    // Margulan Seysembay's System First: Prevent duplicate private chats systematically.
    // Coin22's Risk Awareness: Mitigate race conditions with a transaction.
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
    // Implement logic to ensure only the sender can delete the message
    const message = await this.messageService.findOne(messageId);
    if (!message || message.senderId !== user.id) {
      throw new Error('Unauthorized to delete this message.');
    }
    await this.messageService.deleteMessage(messageId);
    // Optionally, publish a message deleted event for subscriptions
    return true;
  }
 
  @Mutation(() => Boolean)
  async deleteMessages(
    @Args('messageIds', { type: () => [ID] }) messageIds: string[],
    @CurrentUser() user: User,
  ): Promise<boolean> {
    // Implement logic to ensure only the sender can delete their messages
    // For now, we'll allow deletion if the user is the sender of *all* messages.
    // A more robust solution might allow partial deletion or require admin roles.
    const messagesToDelete = await this.messageService.findMany(messageIds);
 
    for (const message of messagesToDelete) {
      if (message.senderId !== user.id) {
        throw new Error('Unauthorized to delete one or more messages.');
      }
    }
 
    await this.messageService.deleteManyMessages(messageIds);
    // Optionally, publish a message deleted event for subscriptions
    return true;
  }
 
  @Mutation(() => MessageDto)
  async updateMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('content') content: string,
    @CurrentUser() user: User,
  ): Promise<MessageDto> {
    // Implement logic to ensure only the sender can update the message
    const message = await this.messageService.findOne(messageId);
    if (!message || message.senderId !== user.id) {
      throw new Error('Unauthorized to update this message.');
    }
    const updatedMessage = await this.messageService.updateMessage(messageId, content);
    if (!updatedMessage) {
      throw new Error('Message not found or could not be updated.');
    }
    // Map Prisma Message to MessageDto - ensure all fields are mapped
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
      deletedForUserIds: (updatedMessage as any).deletedForUserIds || [], // Explicitly cast to any
    };
    // Optionally, publish a message updated event for subscriptions
    return messageDto;
  }

  @Query(() => [MessageDto], { nullable: 'itemsAndList' }) // Allow null list and items
  async getMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User, // Get the authenticated user
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
  ): Promise<(MessageDto | null)[] | null> { // Update return type
    // Assuming getMessagesByChatId in MessageService is updated to include sender
    const messages = await this.messageService.getMessagesByChatId(chatId, limit, offset);
     // Map Prisma Message to MessageDto - ensure all fields are mapped
    return messages
      .filter(msg => !(msg as any).deletedForUserIds.includes(user.id)) // Explicitly cast to any
      .map(msg => ({
        id: msg.id,
        chatId: msg.chatId, // Include chatId
        content: msg.content,
        senderId: msg.senderId, // Include senderId
        createdAt: msg.createdAt, // Keep as Date for MessageDto
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          username: msg.sender.username, // Include username field
          email: msg.sender.email,
          isVerified: msg.sender.isVerified,
          avatarUrl: msg.sender.avatarUrl, // Include avatarUrl
          bio: msg.sender.bio, // Include bio field
          status: msg.sender.lastActiveAt ? (new Date(msg.sender.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline', // Include status field
          roles: msg.sender.roles || [], // Include roles, default to empty array if null/undefined
        } as UserDto,
        attachments: msg.attachments ? msg.attachments.map(att => ({
          id: att.id,
          url: att.url,
          filename: att.filename,
          mimetype: att.mimetype,
          size: att.size,
          createdAt: att.createdAt,
        })) : [],
        deletedForUserIds: (msg as any).deletedForUserIds || [], // Explicitly cast to any
      }));
  }

  @Mutation(() => MessageDto, { nullable: true }) // Allow null return if sender is somehow null
  @Roles('user') // Add a dummy role for testing RolesGuard
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files: FileUpload[] | undefined, // Add files argument
    @CurrentUser() user: User, // Get the authenticated user as sender
  ): Promise<MessageDto | null> { // Update return type
    console.log('[ChatResolver] sendMessage called by user:', user ? user.id : 'undefined user', user ? user.email : 'undefined email');
    const newMessage = await this.chatService.sendMessage(chatId, content, user.id, files); // Pass files to service
    console.log('[ChatResolver] Message created in DB:', newMessage.id);

     // Map Prisma Message to MessageDto - ensure all fields are mapped
     const messageDto: MessageDto = {
       id: newMessage.id,
       chatId: newMessage.chatId, // Include chatId
       content: newMessage.content,
       senderId: newMessage.senderId, // Include senderId
       createdAt: newMessage.createdAt, // Keep as Date for MessageDto
       sender: {
         id: user.id, // Use authenticated user's ID
         name: user.name, // Use authenticated user's name
         username: user.username || null, // Ensure username is null if undefined
         email: user.email,
         isVerified: user.isVerified,
         avatarUrl: user.avatarUrl || null, // Ensure avatarUrl is null if undefined
         bio: user.bio || null, // Ensure bio is null if undefined
         status: user.lastActiveAt && !isNaN(new Date(user.lastActiveAt).getTime()) ? (new Date(user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline', // Ensure lastActiveAt is a valid date
         roles: user.roles || [], // Include roles, default to empty array if null/undefined
       } as UserDto,
       attachments: newMessage.attachments?.map(att => ({ // Map attachments
         id: att.id,
         url: att.url,
         filename: att.filename,
         mimetype: att.mimetype,
         size: att.size,
         createdAt: att.createdAt,
       })) || [], // Ensure attachments is an empty array if undefined
       deletedForUserIds: (newMessage as any).deletedForUserIds || [], // Explicitly cast to any
     };

    console.log('[ChatResolver] Message DTO mapped:', messageDto.id);

    // Publish the new message to the subscription topic for the specific chat
    if (newMessage) {
      this.pubSub.publish('newMessage', { newMessage: messageDto });
    }

    return messageDto;
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards to the subscription
  @Roles('user') // Ensure only users with 'user' role can subscribe
  @Subscription(() => MessageDto, {
    filter: (payload, variables, context) => {
      const user: User = context.req.user;
      if (!user) {
        console.warn('[ChatResolver] Subscription denied: No authenticated user for newMessage.');
        return false;
      }
      // No longer filtering by chatId at the subscription level, frontend will handle
      return true;
      // The frontend will handle filtering messages based on the active chat.
      // For real-time chat, typically all messages in the chat are sent to all subscribers of that chat.
      // The frontend can then filter if it needs to.
    },
    resolve: (payload) => payload.newMessage,
  })
  newMessage(
    @CurrentUser() user: User, // Inject current user for logging/context if needed
  ): AsyncIterator<MessageDto> { // Return AsyncIterator
    // This method is required by @Subscription but the actual logic is in the filter and resolve options
    return (this.pubSub as any).asyncIterator('newMessage');
  }
}
