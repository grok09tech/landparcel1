import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchParams } from '../../types';
import Button from '../UI/Button';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  onClear: () => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, isLoading = false }) => {
  const [field, setField] = useState<SearchParams['field']>('owner_name');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch({ field, value: value.trim() });
    }
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <div className="flex items-center space-x-3">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <select
          value={field}
          onChange={(e) => setField(e.target.value as SearchParams['field'])}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="owner_name">Owner Name</option>
          <option value="parcel_id">Parcel ID</option>
          <option value="address">Address</option>
          <option value="land_use">Land Use</option>
          <option value="region">Region</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder={`Search by ${field.replace('_', ' ')}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button type="submit" size="sm" isLoading={isLoading} disabled={!value.trim()}>
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;