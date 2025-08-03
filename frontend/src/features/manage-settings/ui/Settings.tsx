'use client';

// frontend/src/ui/Settings.tsx
import { 
  useEffect, 
  useState 
} from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import MyAccount from '@/features/manage-account/ui/MyAccount';
import Language from '@/features/change-language/ui/Language';
import AdvancedSettings from '@/features/manage-settings/ui/AdvancedSettings';
import { 
  CloseModal, 
  Account, 
  SwitchLang, 
  SettingsMenu 
} from '@/shared/assets/Icons/icons'; // Keep import for now
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth hook
import { 
  generateAvatarData
} from '@/entities/user/model/user-generate-avatar'; // Import avatar utility
import { 
  SettingsProps
} from '@/features/manage-settings/model/settings.types';
import { 
  useTranslation
} from 'react-i18next';
import { 
  useTheme 
} from '@/app/providers/ThemeProvider';
import { 
  variantsStylesIcons 
} from '@/shared/assets/variantStyles/variantStyles';

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
        <div className="text-[var(--color-text-primary)] max-w-[456px] rounded-[10px] mx-auto">
          {/* Settings Header */}
          <div className={`${variantsStylesIcons.iconSecondary} flex justify-between items-center pb-4`}>
            <h2 className="text-[24px] font-medium">{t('settings.headerTitle')}</h2>
            <Button variant="ghost" onClick={handleCloseModal}>
              <CloseModal alt="Close" className="w-6 h-6" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center py-6 mb-3">
            <div className="relative mr-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User Avatar" className="w-[100px] h-[100px] rounded-full object-cover object-center" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--color-disabled)] flex items-center justify-center">
                  <span className="text-2xl font-bold">{avatarData.letter}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-[24px] font-bold">{user?.name || 'Guest'}</h2>
              <p className="text-[16px] text-[var(--color-text-secondary)]">{user?.email || 'N/A'}</p>
              <p className="text-[16px] text-[var(--color-text-secondary)]">@{user?.username || 'N/A'}</p>
            </div>
          </div>
          <div className="border-1 border-[var(--color-gradient-start)]"></div>
          {/* Settings Options List */}
          <div className={`${variantsStylesIcons.iconAccent} space-y-2 mt-4`}>
            <div className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-[var(--color-surface-dark)]" onClick={handleMyAccountClick}>
              <Account alt="My account" className="w-6 h-6 mr-4 text-[var(--color-text-secondary)]" />
              <p className="font-medium">{t('settings.myAccount')}</p>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-[var(--color-surface-dark)]" onClick={handleLanguageClick}>
              <SwitchLang alt="Language" className="w-6 h-6 mr-4 text-[var(--color-text-secondary)]" />
              <p className="font-medium">{t('settings.language')}</p>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-[var(--color-surface-dark)]" onClick={handlePremiumClick}>
              <SettingsMenu alt="Settings" className="w-6 h-6 mr-4 text-[var(--color-text-secondary)]" />
              <p className="font-medium">{t('settings.advancedSettings')}</p>
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