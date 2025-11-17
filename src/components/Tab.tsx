/**
 * Tab Component
 *
 * Individual tab button used within TabBar.
 * Displays icon, label, and keyboard shortcut hint.
 *
 * Features:
 * - Purple border when active (border-b-2 border-purple-500), subtle shadow (shadow-sm)
 * - Hover state with gray background (hover:bg-gray-700)
 * - Focus ring with purple outline (ring-2 ring-purple-500 ring-offset-2)
 * - Smooth color transitions (transition-colors duration-150)
 * - ARIA-compliant (role="tab", aria-selected, aria-label)
 * - Click handler for tab switching
 *
 * @example
 * ```tsx
 * <Tab
 *   tab={{ id: 'overview', label: 'Overview', icon: '📊', shortcutIndex: 1, ariaLabel: 'Overview tab' }}
 *   index={0}
 *   isActive={true}
 *   onClick={() => handleTabClick(0)}
 * />
 * ```
 */

import React from 'react';
import { TabConfig } from '../types/layout';

export interface TabProps {
  /** Tab configuration (label, icon, etc.) */
  tab: TabConfig;
  /** Tab index (0-5) */
  index: number;
  /** Whether this tab is currently active */
  isActive: boolean;
  /** Click handler */
  onClick: () => void;
}

/**
 * Tab component - individual tab button
 */
export const Tab = React.memo<TabProps>(({ tab, isActive, onClick }) => {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={tab.ariaLabel}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3
        border-b-2 transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white
        ${
          isActive
            ? 'border-purple-500 text-purple-600 bg-purple-50 shadow-sm'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        font-medium text-sm
      `}
    >
      {/* Icon */}
      <span className="text-lg" aria-hidden="true">
        {tab.icon}
      </span>

      {/* Label */}
      <span>{tab.label}</span>

      {/* Keyboard Shortcut Hint */}
      <span
        className={`
          ml-1 text-xs px-1.5 py-0.5 rounded
          ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}
        `}
        aria-hidden="true"
      >
        {tab.shortcutIndex}
      </span>
    </button>
  );
});

Tab.displayName = 'Tab';
