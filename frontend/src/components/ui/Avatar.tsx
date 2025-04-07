import React from 'react';
import { generateConsistentColor, getInitials } from '@/lib/utils'; // Assuming utils is in lib

interface AvatarProps {
  avatarUrl?: string | null;
  name: string; // Needed for initials
  seed: string; // Needed for consistent color (e.g., username or userId)
  size?: 'small' | 'medium' | 'large' | 'xlarge'; // Optional size prop
  className?: string; // Allow additional custom classes
}

const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  name,
  seed,
  size = 'medium', // Default size
  className = '',
}) => {
  const initial = getInitials(name);
  const colorClass = generateConsistentColor(seed);

  // Define size classes
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base', // Default size similar to sidebar
    large: 'w-16 h-16 text-xl',
    xlarge: 'w-[100px] h-[100px] text-3xl', // Size used in MenuSettings
  };

  const baseClasses = 'rounded-full flex items-center justify-center object-cover font-medium text-white';
  const currentSizeClass = sizeClasses[size] || sizeClasses.medium;

  // Render the image only if avatarUrl is truthy and not the placeholder path
  if (avatarUrl && avatarUrl !== '/avatars/default.jpg') {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className={`${baseClasses} ${currentSizeClass} ${className}`}
      />
    );
  } else {
    return (
      <div
        className={`${baseClasses} ${currentSizeClass} ${colorClass} ${className}`}
        aria-label={`${name}'s default avatar`}
      >
        {initial}
      </div>
    );
  }
};

export default Avatar;