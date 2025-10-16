import React from 'react';
import { twMerge } from 'tailwind-merge';

interface UserInfoCellProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  className?: string;
}

const UserInfoCell: React.FC<UserInfoCellProps> = ({ icon, label, value, onClick, className }) => {
  return (
    <div
      className={twMerge(
        "p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-dark)] text-center",
        className
      )}
      onClick={onClick}
    >
      <div className="mx-auto mb-2 text-[var(--color-text-secondary)] w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        <p className="text-sm text-[var(--color-gradient-start)] font-medium">{value}</p>
      </div>
    </div>
  );
};

export default UserInfoCell;