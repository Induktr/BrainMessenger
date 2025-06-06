'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { icons } from '../app/lib/constants';
import Button from '@/components/Button';

interface PremiumProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Prop to handle going back to main settings
}

const Premium: React.FC<PremiumProps> = ({ isOpen, onClose, onBack }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="premium-modal-content">
        {/* Header */}
        <div className="premium-header">
          <Button className="premium-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={icons.arrowLeft} alt="Back" className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="premium-header-title">Premium BrainMessenger</h2> {/* Title based on option text */}
          <Button className="premium-close-button" onClick={onClose}>
            <img src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Separator */}
        <div className="premium-separator"></div>

        {/* Premium Content (Placeholder) */}
        <div className="premium-content">
          <p>Premium features will be displayed here.</p>
        </div>
      </div>
    </Modal>
  );
};

export default Premium;
