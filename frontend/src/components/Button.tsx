import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  initialState?: boolean; // Prop to indicate initial state for styling
  type?: 'button' | 'submit' | 'reset'; // Explicitly include type
  onClick?: React.MouseEventHandler<HTMLButtonElement>; // Explicitly include onClick
  disabled?: boolean; // Explicitly include disabled
  // Add other standard button attributes as needed
}

const Button: React.FC<ButtonProps> = ({ children, className, initialState, ...rest }) => {
  return (
    <button
      className={`${className} ${initialState ? 'initial-state' : ''}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;