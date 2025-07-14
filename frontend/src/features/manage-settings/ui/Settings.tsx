'use client';

// frontend/src/ui/Settings.tsx
import { useEffect, useState } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import MyAccount from '@/features/manage-account/ui/MyAccount';
import Language from '@/features/change-language/ui/Language';
import AdvancedSettings from '@/features/manage-settings/ui/AdvancedSettings';
import { ICONS } from '@/shared/assets/Icons/icons'; // Keep import for now
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import { useAuth } from '@/features/user-auth/ui/AuthContext'; // Import useAuth hook
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar'; // Import avatar utility
import { SettingsProps } from '@/features/manage-settings/model/settings.types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/app/providers/ThemeProvider';

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('settings'); // 'settings', 'myaccount', 'language', 'premium'
  const { user, queryLoading } = useAuth(); // Get user and loading state from context
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
 
  // Generate avatar data
  const avatarData = generateAvatarData(user?.name);
 
  // Reset view when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('settings');
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    onClose();
    setCurrentView('settings'); // Reset view on close
  };

  const handleBackClick = () => {
    setCurrentView('settings'); // Go back to main settings
  };

  const handleMyAccountClick = () => {
    setCurrentView('myaccount');
  };

  const handleLanguageClick = () => {
    setCurrentView('language');
  };

  const handlePremiumClick = () => {
    setCurrentView('advancedSettings');
  };

  return (
    <Modal onClose={handleCloseModal} isOpen={isOpen}>
      {currentView === 'settings' && (
        <div className="settings-modal-content">
          {/* Settings Header */}
          <div className="settings-header">
            <h2 className="settings-header">{t('settings.headerTitle')}</h2>
            <Button className="settings-close-button" onClick={handleCloseModal}>
              <img src={ICONS.closeModal} alt="Close" className="icon" /> {/* Use img tag */}
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="settings-section settings-user-profile">
            {/* Replace placeholder div with generated avatar */}
            <div
              className="settings-avatar-placeholder settings-avatar"
              style={{ backgroundColor: avatarData.color }} // Apply background color to the container
            >
              {user?.avatarUrl ? ( // Use optional chaining for user
                // Display real avatar if available
                <img src={user.avatarUrl} alt="User Avatar" className="settings-avatar-image" />
              ) : (
                // Display generated placeholder if no avatar URL
                <span className="settings-avatar-letter">{avatarData.letter}</span>
              )}
            </div>
            <div className="settings-user-info">
              <h2 className="">{user?.name || 'Guest'}</h2> {/* Display user's name or 'Guest' */}
              <p className="settings-user-email">{user?.email || 'N/A'}</p> {/* Display user's email or 'N/A' */}
              <p className="sidebar-username-text">@{user?.username || 'N/A'}</p> {/* Display user's email as username or 'N/A' */}
            </div>
          </div>

          {/* Settings Options List */}
          <div className="settings-options-list">
            <div className="settings-option" onClick={handleMyAccountClick}>
              <div className="settings-option-icon"><Image src={ICONS.account} alt="My account" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-option-text">{t('settings.myAccount')}</p>
            </div>
            <div className="settings-option" onClick={handleLanguageClick}>
              <div className="settings-option-icon"><Image src={ICONS.language} alt="Language" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-option-text">{t('settings.language')}</p>
            </div>
            <div className="settings-option" onClick={handlePremiumClick}>
              <div className="settings-option-icon"><Image src={ICONS.settings} alt="Settings" className="icon" width={20} height={20} /></div> {/* Use img tag */}
              <p className="settings-option-text">{t('settings.advancedSettings')}</p>
            </div>
          </div>
        </div>
      )}

      {currentView === 'myaccount' && (
        <MyAccount
          isOpen={isOpen} // Pass isOpen to keep the modal open
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}

      {currentView === 'language' && (
        <Language
          isOpen={isOpen} // Pass isOpen to keep the modal open
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}

      {currentView === 'advancedSettings' && (
        <AdvancedSettings
          isOpen={isOpen} // Pass isOpen to keep the modal open
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}
    </Modal>
  );
};

export default Settings;