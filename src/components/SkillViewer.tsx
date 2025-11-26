import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useSkillStore } from '../stores';
import { useKeyboardStore } from '../stores/keyboardStore';
import { useNavigationStore } from '../stores/navigationStore';
import { TriggerAnalysis } from './TriggerAnalysis';
import { DiagramView } from './DiagramView';
import { ReferencesTab } from './ReferencesTab';
import { ScriptsTab } from './ScriptsTab';
import { EvaluationTab } from './analysis/EvaluationTab';
import { ReportsTab } from './analysis/ReportsTab';
import { TabBar } from './TabBar';
import { TabAnnouncer } from './TabAnnouncer';
import { SkillHeader } from './SkillHeader';
import { OverviewTab } from './OverviewTab';
import { TABS } from '../types/layout';
import type { NavigationEntry } from '../types/navigation';
import 'highlight.js/styles/github.css';

type TabType =
  | 'overview'
  | 'content'
  | 'references'
  | 'scripts'
  | 'triggers'
  | 'diagram'
  | 'evaluation'
  | 'reports';

export const SkillViewer: React.FC = () => {
  const { selectedSkill } = useSkillStore();
  const activeTabIndex = useKeyboardStore((state) => state.activeTabIndex);
  const setActiveTabIndex = useKeyboardStore((state) => state.setActiveTabIndex);
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const [activeTab, setActiveTab] = useState<TabType>('content');

  // Sync activeTabIndex from store to local tab state
  // CRITICAL: This hook MUST be called before any early returns (React rules)
  useEffect(() => {
    if (activeTabIndex !== null && activeTabIndex >= 0 && activeTabIndex < TABS.length) {
      setActiveTab(TABS[activeTabIndex].id as TabType);
    }
  }, [activeTabIndex]);

  // Track navigation when skill is selected
  useEffect(() => {
    if (selectedSkill) {
      const entry: NavigationEntry = {
        type: 'skill',
        skill: selectedSkill,
        tab: activeTab,
        timestamp: Date.now(),
        label: selectedSkill.name,
      };
      navigateTo(entry);
    }
  }, [selectedSkill, activeTab, navigateTo]);

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
    <div data-testid="skill-viewer" className="flex flex-col h-full">
      {/* Skill Header - title, badge, inline stats (compact mode) */}
      <SkillHeader skill={selectedSkill} />

      {/* Tab Navigation - positioned at top below header */}
      <TabBar
        activeTabIndex={activeTabIndex ?? 0}
        onTabChange={(index) => {
          setActiveTabIndex(index);
          setActiveTab(TABS[index].id as TabType);
        }}
      />

      {/* Screen Reader Announcements for Tab Changes */}
      <TabAnnouncer activeTabIndex={activeTabIndex} />

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="flex-1 overflow-y-auto bg-white"
      >
        {activeTab === 'overview' && (
          <OverviewTab skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />
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

        {activeTab === 'evaluation' && <EvaluationTab skill={selectedSkill} />}

        {activeTab === 'reports' && <ReportsTab skill={selectedSkill} />}
      </div>
    </div>
  );
};
