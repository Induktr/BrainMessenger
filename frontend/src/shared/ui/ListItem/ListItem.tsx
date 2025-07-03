import React from 'react';
import Image from 'next/image';

interface ListItemProps {
  iconName?: string; // Optional icon name
  text: string;
  onClick?: () => void; // Optional click handler
  className?: string; // Optional additional classes
}

const ListItem: React.FC<ListItemProps> = ({ iconName, text, onClick, className }) => {
  return (
    <div
      className={`list-item ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {iconName && (
        <Image src="" alt={iconName} className="list-item-icon" /> // Basic icon styling
      )}
      <span className="list-item-text">{text}</span>
    </div>
  );
};

export default ListItem;