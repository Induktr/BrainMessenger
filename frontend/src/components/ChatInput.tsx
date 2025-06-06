'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE } from '@/graphql/queries'; // Assuming mutations are in queries.ts for now
import Input from '@/components/Input';
import Button from '@/components/Button';
import Image from 'next/image'; // Import Image component
import { icons } from '@/app/lib/constants'; // Import icons
import AttachmentPreview from './AttachmentPreview'; // Import the new AttachmentPreview component

interface ChatInputProps {
  chatId: string;
  editingMessage: { id: string; content: string } | null;
  setEditingMessage: (message: { id: string; content: string } | null) => void;
  onSendMessageOrUpdate: (content: string, files: File[]) => Promise<void>;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatId, editingMessage, setEditingMessage, onSendMessageOrUpdate }) => {
  const [messageContent, setMessageContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sendMessage, { loading, error }] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (editingMessage) {
      setMessageContent(editingMessage.content);
    } else {
      setMessageContent('');
    }
  }, [editingMessage]);

  const handleSendOrUpdate = async () => {
    if (messageContent.trim() === '' && attachedFiles.length === 0) {
      return; // Don't send empty messages or messages with no content and no files
    }
 
    await onSendMessageOrUpdate(messageContent, attachedFiles);
    setMessageContent(''); // Clear input after sending
    setEditingMessage(null); // Clear editing state
    setAttachedFiles([]); // Clear attached files after sending
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
    setAttachedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendOrUpdate();
    }
  };

  return (
    <div className="chat-input-wrapper">
      {attachedFiles.length > 0 && (
        <AttachmentPreview files={attachedFiles} onRemoveFile={handleRemoveFile} />
      )}
      <div className="chat-input-container">
        <Button className="folder-button" onClick={handleFolderClick}>
          <Image src={icons.folder} alt="Folder" width={24} height={24} />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon, audio/*, video/mp4, application/pdf, application/zip"
          onChange={handleFileChange}
        />
        <Input
          type="text"
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste} // Add onPaste handler
          disabled={loading} // Disable input while sending
        />
        <Button onClick={handleSendOrUpdate} disabled={loading} className="send-button">
          <Image src={editingMessage ? icons.checkmark : icons.sendButton} alt={editingMessage ? "Confirm Edit" : "Send"} width={24} height={24} />
        </Button>
        {error && <p>Error sending message: {error.message}</p>}
      </div>
    </div>
  );
};

export default ChatInput;