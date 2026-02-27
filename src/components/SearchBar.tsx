import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onUseLocation: () => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onUseLocation, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg sticky top-4 z-10 mx-4">
      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مدينة... (بالإنجليزية فقط، مثل: Amman)"
          className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-400 bg-white/80 shadow-inner"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
        >
          بحث
        </button>
      </form>
      <button
        onClick={onUseLocation}
        disabled={isLoading}
        className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span>موقعي</span>
      </button>
    </div>
  );
};

export default SearchBar;