'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { icons } from '../app/lib/constants';
import Button from '@/components/Button';

interface AdvancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Prop to handle going back to main settings
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ isOpen, onClose, onBack }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="advanced-settings-modal-content">
        {/* Header */}
        <div className="advanced-settings-header">
          <Button className="advanced-settings-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={icons.arrowLeft} alt="Back" className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="advanced-settings-header-title">Advanced Settings</h2> {/* Title based on option text */}
          <Button className="advanced-settings-close-button" onClick={onClose}>
            <img src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
          </Button>
        </div>

        {/* Separator */}
        <div className="advanced-settings-separator"></div>

        {/* Advanced Settings Content (Placeholder) */}
        <div className="advanced-settings-content">
          <p>Advanced Settings features will be displayed here.</p>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSettings;
