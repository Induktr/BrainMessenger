import React from 'react';

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children, className }) => {
  return (
    <div className={className}>
      <h3 className="font-semibold text-sm lg:text-base sm:text-sm mb-2">{title}</h3>
      <div className="text-sm text-[var(--color-text-secondary)]">
        {children}
      </div>
    </div>
  );
};

export default ContentSection;