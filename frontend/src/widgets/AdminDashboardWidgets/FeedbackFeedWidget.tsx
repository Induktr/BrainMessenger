import React from 'react';
import { 
  useTranslation 
} from 'react-i18next';

interface Feedback {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

interface FeedbackFeedWidgetProps {
  feedbackItems: Feedback[];
}

const FeedbackFeedWidget: React.FC<FeedbackFeedWidgetProps> = ({ feedbackItems }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('feedbackFeed.title')}</h2>
      {feedbackItems.length === 0 ? (
        <p className="text-text-secondary">{t('feedbackFeed.noFeedback')}</p>
      ) : (
        <ul className="space-y-4">
          {feedbackItems.map((feedback) => (
            <li key={feedback.id} className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-text-primary text-sm font-medium">{feedback.user}</p>
                <p className="text-text-secondary text-xs">{new Date(feedback.timestamp).toLocaleString()}</p>
              </div>
              <p className="text-text-primary text-sm">{feedback.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackFeedWidget;