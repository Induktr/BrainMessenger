import { FC } from 'react';
import LinkPreview from './LinkPreview';

interface LinkRendererProps {
  text: string;
}

const LinkRenderer: FC<LinkRendererProps> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const firstUrl = text.match(urlRegex)?.[0] || null;

  const parts = [firstUrl];

  return (
    <>
      {parts.map((part, index) => {
        if (part?.match(urlRegex)) {
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
      
      {firstUrl && (
        <div className="link-preview-container">
          <LinkPreview url={firstUrl} />
        </div>
      )}
    </>
  );
};

export default LinkRenderer;
