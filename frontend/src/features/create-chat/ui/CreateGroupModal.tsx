// frontend/src/ui/Group.tsx
import React from 'react';

const CreateGroupModal = () => {
  return (
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
  );
};

export default CreateGroupModal;