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
      style={{ top: y, left: x, position: 'absolute', zIndex: 1000, background: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
    >
      <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
        {options.map((option, index) => (
          <li key={index} style={{ padding: '8px 12px', cursor: option.disabled ? 'not-allowed' : 'pointer', color: option.disabled ? '#aaa' : 'black' }} onClick={!option.disabled ? option.onClick : undefined}>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;