import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { ArrowLeft, CloseModal } from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, onBack, className }) => {
  return (
    <div className={`flex items-center justify-between pb-4 border-b border-[var(--color-border)] ${className}`}>
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft alt="Back" className={`${variantsStylesIcons.iconSecondary} w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5`} />
        </Button>
      ) : (
        <div className="w-10 h-10" /> // Placeholder to keep title centered
      )}
      <h2 className="text-base lg:text-[20px] sm:text-base font-semibold text-center flex-1 mx-4">{title}</h2>
      <Button variant="ghost" onClick={onClose}>
        <CloseModal alt="Close" className={`${variantsStylesIcons.iconSecondary} w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5`} />
      </Button>
    </div>
  );
};

export default ModalHeader;