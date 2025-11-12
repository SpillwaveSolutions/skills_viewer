/**
 * Unit tests for SearchBar component with keyboard shortcuts
 *
 * TDD Approach: These tests are written BEFORE enhancing the SearchBar component.
 * They should FAIL until src/components/SearchBar.tsx is enhanced with:
 * - useRef for input element
 * - useEffect to monitor searchFocusRequested
 * - Focus and text selection logic
 * - Escape key handler to clear search
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/SearchBar';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('SearchBar', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    useKeyboardStore.getState().reset();
  });

  describe('Basic Rendering', () => {
    it('should render with placeholder', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search skills...');
      expect(input).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          placeholder="Custom placeholder"
        />
      );

      const input = screen.getByPlaceholderText('Custom placeholder');
      expect(input).toBeInTheDocument();
    });

    it('should display current value', () => {
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test query');
    });
  });

  describe('Keyboard Shortcut Focus (US1)', () => {
    it('should focus input when searchFocusRequested becomes true', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).not.toHaveFocus();

      // Trigger focus request from store
      act(() => {
        useKeyboardStore.getState().setSearchFocusRequested(true);
      });

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('should select existing text when focused', async () => {
      render(<SearchBar value="existing text" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Trigger focus request from store
      act(() => {
        useKeyboardStore.getState().setSearchFocusRequested(true);
      });

      await waitFor(() => {
        expect(input).toHaveFocus();
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe('existing text'.length);
      });
    });

    it('should reset searchFocusRequested after focusing', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      // Set searchFocusRequested to true
      act(() => {
        useKeyboardStore.getState().setSearchFocusRequested(true);
      });

      await waitFor(() => {
        const state = useKeyboardStore.getState();
        expect(state.searchFocusRequested).toBe(false);
      });
    });

    it('should work when focus is requested from detail page', async () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Simulate being on detail page (input not focused)
      input.blur();
      expect(input).not.toHaveFocus();

      // User presses Cmd/Ctrl+F from detail page
      act(() => {
        useKeyboardStore.getState().setSearchFocusRequested(true);
      });

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Escape Key Handling (US1)', () => {
    it('should clear search and blur input on Escape', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Focus input first
      input.focus();
      expect(input).toHaveFocus();

      // Press Escape
      await user.keyboard('{Escape}');

      // Should call onChange with empty string
      expect(mockOnChange).toHaveBeenCalledWith('');

      // Should blur input
      await waitFor(() => {
        expect(input).not.toHaveFocus();
      });
    });

    it('should not clear search if input is not focused', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="test query" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Ensure input is not focused
      input.blur();
      expect(input).not.toHaveFocus();

      // Press Escape (should not trigger clear since input not focused)
      await user.keyboard('{Escape}');

      // Should not call onChange
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should clear even when search has content', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="long search query" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      input.focus();

      await user.keyboard('{Escape}');

      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('Text Input', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'test');

      // user.type triggers onChange once per character
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange.mock.calls).toContainEqual(['t']);
      expect(mockOnChange.mock.calls).toContainEqual(['e']);
      expect(mockOnChange.mock.calls).toContainEqual(['s']);
      expect(mockOnChange.mock.calls).toContainEqual(['t']);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have searchbox role', () => {
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      // Tab to focus
      await user.tab();
      expect(input).toHaveFocus();
    });
  });
});
