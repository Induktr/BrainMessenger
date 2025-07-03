'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { icons } from '../app/lib/constants';
import { useMutation } from '@apollo/client'; // Import useMutation
import { CREATE_CHAT } from '@/graphql/queries'; // Import CREATE_CHAT mutation
import Image from 'next/image';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (groupName: string, participants: string[]) => void; // Assuming participants are handled as strings for now
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]); // Placeholder for participants
  const [participantInput, setParticipantInput] = useState(''); // State for the participant input field

  const handleAddParticipant = () => {
    if (participantInput.trim() !== '') {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const [createChat, { loading, error }] = useMutation(CREATE_CHAT);

  const handleCreateClick = async () => {
    if (groupName.trim() === '' || participants.length === 0) {
      // Basic validation
      console.log('Group name and participants are required.');
      return;
    }

    try {
      const response = await createChat({
        variables: {
          type: 'GROUP', // Assuming this modal is specifically for group chats
          name: groupName.trim(),
          participantIds: participants, // Assuming participants state holds user IDs
        },
      });

      if (response.data && response.data.createChat) {
        console.log('Group chat created:', response.data.createChat);
        // Call the parent onCreate handler if needed for local state updates or notifications
        onCreate(groupName.trim(), participants); // Pass the created chat data if onCreate signature is updated
        handleCloseClick(); // Close the modal on success
      }
    } catch (e: unknown) { // Catch and type the error
      console.error('Error creating group chat:', e);
      // Handle error (e.g., show an error message in the modal)
    }
  };

  const handleCloseClick = () => {
    setGroupName('');
    setParticipants([]);
    setParticipantInput('');
    onClose();
  };

  return (
    <Modal onClose={handleCloseClick} isOpen={isOpen}>
      <div className="create-group-modal-content">
        {/* Header */}
        <div className="create-group-header">
          <h2 className="create-group-header-title">Create New Group</h2>
          <Button className="create-group-close-button" onClick={handleCloseClick}>
            <Image src={icons.closeModal} alt="Close" className="icon" width={24} height={24} /> {/* Use img tag */}
          </Button>
        </div>

        {/* Form */}
        <div className="create-group-form">
          <div className="create-group-input-group">
            <label className="create-group-label">Add participants</label>
            <div className="create-group-participant-input">
              <Image src={icons.search} alt="Search" className="icon" width={24} height={24} /> {/* Use img tag */}
              <Input
                placeholder="Find users..."
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddParticipant();
                  }
                }}
              />
            </div>
            {/* Display added participants here */}
            <div className="create-group-participants-display">
              <div className="create-group-participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className="create-group-participant-item">
                    {/* Placeholder for participant display */}
                    {participant}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="create-group-button-container">
           <Button onClick={handleCreateClick} disabled={loading}>
             {loading ? 'Creating...' : 'Create Group'}
           </Button>
           {error && (
             error.graphQLErrors && error.graphQLErrors.length > 0 ? (
               error.graphQLErrors.map((err, index) => (
                 <p key={index} className="input-error-message text-center">Error: {err.message}</p>
               ))
             ) : (
               <p className="input-error-message text-center">Error: {error.message}</p>
             )
           )}
         </div>
       </div>
     </Modal>
  );
};

export default CreateGroupModal;