/**
 * Hook: useBreadcrumbSegments
 *
 * Generates breadcrumb segments based on current navigation state:
 * - No skill selected: ["Home"]
 * - Skill selected: ["Home", "Skill Name", "Tab Name"]
 *
 * Features:
 * - Active segment is NOT clickable
 * - Previous segments are clickable with navigation handlers
 * - Long skill names are truncated with ellipsis
 * - ARIA labels for accessibility
 */

import { useMemo } from 'react';
import { useSkillStore } from '../stores/useSkillStore';
import { useKeyboardStore } from '../stores/keyboardStore';
import { TABS } from '../types/layout';
import type { BreadcrumbSegment } from '../types/layout';

/**
 * Maximum length for skill names before truncation
 */
const MAX_SKILL_NAME_LENGTH = 40;

/**
 * Truncate text with ellipsis if longer than maxLength
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Custom hook to generate breadcrumb segments
 *
 * @returns Array of breadcrumb segments
 */
export const useBreadcrumbSegments = (): BreadcrumbSegment[] => {
  const selectedSkill = useSkillStore((state) => state?.selectedSkill);
  const selectSkill = useSkillStore((state) => state?.selectSkill);
  const activeTabIndex = useKeyboardStore((state) => state?.activeTabIndex);
  const setActiveTabIndex = useKeyboardStore((state) => state?.setActiveTabIndex);

  return useMemo(() => {
    const segments: BreadcrumbSegment[] = [];

    // Always include "Home" segment
    if (!selectedSkill) {
      // On home screen - Home is not clickable
      segments.push({
        id: 'home',
        label: 'Home',
        clickable: false,
        ariaLabel: 'Home',
      });
    } else {
      // Viewing a skill - Home is clickable
      segments.push({
        id: 'home',
        label: 'Home',
        clickable: true,
        ariaLabel: 'Navigate to Home',
        onClick: () => {
          if (selectSkill) {
            selectSkill(null);
          }
        },
      });

      // Add skill segment
      const skillName = truncateText(selectedSkill.name || 'Unknown Skill', MAX_SKILL_NAME_LENGTH);
      const isOnFirstTab = activeTabIndex === 0 || activeTabIndex === null;
      const fullSkillName = selectedSkill.name || 'Unknown Skill';

      segments.push({
        id: 'skill',
        label: skillName,
        clickable: !isOnFirstTab,
        ariaLabel: isOnFirstTab ? fullSkillName : `Navigate to ${fullSkillName}`,
        onClick: isOnFirstTab
          ? undefined
          : () => {
              // Navigate back to first tab (Overview)
              if (setActiveTabIndex) {
                setActiveTabIndex(0);
              }
            },
      });

      // Add tab segment
      const tabIndex = activeTabIndex ?? 0;
      const tab = TABS[tabIndex] ?? TABS[0]; // Fallback to first tab if out of range

      segments.push({
        id: 'tab',
        label: tab.label,
        clickable: false,
        ariaLabel: tab.label,
      });
    }

    return segments;
  }, [selectedSkill, activeTabIndex, selectSkill, setActiveTabIndex]);
};
