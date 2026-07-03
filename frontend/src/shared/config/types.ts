import { ButtonHTMLAttributes, ReactNode } from 'react'
import { AvatarSize } from '../schema/avatar';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'secondary-dark' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  textClassName?: string;
}