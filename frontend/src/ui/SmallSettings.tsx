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
  const [currentView, setCurrentView] = useState('smallSettings'); // 'smallSettings', 'support', 'language', 'theme'
 
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
    setCurrentView('support'); // Reset view on close
  }

  const handleLanguageClick = () => {
    setCurrentView('language'); // Reset view on close
  }

  const handleToggleTheme = () => {
    console.log(`Currnet theme changes: ${handleToggleTheme}`)
  }

  return (
    <Modal onClose={handleCloseModal} isOpen={isOpen}>
      {currentView === 'smallSettings' && (
        <div className="settings-small-modal-content">
          {/* Settings Header */}
          <div className="settings-small-header">
            <h2 className="settings-small-header">Settings</h2>
            <Button className="settings-small-close-button" onClick={handleCloseModal}>
              <img src={icons.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
            </Button>
          </div>

          {/* Settings Options List */}
          <div className="settings-small-options-list">
            <div className="settings-small-option" onClick={handleToggleTheme}>
              <div className="settings-small-option-icon"><Image src={icons.account} alt="My account" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-small-option-theme">Theme</p>
            </div>
            <div className="settings-small-option" onClick={handleLanguageClick}>
              <div className="settings-small-option-icon"><Image src={icons.language} alt="Language" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-small-option-text">Language</p>
            </div>
            <div className="settings-small-option" onClick={handleSupportClick}>
              <div className="settings-small-option-icon"><Image src={icons.support} alt="Premium" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-small-option-text">Support</p>
            </div>
          </div>
        </div>
      )}
      {currentView === 'support' && (
        <div>
          <Support onBack={handleCloseModal} onClose={handleCloseModal} isOpen={true}/>
        </div>
      )}
      {currentView === 'language' && (
        <div>
          <Language onBack={handleCloseModal} onClose={handleCloseModal} isOpen={true}/>
        </div>
      )}
      {currentView === 'theme' && (
        <div>
        </div>
      )}
    </Modal>
  );
};

export default SmallSettings;