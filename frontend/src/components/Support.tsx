'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { icons } from '../app/lib/constants';
import Button from '@/components/Button';

interface SupportProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Prop to handle going back to main settings
}

const Support: React.FC<SupportProps> = ({ isOpen, onClose, onBack }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="support-modal-content">
        {/* Header */}
        <div className="support-header">
          <Button className="support-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={icons.arrowLeft} alt="Back" className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="support-header-title">Language</h2> {/* Title based on screenshot */}
          <Button className="support-close-button" onClick={onClose}>
            <img src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Separator */}
        <div className="support-separator"></div>

        {/* Interface Language Label */}
        <p className="support-interface-label">Interface language</p>

        {/* Language Options List */}
        <div className="support-options-list">
          <div className="support-option">
            <div className="support-option-icon"><img src={icons.en} alt="English" className="icon" /></div> {/* Use img tag */}
            <p className="support-option-text">English</p>
          </div>
          <div className="support-option">
            <div className="support-option-icon"><img src={icons.ua} alt="Ukranian" className="icon" /></div> {/* Use img tag */}
            <p className="support-option-text">Ukranian</p>
          </div>
          <div className="support-option">
            <div className="support-option-icon"><img src={icons.ru} alt="Russia" className="icon" /></div> {/* Use img tag */}
            <p className="support-option-text">Russia</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Support;