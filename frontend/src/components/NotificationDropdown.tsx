'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { icons } from '@/app/lib/constants';

interface Notification {
  id: string;
  senderName: string;
  messageSnippet: string;
  avatarUrl?: string | null;
}

interface NotificationDropdownProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Give time for animation to complete before calling onClose
        setTimeout(onClose, 500); 
      }, 5000); // Notification visible for 5 seconds
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose]);

  const handleCloseClick = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 500); // Ensure animation completes
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg z-50 flex items-center space-x-4"
          style={{ width: 'calc(100% - 32px)', maxWidth: '400px' }} // Responsive width
        >
          {notification.avatarUrl ? (
            <img src={notification.avatarUrl} alt="Sender Avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold">
              {notification.senderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-grow">
            <p className="font-bold text-sm">{notification.senderName}</p>
            <p className="text-xs truncate">{notification.messageSnippet}</p>
          </div>
          <button onClick={handleCloseClick} className="text-gray-400 hover:text-white">
            {icons.closeModal && <Image src={icons.closeModal} alt="Close" width={16} height={16} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;