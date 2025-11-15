/**
 * Component: BreadcrumbNavigation
 *
 * Displays breadcrumb trail showing current location in navigation hierarchy:
 * - Format: Home › Skill Name › Tab Name
 * - Active segment is NOT clickable
 * - Previous segments are clickable for navigation
 * - Includes back/forward navigation arrows
 *
 * Features:
 * - Semantic HTML (nav, ol, li)
 * - ARIA attributes for accessibility
 * - Long skill names truncated with tooltip
 * - Dark background (#2d2d2d)
 * - Integration with navigationStore for history navigation
 */

import React from 'react';
import { useNavigationStore } from '../stores/navigationStore';
import { useBreadcrumbSegments } from '../hooks/useBreadcrumbSegments';

/**
 * BreadcrumbNavigation component
 */
export const BreadcrumbNavigation: React.FC = () => {
  const segments = useBreadcrumbSegments();
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const canGoForward = useNavigationStore((state) => state.canGoForward);
  const goBack = useNavigationStore((state) => state.goBack);
  const goForward = useNavigationStore((state) => state.goForward);

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-3 border-b border-gray-700"
    >
      {/* Back/Forward Navigation Arrows */}
      <div className="flex items-center gap-1">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          aria-label="Back"
          className={`
            px-2 py-1 rounded transition-colors duration-200
            ${
              canGoBack
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }
          `}
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          aria-label="Forward"
          className={`
            px-2 py-1 rounded transition-colors duration-200
            ${
              canGoForward
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }
          `}
        >
          →
        </button>
      </div>

      {/* Separator between arrows and breadcrumb */}
      <div className="h-4 w-px bg-gray-600" />

      {/* Breadcrumb Trail */}
      <ol className="flex items-center gap-2 text-sm">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const isActive = !segment.clickable;

          return (
            <li key={segment.id} className="flex items-center gap-2">
              {segment.clickable ? (
                <button
                  onClick={segment.onClick}
                  aria-label={segment.ariaLabel}
                  title={segment.label}
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 truncate max-w-xs"
                >
                  {segment.label}
                </button>
              ) : (
                <span
                  aria-current={isActive ? 'page' : undefined}
                  title={segment.label}
                  className="text-gray-300 font-medium truncate max-w-xs"
                >
                  {segment.label}
                </span>
              )}

              {/* Separator (›) between segments */}
              {!isLast && (
                <span aria-hidden="true" className="text-gray-500">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
