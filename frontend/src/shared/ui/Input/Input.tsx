'use client';

import React, { 
  useEffect 
} from 'react';
import { 
  UseFormRegisterReturn 
} from 'react-hook-form';
import Image from 'next/image';
import { 
  twMerge 
} from 'tailwind-merge';
import { 
  useFeedbackAnimation 
} from '@/hooks/useFeedbackAnimation';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  id: string;
  suggestion?: string;
  suggestionClassName?: string;
  suggestionContainerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, registration, error, id, icon, rightIcon, suggestion, suggestionClassName, suggestionContainerClassName, ...rest }) => {
  const { triggerAnimation, animationClassName } = useFeedbackAnimation('glitch-effect', 400);

  useEffect(() => {
    if (error) {
      triggerAnimation();
    }
  }, [error, triggerAnimation]);

  const inputContainerClasses = twMerge(
    'flex items-center focus:outline-none bg-[var(--color-disabled)] mt-1 w-full h-14 bg-[var(--color-input-background)] border border-[var(--color-border)] rounded-lg px-4 transition-all duration-200 ease-in-out',
    error ? 'border-[var(--color-error)]' : '',
    animationClassName
  );

  const inputWrapperClasses = 'relative flex-1 h-full';

  // Shared typography for perfect alignment between input and suggestion
  const typographyClasses = 'text-[var(--color-text-primary)]';

  const inputFieldClasses = twMerge(
    'w-full h-full bg-transparent border-none outline-none appearance-none',
    'placeholder:text-[var(--color-text-secondary)]',
    typographyClasses
  );

  const suggestionClasses = twMerge(
    'absolute top-0 left-0 h-full flex items-center pointer-events-none suggestion-pulse',
    typographyClasses // Ensure identical typography
  );

  const inputLabelClasses = 'block text-[16px] font-medium text-[var(--color-text-secondary)] mb-2';
  const inputIconClasses = 'mr-3 text-[var(--color-text-secondary)]';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={inputLabelClasses}>
          {label}
        </label>
      )}
      <div className={inputContainerClasses}>
        {icon && <div className={inputIconClasses}>{icon}</div>}
        <div className={inputWrapperClasses}>
          <input
            id={id}
            {...registration}
            {...rest}
            className={inputFieldClasses}
          />
          {suggestion && (
            <div className={twMerge(suggestionClasses, suggestionContainerClassName)}>
              {/* This span mimics the user's input to create the correct spacing, but is invisible */}
              <span className="text-transparent text-[17px]">{rest.value || ''}</span>
              {/* This is the visible suggestion character */}
              <span className={twMerge("text-[var(--color-text-secondary)] text-[24px]", suggestionClassName)}>{suggestion}</span>
            </div>
          )}
        </div>
        {rightIcon && <div className="ml-3 text-[var(--color-text-secondary)]">{rightIcon}</div>}
      </div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

export default Input;