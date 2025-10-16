import React from 'react';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
}

interface FeedbackComplaint {
  id: string;
  user?: User;
  message?: Message;
  content: string;
  createdAt: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

interface ComplaintItemProps {
  complaint: FeedbackComplaint;
  onBanUser: (user: User) => void;
  onDeleteMessage: (message: Message) => void;
}

const statusColorMap = {
  NEW: 'text-blue-500 bg-blue-100',
  IN_PROGRESS: 'text-yellow-500 bg-yellow-100',
  RESOLVED: 'text-green-500 bg-green-100',
  REJECTED: 'text-red-500 bg-red-100',
};

const ComplaintItem: React.FC<ComplaintItemProps> = ({ complaint, onBanUser, onDeleteMessage }) => {
  const { t } = useTranslation();

  return (
    <li className="bg-background p-4 rounded-lg shadow-sm border border-border">
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
          onClick={() => complaint.user && onBanUser(complaint.user)}
          disabled={!complaint.user}
          className="flex-1 py-2 px-4 rounded-lg bg-danger text-white hover:opacity-90 disabled:bg-disabled disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-200"
        >
          {t('complaintFeed.banUserButton')}
        </button>
        <button
          onClick={() => complaint.message && onDeleteMessage(complaint.message)}
          disabled={!complaint.message}
          className="flex-1 py-2 px-4 rounded-lg bg-secondary text-white hover:opacity-90 disabled:bg-disabled disabled:text-text-secondary disabled:cursor-not-allowed transition-all duration-200"
        >
          {t('complaintFeed.deleteMessageButton')}
        </button>
      </div>
    </li>
  );
};

export default ComplaintItem;