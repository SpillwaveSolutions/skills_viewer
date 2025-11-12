import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useListNavigation } from '../../../src/hooks/useListNavigation';
import { useKeyboardStore } from '../../../src/stores/keyboardStore';

// Mock the keyboard store
vi.mock('../../../src/stores/keyboardStore');

describe('useListNavigation', () => {
  const mockOnSelectSkill = vi.fn();
  const mockSetHighlightedIndex = vi.fn();
  const mockSkills = [
    { name: 'Skill 1', path: '/path1' },
    { name: 'Skill 2', path: '/path2' },
    { name: 'Skill 3', path: '/path3' },
  ];

  let currentHighlightedIndex: number | null = null;

  beforeEach(() => {
    mockOnSelectSkill.mockClear();
    mockSetHighlightedIndex.mockClear();
    currentHighlightedIndex = null;

    // Mock useKeyboardStore to return current state and update it
    const mockStore = (selector: (state: any) => any) => {
      const state = {
        highlightedSkillIndex: currentHighlightedIndex,
        setHighlightedSkillIndex: (updater: ((current: number | null) => number | null) | number | null) => {
          if (typeof updater === 'function') {
            currentHighlightedIndex = updater(currentHighlightedIndex);
          } else {
            currentHighlightedIndex = updater;
          }
          mockSetHighlightedIndex(updater);
        },
      };
      return selector(state);
    };

    // Add getState method to mock store
    mockStore.getState = () => ({
      highlightedSkillIndex: currentHighlightedIndex,
      setHighlightedSkillIndex: vi.fn(),
      setVisibleSkillCount: vi.fn(),
    });

    (useKeyboardStore as unknown as any) = mockStore;
  });

  afterEach(() => {
    // Clean up event listeners
    vi.restoreAllMocks();
  });

  it('highlights first skill when Down arrow pressed and no skill highlighted', () => {
    const { result } = renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Initially no highlight
    expect(result.current.highlightedIndex).toBeNull();

    // Simulate ArrowDown
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    // Should highlight first (index 0)
    expect(currentHighlightedIndex).toBe(0);
  });

  it('moves highlight down to next skill on ArrowDown', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Highlight first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(0);

    // Move to next
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(1);

    // Move to next again
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(2);
  });

  it('moves highlight up to previous skill on ArrowUp', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Highlight first, then second
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(currentHighlightedIndex).toBe(1);

    // Move up to previous
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(0);
  });

  it('wraps to first skill when Down pressed on last skill', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Navigate to last skill (index 2)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })); // 0
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })); // 1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })); // 2
    });
    expect(currentHighlightedIndex).toBe(2);

    // Press Down on last - should wrap to first
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(0);
  });

  it('wraps to last skill when Up pressed on first skill', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Highlight first skill
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(0);

    // Press Up on first - should wrap to last
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(2); // Last index
  });

  it('selects highlighted skill on Enter press', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Highlight second skill (index 1) - split into separate acts for re-renders
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(currentHighlightedIndex).toBe(1);

    // Press Enter
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);
    });

    // Should call onSelectSkill with index 1
    expect(mockOnSelectSkill).toHaveBeenCalledWith(1);
  });

  it('clears highlight on Escape press', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Highlight first skill
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });
    expect(currentHighlightedIndex).toBe(0);

    // Press Escape
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });

    // Should clear highlight
    expect(currentHighlightedIndex).toBeNull();
  });

  it('does not select when no skill is highlighted and Enter pressed', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: mockSkills.length,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Press Enter without highlighting anything
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);
    });

    // Should not call onSelectSkill
    expect(mockOnSelectSkill).not.toHaveBeenCalled();
  });

  it('handles empty skill list gracefully', () => {
    renderHook(() =>
      useListNavigation({
        skillCount: 0,
        onSelectSkill: mockOnSelectSkill,
      })
    );

    // Press ArrowDown with empty list
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    // Should stay null
    expect(currentHighlightedIndex).toBeNull();
  });
});
