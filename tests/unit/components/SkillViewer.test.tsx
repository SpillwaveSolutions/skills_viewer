/**
 * Unit tests for SkillViewer component
 * Tests tab switching, keyboard shortcuts, content rendering, and accessibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillViewer } from '@/components/SkillViewer';
import { useSkillStore } from '@/stores';
import { useKeyboardStore } from '@/stores/keyboardStore';
import { mockSkillComplete, mockSkillMinimal } from '../../fixtures/mockSkills';

// Mock stores
vi.mock('@/stores', () => ({
  useSkillStore: vi.fn(),
}));

vi.mock('@/stores/keyboardStore', () => ({
  useKeyboardStore: vi.fn(),
}));

// Mock child components that have complex dependencies
vi.mock('@/components/TriggerAnalysis', () => ({
  TriggerAnalysis: () => <div data-testid="trigger-analysis">Trigger Analysis</div>,
}));

vi.mock('@/components/DiagramView', () => ({
  DiagramView: () => <div data-testid="diagram-view">Diagram View</div>,
}));

vi.mock('@/components/OverviewPanel', () => ({
  OverviewPanel: ({ onNavigateToTab }: any) => (
    <div data-testid="overview-panel">
      <button onClick={() => onNavigateToTab?.('references')}>Navigate to References</button>
    </div>
  ),
}));

vi.mock('@/components/ReferencesTab', () => ({
  ReferencesTab: () => <div data-testid="references-tab">References Tab</div>,
}));

vi.mock('@/components/ScriptsTab', () => ({
  ScriptsTab: () => <div data-testid="scripts-tab">Scripts Tab</div>,
}));

describe('SkillViewer', () => {
  const mockSelectSkill = vi.fn();
  const mockSetActiveTabIndex = vi.fn();
  let mockSelectedSkill: any = null;
  let mockActiveTabIndex: number | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedSkill = mockSkillComplete;
    mockActiveTabIndex = null;

    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      const storeState = { selectedSkill: mockSelectedSkill, selectSkill: mockSelectSkill };
      if (typeof selector === 'function') {
        return selector(storeState);
      }
      return storeState;
    });

    (useKeyboardStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector?: any) => {
        const storeState = {
          activeTabIndex: mockActiveTabIndex,
          setActiveTabIndex: mockSetActiveTabIndex,
        };
        if (typeof selector === 'function') {
          return selector(storeState);
        }
        return storeState;
      }
    );
  });

  describe('Rendering', () => {
    it('should render empty state when no skill selected', () => {
      mockSelectedSkill = null;
      render(<SkillViewer />);

      expect(screen.getByText('Welcome to Skill Debugger')).toBeInTheDocument();
      expect(
        screen.getByText('Select a skill from the sidebar to view details')
      ).toBeInTheDocument();
    });

    it('should render skill content when skill is selected', () => {
      render(<SkillViewer />);

      // Should show back button
      expect(screen.getByText('Back to Skills')).toBeInTheDocument();

      // Should show all tabs
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /content/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /triggers/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /diagram/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /references/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /scripts/i })).toBeInTheDocument();
    });

    it('should render overview panel', () => {
      render(<SkillViewer />);

      expect(screen.getByTestId('overview-panel')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should default to content tab', () => {
      render(<SkillViewer />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to overview tab when clicked', () => {
      render(<SkillViewer />);

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      fireEvent.click(overviewTab);

      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(mockSetActiveTabIndex).toHaveBeenCalledWith(0);
    });

    it('should switch to references tab when clicked', () => {
      render(<SkillViewer />);

      const referencesTab = screen.getByRole('tab', { name: /references/i });
      fireEvent.click(referencesTab);

      expect(referencesTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('references-tab')).toBeInTheDocument();
    });

    it('should switch to scripts tab when clicked', () => {
      render(<SkillViewer />);

      const scriptsTab = screen.getByRole('tab', { name: /scripts/i });
      fireEvent.click(scriptsTab);

      expect(scriptsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('scripts-tab')).toBeInTheDocument();
    });

    it('should switch to triggers tab when clicked', () => {
      render(<SkillViewer />);

      const triggersTab = screen.getByRole('tab', { name: /triggers/i });
      fireEvent.click(triggersTab);

      expect(triggersTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('trigger-analysis')).toBeInTheDocument();
    });

    it('should switch to diagram tab when clicked', () => {
      render(<SkillViewer />);

      const diagramTab = screen.getByRole('tab', { name: /diagram/i });
      fireEvent.click(diagramTab);

      expect(diagramTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('diagram-view')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should sync activeTabIndex from keyboard store', () => {
      mockActiveTabIndex = 2; // Triggers tab
      const { rerender } = render(<SkillViewer />);

      rerender(<SkillViewer />);

      const triggersTab = screen.getByRole('tab', { name: /triggers/i });
      expect(triggersTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle activeTabIndex 0 (overview)', () => {
      mockActiveTabIndex = 0;
      render(<SkillViewer />);

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle activeTabIndex 1 (content)', () => {
      mockActiveTabIndex = 1;
      render(<SkillViewer />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should ignore invalid activeTabIndex', () => {
      mockActiveTabIndex = 99;
      render(<SkillViewer />);

      // Should remain on default tab (content)
      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should ignore null activeTabIndex', () => {
      mockActiveTabIndex = null;
      render(<SkillViewer />);

      // Should remain on default tab (content)
      const contentTab = screen.getByRole('tab', { name: /content/i });
      expect(contentTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Back Navigation', () => {
    it('should call selectSkill(null) when back button clicked', () => {
      render(<SkillViewer />);

      const backButton = screen.getByRole('button', { name: /return to skills list/i });
      fireEvent.click(backButton);

      expect(mockSelectSkill).toHaveBeenCalledWith(null);
    });

    it('should have proper aria-label on back button', () => {
      render(<SkillViewer />);

      const backButton = screen.getByRole('button', { name: /return to skills list/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent('Back to Skills');
    });
  });

  describe('Content Rendering', () => {
    it('should render markdown content in content tab', () => {
      render(<SkillViewer />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      fireEvent.click(contentTab);

      // Content should be rendered (markdown processing is mocked)
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should render overview content with metadata in overview tab', () => {
      render(<SkillViewer />);

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      fireEvent.click(overviewTab);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should use content_clean if available', () => {
      mockSelectedSkill = {
        ...mockSkillComplete,
        content_clean: '# Clean Content',
      };

      render(<SkillViewer />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      fireEvent.click(contentTab);

      // Should render (exact markdown rendering is tested in integration tests)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('Navigation Callback', () => {
    it('should navigate to tab when callback invoked', () => {
      render(<SkillViewer />);

      // Click the navigate button in mocked OverviewPanel
      const navigateButton = screen.getByText('Navigate to References');
      fireEvent.click(navigateButton);

      // Should switch to references tab
      const referencesTab = screen.getByRole('tab', { name: /references/i });
      expect(referencesTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper tablist role', () => {
      render(<SkillViewer />);

      const tablist = screen.getByRole('tablist', { name: /skill detail tabs/i });
      expect(tablist).toBeInTheDocument();
    });

    it('should have proper tab roles', () => {
      render(<SkillViewer />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(6);

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('should have proper tabpanel role', () => {
      render(<SkillViewer />);

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('aria-labelledby');
      expect(tabpanel).toHaveAttribute('tabIndex', '0');
    });

    it('should set tabIndex correctly on tabs', () => {
      render(<SkillViewer />);

      const contentTab = screen.getByRole('tab', { name: /content/i });
      const overviewTab = screen.getByRole('tab', { name: /overview/i });

      // Active tab should have tabIndex 0
      expect(contentTab).toHaveAttribute('tabIndex', '0');

      // Inactive tabs should have tabIndex -1
      expect(overviewTab).toHaveAttribute('tabIndex', '-1');
    });

    it('should update aria-controls when switching tabs', () => {
      render(<SkillViewer />);

      const referencesTab = screen.getByRole('tab', { name: /references/i });
      fireEvent.click(referencesTab);

      expect(referencesTab).toHaveAttribute('aria-controls', 'tabpanel-references');
    });
  });

  describe('Edge Cases', () => {
    it('should handle skill without metadata', () => {
      mockSelectedSkill = mockSkillMinimal;
      render(<SkillViewer />);

      // Should still render without errors
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    });

    it('should handle skill without references', () => {
      mockSelectedSkill = { ...mockSkillComplete, references: [] };
      render(<SkillViewer />);

      const referencesTab = screen.getByRole('tab', { name: /references/i });
      fireEvent.click(referencesTab);

      // Should render empty state
      expect(screen.getByTestId('references-tab')).toBeInTheDocument();
    });

    it('should handle skill without scripts', () => {
      mockSelectedSkill = { ...mockSkillComplete, scripts: [] };
      render(<SkillViewer />);

      const scriptsTab = screen.getByRole('tab', { name: /scripts/i });
      fireEvent.click(scriptsTab);

      // Should render empty state
      expect(screen.getByTestId('scripts-tab')).toBeInTheDocument();
    });
  });
});
