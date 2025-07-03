'use client';

import React from 'react';
import Input from '@/shared/ui/Input/Input';

interface SearchWidgetProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchWidget: React.FC<SearchWidgetProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
}) => {
  return (
    <div className="search-input-container">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchWidget;