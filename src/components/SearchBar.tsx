import React, { useRef, useEffect, useState } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';
import { Search, HelpCircle } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search skills...',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Watch for search focus requests from keyboard shortcuts
  const searchFocusRequested = useKeyboardStore((state) => state.searchFocusRequested);
  const setSearchFocusRequested = useKeyboardStore((state) => state.setSearchFocusRequested);

  // Handle Cmd/Ctrl+F focus request
  useEffect(() => {
    if (searchFocusRequested && inputRef.current) {
      // Focus the input
      inputRef.current.focus();

      // Select existing text if any
      if (value) {
        inputRef.current.select();
      }

      // Reset the focus request flag
      setSearchFocusRequested(false);
    }
  }, [searchFocusRequested, value, setSearchFocusRequested]);

  // Handle Escape key to clear search
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      // Clear search value
      onChange('');

      // Blur input to remove focus
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }

  return (
    <div role="search" className="p-4 border-b border-gray-200 space-y-2">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search skills by name, description, or location. Supports operators like AND, OR, NOT, and field-specific queries."
          aria-describedby="search-hint search-help"
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle search syntax help"
          aria-expanded={showHelp}
        >
          <HelpCircle className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </button>
      </div>

      {showHelp && (
        <div
          id="search-help"
          className="text-xs bg-blue-50 border border-blue-200 rounded p-3 space-y-2"
        >
          <p className="font-semibold text-blue-900">Search Syntax:</p>
          <ul className="space-y-1 text-blue-800">
            <li>
              <code className="bg-blue-100 px-1 rounded">name:pdf</code> - Search in name field
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">description:excel</code> - Search in
              description
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">location:claude</code> - Search in location
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">pdf AND excel</code> - Both terms required
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">pdf OR docx</code> - Either term required
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">pdf NOT pptx</code> - Include pdf, exclude
              pptx
            </li>
          </ul>
        </div>
      )}

      <span id="search-hint" className="sr-only">
        Press Escape to clear search. Use operators like AND, OR, NOT for advanced search. Use
        field: syntax for field-specific search.
      </span>
    </div>
  );
};
