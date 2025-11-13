import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../../../../src/components/filters/FilterPanel';
import { useSkillStore } from '../../../../src/stores/useSkillStore';
import { act } from 'react';

describe('FilterPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset store state
    const store = useSkillStore.getState();
    store.resetSearchFilters();
    store.setSkills([
      {
        name: 'Skill 1',
        location: 'claude',
        path: '/test/1',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: { tags: ['pdf', 'documents'] },
      },
      {
        name: 'Skill 2',
        location: 'opencode',
        path: '/test/2',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: { tags: ['excel'] },
      },
    ]);
  });

  it('should not render when closed', () => {
    render(<FilterPanel isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should show Filters heading', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should render LocationFilter component', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('~/.claude/skills')).toBeInTheDocument();
    expect(screen.getByText('~/.config/opencode/skills')).toBeInTheDocument();
  });

  it('should render TagFilter component', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText('Search tags...')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Close filter panel/i);

    act(() => {
      fireEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop clicked', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const backdrop = document.querySelector('.fixed.inset-0.bg-black');

    act(() => {
      if (backdrop) {
        fireEvent.click(backdrop);
      }
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show active filter count when location filtered', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);

    act(() => {
      fireEvent.click(claudeCheckbox);
    });

    // Should show badge with count
    const badge = screen.getByLabelText(/1 active filter/i);
    expect(badge).toBeInTheDocument();
  });

  it('should show active filter count for selected tags', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);
    const excelCheckbox = screen.getByLabelText(/Filter by excel tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
      fireEvent.click(excelCheckbox);
    });

    // Should show badge with count of 2 tags
    const badge = screen.getByLabelText(/2 active filters/i);
    expect(badge).toBeInTheDocument();
  });

  it('should show clear all button when filters active', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
    });

    const clearButton = screen.getByText(/Clear all filters/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear all filters when clear all button clicked', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);
    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
      fireEvent.click(claudeCheckbox);
    });

    const clearButton = screen.getByText(/Clear all filters/i);

    act(() => {
      fireEvent.click(clearButton);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.tags).toEqual([]);
    expect(store.searchFilters.locations).toEqual(['claude', 'opencode']);
  });

  it('should not show clear all button when no filters active', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.queryByText(/Clear all filters/i)).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog', { name: /Filter panel/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should handle Escape key press', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose on other key presses', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    act(() => {
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should count both locations and tags in active filter count', () => {
    render(<FilterPanel isOpen={true} onClose={mockOnClose} />);

    const claudeCheckbox = screen.getByLabelText(/Filter by Claude skills/i);
    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(claudeCheckbox);
      fireEvent.click(pdfCheckbox);
    });

    // 1 location filter + 1 tag = 2 active filters
    const badge = screen.getByLabelText(/2 active filters/i);
    expect(badge).toBeInTheDocument();
  });
});
