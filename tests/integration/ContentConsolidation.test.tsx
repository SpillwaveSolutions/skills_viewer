/**
 * Integration tests for content consolidation
 *
 * Automated verification that:
 * - Description appears exactly ONCE (in Overview tab only, NOT in header)
 * - Stats appear exactly ONCE (in Overview tab only, NOT in header)
 * - Version appears exactly ONCE (in Overview tab only, NOT in header)
 * - No duplicate content anywhere in the UI
 *
 * This test ensures US2 acceptance criteria: zero duplication
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillHeader } from '../../src/components/SkillHeader';
import { OverviewTab } from '../../src/components/OverviewTab';
import { Skill } from '../../src/types';

// Test skill with comprehensive metadata
const testSkill: Skill = {
  id: 'consolidation-test',
  name: 'Consolidation Test Skill',
  location: 'claude',
  description: 'Unique test description for duplication check',
  content: 'Line 1\nLine 2\nLine 3',
  content_clean: 'Line 1\nLine 2\nLine 3',
  references: [
    { path: 'ref1.md', type: 'file' },
    { path: 'ref2.md', type: 'file' },
  ],
  scripts: [{ name: 'script1', path: '/path/script1.sh' }],
  metadata: {
    description: 'Unique metadata description for duplication check',
    version: '3.2.1',
    author: 'Test Author',
  },
  path: '/test/path',
  icon: '🧪',
};

describe('Content Consolidation', () => {
  describe('Description Consolidation', () => {
    it('should NOT render description in SkillHeader', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Header should NOT contain description
      expect(container).not.toHaveTextContent('Unique metadata description');
      expect(container).not.toHaveTextContent('Unique test description');
    });

    it('should render description exactly ONCE in OverviewTab', () => {
      const { container } = render(<OverviewTab skill={testSkill} />);

      // Description should appear in Overview tab
      const descriptionText = 'Unique metadata description for duplication check';
      const occurrences = container.innerHTML.match(new RegExp(descriptionText, 'g'));

      expect(occurrences).toHaveLength(1);
    });

    it('should render description in OverviewTab and NOT in SkillHeader (integrated check)', () => {
      // Render both components
      const { container: headerContainer } = render(<SkillHeader skill={testSkill} />);
      const { container: overviewContainer } = render(<OverviewTab skill={testSkill} />);

      // Header should NOT have description
      expect(headerContainer.textContent).not.toContain('Unique metadata description');

      // Overview should have description
      expect(overviewContainer.textContent).toContain('Unique metadata description');
    });
  });

  describe('Stats Grid Consolidation', () => {
    it('should NOT render stats grid in SkillHeader', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Header should NOT contain references count
      expect(container.textContent).not.toContain('📚 References');
      expect(container.textContent).not.toContain('🔧 Scripts');
      expect(container.textContent).not.toContain('📏 Lines');

      // Should not have grid layout
      const grids = container.querySelectorAll('.grid-cols-4');
      expect(grids).toHaveLength(0);
    });

    it('should render stats grid exactly ONCE in OverviewTab', () => {
      const { container } = render(<OverviewTab skill={testSkill} />);

      // Should have exactly one 4-column grid
      const grids = container.querySelectorAll('.grid-cols-4');
      expect(grids).toHaveLength(1);

      // Stats should appear once
      const referencesElements = screen.getAllByText(/References/);
      expect(referencesElements).toHaveLength(1);

      const scriptsElements = screen.getAllByText(/Scripts/);
      expect(scriptsElements).toHaveLength(1);
    });
  });

  describe('Version Consolidation', () => {
    it('should NOT render version in SkillHeader', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Header should NOT contain version
      expect(container.textContent).not.toContain('3.2.1');
      expect(container.textContent).not.toContain('Version');
    });

    it('should render version exactly ONCE in OverviewTab', () => {
      const { container } = render(<OverviewTab skill={testSkill} />);

      // Version should appear exactly once
      const versionText = '3.2.1';
      const occurrences = (container.textContent?.match(new RegExp(versionText, 'g')) || []).length;

      expect(occurrences).toBe(1);
    });
  });

  describe('Header Minimalism', () => {
    it('should render ONLY title and badge in SkillHeader', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Should have title
      expect(container.textContent).toContain('Consolidation Test Skill');

      // Should have location badge
      expect(container.textContent).toContain('claude');

      // Should NOT have any other metadata
      expect(container.textContent).not.toContain('Description');
      expect(container.textContent).not.toContain('Version');
      expect(container.textContent).not.toContain('References');
      expect(container.textContent).not.toContain('Scripts');
      expect(container.textContent).not.toContain('Triggers');
      expect(container.textContent).not.toContain('author');
    });

    it('should have minimal DOM structure in SkillHeader', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Should only have heading and badge span
      const headings = container.querySelectorAll('h1');
      expect(headings).toHaveLength(1);

      const spans = container.querySelectorAll('span');
      expect(spans).toHaveLength(1); // Only location badge
    });
  });

  describe('Overview Tab Completeness', () => {
    it('should render ALL metadata in OverviewTab', () => {
      render(<OverviewTab skill={testSkill} />);

      // Should have description
      expect(screen.getByText(/Unique metadata description/)).toBeInTheDocument();

      // Should have version
      expect(screen.getByText('3.2.1')).toBeInTheDocument();

      // Should have stats
      expect(screen.getByText(/References/)).toBeInTheDocument();
      expect(screen.getByText(/Scripts/)).toBeInTheDocument();
      expect(screen.getByText(/Lines/)).toBeInTheDocument();

      // Should have additional metadata
      expect(screen.getByText(/author:/i)).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });
  });

  describe('Zero Duplication Guarantee', () => {
    it('should ensure each piece of content appears exactly once across both components', () => {
      // Render both components in a container
      const { container } = render(
        <div>
          <SkillHeader skill={testSkill} />
          <OverviewTab skill={testSkill} />
        </div>
      );

      // Check description appears exactly once
      const descOccurrences = (
        container.innerHTML.match(/Unique metadata description for duplication check/g) || []
      ).length;
      expect(descOccurrences).toBe(1);

      // Check version appears exactly once
      const versionOccurrences = (container.textContent?.match(/3\.2\.1/g) || []).length;
      expect(versionOccurrences).toBe(1);

      // Check stats section labels appear exactly once
      const referencesLabel = screen.getAllByText(/📚 References/);
      expect(referencesLabel).toHaveLength(1);

      const scriptsLabel = screen.getAllByText(/🔧 Scripts/);
      expect(scriptsLabel).toHaveLength(1);

      const linesLabel = screen.getAllByText(/📏 Lines/);
      expect(linesLabel).toHaveLength(1);
    });

    it('should ensure skill name appears exactly once (in header only)', () => {
      const { container } = render(
        <div>
          <SkillHeader skill={testSkill} />
          <OverviewTab skill={testSkill} />
        </div>
      );

      // Skill name should appear only in header h1
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent('Consolidation Test Skill');
    });
  });

  describe('Content Distribution Verification', () => {
    it('should verify SkillHeader contains only title and badge (standard mode)', () => {
      const { container } = render(<SkillHeader skill={testSkill} />);

      // Should have title (h1)
      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();

      // Should have location badge
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain('claude');

      // Should NOT have description sections
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
      // Should NOT have stats grid (only inline stats in compact mode)
      expect(container.querySelector('.grid-cols-4')).not.toBeInTheDocument();
    });

    it('should verify OverviewTab contains all content sections', () => {
      const { container } = render(<OverviewTab skill={testSkill} />);

      // Should have multiple content sections
      const sections = container.querySelectorAll('div > div');
      expect(sections.length).toBeGreaterThan(3); // Description, Version, Stats, Metadata sections
    });
  });
});
