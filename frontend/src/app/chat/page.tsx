'use client';

import LazyLoading from '@/components/LazyLoading';

export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useLazyQuery, useSubscription, useMutation, useApolloClient } from '@apollo/client';
import { GET_CHATS, GET_MESSAGES, SEARCH_USERS_BY_USERNAME, FIND_OR_CREATE_PRIVATE_CHAT, UPDATE_MESSAGE, SEND_MESSAGE, DELETE_MESSAGES, DELETE_CHAT_HISTORY_FOR_USER, DELETE_CHAT_AND_REMOVE_USER, CREATE_CHANNEL, SUBSCRIBE_TO_CHANNEL, UNSUBSCRIBE_FROM_CHANNEL, DELETE_CHANNEL, SEARCH_CHANNELS } from '@/graphql/queries';
import { NEW_MESSAGE_SUBSCRIPTION, MESSAGE_REACTION_ADDED_OR_REMOVED_SUBSCRIPTION } from '@/graphql/subscriptions'; // Import subscriptions
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import SidebarMenu from '@/ui/SidebarMenu';
import Settings from '@/ui/Settings';
import ChatListItem from '@/components/ChatListItem';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import InputPanel from '@/components/InputPanel';
import GlobalAudioControls from '@/components/GlobalAudioControls'; // Import GlobalAudioControls
import { icons } from '@/app/lib/constants';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserProfileModal from '@/components/UserProfileModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import ContextMenu from '@/components/ContextMenu';
import NetworkStatusDropdown from '@/components/NetworkStatusDropdown';
import { useNetworkStatus } from '@/context/NetworkStatusContext';
import { useChatId } from '@/context/ChatIdContext';
import { useNotification } from '@/context/NotificationContext';
import { playNotificationSound } from '@/utils/audioUtils';
import CreateChannelModal from '@/components/CreateChannelModal';
import ChannelDetailsModal from '@/components/ChannelDetailsModal';
import { GlobalAudioProvider, useGlobalAudio } from '@/context/GlobalAudioContext';

interface Message {
  id: string;
  chatId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    username?: string | null;
    status?: string;
    bio?: string | null;
  };
  content: string;
  createdAt: string;
  attachments?: {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
  }[];
}

interface Chat {
  id: string;
  name: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  username?: string;
  avatarUrl?: string;
  type: string;
  participants: UserDto[];
  channel?: ChannelDto;
}

interface ChannelDto {
  id: string;
  chatId: string;
  description?: string | null;
  subscribersCount: number;
  isPublic: boolean;
  owner: UserDto;
}

interface UserDto {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  status?: string;
}

const ChatPage = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<{ messageId: string; attachmentIndex: number } | null>(null);
  const [totalAudioFiles, setTotalAudioFiles] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [selectionStartCoords, setSelectionStartCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectionEndCoords, setSelectionEndCoords] = useState<{ x: number; y: number } | null>(null);
  const [showMultiDeleteConfirmModal, setShowMultiDeleteConfirmModal] = useState(false);
  const [showGlobalAudioOptions, setShowGlobalAudioOptions] = useState(false);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [showChatOptionsContextMenu, setShowChatOptionsContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [showDeleteChatHistoryConfirmModal, setShowDeleteChatHistoryConfirmModal] = useState(false);
  const [showDeleteUserConfirmModal, setShowDeleteUserConfirmModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showDeleteChannelConfirmModal, setShowDeleteChannelConfirmModal] = useState(false); // New state for channel deletion confirmation
  const [showChannelDetailsModal, setShowChannelDetailsModal] = useState(false); // New state for channel details modal
  const [channelSearchResults, setChannelSearchResults] = useState<Chat[]>([]); // New state for channel search results

  const { isOnline, isPoorConnection } = useNetworkStatus();
  const { setChatId: setGlobalChatId } = useChatId();
  const { showNotification } = useNotification();

  const client = useApolloClient();

  const { loading: loadingChats, error: errorChats, data: dataChats, refetch: refetchChats } = useQuery(GET_CHATS);
  const [getMessages, { loading: loadingMessages, error: errorMessages, data: dataMessages, refetch: refetchMessages }] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: 'cache-first',
  });
  const [searchUsers, { loading: loadingSearch, error: errorSearch, data: dataSearch }] = useLazyQuery(SEARCH_USERS_BY_USERNAME);
  const [searchChannels, { loading: loadingChannelSearch, error: errorChannelSearch, data: dataChannelSearch }] = useLazyQuery(SEARCH_CHANNELS); // New lazy query for channel search
  const [findOrCreatePrivateChat, { loading: creatingChat, error: createChatError }] = useMutation(FIND_OR_CREATE_PRIVATE_CHAT);
  const [sendMessage, { loading: sendingMessage, error: sendMessageError }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      if (data && data.sendMessage && selectedChatId) {
        const newMessage = data.sendMessage;

        setSelectedChatMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (!messageExists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });

        client.cache.updateQuery(
          { query: GET_MESSAGES, variables: { chatId: selectedChatId } },
          (existingMessages) => {
            if (existingMessages && existingMessages.getMessages) {
              const messageExists = existingMessages.getMessages.some((msg: Message) => msg.id === newMessage.id);
              if (!messageExists) {
                return {
                  getMessages: [...existingMessages.getMessages, newMessage],
                };
              }
            }
            return existingMessages;
          }
        );

        refetchChats();
      }
    },
  });
  const [deleteMessagesMutation] = useMutation(DELETE_MESSAGES);
  const [deleteChatHistoryMutation] = useMutation(DELETE_CHAT_HISTORY_FOR_USER);
  const [deleteChatAndRemoveUserMutation] = useMutation(DELETE_CHAT_AND_REMOVE_USER);
  const [createChannelMutation] = useMutation(CREATE_CHANNEL);
  const [subscribeToChannelMutation] = useMutation(SUBSCRIBE_TO_CHANNEL);
  const [unsubscribeFromChannelMutation] = useMutation(UNSUBSCRIBE_FROM_CHANNEL);
  const [deleteChannelMutation] = useMutation(DELETE_CHANNEL, {
    refetchQueries: [{ query: GET_CHATS }],
  });

  const { user: currentUser, queryLoading: authLoading, isInitializing } = useAuth();
  const router = useRouter();

  const handleCreateChannel = async (channelName: string, channelDescription: string) => {
    try {
      await createChannelMutation({
        variables: {
          name: channelName,
          description: channelDescription || null,
        },
      });
      // Optionally, refetch chats or update cache after successful creation
      refetchChats();
    } catch (error) {
      console.error('Error creating channel:', error);
      // Handle error, maybe show a notification
    }
  };

  const handleCreateChannelClick = () => {
    setShowCreateChannelModal(true);
  };
 
  const handleCloseCreateChannelModal = () => {
    setShowCreateChannelModal(false);
    // refetchChats is now called in handleCreateChannel
  };
  
  useEffect(() => {
    if (!authLoading && !isInitializing) {
      if (!currentUser) {
        router.push('/');
      } else {
      }
    } else {
    }
  }, [authLoading, currentUser, isInitializing, router]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
    setGlobalChatId(selectedChatId);
    if (selectedChatId) {
      getMessages({ variables: { chatId: selectedChatId } });
    } else {
      setSelectedChatMessages([]);
    }
  }, [selectedChatId, getMessages, setGlobalChatId]);

  useEffect(() => {
    if (dataMessages && dataMessages.getMessages) {
      setSelectedChatMessages(dataMessages.getMessages);
    }
  }, [dataMessages]);

  useEffect(() => {
    if (dataSearch && dataSearch.searchUsersByUsername) {
      setSearchResults(dataSearch.searchUsersByUsername);
    }
  }, [dataSearch]);

  useEffect(() => {
    console.log('[ChatPage] selectedChatMessages updated:', selectedChatMessages);
    let count = 0;
    selectedChatMessages.forEach(message => {
      message.attachments?.forEach(attachment => {
        if (attachment.mimetype.startsWith('audio/')) {
          count++;
        }
      });
    });
    setTotalAudioFiles(count);
  }, [selectedChatMessages]);


  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChatIdRef.current },
    skip: !selectedChatIdRef.current,
    onData: ({ data }) => {
      console.log('[ChatPage - Subscription onData] Received data:', data);
      if (data && data.data && data.data.newMessage) {
        const incomingMessage = data.data.newMessage;
        console.log('[ChatPage - Subscription onData] Incoming message:', incomingMessage);

        client.cache.updateQuery({
          query: GET_MESSAGES,
          variables: { chatId: incomingMessage.chatId }
        }, (existingMessages) => {
          if (existingMessages && existingMessages.getMessages) {
            return {
              getMessages: [...existingMessages.getMessages, incomingMessage],
            };
          }
          return {
            getMessages: [incomingMessage],
          };
        });

        if (incomingMessage.chatId === selectedChatIdRef.current) {
          console.log('[ChatPage - Subscription onData] Message for current chat. Updating local state directly.');
          console.log(`[ChatPage - Subscription onData] incomingMessage.chatId: ${incomingMessage.chatId}, selectedChatIdRef.current: ${selectedChatIdRef.current}`);
          setSelectedChatMessages(prevMessages => {
            return [...prevMessages, incomingMessage];
          });
          refetchMessages();
        } else {
          console.log('[ChatPage - Subscription onData] Message for a different chat. Updating cache and triggering notification.');
          if (incomingMessage.sender.id !== currentUser?.id) {
            showNotification(incomingMessage.sender.name, incomingMessage.content, incomingMessage.sender.avatarUrl);
            playNotificationSound();
          }
        }
      
        client.cache.updateQuery({ query: GET_CHATS }, (existingChats) => {
          if (existingChats && existingChats.getChats) {
            return {
              getChats: existingChats.getChats.map((chat: Chat) => {
                if (chat.id === incomingMessage.chatId) {
                  const incrementUnread = incomingMessage.sender.id !== currentUser?.id && chat.id !== selectedChatId;
                  return {
                    ...chat,
                    lastMessageSnippet: incomingMessage.content,
                    lastMessageTimestamp: incomingMessage.createdAt,
                    unreadCount: incrementUnread ? chat.unreadCount + 1 : chat.unreadCount,
                  };
                }
                return chat;
              }),
            };
          }
          return existingChats;
        });
      }
    },
  });

  useSubscription(MESSAGE_REACTION_ADDED_OR_REMOVED_SUBSCRIPTION, {
    variables: { chatId: selectedChatIdRef.current },
    skip: !selectedChatIdRef.current,
    onData: ({ data }) => {
      console.log('[ChatPage - Reaction Subscription onData] Received data:', data);
      if (data && data.data && data.data.messageReactionAddedOrRemoved) {
        const updatedMessage = data.data.messageReactionAddedOrRemoved;
        console.log('[ChatPage - Reaction Subscription onData] Updated message with reactions:', updatedMessage);

        setSelectedChatMessages(prevMessages => {
          // Find the index of the message to update
          const messageIndex = prevMessages.findIndex(msg => msg.id === updatedMessage.id);

          if (messageIndex > -1) {
            // Create a new array with the updated message
            const newMessages = [...prevMessages];
            newMessages[messageIndex] = updatedMessage;
            return newMessages;
          } else {
            // If the message is not found (shouldn't happen for reaction updates on existing messages),
            // you might want to refetch messages or handle this case appropriately.
            console.warn('[ChatPage - Reaction Subscription onData] Received reaction update for a message not in current state:', updatedMessage.id);
            // Optionally refetch messages:
            // refetchMessages();
            return prevMessages;
          }
        });

        // Optionally update the cache for GET_MESSAGES query
        client.cache.updateQuery(
          { query: GET_MESSAGES, variables: { chatId: updatedMessage.chatId } },
          (existingMessages) => {
            if (existingMessages && existingMessages.getMessages) {
              return {
                getMessages: existingMessages.getMessages.map((msg: Message) =>
                  msg.id === updatedMessage.id ? updatedMessage : msg
                ),
              };
            }
            return existingMessages;
          }
        );
      }
    },
  });

  const [updateMessage] = useMutation(UPDATE_MESSAGE, {
    onCompleted: (data) => {
      if (data && data.updateMessage) {
        setSelectedChatMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === data.updateMessage.id ? data.updateMessage : msg
          )
        );
        setEditingMessage(null);
      }
    },
    onError: (error) => {
      console.error('Error updating message:', error);
    },
  });

  const handleEditMessage = (message: { id: string; content: string }) => {
    setEditingMessage(message);
  };

  const handleSendMessageOrUpdate = async (content: string, files: File[]) => {
    if (editingMessage) {
      try {
        await updateMessage({
          variables: {
            messageId: editingMessage.id,
            content: content,
          },
        });
      } catch (e) {
        console.error('Error updating message:', e);
      }
    } else {
      try {
        const { data } = await sendMessage({
          variables: {
            chatId: selectedChatId,
            content: content,
            files: files.length > 0 ? files : undefined,
          },
        });

        console.log('After sendMessage - selectedChatId:', selectedChatId);
      } catch (e) {
        console.error('Error sending message:', e);
      }
    }
  };

  const handleAudioEnded = (messageId: string, attachmentIndex: number) => {
    if (totalAudioFiles < 2) {
      setCurrentlyPlayingAudio(null);
      return;
    }

    const currentMessageIndex = selectedChatMessages.findIndex(msg => msg.id === messageId);
    if (currentMessageIndex === -1) return;

    const currentMessage = selectedChatMessages[currentMessageIndex];
    const currentAttachment = currentMessage.attachments?.[attachmentIndex];

    if (!currentAttachment) return;

    if (currentMessage.attachments && attachmentIndex < currentMessage.attachments.length - 1) {
      setCurrentlyPlayingAudio({ messageId, attachmentIndex: attachmentIndex + 1 });
      return;
    }

    for (let i = currentMessageIndex + 1; i < selectedChatMessages.length; i++) {
      const nextMessage = selectedChatMessages[i];
      const firstAudioAttachmentIndex = nextMessage.attachments?.findIndex(att => att.mimetype.startsWith('audio/'));
      if (firstAudioAttachmentIndex !== undefined && firstAudioAttachmentIndex !== -1) {
        setCurrentlyPlayingAudio({ messageId: nextMessage.id, attachmentIndex: firstAudioAttachmentIndex });
        return;
      }
    }

    setCurrentlyPlayingAudio(null);
  };

  const { playAudio } = useGlobalAudio();

  const handleOpenGlobalAudioOptions = (messageId: string, src: string) => {
    setActiveAudioMessageId(messageId);
    setShowGlobalAudioOptions(true);
    // Removed redundant playAudio(src) call - playback is initiated in AudioPlayer.tsx
    // setCurrentlyPlayingAudio(null); // This might not be needed if local playback is fully removed
  };

  useEffect(() => {
  }, [selectedChatMessages]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      searchUsers({ variables: { username: query } });
    } else {
      setSearchResults([]);
    }
  };

  const handleOpenMenu = () => {
    setOpenMenu(!openMenu);
    setOpenSettings(false);
  };

  const handleOpenSettings = () => {
    setOpenSettings(true);
    setOpenMenu(false);
  };

  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  const handleToggleTheme = () => {
    console.log('Toggle Theme clicked');
  };

  const handleToggleNotification = () => {
    console.log('Toggle Notification clicked');
  };

  const handleSelectUserFromSearch = async (userId: string) => {
    console.log(`Selected user with ID: ${userId} from search results.`);
    if (!currentUser) {
      console.error("Current user not available to create chat.");
      return;
    }

    try {
      const { data } = await findOrCreatePrivateChat({
        variables: {
          otherUserId: userId,
        },
      });

      if (data && data.findOrCreatePrivateChat) {
        const chat = data.findOrCreatePrivateChat;
        console.log(`Chat created or found with ID: ${chat.id}`);
        setSelectedChatId(chat.id);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        console.error("Failed to find or create chat after selecting user.");
      }
    } catch (error) {
      console.error("Error finding or creating chat:", error);
    }
  };

  const handleSelectChannelFromSearch = (chatId: string) => {
    setSelectedChatId(chatId);
    setSearchQuery('');
    setSearchResults([]);
    setChannelSearchResults([]);
  };

  const selectedChat = dataChats?.getChats.find((chat: Chat) => chat.id === selectedChatId);

  const otherParticipant = selectedChat && selectedChat.type === 'PRIVATE' && currentUser
    ? selectedChat.participants.find((participant: UserDto) => participant.id !== currentUser.id)
    : null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsSelecting(true);
      setSelectionStartCoords({ x: e.clientX, y: e.clientY });
      setSelectionEndCoords({ x: e.clientX, y: e.clientY });
      setSelectedMessageIds(new Set());
    }
  };
  

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStartCoords) {
      setSelectionEndCoords({ x: e.clientX, y: e.clientY });
      const newSelectedIds = new Set<string>();
      const selectionRect = {
        x1: Math.min(selectionStartCoords.x, e.clientX),
        y1: Math.min(selectionStartCoords.y, e.clientY),
        x2: Math.max(selectionStartCoords.x, e.clientX),
        y2: Math.max(selectionStartCoords.y, e.clientY),
      };

      selectedChatMessages.forEach(message => {
        const messageElement = document.getElementById(`message-${message.id}`);
        if (messageElement && message.sender.id === currentUser?.id) {
          const messageRect = messageElement.getBoundingClientRect();
          if (
            messageRect.left < selectionRect.x2 &&
            messageRect.right > selectionRect.x1 &&
            messageRect.top < selectionRect.y2 &&
            messageRect.bottom > selectionRect.y1
          ) {
            newSelectedIds.add(message.id);
          }
        }
      });
      setSelectedMessageIds(newSelectedIds);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStartCoords(null);
    setSelectionEndCoords(null);
    if (selectedMessageIds.size > 0) {
      setShowMultiDeleteConfirmModal(true);
    }
  };

  const handleDeleteSelectedMessages = async () => {
    try {
      await deleteMessagesMutation({ variables: { messageIds: Array.from(selectedMessageIds) } });
      setSelectedChatMessages(prevMessages =>
        prevMessages.filter(msg => !selectedMessageIds.has(msg.id))
      );
      setSelectedMessageIds(new Set());
      setShowMultiDeleteConfirmModal(false);
    } catch (error: any) {
      console.error('Error deleting selected messages:', error);
      showNotification('Error', `Error deleting messages: ${error.message}`);
    }
  };
 
  const handleDeleteChatHistory = () => {
    setShowDeleteChatHistoryConfirmModal(true);
    setShowChatOptionsContextMenu(false);
  };
 
  const handleConfirmDeleteChatHistory = async () => {
    if (!selectedChatId) return;
    try {
      await deleteChatHistoryMutation({ variables: { chatId: selectedChatId } });
      setSelectedChatMessages([]);
      setShowDeleteChatHistoryConfirmModal(false);
    } catch (error: any) {
      console.error('Error deleting chat history:', error);
      showNotification('Error', `Error deleting chat history: ${error.message}`);
    }
  };
 
  const handleDeleteUser = () => {
    setShowDeleteUserConfirmModal(true);
    setShowChatOptionsContextMenu(false);
  };
 
  const handleConfirmDeleteUser = async () => {
    if (!selectedChatId) return;
    try {
      await deleteChatAndRemoveUserMutation({ variables: { chatId: selectedChatId } });
      setSelectedChatId(null);
      setSelectedChatMessages([]);
      setShowDeleteUserConfirmModal(false);
      router.push('/chat');
      refetchChats();
    } catch (error: any) {
      console.error('Error deleting user and chat:', error);
      showNotification('Error', `Error deleting user and chat: ${error.message}`);
    }
  };

  const getSubscriberText = (count: number): string => {
    if (count === 0) {
      return 'subscribers';
    }
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'subscribers';
    }
    if (lastDigit === 1) {
      return 'subscriber';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'subscriber';
    }
    return 'subscribers';
  };

  const handleSubscribeToChannel = async (channelId: string) => {
    try {
      await subscribeToChannelMutation({ variables: { channelId } });
      refetchChats();
      showNotification('Success', 'You\'ve subscribed to the channel!');
    } catch (error: any) {
      console.error('Error subscribing to channel:', error);
      showNotification('Error', `Subscription Error: ${error.message}`);
    }
  };

  const handleUnsubscribeFromChannel = async (channelId: string) => {
    try {
      await unsubscribeFromChannelMutation({ variables: { channelId } });
      refetchChats();
      showNotification('Success', 'You have unsubscribed from the channel!');
    } catch (error: any) {
      console.error('Error unsubscribing from channel:', error);
      showNotification('Error', `Unsubscribe Error: ${error.message}`);
    }
  };

  const handleDeleteChannel = () => {
    setShowDeleteChannelConfirmModal(true);
  };

  const handleConfirmDeleteChannel = async () => {
    if (!selectedChatId || !selectedChat?.channel) return;
    try {
      await deleteChannelMutation({ variables: { channelId: selectedChatId } });
      setSelectedChatId(null);
      setSelectedChatMessages([]);
      setShowDeleteChannelConfirmModal(false);
      refetchChats();
      router.push('/chat');
      showNotification('Success', 'Channel successfully deleted!');
    } catch (error: any) {
      console.error('Error deleting channel:', error);
      showNotification('Error', `Error deleting channel: ${error.message}`);
    }
  };

  return (
    <GlobalAudioProvider>
      <div className={`chat-container ${selectedChatId ? 'chat-selected' : ''}`}>
        {openMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpenMenu(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SidebarMenu
              onOpenSettings={handleOpenSettings}
              onToggleTheme={handleToggleTheme}
              onToggleNotification={handleToggleNotification}
            />
          </div>
        </div>
      )}

      {isInitializing ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
          <LazyLoading className="chat-list-item"/>
        </div>
      ) : (
        <>
          <div className="chat-sidebar">
            <div className="chat-list relative">
              <NetworkStatusDropdown />
              <div className="search-input-panel-container">
                <InputPanel
                  type="text"
                  placeholder="Search"
                  className="search-input-panel"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="sidebar-header">
                <Button className="burger-icon" onClick={handleOpenMenu}>{icons.burgerMenu && <Image src={icons.burgerMenu} alt="Burger Menu" className="icon" width={24} height={24} />}</Button>
              </div>
              {searchQuery.length > 0 ? (
                loadingSearch || loadingChannelSearch ? (
                  <>
                    <LazyLoading className="chat-list-item" />
                    <LazyLoading className="chat-list-item" />
                    <LazyLoading className="chat-list-item" />
                  </>
                ) : (
                  <>
                    {errorSearch && <p>Error searching users: {errorSearch.message}</p>}
                    {errorChannelSearch && <p>Error searching channels: {errorChannelSearch.message}</p>}

                    {searchResults.length > 0 && (
                      <div className="search-results-section">
                        <h3>Users</h3>
                        {searchResults.map(user => (
                          <ChatListItem
                            key={user.id}
                            chat={{
                              id: user.id,
                              name: user.name,
                              username: user.username,
                              avatarUrl: user.avatarUrl,
                              lastMessageSnippet: `Username: ${user.username}`,
                              timestamp: undefined,
                              unreadCount: undefined,
                              type: 'USER',
                            }}
                            isActive={false}
                            onClick={() => handleSelectUserFromSearch(user.id)}
                          />
                        ))}
                      </div>
                    )}

                    {channelSearchResults.length > 0 && (
                      <div className="search-results-section">
                        <h3>Channels</h3>
                        {channelSearchResults.map(channelChat => (
                          <ChatListItem
                            key={channelChat.id}
                            chat={channelChat}
                            isActive={channelChat.id === selectedChatId}
                            onClick={() => handleSelectChannelFromSearch(channelChat.id)}
                          />
                        ))}
                      </div>
                    )}

                    {searchResults.length === 0 && channelSearchResults.length === 0 && (
                      <p>No users or channels found.</p>
                    )}
                  </>
                )
              ) : (
                !isOnline ? (
                  <div className="chat-welcome-message">
                    <p>You are offline. Please check your connection.</p>
                  </div>
                ) : (
                  loadingChats ? (
                    <>
                      <LazyLoading className="chat-list-item" />
                      <LazyLoading className="chat-list-item" />
                      <LazyLoading className="chat-list-item" />
                    </>
                  ) : errorChats ? (
                    <p>Error loading chats: {errorChats.message}</p>
                  ) : dataChats && dataChats.getChats.length > 0 ? (
                    dataChats.getChats.map((chat: Chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === selectedChatId}
                        onClick={() => setSelectedChatId(chat.id)}
                      />
                    ))
                  ) : (
                    <p>No chats found.</p>
                  )
                )
              )}
            </div>
          </div>
          <div className="chat-main-content">
            {selectedChatId && selectedChat ? (
              <>
                <div className="chat-header">
                  {/* Back button for mobile */}
                  {selectedChatId && (
                    <button className="back-button" onClick={() => setSelectedChatId(null)}>
                      {icons.arrowBack && <Image src={icons.arrowBack} alt="Back" className="icon" width={24} height={24} />}
                    </button>
                  )}
                  {selectedChat.type === 'PRIVATE' && otherParticipant ? (
                    <div className="chat-header-content">
                      <div
                        className="chat-header-avatar"
                        onClick={() => {
                          setSelectedProfileUserId(otherParticipant.id);
                          setShowUserProfileModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {otherParticipant.avatarUrl ? (
                          (<img src={otherParticipant.avatarUrl} alt={`${otherParticipant.name}'s avatar`} width={40} height={40} className="rounded-full" />)
                        ) : (
                          (<div className="default-avatar"></div>)
                        )}
                      </div>
                      <div className="chat-header-info">
                        <h2 className="chat-header-name">{otherParticipant.name || otherParticipant.username || 'Unknown User'}</h2>
                        <p className="chat-header-status">Online</p>
                      </div>
                      <div className="chat-header-options">
                        <div
                          onClick={(e) => {
                            const clickX = e.clientX;
                            const clickY = e.clientY;
                            const menuWidth = 200; // Estimated menu width
                            const menuHeight = 100; // Estimated menu height
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;

                            let finalX = clickX;
                            let finalY = clickY;

                            // Adjust X if menu goes off the right edge
                            if (clickX + menuWidth > viewportWidth) {
                              finalX = clickX - menuWidth;
                            }

                            // Adjust Y if menu goes off the bottom edge
                            if (clickY + menuHeight > viewportHeight) {
                              finalY = clickY - menuHeight;
                            }

                            setContextMenuX(finalX);
                            setContextMenuY(finalY);
                            setShowChatOptionsContextMenu(prev => !prev);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <img src={icons.options} alt="Options" className="icon" width={24} height={24} />
                        </div>
                        {showChatOptionsContextMenu && (
                          <ContextMenu
                            x={contextMenuX}
                            y={contextMenuY}
                            options={[
                              { label: 'Delete chat history', onClick: handleDeleteChatHistory },
                              { label: 'Delete user', onClick: handleDeleteUser },
                            ]}
                            onClose={() => setShowChatOptionsContextMenu(false)}
                          />
                        )}
                      </div>
                    </div>
                  ) : selectedChat.type === 'CHANNEL' && selectedChat.channel ? (
                    <div className="chat-header-content">
                      <div
                        className="chat-header-avatar"
                        onClick={() => {
                          if (selectedChat.channel) {
                            setShowChannelDetailsModal(true);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <Image src={icons.channel} alt="Channel Avatar" width={40} height={40} className="rounded-full" />
                      </div>
                      <div className="chat-header-info">
                        <h2 className="chat-header-name">{selectedChat.name || 'Channel'}</h2>
                        <p className="chat-header-status">
                          {selectedChat.channel.subscribersCount} {getSubscriberText(selectedChat.channel.subscribersCount)}
                        </p>
                        {selectedChat.channel.description && (
                          <p className="chat-header-description">{selectedChat.channel.description}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="chat-header-info" style={{ flexGrow: 1 }}>
                      <h2 className="chat-header-name">{selectedChat.name || 'Group Chat'}</h2>
                    </div>
                  )}
                </div>

                {/* Global audio options panel */}
                {showGlobalAudioOptions && <GlobalAudioControls />}

                <div
                  className="chat-messages"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {loadingMessages && (
                    <>
                      <LazyLoading className="chat-message-bubble other-user" />
                      <LazyLoading className="chat-message-bubble other-user" />
                      <LazyLoading className="chat-message-bubble other-user" />
                      <LazyLoading className="chat-message-bubble other-user" />
                    </>
                  )}
                  {errorMessages && <p>Error loading messages: {errorMessages.message}</p>}
                  {selectedChatMessages.map((message, index) => {
                    const isRecentMessage = index >= selectedChatMessages.length - 10;
                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={message.sender.id === currentUser?.id}
                        onEditMessage={handleEditMessage}
                        onAudioEnded={handleAudioEnded}
                        currentlyPlayingAudio={currentlyPlayingAudio}
                        setCurrentlyPlayingAudio={setCurrentlyPlayingAudio}
                        isSelected={selectedMessageIds.has(message.id)}
                        isSelecting={isSelecting}
                        onShowGlobalAudioControls={handleOpenGlobalAudioOptions} // Use the new prop name
                        isPoorConnection={isPoorConnection}
                        isRecentMessage={isRecentMessage}
                        currentUserId={currentUser?.id} // Pass the current user's ID
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput
                  chatId={selectedChatId}
                  editingMessage={editingMessage}
                  setEditingMessage={setEditingMessage}
                  onSendMessageOrUpdate={handleSendMessageOrUpdate}
                  isChannel={selectedChat.type === 'CHANNEL'}
                  isChannelOwner={selectedChat.type === 'CHANNEL' && selectedChat.channel?.owner.id === currentUser?.id}
                  isSubscribedToChannel={selectedChat.type === 'CHANNEL' && selectedChat.participants.some((p: UserDto) => p.id === currentUser?.id)}
                  onSubscribe={() => handleSubscribeToChannel(selectedChat.id)}
                  onUnsubscribe={() => handleUnsubscribeFromChannel(selectedChat.id)}
                />
              </>
            ) : (
              <div className="chat-welcome-message">
                Communication starts here, start with us!
              </div>
            )}
          </div>

          {openSettings && <Settings isOpen={openSettings} onClose={handleCloseSettings} />}

          {showUserProfileModal && selectedProfileUserId && (
            <UserProfileModal
              isOpen={showUserProfileModal}
              onClose={() => {
                setShowUserProfileModal(false);
                setSelectedProfileUserId(null);
              }}
              userId={selectedProfileUserId}
            />
          )}

          {showCreateChannelModal && (
            <CreateChannelModal
              isOpen={showCreateChannelModal}
              onClose={handleCloseCreateChannelModal}
              onCreate={handleCreateChannel} // Pass the new handler
            />
          )}

          {showMultiDeleteConfirmModal && (
            <ConfirmationModal
              isOpen={showMultiDeleteConfirmModal}
              onClose={() => setShowMultiDeleteConfirmModal(false)}
              onConfirm={handleDeleteSelectedMessages}
              title="Confirm Deletion"
              message={`Are you sure you want to delete ${selectedMessageIds.size} selected messages?`}
              confirmText="Delete"
              cancelText="Cancel"
            />
          )}

          {showDeleteChatHistoryConfirmModal && (
            <ConfirmationModal
              isOpen={showDeleteChatHistoryConfirmModal}
              onClose={() => setShowDeleteChatHistoryConfirmModal(false)}
              onConfirm={handleConfirmDeleteChatHistory}
              title="Confirm Delete Chat History"
              message="Are you sure you want to delete the chat history for yourself? This action cannot be undone."
              confirmText="Delete History"
              cancelText="Cancel"
            />
          )}

          {showDeleteUserConfirmModal && (
            <ConfirmationModal
              isOpen={showDeleteUserConfirmModal}
              onClose={() => setShowDeleteUserConfirmModal(false)}
              onConfirm={handleConfirmDeleteUser}
              title="Confirm Delete User and Chat"
              message="Are you sure you want to delete this user and all chat history for both participants? This action cannot be undone."
              confirmText="Delete User & Chat"
              cancelText="Cancel"
            />
          )}

          {showDeleteChannelConfirmModal && selectedChat?.channel && (
            <ConfirmationModal
              isOpen={showDeleteChannelConfirmModal}
              onClose={() => setShowDeleteChannelConfirmModal(false)}
              onConfirm={handleConfirmDeleteChannel}
              title="Confirm Delete Channel"
              message={`Are you sure you want to delete the channel "${selectedChat.name}"? This action cannot be undone.`}
              confirmText="Delete Channel"
              cancelText="Cancel"
            />
          )}

          {showChannelDetailsModal && selectedChat?.channel && (
            <ChannelDetailsModal
              isOpen={showChannelDetailsModal}
              onClose={() => setShowChannelDetailsModal(false)}
              channel={selectedChat.channel}
              isOwner={currentUser?.id === selectedChat.channel.owner.id}
              onChannelDeleted={() => {
                setSelectedChatId(null);
                setSelectedChatMessages([]);
                refetchChats();
                router.push('/chat');
              }}
            />
          )}
        </>
      )}
      </div>
    </GlobalAudioProvider>
  );
};

export default ChatPage;
