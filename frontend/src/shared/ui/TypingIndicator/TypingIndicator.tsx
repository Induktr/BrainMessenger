import React, { 
  useState, 
  useEffect
} from 'react';
import { 
  useSubscription 
} from '@apollo/client';
import { 
  TYPING_STATUS_SUBSCRIPTION 
} from '@/entities/message/model/message.subscriptions';

interface TypingIndicatorProps {
  chatId: string;
}

interface TypingUser {
  id: string;
  name: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ chatId }) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { data, error } = useSubscription(TYPING_STATUS_SUBSCRIPTION, {
    variables: { chatId },
    shouldResubscribe: true,
  });

  useEffect(() => {
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

  if (typingUsers.length === 0) {
    return null; // Don't render anything if no one is typing
  }

  const names = typingUsers.map((u) => u.name).join(', ');
  const text = typingUsers.length > 1 ? `${names} are typing...` : `${names} is typing...`;

  return (
    <div className="text-sm text-gray-500 italic px-4 py-2">
      {text}
    </div>
  );
};
