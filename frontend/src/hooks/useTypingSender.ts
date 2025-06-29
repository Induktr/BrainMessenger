import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { SET_USER_TYPING } from '../graphql/mutations';
import { useDebounce } from 'use-debounce';

export const useTypingSender = (chatId: string, typing: boolean) => {
  const [setUserTyping] = useMutation(SET_USER_TYPING);
  const [debouncedTyping] = useDebounce(typing, 1000); // Debounce for 1 second

  useEffect(() => {
    if (!chatId) return;

    setUserTyping({
      variables: {
        chatId,
        isTyping: debouncedTyping,
      },
    }).catch((error) => {
      console.error('Error sending typing status:', error);
    });

    // Cleanup: when the component unmounts or typing stops, send a final 'isTyping: false'
    return () => {
      if (debouncedTyping) {
        setUserTyping({
          variables: {
            chatId,
            isTyping: false,
          },
        });
      }
    };
  }, [chatId, debouncedTyping, setUserTyping]);
};
