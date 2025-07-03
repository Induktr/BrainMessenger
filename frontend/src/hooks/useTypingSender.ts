import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { SET_USER_TYPING } from '@/entities/message/model/message.mutations';

export const useTypingSender = (chatId: string, isTyping: boolean) => {
  const [setUserTyping] = useMutation(SET_USER_TYPING);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typingRef = useRef(isTyping);

  useEffect(() => {
    typingRef.current = isTyping;
    if (isTyping) {
      // Only send the mutation if the user wasn't typing before
      if (!typingRef.current) {
        setUserTyping({ variables: { chatId, isTyping: true } });
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (typingRef.current) {
          setUserTyping({ variables: { chatId, isTyping: false } });
          typingRef.current = false;
        }
      }, 3000); // 3 seconds of inactivity
    }
  }, [isTyping, chatId, setUserTyping]);

  useEffect(() => {
    return () => {
      // When the component unmounts, if the user was typing, send a final 'isTyping: false'
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (typingRef.current) {
        setUserTyping({ variables: { chatId, isTyping: false } });
      }
    };
  }, [chatId, setUserTyping]);
};
