import { useEffect } from 'react';
import { Layout, SkillViewer, KeyboardShortcutHelp, BackgroundTaskIndicator } from './components';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNavigationShortcuts } from './hooks/useNavigationShortcuts';
import { useBackgroundDiagramRenderer } from './hooks/useBackgroundDiagramRenderer';
import { useKeyboardStore } from './stores/keyboardStore';
import { useSkillStore } from './stores/useSkillStore';

function App() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();
  useNavigationShortcuts();

  // Get skills for background diagram rendering
  const skills = useSkillStore((state) => state.skills);

  // Start background diagram rendering/caching
  useBackgroundDiagramRenderer(skills);

  // Get help modal state from store
  const isHelpModalOpen = useKeyboardStore((state) => state.isHelpModalOpen);
  const setHelpModalOpen = useKeyboardStore((state) => state.setHelpModalOpen);

  // Detect platform on mount (macOS vs Windows/Linux)
  useEffect(() => {
    useKeyboardStore.getState().detectPlatform();
  }, []);

  return (
    <>
      <Layout>
        <SkillViewer />
      </Layout>

      {/* Background task status indicator (LED) */}
      <BackgroundTaskIndicator />

      {/* Global keyboard shortcut help modal */}
      <KeyboardShortcutHelp isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}

export default App;
