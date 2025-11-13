import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useSkillStore } from '../stores';
import { useKeyboardStore } from '../stores/keyboardStore';
import { TriggerAnalysis } from './TriggerAnalysis';
import { DiagramView } from './DiagramView';
import { OverviewPanel } from './OverviewPanel';
import { ReferencesTab } from './ReferencesTab';
import { ScriptsTab } from './ScriptsTab';
import 'highlight.js/styles/github.css';

type TabType = 'overview' | 'content' | 'references' | 'scripts' | 'triggers' | 'diagram';

// Tab order matches spec (Cmd/Ctrl+1-6):
// 1: Overview, 2: Content, 3: Triggers, 4: Diagram, 5: References, 6: Scripts
const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' }, // Cmd/Ctrl+1
  { id: 'content', label: 'Content', icon: '📄' }, // Cmd/Ctrl+2
  { id: 'triggers', label: 'Triggers', icon: '🎯' }, // Cmd/Ctrl+3
  { id: 'diagram', label: 'Diagram', icon: '🔀' }, // Cmd/Ctrl+4
  { id: 'references', label: 'References', icon: '📚' }, // Cmd/Ctrl+5
  { id: 'scripts', label: 'Scripts', icon: '🔧' }, // Cmd/Ctrl+6
];

export const SkillViewer: React.FC = () => {
  const { selectedSkill, selectSkill } = useSkillStore();
  const activeTabIndex = useKeyboardStore((state) => state.activeTabIndex);
  const setActiveTabIndex = useKeyboardStore((state) => state.setActiveTabIndex);
  const [activeTab, setActiveTab] = useState<TabType>('content');

  // Sync activeTabIndex from store to local tab state
  // CRITICAL: This hook MUST be called before any early returns (React rules)
  useEffect(() => {
    if (activeTabIndex !== null && activeTabIndex >= 0 && activeTabIndex < TABS.length) {
      setActiveTab(TABS[activeTabIndex].id);
    }
  }, [activeTabIndex]);

  const handleBackClick = () => {
    selectSkill(null);
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  if (!selectedSkill) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Skill Debugger</h2>
          <p className="text-gray-600">Select a skill from the sidebar to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back Navigation */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Return to skills list"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Skills</span>
        </button>
      </div>

      {/* Overview Panel (top banner) - now includes description */}
      <OverviewPanel skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex gap-1 px-6" role="tablist" aria-label="Skill detail tabs">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveTabIndex(index); // Update store for keyboard shortcuts
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="mr-2" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="flex-1 overflow-y-auto bg-white"
      >
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {selectedSkill.content_clean || selectedSkill.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && <ReferencesTab skill={selectedSkill} />}

        {activeTab === 'scripts' && <ScriptsTab skill={selectedSkill} />}

        {activeTab === 'triggers' && <TriggerAnalysis skill={selectedSkill} />}

        {activeTab === 'diagram' && <DiagramView skill={selectedSkill} />}
      </div>
    </div>
  );
};
