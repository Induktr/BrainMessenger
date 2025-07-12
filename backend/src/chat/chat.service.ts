import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ChatType, ChatParticipantRole } from '@prisma/client'; // Explicitly import enums
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MessageService } from '../message/message.service';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service'; // Import CloudflareR2Service
import { FileUpload } from 'graphql-upload-ts'; // Import FileUpload
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames
import { Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';

const userSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  isVerified: true,
  twoFactorEnabled: true,
  twoFactorMethod: true,
  recoveryEmail: true,
  avatarUrl: true,
  bio: true,
  role: true,
  lastActiveAt: true,
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name); // Logger for debugging
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
    private cloudflareR2Service: CloudflareR2Service, // Inject CloudflareR2Service
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async findChatById(id: string) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: userSelect }, // Include user details for participants
          },
        },
        messages: {
          include: {
            sender: { select: userSelect }, // Include sender details for messages
            attachments: true, // Include attachments
          },
          orderBy: {
            createdAt: 'asc', // Order messages chronologically
          },
        },
        channel: { // Explicitly include nested relations for channel
          include: {
            chat: true,
            owner: { select: userSelect },
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    this.logger.log('[ChatService] findAllForUser called for userId:', userId);
    // Find all chat participants for the given user and return the rich objects
    return this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1, // Get the last message
              include: {
                sender: { select: userSelect },
                attachments: true,
              },
            },
            participants: {
              include: {
                user: { select: userSelect },
              },
            },
            channel: {
              include: {
                chat: true, // This will be the simple Chat model
                owner: { select: userSelect },
              },
            },
          },
        },
        lastReadMessage: true,
      },
    });
  }

  async create(type: ChatType, name?: string, participantIds: string[] = []) {
    const uniqueParticipantIds = [...new Set(participantIds)];

    return this.prisma.chat.create({
      data: {
        name: name,
        type: type,
        participants: {
          create: uniqueParticipantIds.map(userId => ({
            userId: userId,
            role: ChatParticipantRole.MEMBER,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: userSelect },
          },
        },
        messages: false, // A new chat has no messages
        channel: true, // Include channel in case this is a channel chat
      },
    });
  }

  async findOrCreatePrivateChat(user1Id: string, user2Id: string) {
    // Margulan Seysembay's System First: Ensure unique private chats.
    // Coin22's Risk Awareness: Use a transaction to prevent race conditions and ensure atomicity.
    return this.prisma.$transaction(async (prisma) => {
      // 1. Try to find an existing private chat between the two users
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: ChatType.PRIVATE,
          participants: {
            every: {
              userId: {
                in: [user1Id, user2Id],
              },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: { select: userSelect },
            },
          },
          messages: {
            include: {
              sender: { select: userSelect },
              attachments: true,
              reactions: true, // Include reactions
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Manually filter to ensure exactly two participants and they are the correct users
      if (existingChat && existingChat.participants.length === 2 &&
          existingChat.participants.some(p => p.userId === user1Id) &&
          existingChat.participants.some(p => p.userId === user2Id)) {
        return {
          id: existingChat.id,
          name: existingChat.name,
          avatarUrl: existingChat.avatarUrl ?? undefined,
          type: existingChat.type,
          lastMessageSnippet: existingChat.messages.length > 0 ? existingChat.messages[existingChat.messages.length - 1].content : null,
          lastMessageTimestamp: existingChat.messages.length > 0 ? existingChat.messages[existingChat.messages.length - 1].createdAt.toISOString() : null,
          unreadCount: 0,
          messages: existingChat.messages.map(msg => ({
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
            },
            attachments: msg.attachments.map(att => ({
              id: att.id,
              url: att.url,
              filename: att.filename,
              mimetype: att.mimetype,
              size: att.size,
              createdAt: att.createdAt,
            })),
            deletedForUserIds: (msg as any).deletedForUserIds || [],
          })),
          participants: existingChat.participants.map(p => ({
            id: p.userId,
            email: p.user.email,
            name: p.user.name,
            username: p.user.username,
            isVerified: p.user.isVerified,
            avatarUrl: p.user.avatarUrl,
            bio: p.user.bio,
            status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          })),
        };
      } else {
        // If not found, create a new private chat within the transaction
        const newChat = await prisma.chat.create({
          data: {
            type: ChatType.PRIVATE,
            participants: {
              create: [{ userId: user1Id }, { userId: user2Id }],
            },
          },
          include: {
            participants: {
              include: {
                user: { select: userSelect },
              },
            },
            messages: {
              include: {
                sender: { select: userSelect },
                attachments: true,
              },
            },
          },
        });

        return {
          id: newChat.id,
          name: newChat.name,
          avatarUrl: newChat.avatarUrl ?? undefined,
          type: newChat.type,
          lastMessageSnippet: null,
          lastMessageTimestamp: null,
          unreadCount: 0,
          messages: [],
          participants: newChat.participants.map(p => ({
            id: p.user.id,
            email: p.user.email,
            name: p.user.name,
            username: p.user.username,
            isVerified: p.user.isVerified,
            avatarUrl: p.user.avatarUrl,
            bio: p.user.bio,
            status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
          })),
        };
      }
    });
  }

  async findPrivateChat(user1Id: string, user2Id: string) {
    // Find a chat of type 'PRIVATE' that has exactly two participants
    // where those participants are user1Id and user2Id.
    const chat = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.PRIVATE,
        participants: {
          every: { // Ensure all participants match the criteria
            userId: {
              in: [user1Id, user2Id], // User ID is either user1Id or user2Id
            },
          },
          // Also ensure there are exactly two participants.
          // Prisma doesn't have a direct way to filter by relation count in `where`.
          // We can filter by count after fetching, or use a raw query if performance is critical.
          // For now, let's fetch and filter, assuming the number of participants is small.
          // A better approach might involve a more complex query or a separate field for participant count.
        },
      },
      include: {
        participants: { // Include participants to check count
          include: { // Include user details for participants
            user: { select: userSelect },
          },
        },
        messages: { // Include messages for the ChatDto mapping
           include: {
             sender: { select: userSelect },
             attachments: true, // Include attachments for messages
           },
           orderBy: {
             createdAt: 'asc',
           },
        },
      },
    });

    // Manually filter to ensure exactly two participants and they are the correct users
    if (chat && chat.participants.length === 2 &&
        chat.participants.some(p => p.userId === user1Id) &&
        chat.participants.some(p => p.userId === user2Id)) {

        // Map the found chat to ChatDto structure
        return {
            id: chat.id,
            name: chat.name, // Name might be null for private chats
            avatarUrl: chat.avatarUrl ?? undefined,
            type: chat.type,
            lastMessageSnippet: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : null,
            lastMessageTimestamp: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].createdAt.toISOString() : null,
            unreadCount: 0, // Not applicable for finding a single chat
            messages: chat.messages.map(msg => ({
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
              },
              attachments: msg.attachments.map(att => ({
                id: att.id,
                url: att.url,
                filename: att.filename,
                mimetype: att.mimetype,
                size: att.size,
                createdAt: att.createdAt,
              })),
              deletedForUserIds: msg.deletedForUserIds || [], // Include deletedForUserIds
            })), // Close messages mapping
            participants: chat.participants.map(p => ({ // Include participants
              id: p.userId, // Use userId from ChatParticipant
              email: p.user.email,
              name: p.user.name,
              username: p.user.username,
              isVerified: p.user.isVerified,
              avatarUrl: p.user.avatarUrl,
              bio: p.user.bio,
              status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
            })),
        };
    }

    return null; // No private chat found between these two users
  }

  async update(id: string, data: Prisma.ChatUpdateInput) {
    try {
      return await this.prisma.chat.update({
        where: { id },
        data,
        include: { messages: true }, // Include related user and messages
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
  async sendMessage(chatId: string, content: string, senderId: string, files?: FileUpload[]) {
    this.logger.log('[ChatService] sendMessage called for chatId:', chatId, 'senderId:', senderId, 'files:', files?.length);

    const attachmentsData: Prisma.AttachmentCreateWithoutMessageInput[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const { createReadStream, filename, mimetype } = await file; // Removed encoding as it's not used
        const stream = createReadStream();
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', chunk => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks)));
        });

        const uniqueFilename = `${uuidv4()}-${filename}`;
        const key = `chat-attachments/${chatId}/${uniqueFilename}`; // Store in a chat-specific folder

        try {
          const uploadResult = await this.cloudflareR2Service.uploadFile(buffer, key, mimetype, buffer.length);
          if (uploadResult && uploadResult.Location) { // Ensure Location is present
            attachmentsData.push({
              url: uploadResult.Location,
              filename: filename,
              mimetype: mimetype,
              size: buffer.length,
            });
          } else {
            this.logger.warn(`[ChatService] Uploaded file ${filename} to R2, but no Location URL was returned.`);
          }
        } catch (uploadError) {
          this.logger.error(`[ChatService] Failed to upload file ${filename} to R2:`, uploadError);
          // Log and continue, meaning the message might be sent without this attachment
        }
      }
    }

    const messageData: Prisma.MessageCreateInput = {
      content,
      chat: { connect: { id: chatId } },
      sender: { connect: { id: senderId } },
      attachments: {
        create: attachmentsData,
      },
    };

    const newMessage = await this.messageService.create(messageData);
    this.logger.log('[ChatService] sendMessage created message with ID:', newMessage.id);
    return newMessage;
  }

  async deleteChatAndRemoveUser(chatId: string, userId: string): Promise<void> {
    // Margulan Seysembay's System First: Address the foreign key constraint systematically.
    // Dr. Eric Berg's Clarity over Complexity: Ensure clear, sequential deletion.
    // Coin22's Risk Awareness: Prevent data integrity issues by deleting dependents first.

    // 1. Find all message IDs in the chat to delete their attachments first
    const messagesInChat = await this.prisma.message.findMany({
      where: { chatId: chatId },
      select: { id: true }, // Select only the ID to optimize query
    });

    const messageIds = messagesInChat.map(message => message.id);

    if (messageIds.length > 0) {
      // 2. Delete all attachments associated with these messages
      await this.prisma.attachment.deleteMany({
        where: {
          messageId: {
            in: messageIds,
          },
        },
      });
    }

    // 3. Delete all messages in the chat
    await this.prisma.message.deleteMany({
      where: { chatId: chatId },
    });

    // 4. Delete the chat participants
    // Note: If a user is the only participant in a chat, and they delete it,
    // this will remove their participation. If other users are in the chat,
    // this operation will remove all participants from this specific chat.
    await this.prisma.chatParticipant.deleteMany({
      where: { chatId: chatId },
    });

    // 5. Delete the chat itself (using deleteMany for robustness)
    // This prevents "No record was found for a delete" if the chat is already gone.
    await this.prisma.chat.deleteMany({
      where: { id: chatId },
    });
  }

  async remove(id: string): Promise<void> {
    try {
      // Consider cascading deletes or handling related messages if necessary
      // Prisma might require deleting related messages first if not handled by DB constraints
      await this.prisma.message.deleteMany({ where: { chatId: id } }); // Example: Delete messages first
      await this.prisma.chat.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        // console.warn(`Chat with ID ${id} not found for deletion.`); // Removed excessive log
        return;
      }
      throw error; // Re-throw other errors
    }
  }
  async createChannel(ownerId: string, name: string, description?: string) {
    return this.prisma.chat.create({
      data: {
        name: name,
        type: ChatType.CHANNEL,
        participants: {
          create: {
            userId: ownerId,
            role: ChatParticipantRole.OWNER,
          },
        },
        channel: {
          create: {
            ownerId: ownerId,
            description: description,
            subscribersCount: 1, // Start with the owner as a subscriber
          },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: userSelect },
          },
        },
        channel: {
          include: {
            owner: { select: userSelect },
            chat: true, // Use the simple BaseChatDto relation
          },
        },
      },
    });
  }

  async subscribeToChannel(channelId: string, userId: string) {
    // Margulan Seysembay's Pragmatic Action: Check if already subscribed to avoid redundant operations.
    const existingParticipant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: userId,
          chatId: channelId,
        },
      },
    });

    if (existingParticipant) {
      // Already subscribed, return existing chat participant
      return this.prisma.chatParticipant.findUnique({
        where: { id: existingParticipant.id },
        include: { chat: true, user: { select: userSelect } },
      });
    }

    // Coin22's Risk Awareness: Use a transaction to ensure both participant creation and subscriber count update are atomic.
    return this.prisma.$transaction(async (prisma) => {
      const chatParticipant = await prisma.chatParticipant.create({
        data: {
          userId: userId,
          chatId: channelId,
          role: ChatParticipantRole.SUBSCRIBER,
        },
        include: {
          chat: {
            include: {
              channel: true,
            },
          },
          user: { select: userSelect },
        },
      });

      // Increment subscriber count for the channel
      await prisma.channel.update({
        where: { chatId: channelId },
        data: {
          subscribersCount: {
            increment: 1,
          },
        },
      });

      return chatParticipant;
    });
  }

  async unsubscribeFromChannel(channelId: string, userId: string) {
    // Margulan Seysembay's Pragmatic Action: Check if subscribed before attempting to unsubscribe.
    const existingParticipant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: userId,
          chatId: channelId,
        },
      },
    });

    if (!existingParticipant) {
      // Not subscribed, nothing to do
      return;
    }

    // Coin22's Risk Awareness: Use a transaction for atomic deletion and count decrement.
    return this.prisma.$transaction(async (prisma) => {
      await prisma.chatParticipant.delete({
        where: {
          userId_chatId: {
            userId: userId,
            chatId: channelId,
          },
        },
      });

      // Decrement subscriber count for the channel
      await prisma.channel.update({
        where: { chatId: channelId },
        data: {
          subscribersCount: {
            decrement: 1,
          },
        },
      });
    });
  }

  async deleteChannel(channelId: string, ownerId: string): Promise<boolean> {
    // Margulan Seysembay's Responsibility & Proactivity: Ensure only the owner can delete.
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.ownerId !== ownerId) {
      // Dr. Eric Berg's Clarity over Complexity: Provide clear feedback if not authorized or channel not found.
      throw new Error('Channel not found or you are not the owner.');
    }

    // Coin22's Protection of Capital: Use a transaction to ensure complete deletion of related data.
    return this.prisma.$transaction(async (prisma) => {
      // Delete the channel record
      await prisma.channel.delete({
        where: { id: channelId },
      });

      // Leverage the existing deleteChatAndRemoveUser to clean up the associated chat, messages, and participants
      await this.deleteChatAndRemoveUser(channel.chatId, ownerId); // Pass the associated chatId

      return true;
    });
  }
  async searchChannelsByName(name: string) {
    return this.prisma.chat.findMany({
      where: {
        type: ChatType.CHANNEL,
        name: {
          contains: name,
          mode: 'insensitive', // Case-insensitive search
        },
      },
      include: {
        channel: {
          include: {
            owner: { select: userSelect },
            chat: true, // Include the chat relation within the channel
          },
        },
        participants: {
          include: {
            user: { select: userSelect },
          },
        },
      },
      take: 10, // Limit search results for performance
    });
  }

  async globalSearch(query: string, currentUserId: string) {
    const users = await this.userService.searchByUsername(query);
    const channels = await this.searchChannelsByName(query);

    // Filter out the current user from the search results
    const filteredUsers = users.filter(user => user.id !== currentUserId);

    return {
      users: filteredUsers,
      chats: channels,
    };
  }

  async updateChannelPrivacy(channelId: string, ownerId: string, isPublic: boolean) {
    // Margulan Seysembay's Responsibility & Proactivity: Ensure only the owner can update.
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId }, // Use 'id' instead of 'chatId'
    });

    if (!channel || channel.ownerId !== ownerId) {
      // Dr. Eric Berg's Clarity over Complexity: Provide clear feedback if not authorized or channel not found.
      throw new Error('Channel not found or you are not the owner.');
    }

    // Update the isPublic status of the channel
    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: { isPublic: isPublic },
      include: { // Include necessary relations for the ChannelDto return type
        chat: true,
        owner: { select: userSelect },
      },
    });

    // Return the updated channel in a format consistent with ChannelDto
    return {
      id: updatedChannel.id,
      chatId: updatedChannel.chatId,
      ownerId: updatedChannel.ownerId, // Add ownerId here
      description: updatedChannel.description,
      subscribersCount: updatedChannel.subscribersCount,
      isPublic: updatedChannel.isPublic,
      owner: updatedChannel.owner,
      chat: {
        id: updatedChannel.chat.id,
        name: updatedChannel.chat.name,
        type: updatedChannel.chat.type,
        lastMessageSnippet: null,
        lastMessageTimestamp: null,
        unreadCount: 0,
        messages: [],
        participants: [],
      },
    };
  }
}
