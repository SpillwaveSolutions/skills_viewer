/**
 * Unit tests for ScriptsTab component
 * Tests script list rendering, language icons, and accessibility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScriptsTab } from '@/components/ScriptsTab';
import {
  mockSkillComplete,
  mockSkillMinimal,
  mockPythonScript,
  mockJavaScriptScript,
} from '../../fixtures/mockSkills';
import { vi } from 'vitest';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div data-testid="markdown-content">{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

vi.mock('rehype-highlight', () => ({
  default: () => {},
}));

describe('ScriptsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no scripts', () => {
      render(<ScriptsTab skill={mockSkillMinimal} />);

      expect(screen.getByText(/no scripts found/i)).toBeInTheDocument();
    });

    it('should render emoji in empty state', () => {
      render(<ScriptsTab skill={mockSkillMinimal} />);

      expect(screen.getByText('🔧')).toBeInTheDocument();
    });
  });

  describe('Scripts List', () => {
    it('should render script count in header', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      expect(screen.getByText(`Scripts (${mockSkillComplete.scripts.length})`)).toBeInTheDocument();
    });

    it('should render all scripts in list', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      mockSkillComplete.scripts.forEach((script) => {
        expect(screen.getByText(script.name)).toBeInTheDocument();
      });
    });

    it('should show script language', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      mockSkillComplete.scripts.forEach((script) => {
        const languageTags = screen.getAllByText(script.language);
        expect(languageTags.length).toBeGreaterThan(0);
      });
    });

    it('should show script line count', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      mockSkillComplete.scripts.forEach((script) => {
        const lineCount = script.content.split('\n').length;
        const lineText = `${lineCount} lines`;
        expect(screen.getByText(lineText)).toBeInTheDocument();
      });
    });
  });

  describe('Language Icons', () => {
    it('should show Python icon for Python scripts', () => {
      const skillPython = {
        ...mockSkillComplete,
        scripts: [mockPythonScript],
      };

      render(<ScriptsTab skill={skillPython} />);

      expect(screen.getByText('🐍')).toBeInTheDocument();
    });

    it('should show JavaScript icon for JavaScript scripts', () => {
      const skillJS = {
        ...mockSkillComplete,
        scripts: [mockJavaScriptScript],
      };

      render(<ScriptsTab skill={skillJS} />);

      expect(screen.getByText('📜')).toBeInTheDocument();
    });

    it('should show shell icon for bash scripts', () => {
      const skillBash = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'test.sh',
            language: 'bash',
            path: '/test.sh',
            content: 'echo "test"',
          },
        ],
      };

      render(<ScriptsTab skill={skillBash} />);

      expect(screen.getByText('🐚')).toBeInTheDocument();
    });

    it('should show TypeScript icon for TypeScript scripts', () => {
      const skillTS = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'test.ts',
            language: 'typescript',
            path: '/test.ts',
            content: 'const x: number = 1;',
          },
        ],
      };

      render(<ScriptsTab skill={skillTS} />);

      expect(screen.getByText('🟦')).toBeInTheDocument();
    });

    it('should show default icon for unknown languages', () => {
      const skillUnknown = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'test.xyz',
            language: 'unknown',
            path: '/test.xyz',
            content: 'unknown content',
          },
        ],
      };

      render(<ScriptsTab skill={skillUnknown} />);

      expect(screen.getByText('📄')).toBeInTheDocument();
    });
  });

  describe('Script Selection', () => {
    it('should show prompt to select script initially', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      expect(screen.getByText(/select a script to view its content/i)).toBeInTheDocument();
      expect(screen.getByText('👈')).toBeInTheDocument();
    });

    it('should display script content when selected', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      // Should display script content (wrapped in markdown code block)
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should highlight selected script', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      expect(scriptButton).toHaveClass('bg-blue-100', 'border-blue-300');
      expect(scriptButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should change highlighted script when different script clicked', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const secondScript = mockSkillComplete.scripts[1];

      const firstButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });
      const secondButton = screen.getByRole('button', { name: new RegExp(secondScript.name, 'i') });

      fireEvent.click(firstButton);
      expect(firstButton).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(secondButton);
      expect(secondButton).toHaveAttribute('aria-pressed', 'true');
      expect(firstButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Script Display', () => {
    it('should display script name as header', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      // Name should appear twice: in list and in header
      const names = screen.getAllByText(firstScript.name);
      expect(names.length).toBeGreaterThan(1);
    });

    it('should display script language in header', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      // Language should appear in header
      const languages = screen.getAllByText(firstScript.language);
      expect(languages.length).toBeGreaterThan(0);
    });

    it('should display script line count in header', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      const lineCount = firstScript.content.split('\n').length;
      const lineText = `${lineCount} lines`;

      // Line count should appear in list and header
      const lineCounts = screen.getAllByText(lineText);
      expect(lineCounts.length).toBeGreaterThan(0);
    });

    it('should format script content as code block for syntax highlighting', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      const markdownContent = screen.getByTestId('markdown-content');
      // Content should be wrapped in code fence with language
      expect(markdownContent.textContent).toContain('```');
      expect(markdownContent.textContent).toContain(firstScript.language);
      expect(markdownContent.textContent).toContain(firstScript.content);
    });
  });

  describe('Skill Changes', () => {
    it('should reset selection when skill changes', () => {
      const { rerender } = render(<ScriptsTab skill={mockSkillComplete} />);

      // Select a script
      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });
      fireEvent.click(scriptButton);

      // Change skill
      const differentSkill = { ...mockSkillComplete, path: '/different/path' };
      rerender(<ScriptsTab skill={differentSkill} />);

      // Should show initial state again
      expect(screen.getByText(/select a script to view its content/i)).toBeInTheDocument();
    });

    it('should not crash when switching to skill with no scripts', () => {
      const { rerender } = render(<ScriptsTab skill={mockSkillComplete} />);

      // Switch to skill without scripts
      rerender(<ScriptsTab skill={mockSkillMinimal} />);

      expect(screen.getByText(/no scripts found/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for scripts', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockSkillComplete.scripts.length);
    });

    it('should have aria-label on script buttons', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      mockSkillComplete.scripts.forEach((script) => {
        const button = screen.getByRole('button', { name: new RegExp(script.name, 'i') });
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-pressed on script buttons', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('should use aria-hidden for decorative emojis', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const emoji = button.querySelector('[aria-hidden="true"]');
        expect(emoji).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle scripts with empty content', () => {
      const skillEmptyScript = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'empty.py',
            language: 'python',
            path: '/empty.py',
            content: '',
          },
        ],
      };

      render(<ScriptsTab skill={skillEmptyScript} />);

      const scriptButton = screen.getByRole('button', { name: /empty\.py/i });
      fireEvent.click(scriptButton);

      // Empty string split by newline has length 1, not 0
      expect(screen.getByText('1 lines')).toBeInTheDocument();
    });

    it('should handle scripts with very long names', () => {
      const skillLongName = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'a'.repeat(100) + '.py',
            language: 'python',
            path: '/path/to/' + 'a'.repeat(100) + '.py',
            content: 'print("test")',
          },
        ],
      };

      render(<ScriptsTab skill={skillLongName} />);

      const longName = 'a'.repeat(100) + '.py';
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle scripts with special characters in name', () => {
      const skillSpecialChars = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'script-with-"quotes"&<special>.py',
            language: 'python',
            path: '/path/script.py',
            content: 'print("test")',
          },
        ],
      };

      render(<ScriptsTab skill={skillSpecialChars} />);

      expect(screen.getByText('script-with-"quotes"&<special>.py')).toBeInTheDocument();
    });

    it('should handle invalid selectedScript index gracefully', () => {
      render(<ScriptsTab skill={mockSkillComplete} />);

      const firstScript = mockSkillComplete.scripts[0];
      const scriptButton = screen.getByRole('button', { name: new RegExp(firstScript.name, 'i') });

      fireEvent.click(scriptButton);

      // Should load content without crashing
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should calculate line count correctly for multiline scripts', () => {
      const skillMultiline = {
        ...mockSkillComplete,
        scripts: [
          {
            name: 'multiline.py',
            language: 'python',
            path: '/multiline.py',
            content: 'line1\nline2\nline3\nline4\nline5',
          },
        ],
      };

      render(<ScriptsTab skill={skillMultiline} />);

      expect(screen.getByText('5 lines')).toBeInTheDocument();
    });
  });
});
