import React from 'react';
import Input from '@/components/Input';
import Image from 'next/image';

import { useState, useEffect } from 'react';
import Button from './Button';
import { useSubscription } from '@apollo/client';
import { TYPING_STATUS_SUBSCRIPTION } from '@/graphql/subscriptions';

interface TypingUser {
  id: string;
  name: string;
}

interface HeaderProps {
  title?: string; // Optional title for pages without a search bar
  status?: string; // Optional status for chat header
  rightIcons?: { name: string; onClick: () => void; }[]; // Optional array of right-aligned icons
  chatId?: string;
}

const Header: React.FC<HeaderProps> = ({ title, status, rightIcons, chatId }) => {
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
      {/* Left Section: Menu Icon Placeholder */}
      <Image src="" alt="menu" className="header-icon" /> {/* Using the reusable Icon component */}

      {/* Center Section: Title or Search Bar Placeholder */}
      <div className="header-center-section">
        {title ? (
          <>
            <h1 className="header-title">{title}</h1>
            {dynamicStatus && <span className="header-status">{dynamicStatus}</span>} {/* Display dynamic status */}
          </>
        ) : (
          <Input
            type="text"
            placeholder="Search"
            className="header-search-input"
          />
        )}
      </div>

      {/* Right Section: Action Icons Placeholder */}
      <div className="header-right-section">

        {rightIcons && rightIcons.map((icon, index) => (
          <Image src="" key={index} alt={icon.name} className="header-icon" onClick={icon.onClick} />
        ))}
      </div>
    </header>
  );
};

export default Header;