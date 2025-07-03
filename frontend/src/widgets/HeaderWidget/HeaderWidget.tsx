import React from 'react';
import Input from '@/shared/ui/Input/Input';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { TYPING_STATUS_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions';

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
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const { data, error } = useSubscription(TYPING_STATUS_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
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

  const getTypingStatus = () => {
    if (typingUsers.length === 0) {
      return status; // Return original status if no one is typing
    }
    const names = typingUsers.map((u) => u.name).join(', ');
    return typingUsers.length > 2
      ? `${typingUsers.length} people are typing...`
      : `${names} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`;
  };

  const dynamicStatus = getTypingStatus();

  return (
    <header className="app-header">
      {/* Left Section */}
      <div className="header-left-section">
        {avatar && <Image src={avatar} alt="User Avatar" className="header-avatar" width={40} height={40} />}
        <div className="header-user-info">
          {title && <h1 className="header-title">{title}</h1>}
          {dynamicStatus && <p className="header-status">{dynamicStatus}</p>}
        </div>
      </div>

      {/* Center Section - Can be used for search or other elements if needed */}
      <div className="header-center-section">
        {!title && (
            <Input
                type="text"
                placeholder="Search"
                className="header-search-input"
            />
        )}
      </div>

      {/* Right Section */}
      <div className="header-right-section">
        {rightIcons?.map((icon, index) => (
          <div key={index} onClick={icon.onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {icon.src ? (
              <Image
                src={icon.src}
                alt={icon.name}
                className="header-icon"
                width={24}
                height={24}
              />
            ) : (
              <span className="header-icon-text">{icon.name}</span>
            )}
          </div>
        ))}
      </div>
    </header>
  );
};

export default HeaderWidget;