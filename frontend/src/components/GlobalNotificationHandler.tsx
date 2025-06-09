'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { NEW_MESSAGE_SUBSCRIPTION } from '@/graphql/queries';
import { useAuth } from '@/context/AuthContext';
import { useChatId } from '@/context/ChatIdContext'; // Import useChatId
import NotificationDropdown from '@/components/NotificationDropdown';
 
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
 
const GlobalNotificationHandler: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<Message | null>(null);
  const { user: currentUser } = useAuth(); // Get current user from AuthContext
  const { chatId } = useChatId(); // Get chatId from context
 
  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId }, // Pass chatId as a variable
    skip: !chatId, // Skip subscription if chatId is not available
    onData: ({ data }) => {
      console.log('[GlobalNotificationHandler] Subscription onData received:', data);
      if (data && data.data && data.data.newMessage) {
        const incomingMessage = data.data.newMessage;
        console.log('[GlobalNotificationHandler] Incoming message:', incomingMessage);
        // Only show notification if the message is not from the current user
        if (currentUser && incomingMessage.sender.id !== currentUser.id) {
          console.log('[GlobalNotificationHandler] Showing notification for message from:', incomingMessage.sender.name);
          setNotificationMessage(incomingMessage);
          setShowNotification(true);
        } else {
          console.log('[GlobalNotificationHandler] Not showing notification: Message from current user or no current user.', incomingMessage.sender.id, currentUser?.id);
        }
      } else {
        console.log('[GlobalNotificationHandler] No new message data in subscription payload.');
      }
    },
    onError: (error) => {
      console.error('[GlobalNotificationHandler] Subscription error:', error);
    },
    onComplete: () => {
      console.log('[GlobalNotificationHandler] Subscription completed.');
    },
  });

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationMessage(null);
  };

  return (
    <NotificationDropdown
      message={notificationMessage}
      isVisible={showNotification}
      onClose={handleCloseNotification}
    />
  );
};

export default GlobalNotificationHandler;