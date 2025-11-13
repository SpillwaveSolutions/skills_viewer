/**
 * Component Interface Contract: OverviewTab
 * Feature: 004-ui-ux-polish
 *
 * This contract defines the props and behavior for the OverviewTab component
 * after UI/UX polish improvements.
 */

import { Skill } from '../../../src/types/skill';

/**
 * Props for the OverviewTab component
 */
export interface OverviewTabProps {
  /**
   * The skill to display overview information for
   */
  skill: Skill;
}

/**
 * Display order for skill information in Overview tab
 *
 * REQUIREMENT (FR-002): Must display information in this exact order
 */
export enum OverviewDisplayOrder {
  NAME = 1,          // skill.name (h1)
  LOCATION = 2,      // skill.location badge (claude/opencode)
  DESCRIPTION = 3,   // skill.description (if present)
  VERSION = 4,       // skill.metadata.version (if present)
  TRIGGERS = 5,      // skill.triggers preview (first 5)
  STATS = 6,         // References, Scripts, Triggers count, Lines
  METADATA = 7,      // Remaining metadata (filtered)
}

/**
 * Stats grid data structure
 */
export interface SkillStats {
  referencesCount: number;   // skill.references.length
  scriptsCount: number;      // skill.scripts.length
  triggersCount: number;     // skill.triggers?.length ?? 0
  linesOfContent: number;    // skill.content.split('\n').length
}

/**
 * Filtered metadata (excludes fields already displayed)
 */
export interface FilteredMetadata {
  [key: string]: any;
  // Excludes: name, description, version (already shown above)
}

/**
 * Component behavior contract
 */
export interface OverviewTabBehavior {
  /**
   * Renders skill information in the specified display order
   * @param skill - The skill to render
   * @returns JSX elements in correct order
   */
  renderInOrder(skill: Skill): JSX.Element;

  /**
   * Filters metadata to exclude already-displayed fields
   * @param metadata - Raw metadata from skill
   * @returns Filtered metadata object
   */
  filterMetadata(metadata: Record<string, any>): FilteredMetadata;

  /**
   * Calculates stats for the stats grid
   * @param skill - The skill to calculate stats for
   * @returns Stats object
   */
  calculateStats(skill: Skill): SkillStats;

  /**
   * Renders triggers preview (first 5 triggers)
   * @param triggers - Array of trigger strings
   * @param maxDisplay - Maximum number to display (default: 5)
   * @returns Triggers JSX or null if no triggers
   */
  renderTriggersPreview(triggers?: string[], maxDisplay?: number): JSX.Element | null;
}

/**
 * CSS classes contract for proper spacing
 *
 * REQUIREMENT (FR-001): Minimum 8px margin from borders
 */
export interface OverviewTabStyling {
  container: 'p-6'; // 24px padding for main container
  section: 'space-y-4'; // 16px vertical spacing between sections
  heading: 'mb-2'; // 8px margin bottom for headings
  badge: 'px-3 py-1'; // Padding for location badge
}

/**
 * Accessibility contract
 */
export interface OverviewTabAccessibility {
  /**
   * Skill name heading level
   * WCAG 1.3.1: Info and Relationships
   */
  nameHeadingLevel: 'h1';

  /**
   * Semantic HTML for stats grid
   * Use <dl> for definition list
   */
  statsSemanticTag: 'dl';

  /**
   * Aria label for stats
   */
  statsAriaLabel: 'Skill statistics';
}

/**
 * Test data contract
 */
export interface OverviewTabTestData {
  /**
   * Mock skill with all fields present
   */
  mockSkillComplete: Skill;

  /**
   * Mock skill missing description, version, triggers
   */
  mockSkillMinimal: Skill;

  /**
   * Mock skill with 20+ triggers (test preview truncation)
   */
  mockSkillManyTriggers: Skill;
}
