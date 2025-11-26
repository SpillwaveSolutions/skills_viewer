/**
 * Layout type definitions for Feature 016: Improved UI Layout with Top Tabs
 *
 * This file defines all types for:
 * - Layout modes (standard vs compact)
 * - Breadcrumb navigation segments
 * - Tab configuration and state
 * - Header state variations
 * - Inline statistics
 */

/**
 * Layout mode types
 * - standard: Full header with description section
 * - compact: Minimal header with inline stats only
 */
export type LayoutMode = 'standard' | 'compact';

/**
 * Inline statistics shown in compact mode header
 */
export interface InlineStats {
  references: number;
  scripts: number;
  triggers: number;
  lines: number;
}

/**
 * Breadcrumb segment representing one level in the hierarchy
 */
export interface BreadcrumbSegment {
  id: string; // 'home' | 'skill' | 'tab'
  label: string; // Display text (e.g., 'Home', skill name, tab name)
  clickable: boolean; // Can this segment be clicked?
  ariaLabel?: string; // Accessibility label (e.g., 'Navigate to home')
  onClick?: () => void; // Navigation handler
}

/**
 * Individual tab configuration
 */
export interface TabConfig {
  id: string; // 'overview' | 'content' | 'triggers' | 'diagram' | 'references' | 'scripts'
  label: string; // Display text (e.g., 'Overview', 'Content')
  icon: string; // Emoji icon (e.g., '📊', '📄')
  shortcutIndex: number; // Keyboard shortcut (1-6 for Cmd/Ctrl+1-6)
  ariaLabel: string; // Accessibility label (e.g., 'Overview tab')
}

/**
 * Skill header state (changes based on layout mode)
 */
export interface HeaderState {
  title: string; // Skill name
  badge: string; // Location badge (e.g., 'user', 'system')
  mode: LayoutMode; // 'standard' | 'compact'
  description?: string; // Full description (standard mode only)
  inlineStats?: InlineStats; // Stats (compact mode only)
}

/**
 * Tab definitions constant - all 7 tabs in fixed order
 */
export const TABS: readonly TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    shortcutIndex: 1,
    ariaLabel: 'Overview tab',
  },
  {
    id: 'content',
    label: 'Content',
    icon: '📄',
    shortcutIndex: 2,
    ariaLabel: 'Content tab',
  },
  {
    id: 'triggers',
    label: 'Triggers',
    icon: '⚡',
    shortcutIndex: 3,
    ariaLabel: 'Triggers tab',
  },
  {
    id: 'diagram',
    label: 'Diagram',
    icon: '🔷',
    shortcutIndex: 4,
    ariaLabel: 'Diagram tab',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    icon: '🎯',
    shortcutIndex: 5,
    ariaLabel: 'Evaluation tab - Spec compliance and PDA analysis',
  },
  {
    id: 'references',
    label: 'References',
    icon: '📚',
    shortcutIndex: 6,
    ariaLabel: 'References tab',
  },
  {
    id: 'scripts',
    label: 'Scripts',
    icon: '📜',
    shortcutIndex: 7,
    ariaLabel: 'Scripts tab',
  },
] as const;
