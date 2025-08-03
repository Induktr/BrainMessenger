import React from 'react';

interface InputPanelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const InputPanel: React.FC<InputPanelProps> = ({ className, ...props }) => {
  return (
    <input
      className={`${className || ''}`}
      {...props}
    />
  );
};

export default InputPanel;