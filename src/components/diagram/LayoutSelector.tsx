import React from 'react';

export type DiagramLayout = 'TD' | 'LR';

interface LayoutSelectorProps {
  currentLayout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
      <button
        onClick={() => onLayoutChange('TD')}
        className={`px-3 py-2 rounded text-sm transition-colors ${
          currentLayout === 'TD' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
        }`}
        aria-pressed={currentLayout === 'TD'}
        title="Top to bottom layout"
      >
        Top-Down
      </button>
      <button
        onClick={() => onLayoutChange('LR')}
        className={`px-3 py-2 rounded text-sm transition-colors ${
          currentLayout === 'LR' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
        }`}
        aria-pressed={currentLayout === 'LR'}
        title="Left to right layout"
      >
        Left-Right
      </button>
    </div>
  );
};
