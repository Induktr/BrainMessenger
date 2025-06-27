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
import { UseGuards, UseInterceptors, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common'; // Import Inject
import { CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/interfaces/user.interface';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';

// import { Inject } from '@nestjs/common'; // This import is now redundant

@Resolver(() => ChatDto)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => PubSub)) private readonly pubSub: PubSub, // Add forwardRef here
  ) {}

    private readonly logger = new Logger(ChatResolver.name);

  // =================================================================================================
  // HELPER METHODS
  // =================================================================================================

  /**
   * Maps a rich Prisma Chat object (with relations) to a ChatDto.
   * This is the single source of truth for Chat DTO transformation.
   */
  private _mapUserToDto(user: any): UserDto | null {
    if (!user) {
      return null;
    }

    const twentySecondsAgo = new Date(Date.now() - 20 * 1000);
    const status = user.lastActiveAt && new Date(user.lastActiveAt) > twentySecondsAgo ? 'Online' : 'Offline';

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username ?? null,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled ?? null,
      twoFactorMethod: user.twoFactorMethod ?? null,
      recoveryEmail: user.recoveryEmail ?? null,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      roles: user.roles ?? [],
      status: status,
    };
  }

  private _mapMessageToDto(message: any): MessageDto | null {
    if (!message) {
      return null;
    }
    return {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt,
      sender: this._mapUserToDto(message.sender),
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      deletedForUserIds: message.deletedForUserIds || [],
    };
  }

  private _mapChatToDto(chat: any, currentUser?: User): ChatDto {
    const lastMessage = chat.messages?.[0];

    let chatName = chat.name;
    if (chat.type === ChatType.PRIVATE && currentUser) {
      const otherParticipant = chat.participants.find(p => p.userId !== currentUser.id);
      chatName = otherParticipant?.user?.name || 'Private Chat';
    }

    return {
      id: chat.id,
      name: chatName,
      type: chat.type,
      participants: chat.participants.map((p: any) => p.user),
      messages: chat.messages || [],
      channel: chat.channel ? {
        ...chat.channel,
        chat: {
          id: chat.channel.chat.id,
          name: chat.channel.chat.name,
          type: chat.channel.chat.type,
        }
      } : undefined,
      lastMessageSnippet: lastMessage?.content || null,
      lastMessageTimestamp: lastMessage?.createdAt?.toISOString() || null,
      unreadCount: 0, // Placeholder for now
    };
  }

  @Query(() => ChatDto, { nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string): Promise<ChatDto | null> {
    const chat = await this.chatService.findOne(id);
    if (!chat) {
      return null;
    }

    // The service provides a rich object. We perform minimal, safe mapping to the DTO.
    // We trust that `userSelect` in the service has fetched all required fields.
    return {
      ...chat,
      // The service returns ChatParticipant[], but the DTO expects UserDto[]
      participants: chat.participants.map((p) => p.user),
      // The service returns the full channel object, which matches the ChannelDto structure
      channel: chat.channel || undefined,
      // Calculate snippet and timestamp from the full messages array
      lastMessageSnippet: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : null,
      lastMessageTimestamp: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].createdAt.toISOString() : null,
      // Placeholder for unread count; requires separate logic
      unreadCount: 0,
    };
  }

  @Query(() => [ChatDto])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getChats(@CurrentUser() user: User): Promise<ChatDto[]> {
    const chatParticipants = await this.chatService.findAllForUser(user.id);

    return Promise.all(chatParticipants.map(async (cp) => {
      const chat = cp.chat;
      const lastMessage = chat.messages[0];
      // Correctly calculate unread count. Assumes messageService has this method.
      const unreadCount = lastMessage && cp.lastReadMessage?.createdAt
        ? 1 // Placeholder, real logic would be a count query
        : (lastMessage ? 1 : 0);

      let chatName: string | null = chat.name;
      if (chat.type === ChatType.PRIVATE) {
        chatName = chat.participants.find(p => p.userId !== user.id)?.user.name || 'Private Chat';
      }

      return {
        id: chat.id,
        name: chatName,
        type: chat.type,
        lastMessageSnippet: lastMessage?.content || null,
        lastMessageTimestamp: lastMessage?.createdAt.toISOString() || null,
        unreadCount: unreadCount,
        messages: [], // Messages are not returned in the list view
        participants: chat.participants.map(p => p.user),
        channel: chat.channel ? {
          ...chat.channel,
          chat: {
            id: chat.channel.chat.id,
            name: chat.channel.chat.name,
            type: chat.channel.chat.type,
          }
        } : undefined,
      };
    }));
  }

  @Query(() => [ChatDto])
  async searchChannels(
    @Args('name', { type: () => String }) name: string,
  ): Promise<ChatDto[]> {
    const channels = await this.chatService.searchChannelsByName(name);
    return channels.map(chat => ({
      ...chat,
      participants: chat.participants.map(p => p.user),
      lastMessageSnippet: null,
      lastMessageTimestamp: null,
      unreadCount: 0,
      messages: [],
      channel: chat.channel ? {
          ...chat.channel,
          chat: {
            id: chat.channel.chat.id,
            name: chat.channel.chat.name,
            type: chat.channel.chat.type,
          }
        } : undefined,
    }));
  }

  @Mutation(() => ChatDto)
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    const participantIds = [...new Set([...createChatInput.participantIds, user.id])];
    const createdChat = await this.chatService.create(
      createChatInput.type as ChatType, // Correctly cast the type
      createChatInput.name,
      participantIds,
    );
    return this._mapChatToDto(createdChat, user);
  }

  @Mutation(() => ChatDto)
  async createChannel(
    @Args('createChannelInput') createChannelInput: CreateChannelInput,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    const newChat = await this.chatService.createChannel(
      user.id,
      createChannelInput.name,
      createChannelInput.description,
    );
    return this._mapChatToDto(newChat, user);
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

  @Mutation(() => ChannelDto) // Return the updated channel details
  async updateChannelPrivacy(
    @Args('channelId', { type: () => ID }) channelId: string,
    @Args('isPublic', { type: () => Boolean }) isPublic: boolean,
    @CurrentUser() user: User,
  ): Promise<ChannelDto> {
    if (!user) {
      throw new Error('Authentication required to update channel privacy.');
    }
    return this.chatService.updateChannelPrivacy(channelId, user.id, isPublic);
  }

  @Mutation(() => ChatDto)
  async findOrCreatePrivateChat(
    @Args('otherUserId', { type: () => ID }) otherUserId: string,
    @CurrentUser() user: User,
  ): Promise<ChatDto> {
    const chat = await this.chatService.findOrCreatePrivateChat(user.id, otherUserId);
    return this._mapChatToDto(chat, user);
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
        reactions: msg.reactions ? msg.reactions.map(reaction => ({
          id: reaction.id,
          messageId: reaction.messageId,
          userId: reaction.userId,
          emoji: reaction.emoji,
          createdAt: reaction.createdAt,
        })) : [],
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
    const newMessageFromDb = await this.chatService.sendMessage(chatId, content, user.id, files);
    if (!newMessageFromDb) {
      return null;
    }

    // Manually map the DB object to a clean DTO to ensure 100% schema compliance.
    this.logger.debug(`[ChatResolver] sendMessage - newMessageFromDb for mapping: ${JSON.stringify(newMessageFromDb)}`);
    const messageDto = this._mapMessageToDto(newMessageFromDb);

    if (messageDto) {
      // Fetch chat participants to include in the payload for authorization in the filter.
      const chat = await this.chatService.findChatById(chatId);
      const participantIds = chat?.participants.map(p => p.user.id) || [];

      this.logger.debug(`[ChatResolver] sendMessage - messageDto for publishing: ${JSON.stringify(messageDto)}`);
      this.logger.log(`[ChatResolver] Publishing message ${messageDto.id} to chat ${chatId} for participants: [${participantIds.join(', ')}]`);
      this.pubSub.publish('newMessage', {
        newMessage: messageDto, // The DTO of the new message
        chatId: messageDto.chatId, // For basic filtering
        participantIds: participantIds, // For authorization filtering
      });
    } else {
      this.logger.warn('[ChatResolver] sendMessage created a null/undefined message.');
    }

    // Return the clean DTO for the mutation response.
    return messageDto;
  }

  @Mutation(() => MessageDto)
  @UseGuards(JwtAuthGuard)
  async addMessageReaction(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('emoji') emoji: string,
    @CurrentUser() user: User,
  ): Promise<MessageDto> {
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required.');
    }
    // The service should handle the logic of adding a reaction
    await this.messageService.addReaction(messageId, user.id, emoji);
    
    // Fetch the fully updated message from the service
    const updatedMessage = await this.messageService.findOne(messageId);
     if (!updatedMessage) {
       throw new Error('Message not found after adding reaction.');
     }

    // Use our reliable mapper to create the DTO
    const messageDto = this._mapMessageToDto(updatedMessage);
    
    if (!messageDto) {
        throw new Error('Failed to map message to DTO after adding reaction.');
    }

     // Publish reaction added event via PubSub
     this.pubSub.publish('messageReactionAddedOrRemoved', {
       messageReactionAddedOrRemoved: messageDto,
       chatId: messageDto.chatId, // Include chatId for filtering
     });

    return messageDto; // Return the updated message DTO
  }

  @Mutation(() => MessageDto) // Return the updated message with reactions
  @UseGuards(JwtAuthGuard)
  async removeMessageReaction(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('emoji') emoji: string,
    @CurrentUser() user: User,
  ): Promise<MessageDto> { // Change return type to MessageDto
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required.');
    }
    // Remove the reaction using the message service
    await this.messageService.removeReaction(messageId, user.id, emoji);

    // Fetch the updated message with reactions to return and publish
    const updatedMessage = await this.messageService.findOne(messageId);
     if (!updatedMessage) {
       // If message not found after removal, this indicates an issue or the message was deleted
       // Depending on desired behavior, you might throw an error or return null/specific status
       // For now, let's throw an error as the schema expects MessageDto!
       throw new Error('Message not found after removing reaction.');
     }

    // Use our reliable mapper to create the DTO
    const messageDto = this._mapMessageToDto(updatedMessage);
  
    if (!messageDto) {
      throw new Error('Failed to map message to DTO after removing reaction.');
    }

     // Publish reaction removed event via PubSub
     this.pubSub.publish('messageReactionAddedOrRemoved', {
       messageReactionAddedOrRemoved: messageDto, // Ensure payload is wrapped correctly
       chatId: messageDto.chatId, // Include chatId for filtering
     });

    return messageDto; // Return the updated message DTO
  }


  @Subscription(() => MessageDto, {
    nullable: true,
    filter: (payload, variables, context) => {
      const logger = new Logger('newMessageFilter');
      // Rule 1: Basic payload and context validation
      if (!payload || !context.req?.user) {
        logger.warn('Filter failed: Missing payload or user in context.');
        return false;
      }

      // Rule 2: The message must be for the chat the user is subscribed to.
      if (payload.chatId !== variables.chatId) {
        logger.warn(`Filter failed: Payload chat ID (${payload.chatId}) does not match variable chat ID (${variables.chatId}).`);
        return false;
      }

      // Rule 3: The user must be a participant of the chat.
      const user = context.req.user;
      if (!payload.participantIds.includes(user.id)) {
        logger.warn(`Filter failed: User ${user.id} is not in participant list [${payload.participantIds.join(', ')}].`);
        return false;
      }

      logger.log(`Filter passed for user ${user.id} in chat ${variables.chatId}.`);
      return true;
    },
    resolve: (payload, args, context, info) => {
      const logger = new Logger('SubscriptionResolve');
      // Defensive check
      if (!payload?.newMessage) {
        return null;
      }

      // Log requested fields for ultimate debugging
      try {
        const requestedFields = info.fieldNodes[0].selectionSet.selections.map(sel => sel.name.value);
        logger.debug(`[ChatResolver] Subscription resolve - Requested fields: [${requestedFields.join(', ')}]`);
      } catch (e) {
        logger.warn(`[ChatResolver] Could not log requested fields: ${e.message}`);
      }

      // The payload that passes the filter is returned to the client.
      return payload.newMessage;
    },
  })
  newMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User, // Guard ensures user is valid at subscription time
  ): AsyncIterator<MessageDto> {
    return (this.pubSub as any).asyncIterator('newMessage');
  }

  @Subscription(() => MessageDto, {
    nullable: true,
    filter: (payload, variables) => {
      const logger = new Logger('messageReactionAddedOrRemovedFilter');
      logger.debug(`[messageReactionAddedOrRemovedFilter] Received payload: ${JSON.stringify(payload)}`);
      logger.debug(`[messageReactionAddedOrRemovedFilter] Received variables: ${JSON.stringify(variables)}`);

      // Defensively check for payload to prevent crashes on subscription init
      if (!payload) {
        logger.warn('Filter failed: Missing payload.');
        return false;
      }
      if (payload.chatId !== variables.chatId) {
        logger.warn(`Filter failed: Payload chat ID (${payload.chatId}) does not match variable chat ID (${variables.chatId}).`);
        return false;
      }
      logger.log(`Filter passed for chat ${variables.chatId}.`);
      return true;
    },
    resolve: (payload) => {
      if (!payload || !payload.messageReactionAddedOrRemoved) {
        // This can happen on initialization. Instead of throwing, we return null.
        console.error('[ChatResolver] Resolve called with invalid payload for messageReactionAddedOrRemoved:', payload);
        return null;
      }
      return payload.messageReactionAddedOrRemoved;
    },
  })
  @UseGuards(JwtAuthGuard) // Apply the guard to protect the subscription
  messageReactionAddedOrRemoved(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User, // Inject the authenticated user
  ): AsyncIterator<MessageDto> {
    return (this.pubSub as any).asyncIterator('messageReactionAddedOrRemoved');
  }
}