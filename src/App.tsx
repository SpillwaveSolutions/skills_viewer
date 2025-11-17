import { useEffect } from 'react';
import { Layout, SkillViewer, KeyboardShortcutHelp } from './components';
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
  const { queueLength, currentlyRendering } = useBackgroundDiagramRenderer(skills);

  // Get help modal state from store
  const isHelpModalOpen = useKeyboardStore((state) => state.isHelpModalOpen);
  const setHelpModalOpen = useKeyboardStore((state) => state.setHelpModalOpen);

  // Detect platform on mount (macOS vs Windows/Linux)
  useEffect(() => {
    useKeyboardStore.getState().detectPlatform();
  }, []);

  // Log background rendering progress
  useEffect(() => {
    if (currentlyRendering) {
      console.log(`📊 Background rendering: ${currentlyRendering} (${queueLength} remaining)`);
    }
  }, [currentlyRendering, queueLength]);

  return (
    <>
      <Layout>
        <SkillViewer />
      </Layout>

      {/* Global keyboard shortcut help modal */}
      <KeyboardShortcutHelp isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}

export default App;
