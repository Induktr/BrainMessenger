import React from 'react';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';
import clsx from 'clsx';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  textClassName?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className, textClassName }) => {
  const { letter, color } = generateAvatarData(name);

  const containerClasses = clsx(
    'rounded-full flex items-center justify-center object-cover font-bold',
    sizeClasses[size],
    className
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={containerClasses}
      />
    );
  }

  return (
    <div
      className={containerClasses}
      style={{ backgroundColor: color }}
    >
      <span className={clsx('text-white', textClassName)}>{letter}</span>
    </div>
  );
};

export default Avatar;