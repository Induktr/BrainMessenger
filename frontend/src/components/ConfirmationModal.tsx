import React from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <Button onClick={onClose} className="cancel-button">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} className="confirm-button">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;