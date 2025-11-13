/**
 * Unit tests for ReferencesTab component
 * Tests reference list rendering, file loading, and accessibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReferencesTab } from '@/components/ReferencesTab';
import { mockSkillComplete, mockSkillMinimal } from '../../fixtures/mockSkills';
import { invoke } from '@tauri-apps/api/core';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock react-markdown to avoid complexity in unit tests
vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div data-testid="markdown-content">{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

vi.mock('rehype-highlight', () => ({
  default: () => {},
}));

describe('ReferencesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no references', () => {
      render(<ReferencesTab skill={mockSkillMinimal} />);

      expect(screen.getByText(/no references found/i)).toBeInTheDocument();
    });

    it('should render emoji in empty state', () => {
      render(<ReferencesTab skill={mockSkillMinimal} />);

      expect(screen.getByText('📚')).toBeInTheDocument();
    });
  });

  describe('References List', () => {
    it('should render reference count in header', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      expect(
        screen.getByText(`References (${mockSkillComplete.references.length})`)
      ).toBeInTheDocument();
    });

    it('should render all references in list', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      mockSkillComplete.references.forEach((ref) => {
        const fileName = ref.path.split('/').pop();
        expect(screen.getByText(fileName!)).toBeInTheDocument();
      });
    });

    it('should show reference path', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      mockSkillComplete.references.forEach((ref) => {
        expect(screen.getByText(ref.path)).toBeInTheDocument();
      });
    });

    it('should show reference icon based on type', () => {
      const skillWithDifferentTypes = {
        ...mockSkillComplete,
        references: [
          { ...mockSkillComplete.references[0], ref_type: 'glob' },
          { ...mockSkillComplete.references[1], ref_type: 'file' },
        ],
      };

      render(<ReferencesTab skill={skillWithDifferentTypes} />);

      // Icons should be present (🌐 for glob, 📄 for file)
      const globIcon = screen.getAllByText('🌐');
      const fileIcon = screen.getAllByText('📄');

      expect(globIcon.length).toBeGreaterThan(0);
      expect(fileIcon.length).toBeGreaterThan(0);
    });

    it('should show "required" badge for required references', () => {
      const skillWithRequiredRef = {
        ...mockSkillComplete,
        references: [
          { ...mockSkillComplete.references[0], required: true },
          { ...mockSkillComplete.references[1], required: false },
        ],
      };

      render(<ReferencesTab skill={skillWithRequiredRef} />);

      expect(screen.getByText('required')).toBeInTheDocument();
    });
  });

  describe('Reference Selection', () => {
    it('should show prompt to select reference initially', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      expect(screen.getByText(/select a reference to view its content/i)).toBeInTheDocument();
      expect(screen.getByText('👈')).toBeInTheDocument();
    });

    it('should load reference content when clicked', async () => {
      const mockContent = '# Test Reference\n\nTest content';
      (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(mockContent);

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith('read_file_content', { path: firstRef.path });
        // Markdown content should be present (whitespace may be normalized)
        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent).toHaveTextContent('# Test Reference');
        expect(markdownContent).toHaveTextContent('Test content');
      });
    });

    it('should show loading state while loading reference', async () => {
      (invoke as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('content'), 100))
      );

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      // Should show loading state
      expect(screen.getByText(/loading reference/i)).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('should highlight selected reference', async () => {
      (invoke as ReturnType<typeof vi.fn>).mockResolvedValue('content');

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      await waitFor(() => {
        expect(refButton).toHaveClass('bg-blue-100', 'border-blue-300');
        expect(refButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should show error message if loading fails', async () => {
      const errorMessage = 'File not found';
      (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      await waitFor(() => {
        expect(screen.getByText(/error loading reference/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reference Display', () => {
    it('should display reference filename as header', async () => {
      const mockContent = '# Test';
      (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(mockContent);

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const fileName = firstRef.path.split('/').pop()!;
      const refButton = screen.getByRole('button', { name: new RegExp(fileName, 'i') });

      fireEvent.click(refButton);

      await waitFor(() => {
        // Filename should appear as heading
        expect(screen.getByText(fileName)).toBeInTheDocument();
      });
    });

    it('should display full path below filename', async () => {
      const mockContent = '# Test';
      (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(mockContent);

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      await waitFor(() => {
        expect(screen.getAllByText(firstRef.path).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skill Changes', () => {
    it('should reset selection when skill changes', () => {
      const { rerender } = render(<ReferencesTab skill={mockSkillComplete} />);

      // Select a reference
      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });
      fireEvent.click(refButton);

      // Change skill
      const differentSkill = { ...mockSkillComplete, path: '/different/path' };
      rerender(<ReferencesTab skill={differentSkill} />);

      // Should show initial state again
      expect(screen.getByText(/select a reference to view its content/i)).toBeInTheDocument();
    });

    it('should not crash when switching to skill with no references', () => {
      const { rerender } = render(<ReferencesTab skill={mockSkillComplete} />);

      // Switch to skill without references
      rerender(<ReferencesTab skill={mockSkillMinimal} />);

      expect(screen.getByText(/no references found/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for references', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockSkillComplete.references.length);
    });

    it('should have aria-label on reference buttons', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      mockSkillComplete.references.forEach((ref) => {
        const fileName = ref.path.split('/').pop();
        const button = screen.getByRole('button', { name: new RegExp(fileName!, 'i') });
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-pressed on reference buttons', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('should use aria-hidden for decorative emojis', () => {
      render(<ReferencesTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const emoji = button.querySelector('[aria-hidden="true"]');
        expect(emoji).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle references with empty path', () => {
      const skillEmptyPath = {
        ...mockSkillComplete,
        references: [{ ...mockSkillComplete.references[0], path: '' }],
      };

      render(<ReferencesTab skill={skillEmptyPath} />);

      // Should not crash
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle references with special characters in filename', () => {
      const skillSpecialChars = {
        ...mockSkillComplete,
        references: [
          {
            ...mockSkillComplete.references[0],
            path: '/path/to/file with spaces & "quotes".md',
          },
        ],
      };

      render(<ReferencesTab skill={skillSpecialChars} />);

      expect(screen.getByText('file with spaces & "quotes".md')).toBeInTheDocument();
    });

    it('should handle invalid selectedRef index gracefully', async () => {
      (invoke as ReturnType<typeof vi.fn>).mockResolvedValue('content');

      render(<ReferencesTab skill={mockSkillComplete} />);

      const firstRef = mockSkillComplete.references[0];
      const refButton = screen.getByRole('button', {
        name: new RegExp(firstRef.path.split('/').pop()!, 'i'),
      });

      fireEvent.click(refButton);

      await waitFor(() => {
        // Should load content without crashing
        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      });
    });
  });
});
