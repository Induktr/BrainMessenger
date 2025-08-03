import { 
  useTranslation 
} from 'react-i18next';
import Input from '@/shared/ui/Input/Input';
import Image from 'next/image';
import React, { 
  useState, useEffect
} from 'react';
import { 
  useSubscription 
} from '@apollo/client';
import { 
  TYPING_STATUS_SUBSCRIPTION 
} from '@/entities/message/model/message.subscriptions';

interface TypingUser {
  id: string;
  name: string;
}

interface HeaderProps {
  title?: string;
  status?: string;
  leftIcon?: { name: string; src: string; onClick: () => void; };
  rightIcons?: { name: string; src: string; onClick: () => void; }[];
  chatId?: string;
  avatar?: string; // Add avatar prop
}

const HeaderWidget: React.FC<HeaderProps> = ({ title, status, leftIcon, rightIcons, chatId, avatar }) => {
  const { t } = useTranslation();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const { data, error } = useSubscription(TYPING_STATUS_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
  });

  useEffect(() => {
    if (error) {
      console.error(t('typingSubscriptionError'), error);
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
      return status; // Return original status if no one is typing
    }
    const names = typingUsers.map((u) => u.name).join(', ');
    const count = typingUsers.length;
    if (count > 2) {
      return t('peopleTyping', { count });
    }
    const namesString = names;
    return t('userTyping', { name: namesString, count });
  };

  const dynamicStatus = getTypingStatus();

  return (
    <header className="flex items-center justify-between p-4 bg-surface border-b border-border">
      {/* Left Section */}
      <div className="flex items-center">
        {avatar && <Image src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" width={40} height={40} />}
        <div className="flex flex-col">
          {title && <h1 className="text-lg font-semibold text-text-primary">{title}</h1>}
          {dynamicStatus && <p className="text-sm text-text-secondary">{dynamicStatus}</p>}
        </div>
      </div>

      {/* Center Section - Can be used for search or other elements if needed */}
      <div className="flex-1 mx-4">
        {!title && (
            <Input
                type="text"
                id="search"
                placeholder="Search"
                className="w-full p-2 bg-input-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {rightIcons?.map((icon, index) => (
          <div key={index} onClick={icon.onClick} className="cursor-pointer flex items-center">
            {icon.src ? (
              <Image
                src={icon.src}
                alt={icon.name}
                className="w-6 h-6 text-text-primary"
                width={24}
                height={24}
              />
            ) : (
              <span className="text-text-primary">{icon.name}</span>
            )}
          </div>
        ))}
      </div>
    </header>
  );
};

export default HeaderWidget;