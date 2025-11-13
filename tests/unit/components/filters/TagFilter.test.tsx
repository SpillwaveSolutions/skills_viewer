import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilter } from '../../../../src/components/filters/TagFilter';
import { useSkillStore } from '../../../../src/stores/useSkillStore';
import { act } from 'react';

describe('TagFilter', () => {
  beforeEach(() => {
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
        location: 'claude',
        path: '/test/2',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: { tags: ['excel', 'spreadsheet'] },
      },
      {
        name: 'Skill 3',
        location: 'opencode',
        path: '/test/3',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: { tags: ['pdf', 'spreadsheet'] },
      },
    ]);
  });

  it('should render tag filter heading', () => {
    render(<TagFilter />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('should show all available tags', () => {
    render(<TagFilter />);

    expect(screen.getByText('documents')).toBeInTheDocument();
    expect(screen.getByText('excel')).toBeInTheDocument();
    expect(screen.getByText('pdf')).toBeInTheDocument();
    expect(screen.getByText('spreadsheet')).toBeInTheDocument();
  });

  it('should show tag counts', () => {
    render(<TagFilter />);

    // pdf appears in 2 skills
    const pdfLabel = screen.getByLabelText(/Filter by pdf tag \(2 skills\)/i);
    expect(pdfLabel).toBeInTheDocument();

    // excel appears in 1 skill
    const excelLabel = screen.getByLabelText(/Filter by excel tag \(1 skills\)/i);
    expect(excelLabel).toBeInTheDocument();
  });

  it('should have search input', () => {
    render(<TagFilter />);

    const searchInput = screen.getByPlaceholderText('Search tags...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter tags by search query', () => {
    render(<TagFilter />);

    const searchInput = screen.getByPlaceholderText('Search tags...');

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'pdf' } });
    });

    expect(screen.getByText('pdf')).toBeInTheDocument();
    expect(screen.queryByText('excel')).not.toBeInTheDocument();
  });

  it('should toggle tag selection', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.tags).toContain('pdf');
  });

  it('should show selected tags', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
    });

    // Should show the selected tag badge
    const selectedTags = screen.getAllByText('pdf');
    expect(selectedTags.length).toBeGreaterThan(1); // One in list, one in selected
  });

  it('should remove selected tag when clicking X button', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
    });

    const removeButton = screen.getByLabelText(/Remove pdf filter/i);

    act(() => {
      fireEvent.click(removeButton);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.tags).not.toContain('pdf');
  });

  it('should show clear all button when tags selected', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
    });

    const clearButton = screen.getByText(/Clear all/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear all selected tags', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);
    const excelCheckbox = screen.getByLabelText(/Filter by excel tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
      fireEvent.click(excelCheckbox);
    });

    const clearButton = screen.getByText(/Clear all/i);

    act(() => {
      fireEvent.click(clearButton);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.tags).toEqual([]);
  });

  it('should allow multiple tag selection', () => {
    render(<TagFilter />);

    const pdfCheckbox = screen.getByLabelText(/Filter by pdf tag/i);
    const excelCheckbox = screen.getByLabelText(/Filter by excel tag/i);

    act(() => {
      fireEvent.click(pdfCheckbox);
      fireEvent.click(excelCheckbox);
    });

    const store = useSkillStore.getState();
    expect(store.searchFilters.tags).toContain('pdf');
    expect(store.searchFilters.tags).toContain('excel');
  });

  it('should show message when no tags available', () => {
    const store = useSkillStore.getState();
    store.setSkills([
      {
        name: 'Skill Without Tags',
        location: 'claude',
        path: '/test/1',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
        metadata: {},
      },
    ]);

    render(<TagFilter />);

    expect(screen.getByText(/No tags found in skill metadata/i)).toBeInTheDocument();
  });

  it('should show message when search has no results', () => {
    render(<TagFilter />);

    const searchInput = screen.getByPlaceholderText('Search tags...');

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    });

    expect(screen.getByText(/No tags match "nonexistent"/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<TagFilter />);

    const group = screen.getByRole('group', { name: /Filter by tags/i });
    expect(group).toBeInTheDocument();
  });
});
