import React, { useEffect, useRef } from 'react';
import { X, Filter } from 'lucide-react';
import { LocationFilter } from './LocationFilter';
import { TagFilter } from './TagFilter';
import { useSkillStore } from '../../stores/useSkillStore';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  const searchFilters = useSkillStore((state) => state.searchFilters);
  const resetSearchFilters = useSkillStore((state) => state.resetSearchFilters);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (searchFilters.locations.length > 0 && searchFilters.locations.length < 2) {
      count++;
    }
    if (searchFilters.tags.length > 0) {
      count += searchFilters.tags.length;
    }
    return count;
  }, [searchFilters]);

  const handleClearAll = () => {
    resetSearchFilters();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Filter Panel */}
      <div
        ref={panelRef}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col"
        role="dialog"
        aria-label="Filter panel"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span
                className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close filter panel"
          >
            <X className="w-5 h-5 text-gray-700" aria-hidden="true" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <LocationFilter />
          <div className="border-t border-gray-200 pt-4">
            <TagFilter />
          </div>
        </div>

        {/* Footer */}
        {activeFilterCount > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Clear all ${activeFilterCount} filters`}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};
