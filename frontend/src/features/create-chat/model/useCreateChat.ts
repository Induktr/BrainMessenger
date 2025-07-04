import { useMutation } from '@apollo/client';
import { GET_CHATS } from '@/entities/chat/model/chat.queries';
import { CREATE_CHAT } from '@/entities/chat/model/chat.mutations'

export const useCreateChat = () => {
  const [createChatMutation, { loading, error }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    awaitRefetchQueries: true,
  });

  const createChat = async (name: string, participantIds: string[]) => {
    try {
      const response = await createChatMutation({
        variables: {
          type: 'GROUP',
          name,
          participantIds,
        },
      });
      return response.data.createChat;
    } catch (e) {
      console.error('Error creating chat:', e);
      throw e;
    }
  };

  return { createChat, loading, error };
};
