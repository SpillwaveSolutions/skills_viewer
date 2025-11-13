/**
 * TypeScript types for navigation system
 *
 * These types define the structure for navigation history, breadcrumbs,
 * and navigation entries for the skill viewer navigation system.
 */

import { Skill } from './index';

/**
 * Navigation entry type - defines what kind of view we're navigating to
 */
export type NavigationType = 'skill' | 'reference' | 'script' | 'search';

/**
 * Navigation entry - represents a single location in navigation history
 */
export interface NavigationEntry {
  /** Type of navigation entry */
  type: NavigationType;

  /** Skill being viewed */
  skill: Skill | null;

  /** Tab being viewed (for skill views) */
  tab?: string;

  /** Reference index (for reference views) */
  referenceIndex?: number;

  /** Reference path (for reference views) */
  referencePath?: string;

  /** Script index (for script views) */
  scriptIndex?: number;

  /** Search query (for search results) */
  searchQuery?: string;

  /** Timestamp of navigation */
  timestamp: number;

  /** Human-readable label for this entry */
  label: string;
}

/**
 * Breadcrumb item for display in breadcrumb trail
 */
export interface Breadcrumb {
  /** Display label */
  label: string;

  /** Navigation entry to return to when clicked */
  entry: NavigationEntry | null;

  /** Whether this is the current/active breadcrumb */
  isActive: boolean;
}
