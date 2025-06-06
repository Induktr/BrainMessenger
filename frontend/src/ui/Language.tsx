'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { icons } from '../app/lib/constants';
import Button from '@/components/Button';

interface LanguageProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Prop to handle going back to main settings
}

const Language: React.FC<LanguageProps> = ({ isOpen, onClose, onBack }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="language-modal-content">
        {/* Header */}
        <div className="language-header">
          <Button className="language-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={icons.arrowLeft} alt="Back" className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="language-header-title">Language</h2> {/* Title based on screenshot */}
          <Button className="language-close-button" onClick={onClose}>
            <img src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Separator */}
        <div className="language-separator"></div>

        {/* Interface Language Label */}
        <p className="language-interface-label">Interface language</p>

        {/* Language Options List */}
        <div className="language-options-list">
          <div className="language-option">
            <div className="language-option-icon"><img src={icons.en} alt="English" className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">English</p>
          </div>
          <div className="language-option">
            <div className="language-option-icon"><img src={icons.ua} alt="Ukranian" className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">Ukranian</p>
          </div>
          <div className="language-option">
            <div className="language-option-icon"><img src={icons.ru} alt="Russia" className="icon" /></div> {/* Use img tag */}
            <p className="language-option-text">Russia</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Language;