import React, { useMemo } from 'react';
import { Skill } from '../types';
import { analyzeTriggers } from '../utils/triggerAnalyzer';

interface OverviewPanelProps {
  skill: Skill;
  onNavigateToTab?: (tab: string) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ skill, onNavigateToTab }) => {
  // Count lines in content
  const lineCount = skill.content.split('\n').length;

  // Analyze triggers from skill content
  const triggerPatterns = useMemo(() => analyzeTriggers(skill), [skill]);
  const triggerKeywords = triggerPatterns.slice(0, 5).map((p) => p.keyword);

  // Get description from metadata or skill.description
  const description = skill.metadata?.description || skill.description;

  // Get version from metadata
  const version = skill.metadata?.version;

  // Filter metadata to exclude duplicates (name, description, version)
  const remainingMetadata = useMemo(() => {
    if (!skill.metadata) return {};

    const { description: _, version: __, ...rest } = skill.metadata;
    return rest;
  }, [skill.metadata]);

  const hasRemainingMetadata = Object.keys(remainingMetadata).length > 0;

  return (
    <div className="bg-white border-b border-gray-200 p-6 space-y-6">
      {/* 1. Top row: Skill name and location */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">{skill.name}</h1>
        <span
          className={`text-sm px-3 py-1 rounded font-medium ${
            skill.location === 'claude'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          📍 {skill.location}
        </span>
      </div>

      {/* 2. Description (if present) */}
      {description && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">📝 Description</h2>
          <p className="text-base text-gray-800 leading-relaxed px-2">{description}</p>
        </div>
      )}

      {/* 3. Version (if present) */}
      {version && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Version</h2>
          <p className="text-base text-gray-800 px-2">{version}</p>
        </div>
      )}

      {/* 4. Trigger Preview (first 5) */}
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

      {/* 5. Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* References */}
        <div
          onClick={() => onNavigateToTab?.('references')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">📚 References</div>
          <div className="text-2xl font-bold text-gray-900">{skill.references.length}</div>
        </div>

        {/* Scripts */}
        <div
          onClick={() => onNavigateToTab?.('scripts')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">🔧 Scripts</div>
          <div className="text-2xl font-bold text-gray-900">{skill.scripts.length}</div>
        </div>

        {/* Triggers */}
        <div
          onClick={() => onNavigateToTab?.('triggers')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">🎯 Triggers</div>
          <div className="text-2xl font-bold text-gray-900">{triggerPatterns.length}</div>
        </div>

        {/* Lines */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">📏 Lines</div>
          <div className="text-2xl font-bold text-gray-900">{lineCount.toLocaleString()}</div>
        </div>
      </div>

      {/* 6. Remaining Metadata (filtered to exclude name/description/version) */}
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
};
