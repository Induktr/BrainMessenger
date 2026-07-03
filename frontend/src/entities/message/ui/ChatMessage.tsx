'use client';

import { useState, useRef, useEffect, FC } from 'react';
import UserProfileModal from '@/entities/user/ui/UserProfileModal';
import ContextMenu from '@/shared/ui/ContextMenu/ContextMenu';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import AudioPlayer from '@/features/manage-audio-player/ui/AudioPlayer';
import Spinner from '@/shared/ui/Spinner/Spinner';
import { useMutation } from '@apollo/client/react';
import { DELETE_MESSAGE, ADD_MESSAGE_REACTION, REMOVE_MESSAGE_REACTION } from '@/entities/message/model/message.mutations';
import LinkRenderer from '../../../features/link-renderer/ui/LinkRenderer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { File, UploadImage, Pdf } from '@/shared/assets/Icons/icons';
import { SMILES } from '@/shared/assets/Smiles/smiles';
import { ChatMessageProps } from '@/entities/message/model/message.types';
import clsx from 'clsx';
import Avatar from '@/shared/ui/Avatar/Avatar';

const ChatMessage: FC<ChatMessageProps> = ({ message, isCurrentUser, onEditMessage, onAudioEnded, currentlyPlayingAudio, setCurrentlyPlayingAudio, isSelected, isSelecting, isPoorConnection, isRecentMessage, currentUserId, onImageClick }) => {
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; showEmojis?: boolean } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const [deleteMessage] = useMutation(DELETE_MESSAGE);
  const [removeMessageReaction] = useMutation(REMOVE_MESSAGE_REACTION);
  const [addMessageReaction] = useMutation(ADD_MESSAGE_REACTION);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
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
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, messageId: message.id });
  };

  const handleCloseContextMenu = () => setContextMenu(null);
  const handleDeleteClick = () => {
    setShowDeleteConfirmModal(true);
    handleCloseContextMenu();
  };

  const handleConfirmDelete = async () => {
    await deleteMessage({ variables: { messageId: message.id } });
    setShowDeleteConfirmModal(false);
  };

  const handleEditClick = () => {
    onEditMessage({ id: message.id, content: message.content });
    handleCloseContextMenu();
  };

  const handleSelectEmoji = (emoji: string) => {
    addMessageReaction({ variables: { messageId: message.id, emoji } });
    handleCloseContextMenu();
  };

  const mainContextMenuOptions = [
    { label: 'React', onClick: () => setContextMenu({ ...contextMenu!, showEmojis: true }) },
    { label: 'Delete', onClick: handleDeleteClick, disabled: !isCurrentUser },
    { label: 'Edit', onClick: handleEditClick, disabled: !isCurrentUser },
  ];

  const emojiContextMenuOptions = Object.values(SMILES).map(emoji => ({
    label: emoji,
    onClick: () => handleSelectEmoji(emoji),
  }));

  return (
    <>
      <div
        id={`message-${message.id}`}
        className={clsx('flex items-start gap-3', isCurrentUser ? 'justify-end' : 'justify-start')}
        onContextMenu={handleContextMenu}
        ref={messageRef}
      >
        {!isCurrentUser && (
          <div
            className={clsx('flex-shrink-0 cursor-pointer', isPoorConnection && 'blur-sm')}
            onClick={handleAvatarClick}
          >
            <Avatar
              src={message.sender.avatarUrl}
              name={message.sender.name}
              size="sm"
              className={clsx(isPoorConnection && 'grayscale opacity-50')}
            />
          </div>
        )}
        <div
          className={clsx(
            'max-w-md lg:max-w-md p-3 rounded-lg md:max-w-sm',
            isCurrentUser ? 'bg-[var(--color-gradient-start)]/30' : 'bg-[var(--color-surface)]',
            isSelected && 'ring-2 ring-[var(--color-accent)]'
          )}
        >
          {!isCurrentUser && (
            <div className="text-sm font-bold text-[var(--color-text-secondary)] mb-1">
              {message.sender.name || message.sender.username || 'Unknown User'}
            </div>
          )}
          {(isRecentMessage || !isPoorConnection || isVisible) ? (
            <div className="space-y-2">
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className={clsx('relative', isPoorConnection && 'grayscale opacity-50')}>
                      {attachment.mimetype.startsWith('image/') && (
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className={clsx('w-full max-h-96 rounded-lg object-cover cursor-pointer', isPoorConnection && 'blur-sm')}
                          onClick={() => onImageClick?.(attachment.url)}
                        />
                      )}
                      {attachment.mimetype.startsWith('audio/') && (
                        <AudioPlayer
                          src={attachment.url}
                          messageId={message.id}
                        />
                      )}
                      {attachment.mimetype === 'application/pdf' && (
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-[var(--color-surface-dark)] rounded-lg">
                          <Pdf alt="PDF File" className="w-8 h-8" />
                          <span className="text-sm">{attachment.filename}</span>
                        </a>
                      )}
                      {attachment.mimetype === 'application/zip' && (
                        <a href={attachment.url} download={attachment.filename} className="flex items-center gap-2 p-2 bg-[var(--color-surface-dark)] rounded-lg">
                          <File alt="ZIP File" className="w-8 h-8" />
                          <span className="text-sm">{attachment.filename}</span>
                        </a>
                      )}
                      {!attachment.mimetype.startsWith('image/') && !attachment.mimetype.startsWith('audio/') && attachment.mimetype !== 'application/pdf' && attachment.mimetype !== 'application/zip' && (
                        <div className="flex items-center gap-2 p-2 bg-[var(--color-surface-dark)] rounded-lg">
                          <UploadImage alt="File" className="w-8 h-8" />
                          <span className="text-sm">{attachment.filename}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {message.content && message.content.trim() !== '' && (
                <div className="text-base lg:text-[20px] sm:text-base text-[var(--color-text-primary)] break-words overflow-wrap-anywhere">
                  {message.content.startsWith('```') && message.content.endsWith('```') ? (
                    <SyntaxHighlighter language="javascript" style={atomDark} customStyle={{ borderRadius: '8px', margin: 0, padding: '1rem' }}>
                      {message.content.slice(3, -3).trim()}
                    </SyntaxHighlighter>
                  ) : (
                    <LinkRenderer text={message.content} />
                  )}
                </div>
              )}
            </div>
          ) : (
            <Spinner className="w-8 h-8" />
          )}
          <div className="flex items-center justify-end gap-2 mt-1">
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1">
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
                      className={clsx('cursor-pointer p-1 text-sm rounded-full transition-colors', isCurrentUserReaction ? 'bg-[var(--color-accent)]/30' : 'hover:bg-[var(--color-surface-dark)]')}
                      onClick={() => {
                        if (isCurrentUserReaction) {
                          removeMessageReaction({ variables: { messageId: message.id, emoji } });
                        }
                      }}
                    >
                      {emoji} {reactionData.count > 1 && <span className="text-sm">{reactionData.count}</span>}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="text-sm text-[var(--color-text-secondary)]">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {contextMenu && contextMenu.messageId === message.id && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.showEmojis ? emojiContextMenuOptions : mainContextMenuOptions}
          onClose={handleCloseContextMenu}
          isEmojiMenu={contextMenu.showEmojis}
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