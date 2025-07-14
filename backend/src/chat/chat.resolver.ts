import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Prisma, ChatType } from '@prisma/client'; // Import Prisma and ChatType enum
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from '../message/dto/message.dto';
import { UserDto } from '../user/dto/user.dto';
import { ChannelDto } from './dto/channel.dto'; // Import ChannelDto
import { MessageService } from '../message/message.service';
import { PubSubEngine } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub/pubsub.provider';
import { PubSubModule } from '../pubsub/pubsub.module';
import { CreateChatInput } from './dto/create-chat.input';
import { CreateChannelInput } from './dto/create-channel.input'; // Import CreateChannelInput
import { UseGuards, UseInterceptors, UnauthorizedException, Logger, Inject } from '@nestjs/common'; // Import Inject
import { CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/interfaces/user.interface';
import { UserRole } from '@prisma/client';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { UserCacheInterceptor } from '../common/interceptors/user-cache.interceptor';
import { ObjectType, Field } from '@nestjs/graphql';
import { GlobalSearchResultDto } from './dto/global-search-result.dto';

@ObjectType()
class TypingUser {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
class TypingStatus {
  @Field(() => TypingUser)
  user: TypingUser;

  @Field()
  isTyping: boolean;
}

// import { Inject } from '@nestjs/common'; // This import is now redundant

@Resolver(() => ChatDto)
@UseGuards(JwtAuthGuard)
export class ChatResolver {
    constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @Inject(PUB_SUB) private readonly pubSub: PubSubEngine,
  ) {}

    private readonly logger = new Logger(ChatResolver.name);

  // =================================================================================================
  // SUBSCRIPTIONS
  // =================================================================================================

  @Subscription(() => TypingStatus, {
    filter: (payload, variables, context) => {
      const logger = new Logger('typingStatusFilter');
      logger.debug(`[ChatResolver] typingStatus filter - Received raw payload: ${payload === undefined || payload === null ? 'null/undefined' : JSON.stringify(payload)}, Variables: ${JSON.stringify(variables)}`);
      
      // Ensure payload and typingStatus exist before accessing properties
      if (!payload || !payload.typingStatus) {
        logger.warn('Filter failed: Payload or typingStatus is missing.');
        return false;
      }

      const user = context.req?.user || context.user;
      logger.debug(`[ChatResolver] typingStatus filter - User from context: ${user ? JSON.stringify(user.id) : 'null/undefined'}`);

      if (!user) {
        logger.warn('Filter failed: No user in context.');
        return false;
      }
      
      // Ensure payload.typingStatus.user exists before accessing its id
      if (!payload.typingStatus.user) {
        logger.warn('Filter failed: payload.typingStatus.user is missing.');
        return false;
      }

      if (payload.typingStatus.user.id === user.id) {
        // We don't send the typing notification to the user who is typing.
        return false;
      }
      const shouldSend = payload.typingStatus.chatId === variables.chatId;
      logger.debug(`Should send notification: ${shouldSend}`);
      return shouldSend;
    },
    resolve: (payload) => {
      const logger = new Logger('typingStatusResolve'); // Add logger here
      logger.debug(`[ChatResolver] typingStatus resolve - Received raw payload: ${payload === undefined || payload === null ? 'null/undefined' : JSON.stringify(payload)}`);
      if (!payload || !payload.typingStatus) {
        // Return a default TypingStatus object to prevent TypeError, as the schema expects a non-nullable type.
        return { user: { id: '', name: '' }, isTyping: false };
      }
      return { user: payload.typingStatus.user, isTyping: payload.typingStatus.isTyping };
    },
  })
  typingStatus(@Args('chatId', { type: () => ID }) chatId: string, @CurrentUser() user: User) {
    if (!user) {
      throw new UnauthorizedException('You must be logged in to subscribe to typing status.');
    }
    return (this.pubSub as any).asyncIterator('typingStatus');
  }

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
    const isOnline = user.lastActiveAt && new Date(user.lastActiveAt) > twentySecondsAgo;

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
      role: user.role,
      status: isOnline ? 'Online' : 'Offline',
      isOnline: isOnline,
      lastSeen: user.lastActiveAt?.toISOString() ?? null,
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
      avatarUrl: chat.avatarUrl ?? undefined,
      type: chat.type,
      participants: chat.participants.map((p: any) => this._mapUserToDto(p.user ?? p)).filter(Boolean) as UserDto[],
      messages: (chat.messages || []).map(m => this._mapMessageToDto(m)),
      channel: chat.channel ? {
        ...chat.channel,
        name: chat.name ?? '',
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

  @Query(() => ChatDto, { name: 'chat', nullable: true })
  async getChat(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: User): Promise<ChatDto | null> {
    const chat = await this.chatService.findOne(id);
    if (!chat) {
      return null;
    }
    return this._mapChatToDto(chat, user);
  }

  @Query(() => [ChatDto])
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getChats(@CurrentUser() user: User): Promise<ChatDto[]> {
    const chatParticipants = await this.chatService.findAllForUser(user.id);

    return Promise.all(chatParticipants.map(async (cp) => {
      const chat = cp.chat;
      const lastMessage = chat.messages?.[0];
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
        avatarUrl: chat.avatarUrl ?? undefined,
        type: chat.type,
        lastMessageSnippet: lastMessage?.content || null,
        lastMessageTimestamp: lastMessage?.createdAt.toISOString() || null,
        unreadCount: unreadCount,
        messages: [], // Messages are not returned in the list view
        participants: chat.participants.map(p => this._mapUserToDto(p.user)).filter(Boolean) as UserDto[],
        channel: chat.channel ? {
          ...chat.channel,
          name: chat.name ?? '',
          owner: this._mapUserToDto(chat.channel.owner) as UserDto, // Ensure owner is mapped to UserDto
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
      id: chat.id,
      name: chat.name,
      avatarUrl: chat.avatarUrl ?? undefined,
      type: chat.type,
      participants: chat.participants.map(p => this._mapUserToDto(p.user)).filter(Boolean) as UserDto[],
      lastMessageSnippet: null,
      lastMessageTimestamp: null,
      unreadCount: 0,
      messages: [],
      channel: chat.channel ? {
          ...chat.channel,
          name: chat.name ?? '',
          owner: this._mapUserToDto(chat.channel.owner) as UserDto, // Ensure owner is mapped to UserDto
          chat: {
            id: chat.channel.chat.id,
            name: chat.channel.chat.name,
            type: chat.channel.chat.type,
          }
        } : undefined,
    }));
  }

  @Query(() => GlobalSearchResultDto)
  async globalSearch(
    @Args('query', { type: () => String }) query: string,
    @CurrentUser() user: User,
  ): Promise<GlobalSearchResultDto> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    const results = await this.chatService.globalSearch(query, user.id);
    return {
      users: results.users,
      chats: results.chats.map(chat => this._mapChatToDto(chat, user)),
    };
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
    const updatedChannel = await this.chatService.updateChannelPrivacy(channelId, user.id, isPublic);
    // Manually map the owner to UserDto
    const ownerDto = this._mapUserToDto(updatedChannel.owner);
    if (!ownerDto) {
      throw new Error('Failed to map channel owner to DTO.');
    }
    return {
      ...updatedChannel,
      name: updatedChannel.chat.name ?? '',
      owner: ownerDto,
      chat: {
        id: updatedChannel.chat.id,
        name: updatedChannel.chat.name,
        type: updatedChannel.chat.type,
      }
    };
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
    await this.messageService.softDeleteMessage(messageId);
    return true;
  }

  @Mutation(() => Boolean)
  async setUserTyping(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('isTyping', { type: () => Boolean }) isTyping: boolean,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const logger = new Logger('setUserTyping');
    const payload = {
      typingStatus: {
        chatId,
        user: { id: user.id, name: user.name },
        isTyping,
      },
    };
    logger.debug(`Publishing typing status: ${JSON.stringify(payload)}`);
    await this.pubSub.publish('typingStatus', payload);
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
    const messageDto = this._mapMessageToDto(updatedMessage);
    if (!messageDto) {
      throw new Error('Failed to map updated message to DTO.');
    }
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
      .map(msg => this._mapMessageToDto(msg));
  }

  @Mutation(() => MessageDto, { nullable: true })
  @Roles(UserRole.USER)
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files: FileUpload[] | undefined,
    @CurrentUser() user: User,
  ): Promise<MessageDto | null> {
    try {
      const newMessageFromDb = await this.chatService.sendMessage(chatId, content, user.id, files);
      if (!newMessageFromDb) {
        this.logger.warn('[ChatResolver] sendMessage - chatService.sendMessage returned null/undefined.');
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
        this.logger.warn('[ChatResolver] sendMessage - _mapMessageToDto returned null/undefined.');
      }

      // Return the clean DTO for the mutation response.
      return messageDto;
    } catch (error) {
      this.logger.error(`[ChatResolver] Error in sendMessage mutation: ${error.message}`, error.stack);
      // Depending on your error handling strategy, you might re-throw a user-friendly error
      // or return null. For now, returning null to match the existing nullable return type.
      return null;
    }
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
    if (!user) {
      throw new UnauthorizedException('You must be logged in to subscribe to new messages.');
    }
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
  messageReactionAddedOrRemoved(
    @Args('chatId', { type: () => ID }) chatId: string,
    @CurrentUser() user: User, // Inject the authenticated user
  ): AsyncIterator<MessageDto> {
    return (this.pubSub as any).asyncIterator('messageReactionAddedOrRemoved');
  }
}