import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '@/entities/message/model/message.queries';
import { GET_MESSAGES } from '@/entities/message/model/message.queries';

export const useSendMessage = () => {
  const [sendMessageMutation, { loading, error }] = useMutation(SEND_MESSAGE, {
    // After sending a message, we want to refetch the messages for the current chat
    // to see the new message appear in the chat window.
    refetchQueries: [GET_MESSAGES],
    awaitRefetchQueries: true,
  });

  const sendMessage = async (chatId: string, content: string, files: File[]) => {
    try {
      await sendMessageMutation({
        variables: {
          chatId,
          content,
          files,
        },
      });
    } catch (e) {
      console.error('Error sending message:', e);
      // Re-throw the error to be caught by the caller if needed
      throw e;
    }
  };

  return { sendMessage, loading, error };
};
