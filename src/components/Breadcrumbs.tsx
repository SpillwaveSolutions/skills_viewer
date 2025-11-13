/**
 * Breadcrumbs Component
 *
 * Displays the current navigation path as clickable breadcrumb items.
 * Features:
 * - Responsive design (collapses on mobile)
 * - ARIA landmarks (nav role)
 * - Truncate long paths
 * - Click to navigate to any breadcrumb
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigationStore } from '../stores/navigationStore';
import { useSkillStore } from '../stores';

export const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useNavigationStore((state) => state.breadcrumbs);
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const selectSkill = useSkillStore((state) => state.selectSkill);

  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];

    // Don't navigate if clicking the active breadcrumb
    if (crumb.isActive) return;

    // Navigate to home (clear selection)
    if (!crumb.entry) {
      selectSkill(null);
      return;
    }

    // Navigate to the breadcrumb's entry
    navigateTo(crumb.entry);

    // Update the skill selection
    if (crumb.entry.skill) {
      selectSkill(crumb.entry.skill);
    }
  };

  return (
    <nav
      className="flex items-center space-x-1 px-4 py-2 bg-gray-50 border-b border-gray-200 overflow-x-auto"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-1 whitespace-nowrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {/* Separator (not shown for first item) */}
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {/* Breadcrumb button */}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              disabled={crumb.isActive}
              className={`
                px-2 py-1 rounded text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                ${
                  crumb.isActive
                    ? 'text-gray-900 font-medium cursor-default'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                }
              `}
              aria-current={crumb.isActive ? 'page' : undefined}
              aria-label={`Navigate to ${crumb.label}`}
            >
              <span className="max-w-[150px] sm:max-w-[200px] md:max-w-xs truncate inline-block align-bottom">
                {crumb.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
