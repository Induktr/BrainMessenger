import { create } from 'zustand';
import { State, Actions } from './types';
import { 
  twMerge 
} from 'tailwind-merge';

export const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  increment: (qty: number) => set((state) => ({ count: state.count + qty })),
  decrement: (qty: number) => set((state) => ({ count: state.count - qty })),
}))

export const variantStyles = {
    primary: 'bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-text-primary)] hover:opacity-90',
    secondary: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-border)]',
    'secondary-dark': 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:opacity-90',
    danger: 'bg-[var(--color-danger)] text-[var(--color-text-primary)] hover:opacity-90',
    ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
    icon: 'bg-transparent text-[var(--color-text-primary)] rounded-full p-2 hover:bg-[var(--color-surface)]',
    transparent: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
};

export const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
    icon: 'p-2',
};

export const baseStyles = 'font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none cursor-pointer';

export const disabledStyles = 'disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-secondary)] disabled:cursor-not-allowed';