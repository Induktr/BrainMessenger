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
import BanUserModal from '../../entities/admin/ui/BanUserModal';
import DeleteMessageModal from '../../entities/admin/ui/DeleteMessageModal';
import { 
  BAN_USER_MUTATION, 
  DELETE_COMPLAINT_MESSAGE_MUTATION 
} from '@/entities/feedback-complaint/model/feedback-complaint.mutations';

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
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('complaintFeed.title')}</h2>
      {complaintItems.length === 0 ? (
        <p className="text-text-secondary">{t('complaintFeed.noComplaints')}</p>
      ) : (
        <ul className="space-y-4">
          {complaintItems.map((complaint) => (
            <li key={complaint.id} className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-text-primary text-sm font-medium">
                  <strong>{t('complaintFeed.userLabel')}</strong> {complaint.user ? `${complaint.user.name} (ID: ${complaint.user.id})` : t('admin_dashboard.not_available_short')}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColorMap[complaint.status]}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-text-secondary text-xs mb-2">
                <strong>{t('complaintFeed.createdAtLabel')}</strong> {new Date(complaint.createdAt).toLocaleString()}
              </p>
              <div className="mb-3">
                <p className="text-text-primary text-sm">
                  <strong>{t('complaintFeed.complaintLabel')}</strong> {complaint.content}
                </p>
                {complaint.message && (
                  <div className="mt-2 p-3 bg-surface-dark rounded-md border border-border">
                    <p className="text-text-secondary text-xs mb-1">{t('admin_dashboard.associated_message_label')}</p>
                    <p className="text-text-primary text-sm">
                      <strong>{t('complaintFeed.messageLabel')}</strong> {complaint.message.content} (ID: {complaint.message.id})
                    </p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => complaint.user && handleBanUserClick(complaint.user)}
                  disabled={!complaint.user}
                  className="flex-1 py-2 px-4 rounded-lg bg-danger text-white hover:opacity-90 disabled:bg-disabled disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-200"
                >
                  {t('complaintFeed.banUserButton')}
                </button>
                <button
                  onClick={() => complaint.message && handleDeleteMessageClick(complaint.message)}
                  disabled={!complaint.message}
                  className="flex-1 py-2 px-4 rounded-lg bg-secondary text-white hover:opacity-90 disabled:bg-disabled disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-200"
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