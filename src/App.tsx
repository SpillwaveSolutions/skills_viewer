import { useEffect } from 'react';
import { Layout, SkillViewer, KeyboardShortcutHelp } from './components';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNavigationShortcuts } from './hooks/useNavigationShortcuts';
import { useKeyboardStore } from './stores/keyboardStore';

function App() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();
  useNavigationShortcuts();

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

      {/* Global keyboard shortcut help modal */}
      <KeyboardShortcutHelp isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}

export default App;
