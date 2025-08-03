import React from 'react';
import Image from 'next/image';
import { 
  Audio, 
  VideoCamera, 
  File,
  Close 
} from '@/shared/assets/Icons/icons';

interface AttachmentPreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ files, onRemoveFile }) => {
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <img src={URL.createObjectURL(file)} alt={file.name} className="attachment-preview-image" />
      );
    } else if (file.type.startsWith('audio/')) {
      return (
        <div className="attachment-preview-placeholder">
          <Audio alt="Audio File" width={32} height={32} className="attachment-preview-image-audio" />
        </div>
      );
    }
    else if (file.type === 'video/mp4') {
      return (
        <div className="attachment-preview-placeholder">
          <VideoCamera alt="Video File" width={32} height={32} />
        </div>
      );
    } else {
      return (
        <div className="attachment-preview-placeholder">
          <File alt="Generic File" width={32} height={32} className="attachment-preview-image-file" />
        </div>
      );
    }
  };

  return (
    <div className="attachment-preview-container">
      {files.map((file, index) => (
        <div key={index} className="attachment-preview-item">
          {getFilePreview(file)}
          <button
            onClick={() => onRemoveFile(index)}
            className="attachment-preview-remove-button"
          >
            <Close alt="Remove File" width={20} height={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;