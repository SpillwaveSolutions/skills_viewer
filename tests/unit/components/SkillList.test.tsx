import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Skill } from '../../../src/types';

const mockSkills: Skill[] = [
  {
    name: 'skill-1',
    path: '/path/to/skill-1',
    description: 'First skill',
    triggers: [],
    references: [],
    scripts: [],
    location: 'claude',
  },
  {
    name: 'skill-2',
    path: '/path/to/skill-2',
    description: 'Second skill',
    triggers: [],
    references: [],
    scripts: [],
    location: 'claude',
  },
  {
    name: 'skill-3',
    path: '/path/to/skill-3',
    description: 'Third skill',
    triggers: [],
    references: [],
    scripts: [],
    location: 'claude',
  },
];

const mockSelectSkill = vi.fn();
const mockSetVisibleSkillCount = vi.fn();

// Mock module state that can be updated per test
let mockSelectedSkill: Skill | null = null;
let mockHighlightedIndex: number | null = null;

// Mock the stores first
vi.mock('../../../src/stores', () => ({
  useSkillStore: vi.fn(),
}));

vi.mock('../../../src/stores/keyboardStore', () => ({
  useKeyboardStore: vi.fn(),
}));

// Mock the hooks
vi.mock('../../../src/hooks', () => ({
  useSkills: vi.fn(() => ({
    skills: mockSkills,
    isLoading: false,
    error: null,
    reload: vi.fn(),
  })),
  useListNavigation: vi.fn(() => ({ highlightedIndex: null })),
}));

import { useSkillStore } from '../../../src/stores';
import { useKeyboardStore } from '../../../src/stores/keyboardStore';
import { SkillList } from '../../../src/components/SkillList';

describe('SkillList - List Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedSkill = null;
    mockHighlightedIndex = null;

    // Set up store mocks to return values based on selector
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      const storeState = { selectedSkill: mockSelectedSkill, selectSkill: mockSelectSkill };
      if (typeof selector === 'function') {
        return selector(storeState);
      }
      // No selector - return entire store (Zustand 4+ pattern)
      return storeState;
    });

    (useKeyboardStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      const storeState = {
        highlightedSkillIndex: mockHighlightedIndex,
        setVisibleSkillCount: mockSetVisibleSkillCount,
      };
      if (typeof selector === 'function') {
        return selector(storeState);
      }
      return storeState;
    });
  });

  it('applies highlighted class to highlighted skill', () => {
    // Set highlighted index to 1
    mockHighlightedIndex = 1;

    render(<SkillList />);

    const skillItems = screen.getAllByRole('option');

    // First skill - not highlighted
    expect(skillItems[0]).not.toHaveClass('bg-amber-50');
    expect(skillItems[0]).not.toHaveClass('border-l-amber-400');

    // Second skill - highlighted
    expect(skillItems[1]).toHaveClass('bg-amber-50');
    expect(skillItems[1]).toHaveClass('border-l-2');
    expect(skillItems[1]).toHaveClass('border-l-amber-400');

    // Third skill - not highlighted
    expect(skillItems[2]).not.toHaveClass('bg-amber-50');
    expect(skillItems[2]).not.toHaveClass('border-l-amber-400');
  });

  it('applies distinct classes for highlighted vs selected', () => {
    // Set first skill selected, second highlighted
    mockSelectedSkill = mockSkills[0];
    mockHighlightedIndex = 1;

    render(<SkillList />);

    const skillItems = screen.getAllByRole('option');

    // First skill - selected (blue border)
    expect(skillItems[0]).toHaveClass('bg-blue-50');
    expect(skillItems[0]).toHaveClass('border-l-blue-500');
    expect(skillItems[0]).not.toHaveClass('border-l-amber-400');

    // Second skill - highlighted (amber border)
    expect(skillItems[1]).toHaveClass('bg-amber-50');
    expect(skillItems[1]).toHaveClass('border-l-2');
    expect(skillItems[1]).toHaveClass('border-l-amber-400');
    expect(skillItems[1]).not.toHaveClass('border-l-blue-500');

    // Third skill - neither
    expect(skillItems[2]).not.toHaveClass('bg-blue-50');
    expect(skillItems[2]).not.toHaveClass('bg-amber-50');
  });

  it('handles out-of-bounds highlightedSkillIndex gracefully', () => {
    // Set invalid index
    mockHighlightedIndex = 99;

    // Should not crash with invalid index
    render(<SkillList />);

    // All skills should render without highlighted class
    const skillItems = screen.getAllByRole('option');
    skillItems.forEach((item) => {
      expect(item).not.toHaveClass('bg-amber-50');
      expect(item).not.toHaveClass('border-l-amber-400');
    });
  });

  it('handles null highlightedSkillIndex gracefully', () => {
    mockHighlightedIndex = null;

    render(<SkillList />);

    // All skills should render without highlighted class
    const skillItems = screen.getAllByRole('option');
    skillItems.forEach((item) => {
      expect(item).not.toHaveClass('bg-amber-50');
      expect(item).not.toHaveClass('border-l-amber-400');
    });
  });

  it('adds aria-activedescendant to list when skill is highlighted', () => {
    mockHighlightedIndex = 1;

    const { container } = render(<SkillList />);

    const listContainer = container.querySelector('[role="listbox"]');
    expect(listContainer).toHaveAttribute('aria-activedescendant', 'skill-item-1');
  });

  it('does not set aria-activedescendant when no skill highlighted', () => {
    mockHighlightedIndex = null;

    const { container } = render(<SkillList />);

    const listContainer = container.querySelector('[role="listbox"]');
    expect(listContainer).not.toHaveAttribute('aria-activedescendant');
  });

  it('scrolls highlighted skill into view', () => {
    // Mock scrollIntoView
    const mockScrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    // Initial render with no highlight
    mockHighlightedIndex = null;
    const { rerender } = render(<SkillList />);

    // Update to highlight skill 2
    mockHighlightedIndex = 2;
    rerender(<SkillList />);

    // scrollIntoView should be called
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'smooth',
    });
  });

  it('handles both highlighted and selected being the same skill', () => {
    mockSelectedSkill = mockSkills[1];
    mockHighlightedIndex = 1;

    render(<SkillList />);

    const skillItems = screen.getAllByRole('option');

    // Second skill - both selected AND highlighted
    // Should show selected border (takes precedence)
    expect(skillItems[1]).toHaveClass('bg-blue-50');
    expect(skillItems[1]).toHaveClass('border-l-blue-500');
  });
});
