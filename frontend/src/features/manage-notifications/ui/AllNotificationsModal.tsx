'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { Notification } from '@/features/manage-notifications/model/notification.types';

interface AllNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[]; // This will hold all past notifications
}

const AllNotificationsModal: React.FC<AllNotificationsModalProps> = ({ isOpen, onClose, notifications }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">All Notifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            {/* Assuming ICONS.close is available or a simple 'X' */}
            X
          </button>
        </div>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className="border-b border-gray-700 py-2">
                <p className="font-bold">{notification.sender.name}</p>
                <p className="text-sm text-gray-400">{notification.content}</p>
                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default AllNotificationsModal;