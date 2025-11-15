/**
 * TabAnnouncer Component
 *
 * Provides screen reader announcements for tab changes (T055).
 * Uses ARIA live region to announce active tab changes.
 *
 * Features:
 * - Invisible to sighted users (sr-only)
 * - Announces tab name when changed
 * - Uses aria-live="polite" for non-intrusive announcements
 * - Updates immediately on tab change
 *
 * @example
 * ```tsx
 * <TabAnnouncer activeTabIndex={activeTabIndex} />
 * ```
 */

import React, { useEffect, useState } from 'react';
import { TABS } from '../types/layout';

export interface TabAnnouncerProps {
  /** Currently active tab index (0-5) */
  activeTabIndex: number | null;
}

/**
 * TabAnnouncer - Provides screen reader announcements for tab changes
 */
export const TabAnnouncer = React.memo<TabAnnouncerProps>(({ activeTabIndex }) => {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (activeTabIndex !== null && activeTabIndex >= 0 && activeTabIndex < TABS.length) {
      const tabName = TABS[activeTabIndex].label;
      setAnnouncement(`${tabName} tab active`);
    }
  }, [activeTabIndex]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
});

TabAnnouncer.displayName = 'TabAnnouncer';
