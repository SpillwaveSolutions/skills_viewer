import React from 'react';
import { SkillList } from './SkillList';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
        aria-label="Skills navigation sidebar"
      >
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Skill Debugger</h1>
          <p className="text-sm text-gray-600 mt-1">Browse and analyze Claude skills</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SkillList />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden" aria-label="Skill detail viewer">
        {children}
      </main>
    </div>
  );
};
