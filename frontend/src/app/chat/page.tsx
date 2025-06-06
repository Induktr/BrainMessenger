'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useLazyQuery, useSubscription, useMutation, useApolloClient } from '@apollo/client';
import { GET_CHATS, GET_MESSAGES, NEW_MESSAGE_SUBSCRIPTION, SEARCH_USERS_BY_USERNAME, FIND_OR_CREATE_PRIVATE_CHAT, UPDATE_MESSAGE, SEND_MESSAGE, DELETE_MESSAGES, DELETE_CHAT_HISTORY_FOR_USER, DELETE_CHAT_AND_REMOVE_USER } from '@/graphql/queries';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import SidebarMenu from '@/ui/SidebarMenu';
import Settings from '@/ui/Settings';
import ChatListItem from '@/components/ChatListItem';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput'; // Corrected import
import Input from '@/components/Input'; // Keep Input for search
import { icons } from '@/app/lib/constants';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserProfileModal from '@/components/UserProfileModal';
import ConfirmationModal from '@/components/ConfirmationModal'; // Import ConfirmationModal
import ContextMenu from '@/components/ContextMenu'; // Import ContextMenu
import NetworkStatusDropdown from '@/components/NetworkStatusDropdown'; // Import NetworkStatusDropdown
import NotificationDropdown from '@/components/NotificationDropdown'; // Import NotificationDropdown
import { useNetworkStatus } from '@/context/NetworkStatusContext'; // Import useNetworkStatus

interface Message {
  id: string;
  chatId: string; // Added chatId
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
  const [selectedChatMessages, setSelectedChatMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<{ messageId: string; attachmentIndex: number } | null>(null);
  const [totalAudioFiles, setTotalAudioFiles] = useState(0); // New state to track total audio files
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false); // New state for selection mode
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set()); // New state for selected message IDs
  const [selectionStartCoords, setSelectionStartCoords] = useState<{ x: number; y: number } | null>(null); // New state for selection start coordinates
  const [selectionEndCoords, setSelectionEndCoords] = useState<{ x: number; y: number } | null>(null); // New state for selection end coordinates
  const [showMultiDeleteConfirmModal, setShowMultiDeleteConfirmModal] = useState(false); // State for multi-delete confirmation
  const [showGlobalAudioOptions, setShowGlobalAudioOptions] = useState(false); // New state for global audio options panel visibility
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null); // New state to track the ID of the audio message being controlled globally
  const [globalAudioIsPlaying, setGlobalAudioIsPlaying] = useState(false); // New state for global audio play/pause
  const [globalAudioIsLooping, setGlobalAudioIsLooping] = useState(false); // New state for global audio loop
  const [globalAudioCurrentTime, setGlobalAudioCurrentTime] = useState(0); // New state for global audio current time
  const [globalAudioDuration, setGlobalAudioDuration] = useState(0); // New state for global audio duration
  const globalAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for the globally controlled audio element
  const [showChatOptionsContextMenu, setShowChatOptionsContextMenu] = useState(false); // New state for chat options context menu
  const [contextMenuX, setContextMenuX] = useState(0); // State for context menu X position
  const [contextMenuY, setContextMenuY] = useState(0); // State for context menu Y position
  const [showDeleteChatHistoryConfirmModal, setShowDeleteChatHistoryConfirmModal] = useState(false); // State for delete chat history confirmation
  const [showDeleteUserConfirmModal, setShowDeleteUserConfirmModal] = useState(false); // State for delete user confirmation
  const { isOnline, isPoorConnection } = useNetworkStatus(); // Use network status hook
  const [notificationMessage, setNotificationMessage] = useState<Message | null>(null); // State for notification message
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false); // State for notification dropdown visibility
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element

  const client = useApolloClient(); // Get Apollo Client instance

  const { loading: loadingChats, error: errorChats, data: dataChats, refetch: refetchChats } = useQuery(GET_CHATS); // Added refetch
  const [getMessages, { loading: loadingMessages, error: errorMessages, data: dataMessages }] = useLazyQuery(GET_MESSAGES);
  const [searchUsers, { loading: loadingSearch, error: errorSearch, data: dataSearch }] = useLazyQuery(SEARCH_USERS_BY_USERNAME);
  const [findOrCreatePrivateChat, { loading: creatingChat, error: createChatError }] = useMutation(FIND_OR_CREATE_PRIVATE_CHAT);
  const [sendMessage, { loading: sendingMessage, error: sendMessageError }] = useMutation(SEND_MESSAGE, {
    update(cache, { data }) {
      const newMessage = data?.sendMessage;
      if (newMessage) {
        // Update GET_MESSAGES cache for the specific chat
        cache.updateQuery({
          query: GET_MESSAGES,
          variables: { chatId: newMessage.chatId },
        }, (existingMessages) => {
          if (existingMessages && existingMessages.getMessages) {
            const messageExists = existingMessages.getMessages.some((msg: Message) => msg.id === newMessage.id);
            if (!messageExists) {
              // Also update the local state directly for immediate UI reflection
              setSelectedChatMessages(prevMessages => [...prevMessages, newMessage]);
              return {
                getMessages: [...existingMessages.getMessages, newMessage],
              };
            }
          }
          return existingMessages;
        });

        // Update GET_CHATS cache for the last message snippet and timestamp for the sender's view
        cache.updateQuery({ query: GET_CHATS }, (existingChats) => {
          if (existingChats && existingChats.getChats) {
            return {
              getChats: existingChats.getChats.map((chat: Chat) =>
                chat.id === newMessage.chatId
                  ? {
                      ...chat,
                      lastMessageSnippet: newMessage.content,
                      lastMessageTimestamp: newMessage.createdAt,
                      // For the sender, unreadCount remains 0.
                    }
                  : chat
              ),
            };
          }
          return existingChats;
        });
      }
    },
  });
  const [deleteMessagesMutation] = useMutation(DELETE_MESSAGES); // Use the new mutation
  const [deleteChatHistoryMutation] = useMutation(DELETE_CHAT_HISTORY_FOR_USER); // New mutation
  const [deleteChatAndRemoveUserMutation] = useMutation(DELETE_CHAT_AND_REMOVE_USER); // New mutation
  
  const { user: currentUser, queryLoading: authLoading, isInitializing } = useAuth();
  const router = useRouter();
  
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
    if (selectedChatId) {
      getMessages({ variables: { chatId: selectedChatId } });
    } else {
      setSelectedChatMessages([]);
    }
  }, [selectedChatId, getMessages]);

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

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChatId }, // Subscribe to messages for the currently selected chat
    skip: !selectedChatId, // Skip if no chat is selected
    onData: ({ data }) => {
      console.log('[ChatPage - Subscription onData] Received data:', data); // Log incoming subscription data
      if (data && data.data && data.data.newMessage) {
        const incomingMessage = data.data.newMessage;
        console.log('[ChatPage - Subscription onData] Incoming message:', incomingMessage); // Log incoming message details

        // Update GET_MESSAGES cache for the specific chat if it's the currently selected one
        if (incomingMessage.chatId === selectedChatId) {
          console.log('[ChatPage - Subscription onData] Message for current chat. Updating state.');
          setSelectedChatMessages(prevMessages => {
            const messageExists = prevMessages.some(msg => msg.id === incomingMessage.id);
            if (!messageExists) {
              return [...prevMessages, incomingMessage];
            }
            return prevMessages;
          });
        } else {
          console.log('[ChatPage - Subscription onData] Message for a different chat. Not updating current chat messages.');
        }

        // Update GET_CHATS cache for the last message snippet, timestamp, and unread count
        // This applies to all chats, regardless of whether they are selected or not.
        client.cache.updateQuery({ query: GET_CHATS }, (existingChats) => {
          if (existingChats && existingChats.getChats) {
            return {
              getChats: existingChats.getChats.map((chat: Chat) => {
                if (chat.id === incomingMessage.chatId) {
                  // Increment unreadCount only if the message is not from the current user
                  // and the chat is not currently selected
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

        // Play sound and show notification if the message is NOT for the currently selected chat
        // and it's not from the current user
        if (incomingMessage.chatId !== selectedChatId && incomingMessage.sender.id !== currentUser?.id) {
          setNotificationMessage(incomingMessage);
          setShowNotificationDropdown(true); // Show the notification dropdown
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error playing notification sound:", e));
          }
          // refetchChats(); // No longer need to refetch chats explicitly due to cache update
        }
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

        // The cache update logic in the useMutation hook handles updating selectedChatMessages
        // No need to manually update state here as it will be updated via cache
        console.log('After sendMessage - selectedChatId:', selectedChatId);
      } catch (e) {
        console.error('Error sending message:', e);
      }
    }
  };

  const handleAudioEnded = (messageId: string, attachmentIndex: number) => {
    // If there's only one audio file in total, do not auto-play the next.
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

  const handleOpenGlobalAudioOptions = (messageId: string, src: string, currentTime: number, duration: number, isPlaying: boolean, isLooping: boolean) => {
    setActiveAudioMessageId(messageId);
    setShowGlobalAudioOptions(true);
    // Stop any currently playing audio in the message bubble
    setCurrentlyPlayingAudio(null);
    
    if (globalAudioRef.current) {
      globalAudioRef.current.src = src;
      globalAudioRef.current.load(); // Load the new audio
      globalAudioRef.current.currentTime = currentTime; // Set current time
      globalAudioRef.current.loop = isLooping; // Set loop state
      
      if (isPlaying) {
        globalAudioRef.current.play().catch(e => console.error("Error playing global audio:", e));
      } else {
        globalAudioRef.current.pause();
      }
      setGlobalAudioIsPlaying(isPlaying);
      setGlobalAudioIsLooping(isLooping);
      setGlobalAudioCurrentTime(currentTime);
      setGlobalAudioDuration(duration);
    }
  };

  const handleGlobalAudioTogglePlayPause = () => {
    if (globalAudioRef.current) {
      if (globalAudioIsPlaying) {
        globalAudioRef.current.pause();
      } else {
        globalAudioRef.current.play().catch(e => console.error("Error playing global audio:", e));
      }
      setGlobalAudioIsPlaying(prev => !prev);
    }
  };

  const handleGlobalAudioToggleLoop = () => {
    setGlobalAudioIsLooping(prev => !prev);
    if (globalAudioRef.current) {
      globalAudioRef.current.loop = !globalAudioIsLooping;
    }
  };

  const handleGlobalAudioSeek = (time: number) => {
    if (globalAudioRef.current) {
      globalAudioRef.current.currentTime = time;
    }
    setGlobalAudioCurrentTime(time);
  };

  const handleGlobalAudioTimeUpdate = useCallback(() => {
    if (globalAudioRef.current) {
      setGlobalAudioCurrentTime(globalAudioRef.current.currentTime);
    }
  }, []);

  const handleGlobalAudioLoadedMetadata = useCallback(() => {
    if (globalAudioRef.current) {
      setGlobalAudioDuration(globalAudioRef.current.duration);
      setGlobalAudioCurrentTime(0); // Reset current time on new audio load
    }
  }, []);

  const handleGlobalAudioEnded = useCallback(() => {
    setGlobalAudioIsPlaying(false);
    setGlobalAudioCurrentTime(0);
    if (!globalAudioIsLooping) {
      setShowGlobalAudioOptions(false); // Hide panel if not looping and ended
      setActiveAudioMessageId(null);
    }
  }, [globalAudioIsLooping]);

  useEffect(() => {
    const audio = globalAudioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleGlobalAudioTimeUpdate);
      audio.addEventListener('loadedmetadata', handleGlobalAudioLoadedMetadata);
      audio.addEventListener('ended', handleGlobalAudioEnded);
      audio.loop = globalAudioIsLooping; // Ensure loop property is set on mount/update

      return () => {
        audio.removeEventListener('timeupdate', handleGlobalAudioTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleGlobalAudioLoadedMetadata);
        audio.removeEventListener('ended', handleGlobalAudioEnded);
      };
    }
  }, [handleGlobalAudioTimeUpdate, handleGlobalAudioLoadedMetadata, handleGlobalAudioEnded, globalAudioIsLooping]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNotificationDropdown) {
      timer = setTimeout(() => {
        setShowNotificationDropdown(false);
        setNotificationMessage(null);
      }, 5000); // Hide after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [showNotificationDropdown]);

  useEffect(() => {
    // This effect will listen for changes that indicate a message has been deleted.
    // Since ChatMessage directly calls deleteMessage, we need a way to update the parent state.
    // A simple way is to refetch messages for the current chat, or use a more sophisticated cache update.
    // For simplicity in this step, we'll rely on refetching or subscription updates.
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

  const selectedChat = dataChats?.getChats.find((chat: Chat) => chat.id === selectedChatId);

  const otherParticipant = selectedChat && selectedChat.type === 'PRIVATE' && currentUser
    ? selectedChat.participants.find((participant: UserDto) => participant.id !== currentUser.id)
    : null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsSelecting(true);
      setSelectionStartCoords({ x: e.clientX, y: e.clientY });
      setSelectionEndCoords({ x: e.clientX, y: e.clientY });
      setSelectedMessageIds(new Set()); // Clear previous selection
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
        if (messageElement && message.sender.id === currentUser?.id) { // Only allow selecting current user's messages
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
      setShowMultiDeleteConfirmModal(true); // Show confirmation modal
    }
  };

  const handleDeleteSelectedMessages = async () => {
    try {
      await deleteMessagesMutation({ variables: { messageIds: Array.from(selectedMessageIds) } });
      // Optimistically update UI or refetch messages
      setSelectedChatMessages(prevMessages =>
        prevMessages.filter(msg => !selectedMessageIds.has(msg.id))
      );
      setSelectedMessageIds(new Set()); // Clear selection
      setShowMultiDeleteConfirmModal(false); // Close modal
    } catch (error) {
      console.error('Error deleting selected messages:', error);
      // Handle error (e.g., show a toast notification)
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
      setSelectedChatMessages([]); // Clear messages from UI
      setShowDeleteChatHistoryConfirmModal(false);
      // Optionally, refetch chats to update last message snippet/timestamp if needed
      // refetchChats(); // Assuming refetchChats is available from useQuery(GET_CHATS)
    } catch (error) {
      console.error('Error deleting chat history:', error);
      // Handle error (e.g., show a toast notification)
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
      setSelectedChatId(null); // Deselect chat
      setSelectedChatMessages([]); // Clear messages from UI
      setShowDeleteUserConfirmModal(false);
      router.push('/chat'); // Navigate back to chat list or home
      // refetchChats(); // Refetch chats to remove the deleted chat from the list
    } catch (error) {
      console.error('Error deleting user and chat:', error);
      // Handle error (e.g., show a toast notification)
    }
  };
    return (
      <div className="chat-container">
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

        <div className="chat-sidebar">
          <div className="chat-list relative"> {/* Added relative positioning for dropdown */}
            <NetworkStatusDropdown /> {/* Network status dropdown */}
            <div className="search-input-container">
              <Input
                type="text"
                placeholder="Search"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            </div>
            <div className="sidebar-header">
              <Button className="burger-icon" onClick={handleOpenMenu}>{icons.burgerMenu && <Image src={icons.burgerMenu} alt="Burger Menu" className="icon" width={24} height={24} />}</Button>
            </div>
            {searchQuery.length > 0 ? (
              loadingSearch ? (
                <p>Searching users...</p>
              ) : errorSearch ? (
                <p>Error searching users: {errorSearch.message}</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
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
                ))
              ) : (
                <p>No users found.</p>
              )
            ) : (
              !isOnline ? (
                <div className="">
                  <div className=""></div> {/* Placeholder for chat list */}
                </div>
              ) : (
                loadingChats ? (
                  <p>Loading chats...</p>
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
                          setContextMenuX(e.clientX);
                          setContextMenuY(e.clientY);
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
                            { label: 'Удалить историю чата', onClick: handleDeleteChatHistory },
                            { label: 'Удалить пользователя', onClick: handleDeleteUser },
                          ]}
                          onClose={() => setShowChatOptionsContextMenu(false)}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="chat-header-info" style={{ flexGrow: 1 }}>
                    <h2 className="chat-header-name">{selectedChat.name || 'Group Chat'}</h2>
                  </div>
                )}
              </div>

              {showGlobalAudioOptions && activeAudioMessageId && (
                <div className="global-audio-options-panel">
                  <audio ref={globalAudioRef} src={selectedChatMessages.find(msg => msg.id === activeAudioMessageId)?.attachments?.find(att => att.mimetype.startsWith('audio/'))?.url} preload="metadata" />
                  <div className="global-audio-controls">
                    <button onClick={handleGlobalAudioTogglePlayPause} className="audio-player-play-pause-button-dropdown">
                      <Image src={globalAudioIsPlaying ? icons.pause : icons.play} alt={globalAudioIsPlaying ? "Pause" : "Play"} width={20} height={20} className="audio-player-icon" />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max={globalAudioDuration}
                      value={globalAudioCurrentTime}
                      onChange={(e) => handleGlobalAudioSeek(parseFloat(e.target.value))}
                      className="audio-player-progress-slider-dropdown"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(globalAudioCurrentTime / globalAudioDuration) * 100}%, #4B5563 ${(globalAudioCurrentTime / globalAudioDuration) * 100}%, #4B5563 100%)`
                      }}
                    />
                    <button onClick={handleGlobalAudioToggleLoop} className={`audio-player-loop-button ${globalAudioIsLooping ? 'active' : ''}`}>
                      <Image src={icons.loop} alt="Loop" width={20} height={20} className="audio-player-icon" />
                    </button>
                  </div>
                </div>
              )}

              <div
                className="chat-messages"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {loadingMessages && <p>Loading messages...</p>}
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
                      isSelected={selectedMessageIds.has(message.id)} // Pass isSelected prop
                      isSelecting={isSelecting} // Pass isSelecting prop
                      onOpenOptions={handleOpenGlobalAudioOptions} // Pass the new handler
                      isPoorConnection={isPoorConnection} // Pass network status
                      isRecentMessage={isRecentMessage} // Pass new prop for recent messages
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

        {/* Audio element for notification sound */}
        <audio ref={audioRef} src="/sound/send-message.mp3" preload="auto" />
      </div>
    );
 };
  
 export default ChatPage;
