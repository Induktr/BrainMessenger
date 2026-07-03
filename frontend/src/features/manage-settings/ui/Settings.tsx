'use client';

import { 
  FC,
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
} from '@/shared/assets/Icons/icons';
import { Button } from '@/shared/ui/Button/Button';
import ListItem from '@/shared/ui/ListItem/ListItem';
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext';
import { 
  generateAvatarData
} from '@/entities/user/model/user-generate-avatar';
import { 
  SettingsProps
} from '@/features/manage-settings/model/settings.types';
import { 
  useTranslation
} from 'react-i18next';
import { 
  variantsStylesIcons 
} from '@/shared/assets/VariantStyles/variantStyles';

const Settings: FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('settings');
  const { user, queryLoading } = useAuth();
  const { t } = useTranslation();

  const avatarData = generateAvatarData(user?.name);

  useEffect(() => {
    if (!isOpen) {
      setCurrentView('settings');
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    onClose();
    setCurrentView('settings');
  };

  const handleBackClick = () => setCurrentView('settings');

  const handleMyAccountClick = () => setCurrentView('myaccount');

  const handleLanguageClick = () => setCurrentView('language');

  const handlePremiumClick = () => setCurrentView('advancedSettings');

  const settingsOptions = [
    {
      id: 'myaccount',
      icon: <Account alt="My account" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />,
      text: t('settings.myAccount'),
      onClick: handleMyAccountClick,
    },
    {
      id: 'language',
      icon: <SwitchLang alt="Language" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />,
      text: t('settings.language'),
      onClick: handleLanguageClick,
    },
    {
      id: 'advanced',
      icon: <SettingsMenu alt="Settings" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />,
      text: t('settings.advancedSettings'),
      onClick: handlePremiumClick,
    },
  ];

  return (
    <Modal onClose={handleCloseModal} isOpen={isOpen}>
      {currentView === 'settings' && (
        <div className="text-[var(--color-text-primary)] max-w-[456px] rounded-[10px] mx-auto">

          <div className={`${variantsStylesIcons.iconSecondary} flex justify-between items-center pb-4`}>
            <h2 className="text-[20px] lg:text-2xl sm:text-[20px] font-medium">{t('settings.headerTitle')}</h2>
            <Button variant="ghost" onClick={handleCloseModal}>
              <CloseModal alt="Close" className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="flex items-center py-6 mb-3">
            <div className="relative mr-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User Avatar" className="w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] hidden lg:block md:block sm:hidden rounded-full object-cover object-center" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--color-disabled)] flex items-center justify-center">
                  <span className="text-2xl font-bold">{avatarData.letter}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-[20px] lg:text-2xl sm:text-[20px] font-bold">{user?.name || 'Guest'}</h2>
              <p className="text-sm lg:text-base sm:text-sm text-[var(--color-text-secondary)]">{user?.email || 'N/A'}</p>
              <p className="text-sm lg:text-base sm:text-sm text-[var(--color-text-secondary)]">@{user?.username || 'N/A'}</p>
            </div>
          </div>
          <div className="border-1 border-[var(--color-gradient-start)]"></div>
          <div className={`${variantsStylesIcons.iconAccent} space-y-2 mt-4`}>
            {settingsOptions.map((option) => (
              <ListItem
                key={option.id}
                icon={option.icon}
                text={option.text}
                onClick={option.onClick}
                className="hover:bg-[var(--color-surface-dark)]"
              />
            ))}
          </div>
        </div>
      )}

      {currentView === 'myaccount' && (
        <MyAccount
          isOpen={isOpen}
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}

      {currentView === 'language' && (
        <Language
          isOpen={isOpen}
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}

      {currentView === 'advancedSettings' && (
        <AdvancedSettings
          isOpen={isOpen}
          onClose={handleCloseModal}
          onBack={handleBackClick}
        />
      )}
    </Modal>
  );
};

export default Settings;