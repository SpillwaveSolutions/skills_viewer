import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

export type DiagramLayout = 'TD' | 'LR';

interface LayoutSelectorProps {
  layout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;
  className?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layout,
  onLayoutChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 bg-gray-100 rounded px-2 py-1 ${className}`}>
      <span className="text-xs font-medium text-gray-600 mr-1">Layout:</span>
      <button
        onClick={() => onLayoutChange('TD')}
        className={`p-2 rounded transition-colors ${
          layout === 'TD'
            ? 'bg-indigo-100 border border-indigo-300'
            : 'bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        aria-label="Top to bottom layout"
        title="Top to Bottom"
        aria-pressed={layout === 'TD'}
      >
        <ArrowDown className={`w-4 h-4 ${layout === 'TD' ? 'text-indigo-700' : 'text-gray-700'}`} />
      </button>
      <button
        onClick={() => onLayoutChange('LR')}
        className={`p-2 rounded transition-colors ${
          layout === 'LR'
            ? 'bg-indigo-100 border border-indigo-300'
            : 'bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        aria-label="Left to right layout"
        title="Left to Right"
        aria-pressed={layout === 'LR'}
      >
        <ArrowRight
          className={`w-4 h-4 ${layout === 'LR' ? 'text-indigo-700' : 'text-gray-700'}`}
        />
      </button>
    </div>
  );
};
