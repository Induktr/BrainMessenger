'use client';

// frontend/src/ui/Settings.tsx
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { icons } from '../app/lib/constants'; // Keep import for now
import Button from '@/components/Button';
import Image from 'next/image';
import Language from './Language';
import Support from '@/components/Support'
 
interface SmallSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmallSettings: React.FC<SmallSettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('smallSettings');
  // 'smallSettings', 'support', 'language'

  // Reset view when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('smallSettings');
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    onClose();
    setCurrentView('smallSettings'); // Reset view on close
  };

  const handleSupportClick = () => {
    setCurrentView('support');
  };

  const handleLanguageClick = () => {
    setCurrentView('language');
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    // Placeholder for theme change logic
    console.log(`Theme set to: ${theme}`);
  };

  const handleBackToSettings = () => {
    setCurrentView('smallSettings');
  };

  const containerClass = currentView === 'support' ? 'modal-support-view' : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      containerClassName={containerClass}
    >
      {currentView === 'smallSettings' && (
        <div className="settings-small-modal-content">
          {/* Settings Header */}
          <div className="settings-small-header">
            <h2 className="settings-small-title">Settings</h2>
            <Button className="settings-small-close-button" onClick={handleCloseModal}>
              <img src={icons.closeModal} alt="Close" className="icon" />
            </Button>
          </div>

          {/* Settings Options List */}
          <div className="settings-small-options-list">
            {/* Theme Setting */}
            <div className="settings-option-item theme-option">
              <label className="settings-option-label">Theme</label>
              <div className="theme-buttons-container">
                <button className="theme-button dark-mode" onClick={() => handleThemeChange('dark')}>
                  Dark Mode
                </button>
                <button className="theme-button light-mode" onClick={() => handleThemeChange('light')}>
                  Light Mode
                </button>
              </div>
            </div>

            {/* Language and Support Buttons */}
            <div className="settings-option-item">
                <div className="settings-option-item-row">
                <button className="settings-action-button" onClick={handleLanguageClick}>
                    Language
                </button>
                <button className="settings-action-button" onClick={handleSupportClick}>
                    Support
                </button>
                </div>
            </div>
            <div className="support-description">
                <p>Have questions? Contact our support team.</p>
            </div>
          </div>
        </div>
      )}
      {currentView === 'support' && (
        <Support onBack={handleBackToSettings} onClose={handleCloseModal} />
      )}
      {currentView === 'language' && (
        <div>
          <Language onBack={handleBackToSettings} onClose={handleCloseModal} isOpen={true} />
        </div>
      )}
    </Modal>
  );

};

export default SmallSettings;