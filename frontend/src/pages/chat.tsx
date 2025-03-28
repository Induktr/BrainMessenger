import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client'; // Import Apollo hooks
import { GET_CHATS, GET_CHAT, GET_MESSAGES } from '../../graphql/queries'; // Import queries
import { SEND_MESSAGE } from '../../graphql/mutations'; // Import mutations
// TODO: Import generated types for queries/mutations if available

// Remove mock interfaces, rely on GraphQL types or generated types
// interface Message { ... }
// interface Chat { ... }

const ChatPage = () => {
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Fetch Chat List ---
  const { data: chatsData, loading: chatsLoading, error: chatsError } = useQuery(GET_CHATS);
  const chats = chatsData?.getChats || []; // Use fetched data, default to empty array
  // --- End Fetch Chat List ---

  // --- Fetch Messages for Active Chat (Example using GET_MESSAGES) ---
  // Alternatively, use GET_CHAT which includes messages
  const { data: messagesData, loading: messagesLoading, error: messagesError } = useQuery(GET_MESSAGES, {
    variables: { chatId: activeChatId, limit: 50 }, // Fetch messages for the active chat, add limit/offset if needed
    skip: !activeChatId, // Don't run query if no chat is selected
  });
  const activeMessages = messagesData?.getMessages || [];
  // --- End Fetch Messages ---

  // --- Send Message Mutation ---
  const [sendMessageMutation, { loading: sendingMessage, error: sendMessageError }] = useMutation(SEND_MESSAGE, {
    // Refetch messages or update cache after sending
    refetchQueries: activeChatId ? [{ query: GET_MESSAGES, variables: { chatId: activeChatId, limit: 50 } }] : [],
    onError: (error) => {
      console.error("Error sending message:", error);
      // TODO: Show error to user
    }
  });
  // --- End Send Message Mutation ---


  // Remove mock data for messages
  // const [messages, setMessages] = useState<Record<string, Message[]>>({ ... });

  useEffect(() => {
    // Scroll to bottom of messages when active chat changes or new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, activeMessages]); // Depend on fetched messages

  const handleSendMessage = () => {
    if (!message.trim() || !activeChatId) return;

    // TODO: Get current user ID from auth state/context
    const currentUserId = 'temp-user-id'; // Replace with actual user ID

    sendMessageMutation({
      variables: {
        chatId: activeChatId,
        content: message,
        senderId: currentUserId,
      }
    });

    // Clear input after sending attempt
    setMessage('');
  };

  const filteredChats = chats.filter((chat: any) => // Use 'any' for now, replace with proper type
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keep utility functions formatTime, formatDate
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeChatId) return;
    console.log(`Starting ${type} call with chat ${activeChatId}`);
    router.push(`/calls?id=${activeChatId}&type=${type}`);
  };

  // Find active chat details from the fetched chats list
  const activeChatDetails = chats.find((c: any) => c.id === activeChatId);

  return (
    <>
      <NextSeo
        title="Chat - BrainMessenger"
        description="Chat with your contacts on BrainMessenger"
      />
      <div className="flex h-screen bg-background-light dark:bg-background-dark">
        {/* Sidebar */}
        <div className="w-80 flex flex-col border-r border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
          {/* Search */}
          <div className="p-4 border-b border-border-light dark:border-border-dark">
            {/* Search input remains the same */}
             <div className="relative">
               <input
                 type="text"
                 placeholder="Search chats"
                 className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <svg
                 className="absolute left-3 top-2.5 h-5 w-5 text-textSecondary-light dark:text-textSecondary-dark"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 20 20"
                 fill="currentColor"
               >
                 <path
                   fillRule="evenodd"
                   d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                   clipRule="evenodd"
                 />
               </svg>
             </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {chatsLoading && <p className="p-4 text-center text-textSecondary-dark">Loading chats...</p>}
            {chatsError && <p className="p-4 text-center text-error-text">Error loading chats: {chatsError.message}</p>}
            {!chatsLoading && !chatsError && filteredChats.map((chat: any) => { // Use fetched chats
              // TODO: Define proper types for chat data from GraphQL
              const lastMsg = chat.messages?.[0]; // Assuming messages are sorted desc in GET_CHATS if added
              const user = chat.user; // User who created the chat (adjust based on actual logic)

              return (
                <div
                  key={chat.id}
                  className={`flex items-center p-4 border-b border-border-light dark:border-border-dark cursor-pointer hover:bg-surface-light dark:hover:bg-background-dark ${activeChatId === chat.id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="relative">
                    <img
                      // TODO: Add avatar logic if available on user
                      src={'/avatars/default.jpg'}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* TODO: Add online status logic */}
                    {/* {chat.isOnline && ( ... )} */}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">{chat.name}</h3>
                      {/* TODO: Display time of the *actual* last message if available */}
                      {/* {lastMsg && (
                        <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )} */}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      {/* TODO: Display content of the *actual* last message */}
                      {/* {lastMsg && (
                        <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate max-w-[180px]">
                          {lastMsg.content}
                        </p>
                      )} */}
                      {/* TODO: Add unread count logic */}
                      {/* {chat.unreadCount > 0 && ( ... )} */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        {activeChatId ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
              {activeChatDetails ? (
                <>
                  <div className="flex items-center">
                    <img
                      // TODO: Add avatar logic
                      src={'/avatars/default.jpg'}
                      alt="Chat avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">
                        {activeChatDetails.name}
                      </h3>
                      {/* TODO: Add online status logic */}
                      {/* <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                        {activeChatDetails.isOnline ? 'Online' : 'Offline'}
                      </p> */}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* Call buttons remain the same */}
                     <button
                       onClick={() => handleStartCall('audio')}
                       className="p-2 rounded-full text-textSecondary-light hover:text-textPrimary-light hover:bg-surface-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark dark:hover:bg-background-dark"
                     >
                       <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                       </svg>
                     </button>
                     <button
                       onClick={() => handleStartCall('video')}
                       className="p-2 rounded-full text-textSecondary-light hover:text-textPrimary-light hover:bg-surface-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark dark:hover:bg-background-dark"
                     >
                       <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                       </svg>
                     </button>
                     <button className="p-2 rounded-full text-textSecondary-light hover:text-textPrimary-light hover:bg-surface-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark dark:hover:bg-background-dark">
                       <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                       </svg>
                     </button>
                  </div>
                </>
              ) : (
                <div className="text-textSecondary-dark">Loading chat...</div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-surface-light dark:bg-background-dark">
              {messagesLoading && <p className="text-center text-textSecondary-dark">Loading messages...</p>}
              {messagesError && <p className="text-center text-error-text">Error loading messages: {messagesError.message}</p>}
              {!messagesLoading && !messagesError && activeMessages.map((msg: any, index: number) => { // Use fetched messages
                // TODO: Get current user ID from auth state/context
                const currentUserId = 'temp-user-id'; // Replace with actual user ID
                const isMe = msg.sender.id === currentUserId; // Compare with sender ID
                const showDate = index === 0 ||
                  new Date(msg.createdAt).toDateString() !== new Date(activeMessages[index - 1].createdAt).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="px-4 py-1 rounded-full bg-surface-light dark:bg-surface-dark text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                      {!isMe && (
                        <img
                          // TODO: Add avatar logic
                          src={'/avatars/default.jpg'}
                          alt="Avatar"
                          className="h-8 w-8 rounded-full mr-2 self-end"
                        />
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'bg-primary text-textPrimary-dark' : 'bg-background-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark'} rounded-lg px-4 py-2 shadow`}>
                        {/* TODO: Add group chat name display logic if needed */}
                        {/* {activeChatDetails?.isGroup && !isMe && ( ... )} */}
                        <p>{msg.content}</p> {/* Use content instead of text */}
                        {/* TODO: Add attachment rendering logic */}
                        {/* {msg.attachments && ... } */}
                        <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} flex items-center`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {/* TODO: Add message status logic (sent/delivered/read) */}
                          {/* {isMe && ( ... )} */}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
              {/* Input area remains mostly the same, but uses handleSendMessage which now calls the mutation */}
               <div className="flex items-end">
                 <button className="p-2 rounded-full text-textSecondary-light hover:text-textPrimary-light hover:bg-surface-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark dark:hover:bg-background-dark mr-2">
                   <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                   </svg>
                 </button>
                 <button className="p-2 rounded-full text-textSecondary-light hover:text-textPrimary-light hover:bg-surface-light dark:text-textSecondary-dark dark:hover:text-textPrimary-dark dark:hover:bg-background-dark mr-2">
                   <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                   </svg>
                 </button>
                 <div className="flex-1 relative">
                   <textarea
                     placeholder="Type a message..."
                     className="w-full border border-border-light dark:border-border-dark rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none dark:bg-surface-dark dark:text-textPrimary-dark"
                     rows={1}
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     onKeyDown={handleKeyDown}
                   />
                 </div>
                 <button
                   onClick={handleSendMessage}
                   disabled={!message.trim() || sendingMessage} // Disable while sending
                   className={`ml-2 p-2 rounded-full ${message.trim() && !sendingMessage ? 'bg-primary text-textPrimary-dark hover:opacity-90' : 'bg-disabled-light text-textSecondary-light cursor-not-allowed dark:bg-disabled-dark dark:text-textSecondary-dark'}`}
                 >
                   {sendingMessage ? (
                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   ) : (
                     <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                     </svg>
                   )}
                 </button>
               </div>
               {sendMessageError && <p className="text-xs text-error-text mt-1">Failed to send message.</p>}
            </div>
          </div>
        ) : (
          // Placeholder when no chat is selected remains the same
           <div className="flex-1 flex items-center justify-center bg-surface-light dark:bg-background-dark">
             <div className="text-center">
               <svg className="mx-auto h-12 w-12 text-textSecondary-light dark:text-textSecondary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
               <h3 className="mt-2 text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">No chat selected</h3>
               <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">Select a chat from the sidebar to start messaging</p>
             </div>
           </div>
        )}
      </div>
    </>
  );
};

export default ChatPage;