'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons';
import { NotificationDropdownProps } from '@/features/manage-notifications/model/notification.types';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && message) {
      timer = setTimeout(() => {
        // Give time for animation to complete before calling onClose
        onClose();
      }, 5000); // Notification visible for 5 seconds
    }
    return () => clearTimeout(timer);
  }, [isVisible, message, onClose]);

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg z-50 flex items-center space-x-4"
          style={{ width: 'calc(100% - 32px)', maxWidth: '400px' }} // Responsive width
        >
          {message.sender?.avatarUrl ? (
            <img src={message.sender.avatarUrl} alt="Sender Avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold">
              {message.sender?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-grow">
            <p className="font-bold text-sm">{message.sender?.name}</p>
            <p className="text-xs truncate">{message.content}</p>
          </div>
          <button onClick={handleCloseClick} className="text-gray-400 hover:text-white">
            {ICONS.closeModal && <Image src={ICONS.closeModal} alt="Close" width={16} height={16} />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;