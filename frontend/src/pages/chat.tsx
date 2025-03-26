import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'file' | 'audio';
    url: string;
    name?: string;
    size?: number;
  }[];
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: {
    text: string;
    timestamp: Date;
  };
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
  members?: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

const ChatPage = () => {
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock data for chats
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      lastMessage: {
        text: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      unreadCount: 2,
      isOnline: true,
      isGroup: false
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg',
      lastMessage: {
        text: "Let me know when you're free",
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      unreadCount: 0,
      isOnline: false,
      isGroup: false
    },
    {
      id: '3',
      name: 'Team Project',
      avatar: '/avatars/group.jpg',
      lastMessage: {
        text: "Alice: I've uploaded the files",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      unreadCount: 5,
      isOnline: true,
      isGroup: true,
      members: [
        { id: '101', name: 'Alice', avatar: '/avatars/alice.jpg' },
        { id: '102', name: 'Bob', avatar: '/avatars/bob.jpg' },
        { id: '103', name: 'Charlie', avatar: '/avatars/charlie.jpg' }
      ]
    }
  ]);
  
  // Mock data for messages
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '101',
        senderId: '1',
        text: 'Hey there!',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        status: 'read'
      },
      {
        id: '102',
        senderId: 'me',
        text: 'Hi John! How are you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        status: 'read'
      },
      {
        id: '103',
        senderId: '1',
        text: "I'm doing great! Just wanted to check in.",
        timestamp: new Date(Date.now() - 1000 * 60 * 6),
        status: 'read'
      },
      {
        id: '104',
        senderId: '1',
        text: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'delivered'
      }
    ],
    '2': [
      {
        id: '201',
        senderId: '2',
        text: 'Hi there, do you have time to meet today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
        status: 'read'
      },
      {
        id: '202',
        senderId: 'me',
        text: "I'm a bit busy today. How about tomorrow?",
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        status: 'read'
      },
      {
        id: '203',
        senderId: '2',
        text: "Sure, that works. Let me know when you're free",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'read'
      }
    ],
    '3': [
      {
        id: '301',
        senderId: '101',
        text: "Hey team, I've been working on the design",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: 'read'
      },
      {
        id: '302',
        senderId: '102',
        text: "Looks great Alice! I'll review it soon",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        status: 'read'
      },
      {
        id: '303',
        senderId: 'me',
        text: 'I can help with the implementation part',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.2),
        status: 'read'
      },
      {
        id: '304',
        senderId: '101',
        text: "I've uploaded the files",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'delivered',
        attachments: [
          {
            type: 'file',
            url: '/files/design.zip',
            name: 'design.zip',
            size: 2400000
          }
        ]
      }
    ]
  });

  useEffect(() => {
    // Scroll to bottom of messages when active chat changes or new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage: Message = {
      id: `new-${Date.now()}`,
      senderId: 'me',
      text: message,
      timestamp: new Date(),
      status: 'sent'
    };

    // Update messages
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));

    // Update last message in chat list
    setChats(prev => 
      prev.map(chat => 
        chat.id === activeChat 
          ? {
              ...chat,
              lastMessage: {
                text: message,
                timestamp: new Date()
              }
            }
          : chat
      )
    );

    // Clear input
    setMessage('');
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
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
    if (!activeChat) return;
    // In a real app, this would initiate a call
    console.log(`Starting ${type} call with chat ${activeChat}`);
    // Navigate to call page
    router.push(`/calls?id=${activeChat}&type=${type}`);
  };

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
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 border-b border-border-light dark:border-border-dark cursor-pointer hover:bg-surface-light dark:hover:bg-background-dark ${activeChat === chat.id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="relative">
                  <img
                    src={chat.avatar || '/avatars/default.jpg'}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">{chat.name}</h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {chat.lastMessage && (
                      <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate max-w-[180px]">
                        {chat.lastMessage.text}
                      </p>
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-primary text-textPrimary-dark text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark">
              <div className="flex items-center">
                <img
                  src={chats.find(c => c.id === activeChat)?.avatar || '/avatars/default.jpg'}
                  alt="Chat avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    {chats.find(c => c.id === activeChat)?.name}
                  </h3>
                  <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                    {chats.find(c => c.id === activeChat)?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
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
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-surface-light dark:bg-background-dark">
              {messages[activeChat]?.map((msg, index) => {
                const isMe = msg.senderId === 'me';
                const showDate = index === 0 || 
                  new Date(msg.timestamp).toDateString() !== new Date(messages[activeChat][index - 1].timestamp).toDateString();
                
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="px-4 py-1 rounded-full bg-surface-light dark:bg-surface-dark text-xs text-textSecondary-light dark:text-textSecondary-dark">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                      {!isMe && (
                        <img
                          src={chats.find(c => c.id === activeChat)?.isGroup
                            ? chats.find(c => c.id === activeChat)?.members?.find(m => m.id === msg.senderId)?.avatar || '/avatars/default.jpg'
                            : chats.find(c => c.id === activeChat)?.avatar || '/avatars/default.jpg'
                          }
                          alt="Avatar"
                          className="h-8 w-8 rounded-full mr-2 self-end"
                        />
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'bg-primary text-textPrimary-dark' : 'bg-background-light dark:bg-surface-dark text-textPrimary-light dark:text-textPrimary-dark'} rounded-lg px-4 py-2 shadow`}>
                        {chats.find(c => c.id === activeChat)?.isGroup && !isMe && (
                          <p className="text-xs font-medium mb-1 text-blue-400">
                            {chats.find(c => c.id === activeChat)?.members?.find(m => m.id === msg.senderId)?.name}
                          </p>
                        )}
                        <p>{msg.text}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2">
                            {msg.attachments.map((attachment, i) => (
                              <div key={i} className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded mt-1">
                                <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{attachment.name}</p>
                                  <p className="text-xs text-gray-500">{((attachment.size || 0) / 1024 / 1024).toFixed(1)} MB</p>
                                </div>
                                <button className="text-blue-500 hover:text-blue-700 text-xs">Download</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} flex items-center`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMe && (
                            <span className="ml-1">
                              {msg.status === 'sent' && '✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'read' && (
                                <span className="text-blue-300">✓✓</span>
                              )}
                            </span>
                          )}
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
                  disabled={!message.trim()}
                  className={`ml-2 p-2 rounded-full ${message.trim() ? 'bg-primary text-textPrimary-dark hover:opacity-90' : 'bg-disabled-light text-textSecondary-light cursor-not-allowed dark:bg-disabled-dark dark:text-textSecondary-dark'}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
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