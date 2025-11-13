/**
 * NavigationControls Component
 *
 * Provides back/forward navigation buttons with:
 * - Visual disabled states
 * - Tooltips showing destinations
 * - Keyboard shortcut hints (Alt+Left/Right)
 * - Icons from lucide-react
 * - ARIA labels for accessibility
 */

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigationStore } from '../stores/navigationStore';
import { useSkillStore } from '../stores';

export const NavigationControls: React.FC = () => {
  const { history, currentIndex, canGoBack, canGoForward, goBack, goForward } =
    useNavigationStore();
  const selectSkill = useSkillStore((state) => state.selectSkill);

  const handleGoBack = () => {
    if (!canGoBack) return;

    goBack();

    // Update skill selection based on new current entry
    const newIndex = currentIndex - 1;
    const entry = history[newIndex];
    if (entry?.skill) {
      selectSkill(entry.skill);
    } else {
      selectSkill(null);
    }
  };

  const handleGoForward = () => {
    if (!canGoForward) return;

    goForward();

    // Update skill selection based on new current entry
    const newIndex = currentIndex + 1;
    const entry = history[newIndex];
    if (entry?.skill) {
      selectSkill(entry.skill);
    } else {
      selectSkill(null);
    }
  };

  // Get previous/next entry labels for tooltips
  const getPreviousLabel = (): string | null => {
    if (!canGoBack || currentIndex <= 0) return null;
    return history[currentIndex - 1]?.label || 'Previous';
  };

  const getNextLabel = (): string | null => {
    if (!canGoForward || currentIndex >= history.length - 1) return null;
    return history[currentIndex + 1]?.label || 'Next';
  };

  const previousLabel = getPreviousLabel();
  const nextLabel = getNextLabel();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Navigation controls">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        disabled={!canGoBack}
        className={`
          p-2 rounded transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          ${
            canGoBack
              ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }
        `}
        aria-label={previousLabel ? `Go back to ${previousLabel}` : 'Go back'}
        title={previousLabel ? `${previousLabel} (Alt+←)` : 'Go back (Alt+←)'}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Forward Button */}
      <button
        onClick={handleGoForward}
        disabled={!canGoForward}
        className={`
          p-2 rounded transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          ${
            canGoForward
              ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }
        `}
        aria-label={nextLabel ? `Go forward to ${nextLabel}` : 'Go forward'}
        title={nextLabel ? `${nextLabel} (Alt+→)` : 'Go forward (Alt+→)'}
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
