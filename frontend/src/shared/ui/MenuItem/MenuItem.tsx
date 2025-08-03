import React from 'react';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-3 text-left text-[var(--color-text-primary)] hover:bg-[var(--color-surface-dark)] rounded-lg transition-colors duration-150"
  >
    {icon}
    <span className="font-thin">{text}</span>
  </button>
);

export default MenuItem;