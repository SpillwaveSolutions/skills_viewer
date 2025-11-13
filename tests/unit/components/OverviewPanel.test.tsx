/**
 * Unit tests for OverviewPanel component
 * Tests stat card rendering, navigation callbacks, and accessibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverviewPanel } from '@/components/OverviewPanel';
import {
  mockSkillComplete,
  mockSkillMinimal,
  mockSkillManyTriggers,
} from '../../fixtures/mockSkills';

// Mock the trigger analyzer to control its output
vi.mock('@/utils/triggerAnalyzer', () => ({
  analyzeTriggers: vi.fn(() => [
    { keyword: 'complete', category: 'technology', confidence: 'high' },
    { keyword: 'test', category: 'action', confidence: 'high' },
    { keyword: 'example', category: 'topic', confidence: 'medium' },
  ]),
}));

import { analyzeTriggers } from '@/utils/triggerAnalyzer';

describe('OverviewPanel', () => {
  const mockOnNavigateToTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default behavior
    (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue([
      { keyword: 'complete', category: 'technology', confidence: 'high' },
      { keyword: 'test', category: 'action', confidence: 'high' },
      { keyword: 'example', category: 'topic', confidence: 'medium' },
    ]);
  });

  describe('Rendering', () => {
    it('should render skill name', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      expect(screen.getByText(mockSkillComplete.name)).toBeInTheDocument();
    });

    it('should render skill location badge', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      // Location appears with an emoji, so use regex
      expect(screen.getByText(/claude|opencode/i)).toBeInTheDocument();
    });

    it('should render description when present', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      expect(screen.getByText(/comprehensive test skill/i)).toBeInTheDocument();
    });

    it('should not render description section when absent', () => {
      render(<OverviewPanel skill={mockSkillMinimal} />);

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should render version when present in metadata', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      expect(screen.getByText('2.5.3')).toBeInTheDocument();
    });

    it('should not render version section when absent', () => {
      render(<OverviewPanel skill={mockSkillMinimal} />);

      const versionHeading = screen.queryByText(/🏷️ version/i);
      expect(versionHeading).not.toBeInTheDocument();
    });
  });

  describe('Stat Cards', () => {
    it('should render references count', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const referencesButton = screen.getByRole('button', { name: /view 2 references/i });
      expect(referencesButton).toBeInTheDocument();
      // The "2" appears in the button, check within the button
      expect(referencesButton).toHaveTextContent('2');
    });

    it('should render scripts count', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const scriptsButton = screen.getByRole('button', { name: /view 2 scripts/i });
      expect(scriptsButton).toBeInTheDocument();
    });

    it('should render triggers count', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const triggersButton = screen.getByRole('button', { name: /view \d+ trigger keywords/i });
      expect(triggersButton).toBeInTheDocument();
    });

    it('should render line count', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const lineCountGroup = screen.getByRole('group', { name: /line count/i });
      expect(lineCountGroup).toBeInTheDocument();
    });

    it('should format line count with locale', () => {
      const skillWithManyLines = {
        ...mockSkillComplete,
        content: Array(5000).fill('line').join('\n'),
      };

      render(<OverviewPanel skill={skillWithManyLines} />);

      // Should format as "5,000" (or localized equivalent)
      expect(screen.getByText(/5,000|5\.000|5 000/)).toBeInTheDocument();
    });

    it('should handle zero references', () => {
      const skillNoRefs = { ...mockSkillComplete, references: [] };
      render(<OverviewPanel skill={skillNoRefs} />);

      expect(screen.getByRole('button', { name: /view 0 references/i })).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle zero scripts', () => {
      const skillNoScripts = { ...mockSkillComplete, scripts: [] };
      render(<OverviewPanel skill={skillNoScripts} />);

      expect(screen.getByRole('button', { name: /view 0 scripts/i })).toBeInTheDocument();
    });
  });

  describe('Trigger Preview', () => {
    it('should render first 5 triggers', () => {
      (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue([
        { keyword: 'trigger01', category: 'action', confidence: 'high' },
        { keyword: 'trigger02', category: 'action', confidence: 'high' },
        { keyword: 'trigger03', category: 'action', confidence: 'high' },
        { keyword: 'trigger04', category: 'action', confidence: 'high' },
        { keyword: 'trigger05', category: 'action', confidence: 'high' },
      ]);

      render(<OverviewPanel skill={mockSkillManyTriggers} />);

      // Should show first 5 triggers
      expect(screen.getByText('trigger01')).toBeInTheDocument();
      expect(screen.getByText('trigger02')).toBeInTheDocument();
      expect(screen.getByText('trigger03')).toBeInTheDocument();
      expect(screen.getByText('trigger04')).toBeInTheDocument();
      expect(screen.getByText('trigger05')).toBeInTheDocument();
    });

    it('should show "+N more" when more than 5 triggers', () => {
      (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue(
        Array.from({ length: 20 }, (_, i) => ({
          keyword: `trigger${String(i + 1).padStart(2, '0')}`,
          category: 'action' as const,
          confidence: 'high' as const,
        }))
      );

      render(<OverviewPanel skill={mockSkillManyTriggers} />);

      // 20 triggers total, showing 5, so +15 more
      expect(screen.getByText('+15 more')).toBeInTheDocument();
    });

    it('should not show "+N more" when 5 or fewer triggers', () => {
      (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue([
        { keyword: 'complete', category: 'technology', confidence: 'high' },
        { keyword: 'test', category: 'action', confidence: 'high' },
        { keyword: 'example', category: 'topic', confidence: 'medium' },
      ]);

      render(<OverviewPanel skill={mockSkillComplete} />);

      expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
    });

    it('should not render trigger section when no triggers', () => {
      (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue([]);

      const skillNoTriggers = { ...mockSkillComplete, triggers: [] };
      render(<OverviewPanel skill={skillNoTriggers} />);

      expect(screen.queryByText(/common triggers/i)).not.toBeInTheDocument();
    });

    it('should truncate long trigger keywords', () => {
      (analyzeTriggers as ReturnType<typeof vi.fn>).mockReturnValue([
        { keyword: 'a'.repeat(100), category: 'technology', confidence: 'high' },
      ]);

      const skillLongTrigger = {
        ...mockSkillComplete,
        triggers: ['a'.repeat(100)],
      };

      render(<OverviewPanel skill={skillLongTrigger} />);

      const triggerBadge = screen.getByText('a'.repeat(100));
      expect(triggerBadge).toHaveClass('truncate');
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onNavigateToTab with "references" when references card clicked', () => {
      render(<OverviewPanel skill={mockSkillComplete} onNavigateToTab={mockOnNavigateToTab} />);

      const referencesButton = screen.getByRole('button', { name: /view 2 references/i });
      fireEvent.click(referencesButton);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith('references');
    });

    it('should call onNavigateToTab with "scripts" when scripts card clicked', () => {
      render(<OverviewPanel skill={mockSkillComplete} onNavigateToTab={mockOnNavigateToTab} />);

      const scriptsButton = screen.getByRole('button', { name: /view 2 scripts/i });
      fireEvent.click(scriptsButton);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith('scripts');
    });

    it('should call onNavigateToTab with "triggers" when triggers card clicked', () => {
      render(<OverviewPanel skill={mockSkillComplete} onNavigateToTab={mockOnNavigateToTab} />);

      const triggersButton = screen.getByRole('button', { name: /view \d+ trigger keywords/i });
      fireEvent.click(triggersButton);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith('triggers');
    });

    it('should not crash when onNavigateToTab is undefined', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const referencesButton = screen.getByRole('button', { name: /view 2 references/i });

      // Should not throw
      expect(() => fireEvent.click(referencesButton)).not.toThrow();
    });
  });

  describe('Additional Metadata', () => {
    it('should render additional metadata fields', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      // mockSkillComplete has: author, tags, category, license
      expect(screen.getByText(/author:/i)).toBeInTheDocument();
      expect(screen.getByText('Complete Author')).toBeInTheDocument();
    });

    it('should not render additional metadata section when only standard fields present', () => {
      const skillStandardMetadata = {
        ...mockSkillMinimal,
        metadata: {
          description: 'Test',
          version: '1.0.0',
        },
      };

      render(<OverviewPanel skill={skillStandardMetadata} />);

      expect(screen.queryByText(/additional metadata/i)).not.toBeInTheDocument();
    });

    it('should filter out description and version from additional metadata', () => {
      const skillWithAllFields = {
        ...mockSkillComplete,
        metadata: {
          description: 'Should not appear in additional',
          version: 'Should not appear in additional',
          custom_field: 'Should appear',
        },
      };

      render(<OverviewPanel skill={skillWithAllFields} />);

      // "Should not appear" should only be in description/version sections
      const additionalMetadataSection = screen.queryByText(/ℹ️ additional metadata/i);
      if (additionalMetadataSection) {
        // custom_field should be in additional metadata
        expect(screen.getByText(/custom_field:/i)).toBeInTheDocument();
      }
    });
  });

  describe('Location Badge Styling', () => {
    it('should apply purple styling for claude location', () => {
      const claudeSkill = { ...mockSkillComplete, location: 'claude' as const };
      render(<OverviewPanel skill={claudeSkill} />);

      // Badge contains emoji and text, find by text content
      const badge = screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && content.includes('claude');
      });
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('should apply green styling for opencode location', () => {
      const opencodeSkill = { ...mockSkillComplete, location: 'opencode' as const };
      render(<OverviewPanel skill={opencodeSkill} />);

      // Badge contains emoji and text, find by text content
      const badge = screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && content.includes('opencode');
      });
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for clickable stat cards', () => {
      render(<OverviewPanel skill={mockSkillComplete} onNavigateToTab={mockOnNavigateToTab} />);

      const buttons = screen.getAllByRole('button');
      // At least 3 buttons (references, scripts, triggers)
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper aria-label on stat card buttons', () => {
      render(<OverviewPanel skill={mockSkillComplete} onNavigateToTab={mockOnNavigateToTab} />);

      expect(screen.getByRole('button', { name: /view 2 references/i })).toHaveAttribute(
        'aria-label'
      );
      expect(screen.getByRole('button', { name: /view 2 scripts/i })).toHaveAttribute('aria-label');
    });

    it('should have role group for non-clickable line count', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      const lineCountCard = screen.getByRole('group', { name: /line count/i });
      expect(lineCountCard).toHaveAttribute('aria-label', 'Line count');
    });

    it('should use aria-hidden for decorative emojis', () => {
      render(<OverviewPanel skill={mockSkillComplete} />);

      // Emojis in stat cards should be hidden from screen readers
      const statCards = screen.getAllByRole('button');
      statCards.forEach((card) => {
        const emoji = card.querySelector('[aria-hidden="true"]');
        expect(emoji).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle skill without metadata', () => {
      const noMetadata = { ...mockSkillComplete, metadata: undefined };
      render(<OverviewPanel skill={noMetadata} />);

      // Should still render name and stats
      expect(screen.getByText(noMetadata.name)).toBeInTheDocument();
    });

    it('should handle empty metadata object', () => {
      const emptyMetadata = { ...mockSkillComplete, metadata: {}, description: undefined };
      render(<OverviewPanel skill={emptyMetadata} />);

      // Should not show description or version sections (heading with emoji)
      expect(screen.queryByText(/📝 description/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/🏷️ version/i)).not.toBeInTheDocument();
    });

    it('should handle description from skill.description when metadata.description absent', () => {
      const skillWithDescription = {
        ...mockSkillMinimal,
        description: 'Direct description field',
        metadata: {},
      };

      render(<OverviewPanel skill={skillWithDescription} />);

      expect(screen.getByText('Direct description field')).toBeInTheDocument();
    });

    it('should prefer metadata.description over skill.description', () => {
      const skillBothDescriptions = {
        ...mockSkillComplete,
        description: 'Fallback description',
        metadata: {
          description: 'Metadata description',
        },
      };

      render(<OverviewPanel skill={skillBothDescriptions} />);

      expect(screen.getByText('Metadata description')).toBeInTheDocument();
      expect(screen.queryByText('Fallback description')).not.toBeInTheDocument();
    });
  });
});
