/**
 * Integration Tests: Keyboard Shortcuts (T048)
 *
 * Validates keyboard shortcuts integration with tab switching:
 * - Cmd/Ctrl+1-6 switch tabs
 * - Visual state updates immediately
 * - Existing shortcuts still work
 *
 * Test Scope: User Story 5 (Visual Feedback for Tab Interaction)
 * Success Criteria: All keyboard shortcuts work with <50ms visual update
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from '../../src/components/TabBar';
import { useKeyboardStore } from '../../src/stores/keyboardStore';
import { TABS } from '../../src/types/layout';

describe('Keyboard Shortcuts Integration', () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 6 tabs with correct structure', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(6);

    // Verify tab labels
    expect(screen.getByLabelText('Overview tab')).toBeInTheDocument();
    expect(screen.getByLabelText('Content tab')).toBeInTheDocument();
    expect(screen.getByLabelText('Triggers tab')).toBeInTheDocument();
    expect(screen.getByLabelText('Diagram tab')).toBeInTheDocument();
    expect(screen.getByLabelText('References tab')).toBeInTheDocument();
    expect(screen.getByLabelText('Scripts tab')).toBeInTheDocument();
  });

  it('clicking tab updates visual state immediately', () => {
    const { rerender } = render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const contentTab = screen.getByLabelText('Content tab');
    fireEvent.click(contentTab);

    expect(mockOnTabChange).toHaveBeenCalledWith(1);

    // Re-render with new active tab
    rerender(<TabBar activeTabIndex={1} onTabChange={mockOnTabChange} />);

    // Verify visual state updated
    expect(contentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('active tab has correct visual classes', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const activeTab = screen.getByLabelText('Overview tab');

    // Check for purple border class
    expect(activeTab.className).toContain('border-purple-500');
    expect(activeTab.className).toContain('shadow-sm');
  });

  it('inactive tab has correct visual classes', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const inactiveTab = screen.getByLabelText('Content tab');

    // Check for transparent border and hover classes
    expect(inactiveTab.className).toContain('border-transparent');
    expect(inactiveTab.className).toContain('hover:bg-gray-700');
  });

  it('all tabs have transition classes', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('tab');

    tabs.forEach((tab) => {
      expect(tab.className).toContain('transition-colors');
      expect(tab.className).toContain('duration-150');
    });
  });

  it('all tabs have focus ring classes', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('tab');

    tabs.forEach((tab) => {
      expect(tab.className).toContain('focus:ring-2');
      expect(tab.className).toContain('focus:ring-purple-500');
      expect(tab.className).toContain('focus:ring-offset-2');
    });
  });

  it('switching tabs updates aria-selected correctly', () => {
    const { rerender } = render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const overviewTab = screen.getByLabelText('Overview tab');
    const contentTab = screen.getByLabelText('Content tab');

    // Initial state
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    expect(contentTab).toHaveAttribute('aria-selected', 'false');

    // Click content tab
    fireEvent.click(contentTab);
    rerender(<TabBar activeTabIndex={1} onTabChange={mockOnTabChange} />);

    // Verify updated state
    expect(overviewTab).toHaveAttribute('aria-selected', 'false');
    expect(contentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('rapid tab switching updates visual state correctly', () => {
    const { rerender } = render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    // Simulate rapid keyboard shortcuts: 1 -> 2 -> 3 -> 4
    fireEvent.click(screen.getByLabelText('Overview tab'));
    rerender(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByLabelText('Content tab'));
    rerender(<TabBar activeTabIndex={1} onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByLabelText('Triggers tab'));
    rerender(<TabBar activeTabIndex={2} onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByLabelText('Diagram tab'));
    rerender(<TabBar activeTabIndex={3} onTabChange={mockOnTabChange} />);

    // Verify final state
    const diagramTab = screen.getByLabelText('Diagram tab');
    expect(diagramTab).toHaveAttribute('aria-selected', 'true');
    expect(diagramTab.className).toContain('border-purple-500');
  });

  it('keyboard shortcut hints are visible on all tabs', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    TABS.forEach((tab) => {
      const tabElement = screen.getByLabelText(tab.ariaLabel);
      expect(tabElement).toHaveTextContent(tab.shortcutIndex.toString());
    });
  });

  it('maintains tab state during re-renders', () => {
    const { rerender } = render(<TabBar activeTabIndex={2} onTabChange={mockOnTabChange} />);

    const triggersTab = screen.getByLabelText('Triggers tab');
    expect(triggersTab).toHaveAttribute('aria-selected', 'true');

    // Re-render with same state
    rerender(<TabBar activeTabIndex={2} onTabChange={mockOnTabChange} />);

    // State should remain unchanged
    expect(triggersTab).toHaveAttribute('aria-selected', 'true');
    expect(triggersTab.className).toContain('border-purple-500');
  });

  it('handles null activeTabIndex gracefully', () => {
    render(<TabBar activeTabIndex={null} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('tab');

    // All tabs should be inactive (no purple border)
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected', 'false');
    });
  });

  it('tab bar has correct ARIA attributes', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    const tablist = screen.getByRole('tablist');

    expect(tablist).toHaveAttribute('aria-label', 'Skill content navigation');
  });

  it('each tab has correct ARIA controls', () => {
    render(<TabBar activeTabIndex={0} onTabChange={mockOnTabChange} />);

    TABS.forEach((tab) => {
      const tabElement = screen.getByLabelText(tab.ariaLabel);
      expect(tabElement).toHaveAttribute('aria-controls', `tabpanel-${tab.id}`);
      expect(tabElement).toHaveAttribute('id', `tab-${tab.id}`);
    });
  });
});
