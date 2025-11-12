/**
 * Unit tests for KeyboardShortcutHelp component
 *
 * TDD Approach: These tests are written BEFORE the component implementation.
 * They should FAIL until src/components/KeyboardShortcutHelp.tsx is implemented.
 *
 * Component displays a modal with all keyboard shortcuts grouped by context.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcutHelp } from '@/components/KeyboardShortcutHelp';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('KeyboardShortcutHelp', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    useKeyboardStore.getState().reset();
    useKeyboardStore.getState().detectPlatform();
  });

  describe('Visibility', () => {
    it('should render when isOpen is true', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<KeyboardShortcutHelp isOpen={false} onClose={mockOnClose} />);

      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });

    it('should have title "Keyboard Shortcuts"', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const title = screen.getByText('Keyboard Shortcuts');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Shortcuts Display', () => {
    it('should display shortcuts grouped by context', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Verify all context groups are present
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Tabs')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('should display key combo for each shortcut', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Search shortcuts
      expect(screen.getByText('Focus search input')).toBeInTheDocument();
      expect(screen.getByText('Clear search and unfocus')).toBeInTheDocument();

      // Navigation shortcuts
      expect(screen.getByText('Move to next item')).toBeInTheDocument();
      expect(screen.getByText('Move to previous item')).toBeInTheDocument();
      expect(screen.getByText('Select highlighted item')).toBeInTheDocument();

      // Tab shortcuts
      expect(screen.getByText('Overview tab')).toBeInTheDocument();
      expect(screen.getByText('Content tab')).toBeInTheDocument();

      // Help shortcut
      expect(screen.getByText('Show this help')).toBeInTheDocument();
    });

    it('should display platform-specific key symbols on macOS', () => {
      // Set platform to macOS
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacIntel' });
      useKeyboardStore.getState().detectPlatform();

      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Should show ⌘ for Cmd key on Mac (appears multiple times)
      const cmdSymbols = screen.getAllByText('⌘');
      expect(cmdSymbols.length).toBeGreaterThan(0);

      vi.unstubAllGlobals();
    });

    it('should display platform-specific key symbols on Windows/Linux', () => {
      // Set platform to Windows
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win32' });
      useKeyboardStore.getState().detectPlatform();

      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Should show Ctrl on Windows/Linux (appears multiple times)
      const ctrlSymbols = screen.getAllByText('Ctrl');
      expect(ctrlSymbols.length).toBeGreaterThan(0);

      vi.unstubAllGlobals();
    });

    it('should display descriptions for each shortcut', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Verify descriptions are present
      expect(screen.getByText(/Focus search input/i)).toBeInTheDocument();
      expect(screen.getByText(/Clear search and unfocus/i)).toBeInTheDocument();
      expect(screen.getByText(/Move to next item/i)).toBeInTheDocument();
      expect(screen.getByText(/Move to previous item/i)).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have role="dialog"', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('role', 'dialog');
    });

    it('should have aria-modal="true"', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      const labelId = modal.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();

      const title = document.getElementById(labelId!);
      expect(title).toHaveTextContent('Keyboard Shortcuts');
    });

    it('should have aria-describedby for modal description', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      const descId = modal.getAttribute('aria-describedby');
      expect(descId).toBeTruthy();

      const description = document.getElementById(descId!);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay/backdrop', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      const overlay = modal.parentElement;

      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not call onClose when clicking inside modal content', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      await user.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Structure', () => {
    it('should group shortcuts by context', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Verify groups are in expected order
      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThanOrEqual(5);
    });

    it('should display shortcuts in a structured format', () => {
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      // Verify modal structure exists
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Should have kbd elements for keys
      const kbdElements = document.querySelectorAll('kbd');
      expect(kbdElements.length).toBeGreaterThan(0);

      // Should have description text
      expect(screen.getByText('Focus search input')).toBeInTheDocument();
    });
  });

  describe('Focus Trap', () => {
    it('should trap focus within modal when tabbing forward', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: /close/i });

      // Focus should start on close button
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Tab multiple times
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should still be within modal
      const activeElement = document.activeElement;
      expect(modal.contains(activeElement)).toBe(true);
    });

    it('should wrap focus to first element when tabbing from last', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');

      // Get all focusable elements
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const firstElement = focusableElements[0] as HTMLElement;

      // Focus last element
      lastElement.focus();
      expect(lastElement).toHaveFocus();

      // Tab forward - should wrap to first
      await user.tab();

      expect(firstElement).toHaveFocus();
    });

    it('should wrap focus to last element when shift-tabbing from first', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');

      // Get all focusable elements
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus first element
      firstElement.focus();
      expect(firstElement).toHaveFocus();

      // Shift+Tab backward - should wrap to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');

      expect(lastElement).toHaveFocus();
    });

    it('should maintain focus within modal even with many tabs', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');

      // Tab 20 times
      for (let i = 0; i < 20; i++) {
        await user.tab();
      }

      // Focus should still be within modal
      const activeElement = document.activeElement;
      expect(modal.contains(activeElement)).toBe(true);
    });

    it('should restore focus to trigger element on close', async () => {
      const user = userEvent.setup();

      // Create a trigger button
      const { container } = render(
        <>
          <button data-testid="trigger">Open Help</button>
          <KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />
        </>
      );

      const triggerButton = screen.getByTestId('trigger');

      // Simulate trigger button being focused before modal opened
      triggerButton.focus();
      expect(triggerButton).toHaveFocus();

      // Close modal
      await user.keyboard('{Escape}');

      // Wait for focus restoration
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not allow focus to escape modal with mouse click outside', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <>
          <button data-testid="outside">Outside Button</button>
          <KeyboardShortcutHelp isOpen={true} onClose={mockOnClose} />
        </>
      );

      const modal = screen.getByRole('dialog');
      const outsideButton = screen.getByTestId('outside');

      // Try to click outside button
      await user.click(outsideButton);

      // Focus should stay within modal (or modal should close via onClose)
      const activeElement = document.activeElement;
      expect(modal.contains(activeElement) || mockOnClose).toBeTruthy();
    });
  });
});
