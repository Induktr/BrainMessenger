import React from 'react';
import { 
  twMerge 
} from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'secondary-dark' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...rest
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none cursor-pointer';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-text-primary)] hover:opacity-90 focus:ring-[var(--color-accent)]',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-border)] focus:ring-[var(--color-accent)]',
    'secondary-dark': 'bg-[var(--color-surface-dark)] text-[var(--color-text-primary)] hover:opacity-90 focus:ring-[var(--color-accent)]',
    danger: 'bg-[var(--color-danger)] text-[var(--color-text-primary)] hover:opacity-90 focus:ring-[var(--color-danger)]',
    ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] focus:ring-[var(--color-accent)]',
    icon: 'bg-transparent text-[var(--color-text-primary)] rounded-full p-2 hover:bg-[var(--color-surface)] focus:ring-[var(--color-accent)]',
    transparent: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
    icon: 'p-2',
  };

  const disabledStyles = 'disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-secondary)] disabled:cursor-not-allowed';

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