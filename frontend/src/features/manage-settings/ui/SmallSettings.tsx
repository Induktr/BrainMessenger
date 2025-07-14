'use client';

// frontend/src/ui/Settings.tsx
import { useEffect, useState } from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import { ICONS } from '@/shared/assets/Icons/icons'; // Keep import for now
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import Language from '@/features/change-language/ui/Language';
import Support from '@/features/manage-settings/ui/Support';
import { SmallSettingsProps } from '@/features/manage-settings/model/settings.types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/app/providers/ThemeProvider/ThemeContext';

const SmallSettings: React.FC<SmallSettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('smallSettings');
  // 'smallSettings', 'support', 'language'
  const { t } = useTranslation();
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

  const { theme, toggleTheme } = useTheme();

  const handleThemeChange = (selectedTheme: 'dark' | 'light') => {
    if (theme !== selectedTheme) {
      toggleTheme();
    }
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
            <h2 className="settings-small-title">{t('smallSettings.headerTitle')}</h2>
            <Button className="settings-small-close-button" onClick={handleCloseModal}>
              <img src={ICONS.closeModal} alt="Close" className="icon" />
            </Button>
          </div>

          {/* Settings Options List */}
          <div className="settings-small-options-list">
            {/* Theme Setting */}
            <div className="settings-option-item theme-option">
              <label className="settings-option-label">{t('smallSettings.theme.headerTitle')}</label>
              <div className="theme-buttons-container">
                <button
                  className={`theme-button ${theme === 'dark' ? 'dark-mode active' : 'dark-mode'}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  {t('smallSettings.theme.dark')}
                </button>
                <button
                  className={`theme-button ${theme === 'light' ? 'light-mode active' : 'light-mode'}`}
                  onClick={() => handleThemeChange('light')}
                >
                  {t('smallSettings.theme.light')}
                </button>
              </div>
            </div>

            {/* Language and Support Buttons */}
            <div className="settings-option-item">
                <div className="settings-option-item-row">
                <button className="settings-action-button" onClick={handleLanguageClick}>
                    {t('smallSettings.language')}
                </button>
                <button className="settings-action-button" onClick={handleSupportClick}>
                    {t('smallSettings.support')}
                </button>
                </div>
            </div>
            <div className="support-description">
                <p>{t('smallSettings.descriptionFaq')}</p>
            </div>
          </div>
        </div>
      )}
      {currentView === 'support' && (
        <Support isOpen={true} onBack={handleBackToSettings} onClose={handleCloseModal} />
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