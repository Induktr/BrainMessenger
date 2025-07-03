import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { GET_MESSAGES, SEND_MESSAGE, UPDATE_MESSAGE } from '@/entities/message/model/message.queries';
import { GET_CHAT_DETAILS } from '@/entities/chat/model/chat.queries';
import { NEW_MESSAGE_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions';
import { useAuth } from '@/features/user-auth/ui/AuthContext';
import type { Message } from '@/entities/message/model/message.types';
import type { Chat } from '@/entities/chat/model/chat.types';
import { useChatActions } from '@/features/manage-chat/useChatActions';

export const useChat = (chatId: string | null) => {
  const { user } = useAuth();
  const client = useApolloClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<Chat | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);

  const { loading: messagesLoading, error: messagesError, data: messagesData } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
    pollInterval: 5000,
  });

  const { loading: chatLoading, error: chatError, data: chatData } = useQuery(GET_CHAT_DETAILS, {
    variables: { chatId },
    skip: !chatId,
  });

  useEffect(() => {
    if (messagesData?.getMessages) {
      setMessages(messagesData.getMessages);
    }
  }, [messagesData]);

  useEffect(() => {
    if (chatData?.chat) {
      setChatDetails(chatData.chat);
    }
  }, [chatData]);

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
    onData: ({ data }) => {
      const newMessage = data.data.newMessage;
      if (newMessage.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    },
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [updateMessageMutation] = useMutation(UPDATE_MESSAGE);

  const handleSendMessageOrUpdate = async (content: string, files: File[]) => {
    if (editingMessage) {
      await updateMessageMutation({
        variables: { messageId: editingMessage.id, content },
      });
      setEditingMessage(null);
    } else {
      await sendMessageMutation({
        variables: { chatId, content, files: files.length > 0 ? files : undefined },
      });
    }
  };

  const chatActions = useChatActions(chatId);

  return {
    messages,
    chatDetails,
    loading: messagesLoading || chatLoading,
    error: messagesError || chatError,
    editingMessage,
    setEditingMessage,
    handleSendMessageOrUpdate,
    ...chatActions,
  };
};