import React from 'react';
import { 
  variantsStylesIcons 
} from '@/shared/assets/VariantStyles/variantStyles';

interface DropdownOption {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

interface DropdownMenuProps {
  options: DropdownOption[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
  return (
    <div className="absolute top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] shadow-lg z-10">
      {options.map((option, index) => (
        <button
          key={index}
          className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[var(--color-disabled)] rounded-[10px] cursor-pointer transition duration-250 ${option.className || ''}`}
          onClick={option.onClick}
        >
          {option.icon && <span className={`${variantsStylesIcons.iconAccent} w-6 h-6`}>{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default DropdownMenu;