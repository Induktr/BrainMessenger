import React, { 
  useState, 
  useEffect
} from 'react';
import { 
  twMerge 
} from 'tailwind-merge';

interface InputCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>; // Add onKeyDown prop
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>; // Add onPaste prop
  inputRef?: React.RefObject<HTMLInputElement | null>; // Allow null in the ref object
  className?: string;
}

const InputCell: React.FC<InputCellProps> = ({ value, onChange, onKeyDown, onPaste, inputRef, className }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log(`InputCell handleChange: received value "${newValue}"`); // Log received value
    // Only allow a single character
    if (newValue.length <= 1) {
      setLocalValue(newValue);
      onChange(newValue); // Still call parent onChange to update the main state
    }
  };

  return (
    <input
      type="tel" // Changed type to tel
      maxLength={1}
      value={localValue}
      onChange={handleChange}
      onKeyDown={onKeyDown} // Pass onKeyDown prop
      onPaste={onPaste} // Pass onPaste prop
      ref={inputRef}
      className={twMerge(
        "w-12 h-12 text-center text-2xl font-bold rounded-lg",
        "bg-[var(--color-input-background)] text-[var(--color-text-primary)] border border-[var(--color-border)]",
        "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none",
        "transition-all duration-200 ease-in-out",
        className
      )}
    />
  );
};

export default InputCell;