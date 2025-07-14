'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { GET_FEEDBACK_COMPLAINTS } from '@/entities/feedback-complaint/model/feedback-complaint.queries';
import BanUserModal from '../../entities/admin-manage-panel/ui/BanUserModal';
import DeleteMessageModal from '../../entities/admin-manage-panel/ui/DeleteMessageModal';
import { BAN_USER_MUTATION, DELETE_COMPLAINT_MESSAGE_MUTATION } from '@/entities/feedback-complaint/model/feedback-complaint.mutations';

// More detailed interfaces to match backend data
interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
}

// Renamed to FeedbackComplaint for clarity and alignment with backend
interface FeedbackComplaint {
  id: string;
  user?: User;
  message?: Message;
  content: string;
  createdAt: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

interface ComplaintFeedWidgetProps {
  complaintItems: FeedbackComplaint[];
}

const ComplaintFeedWidget: React.FC<ComplaintFeedWidgetProps> = ({ complaintItems }) => {
  const [isBanModalOpen, setBanModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { t } = useTranslation();

  const [banUser] = useMutation(BAN_USER_MUTATION, {
    refetchQueries: [{ query: GET_FEEDBACK_COMPLAINTS }],
  });
  const [deleteComplaintMessage] = useMutation(DELETE_COMPLAINT_MESSAGE_MUTATION, {
    refetchQueries: [{ query: GET_FEEDBACK_COMPLAINTS }],
  });

  const handleBanUserClick = (user: User) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const handleDeleteMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setDeleteModalOpen(true);
  };

  const handleConfirmBan = (reason: string, durationDays: number) => {
    if (!selectedUser) return;
    banUser({ variables: { userId: selectedUser.id, reason, durationDays } });
    setBanModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedMessage) return;
    deleteComplaintMessage({ variables: { messageId: selectedMessage.id } });
    setDeleteModalOpen(false);
    setSelectedMessage(null);
  };

  const statusColorMap = {
    NEW: 'text-blue-500 bg-blue-100',
    IN_PROGRESS: 'text-yellow-500 bg-yellow-100',
    RESOLVED: 'text-green-500 bg-green-100',
    REJECTED: 'text-red-500 bg-red-100',
  };

  return (
    <div className="admin-widget feed-widget complaint-feed-widget">
      <h2 className="admin-widget__title">{t('complaintFeed.title')}</h2>
      {complaintItems.length === 0 ? (
        <p>{t('complaintFeed.noComplaints')}</p>
      ) : (
        <ul className="feed-widget__list">
          {complaintItems.map((complaint) => (
            <li key={complaint.id} className="feed-widget__list-item">
              <div className="feed-widget__item-header">
                <p className="feed-widget__item-user">
                  <strong>{t('complaintFeed.userLabel')}</strong> {complaint.user ? `${complaint.user.name} (ID: ${complaint.user.id})` : t('admin_dashboard.not_available_short')}
                </p>
                <span className={`complaint-feed-widget__status complaint-feed-widget__status--${complaint.status}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="feed-widget__item-timestamp">
                <strong>{t('complaintFeed.createdAtLabel')}</strong> {new Date(complaint.createdAt).toLocaleString()}
              </p>
              <div className="complaint-feed-widget__item-content">
                <p>
                  <strong>{t('complaintFeed.complaintLabel')}</strong> {complaint.content}
                </p>
                {complaint.message && (
                  <div className="complaint-feed-widget__associated-message">
                    <p className="complaint-feed-widget__message-author">{t('admin_dashboard.associated_message_label')}</p>
                    <p className="complaint-feed-widget__message-text">
                      <strong>{t('complaintFeed.messageLabel')}</strong> {complaint.message.content} (ID: {complaint.message.id})
                    </p>
                  </div>
                )}
              </div>
              <div className="complaint-feed-widget__actions">
                <button
                  onClick={() => complaint.user && handleBanUserClick(complaint.user)}
                  disabled={!complaint.user}
                  className="complaint-feed-widget__action-button complaint-feed-widget__action-button--ban"
                >
                  {t('complaintFeed.banUserButton')}
                </button>
                <button
                  onClick={() => complaint.message && handleDeleteMessageClick(complaint.message)}
                  disabled={!complaint.message}
                  className="complaint-feed-widget__action-button complaint-feed-widget__action-button--delete"
                >
                  {t('complaintFeed.deleteMessageButton')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedUser && (
        <BanUserModal
          isOpen={isBanModalOpen}
          onClose={() => setBanModalOpen(false)}
          onConfirm={handleConfirmBan}
          userName={selectedUser.name}
        />
      )}
      <DeleteMessageModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ComplaintFeedWidget;