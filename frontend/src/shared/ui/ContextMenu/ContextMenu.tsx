import React, { 
  useEffect, 
  useRef,
  useState
} from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; onClick: () => void; disabled?: boolean }[];
  onClose: () => void;
  isEmojiMenu?: boolean; // Add new prop
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose, isEmojiMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

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

  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (x + menuWidth > windowWidth) {
        newX = windowWidth - menuWidth - 10; // Adjust with a small margin
      }
      if (y + menuHeight > windowHeight) {
        newY = windowHeight - menuHeight - 10; // Adjust with a small margin
      }

      setAdjustedX(newX);
      setAdjustedY(newY);
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg shadow-xl z-50 p-2 min-w-[180px]"
      style={{ top: adjustedY, left: adjustedX }}
    >
      <ul className="space-y-1">
        {options.map((option, index) => (
          <li
            key={index}
            className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors duration-150 ${option.disabled
                ? 'text-[var(--color-text-secondary)] cursor-not-allowed'
                : 'hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
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