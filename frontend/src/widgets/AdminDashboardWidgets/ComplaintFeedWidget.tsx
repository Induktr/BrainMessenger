'use client';

import React, { 
  useState 
} from 'react';
import { 
  useTranslation
} from 'react-i18next';
import { 
  useMutation 
} from '@apollo/client';
import { 
  GET_FEEDBACK_COMPLAINTS
} from '@/entities/feedback-complaint/model/feedback-complaint.queries';
import BanUserModal from '@/entities/admin/ui/BanUserModal';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import {
  BAN_USER_MUTATION,
  DELETE_COMPLAINT_MESSAGE_MUTATION
} from '@/entities/feedback-complaint/model/feedback-complaint.mutations';
import ComplaintItem from './ComplaintItem';

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

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('complaintFeed.title')}</h2>
      {complaintItems.length === 0 ? (
        <p className="text-text-secondary">{t('complaintFeed.noComplaints')}</p>
      ) : (
        <ul className="space-y-4">
          {complaintItems.map((complaint) => (
            <ComplaintItem
              key={complaint.id}
              complaint={complaint}
              onBanUser={handleBanUserClick}
              onDeleteMessage={handleDeleteMessageClick}
            />
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
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('complaintFeed.deleteModal.title')}
        message={t('complaintFeed.deleteModal.message')}
        confirmText={t('complaintFeed.deleteModal.confirmText')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default ComplaintFeedWidget;