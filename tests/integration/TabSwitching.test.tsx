/**
 * Integration tests for tab switching behavior
 *
 * Tests cover:
 * - Tab switching updates keyboardStore
 * - Keyboard shortcuts trigger tab changes
 * - Tab content changes when switching tabs
 * - Tab state persists across re-renders
 * - Integration with existing keyboard shortcut system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useKeyboardStore } from '../../src/stores/keyboardStore';
import { TabBar } from '../../src/components/TabBar';
import { TABS } from '../../src/types/layout';

// Mock component that displays current tab content
function MockTabContent() {
  const { activeTabIndex } = useKeyboardStore();

  if (activeTabIndex === null) return <div>No tab selected</div>;

  const tabLabels = [
    'Overview Content',
    'Content Content',
    'Triggers Content',
    'Diagram Content',
    'References Content',
    'Scripts Content',
  ];

  return <div data-testid="tab-content">{tabLabels[activeTabIndex]}</div>;
}

// Test component integrating TabBar with keyboard store
function TabSwitchingTestApp() {
  const { activeTabIndex, setActiveTabIndex } = useKeyboardStore();

  return (
    <div>
      <TabBar activeTabIndex={activeTabIndex ?? 0} onTabChange={setActiveTabIndex} />
      <MockTabContent />
    </div>
  );
}

describe('Tab Switching Integration', () => {
  beforeEach(() => {
    // Reset keyboard store state before each test
    const { setActiveTabIndex } = useKeyboardStore.getState();
    setActiveTabIndex(0);
  });

  describe('Click-Based Tab Switching', () => {
    it('should update keyboardStore when tab is clicked', async () => {
      render(<TabSwitchingTestApp />);

      // Initially on Overview (index 0)
      expect(useKeyboardStore.getState().activeTabIndex).toBe(0);

      // Click Content tab (index 1)
      const contentTab = screen.getByRole('tab', { name: /content tab/i });
      fireEvent.click(contentTab);

      await waitFor(() => {
        expect(useKeyboardStore.getState().activeTabIndex).toBe(1);
      });
    });

    it('should switch displayed content when tab is clicked', async () => {
      render(<TabSwitchingTestApp />);

      // Initially shows Overview content
      expect(screen.getByTestId('tab-content')).toHaveTextContent('Overview Content');

      // Click Diagram tab (index 3)
      const diagramTab = screen.getByRole('tab', { name: /diagram tab/i });
      fireEvent.click(diagramTab);

      await waitFor(() => {
        expect(screen.getByTestId('tab-content')).toHaveTextContent('Diagram Content');
      });
    });

    it('should cycle through all tabs correctly', async () => {
      render(<TabSwitchingTestApp />);

      const expectedContent = [
        'Overview Content',
        'Content Content',
        'Triggers Content',
        'Diagram Content',
        'References Content',
        'Scripts Content',
      ];

      for (let i = 0; i < TABS.length; i++) {
        const tab = screen.getByRole('tab', { name: new RegExp(TABS[i].ariaLabel, 'i') });
        fireEvent.click(tab);

        await waitFor(() => {
          expect(screen.getByTestId('tab-content')).toHaveTextContent(expectedContent[i]);
          expect(useKeyboardStore.getState().activeTabIndex).toBe(i);
        });
      }
    });
  });

  describe('Keyboard Shortcut Integration', () => {
    it('should switch tabs via Cmd+1 through Cmd+6', async () => {
      render(<TabSwitchingTestApp />);

      // Simulate keyboard shortcuts by directly calling setActiveTabIndex
      // (Full keyboard shortcut testing is in the keyboard hook tests)
      for (let i = 0; i < 6; i++) {
        act(() => {
          useKeyboardStore.getState().setActiveTabIndex(i);
        });

        await waitFor(() => {
          expect(useKeyboardStore.getState().activeTabIndex).toBe(i);
          const tabs = screen.getAllByRole('tab');
          expect(tabs[i]).toHaveAttribute('aria-selected', 'true');
        });
      }
    });

    it('should update active tab highlight when keyboard shortcut used', async () => {
      render(<TabSwitchingTestApp />);

      // Simulate Cmd+3 (Triggers tab)
      act(() => {
        useKeyboardStore.getState().setActiveTabIndex(2);
      });

      await waitFor(() => {
        const triggersTab = screen.getByRole('tab', { name: /triggers tab/i });
        expect(triggersTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('State Persistence', () => {
    it('should maintain tab state across re-renders', async () => {
      const { rerender } = render(<TabSwitchingTestApp />);

      // Switch to References tab (index 4)
      const referencesTab = screen.getByRole('tab', { name: /references tab/i });
      fireEvent.click(referencesTab);

      await waitFor(() => {
        expect(useKeyboardStore.getState().activeTabIndex).toBe(4);
      });

      // Force re-render
      rerender(<TabSwitchingTestApp />);

      // State should persist
      expect(useKeyboardStore.getState().activeTabIndex).toBe(4);
      const referencesTabAfter = screen.getByRole('tab', { name: /references tab/i });
      expect(referencesTabAfter).toHaveAttribute('aria-selected', 'true');
    });

    it('should preserve active tab when component unmounts and remounts', async () => {
      const { unmount } = render(<TabSwitchingTestApp />);

      // Switch to Scripts tab (index 5)
      const scriptsTab = screen.getByRole('tab', { name: /scripts tab/i });
      fireEvent.click(scriptsTab);

      await waitFor(() => {
        expect(useKeyboardStore.getState().activeTabIndex).toBe(5);
      });

      // Unmount component
      unmount();

      // Remount component (using new render, not rerender)
      render(<TabSwitchingTestApp />);

      // State should still be Scripts (zustand store persists)
      expect(useKeyboardStore.getState().activeTabIndex).toBe(5);

      // Verify UI reflects the persisted state
      const scriptsTabAfterRemount = screen.getByRole('tab', { name: /scripts tab/i });
      await waitFor(() => {
        expect(scriptsTabAfterRemount).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid tab switching', async () => {
      render(<TabSwitchingTestApp />);

      const tabs = screen.getAllByRole('tab');

      // Rapidly click through tabs
      for (let i = 0; i < tabs.length; i++) {
        fireEvent.click(tabs[i]);
      }

      // Should end on last tab clicked (Scripts, index 5)
      await waitFor(() => {
        expect(useKeyboardStore.getState().activeTabIndex).toBe(5);
        expect(screen.getByTestId('tab-content')).toHaveTextContent('Scripts Content');
      });
    });

    it('should handle clicking same tab multiple times', async () => {
      render(<TabSwitchingTestApp />);

      const overviewTab = screen.getByRole('tab', { name: /overview tab/i });

      // Click same tab 3 times
      fireEvent.click(overviewTab);
      fireEvent.click(overviewTab);
      fireEvent.click(overviewTab);

      // Should remain on Overview
      await waitFor(() => {
        expect(useKeyboardStore.getState().activeTabIndex).toBe(0);
        expect(screen.getByTestId('tab-content')).toHaveTextContent('Overview Content');
      });
    });

    it('should synchronize TabBar and content when store updates externally', async () => {
      render(<TabSwitchingTestApp />);

      // Update store directly (simulating keyboard shortcut from elsewhere)
      act(() => {
        useKeyboardStore.getState().setActiveTabIndex(4);
      });

      await waitFor(() => {
        // TabBar should reflect change
        const referencesTab = screen.getByRole('tab', { name: /references tab/i });
        expect(referencesTab).toHaveAttribute('aria-selected', 'true');

        // Content should update
        expect(screen.getByTestId('tab-content')).toHaveTextContent('References Content');
      });
    });
  });

  describe('Accessibility During Switching', () => {
    it('should maintain correct ARIA attributes during tab switches', async () => {
      render(<TabSwitchingTestApp />);

      for (let i = 0; i < TABS.length; i++) {
        const tab = screen.getByRole('tab', { name: new RegExp(TABS[i].ariaLabel, 'i') });
        fireEvent.click(tab);

        await waitFor(() => {
          const allTabs = screen.getAllByRole('tab');
          allTabs.forEach((t, index) => {
            if (index === i) {
              expect(t).toHaveAttribute('aria-selected', 'true');
            } else {
              expect(t).toHaveAttribute('aria-selected', 'false');
            }
          });
        });
      }
    });

    it('should keep tablist role during tab switches', async () => {
      const { container } = render(<TabSwitchingTestApp />);

      // Switch tabs multiple times
      for (let i = 0; i < TABS.length; i++) {
        act(() => {
          useKeyboardStore.getState().setActiveTabIndex(i);
        });

        await waitFor(() => {
          const tabList = container.querySelector('[role="tablist"]');
          expect(tabList).toBeInTheDocument();
        });
      }
    });
  });
});
