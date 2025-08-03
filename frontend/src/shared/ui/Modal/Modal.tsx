import React from 'react';
import { 
  twMerge 
} from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, containerClassName }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-background)]/75"
      onClick={onClose}
    >
      <div
        className={twMerge(
          'bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-md',
          containerClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;