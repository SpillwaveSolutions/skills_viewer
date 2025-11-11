import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useSkillStore } from '../stores';
import { TriggerAnalysis } from './TriggerAnalysis';
import { DiagramView } from './DiagramView';
import { OverviewPanel } from './OverviewPanel';
import { DescriptionSection } from './DescriptionSection';
import { ReferencesTab } from './ReferencesTab';
import { ScriptsTab } from './ScriptsTab';
import 'highlight.js/styles/github.css';

type TabType = 'overview' | 'content' | 'references' | 'scripts' | 'triggers' | 'diagram';

export const SkillViewer: React.FC = () => {
  const { selectedSkill, setSelectedSkill } = useSkillStore();
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const handleBackClick = () => {
    setSelectedSkill(null);
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  if (!selectedSkill) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Welcome to Skill Debugger
          </h2>
          <p className="text-gray-600">
            Select a skill from the sidebar to view details
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Content', icon: '📄' },
    { id: 'references', label: 'References', icon: '📚' },
    { id: 'scripts', label: 'Scripts', icon: '🔧' },
    { id: 'triggers', label: 'Triggers', icon: '🎯' },
    { id: 'diagram', label: 'Diagram', icon: '🔀' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Back Navigation */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>←</span>
          <span>Back to Skills</span>
        </button>
      </div>

      {/* Overview Panel (top banner) */}
      <OverviewPanel skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />

      {/* Description Section */}
      <DescriptionSection skill={selectedSkill} />

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Metadata Display */}
              {selectedSkill.metadata && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">YAML Frontmatter</h2>

                  {/* Display metadata fields as cards */}
                  {Object.entries(selectedSkill.metadata).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">{key}</h3>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {!selectedSkill.metadata && (
                <div className="text-center text-gray-500 py-12">
                  No YAML frontmatter found in this skill.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {selectedSkill.content_clean || selectedSkill.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <ReferencesTab skill={selectedSkill} />
        )}

        {activeTab === 'scripts' && (
          <ScriptsTab skill={selectedSkill} />
        )}

        {activeTab === 'triggers' && (
          <TriggerAnalysis skill={selectedSkill} />
        )}

        {activeTab === 'diagram' && (
          <DiagramView skill={selectedSkill} />
        )}
      </div>
    </div>
  );
};
