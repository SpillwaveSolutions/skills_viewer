/**
 * Component Interface Contract: SkillList
 * Feature: 004-ui-ux-polish
 *
 * This contract defines the props and behavior for the SkillList component
 * with proper spacing and text truncation.
 */

import { Skill } from '../../../src/types/skill';

/**
 * Props for the SkillList component
 */
export interface SkillListProps {
  /**
   * Array of skills to display in the list
   */
  skills: Skill[];

  /**
   * Path of the currently selected skill (for highlighting)
   */
  selectedSkillPath: string | null;

  /**
   * Callback when a skill is selected
   */
  onSelectSkill: (skill: Skill) => void;
}

/**
 * Local state for SkillList component
 */
export interface SkillListState {
  /**
   * Path of the skill currently being hovered (for tooltip display)
   */
  hoveredSkillPath: string | null;
}

/**
 * Text truncation behavior contract
 *
 * REQUIREMENT (FR-004): Truncate text exceeding container width with ellipsis
 * REQUIREMENT (FR-005): Display full text in tooltip on hover
 */
export interface TextTruncationBehavior {
  /**
   * Determines if text should be truncated
   * @param text - The text to check
   * @param maxWidth - Maximum width in pixels
   * @returns true if truncation needed
   */
  shouldTruncate(text: string, maxWidth: number): boolean;

  /**
   * Gets the full text for tooltip display
   * @param skill - The skill whose name is truncated
   * @returns Full skill name for tooltip
   */
  getTooltipText(skill: Skill): string;

  /**
   * Handles hover events for tooltip display
   * @param skillPath - Path of the hovered skill
   */
  onHoverStart(skillPath: string): void;

  /**
   * Handles mouse leave events
   */
  onHoverEnd(): void;
}

/**
 * CSS classes contract for proper spacing and truncation
 *
 * REQUIREMENT (FR-001): Minimum 8px margin from borders
 */
export interface SkillListStyling {
  container: 'p-4'; // 16px padding for container
  listItem: 'px-4 py-3 cursor-pointer hover:bg-gray-100'; // 16px horizontal, 12px vertical
  skillName: 'truncate font-medium'; // Text truncation applied
  skillMeta: 'text-sm text-gray-600 truncate'; // Metadata also truncates
  selectedItem: 'bg-blue-50 border-l-4 border-blue-500'; // Selected state
}

/**
 * Accessibility contract
 */
export interface SkillListAccessibility {
  /**
   * Semantic list structure
   * WCAG 1.3.1: Info and Relationships
   */
  semanticTag: 'ul';

  /**
   * List item role
   */
  listItemRole: 'listitem';

  /**
   * Keyboard navigation support
   * WCAG 2.1.1: Keyboard accessible
   */
  keyboardNavigation: {
    arrowDown: 'Select next skill';
    arrowUp: 'Select previous skill';
    enter: 'Open selected skill';
    home: 'Jump to first skill';
    end: 'Jump to last skill';
  };

  /**
   * Aria labels for truncated text
   * WCAG 1.1.1: Non-text Content
   */
  truncatedTextAriaLabel: string; // e.g., "skill-name-very-long-truncated"

  /**
   * Native title attribute for tooltip
   * WCAG 1.4.4: Resize Text (full text always accessible)
   */
  titleAttribute: string; // Full skill name
}

/**
 * Component behavior contract
 */
export interface SkillListBehavior {
  /**
   * Renders a single skill list item
   * @param skill - The skill to render
   * @param isSelected - Whether this skill is currently selected
   * @param isHovered - Whether this skill is currently hovered
   * @returns JSX element for the list item
   */
  renderSkillItem(
    skill: Skill,
    isSelected: boolean,
    isHovered: boolean
  ): JSX.Element;

  /**
   * Filters skills based on search query (if search is present)
   * @param skills - All skills
   * @param searchQuery - Search query string
   * @returns Filtered skills
   */
  filterSkills(skills: Skill[], searchQuery: string): Skill[];

  /**
   * Sorts skills by name, location, or other criteria
   * @param skills - Skills to sort
   * @param sortBy - Sort criteria
   * @returns Sorted skills
   */
  sortSkills(skills: Skill[], sortBy: SkillSortCriteria): Skill[];
}

/**
 * Sort criteria for skills
 */
export enum SkillSortCriteria {
  NAME_ASC = 'name-asc',
  NAME_DESC = 'name-desc',
  LOCATION = 'location',
  RECENT = 'recent',
}

/**
 * Test data contract
 */
export interface SkillListTestData {
  /**
   * Mock skill with extremely long name (200+ characters)
   * Tests truncation behavior
   */
  mockSkillLongName: Skill;

  /**
   * Mock skill list with 100 items
   * Tests performance and scrolling
   */
  mockLargeSkillList: Skill[];

  /**
   * Mock skill with special characters in name
   * Tests character encoding and rendering
   */
  mockSkillSpecialChars: Skill;

  /**
   * Mock empty skill list
   * Tests empty state rendering
   */
  mockEmptyList: Skill[];
}

/**
 * Performance requirements
 *
 * REQUIREMENT (Constitution Principle V): 60fps rendering
 */
export interface SkillListPerformance {
  /**
   * Maximum render time for list with 100 items
   */
  maxRenderTime: 100; // milliseconds

  /**
   * Maximum time for scroll event handling
   */
  maxScrollHandlingTime: 16; // milliseconds (60fps = 16ms per frame)

  /**
   * Virtualization threshold (number of items before virtualization kicks in)
   */
  virtualizationThreshold: 1000; // items
}
