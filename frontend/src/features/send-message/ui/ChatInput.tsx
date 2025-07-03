'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '@/entities/message/model/message.queries';
import { useTypingSender } from '@/hooks/useTypingSender';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image'; // Import Image component
import { ICONS } from '@/shared/assets/Icons/icons'; // Import icons
import AttachmentPreview from '@/shared/ui/AttachmentPreview/AttachmentPreview'; // Import the new AttachmentPreview component
import { isCodeSnippet } from '@/features/code-detector/model/codeDetector';
import { ChatInputProps } from '@/features/send-message/model/send-message.types';

const ChatInput: React.FC<ChatInputProps> = ({
  chatId,
  editingMessage,
  setEditingMessage,
  onSendMessageOrUpdate,
  isChannel,
  isChannelOwner,
  isSubscribedToChannel,
  onSubscribe,
  onUnsubscribe,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window;
  
  const [isTyping, setIsTyping] = useState(false);
  useTypingSender(chatId, isTyping);

  const [sendMessage, { loading, error }] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (editingMessage) {
      setMessageContent(editingMessage.content);
    } else {
      setMessageContent('');
    }
  }, [editingMessage]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
    setIsTyping(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setAttachedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleSendOrUpdate = async () => {
    setIsTyping(false); // Immediately set typing to false
    if (messageContent.trim() === '' && attachedFiles.length === 0) {
      return; // Don't send empty messages or messages with no content and no files
    }

    let contentToSend = messageContent;
    if (isCodeSnippet(messageContent)) {
      contentToSend = '```\n' + messageContent + '\n```';
    }
    await onSendMessageOrUpdate(contentToSend, attachedFiles);
    setMessageContent(''); // Clear input after sending
    setEditingMessage(null); // Clear editing state
    setAttachedFiles([]); // Clear attached files after sending
    // Intentionally left blank to be replaced
  };

  const handleFolderClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (e.clipboardData.files.length > 0) {
      const newFiles = Array.from(e.clipboardData.files);
      setAttachedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendOrUpdate();
    }
  };

  const isInputDisabled = isChannel && !isChannelOwner;

  return (
    <div
      className="chat-input-wrapper"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drag-drop-overlay">
          <Image src={ICONS.uploadImage} alt="Upload File" width={64} height={64} />
          <span>Release to upload</span>
        </div>
      )}
      {attachedFiles.length > 0 && (
        <AttachmentPreview
          files={attachedFiles}
          onRemoveFile={handleRemoveFile}
        />
      )}
      <div className="chat-input-container">
        {isChannel && !isChannelOwner ? (
          isSubscribedToChannel ? (
            <Button className="unsubscribe-button" onClick={onUnsubscribe}>
              Unsubscribe
            </Button>
          ) : (
            <Button className="subscribe-button" onClick={onSubscribe}>
              Subscribe
            </Button>
          )
        ) : (
          <>
            <Button
              className="folder-button"
              onClick={handleFolderClick}
              disabled={isInputDisabled}
            >
              <Image src={ICONS.folder} alt="Folder" width={24} height={24} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon, audio/*, video/mp4, application/pdf, application/zip"
              onChange={handleFileChange}
              disabled={isInputDisabled}
            />
            <Input
              type="text"
              placeholder="Enter message..."
              value={messageContent}
              onChange={onInputChange}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              disabled={loading || isInputDisabled}
            />
            <Button
              onClick={handleSendOrUpdate}
              disabled={loading || isInputDisabled}
              className="send-button"
            >
              <Image
                src={editingMessage ? ICONS.checkmark : ICONS.sendButton}
                alt={editingMessage ? 'Confirm Edit' : 'Send'}
                width={24}
                height={24}
              />
            </Button>
          </>
        )}
        {error && <p>Error sending message: {error.message}</p>}
      </div>
    </div>
  );
};

export default ChatInput;