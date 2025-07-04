'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import UserProfileModal from '@/entities/user/ui/UserProfileModal';
import ContextMenu from '@/shared/ui/ContextMenu/ContextMenu';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import AudioPlayer from '@/features/manage-audio-player/ui/AudioPlayer'; // Import AudioPlayer
import Spinner from '@/shared/ui/Spinner/Spinner'; // Import LazyLoading
import { useMutation } from '@apollo/client';
import { DELETE_MESSAGE, ADD_MESSAGE_REACTION, REMOVE_MESSAGE_REACTION } from '@/entities/message/model/message.mutations'; // Import mutations
import LinkRenderer from '../../../features/link-renderer/ui/LinkRenderer'; // Import LinkRenderer
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ICONS } from '@/shared/assets/Icons/icons'; // Import ICONS
import { SMILES } from '@/shared/assets/Smiles/smiles'; // Import SMILES
import { ChatMessageProps } from '@/entities/message/model/message.types';

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, onEditMessage, onAudioEnded, currentlyPlayingAudio, setCurrentlyPlayingAudio, isSelected, isSelecting, onShowGlobalAudioControls, isPoorConnection, isRecentMessage, currentUserId, onImageClick }) => {
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; showEmojis?: boolean } | null>(null);
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

  const [removeMessageReaction] = useMutation(REMOVE_MESSAGE_REACTION, {
    onCompleted: (data) => {
      console.log('Reaction added successfully:', data);
      // The UI will be updated by the subscription
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
    },
  });

  const [addMessageReaction] = useMutation(ADD_MESSAGE_REACTION, {
    onCompleted: (data) => {
      console.log('Reaction added successfully:', data);
      // The UI will be updated by the subscription
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
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
     const currentRef = messageRef.current; // Capture the current value of the ref
     if (currentRef) {
       observer.unobserve(currentRef); // Use the captured value in cleanup
     }
   };
 }, []); // Empty dependency array because messageRef is a ref and its .current property is not a dependency

 const handleAvatarClick = () => {
    // Only open UserProfileModal for other users, not the current user
    if (!isCurrentUser) {
      setSelectedProfileUserId(message.sender.id);
      setShowUserProfileModal(true);
    }
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

  // New handler for selecting an emoji
  const handleSelectEmoji = (emoji: string) => {
    console.log(`Selected emoji: ${emoji} for message ${message.id}`);
    addMessageReaction({ variables: { messageId: message.id, emoji } }); // Call the mutation
    handleCloseContextMenu();
  };

  // Options for the main context menu
  const mainContextMenuOptions = [
    { label: 'React', onClick: () => setContextMenu({ x: contextMenu!.x, y: contextMenu!.y, messageId: message.id, showEmojis: true }) }, // Option to show emojis
    { label: 'Delete', onClick: handleDeleteClick, disabled: !isCurrentUser },
    { label: 'Edit', onClick: handleEditClick, disabled: !isCurrentUser },
  ];

  // Options for the emoji context menu
  const emojiContextMenuOptions = Object.values(SMILES).map(emoji => ({
    label: emoji,
    onClick: () => handleSelectEmoji(emoji),
  }));


  return (
    <>
      <div
        id={`message-${message.id}`} // Add ID for selection logic
        className={`chat-message-container ${isCurrentUser ? 'current-user' : 'other-user'} ${isSelected ? '' : ''}`}
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
                    <div key={attachment.id} className={`chat-attachment-item-display ${isPoorConnection ? 'grayscale oacity-50' : ''}`}>
                      {attachment.mimetype.startsWith('image/') && (
                                                <img 
                          src={attachment.url} 
                          alt={attachment.filename} 
                          className={`chat-attachment-image ${isPoorConnection ? 'blur-sm' : ''}`}
                          onClick={() => onImageClick?.(attachment.url)}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      {attachment.mimetype.startsWith('audio/') && (
                        <AudioPlayer
                          src={attachment.url}
                          onShowGlobalControls={() => onShowGlobalAudioControls(message.id, attachment.url)} // Pass the new prop
                          messageId={message.id} // Pass messageId
                        >
                        </AudioPlayer>
                      )}
                      {attachment.mimetype === 'application/pdf' && (
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="chat-attachment-file-display chat-attachment-pdf-link">
                          <Image src={ICONS.pdf} alt="PDF File" width={45} height={45} className="chat-attachment-image-pdf" />
                          <span>{attachment.filename}</span>
                        </a>
                      )}
                      {attachment.mimetype === 'application/zip' && (
                        <a href={attachment.url} download={attachment.filename} className="chat-attachment-file-display chat-attachment-zip-link">
                          <Image src={ICONS.file} alt="ZIP File" width={45} height={45} className="chat-attachment-image-zip" />
                          <span>{attachment.filename}</span>
                        </a>
                      )}
                      {/* Add more attachment types here if needed, e.g., video/mp4 */}
                      {!attachment.mimetype.startsWith('image/') && !attachment.mimetype.startsWith('audio/') && attachment.mimetype !== 'application/pdf' && attachment.mimetype !== 'application/zip' && (
                        <div className="chat-attachment-file-display">
                          <Image src={ICONS.image} alt="File" width={20} height={20} />
                          <span>{attachment.filename}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
                            {message.content && message.content.trim() !== '' && (
                <div className="chat-message-content">
                  {message.content.startsWith('```') && message.content.endsWith('```') ? (
                    <SyntaxHighlighter language="javascript" style={atomDark} customStyle={{ borderRadius: '8px', margin: 0 }}>
                      {message.content.slice(3, -3).trim()}
                    </SyntaxHighlighter>
                  ) : (
                    <LinkRenderer text={message.content} />
                  )}
                </div>
              )}
            </>
          ) : (
            <Spinner className={`chat-message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`} />
          )}
          <div className={`chat-message-timestamp ${isCurrentUser ? 'current-user' : 'other-user'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          {/* Display reactions here */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="message-reactions">
              {/* Group and display reactions */}
              {Object.entries(message.reactions.reduce((acc, reaction) => {
                if (!acc[reaction.emoji]) {
                  acc[reaction.emoji] = { count: 0, userIds: new Set() };
                }
                acc[reaction.emoji].count++;
                acc[reaction.emoji].userIds.add(reaction.userId);
                return acc;
              }, {} as Record<string, { count: number; userIds: Set<string> }>)).map(([emoji, reactionData]) => {
                const isCurrentUserReaction = currentUserId && reactionData.userIds.has(currentUserId);
                return (
                  <span
                    key={emoji}
                    className={`message-reaction-item ${isCurrentUserReaction ? 'current-user-reacted' : ''}`} // Add conditional class
                    onClick={() => {
                      if (isCurrentUserReaction) {
                        removeMessageReaction({ variables: { messageId: message.id, emoji } }); // Call remove reaction mutation
                      }
                    }}
                  >
                    {emoji} {reactionData.count > 1 && <span className="reaction-count">{reactionData.count}</span>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {contextMenu && contextMenu.messageId === message.id && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.showEmojis ? emojiContextMenuOptions : mainContextMenuOptions} // Show emoji options if showEmojis is true
          onClose={handleCloseContextMenu}
          isEmojiMenu={contextMenu.showEmojis} // Pass a prop to indicate if it's the emoji menu
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
          status={message.sender.status || ''}
        />
      )}
    </>
  );
};

export default ChatMessage;