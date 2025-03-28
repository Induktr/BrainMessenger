import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CALL_HISTORY } from '../../graphql/queries'; // Import query
import { INITIATE_CALL, ACCEPT_CALL, END_CALL } from '../../graphql/mutations'; // Import mutations
// TODO: Import generated types

// Remove mock interface CallHistory

const CallsPage = () => {
  const router = useRouter();
  const { id: chatIdFromUrl, type: callTypeFromUrl } = router.query; // Get potential call initiation params
  const [activeTab, setActiveTab] = useState<'all' | 'missed'>('all');
  const [isInCall, setIsInCall] = useState(false); // State to manage if call UI is active
  const [currentCallInfo, setCurrentCallInfo] = useState<{ // Info for the active call UI
    id: string | null; // Call ID from backend after initiation
    contactName: string;
    contactAvatar: string;
    type: 'audio' | 'video';
    status: string; // e.g., 'ringing', 'in_progress'
  } | null>(null);

  // TODO: Get current user ID from authentication context/state
  const currentUserId = 'user123'; // Replace with actual dynamic user ID

  // --- Fetch Call History ---
  const { data: historyData, loading: historyLoading, error: historyError } = useQuery(GET_CALL_HISTORY, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
    pollInterval: 30000, // Optional: Poll for updates
  });
  const callHistory = historyData?.getCallHistory || [];
  // --- End Fetch Call History ---

  // --- Call Mutations ---
  const [initiateCallMutation, { loading: initiatingCall, error: initiateCallError }] = useMutation(INITIATE_CALL, {
     onCompleted: (data) => {
       console.log("Call initiated:", data);
       // Update UI state for active call
       setCurrentCallInfo({
         id: data.initiateCall.id,
         // TODO: Fetch contact name/avatar based on chatId or calleeId
         contactName: `Chat ${data.initiateCall.chatId}`, // Placeholder
         contactAvatar: '/avatars/default.jpg', // Placeholder
         type: callTypeFromUrl as 'audio' | 'video', // Assuming type came from URL param
         status: data.initiateCall.status,
       });
       setIsInCall(true);
     },
     onError: (error) => console.error("Initiate call error:", error)
  });

  const [acceptCallMutation, { loading: acceptingCall, error: acceptCallError }] = useMutation(ACCEPT_CALL, {
     // TODO: Add onCompleted/onError logic for accepting calls
  });

  const [endCallMutation, { loading: endingCall, error: endCallError }] = useMutation(END_CALL, {
     onCompleted: (data) => {
       if (data.endCall) {
         console.log("Call ended");
         setIsInCall(false);
         setCurrentCallInfo(null);
         // Optionally refetch history or navigate away
         router.replace('/calls', undefined, { shallow: true }); // Remove query params
       } else {
         console.error("Failed to end call");
       }
     },
     onError: (error) => console.error("End call error:", error)
  });
  // --- End Call Mutations ---


  // Effect to initiate call if params are present in URL
  useEffect(() => {
    if (chatIdFromUrl && callTypeFromUrl && (callTypeFromUrl === 'audio' || callTypeFromUrl === 'video') && !isInCall && !initiatingCall) {
      // TODO: Determine calleeId based on chatIdFromUrl (might require another query)
      const tempCalleeId = 'user-placeholder'; // Replace with actual logic
      if (currentUserId !== tempCalleeId) { // Don't call yourself
         console.log(`Attempting to initiate ${callTypeFromUrl} call for chat ${chatIdFromUrl}`);
         initiateCallMutation({
           variables: {
             calleeId: tempCalleeId, // This needs proper logic
             chatId: chatIdFromUrl as string,
           }
         });
      }
    }
  }, [chatIdFromUrl, callTypeFromUrl, isInCall, initiatingCall, initiateCallMutation, currentUserId]);


  // Remove mock call history data
  // const [callHistory, setCallHistory] = useState<CallHistory[]>([]);

  // Utility functions (keep formatDuration, formatTime, formatDate)
   const formatDuration = (seconds?: number) => {
     if (seconds === null || seconds === undefined) return '--';
     const minutes = Math.floor(seconds / 60);
     const remainingSeconds = seconds % 60;
     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
   };
   const formatTime = (dateString: string | Date) => {
     const date = new Date(dateString);
     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   };
   const formatDate = (dateString: string | Date) => {
     const date = new Date(dateString);
     const today = new Date();
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);
     if (date.toDateString() === today.toDateString()) return 'Today';
     if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
     return date.toLocaleDateString();
   };
  // --- End Utility Functions ---

  const handleStartCall = (contactId: string, chatId: string, callType: 'audio' | 'video') => {
    // Initiate call via mutation
    console.log(`Starting ${callType} call with contact ${contactId} in chat ${chatId}`);
     initiateCallMutation({
       variables: {
         calleeId: contactId, // Assuming contactId is the calleeId
         chatId: chatId,
       }
     });
     // UI update happens in onCompleted
  };

  const handleEndCall = () => {
    if (currentCallInfo?.id) {
      endCallMutation({ variables: { callId: currentCallInfo.id } });
    } else {
      // Fallback if call ID is somehow missing but UI is active
      setIsInCall(false);
      setCurrentCallInfo(null);
      router.replace('/calls', undefined, { shallow: true });
    }
  };

  const filteredCalls = activeTab === 'all'
    ? callHistory
    : callHistory.filter((call: any) => call.status === 'missed' || call.status === 'declined'); // Include declined in missed?

  return (
    <>
      <NextSeo
        title="Calls - BrainMessenger"
        description="View your call history on BrainMessenger"
      />

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {isInCall && currentCallInfo ? (
          // Active call view (simplified, needs WebRTC integration)
          <div className="w-full flex flex-col">
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex items-center justify-between">
              {/* Header with back/end button and contact info */}
              <div className="flex items-center">
                 <button
                   onClick={handleEndCall} // Use updated handler
                   disabled={endingCall}
                   className="mr-4 p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-900 disabled:opacity-50"
                 >
                   <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                   </svg>
                 </button>
                 <div className="flex items-center">
                   <img
                     src={currentCallInfo.contactAvatar || '/avatars/default.jpg'}
                     alt={currentCallInfo.contactName}
                     className="h-10 w-10 rounded-full object-cover"
                   />
                   <div className="ml-3">
                     <h3 className="font-medium">{currentCallInfo.contactName}</h3>
                     <p className="text-sm text-blue-200">
                       {currentCallInfo.type === 'audio' ? 'Audio call' : 'Video call'} - {currentCallInfo.status}
                     </p>
                   </div>
                 </div>
               </div>
               {/* TODO: Add call timer */}
               <div><span className="call-timer text-lg">00:00</span></div>
            </div>

            {/* Call content area (placeholder for video/audio elements) */}
            <div className="flex-1 flex items-center justify-center bg-gray-800">
               {currentCallInfo.type === 'video' ? (
                 <div className="text-center text-white">Video Call UI Placeholder</div>
               ) : (
                 <div className="text-center text-white">
                   <img
                     src={currentCallInfo.contactAvatar || '/avatars/default.jpg'}
                     alt={currentCallInfo.contactName}
                     className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                   />
                   <h2 className="text-2xl font-medium mb-2">{currentCallInfo.contactName}</h2>
                   <p className="text-gray-300">{currentCallInfo.status}...</p>
                 </div>
               )}
            </div>

             {/* Call controls */}
            <div className="bg-gray-900 p-6 flex items-center justify-center space-x-8">
               {/* TODO: Implement Mute, Speaker, Video Toggle */}
               <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600"> {/* Speaker */}
                 <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828-3.536-3.536 2.828-2.828m13.828 2.828l3.536 3.536-2.828 2.828-3.536-3.536m0 0a5 5 0 01-7.072 0" />
                 </svg>
               </button>
               <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600"> {/* Mute */}
                 <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
               </button>
               {currentCallInfo.type === 'video' && (
                 <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600"> {/* Video Toggle */}
                   <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                 </button>
               )}
               <button
                 onClick={handleEndCall} // Use updated handler
                 disabled={endingCall}
                 className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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
            {/* Header with tabs */}
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

            {/* Call list */}
            <div className="flex-1 overflow-y-auto">
              {historyLoading && <p className="p-4 text-center text-textSecondary-dark">Loading call history...</p>}
              {historyError && <p className="p-4 text-center text-error-text">Error loading history: {historyError.message}</p>}
              {!historyLoading && !historyError && filteredCalls.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full">
                   <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                   </svg>
                   <p className="mt-4 text-gray-500 dark:text-gray-400">No {activeTab === 'missed' ? 'missed ' : ''}calls</p>
                 </div>
              )}
              {!historyLoading && !historyError && filteredCalls.length > 0 && (
                <div>
                  {/* Group calls by date */}
                  {Object.entries(
                    filteredCalls.reduce((groups, call: any) => { // Use 'any' for now
                      const date = formatDate(call.createdAt); // Use createdAt
                      return {
                        ...groups,
                        [date]: [...(groups[date] || []), call]
                      };
                    }, {} as Record<string, any[]>) // Use 'any[]' for now
                  ).map(([date, calls]) => (
                    <div key={date}>
                      <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {date}
                      </div>
                      {calls.map((call: any) => { // Use 'any' for now
                        // Determine contact info based on caller/callee
                        const isOutgoing = call.callerId === currentUserId;
                        const contact = isOutgoing ? call.callee : call.caller;
                        const contactName = contact?.name || (isOutgoing ? call.calleeId : call.callerId);
                        // TODO: Fetch avatar based on contact ID
                        const contactAvatar = '/avatars/default.jpg';
                        // TODO: Determine call type (audio/video) - needs to be stored in DB
                        const callType: 'audio' | 'video' = 'audio'; // Placeholder

                        return (
                          <div
                            key={call.id}
                            className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex-shrink-0">
                              <img
                                src={contactAvatar}
                                alt={contactName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {contactName}
                                  {/* TODO: Add group call indicator if needed */}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(call.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`flex items-center text-xs ${
                                  call.status === 'missed' || call.status === 'declined' ? 'text-red-500' :
                                  'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {isOutgoing ? ( /* Outgoing arrow */
                                    <svg className="h-3 w-3 mr-1 transform -rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  ) : ( /* Incoming arrow */
                                    <svg className="h-3 w-3 mr-1 transform rotate-135" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  )}
                                  {callType === 'audio' ? 'Audio' : 'Video'} •
                                  {/* Display status or duration */}
                                  {call.status === 'answered' || call.status === 'in_progress' || call.status === 'ended' ? ` ${formatDuration(call.duration)}` : ` ${call.status}`}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex space-x-2">
                              {/* Call back buttons */}
                               <button
                                 onClick={() => handleStartCall(contact.id, call.chatId, 'audio')}
                                 className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                               >
                                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                 </svg>
                               </button>
                               <button
                                 onClick={() => handleStartCall(contact.id, call.chatId, 'video')}
                                 className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                               >
                                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                 </svg>
                               </button>
                            </div>
                          </div>
                        );
                      })}
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

// Wrap with Apollo Provider if not done globally in _app.tsx
// const CallsPageWithApollo = () => (
//   <AppApolloProvider>
//     <CallsPage />
//   </AppApolloProvider>
// );
// export default CallsPageWithApollo;

export default CallsPage; // Assuming ApolloProvider is in _app.tsx