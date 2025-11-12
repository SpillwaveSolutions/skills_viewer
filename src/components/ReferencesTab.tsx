import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ReferencesTabProps {
  skill: Skill;
}

export const ReferencesTab: React.FC<ReferencesTabProps> = ({ skill }) => {
  const [selectedRef, setSelectedRef] = useState<number | null>(null);
  const [refContent, setRefContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Reset selected reference when skill changes
  useEffect(() => {
    setSelectedRef(null);
    setRefContent('');
  }, [skill.path]); // Reset when skill changes

  // Defensive: Ensure selectedRef is valid for current skill
  const isValidSelection =
    selectedRef !== null &&
    selectedRef >= 0 &&
    selectedRef < skill.references.length &&
    skill.references[selectedRef] !== undefined;

  const loadReferenceContent = async (path: string, index: number) => {
    setSelectedRef(index);
    setLoading(true);

    try {
      // Use Tauri command to read the file content
      const content = await invoke<string>('read_file_content', { path });
      setRefContent(content);
    } catch (error) {
      setRefContent(`Error loading reference: ${path}\n\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (skill.references.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📚</div>
          <p>No references found for this skill.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* References List */}
      <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">
            References ({skill.references.length})
          </h3>
        </div>
        <div className="p-2">
          {skill.references.map((ref, idx) => (
            <div
              key={idx}
              onClick={() => loadReferenceContent(ref.path, idx)}
              className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                selectedRef === idx
                  ? 'bg-blue-100 border-blue-300 border'
                  : 'bg-white hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">
                  {ref.ref_type === 'glob' ? '🌐' : '📄'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {ref.path.split('/').pop()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {ref.path}
                  </div>
                  {ref.required && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 inline-block">
                      required
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Content */}
      <div className="flex-1 overflow-y-auto">
        {!isValidSelection ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">👈</div>
              <p>Select a reference to view its content</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading reference...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRef !== null && skill.references[selectedRef]
                    ? skill.references[selectedRef].path.split('/').pop()
                    : 'Unknown'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRef !== null && skill.references[selectedRef]
                    ? skill.references[selectedRef].path
                    : ''}
                </p>
              </div>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {refContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
