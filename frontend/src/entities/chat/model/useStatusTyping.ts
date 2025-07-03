import { useSubscription } from '@apollo/client';
import { TYPING_STATUS_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions';
import React from 'react';
import type { TypingUser } from '@/entities/message/model/message.types';

const useStatusTyping = (chatId: string, status: string) => {
  const [typingUsers, setTypingUsers] = React.useState<TypingUser[]>([]);
  const { data, error } = useSubscription(TYPING_STATUS_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
  });

  React.useEffect(() => {
    if (error) {
      console.error('Typing subscription error:', error);
      return;
    }
    if (data?.typingStatus) {
      const { user, isTyping } = data.typingStatus;
      setTypingUsers((currentUsers) => {
        const userExists = currentUsers.some((u) => u.id === user.id);
        if (isTyping && !userExists) {
          return [...currentUsers, user];
        }
        if (!isTyping && userExists) {
          return currentUsers.filter((u) => u.id !== user.id);
        }
        return currentUsers;
      });
    }
  }, [data, error]);

  const getTypingStatus = () => {
    if (typingUsers.length === 0) {
      return status;
    }
    const names = typingUsers.map((u) => u.name).join(', ');
    return typingUsers.length > 2
      ? `${typingUsers.length} people are typing...`
      : `${names} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`;
  };

  const dynamicStatus = getTypingStatus(); 

  return { typingUsers, dynamicStatus };
}

export default useStatusTyping;

