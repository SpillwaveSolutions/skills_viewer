/**
 * TabBar Component
 *
 * Horizontal tab navigation bar displayed at top of SkillViewer.
 * Integrates with keyboardStore for tab switching and keyboard shortcuts.
 *
 * Features:
 * - 6 tabs with icons and labels (Overview, Content, Triggers, Diagram, References, Scripts)
 * - Active tab highlighted with purple border
 * - Keyboard shortcut hints (1-6)
 * - ARIA-compliant for accessibility
 * - Hover states for visual feedback
 *
 * @example
 * ```tsx
 * function SkillViewer() {
 *   const { activeTabIndex, setActiveTabIndex } = useKeyboardStore();
 *
 *   return (
 *     <div>
 *       <TabBar
 *         activeTabIndex={activeTabIndex ?? 0}
 *         onTabChange={setActiveTabIndex}
 *       />
 *       <TabContent activeTab={activeTabIndex} />
 *     </div>
 *   );
 * }
 * ```
 */

import React from 'react';
import { TABS } from '../types/layout';
import { Tab } from './Tab';

export interface TabBarProps {
  /** Currently active tab index (0-5) */
  activeTabIndex: number | null;
  /** Callback when tab is clicked */
  onTabChange: (index: number) => void;
}

/**
 * TabBar component - horizontal navigation for skill viewer
 */
export const TabBar = React.memo<TabBarProps>(({ activeTabIndex, onTabChange }) => {
  return (
    <div
      role="tablist"
      className="flex gap-1 border-b border-gray-200 bg-white px-4 transition-colors duration-150"
      aria-label="Skill content navigation"
    >
      {TABS.map((tab, index) => (
        <Tab
          key={tab.id}
          tab={tab}
          index={index}
          isActive={activeTabIndex === index}
          onClick={() => onTabChange(index)}
        />
      ))}
    </div>
  );
});

TabBar.displayName = 'TabBar';
