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
  const triggerKeywords = triggerPatterns.slice(0, 5).map(p => p.keyword);

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* Top row: Skill name and location */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* References */}
        <div
          onClick={() => onNavigateToTab?.('references')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">📚 References</div>
          <div className="text-2xl font-bold text-gray-900">
            {skill.references.length}
          </div>
        </div>

        {/* Scripts */}
        <div
          onClick={() => onNavigateToTab?.('scripts')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">🔧 Scripts</div>
          <div className="text-2xl font-bold text-gray-900">
            {skill.scripts.length}
          </div>
        </div>

        {/* Triggers */}
        <div
          onClick={() => onNavigateToTab?.('triggers')}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">🎯 Triggers</div>
          <div className="text-2xl font-bold text-gray-900">
            {triggerPatterns.length}
          </div>
        </div>

        {/* Lines */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">📏 Lines</div>
          <div className="text-2xl font-bold text-gray-900">
            {lineCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Trigger Preview */}
      {triggerKeywords.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            🎯 Common Triggers
          </div>
          <div className="flex flex-wrap gap-2">
            {triggerKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
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
    </div>
  );
};
