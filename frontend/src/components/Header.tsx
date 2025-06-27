import React from 'react';
import Input from '@/components/Input';
import Image from 'next/image';

import Button from './Button';


interface HeaderProps {
  title?: string; // Optional title for pages without a search bar
  status?: string; // Optional status for chat header
  rightIcons?: { name: string; onClick: () => void; }[]; // Optional array of right-aligned icons
}

const Header: React.FC<HeaderProps> = ({ title, status, rightIcons }) => {


  return (
    <header className="app-header">
      {/* Left Section: Menu Icon Placeholder */}
      <Image src="" alt="menu" className="header-icon" /> {/* Using the reusable Icon component */}

      {/* Center Section: Title or Search Bar Placeholder */}
      <div className="header-center-section">
        {title ? (
          <>
            <h1 className="header-title">{title}</h1>
            {status && <span className="header-status">{status}</span>} {/* Display status if provided */}
          </>
        ) : (
          <Input
            type="text"
            placeholder="Search"
            className="header-search-input"
          />
        )}
      </div>

      {/* Right Section: Action Icons Placeholder */}
      <div className="header-right-section">

        {rightIcons && rightIcons.map((icon, index) => (
          <Image src="" key={index} alt={icon.name} className="header-icon" onClick={icon.onClick} />
        ))}
      </div>
    </header>
  );
};

export default Header;