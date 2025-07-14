import React, { useState } from 'react';
import { BanUserModalProps } from '@/entities/admin-manage-panel/model/admin-manage-panel.types';

const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(7);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Ban User: {userName}</h2>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter reason for banning..."
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanUserModal;
