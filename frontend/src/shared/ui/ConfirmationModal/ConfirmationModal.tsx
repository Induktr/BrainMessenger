import React from 'react';
import Modal from '@/shared/ui/Modal/Modal';
import Button from '@/shared/ui/Button/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="confirmation-modal-buttons">
        <Button onClick={onClose} className="confirmation-modal-button cancel">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} className="confirmation-modal-button confirm">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;