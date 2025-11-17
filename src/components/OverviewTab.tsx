/**
 * OverviewTab Component
 *
 * Consolidated overview showing ALL skill metadata in one place:
 * - Description (from metadata or skill.description)
 * - Version (monospace font)
 * - Trigger keywords preview (first 5, light blue badges)
 * - Stats grid (4 columns: References, Scripts, Triggers, Lines)
 * - Additional metadata fields
 * - Tags (if present)
 *
 * Part of Feature 016 US2: Consolidated Overview
 * This replaces the old OverviewPanel's content sections
 *
 * @example
 * ```tsx
 * <OverviewTab
 *   skill={selectedSkill}
 *   onNavigateToTab={(tab) => setActiveTab(tab)}
 * />
 * ```
 */

import React, { ReactNode, useMemo } from 'react';
import { Skill } from '../types';
import { analyzeTriggers } from '../utils/triggerAnalyzer';

export interface OverviewTabProps {
  /** Skill to display overview for */
  skill: Skill;
  /** Optional callback to navigate to other tabs */
  onNavigateToTab?: (tab: string) => void;
}

/**
 * Consolidated overview tab - all metadata in one place
 */
export const OverviewTab = React.memo<OverviewTabProps>(({ skill, onNavigateToTab }) => {
  // Count lines in content
  const lineCount = skill.content.split('\n').length;

  // Analyze triggers from skill content
  const triggerPatterns = useMemo(() => analyzeTriggers(skill), [skill]);
  const triggerKeywords = triggerPatterns.slice(0, 5).map((p) => p.keyword);

  // Get description from metadata or skill.description
  const metadataDescription =
    typeof skill.metadata?.description === 'string' ? skill.metadata.description : undefined;
  const description = metadataDescription || skill.description;
  const hasDescription = Boolean(description);

  // Get version from metadata
  const metadataVersion =
    typeof skill.metadata?.version === 'string' ? skill.metadata.version : undefined;
  const version = metadataVersion;

  // Get tags from metadata
  const tags =
    skill.metadata?.tags && Array.isArray(skill.metadata.tags) ? skill.metadata.tags : undefined;

  // Filter metadata to exclude duplicates (name, description, version, tags)
  const remainingMetadata = useMemo(() => {
    if (!skill.metadata) return {};

    const { description: _, version: __, tags: ___, ...rest } = skill.metadata;
    return rest;
  }, [skill.metadata]);

  const hasRemainingMetadata = Object.keys(remainingMetadata).length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Description (if present) */}
      {hasDescription && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">📝 Description</h2>
          <p className="text-base text-gray-800 leading-relaxed px-2">
            {(description as ReactNode) || null}
          </p>
        </div>
      )}

      {/* 2. Version (if present) - monospace font */}
      {version && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Version</h2>
          <p className="text-base text-gray-800 px-2 font-mono">{(version as ReactNode) || null}</p>
        </div>
      )}

      {/* 3. Trigger Preview (first 5) - light blue badges */}
      {triggerKeywords.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">🎯 Common Triggers</div>
          <div className="flex flex-wrap gap-2">
            {triggerKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 max-w-xs truncate inline-block"
                title={keyword}
              >
                {keyword}
              </span>
            ))}
            {triggerPatterns.length > 5 && (
              <span className="text-sm px-3 py-1 text-gray-600">
                +{triggerPatterns.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Quick Stats Grid (4 columns) */}
      <div className="grid grid-cols-4 gap-4">
        {/* References */}
        <button
          onClick={() => onNavigateToTab?.('references')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-left w-full"
          aria-label={`View ${skill.references.length} references`}
        >
          <div className="text-sm text-gray-600 mb-1">📚 References</div>
          <div className="text-2xl font-bold text-gray-900">{skill.references.length}</div>
        </button>

        {/* Scripts */}
        <button
          onClick={() => onNavigateToTab?.('scripts')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-left w-full"
          aria-label={`View ${skill.scripts.length} scripts`}
        >
          <div className="text-sm text-gray-600 mb-1">🔧 Scripts</div>
          <div className="text-2xl font-bold text-gray-900">{skill.scripts.length}</div>
        </button>

        {/* Triggers */}
        <button
          onClick={() => onNavigateToTab?.('triggers')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-left w-full"
          aria-label={`View ${triggerPatterns.length} trigger keywords`}
        >
          <div className="text-sm text-gray-600 mb-1">🎯 Triggers</div>
          <div className="text-2xl font-bold text-gray-900">{triggerPatterns.length}</div>
        </button>

        {/* Lines */}
        <div
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          role="group"
          aria-label="Line count"
        >
          <div className="text-sm text-gray-600 mb-1">📏 Lines</div>
          <div className="text-2xl font-bold text-gray-900">{lineCount.toLocaleString()}</div>
        </div>
      </div>

      {/* 5. Tags (if present) */}
      {tags && tags.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-300"
              >
                {String(tag)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Remaining Metadata (filtered to exclude name/description/version/tags) */}
      {hasRemainingMetadata && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">ℹ️ Additional Metadata</h2>
          <div className="space-y-2">
            {Object.entries(remainingMetadata).map(([key, value]) => (
              <div key={key} className="px-2">
                <span className="text-sm font-medium text-gray-700">{key}:</span>{' '}
                <span className="text-sm text-gray-800">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';
