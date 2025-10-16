import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface SpinnerProps {
  children?: ReactNode;
  className?: string; 
}

const Spinner: React.FC<SpinnerProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-solid border-accent border-t-transparent',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Spinner;