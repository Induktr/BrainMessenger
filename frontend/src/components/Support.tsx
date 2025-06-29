'use client';

import React from 'react';
import Button from '@/components/Button';
import { icons } from '../app/lib/constants';

interface SupportProps {
  onBack: () => void;
  onClose: () => void;
}

const Support: React.FC<SupportProps> = ({ onBack, onClose }) => {
  return (
    <div className="support-modal-content">
      {/* Header */}
      <div className="support-header">
        <Button className="support-back-button" onClick={onBack}>
          <img src={icons.arrowLeft} alt="Back" className="icon" style={{ transform: 'rotate(0deg)' }} />
        </Button>
        <h2 className="support-header-title">Support & Service</h2>
        <Button className="support-close-button" onClick={onClose}>
          <img src={icons.closeModal} alt="Close" className="icon" />
        </Button>
      </div>

      {/* Separator */}
      <div className="support-separator"></div>

      {/* Body */}
      <div className="support-body">
        <h3 className="support-section-title">Our Philosophy</h3>
        <p className="support-text">
          Support and maintenance are an integral part of our system, aimed at maintaining the health of the application and preserving the value of this digital asset for our users. We are guided by the principles of continuous improvement (Kaizen), quality, and responsibility.
        </p>

        <h3 className="support-section-title">How to Reach Us</h3>
        <p className="support-text">
          For any questions or issues, you can contact us through the following channels:
        </p>
        <ul className="support-channels-list">
          <li className="support-channel-item">
            <strong>Email:</strong> <a href="mailto:support@brainmessenger.com" className="support-link">support@brainmessenger.com</a>
            <p className="support-channel-description">Primary channel, response within 24 hours.</p>
          </li>
          <li className="support-channel-item">
            <strong>In-App Feedback Form:</strong>
            <p className="support-channel-description">Go to "Settings" → "Help" → "Contact Us" for structured problem reporting.</p>
          </li>
        </ul>

        <h3 className="support-section-title">For More Information</h3>
        <p className="support-text">
          For detailed documentation and guides, please visit our official landing page.
        </p>
      </div>
    </div>
  );
};

export default Support;