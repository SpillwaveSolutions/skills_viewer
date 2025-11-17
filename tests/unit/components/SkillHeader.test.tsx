/**
 * Unit tests for SkillHeader component
 *
 * Tests cover:
 * - Rendering skill title and location badge only (standard mode)
 * - Rendering inline stats in compact mode
 * - NO description in header (moved to Overview tab)
 * - Location badge styling (purple for claude, green for opencode)
 * - Accessibility attributes
 * - Layout mode switching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillHeader } from '../../../src/components/SkillHeader';
import { Skill } from '../../../src/types';
import { useLayoutStore } from '../../../src/stores/layoutStore';

// Mock skill data
const mockSkill: Skill = {
  name: 'Test Skill',
  location: 'claude',
  description: 'This description should NOT appear in header',
  content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  content_clean: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  references: [
    { type: 'file', path: '/ref1.md', display_text: 'Ref 1' },
    { type: 'file', path: '/ref2.md', display_text: 'Ref 2' },
    { type: 'file', path: '/ref3.md', display_text: 'Ref 3' },
  ],
  scripts: [
    { name: 'script1', path: '/script1.sh' },
    { name: 'script2', path: '/script2.sh' },
  ],
  metadata: {
    description: 'Metadata description should also NOT appear in header',
    version: '1.0.0',
  },
  path: '/test/path',
};

describe('SkillHeader', () => {
  describe('Title Rendering', () => {
    it('should render skill name as h1', () => {
      render(<SkillHeader skill={mockSkill} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Skill');
    });

    it('should apply correct heading styles', () => {
      render(<SkillHeader skill={mockSkill} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });
  });

  describe('Location Badge', () => {
    it('should render location badge for claude location', () => {
      render(<SkillHeader skill={mockSkill} />);

      const badge = screen.getByText(/claude/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('should render location badge for opencode location', () => {
      const opencodeSkill = { ...mockSkill, location: 'opencode' as const };
      render(<SkillHeader skill={opencodeSkill} />);

      const badge = screen.getByText(/opencode/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should include location pin emoji in badge', () => {
      render(<SkillHeader skill={mockSkill} />);

      const badge = screen.getByText(/📍/);
      expect(badge).toBeInTheDocument();
    });

    it('should apply badge styling', () => {
      render(<SkillHeader skill={mockSkill} />);

      const badge = screen.getByText(/claude/i);
      expect(badge).toHaveClass('text-sm', 'px-3', 'py-1', 'rounded', 'font-medium');
    });
  });

  describe('Description NOT Rendered', () => {
    it('should NOT render skill description from metadata', () => {
      render(<SkillHeader skill={mockSkill} />);

      expect(screen.queryByText(/Metadata description/i)).not.toBeInTheDocument();
    });

    it('should NOT render skill description from skill property', () => {
      render(<SkillHeader skill={mockSkill} />);

      expect(screen.queryByText(/This description should NOT appear/i)).not.toBeInTheDocument();
    });

    it('should NOT render description label/heading', () => {
      render(<SkillHeader skill={mockSkill} />);

      expect(screen.queryByText(/📝 Description/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
    });
  });

  describe('Minimal Header Content', () => {
    it('should only contain title and badge elements', () => {
      const { container } = render(<SkillHeader skill={mockSkill} />);

      // Should have h1 (title), button (toggle), and location badge
      const h1Elements = container.querySelectorAll('h1');
      const buttonElements = container.querySelectorAll('button');

      expect(h1Elements).toHaveLength(1);
      expect(buttonElements).toHaveLength(1); // Compact mode toggle button

      // Should have location badge (containing location text)
      expect(container).toHaveTextContent('📍 claude');
    });

    it('should NOT render any stat grids', () => {
      const { container } = render(<SkillHeader skill={mockSkill} />);

      const gridElements = container.querySelectorAll('[class*="grid"]');
      expect(gridElements).toHaveLength(0);
    });

    it('should NOT render any metadata sections', () => {
      render(<SkillHeader skill={mockSkill} />);

      expect(screen.queryByText(/Version/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Triggers/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Additional Metadata/i)).not.toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should use flexbox layout for title and badge', () => {
      const { container } = render(<SkillHeader skill={mockSkill} />);

      const headerDiv = container.firstChild;
      expect(headerDiv).toHaveClass('flex');
    });

    it('should apply white background and border', () => {
      const { container } = render(<SkillHeader skill={mockSkill} />);

      const headerDiv = container.firstChild;
      expect(headerDiv).toHaveClass('bg-white', 'border-b', 'border-gray-200');
    });

    it('should apply padding', () => {
      const { container } = render(<SkillHeader skill={mockSkill} />);

      const headerDiv = container.firstChild;
      expect(headerDiv).toHaveClass('p-6');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading hierarchy', () => {
      render(<SkillHeader skill={mockSkill} />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have readable text contrast', () => {
      render(<SkillHeader skill={mockSkill} />);

      const heading = screen.getByRole('heading', { level: 1 });
      // text-gray-900 on white background has excellent contrast
      expect(heading).toHaveClass('text-gray-900');
    });
  });

  describe('Edge Cases', () => {
    it('should handle skill without metadata gracefully', () => {
      const skillWithoutMetadata = { ...mockSkill, metadata: undefined };
      render(<SkillHeader skill={skillWithoutMetadata} />);

      // Should still render title and badge
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Skill');
      expect(screen.getByText(/claude/i)).toBeInTheDocument();
    });

    it('should handle very long skill names', () => {
      const longNameSkill = {
        ...mockSkill,
        name: 'This is a very long skill name that might cause layout issues in the header',
      };
      render(<SkillHeader skill={longNameSkill} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/very long skill name/);
    });

    it('should handle empty description without rendering it', () => {
      const skillWithEmptyDesc = {
        ...mockSkill,
        description: '',
        metadata: { description: '' },
      };
      render(<SkillHeader skill={skillWithEmptyDesc} />);

      expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    beforeEach(() => {
      // Reset layout store to standard mode before each test
      useLayoutStore.setState({ mode: 'standard' });
    });

    describe('Inline Stats Rendering', () => {
      it('should render inline stats when mode is compact', () => {
        // Set compact mode
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        // Should show stats inline
        expect(screen.getByText(/3\s*refs/i)).toBeInTheDocument();
        expect(screen.getByText(/2\s*scripts/i)).toBeInTheDocument();
        expect(screen.getByText(/5\s*lines/i)).toBeInTheDocument();
      });

      it('should NOT render inline stats when mode is standard', () => {
        // Standard mode (default)
        render(<SkillHeader skill={mockSkill} />);

        // Should NOT show inline stats
        expect(screen.queryByText(/refs/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/scripts/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/lines/i)).not.toBeInTheDocument();
      });

      it('should display stats in correct format with emojis', () => {
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        // Check for emojis and format - get the stats container div
        const statsContainer = screen.getByLabelText(/statistics/i);
        expect(statsContainer.textContent).toMatch(/📚.*3\s*refs/);
        expect(statsContainer.textContent).toMatch(/🔧.*2\s*scripts/);
        expect(statsContainer.textContent).toMatch(/📏.*5\s*lines/);
      });

      it('should display stats separated by bullets', () => {
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        const statsContainer = screen.getByLabelText(/statistics/i);
        // Should contain separator bullets (·)
        expect(statsContainer.textContent).toContain('·');
      });

      it('should include trigger count in stats', () => {
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        // Should show triggers count (will be calculated from content)
        expect(screen.getByText(/triggers/i)).toBeInTheDocument();
        expect(screen.getByText(/🎯/)).toBeInTheDocument();
      });

      it('should apply monospace font to stats', () => {
        useLayoutStore.setState({ mode: 'compact' });
        const { container } = render(<SkillHeader skill={mockSkill} />);

        const statsDiv = container.querySelector('[class*="font-mono"]');
        expect(statsDiv).toBeInTheDocument();
      });

      it('should apply text-sm styling to stats', () => {
        useLayoutStore.setState({ mode: 'compact' });
        const { container } = render(<SkillHeader skill={mockSkill} />);

        const statsDiv = container.querySelector('[class*="text-sm"]');
        expect(statsDiv).toBeInTheDocument();
      });
    });

    describe('Compact Mode Stats Calculation', () => {
      it('should show zero counts when skill has no data', () => {
        const emptySkill: Skill = {
          ...mockSkill,
          references: [],
          scripts: [],
          content: '',
          content_clean: '',
        };

        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={emptySkill} />);

        expect(screen.getByText(/0\s*refs/i)).toBeInTheDocument();
        expect(screen.getByText(/0\s*scripts/i)).toBeInTheDocument();
        expect(screen.getByText(/0\s*lines/i)).toBeInTheDocument();
      });

      it('should count lines correctly', () => {
        const multilineSkill: Skill = {
          ...mockSkill,
          content:
            'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10',
        };

        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={multilineSkill} />);

        expect(screen.getByText(/10\s*lines/i)).toBeInTheDocument();
      });

      it('should handle large numbers in stats', () => {
        const largeSkill: Skill = {
          ...mockSkill,
          references: Array(999).fill({ type: 'file', path: '/ref.md', display_text: 'Ref' }),
          scripts: Array(99).fill({ name: 'script', path: '/script.sh' }),
        };

        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={largeSkill} />);

        expect(screen.getByText(/999\s*refs/i)).toBeInTheDocument();
        expect(screen.getByText(/99\s*scripts/i)).toBeInTheDocument();
      });
    });

    describe('Mode Switching', () => {
      it('should update display when mode changes from standard to compact', () => {
        const { rerender } = render(<SkillHeader skill={mockSkill} />);

        // Initially standard mode - no stats
        expect(screen.queryByText(/refs/i)).not.toBeInTheDocument();

        // Switch to compact
        useLayoutStore.setState({ mode: 'compact' });
        rerender(<SkillHeader skill={mockSkill} />);

        // Now should show stats
        expect(screen.getByText(/3\s*refs/i)).toBeInTheDocument();
      });

      it('should update display when mode changes from compact to standard', () => {
        useLayoutStore.setState({ mode: 'compact' });
        const { rerender } = render(<SkillHeader skill={mockSkill} />);

        // Initially compact mode - shows stats
        expect(screen.getByText(/3\s*refs/i)).toBeInTheDocument();

        // Switch to standard
        useLayoutStore.setState({ mode: 'standard' });
        rerender(<SkillHeader skill={mockSkill} />);

        // Now should NOT show stats
        expect(screen.queryByText(/refs/i)).not.toBeInTheDocument();
      });

      it('should always show title and badge regardless of mode', () => {
        // Standard mode
        const { rerender } = render(<SkillHeader skill={mockSkill} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Skill');
        expect(screen.getByText(/claude/i)).toBeInTheDocument();

        // Compact mode
        useLayoutStore.setState({ mode: 'compact' });
        rerender(<SkillHeader skill={mockSkill} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Skill');
        expect(screen.getByText(/claude/i)).toBeInTheDocument();
      });
    });

    describe('Compact Mode Layout', () => {
      it('should maintain single-row layout in compact mode', () => {
        useLayoutStore.setState({ mode: 'compact' });
        const { container } = render(<SkillHeader skill={mockSkill} />);

        const headerDiv = container.firstChild;
        expect(headerDiv).toHaveClass('flex');
        // Stats should be inline, not in a separate block
      });

      it('should keep stats on same row as title and badge', () => {
        useLayoutStore.setState({ mode: 'compact' });
        const { container } = render(<SkillHeader skill={mockSkill} />);

        // Should not have multiple rows or stacked layout
        const gridElements = container.querySelectorAll('[class*="grid"]');
        expect(gridElements).toHaveLength(0);
      });
    });

    describe('Compact Mode Accessibility', () => {
      it('should include aria-label for stats section', () => {
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        // Stats should have accessible label
        const statsElement = screen.getByLabelText(/statistics/i);
        expect(statsElement).toBeInTheDocument();
      });

      it('should maintain heading hierarchy in compact mode', () => {
        useLayoutStore.setState({ mode: 'compact' });
        render(<SkillHeader skill={mockSkill} />);

        // Should still have h1 for title
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });
  });
});
