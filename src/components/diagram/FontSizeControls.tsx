import React from 'react';

interface FontSizeControlsProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onReset: () => void;
}

export const FontSizeControls: React.FC<FontSizeControlsProps> = ({
  fontSize,
  onIncrease,
  onDecrease,
  onReset,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Text Size:</span>
      <button
        onClick={onDecrease}
        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium"
        title="Decrease text size"
        aria-label="Decrease text size"
      >
        A−
      </button>
      <span className="text-xs text-gray-600 font-mono min-w-[3ch] text-center">{fontSize}px</span>
      <button
        onClick={onIncrease}
        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium"
        title="Increase text size"
        aria-label="Increase text size"
      >
        A+
      </button>
      <button
        onClick={onReset}
        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs"
        title="Reset text size to default (14px)"
        aria-label="Reset text size"
      >
        Reset
      </button>
    </div>
  );
};
