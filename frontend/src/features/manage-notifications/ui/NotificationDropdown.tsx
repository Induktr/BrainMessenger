'use client';

import React, { 
  useEffect, 
  useState, 
  useCallback 
} from 'react';
import { 
  CloseModal 
} from '@/shared/assets/Icons/icons';
import { 
  NotificationDropdownProps 
} from '@/features/manage-notifications/model/notification.types';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ message, isVisible, onClose }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        handleCloseClick();
      }, 5000); // Notification visible for 5 seconds
      return () => clearTimeout(timer);
    }
    setIsShowing(false);
  }, [isVisible]);

  const handleCloseClick = useCallback(() => {
    setIsShowing(false);
    // Allow time for the fade-out animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 500); // This duration should match the CSS transition duration
  }, [onClose]);

  if (!isVisible && !isShowing) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 50,
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        transform: isShowing ? 'translateY(0)' : 'translateY(100px)',
        opacity: isShowing ? 1 : 0,
        transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
      }}
      className="p-4 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg shadow-lg flex items-center space-x-4"
    >
      {message?.sender?.avatarUrl ? (
        <img src={message.sender.avatarUrl} alt="Sender Avatar" className="w-10 h-10 rounded-full" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[var(--color-disabled)] flex items-center justify-center text-lg font-bold">
          {message?.sender?.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-grow">
        <p className="font-bold text-sm">{message?.sender?.name}</p>
        <p className="text-xs truncate">{message?.content}</p>
      </div>
      <button onClick={handleCloseClick} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
        <CloseModal alt="Close" width={16} height={16} />
      </button>
    </div>
  );
};

export default NotificationDropdown;