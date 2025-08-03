'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '@/entities/message/model/message.queries';
import { useTypingSender } from '@/hooks/useTypingSender';
import Input from '@/shared/ui/Input/Input';
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image'; // Import Image component
import { UploadImage, Folder, Checkmark, SendButton } from '@/shared/assets/Icons/icons'; // Import icons
import AttachmentPreview from '@/shared/ui/AttachmentPreview/AttachmentPreview'; // Import the new AttachmentPreview component
import { isCodeSnippet } from '@/features/code-detector/model/codeDetector';
import { ChatInputProps } from '@/features/send-message/model/send-message.types';
import { useTranslation } from 'react-i18next';
import { variantsStylesIcons } from '@/shared/assets/variantStyles/variantStyles';

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
  const { t } = useTranslation();
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(e.target.value);
    setIsTyping(true);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageContent]);

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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter
      handleSendOrUpdate();
    }
  };

  const isInputDisabled = isChannel && !isChannelOwner;

  const canSendMessage = messageContent.trim() !== '' || attachedFiles.length > 0;

  return (
    <div
      className={`${variantsStylesIcons.iconSecondary} relative p-2 md:p-3 rounded-[10px] z-10`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-backdrop)] backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-accent)] rounded-lg z-20">
          <UploadImage className="w-16 h-16 text-[var(--color-text-primary)] mb-2" />
          <span className="text-[var(--color-text-primary)] font-semibold">{t('chat_input.release_to_upload')}</span>
        </div>
      )}
      
      {attachedFiles.length > 0 && (
        <div className="p-2">
          <AttachmentPreview files={attachedFiles} onRemoveFile={handleRemoveFile} />
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3">
        <button
          className="p-2 md:p-3 rounded-full hover:bg-[var(--color-surface)] transition-colors flex-shrink-0"
          onClick={handleFolderClick}
          disabled={isInputDisabled}
        >
          <Folder className="w-6 h-6 text-[var(--color-text-secondary)]" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon, audio/*, video/mp4, application/pdf, application/zip"
          onChange={handleFileChange}
          disabled={isInputDisabled}
        />
        <textarea
          ref={textareaRef}
          rows={1}
          className="w-full rounded-lg p-2 md:p-2.5 text-base resize-none max-h-40 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none transition-shadow"
          placeholder={t('chat_input.type_a_message')}
          value={messageContent}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          disabled={loading || isInputDisabled}
        />
        <button
          className={`p-2 md:p-3 rounded-full transition-colors flex-shrink-0 ${canSendMessage ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]' : 'bg-[var(--color-surface-dark)] cursor-not-allowed'}`}
          onClick={handleSendOrUpdate}
          disabled={!canSendMessage || loading}
        >
          {editingMessage ? (
            <Checkmark className="w-6 h-6 text-[var(--color-text-primary)]" />
          ) : (
            <SendButton className="w-6 h-6 text-[var(--color-text-primary)]" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{t('chat_input.error')}</p>}
    </div>
  );
};

export default ChatInput;