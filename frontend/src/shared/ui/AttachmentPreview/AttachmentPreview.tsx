import React from 'react';
import Image from 'next/image';
import { 
  Audio, 
  VideoCamera, 
  File,
  Close 
} from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

interface AttachmentPreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ files, onRemoveFile }) => {
  const getFilePreview = (file: File) => {
    const placeholderClasses = "w-full h-full flex items-center justify-center rounded-lg text-[var(--color-text-primary)]";

    if (file.type.startsWith('image/')) {
      return (
        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-lg" />
      );
    } else if (file.type.startsWith('audio/')) {
      return (
        <div className={placeholderClasses}>
          <Audio alt="Audio File" width={32} height={32} />
        </div>
      );
    }
    else if (file.type.startsWith('video/')) {
      return (
        <div className={placeholderClasses}>
          <VideoCamera alt="Video File" width={32} height={32} />
        </div>
      );
    } else {
      return (
        <div className={placeholderClasses}>
          <File alt="Generic File" width={32} height={32} />
        </div>
      );
    }
  };

  return (
    <div className="flex flex-wrap gap-3 p-2">
      {files.map((file, index) => (
        <div key={index} className="relative w-20 h-20 group">
          {getFilePreview(file)}
          <button
            onClick={() => onRemoveFile(index)}
            className="absolute top-0.5 right-0.5 rounded-full p-0.5 transition focus:outline-none"
          >
            <Close alt="Remove File" className={`${variantsStylesIcons.iconSecondary} bg-[var(--color-background)]/75 rounded-[7px] w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5`} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;