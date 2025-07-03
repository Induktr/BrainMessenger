import React from 'react';

interface LazyLoadingProps {
  className?: string;
  children?: React.ReactNode; // Allow children to be passed
}

const LazyLoading: React.FC<LazyLoadingProps> = ({ className, children }) => {
  return (
    <div className={`lazy-loading-bubble ${className || ''}`}>
      {children} {/* Render children inside the bubble */}
      <div className="lazy-loading-shimmer"></div>
    </div>
  );
};

export default LazyLoading;