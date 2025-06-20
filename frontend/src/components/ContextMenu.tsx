import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; onClick: () => void; disabled?: boolean }[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: y, left: x }} // Keep position and coordinates as inline styles
    >
      <ul className="context-menu-list">
        {options.map((option, index) => (
          <li
            key={index}
            className={`context-menu-item ${option.disabled ? 'disabled' : ''}`}
            onClick={!option.disabled ? option.onClick : undefined}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;