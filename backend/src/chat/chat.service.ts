import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ChatType, ChatParticipantRole } from '@prisma/client'; // Explicitly import enums
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MessageService } from '../message/message.service';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service'; // Import CloudflareR2Service
import { FileUpload } from 'graphql-upload-ts'; // Import FileUpload
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
    private cloudflareR2Service: CloudflareR2Service, // Inject CloudflareR2Service
  ) {}

  async findOne(id: string) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true, // Include user details for participants
          },
        },
        messages: {
          include: {
            sender: true, // Include sender details for messages
            attachments: true, // Include attachments
          },
          orderBy: {
            createdAt: 'asc', // Order messages chronologically
          },
        },
        channel: { // Explicitly include nested relations for channel
          include: {
            chat: true,
            owner: true,
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    console.log('[ChatService] findAllForUser called for userId:', userId);
    // Find all chat participants for the given user
    const chatParticipants = await this.prisma.chatParticipant.findMany({
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
                sender: true, // Include sender of the last message
                attachments: true, // Include attachments for the last message
              },
            },
            participants: { // Include participants to determine chat name for private chats
              include: {
                user: true,
              },
            },
            channel: { // Explicitly include nested relations for channel
              include: {
                chat: true,
                owner: true,
              },
            },
          },
        },
        lastReadMessage: true, // Include the last read message for unread count calculation
      },
    });

    // Process the results to match the ChatDto structure
    return chatParticipants.map(cp => {
      const chat = cp.chat;
      const lastMessage = chat.messages[0];
      const unreadCount = lastMessage ?
        chat.messages.filter(msg => msg.createdAt > (cp.lastReadMessage?.createdAt || new Date(0))).length : 0; // Basic unread count

      // Determine chat name for private chats or channels
      let chatName: string | null = chat.name;
      if (chat.type === ChatType.PRIVATE) {
        chatName = chat.participants.find(p => p.userId !== userId)?.user.name || 'Private Chat';
      } else if (chat.type === ChatType.CHANNEL && chat.channel) {
        chatName = chat.channel.chat.name; // Use channel's name
      }

      return {
        id: chat.id,
        name: chatName,
        type: chat.type,
        lastMessageSnippet: lastMessage?.content || null,
        lastMessageTimestamp: lastMessage?.createdAt.toISOString() || null, // Convert Date to string
        unreadCount: unreadCount,
       messages: [], // Include empty messages array for ChatDto compatibility
       participants: chat.participants.map(p => { // Include participants
         return {
           id: p.user.id,
           email: p.user.email,
           name: p.user.name,
           username: p.user.username,
           isVerified: p.user.isVerified,
           avatarUrl: p.user.avatarUrl,
           bio: p.user.bio,
           status: p.user.lastActiveAt ? (new Date(p.user.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
           roles: p.user.roles || [], // Ensure roles are included
         };
       }),
       channel: chat.channel ? { // Include channel data if it exists
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
    });
  }

  async create(type: ChatType, name?: string, participantIds: string[] = []) { // Use ChatType enum
    const newChat = await this.prisma.chat.create({
      data: {
        name: name,
        type: type,
        participants: {
          create: participantIds.map(userId => ({
            userId: userId,
            role: ChatParticipantRole.MEMBER, // Default role for new chat participants
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
           include: {
             sender: true,
             attachments: true, // Include attachments for messages in new chat
           }
        },
      },
    });
     // Map the created chat to ChatDto structure
    return {
        id: newChat.id,
        name: newChat.name,
        type: newChat.type,
        lastMessageSnippet: null, // New chat has no messages yet
        lastMessageTimestamp: null,
        unreadCount: 0,
        messages: [],
        participants: newChat.participants.map(p => ({ // Include participants
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
              user: true,
            },
          },
          messages: {
            include: {
              sender: true,
              attachments: true,
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
                user: true,
              },
            },
            messages: {
              include: {
                sender: true,
                attachments: true,
              },
            },
          },
        });

        return {
          id: newChat.id,
          name: newChat.name,
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
            user: true,
          },
        },
        messages: { // Include messages for the ChatDto mapping
           include: {
             sender: true,
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
    console.log('[ChatService] sendMessage called for chatId:', chatId, 'senderId:', senderId, 'files:', files?.length);

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
            console.warn(`[ChatService] Uploaded file ${filename} to R2, but no Location URL was returned.`);
          }
        } catch (uploadError) {
          console.error(`[ChatService] Failed to upload file ${filename} to R2:`, uploadError);
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
    console.log('[ChatService] sendMessage created message with ID:', newMessage.id);
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
    // Margulan Seysembay's System First: Create chat and channel in a transaction for atomicity.
    // Coin22's Risk Awareness: Ensure data consistency.
    return this.prisma.$transaction(async (prisma) => {
      const newChat = await prisma.chat.create({
        data: {
          name: name,
          type: ChatType.CHANNEL,
          participants: {
            create: {
              userId: ownerId,
              role: ChatParticipantRole.OWNER, // Owner of the channel
            },
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      const newChannel = await prisma.channel.create({
        data: {
          chatId: newChat.id,
          ownerId: ownerId,
          description: description,
          subscribersCount: 0, // Initial subscriber count
        },
        include: {
          chat: true,
          owner: true,
        },
      });

      // Map the created channel to ChatDto structure
      return {
        id: newChat.id,
        name: newChat.name,
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
          roles: p.user.roles || [],
        })),
        channel: {
          id: newChannel.id,
          chatId: newChannel.chatId,
          chat: {
            id: newChannel.chat.id,
            name: newChannel.chat.name,
            type: newChannel.chat.type,
            lastMessageSnippet: null,
            lastMessageTimestamp: null,
            unreadCount: 0,
            messages: [],
            participants: [], // Participants will be fetched with the main chat query
          },
          ownerId: newChannel.ownerId,
          owner: {
            id: newChannel.owner.id,
            email: newChannel.owner.email,
            name: newChannel.owner.name,
            username: newChannel.owner.username,
            isVerified: newChannel.owner.isVerified,
            avatarUrl: newChannel.owner.avatarUrl,
            bio: newChannel.owner.bio,
            status: newChannel.owner.lastActiveAt ? (new Date(newChannel.owner.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
            roles: newChannel.owner.roles || [],
          },
          description: newChannel.description,
          subscribersCount: newChannel.subscribersCount,
          isPublic: newChannel.isPublic,
        },
      };
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
        include: { chat: true, user: true },
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
          user: true,
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
            owner: true,
            chat: true, // Include the chat relation within the channel
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
      take: 10, // Limit search results for performance
    });
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
        owner: true,
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
      owner: {
        id: updatedChannel.owner.id,
        email: updatedChannel.owner.email,
        name: updatedChannel.owner.name,
        username: updatedChannel.owner.username,
        isVerified: updatedChannel.owner.isVerified,
        avatarUrl: updatedChannel.owner.avatarUrl,
        bio: updatedChannel.owner.bio,
        status: updatedChannel.owner.lastActiveAt ? (new Date(updatedChannel.owner.lastActiveAt).getTime() > (Date.now() - 15 * 1000) ? 'Online' : 'Offline') : 'Offline',
        roles: updatedChannel.owner.roles || [],
      },
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
