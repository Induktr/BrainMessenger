import React, { 
  useState 
} from 'react';
import Image from 'next/image';
import { 
  IMAGES 
} from '@/shared/assets/Images/images';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { 
  BurgerMenu,
  ArrowBack
} from '@/shared/assets/Icons/icons';
import { 
  variantsStylesIcons
} from '@/shared/assets/VariantStyles/variantStyles';

interface AuthLayoutProps {
  subtitle: string;
  children: React.ReactNode;
  onSettingsClick: () => void;
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
  handleBackPage: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ subtitle, children, onSettingsClick, isSettingsOpen, onSettingsClose, handleBackPage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-6 right-6">
        {isSettingsOpen && <SmallSettings isOpen={isSettingsOpen} onClose={onSettingsClose} />}
        <BurgerMenu className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} onClick={onSettingsClick} />
      </div>
      <div className="absolute top-6 left-6 items-center">
        <button onClick={handleBackPage} className="p-2 cursor-pointer">
          <ArrowBack className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
        </button>
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src={IMAGES.logoBrainMessenger}
            alt="Brain Messenger Logo"
            width={150}
            height={150}
          />
        </div>
        <p className="text-center text-text-secondary mb-10">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
