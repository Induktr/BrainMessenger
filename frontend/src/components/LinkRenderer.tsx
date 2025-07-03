import React from 'react';
import LinkPreview from './LinkPreview'; // Import the new component

interface LinkRendererProps {
  text: string;
}

const LinkRenderer: React.FC<LinkRendererProps> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  // Find the first URL in the message to use for the preview
  const firstUrl = parts.find(part => part.match(urlRegex)) || null;

  return (
    <>
      {/* Render all parts of the message, including all links as text */}
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-link"
            >
              {part}
            </a>
          );
        }
        return part;
      })}

      {/* After rendering all message parts, render the preview for the first URL */}
      {firstUrl && (
        <div className="link-preview-container">
          <LinkPreview url={firstUrl} />
        </div>
      )}
    </>
  );
};

export default LinkRenderer;
