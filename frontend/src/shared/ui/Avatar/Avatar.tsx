import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';
import { AvatarSize, AvatarProps } from '@/shared/config/types';

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const Avatar: FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  textClassName
}) => {
  const { letter, color } = generateAvatarData(name);

  const containerClasses = twMerge(
    'rounded-full flex items-center justify-center object-cover font-bold',
    sizeClasses[size],
    className
  );

  return (
    <>
      {src ? (
        <img
          src={src}
          alt={name}
          className={containerClasses}
        />
      ) : (
        <div
          className={containerClasses}
          style={{ backgroundColor: color }}
        >
          <span className={twMerge('text-white', textClassName)}>{letter}</span>
        </div>
      )}
    </>
  );
};

export default Avatar;