/**
 * Unit tests for diagram generator utility
 *
 * Tests Mermaid diagram generation for skill visualization.
 * Ensures proper sanitization and diagram structure.
 */

import { describe, it, expect } from 'vitest';
import { generateSkillDiagram } from '@/utils/diagramGenerator';
import type { Skill } from '@/types';

describe('diagramGenerator', () => {
  describe('generateSkillDiagram', () => {
    describe('Basic diagram structure', () => {
      it('should generate valid Mermaid diagram with graph TD declaration', () => {
        const skill: Skill = {
          name: 'test-skill',
          description: 'A test skill',
          location: 'claude',
          path: '/test/path',
          content: 'test content',
          content_clean: 'test content',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('graph TD');
      });

      it('should include skill node with name', () => {
        const skill: Skill = {
          name: 'pdf-generator',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SKILL["📦 pdf-generator"]');
      });

      it('should apply proper styling to skill node', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain(
          'style SKILL fill:#4F46E5,stroke:#312E81,stroke-width:3px,color:#fff'
        );
      });
    });

    describe('References section', () => {
      it('should include references section when references exist', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref1',
              path: '/path/to/ref1.md',
              content: 'content',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REFS["📚 References (1)"]');
        expect(diagram).toContain('SKILL --> REFS');
      });

      it('should show correct reference count', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref1',
              path: '/path/to/ref1.md',
              content: 'content',
              type: 'markdown',
            },
            {
              name: 'ref2',
              path: '/path/to/ref2.md',
              content: 'content',
              type: 'markdown',
            },
            {
              name: 'ref3',
              path: '/path/to/ref3.md',
              content: 'content',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REFS["📚 References (3)"]');
      });

      it('should create individual reference nodes', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'setup',
              path: '/path/to/setup.md',
              content: 'content',
              type: 'markdown',
            },
            {
              name: 'config',
              path: '/path/to/config.json',
              content: 'content',
              type: 'json',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REF0["📄 setup.md"]');
        expect(diagram).toContain('REF1["📄 config.json"]');
        expect(diagram).toContain('REFS --> REF0');
        expect(diagram).toContain('REFS --> REF1');
      });

      it('should extract filename from full path', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '/very/long/path/to/documentation.md',
              content: 'content',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REF0["📄 documentation.md"]');
        expect(diagram).not.toContain('/very/long/path');
      });

      it('should apply proper styling to references', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '/path/to/ref.md',
              content: 'content',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain(
          'style REFS fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff'
        );
        expect(diagram).toContain('style REF0 fill:#D1FAE5,stroke:#065F46,color:#065F46');
      });

      it('should create horizontal connections within reference rows', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref1',
              path: '/path/ref1.md',
              content: '',
              type: 'markdown',
            },
            {
              name: 'ref2',
              path: '/path/ref2.md',
              content: '',
              type: 'markdown',
            },
            {
              name: 'ref3',
              path: '/path/ref3.md',
              content: '',
              type: 'markdown',
            },
            {
              name: 'ref4',
              path: '/path/ref4.md',
              content: '',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        // Should have horizontal connections (-.->)
        expect(diagram).toContain('REF0 -.-> REF1');
        expect(diagram).toContain('REF1 -.-> REF2');
        // REF3 starts new row, no connection from REF2
        expect(diagram).not.toContain('REF2 -.-> REF3');
      });

      it('should not include references section when no references', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).not.toContain('REFS');
        expect(diagram).not.toContain('References');
      });
    });

    describe('Scripts section', () => {
      it('should include scripts section when scripts exist', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'setup.sh',
              path: '/path/to/setup.sh',
              content: 'echo "setup"',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SCRIPTS["⚙️ Scripts (1)"]');
        expect(diagram).toContain('SKILL --> SCRIPTS');
      });

      it('should show correct script count', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'build.sh',
              path: '/path/build.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'deploy.sh',
              path: '/path/deploy.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'test.sh',
              path: '/path/test.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'clean.sh',
              path: '/path/clean.sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SCRIPTS["⚙️ Scripts (4)"]');
      });

      it('should create individual script nodes', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'build.sh',
              path: '/path/build.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'deploy.py',
              path: '/path/deploy.py',
              content: '',
              language: 'python',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SCRIPT0["🔧 build.sh"]');
        expect(diagram).toContain('SCRIPT1["🔧 deploy.py"]');
        expect(diagram).toContain('SCRIPTS --> SCRIPT0');
        expect(diagram).toContain('SCRIPTS --> SCRIPT1');
      });

      it('should apply proper styling to scripts', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'test.sh',
              path: '/path/test.sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain(
          'style SCRIPTS fill:#F59E0B,stroke:#92400E,stroke-width:2px,color:#fff'
        );
        expect(diagram).toContain('style SCRIPT0 fill:#FEF3C7,stroke:#92400E,color:#92400E');
      });

      it('should create horizontal connections within script rows', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'script1.sh',
              path: '/path/script1.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'script2.sh',
              path: '/path/script2.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'script3.sh',
              path: '/path/script3.sh',
              content: '',
              language: 'bash',
            },
            {
              name: 'script4.sh',
              path: '/path/script4.sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SCRIPT0 -.-> SCRIPT1');
        expect(diagram).toContain('SCRIPT1 -.-> SCRIPT2');
        // SCRIPT3 starts new row
        expect(diagram).not.toContain('SCRIPT2 -.-> SCRIPT3');
      });

      it('should not include scripts section when no scripts', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).not.toContain('SCRIPTS');
      });
    });

    describe('Text sanitization', () => {
      it('should escape double quotes in skill name', () => {
        const skill: Skill = {
          name: 'test "quoted" skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('test \\"quoted\\" skill');
        expect(diagram).not.toContain('test "quoted" skill');
      });

      it('should replace square brackets with parentheses', () => {
        const skill: Skill = {
          name: 'test[bracket]',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('test(bracket)');
        expect(diagram).not.toContain('[bracket]');
      });

      it('should remove hash symbols', () => {
        const skill: Skill = {
          name: 'test#hash',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('testhash');
        expect(diagram).not.toContain('test#hash');
      });

      it('should replace newlines with spaces', () => {
        const skill: Skill = {
          name: 'test\nmultiline\nname',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('test multiline name');
      });

      it('should trim whitespace', () => {
        const skill: Skill = {
          name: '  test  ',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SKILL["📦 test"]');
      });

      it('should sanitize reference filenames', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '/path/to/[config].md',
              content: '',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('(config).md');
      });

      it('should sanitize script names', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [
            {
              name: 'deploy[prod].sh',
              path: '/path/deploy[prod].sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('deploy(prod).sh');
      });

      it('should handle multiple special characters together', () => {
        const skill: Skill = {
          name: 'test"[#]\n"skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        // After sanitization: quotes escaped, brackets->parens, # removed, newline->space
        expect(diagram).toContain('test\\"() \\"skill');
      });
    });

    describe('Combined references and scripts', () => {
      it('should include both references and scripts sections', () => {
        const skill: Skill = {
          name: 'complex-skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '/path/ref.md',
              content: '',
              type: 'markdown',
            },
          ],
          scripts: [
            {
              name: 'script.sh',
              path: '/path/script.sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REFS["📚 References (1)"]');
        expect(diagram).toContain('SCRIPTS["⚙️ Scripts (1)"]');
        expect(diagram).toContain('SKILL --> REFS');
        expect(diagram).toContain('SKILL --> SCRIPTS');
      });

      it('should handle many references and scripts', () => {
        const skill: Skill = {
          name: 'large-skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: Array.from({ length: 10 }, (_, i) => ({
            name: `ref${i}`,
            path: `/path/ref${i}.md`,
            content: '',
            type: 'markdown' as const,
          })),
          scripts: Array.from({ length: 10 }, (_, i) => ({
            name: `script${i}.sh`,
            path: `/path/script${i}.sh`,
            content: '',
            language: 'bash' as const,
          })),
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REFS["📚 References (10)"]');
        expect(diagram).toContain('SCRIPTS["⚙️ Scripts (10)"]');

        // Verify all nodes are created
        for (let i = 0; i < 10; i++) {
          expect(diagram).toContain(`REF${i}`);
          expect(diagram).toContain(`SCRIPT${i}`);
        }
      });
    });

    describe('Edge cases', () => {
      it('should handle skill with empty name', () => {
        const skill: Skill = {
          name: '',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('SKILL["📦 "]');
        expect(diagram).toContain('graph TD');
      });

      it('should handle reference with empty path', () => {
        const skill: Skill = {
          name: 'test',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '',
              content: '',
              type: 'markdown',
            },
          ],
          scripts: [],
        };

        const diagram = generateSkillDiagram(skill);

        expect(diagram).toContain('REF0');
      });

      it('should generate valid Mermaid syntax', () => {
        const skill: Skill = {
          name: 'test-skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [
            {
              name: 'ref',
              path: '/path/ref.md',
              content: '',
              type: 'markdown',
            },
          ],
          scripts: [
            {
              name: 'script.sh',
              path: '/path/script.sh',
              content: '',
              language: 'bash',
            },
          ],
        };

        const diagram = generateSkillDiagram(skill);

        // Verify no unclosed brackets or quotes
        const openBrackets = (diagram.match(/\[/g) || []).length;
        const closeBrackets = (diagram.match(/]/g) || []).length;
        expect(openBrackets).toBe(closeBrackets);

        // Verify it starts with graph declaration
        expect(diagram.startsWith('graph TD')).toBe(true);

        // Verify no empty lines at start
        expect(diagram.split('\n')[0]).toBe('graph TD');
      });
    });
  });
});
