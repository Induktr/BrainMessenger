'use client';

// frontend/src/ui/Settings.tsx
import { 
  useEffect, 
  useState 
} from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Language from '@/features/change-language/ui/Language';
import Support from '@/features/manage-settings/ui/Support';
import { SwitchLang, SupportMenu } from '@/shared/assets/Icons/icons';
import ModalHeader from '@/shared/ui/ModalHeader/ModalHeader';
import ListItem from '@/shared/ui/ListItem/ListItem';
import { 
  SmallSettingsProps 
} from '@/features/manage-settings/model/settings.types';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  useTheme 
} from '@/app/providers/ThemeProvider/ThemeContext';
import { 
  variantsStylesIcons, 
} from '@/shared/assets/VariantStyles/variantStyles';

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

  const navigationLinks = [
    {
      id: 'language',
      icon: <SwitchLang className={`${variantsStylesIcons.iconAccent} w-5 h-5`} />,
      text: t('smallSettings.language'),
      onClick: handleLanguageClick,
    },
    {
      id: 'support',
      icon: <SupportMenu className={`${variantsStylesIcons.iconAccent} w-5 h-5`} />,
      text: t('smallSettings.support'),
      onClick: handleSupportClick,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      {currentView === 'smallSettings' && (
        <div className="text-[var(--color-text-primary)] p-5 rounded-[10px] w-full max-w-sm mx-auto flex flex-col gap-6">
          <ModalHeader title={t('smallSettings.headerTitle')} onClose={handleCloseModal} />

          {/* Theme Setting */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
              {t('smallSettings.theme.headerTitle')}
            </label>
            <div className="flex items-center p-1 rounded-lg">
              <button
                className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-background)]' : 'text-[var(--color-text-primary)]'}`}
                onClick={() => handleThemeChange('dark')}
              >
                {t('smallSettings.theme.dark')}
              </button>
              <button
                className={`flex-1 text-sm font-semibold py-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-surface-dark)]' : 'text-[var(--color-text-primary)]'}`}
                onClick={() => handleThemeChange('light')}
              >
                {t('smallSettings.theme.light')}
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
            {navigationLinks.map((link) => (
              <ListItem
                key={link.id}
                icon={link.icon}
                text={link.text}
                onClick={link.onClick}
                className="!p-3 hover:bg-[var(--color-surface-dark)]"
              />
            ))}
          </div>

          {/* Footer Description */}
          <div className="text-center text-xs text-[var(--color-text-secondary)] pt-2">
            <p>{t('smallSettings.descriptionFaq')}</p>
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