import React, { useEffect, useState } from 'react';

/**
 * ARIA Live Announcer Component
 *
 * Provides accessible screen reader announcements for keyboard navigation.
 * Uses ARIA live regions to announce state changes without interrupting user flow.
 *
 * @since Feature 019: Keyboard Shortcuts MVP
 */

export interface AriaLiveAnnouncerProps {
  /**
   * Message to announce to screen readers
   *
   * When this prop changes, the new message is announced after a brief delay
   * to ensure screen readers detect the change.
   */
  message: string;

  /**
   * ARIA live region politeness level
   *
   * - 'polite': Wait for user to finish current action (default, recommended)
   * - 'assertive': Interrupt immediately (use sparingly for critical alerts)
   */
  politeness?: 'polite' | 'assertive';
}

/**
 * ARIA Live Announcer Component
 *
 * Renders an invisible live region that announces messages to screen readers.
 * Used for keyboard navigation feedback (e.g., "Search focused", "Tab 2 of 6").
 *
 * @example
 * ```tsx
 * function SearchBar() {
 *   const [announcement, setAnnouncement] = useState('');
 *
 *   function handleFocus() {
 *     setAnnouncement('Search field focused. Type to search skills.');
 *   }
 *
 *   return (
 *     <>
 *       <input onFocus={handleFocus} />
 *       <AriaLiveAnnouncer message={announcement} />
 *     </>
 *   );
 * }
 * ```
 */
export function AriaLiveAnnouncer({
  message,
  politeness = 'polite',
}: AriaLiveAnnouncerProps): React.ReactElement {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Delay announcement slightly to ensure screen readers detect the change
    // This prevents race conditions where the DOM updates but screen readers
    // don't notice because the content changed too quickly
    const timer = setTimeout(() => {
      setAnnouncement(message);
    }, 100);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      data-testid="aria-live-announcer"
    >
      {announcement}
    </div>
  );
}
