'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import Image from 'next/image';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  registration?: UseFormRegisterReturn;
  error?: string;
  icon?: React.ReactNode; // Added icon prop
  iconPath?: string; // Added iconPath prop
}

const Input: React.FC<InputProps> = ({ label, registration, error, id, icon, iconPath, ...rest }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-container ${error ? 'input-field-error' : ''}`}> {/* New container for icon and input */}
        {(icon || iconPath) && ( // Check if either icon or iconPath exists
          <div className="input-icon">
            {iconPath ? ( // If iconPath exists, use img tag
              <Image src={iconPath} alt="Input icon" className="icon" width={24} height={24} /> // Added alt and class
            ) : (
              icon // Otherwise, use the provided icon node
            )}
          </div>
        )} {/* Icon wrapper */}
        <input
          id={id}
          {...registration}
          {...rest}
          className="input-field"
        />
      </div>
      {/* Error message will be handled by the parent component */}
    </div>
  );
};

export default Input;