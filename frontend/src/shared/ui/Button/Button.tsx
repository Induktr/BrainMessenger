import React from 'react';
import { 
  twMerge 
} from 'tailwind-merge';
import { 
  useCountStore, 
  variantStyles, 
  sizeStyles, 
  baseStyles, 
  disabledStyles 
} from '@/shared/config/constants';
import { ButtonProps } from '@/shared/config/types';

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...rest
}) => {

  const mergedClasses = twMerge(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabledStyles,
    className
  );

  return (
    <button className={mergedClasses} {...rest}>
      {children}
    </button>
  );
};

export default Button;