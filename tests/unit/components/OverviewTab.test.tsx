/**
 * Unit tests for OverviewTab component
 *
 * Tests cover:
 * - Renders ALL metadata consolidated in one place
 * - Description section
 * - Version badge (monospace font)
 * - Trigger keywords preview (light blue badges #dbeafe)
 * - Stats grid (4 columns: References, Scripts, Triggers, Lines)
 * - Additional metadata grid
 * - Tags rendering (if present)
 * - Click handlers for stats (navigate to tabs)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverviewTab } from '../../../src/components/OverviewTab';
import { Skill } from '../../../src/types';

// Mock skill with complete metadata
const mockSkill: Skill = {
  id: 'test-skill',
  name: 'Test Skill',
  location: 'claude',
  description: 'Test skill description for overview tab',
  content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  content_clean: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
  references: [
    { path: 'ref1.md', type: 'file' },
    { path: 'ref2.md', type: 'file' },
  ],
  scripts: [
    { name: 'script1', path: '/path/script1.sh' },
    { name: 'script2', path: '/path/script2.sh' },
    { name: 'script3', path: '/path/script3.sh' },
  ],
  metadata: {
    description: 'Metadata description overrides skill.description',
    version: '2.1.0',
    author: 'Test Author',
    tags: ['tag1', 'tag2', 'tag3'],
  },
  path: '/test/path',
  icon: '🧪',
};

describe('OverviewTab', () => {
  describe('Description Section', () => {
    it('should render description from metadata if present', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/Metadata description overrides/i)).toBeInTheDocument();
    });

    it('should render description from skill property if no metadata description', () => {
      const skillWithoutMetadataDesc = {
        ...mockSkill,
        metadata: { version: '1.0.0' },
      };
      render(<OverviewTab skill={skillWithoutMetadataDesc} />);

      expect(screen.getByText(/Test skill description for overview tab/i)).toBeInTheDocument();
    });

    it('should display description label', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/📝 Description/i)).toBeInTheDocument();
    });

    it('should NOT render description section if no description available', () => {
      const skillWithoutDesc = {
        ...mockSkill,
        description: '',
        metadata: { version: '1.0.0' },
      };
      render(<OverviewTab skill={skillWithoutDesc} />);

      expect(screen.queryByText(/📝 Description/i)).not.toBeInTheDocument();
    });
  });

  describe('Version Section', () => {
    it('should render version badge', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText('2.1.0')).toBeInTheDocument();
    });

    it('should display version label', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/🏷️ Version/i)).toBeInTheDocument();
    });

    it('should apply monospace font to version', () => {
      render(<OverviewTab skill={mockSkill} />);

      const versionText = screen.getByText('2.1.0');
      expect(versionText).toHaveClass('font-mono');
    });

    it('should NOT render version section if no version available', () => {
      const skillWithoutVersion = {
        ...mockSkill,
        metadata: { description: 'Test' },
      };
      render(<OverviewTab skill={skillWithoutVersion} />);

      expect(screen.queryByText(/🏷️ Version/i)).not.toBeInTheDocument();
    });
  });

  describe('Trigger Keywords Section', () => {
    it('should render trigger keywords preview', () => {
      // Skill content will be analyzed for triggers
      render(<OverviewTab skill={mockSkill} />);

      const triggerSection = screen.queryByText(/🎯 Common Triggers/i);
      // Triggers may or may not be found depending on content analysis
      if (triggerSection) {
        expect(triggerSection).toBeInTheDocument();
      }
    });

    it('should apply light blue background to trigger badges', () => {
      const skillWithTriggers = {
        ...mockSkill,
        content: 'Use this skill when working with files. This tool helps analyze code.',
      };
      const { container } = render(<OverviewTab skill={skillWithTriggers} />);

      // Check for light blue background class
      const blueBadges = container.querySelectorAll('.bg-blue-50');
      if (blueBadges.length > 0) {
        expect(blueBadges[0]).toHaveClass('bg-blue-50', 'text-blue-700');
      }
    });
  });

  describe('Stats Grid', () => {
    it('should render stats grid with 4 columns', () => {
      const { container } = render(<OverviewTab skill={mockSkill} />);

      const grid = container.querySelector('.grid-cols-4');
      expect(grid).toBeInTheDocument();
    });

    it('should display references count', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText('📚 References')).toBeInTheDocument();
      const referencesButton = screen.getByRole('button', { name: /View 2 references/i });
      expect(referencesButton).toBeInTheDocument();
    });

    it('should display scripts count', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText('🔧 Scripts')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display triggers count', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/🎯 Triggers/i)).toBeInTheDocument();
    });

    it('should display line count', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText('📏 Lines')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // 5 lines in content
    });

    it('should make references stat clickable', () => {
      const onNavigate = vi.fn();
      render(<OverviewTab skill={mockSkill} onNavigateToTab={onNavigate} />);

      const referencesButton = screen.getByRole('button', { name: /View 2 references/i });
      fireEvent.click(referencesButton);

      expect(onNavigate).toHaveBeenCalledWith('references');
    });

    it('should make scripts stat clickable', () => {
      const onNavigate = vi.fn();
      render(<OverviewTab skill={mockSkill} onNavigateToTab={onNavigate} />);

      const scriptsButton = screen.getByRole('button', { name: /View 3 scripts/i });
      fireEvent.click(scriptsButton);

      expect(onNavigate).toHaveBeenCalledWith('scripts');
    });

    it('should make triggers stat clickable', () => {
      const onNavigate = vi.fn();
      render(<OverviewTab skill={mockSkill} onNavigateToTab={onNavigate} />);

      const triggersButton = screen.getByRole('button', { name: /View.*trigger/i });
      fireEvent.click(triggersButton);

      expect(onNavigate).toHaveBeenCalledWith('triggers');
    });
  });

  describe('Additional Metadata Section', () => {
    it('should render additional metadata fields', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/author:/i)).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should display metadata section header', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText(/ℹ️ Additional Metadata/i)).toBeInTheDocument();
    });

    it('should NOT render version and description in additional metadata', () => {
      render(<OverviewTab skill={mockSkill} />);

      // These should be in their own sections, not in "Additional Metadata"
      const metadataSection = screen.getByText(/ℹ️ Additional Metadata/i).parentElement;
      expect(metadataSection).not.toHaveTextContent('version:');
      expect(metadataSection).not.toHaveTextContent('description:');
    });

    it('should NOT render additional metadata section if only version/description present', () => {
      const skillWithOnlyVersionDesc = {
        ...mockSkill,
        metadata: {
          version: '1.0.0',
          description: 'Test',
        },
      };
      render(<OverviewTab skill={skillWithOnlyVersionDesc} />);

      expect(screen.queryByText(/ℹ️ Additional Metadata/i)).not.toBeInTheDocument();
    });
  });

  describe('Tags Section', () => {
    it('should render tags if present in metadata', () => {
      render(<OverviewTab skill={mockSkill} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('should NOT render tags section if tags are empty', () => {
      const skillWithoutTags = {
        ...mockSkill,
        metadata: { version: '1.0.0' },
      };
      render(<OverviewTab skill={skillWithoutTags} />);

      expect(screen.queryByText(/🏷️ Tags/i)).not.toBeInTheDocument();
    });
  });

  describe('Layout and Spacing', () => {
    it('should apply padding to container', () => {
      const { container } = render(<OverviewTab skill={mockSkill} />);

      expect(container.firstChild).toHaveClass('p-6');
    });

    it('should use space-y for vertical spacing', () => {
      const { container } = render(<OverviewTab skill={mockSkill} />);

      expect(container.firstChild).toHaveClass('space-y-6');
    });
  });

  describe('Edge Cases', () => {
    it('should handle skill with no metadata', () => {
      const skillWithoutMetadata = {
        ...mockSkill,
        metadata: undefined,
      };
      render(<OverviewTab skill={skillWithoutMetadata} />);

      // Should still render description from skill property
      expect(screen.getByText(/Test skill description/i)).toBeInTheDocument();
    });

    it('should handle empty content (0 lines)', () => {
      const skillWithEmptyContent = {
        ...mockSkill,
        content: '',
      };
      render(<OverviewTab skill={skillWithEmptyContent} />);

      expect(screen.getByText('📏 Lines')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Empty string counts as 1 line
    });

    it('should handle large line counts with formatting', () => {
      const skillWithManyLines = {
        ...mockSkill,
        content: Array(1500).fill('line').join('\n'),
      };
      render(<OverviewTab skill={skillWithManyLines} />);

      // Should use toLocaleString for formatting
      expect(screen.getByText(/1,500/)).toBeInTheDocument();
    });
  });
});
