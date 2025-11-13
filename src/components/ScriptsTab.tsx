import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { Skill } from '../types';

interface ScriptsTabProps {
  skill: Skill;
}

export const ScriptsTab: React.FC<ScriptsTabProps> = ({ skill }) => {
  const [selectedScript, setSelectedScript] = useState<number | null>(null);

  // Reset selected script when skill changes
  useEffect(() => {
    setSelectedScript(null);
  }, [skill.path]);

  // Defensive: Ensure selectedScript is valid for current skill
  const isValidSelection =
    selectedScript !== null &&
    selectedScript >= 0 &&
    selectedScript < skill.scripts.length &&
    skill.scripts[selectedScript] !== undefined;

  const getLanguageIcon = (language: string) => {
    const icons: Record<string, string> = {
      py: '🐍',
      python: '🐍',
      js: '📜',
      javascript: '📜',
      ts: '🟦',
      typescript: '🟦',
      sh: '🐚',
      bash: '🐚',
      json: '📋',
      md: '📝',
      markdown: '📝',
      default: '📄',
    };
    return icons[language.toLowerCase()] || icons.default;
  };

  if (skill.scripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🔧</div>
          <p>No scripts found for this skill.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Scripts List */}
      <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">Scripts ({skill.scripts.length})</h3>
        </div>
        <div className="p-3">
          {skill.scripts.map((script, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedScript(idx)}
              className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                selectedScript === idx
                  ? 'bg-blue-100 border-blue-300 border'
                  : 'bg-white hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{getLanguageIcon(script.language)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate mr-1">
                    {script.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{script.language}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {script.content.split('\n').length} lines
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Script Content */}
      <div className="flex-1 overflow-y-auto">
        {!isValidSelection ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">👈</div>
              <p>Select a script to view its content</p>
            </div>
          </div>
        ) : (
          <div className="pt-8 px-6 pb-6">
            <div className="max-w-5xl mx-auto">
              {/* Script Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {getLanguageIcon(
                      selectedScript !== null && skill.scripts[selectedScript]
                        ? skill.scripts[selectedScript].language
                        : 'unknown'
                    )}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedScript !== null && skill.scripts[selectedScript]
                        ? skill.scripts[selectedScript].name
                        : 'Unknown'}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">
                        {selectedScript !== null && skill.scripts[selectedScript]
                          ? skill.scripts[selectedScript].language
                          : ''}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedScript !== null && skill.scripts[selectedScript]
                          ? skill.scripts[selectedScript].content.split('\n').length
                          : 0}{' '}
                        lines
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Script Content - Using ReactMarkdown for reliable syntax highlighting */}
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {selectedScript !== null && skill.scripts[selectedScript]
                    ? `\`\`\`${skill.scripts[selectedScript].language}\n${skill.scripts[selectedScript].content}\n\`\`\``
                    : ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
