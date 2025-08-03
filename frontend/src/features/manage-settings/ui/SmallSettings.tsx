'use client';

// frontend/src/ui/Settings.tsx
import { 
  useEffect, 
  useState 
} from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';
import Language from '@/features/change-language/ui/Language';
import Support from '@/features/manage-settings/ui/Support';
import { 
  CloseModal, 
  SwitchLang, 
  SupportMenu 
} from '@/shared/assets/Icons/icons';
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
  variantsStylesBackground, 
  variantsStylesIcons, 
  variantsStylesText 
} from '@/shared/assets/variantStyles/variantStyles';

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

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      {currentView === 'smallSettings' && (
        <div className="text-[var(--color-text-primary)] p-5 rounded-[10px] w-full max-w-sm mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('smallSettings.headerTitle')}</h2>
            <Button variant="ghost" size="md" onClick={handleCloseModal} className="text-[var(--color-text-secondary)]">
              <CloseModal className={`${variantsStylesIcons.iconSecondary} w-5 h-5`} />
            </Button>
          </div>

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
            <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-[var(--color-surface-dark)] transition-colors" onClick={handleLanguageClick}>
              <div className="flex items-center gap-3">
                <SwitchLang className={`${variantsStylesIcons.iconAccent} w-5 h-5`} />
                <span className="font-semibold">{t('smallSettings.language')}</span>
              </div>
            </button>
            <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-[var(--color-surface-dark)] transition-colors" onClick={handleSupportClick}>
              <div className="flex items-center gap-3">
                <SupportMenu className={`${variantsStylesIcons.iconAccent} w-5 h-5`} />
                <span className="font-semibold">{t('smallSettings.support')}</span>
              </div>
            </button>
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