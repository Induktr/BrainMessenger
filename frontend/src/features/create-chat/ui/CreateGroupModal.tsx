// frontend/src/ui/Group.tsx
import Modal from '@/shared/ui/Modal/Modal';
import React from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg">
        {/* Group Header */}
        <div className="pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold">Group Name</h2> {/* Placeholder Group Name */}
        </div>

        {/* Group Content (e.g., messages) */}
        <div className="pt-4">
          <p>This is the group content area.</p> {/* Placeholder Content */}
        </div>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;