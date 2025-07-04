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
      <div className="group-container">
      {/* Group Header */}
        <div className="group-header">
          <h2>Group Name</h2> {/* Placeholder Group Name */}
        </div>

        {/* Group Content (e.g., messages) */}
        <div className="group-content">
          <p>This is the group content area.</p> {/* Placeholder Content */}
        </div>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;