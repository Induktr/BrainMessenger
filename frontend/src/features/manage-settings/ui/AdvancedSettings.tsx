'use client';

import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { ICONS } from '@/shared/assets/Icons/icons';
import Button from '@/shared/ui/Button/Button';
import { AdvancedSettingsProps } from '@/features/manage-settings/model/settings.types';

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ isOpen, onClose, onBack }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="advanced-settings-modal-content">
        {/* Header */}
        <div className="advanced-settings-header">
          <Button className="advanced-settings-back-button" onClick={onBack}>
            {/* Rotated arrow icon */}
            <img src={ICONS.arrowLeft} alt="Back" className="icon" /> {/* Use img tag */}
          </Button>
          <h2 className="advanced-settings-header-title">Advanced Settings</h2> {/* Title based on option text */}
          <Button className="advanced-settings-close-button" onClick={onClose}>
            <img src={ICONS.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
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
