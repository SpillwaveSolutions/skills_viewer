import React, { useRef, useEffect } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search skills..."
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Watch for search focus requests from keyboard shortcuts
  const searchFocusRequested = useKeyboardStore(
    (state) => state.searchFocusRequested
  );
  const setSearchFocusRequested = useKeyboardStore(
    (state) => state.setSearchFocusRequested
  );

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
    <div className="p-3 border-b border-gray-200">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};
