/**
 * SkillHeader Component
 *
 * Displays skill title and location badge.
 * In compact mode, also shows inline stats.
 *
 * Part of Feature 016 US2: Consolidated Overview + US4: Compact Mode
 *
 * @example
 * ```tsx
 * <SkillHeader skill={selectedSkill} />
 * ```
 */

import React, { useMemo } from 'react';
import { Skill } from '../types';
import { useLayoutMode } from '../hooks/useLayoutMode';
import { analyzeTriggers } from '../utils/triggerAnalyzer';

export interface SkillHeaderProps {
  /** Skill to display header for */
  skill: Skill;
}

/**
 * Skill header - title, badge, and optional inline stats (compact mode)
 */
export const SkillHeader = React.memo<SkillHeaderProps>(({ skill }) => {
  const { isCompact, toggleMode } = useLayoutMode();

  // Calculate stats for compact mode
  const stats = useMemo(() => {
    // Handle empty content - should return 0 lines, not 1
    const lineCount = skill.content ? skill.content.split('\n').length : 0;
    const triggerPatterns = analyzeTriggers(skill);

    return {
      references: skill.references.length,
      scripts: skill.scripts.length,
      triggers: triggerPatterns.length,
      lines: lineCount,
    };
  }, [skill]);

  return (
    <div className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 p-6">
      <div className="flex items-center gap-6 flex-1">
        {/* Skill Title */}
        <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>

        {/* Inline Stats (Compact Mode Only) */}
        {isCompact && (
          <div className="text-sm font-mono text-gray-600" aria-label="Skill statistics">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">📚</span>
              <span>{stats.references} refs</span>
            </span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">🔧</span>
              <span>{stats.scripts} scripts</span>
            </span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">🎯</span>
              <span>{stats.triggers} triggers</span>
            </span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">📏</span>
              <span>{stats.lines} lines</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Compact Mode Toggle Button */}
        <button
          onClick={toggleMode}
          className="text-sm px-3 py-1.5 rounded font-medium flex items-center gap-2 transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={isCompact ? 'Hide skill details' : 'Show skill details'}
          title={isCompact ? 'Hide Details' : 'Show Details'}
        >
          <span aria-hidden="true">{isCompact ? '➖' : '➕'}</span>
          <span className="text-xs">{isCompact ? 'Hide Details' : 'Show Details'}</span>
        </button>

        {/* Location Badge */}
        <span
          className={`text-sm px-3 py-1 rounded font-medium flex-shrink-0 ${
            skill.location === 'claude'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          📍 {skill.location}
        </span>
      </div>
    </div>
  );
});

SkillHeader.displayName = 'SkillHeader';
