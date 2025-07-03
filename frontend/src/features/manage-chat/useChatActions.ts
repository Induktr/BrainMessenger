import { useMutation } from '@apollo/client';
import {
  DELETE_CHAT_HISTORY_FOR_USER,
  DELETE_CHAT_AND_REMOVE_USER,
} from '@/entities/chat/model/chat.mutations';
import {
  SUBSCRIBE_TO_CHANNEL,
  UNSUBSCRIBE_FROM_CHANNEL,
  DELETE_CHANNEL,
} from '@/entities/channel/model/channel.queries';
import { GET_CHATS } from '@/entities/chat/model/chat.queries';

export const useChatActions = (chatId: string | null) => {
  const [deleteChatHistoryMutation] = useMutation(DELETE_CHAT_HISTORY_FOR_USER);
  const [deleteChatAndRemoveUserMutation] = useMutation(DELETE_CHAT_AND_REMOVE_USER);
  const [subscribeToChannelMutation] = useMutation(SUBSCRIBE_TO_CHANNEL);
  const [unsubscribeFromChannelMutation] = useMutation(UNSUBSCRIBE_FROM_CHANNEL);
  const [deleteChannelMutation] = useMutation(DELETE_CHANNEL, {
    refetchQueries: [{ query: GET_CHATS }],
  });

  const handleDeleteChatHistory = async () => {
    if (!chatId) return;
    await deleteChatHistoryMutation({ variables: { chatId } });
  };

  const handleDeleteUserAndChat = async () => {
    if (!chatId) return;
    await deleteChatAndRemoveUserMutation({ variables: { chatId } });
  };

  const handleSubscribeToChannel = async () => {
    if (!chatId) return;
    await subscribeToChannelMutation({ variables: { channelId: chatId } });
  };

  const handleUnsubscribeFromChannel = async () => {
    if (!chatId) return;
    await unsubscribeFromChannelMutation({ variables: { channelId: chatId } });
  };

  const handleDeleteChannel = async () => {
    if (!chatId) return;
    await deleteChannelMutation({ variables: { channelId: chatId } });
  };

  return {
    handleDeleteChatHistory,
    handleDeleteUserAndChat,
    handleSubscribeToChannel,
    handleUnsubscribeFromChannel,
    handleDeleteChannel,
  };
};