'use client';

import React from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import Input from '@/shared/ui/Input/Input';
import { 
  Search 
} from '@/shared/assets/Icons/icons';

interface SearchWidgetProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchWidget: React.FC<SearchWidgetProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder,
}) => {
  const { t } = useTranslation();
  return (
    <Input
      type="text"
      id="search"
      placeholder={placeholder ?? t('search.placeholder')}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      icon={<Search className="w-5 h-5 text-[var(--color-text-secondary)]" />}
      className="w-full sticky bottom-0"
    />
  );
};

export default SearchWidget;