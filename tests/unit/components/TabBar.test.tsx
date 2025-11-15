/**
 * Unit tests for TabBar component
 *
 * Tests cover:
 * - Rendering all 6 tabs with correct labels and icons
 * - Active tab highlighting
 * - Click handlers for tab switching
 * - ARIA attributes for accessibility
 * - Keyboard shortcut display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from '../../../src/components/TabBar';
import { TABS } from '../../../src/types/layout';

describe('TabBar', () => {
  describe('Rendering', () => {
    it('should render all 6 tabs with correct labels', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      // Verify all tab labels are present
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Triggers')).toBeInTheDocument();
      expect(screen.getByText('Diagram')).toBeInTheDocument();
      expect(screen.getByText('References')).toBeInTheDocument();
      expect(screen.getByText('Scripts')).toBeInTheDocument();
    });

    it('should render all tab icons', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      // Verify all icons are present
      TABS.forEach((tab) => {
        expect(screen.getByText(tab.icon)).toBeInTheDocument();
      });
    });

    it('should render tabs in correct order', () => {
      const { container } = render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      const tabButtons = container.querySelectorAll('[role="tab"]');
      expect(tabButtons).toHaveLength(6);

      // Verify order matches TABS constant
      tabButtons.forEach((button, index) => {
        expect(button).toHaveTextContent(TABS[index].label);
      });
    });
  });

  describe('Active State', () => {
    it('should highlight the active tab (index 0)', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      const overviewTab = screen.getByRole('tab', { name: /overview tab/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should highlight the active tab (index 3)', () => {
      render(<TabBar activeTabIndex={3} onTabChange={vi.fn()} />);

      const diagramTab = screen.getByRole('tab', { name: /diagram tab/i });
      expect(diagramTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should only have one active tab at a time', () => {
      render(<TabBar activeTabIndex={2} onTabChange={vi.fn()} />);

      const selectedTabs = screen.getAllByRole('tab', { selected: true });
      expect(selectedTabs).toHaveLength(1);
      expect(selectedTabs[0]).toHaveTextContent('Triggers');
    });

    it('should apply active styling to active tab', () => {
      render(<TabBar activeTabIndex={1} onTabChange={vi.fn()} />);

      const contentTab = screen.getByRole('tab', { name: /content tab/i });
      // Active tab should have border-purple-500 class (purple border)
      expect(contentTab).toHaveClass('border-purple-500');
    });

    it('should apply inactive styling to non-active tabs', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      const contentTab = screen.getByRole('tab', { name: /content tab/i });
      // Inactive tab should have border-transparent class
      expect(contentTab).toHaveClass('border-transparent');
    });
  });

  describe('Click Interaction', () => {
    it('should call onTabChange when tab is clicked', () => {
      const onTabChange = vi.fn();
      render(<TabBar activeTabIndex={0} onTabChange={onTabChange} />);

      const contentTab = screen.getByRole('tab', { name: /content tab/i });
      fireEvent.click(contentTab);

      expect(onTabChange).toHaveBeenCalledTimes(1);
      expect(onTabChange).toHaveBeenCalledWith(1); // Content is index 1
    });

    it('should call onTabChange with correct index for each tab', () => {
      const onTabChange = vi.fn();
      render(<TabBar activeTabIndex={0} onTabChange={onTabChange} />);

      // Click each tab and verify correct index
      TABS.forEach((tab, index) => {
        const tabElement = screen.getByRole('tab', { name: new RegExp(tab.ariaLabel, 'i') });
        fireEvent.click(tabElement);
        expect(onTabChange).toHaveBeenCalledWith(index);
      });

      expect(onTabChange).toHaveBeenCalledTimes(6);
    });

    it('should allow clicking on already active tab (no-op)', () => {
      const onTabChange = vi.fn();
      render(<TabBar activeTabIndex={0} onTabChange={onTabChange} />);

      const overviewTab = screen.getByRole('tab', { name: /overview tab/i });
      fireEvent.click(overviewTab);

      // Should still call handler even if already active
      expect(onTabChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility (ARIA)', () => {
    it('should have role="tablist" on container', () => {
      const { container } = render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toBeInTheDocument();
    });

    it('should have role="tab" on each tab button', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(6);
    });

    it('should have correct aria-label for each tab', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      TABS.forEach((tab) => {
        const tabElement = screen.getByRole('tab', { name: new RegExp(tab.ariaLabel, 'i') });
        expect(tabElement).toBeInTheDocument();
      });
    });

    it('should set aria-selected="true" only for active tab', () => {
      render(<TabBar activeTabIndex={2} onTabChange={vi.fn()} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab, index) => {
        if (index === 2) {
          expect(tab).toHaveAttribute('aria-selected', 'true');
        } else {
          expect(tab).toHaveAttribute('aria-selected', 'false');
        }
      });
    });
  });

  describe('Keyboard Shortcuts Display', () => {
    it('should display keyboard shortcut hint for each tab', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      // Each tab should show its shortcut (1-6)
      TABS.forEach((tab) => {
        const shortcutText = String(tab.shortcutIndex);
        const tabElement = screen.getByRole('tab', { name: new RegExp(tab.ariaLabel, 'i') });
        expect(tabElement).toHaveTextContent(shortcutText);
      });
    });

    it('should display shortcuts in correct order (1-6)', () => {
      render(<TabBar activeTabIndex={0} onTabChange={vi.fn()} />);

      for (let i = 1; i <= 6; i++) {
        const tab = TABS[i - 1];
        const tabElement = screen.getByRole('tab', { name: new RegExp(tab.ariaLabel, 'i') });
        expect(tabElement).toHaveTextContent(String(i));
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle activeTabIndex of null gracefully', () => {
      render(<TabBar activeTabIndex={null} onTabChange={vi.fn()} />);

      // No tab should be selected
      const selectedTabs = screen.queryAllByRole('tab', { selected: true });
      expect(selectedTabs).toHaveLength(0);
    });

    it('should handle activeTabIndex out of range (negative)', () => {
      render(<TabBar activeTabIndex={-1} onTabChange={vi.fn()} />);

      // No tab should be selected
      const selectedTabs = screen.queryAllByRole('tab', { selected: true });
      expect(selectedTabs).toHaveLength(0);
    });

    it('should handle activeTabIndex out of range (too large)', () => {
      render(<TabBar activeTabIndex={99} onTabChange={vi.fn()} />);

      // No tab should be selected
      const selectedTabs = screen.queryAllByRole('tab', { selected: true });
      expect(selectedTabs).toHaveLength(0);
    });
  });
});
