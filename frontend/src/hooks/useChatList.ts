import { useQuery } from '@apollo/client';
import { GET_CHATS } from '@/entities/chat/model/chat.queries';

export const useChatList = () => {
  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    pollInterval: 10000, // Poll for new chats/messages every 10 seconds
  });

  return {
    chats: data?.getChats || [],
    loading,
    error,
    refetch,
  };
};