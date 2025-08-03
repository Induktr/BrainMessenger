import React from 'react';
import { 
  twMerge 
} from 'tailwind-merge';

interface ListItemProps {
  icon?: React.ReactNode; // Optional icon component
  text: string;
  onClick?: () => void; // Optional click handler
  className?: string; // Optional additional classes
}

const ListItem: React.FC<ListItemProps> = ({ icon, text, onClick, className }) => {
  const baseStyles = 'flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out';
  const clickableStyles = 'cursor-pointer hover:bg-[var(--color-surface)]'; // Using surface for hover background
  const textStyles = 'text-[var(--color-text-primary)] text-base font-normal';
  const iconStyles = 'mr-3 text-[var(--color-text-secondary)]'; // Spacing and color for icon

  const mergedClasses = twMerge(
    baseStyles,
    onClick ? clickableStyles : '',
    className
  );

  return (
    <div
      className={mergedClasses}
      onClick={onClick}
    >
      {icon && <div className={iconStyles}>{icon}</div>}
      <span className={textStyles}>{text}</span>
    </div>
  );
};

export default ListItem;