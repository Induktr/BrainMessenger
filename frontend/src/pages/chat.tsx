import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client'; // Import Apollo hooks
import { GET_CHATS, GET_CHAT, GET_MESSAGES } from '../../graphql/queries'; // Import queries
import { SEND_MESSAGE } from '../../graphql/mutations'; // Import mutations
// TODO: Import generated types for queries/mutations if available
import SettingsSidebar from '../components/SettingsSidebar'; // Main sidebar content
import MenuSettings from '../components/MenuSettings'; // Detailed settings menu component

// Remove mock interfaces, rely on GraphQL types or generated types
// interface Message { ... }
// interface Chat { ... }

const ChatPage = () => {
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOverlayOpen, setIsSidebarOverlayOpen] = useState(false); // State for initial sidebar overlay
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for centered settings modal
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Fetch Chat List ---
  const { data: chatsData, loading: chatsLoading, error: chatsError } = useQuery(GET_CHATS);
  const chats = chatsData?.getChats || []; // Use fetched data, default to empty array
  console.log('Chats Data:', chatsData); // DEBUG
  console.log('Chats Loading:', chatsLoading); // DEBUG
  console.log('Chats Error:', chatsError); // DEBUG
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

  const toggleSidebarOverlay = () => {
    setIsSidebarOverlayOpen(!isSidebarOverlayOpen);
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  // Handles clicks from the initial SettingsSidebar overlay
  const handleNavigateRequest = (path: string) => {
    setIsSidebarOverlayOpen(false); // Close the initial overlay first
    if (path === '/settings') {
      setIsSettingsModalOpen(true); // Open the modal
    } else {
      console.log("Navigate to:", path); // Handle other actions if needed
      // Potentially navigate using router if path is not '/settings'
      // router.push(path);
    }
  };

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

 // TODO: Replace with actual user data from context/auth
 const currentUser = {
    name: 'Nikits',
    email: 'lvdf190@gmail.com',
    username: '@Nikits',
    avatarUrl: '/avatars/default.jpg', // Placeholder
  };

  return (
    <>
      <NextSeo
        title="Chat - BrainMessenger"
        description="Chat with your contacts on BrainMessenger"
      />
      {/* Main container with fixed height */}
      <div className="flex h-screen bg-background-light dark:bg-background-dark text-textPrimary-light dark:text-textPrimary-dark">
        {/* Sidebar */}
        {/* TODO: Adjust width if needed based on final design, e.g., w-72 or w-96 */}
        <div className="relative w-80 flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"> {/* Added relative */}
          {/* NEW: Sidebar Header Component Placeholder */}
          {/* <SidebarHeader onMenuClick={toggleSidebarView} /> */}
          <div className="p-4 border-b border-border-light dark:border-border-dark">
             {/* Placeholder for SidebarHeader content */}
             <div className="flex items-center"> {/* Removed mb-4 */}
                <button onClick={toggleSidebarOverlay} className="mr-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"> {/* Changed to toggleSidebarOverlay */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_743_311)">
<path d="M20.8034 13.4583L20.813 13.4579C22.5735 13.3845 23.8834 14.7692 23.9414 16.4959C23.9495 16.7367 23.9434 16.9797 23.9432 17.2207L23.9429 19.7329C23.9441 20.8348 23.9114 21.6526 23.1152 22.5087C22.5644 23.1009 21.9464 23.3886 21.1348 23.4173C19.5941 23.5232 18.1217 22.1835 18.0105 20.6604C17.9917 20.4032 18.0038 20.1392 18.0039 19.881L18.0041 17.0948C18.0036 16.7244 17.9853 16.3322 18.0518 15.9674C18.3009 14.6008 19.3933 13.5472 20.8034 13.4583Z" fill="#B0B0B0"/>
<path d="M20.757 0.362588C20.8359 0.343768 21.2659 0.344284 21.3494 0.350703C22.6616 0.451631 23.7817 1.63472 23.9293 2.91824C23.9521 3.1171 23.9375 3.32786 23.9367 3.528L23.9374 6.47159C23.9374 7.66493 24.0253 8.31007 23.2431 9.29229C22.7402 9.92365 22.0094 10.2792 21.2108 10.3707C20.4713 10.4081 19.8138 10.2341 19.2068 9.79432C18.1246 9.0101 17.9981 8.08573 17.9982 6.82385L17.9985 5.74906C17.9982 4.91009 17.9836 4.06863 17.9998 3.22997C18.0281 1.75437 19.233 0.32737 20.757 0.362588Z" fill="#B0B0B0"/>
<path d="M11.4642 17.8619C13.7014 17.6124 15.3333 19.6185 14.5129 21.7641C14.3831 22.1036 14.1762 22.3633 13.917 22.6212C13.0405 23.4934 12.2644 23.4617 11.123 23.4613L3.39692 23.4609C2.42138 23.4684 1.58054 23.2395 0.880942 22.5109C-0.172302 21.4139 -0.0965851 19.6055 1.00166 18.57C1.81697 17.8012 2.69608 17.8612 3.7273 17.8621L9.54257 17.8619C10.1814 17.8619 10.8258 17.8438 11.4642 17.8619Z" fill="#B0B0B0"/>
<path d="M2.87804 9.12023C3.56535 9.10692 4.25585 9.12 4.94354 9.12005L11.0206 9.11991C11.4997 9.11962 11.9969 9.09141 12.4704 9.17466C13.2434 9.31064 14.0104 9.8588 14.4043 10.536C14.8179 11.2471 14.8122 12.2674 14.5221 13.0209C14.1122 14.0858 13.1017 14.6826 11.9806 14.7371L3.9565 14.7373C2.77839 14.7373 2.03605 14.836 1.11028 14.0456C-0.0447735 13.0594 -0.192685 11.271 0.800184 10.1167C1.33448 9.49547 2.06737 9.17841 2.87804 9.12023Z" fill="#B0B0B0"/>
<path d="M2.67698 0.362808C2.88307 0.353152 3.09417 0.362333 3.30085 0.362543L11.7187 0.362387C12.2783 0.361751 12.7976 0.398667 13.3004 0.683898C15.4886 1.92527 15.1555 5.05215 12.8565 5.8592C12.6492 5.93195 12.4338 5.96556 12.2219 6.0204C11.9777 5.99879 11.7198 6.01998 11.4737 6.02026L3.48463 6.02092C2.69985 6.02124 2.0116 6.00606 1.34105 5.51326C-0.70156 4.01201 -0.114257 0.771596 2.67698 0.362808Z" fill="#B0B0B0"/>
</g>
<defs>
<clipPath id="clip0_743_311">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>

                </button>
                {/* Search input - moved inside header conceptually */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search" // Updated placeholder
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-border-light dark:border-border-dark focus:outline-none focus:ring-1 focus:ring-primary dark:bg-background-dark dark:text-textPrimary-dark" // Adjusted styling slightly
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
          </div>
          {/* End Placeholder for SidebarHeader */}
         {/* Main Sidebar Content (Chat List) */}
         {/* Removed the old conditional rendering logic for settings here */}
         <div className="flex-1 flex flex-col overflow-hidden"> {/* Ensure parent takes space */}
              {/* "All chats" Title */}
              {/* "All chats" Title with Active Indicator */}
              <div className="px-4 pt-4 pb-2">
                <h2 className="text-xs font-semibold uppercase text-textSecondary-light dark:text-textSecondary-dark tracking-wide relative inline-block">
                  All chats
                  {/* Active indicator line */}
                  <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-gradient-to-r from-primary-light to-success-light dark:from-primary-dark dark:to-success-dark"></span>
                </h2>
              </div>
              {/* Removed extra </h2> tag that was here */}

              {/* Chat list - Make it scrollable */}
              <div className="flex-1 overflow-y-auto">
              {chatsLoading && <p className="p-4 text-center text-textSecondary-dark">Loading chats...</p>}
              {chatsError && <p className="p-4 text-center text-error-text">Error loading chats: {chatsError.message}</p>}
              {!chatsLoading && !chatsError && filteredChats.map((chat: any) => {
                // TODO: Fetch actual last message, time, unread count from chat data
                const lastMessagePreview = chat.lastMessage?.content || "Communication starts here, start with us!";
                const lastMessageTime = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : "00:00";
                const unreadCount = chat.unreadCount || 1; // Use actual unread count if available

                return (
                  // TODO: Extract to ChatListItem component
                  <div
                    key={chat.id}
                    // Adjusted padding and border
                    className={`flex items-center px-4 py-2.5 border-b border-border-light dark:border-border-dark cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${activeChatId === chat.id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="relative mr-3 flex-shrink-0">
                      <img
                        src={chat.avatarUrl || '/avatars/default.jpg'} // Use chat avatar if available
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {/* TODO: Add online status indicator */}
                      {/* {chat.isOnline && ( <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-surface-dark"></span> )} */}
                    </div>
                    <div className="flex-1 min-w-0"> {/* Ensure text truncation works */}
                      <div className="flex justify-between items-center mb-0.5"> {/* Reduced margin */}
                        <h3 className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark truncate">{chat.name}</h3>
                        <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark flex-shrink-0 ml-2">
                          {lastMessageTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate pr-2"> {/* Added padding right */}
                          {lastMessagePreview}
                        </p>
                        {unreadCount > 0 && (
                          // Adjusted badge style
                          <span className="ml-2 flex-shrink-0 bg-gradient-to-r from-primary-light to-success-light dark:from-primary-dark dark:to-success-dark text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              {/* End Chat list */}
            </div>

        </div>
        {/* End Sidebar */}

        {/* Chat area */}
        {activeChatId ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between py-4 px-0 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
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
            <div className="flex-1 overflow-y-auto py-4 px-0 bg-surface-light dark:bg-background-dark">
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
            <div className="py-4 px-0 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
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
               {/* Re-applying placeholder text fix */}
               <h3 className="mt-2 text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">Communication starts here, start with us!</h3>
               {/* Removed the sub-text */}
               {/* <p className="mt-1 text-sm text-textSecondary-light dark:text-textSecondary-dark">Select a chat from the sidebar to start messaging</p> */}
             </div>
     
           {/* Initial Sidebar Overlay (for main menu) */}
           {isSidebarOverlayOpen && (
             <>
               {/* Backdrop */}
               <div className="fixed inset-0 bg-black bg-opacity-20 z-10" onClick={toggleSidebarOverlay}></div>
               {/* Settings Sidebar Panel */}
               <div className="fixed top-0 left-0 h-full w-80 z-20 bg-surface-light dark:bg-surface-dark shadow-lg">
                 {/* Pass the new handler */}
                 <SettingsSidebar onNavigateRequest={handleNavigateRequest} />
               </div>
             </>
           )}

           {/* Centered Settings Modal */}
           {isSettingsModalOpen && (
             <>
               {/* Backdrop */}
               <div className="fixed inset-0 bg-black bg-opacity-20 z-30" onClick={toggleSettingsModal}></div>
               {/* Centered Modal Container */}
               <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                 {/* Modal Content */}
                 <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                   {/* Pass the correct close handler */}
                   <MenuSettings user={currentUser} onClose={toggleSettingsModal} />
                 </div>
               </div>
             </>
           )}
           </div>
        )}
      </div>
    </>
  );
};

export default ChatPage;