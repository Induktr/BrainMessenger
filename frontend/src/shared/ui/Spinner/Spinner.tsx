import React from 'react';

interface SpinnerProps {
  className?: string;
  children?: React.ReactNode; // Allow children to be passed
}

const Spinner: React.FC<SpinnerProps> = ({ className, children }) => {
  return (
    <div className={`spinner-bubble ${className || ''}`}>
      {children} {/* Render children inside the bubble */}
      <div className="spinner-shimmer"></div>
    </div>
  );
};

export default Spinner;