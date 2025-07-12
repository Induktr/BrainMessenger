import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className="admin-widget feed-widget">
      <h2 className="admin-widget__title">{t('feedbackFeed.title')}</h2>
      {feedbackItems.length === 0 ? (
        <p className="feed-widget__empty-message">{t('feedbackFeed.noFeedback')}</p>
      ) : (
        <ul className="feed-widget__list">
          {feedbackItems.map((feedback) => (
            <li key={feedback.id} className="feed-widget__list-item">
              <div className="feed-widget__item-header">
                <p className="feed-widget__item-user">{feedback.user}</p>
                <p className="feed-widget__item-timestamp">{new Date(feedback.timestamp).toLocaleString()}</p>
              </div>
              <p className="feed-widget__item-message">{feedback.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackFeedWidget;