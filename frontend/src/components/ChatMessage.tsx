'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import UserProfileModal from '@/components/UserProfileModal';
import ContextMenu from '@/components/ContextMenu';
import ConfirmationModal from '@/components/ConfirmationModal';
import AudioPlayer from './AudioPlayer'; // Import AudioPlayer
import { useMutation } from '@apollo/client';
import { DELETE_MESSAGE } from '@/graphql/queries';

interface ChatMessageProps {
  message: {
    id: string;
    sender: {
      id: string;
      name: string;
      avatarUrl?: string | null; // Add avatarUrl
      username?: string | null; // Add username
      status?: string; // Add status
      bio?: string | null; // Add bio
    };
    content: string;
    createdAt: string; // Changed from timestamp to createdAt
    attachments?: { // Add attachments field
      id: string;
      url: string;
      filename: string;
      mimetype: string;
    }[];
  };
  isCurrentUser: boolean;
  onEditMessage: (message: { id: string; content: string }) => void; // New prop for editing
  onAudioEnded: (messageId: string, attachmentIndex: number) => void;
  currentlyPlayingAudio: { messageId: string; attachmentIndex: number } | null;
  setCurrentlyPlayingAudio: React.Dispatch<React.SetStateAction<{ messageId: string; attachmentIndex: number } | null>>;
  isSelected: boolean; // New prop for selection state
  isSelecting: boolean; // New prop to indicate if selection is active
  onOpenOptions: (messageId: string, src: string, currentTime: number, duration: number, isPlaying: boolean, isLooping: boolean) => void; // Updated prop signature
 isPoorConnection: boolean; // New prop for network status
  isRecentMessage: boolean; // New prop to indicate if it's one of the last 10 messages
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, onEditMessage, onAudioEnded, currentlyPlayingAudio, setCurrentlyPlayingAudio, isSelected, isSelecting, onOpenOptions, isPoorConnection, isRecentMessage }) => {
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State to track visibility for lazy loading
  const messageRef = useRef<HTMLDivElement>(null); // Ref for the message container

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onCompleted: () => {
      console.log('Message deleted successfully');
      // The parent component (ChatPage) will likely refetch messages or update its state
      // based on the subscription or a direct cache update.
    },
    onError: (error) => {
      console.error('Error deleting message:', error);
    },
  });

 useEffect(() => {
   const observer = new IntersectionObserver(
     ([entry]) => {
       if (entry.isIntersecting) {
         setIsVisible(true);
         observer.disconnect(); // Stop observing once visible
       }
     },
     { threshold: 0.1 } // Trigger when 10% of the message is visible
   );

   if (messageRef.current) {
     observer.observe(messageRef.current);
   }

   return () => {
     if (messageRef.current) {
       observer.unobserve(messageRef.current);
     }
   };
 }, []);

 const handleAvatarClick = () => {
    setSelectedProfileUserId(message.sender.id);
    setShowUserProfileModal(true);
  };

  const handleCloseUserProfileModal = () => {
    setShowUserProfileModal(false);
    setSelectedProfileUserId(null);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default browser context menu
    setContextMenu({ x: event.clientX, y: event.clientY, messageId: message.id });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmModal(true);
    handleCloseContextMenu();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMessage({ variables: { messageId: message.id } });
      setShowDeleteConfirmModal(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleEditClick = () => {
    onEditMessage({ id: message.id, content: message.content });
    handleCloseContextMenu();
  };

  return (
    <>
      <div
        id={`message-${message.id}`} // Add ID for selection logic
        className={`chat-message-container ${isCurrentUser ? 'current-user' : 'other-user'} ${isSelected ? 'selected-message' : ''}`}
        onContextMenu={handleContextMenu}
        ref={messageRef} // Attach ref to the message container
      >
        {!isCurrentUser && (
          <div
            className={`chat-message-avatar ${isPoorConnection ? 'blur-sm' : ''}`}
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer' }}
          >
            {message.sender.avatarUrl ? (
              <img src={message.sender.avatarUrl} alt={`${message.sender.name}'s avatar`} width={32} height={32} className={`rounded-full ${isPoorConnection ? 'grayscale opacity-50' : ''}`} />
            ) : (
              <div className="default-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#555' }}></div>
            )}
          </div>
        )}
        <div
          className={`chat-message-bubble ${isCurrentUser ? 'current-user' : 'other-user'} ${isSelected ? 'selected-bubble' : ''}`}
        >
          {!isCurrentUser && (
            <div className="chat-message-sender-name">{message.sender.name || message.sender.username || 'Unknown User'}</div>
          )}
          {/* Conditionally render content and attachments based on visibility and network status */}
          {(isRecentMessage || !isPoorConnection || isVisible) ? (
            <>
              {message.attachments && message.attachments.length > 0 && (
                <div className="chat-attachments-wrapper">
                  {message.attachments.map((attachment, attachmentIndex) => (
                    <div key={attachment.id} className={`chat-attachment-item-display ${isPoorConnection ? 'grayscale opacity-50' : ''}`}>
                      {attachment.mimetype.startsWith('image/') && (
                        <img src={attachment.url} alt={attachment.filename} className={`chat-attachment-image ${isPoorConnection ? 'blur-sm' : ''}`} />
                      )}
                      {attachment.mimetype.startsWith('audio/') && (
                        <AudioPlayer
                          src={attachment.url}
                          onEndedCallback={() => onAudioEnded(message.id, attachmentIndex)}
                          shouldPlay={currentlyPlayingAudio?.messageId === message.id && currentlyPlayingAudio?.attachmentIndex === attachmentIndex}
                          onOpenOptions={onOpenOptions} // Pass the actual handler from ChatPage
                          messageId={message.id} // Pass messageId
                        />
                      )}
                      {attachment.mimetype === 'application/pdf' && (
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="chat-attachment-file-display chat-attachment-pdf-link">
                          <Image src="/icons/file.svg" alt="PDF File" width={20} height={20} />
                          <span>{attachment.filename}</span>
                        </a>
                      )}
                      {attachment.mimetype === 'application/zip' && (
                        <a href={attachment.url} download={attachment.filename} className="chat-attachment-file-display chat-attachment-zip-link">
                          <Image src="/icons/file.svg" alt="ZIP File" width={20} height={20} />
                          <span>{attachment.filename}</span>
                        </a>
                      )}
                      {/* Add more attachment types here if needed, e.g., video/mp4 */}
                      {!attachment.mimetype.startsWith('image/') && !attachment.mimetype.startsWith('audio/') && attachment.mimetype !== 'application/pdf' && attachment.mimetype !== 'application/zip' && (
                        <div className="chat-attachment-file-display">
                          <Image src="/icons/file.svg" alt="File" width={20} height={20} />
                          <span>{attachment.filename}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {message.content && message.content.trim() !== '' && <p className="chat-message-content">{message.content}</p>}
            </>
          ) : (
            <div className="chat-message-placeholder animated-gradient">
              {/* Gradient animation will be applied via CSS */}
            </div>
          )}
          <div className={`chat-message-timestamp ${isCurrentUser ? 'current-user' : 'other-user'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {contextMenu && contextMenu.messageId === message.id && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={[
            { label: 'Delete', onClick: handleDeleteClick, disabled: !isCurrentUser },
            { label: 'Edit', onClick: handleEditClick, disabled: !isCurrentUser },
          ]}
          onClose={handleCloseContextMenu}
        />
      )}

      {showDeleteConfirmModal && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this message?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {showUserProfileModal && selectedProfileUserId && (
        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={handleCloseUserProfileModal}
          userId={selectedProfileUserId}
        />
      )}
    </>
  );
};
 
export default ChatMessage;