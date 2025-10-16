import React from 'react'

export type State = {
  count: number
}

export type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'secondary-dark' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}