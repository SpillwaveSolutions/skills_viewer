import React, { useMemo } from 'react';
import { Skill } from '../types';
import { analyzeTriggers, generateExampleQueries } from '../utils/triggerAnalyzer';

interface TriggerAnalysisProps {
  skill: Skill;
}

export const TriggerAnalysis: React.FC<TriggerAnalysisProps> = ({ skill }) => {
  const patterns = useMemo(() => analyzeTriggers(skill), [skill]);
  const examples = useMemo(() => generateExampleQueries(skill, patterns), [skill, patterns]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'action': return 'bg-blue-100 text-blue-700';
      case 'technology': return 'bg-purple-100 text-purple-700';
      case 'format': return 'bg-green-100 text-green-700';
      case 'topic': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-2">Trigger Keywords</h2>
        <p className="text-sm text-gray-600 mb-4">
          These keywords may trigger this skill when mentioned in queries to Claude Code:
        </p>
        <div className="flex flex-wrap gap-2">
          {patterns.map((pattern, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(pattern.category)}`}
            >
              {pattern.keyword}
              <span className="ml-1 text-xs opacity-75">({pattern.category})</span>
            </span>
          ))}
        </div>
      </div>

      {examples.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-2">Example Queries</h2>
          <p className="text-sm text-gray-600 mb-4">
            These example queries would likely trigger this skill:
          </p>
          <div className="space-y-2">
            {examples.map((example, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <code className="text-sm text-gray-800">"{example}"</code>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{patterns.filter(p => p.category === 'action').length}</div>
            <div className="text-sm text-blue-600">Action Keywords</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{patterns.filter(p => p.category === 'technology').length}</div>
            <div className="text-sm text-purple-600">Technology Keywords</div>
          </div>
        </div>
      </div>
    </div>
  );
};
