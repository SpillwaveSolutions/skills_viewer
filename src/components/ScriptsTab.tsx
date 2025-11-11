import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';
import { Skill, Script } from '../types';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('py', python);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('md', markdown);

interface ScriptsTabProps {
  skill: Skill;
}

export const ScriptsTab: React.FC<ScriptsTabProps> = ({ skill }) => {
  const [selectedScript, setSelectedScript] = useState<number | null>(null);

  // Apply syntax highlighting when script changes
  useEffect(() => {
    if (selectedScript !== null) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [selectedScript]);

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
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">
            Scripts ({skill.scripts.length})
          </h3>
        </div>
        <div className="p-2">
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
                <span className="text-lg flex-shrink-0">
                  {getLanguageIcon(script.language)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {script.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {script.language}
                  </div>
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
        {selectedScript === null ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">👈</div>
              <p>Select a script to view its content</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="max-w-5xl mx-auto">
              {/* Script Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {getLanguageIcon(skill.scripts[selectedScript].language)}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {skill.scripts[selectedScript].name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">
                        {skill.scripts[selectedScript].language}
                      </span>
                      <span className="text-sm text-gray-500">
                        {skill.scripts[selectedScript].content.split('\n').length} lines
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Script Content */}
              <div className="border border-gray-200 rounded-lg overflow-hidden ml-8">
                <pre className="p-4 bg-gray-50 overflow-x-auto text-sm">
                  <code className={`language-${skill.scripts[selectedScript].language}`}>
                    {skill.scripts[selectedScript].content}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
