import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { AppApolloProvider } from '../../providers/ApolloProvider';

interface CallHistory {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'declined' | 'busy';
  duration?: number; // in seconds
  timestamp: Date;
  isGroup: boolean;
  participants?: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

const CallsPage = () => {
  const router = useRouter();
  const { id, type } = router.query;
  const [activeTab, setActiveTab] = useState<'all' | 'missed'>('all');
  const [isInCall, setIsInCall] = useState(false);
  const [currentCall, setCurrentCall] = useState<{
    id: string;
    name: string;
    avatar: string;
    type: 'audio' | 'video';
    isGroup: boolean;
    participants?: {
      id: string;
      name: string;
      avatar: string;
    }[];
  } | null>(null);
  
  // Mock call history data
  const [callHistory, setCallHistory] = useState<CallHistory[]>([
    {
      id: 'call1',
      contactId: '1',
      contactName: 'John Doe',
      contactAvatar: '/avatars/john.jpg',
      type: 'audio',
      direction: 'incoming',
      status: 'answered',
      duration: 125, // 2 minutes 5 seconds
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isGroup: false
    },
    {
      id: 'call2',
      contactId: '2',
      contactName: 'Jane Smith',
      contactAvatar: '/avatars/jane.jpg',
      type: 'video',
      direction: 'outgoing',
      status: 'answered',
      duration: 304, // 5 minutes 4 seconds
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      isGroup: false
    },
    {
      id: 'call3',
      contactId: '1',
      contactName: 'John Doe',
      contactAvatar: '/avatars/john.jpg',
      type: 'audio',
      direction: 'incoming',
      status: 'missed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      isGroup: false
    },
    {
      id: 'call4',
      contactId: '3',
      contactName: 'Team Project',
      contactAvatar: '/avatars/group.jpg',
      type: 'video',
      direction: 'outgoing',
      status: 'answered',
      duration: 1832, // 30 minutes 32 seconds
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isGroup: true,
      participants: [
        { id: '101', name: 'Alice', avatar: '/avatars/alice.jpg' },
        { id: '102', name: 'Bob', avatar: '/avatars/bob.jpg' },
        { id: '103', name: 'Charlie', avatar: '/avatars/charlie.jpg' }
      ]
    },
    {
      id: 'call5',
      contactId: '4',
      contactName: 'Sarah Johnson',
      contactAvatar: '/avatars/sarah.jpg',
      type: 'audio',
      direction: 'outgoing',
      status: 'declined',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isGroup: false
    }
  ]);

  // Check if we should start a call based on URL params
  useEffect(() => {
    if (id && type && (type === 'audio' || type === 'video')) {
      // Find the contact/group info
      const contactId = id as string;
      const callType = type as 'audio' | 'video';
      
      // Mock data - in a real app, you would fetch this from your backend
      const contacts = [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg', isGroup: false },
        { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg', isGroup: false },
        { id: '3', name: 'Team Project', avatar: '/avatars/group.jpg', isGroup: true, participants: [
          { id: '101', name: 'Alice', avatar: '/avatars/alice.jpg' },
          { id: '102', name: 'Bob', avatar: '/avatars/bob.jpg' },
          { id: '103', name: 'Charlie', avatar: '/avatars/charlie.jpg' }
        ]}
      ];
      
      const contact = contacts.find(c => c.id === contactId);
      
      if (contact) {
        setCurrentCall({
          id: contactId,
          name: contact.name,
          avatar: contact.avatar,
          type: callType,
          isGroup: contact.isGroup,
          participants: contact.participants
        });
        setIsInCall(true);
      }
    }
  }, [id, type]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const handleStartCall = (contactId: string, callType: 'audio' | 'video') => {
    // In a real app, this would initiate a call
    router.push(`/calls?id=${contactId}&type=${callType}`);
  };

  const handleEndCall = () => {
    // In a real app, this would end the current call
    setIsInCall(false);
    setCurrentCall(null);
    router.push('/calls');
  };

  const filteredCalls = activeTab === 'all' 
    ? callHistory 
    : callHistory.filter(call => call.status === 'missed');

  return (
    <>
        <NextSeo
          title="Profile - BrainMessenger"
          description="Your profile on BrainMessenger"
        />

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {isInCall ? (
          // Active call view
          <div className="w-full flex flex-col">
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={handleEndCall}
                  className="mr-4 p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-900"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="flex items-center">
                  <img 
                    src={currentCall?.avatar || '/avatars/default.jpg'} 
                    alt={currentCall?.name} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium">{currentCall?.name}</h3>
                    <p className="text-sm text-blue-200">
                      {currentCall?.type === 'audio' ? 'Audio call' : 'Video call'}
                      {currentCall?.isGroup ? ' • Group' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <span className="call-timer text-lg">00:00</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              {currentCall?.type === 'video' ? (
                <div className="relative w-full h-full">
                  {/* Main video (remote participant) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={currentCall.avatar} 
                      alt={currentCall.name}
                      className="w-32 h-32 rounded-full object-cover opacity-20"
                    />
                    <div className="absolute text-white text-center">
                      <p className="text-xl font-medium">{currentCall.name}</p>
                      <p className="text-sm">Connecting...</p>
                    </div>
                  </div>
                  
                  {/* Self view */}
                  <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src="/avatars/default.jpg" 
                        alt="You"
                        className="w-16 h-16 rounded-full object-cover opacity-50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <img 
                    src={currentCall?.avatar || '/avatars/default.jpg'} 
                    alt={currentCall?.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                  />
                  <h2 className="text-2xl font-medium mb-2">{currentCall?.name}</h2>
                  <p className="text-gray-300">Connecting...</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-900 p-6 flex items-center justify-center space-x-8">
              <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828-3.536-3.536 2.828-2.828m13.828 2.828l3.536 3.536-2.828 2.828-3.536-3.536m0 0a5 5 0 01-7.072 0" />
                </svg>
              </button>
              <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              {currentCall?.type === 'video' && (
                <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              <button 
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8m-8-4h8" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Call history view
          <div className="w-full flex flex-col">
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-medium text-gray-900 dark:text-white">Calls</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'all'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('missed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'missed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Missed
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No {activeTab === 'missed' ? 'missed ' : ''}calls</p>
                </div>
              ) : (
                <div>
                  {/* Group calls by date */}
                  {Object.entries(
                    filteredCalls.reduce((groups, call) => {
                      const date = formatDate(call.timestamp);
                      return {
                        ...groups,
                        [date]: [...(groups[date] || []), call]
                      };
                    }, {} as Record<string, CallHistory[]>)
                  ).map(([date, calls]) => (
                    <div key={date}>
                      <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {date}
                      </div>
                      {calls.map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={call.contactAvatar || '/avatars/default.jpg'}
                              alt={call.contactName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {call.contactName}
                                {call.isGroup && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">• Group</span>}
                              </h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(call.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <span className={`flex items-center text-xs ${
                                call.status === 'missed' ? 'text-red-500' : 
                                call.status === 'declined' ? 'text-orange-500' : 
                                'text-gray-500 dark:text-gray-400'
                              }`}>
                                {call.direction === 'incoming' ? (
                                  <svg className="h-3 w-3 mr-1 transform rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3 mr-1 transform -rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {call.type === 'audio' ? 'Audio' : 'Video'} • 
                                {call.status === 'answered' ? ` ${formatDuration(call.duration)}` : ` ${call.status.charAt(0).toUpperCase() + call.status.slice(1)}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                              onClick={() => handleStartCall(call.contactId, 'audio')}
                              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleStartCall(call.contactId, 'video')}
                              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CallsPage;