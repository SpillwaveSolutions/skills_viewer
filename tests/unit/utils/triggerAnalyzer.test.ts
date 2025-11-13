/**
 * Unit tests for trigger analyzer utility
 *
 * Tests trigger keyword extraction and matching logic for skill discovery.
 * Ensures proper categorization and deduplication of trigger patterns.
 */

import { describe, it, expect } from 'vitest';
import { analyzeTriggers, generateExampleQueries } from '@/utils/triggerAnalyzer';
import type { Skill } from '@/types';

describe('triggerAnalyzer', () => {
  describe('analyzeTriggers', () => {
    describe('Action keyword extraction', () => {
      it('should extract action keywords from skill content', () => {
        const skill: Skill = {
          name: 'test-skill',
          description: 'A skill to create and build things',
          location: 'claude',
          path: '/test/path',
          content: 'This skill helps you create and generate content',
          content_clean: 'This skill helps you create and generate content',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        const actionPatterns = patterns.filter((p) => p.category === 'action');
        expect(actionPatterns.length).toBeGreaterThan(0);
        expect(actionPatterns.some((p) => p.keyword === 'create')).toBe(true);
        expect(actionPatterns.some((p) => p.keyword === 'generate')).toBe(true);
      });

      it('should mark action keywords with high confidence', () => {
        const skill: Skill = {
          name: 'builder',
          description: 'Build things',
          location: 'claude',
          path: '/test/path',
          content: 'Build and deploy',
          content_clean: 'Build and deploy',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        const buildAction = patterns.find((p) => p.keyword === 'build' && p.category === 'action');
        expect(buildAction).toBeDefined();
        expect(buildAction?.confidence).toBe('high');
      });

      it('should detect all supported action keywords', () => {
        const actions = [
          'create',
          'generate',
          'build',
          'analyze',
          'convert',
          'transform',
          'export',
          'import',
          'update',
          'fix',
          'debug',
          'test',
          'deploy',
        ];

        const content = actions.join(' ');
        const skill: Skill = {
          name: 'multi-action',
          description: content,
          location: 'claude',
          path: '/test/path',
          content,
          content_clean: content,
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const actionPatterns = patterns.filter((p) => p.category === 'action');

        actions.forEach((action) => {
          expect(actionPatterns.some((p) => p.keyword === action)).toBe(true);
        });
      });

      it('should be case-insensitive for action detection', () => {
        const skill: Skill = {
          name: 'test',
          description: 'CREATE and BUILD',
          location: 'claude',
          path: '/test/path',
          content: 'CREATE BUILD',
          content_clean: 'CREATE BUILD',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        expect(patterns.some((p) => p.keyword === 'create' && p.category === 'action')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'build' && p.category === 'action')).toBe(true);
      });
    });

    describe('Technology keyword extraction from name', () => {
      it('should extract technology keywords from skill name', () => {
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

        const patterns = analyzeTriggers(skill);

        const techPatterns = patterns.filter((p) => p.category === 'technology');
        expect(techPatterns.some((p) => p.keyword === 'pdf')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'generator')).toBe(true);
      });

      it('should handle hyphenated skill names', () => {
        const skill: Skill = {
          name: 'docker-compose-helper',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const techPatterns = patterns.filter((p) => p.category === 'technology');

        expect(techPatterns.some((p) => p.keyword === 'docker')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'compose')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'helper')).toBe(true);
      });

      it('should handle underscore-separated skill names', () => {
        const skill: Skill = {
          name: 'aws_lambda_deployer',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const techPatterns = patterns.filter((p) => p.category === 'technology');

        expect(techPatterns.some((p) => p.keyword === 'aws')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'lambda')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'deployer')).toBe(true);
      });

      it('should handle space-separated skill names', () => {
        const skill: Skill = {
          name: 'React Component Builder',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const techPatterns = patterns.filter((p) => p.category === 'technology');

        expect(techPatterns.some((p) => p.keyword === 'react')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'component')).toBe(true);
        expect(techPatterns.some((p) => p.keyword === 'builder')).toBe(true);
      });

      it('should ignore short words (<=2 chars) from name', () => {
        const skill: Skill = {
          name: 'go-to-pdf',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const techPatterns = patterns.filter((p) => p.category === 'technology');

        expect(techPatterns.some((p) => p.keyword === 'go')).toBe(false);
        expect(techPatterns.some((p) => p.keyword === 'to')).toBe(false);
        expect(techPatterns.some((p) => p.keyword === 'pdf')).toBe(true);
      });

      it('should mark technology keywords with high confidence', () => {
        const skill: Skill = {
          name: 'kubernetes-helper',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const k8sPattern = patterns.find(
          (p) => p.keyword === 'kubernetes' && p.category === 'technology'
        );

        expect(k8sPattern).toBeDefined();
        expect(k8sPattern?.confidence).toBe('high');
      });
    });

    describe('Format keyword extraction', () => {
      it('should detect format keywords in content', () => {
        const skill: Skill = {
          name: 'converter',
          description: 'Convert PDF to Excel',
          location: 'claude',
          path: '/test/path',
          content: 'Handle xlsx and docx files',
          content_clean: 'Handle xlsx and docx files',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const formatPatterns = patterns.filter((p) => p.category === 'format');

        expect(formatPatterns.some((p) => p.keyword === 'pdf')).toBe(true);
        expect(formatPatterns.some((p) => p.keyword === 'excel')).toBe(true);
        expect(formatPatterns.some((p) => p.keyword === 'xlsx')).toBe(true);
        expect(formatPatterns.some((p) => p.keyword === 'docx')).toBe(true);
      });

      it('should detect all supported format keywords', () => {
        const formats = [
          'pdf',
          'excel',
          'xlsx',
          'docx',
          'markdown',
          'json',
          'yaml',
          'csv',
          'xml',
          'html',
        ];

        const content = formats.join(' ');
        const skill: Skill = {
          name: 'format-tool',
          description: content,
          location: 'claude',
          path: '/test/path',
          content,
          content_clean: content,
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const formatPatterns = patterns.filter((p) => p.category === 'format');

        formats.forEach((format) => {
          expect(formatPatterns.some((p) => p.keyword === format)).toBe(true);
        });
      });

      it('should mark format keywords with high confidence', () => {
        const skill: Skill = {
          name: 'test',
          description: 'Work with JSON files',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const jsonPattern = patterns.find((p) => p.keyword === 'json' && p.category === 'format');

        expect(jsonPattern).toBeDefined();
        expect(jsonPattern?.confidence).toBe('high');
      });
    });

    describe('Topic keyword extraction from description', () => {
      it('should extract topic keywords from description', () => {
        const skill: Skill = {
          name: 'test',
          description: 'Create documentation and diagrams for your API',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const topicPatterns = patterns.filter((p) => p.category === 'topic');

        expect(topicPatterns.some((p) => p.keyword === 'documentation')).toBe(true);
        expect(topicPatterns.some((p) => p.keyword === 'diagram')).toBe(true);
        expect(topicPatterns.some((p) => p.keyword === 'api')).toBe(true);
      });

      it('should detect all supported topic keywords', () => {
        const topics = [
          'documentation',
          'diagram',
          'database',
          'api',
          'cloud',
          'deployment',
          'testing',
          'architecture',
        ];

        const description = topics.join(' ');
        const skill: Skill = {
          name: 'test',
          description,
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const topicPatterns = patterns.filter((p) => p.category === 'topic');

        topics.forEach((topic) => {
          expect(topicPatterns.some((p) => p.keyword === topic)).toBe(true);
        });
      });

      it('should mark topic keywords with medium confidence', () => {
        const skill: Skill = {
          name: 'test',
          description: 'Database management tool',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const dbPattern = patterns.find((p) => p.keyword === 'database' && p.category === 'topic');

        expect(dbPattern).toBeDefined();
        expect(dbPattern?.confidence).toBe('medium');
      });

      it('should not extract topics if description is missing', () => {
        const skill: Skill = {
          name: 'test',
          location: 'claude',
          path: '/test/path',
          content: 'documentation database api',
          content_clean: 'documentation database api',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);
        const topicPatterns = patterns.filter((p) => p.category === 'topic');

        // Topics are only extracted from description, not content
        expect(topicPatterns.length).toBe(0);
      });
    });

    describe('Deduplication', () => {
      it('should remove duplicate keywords', () => {
        const skill: Skill = {
          name: 'pdf-converter',
          description: 'Convert PDF files to other formats',
          location: 'claude',
          path: '/test/path',
          content: 'Handle PDF conversion',
          content_clean: 'Handle PDF conversion',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // "pdf" appears in name (technology), description (format), and content (format)
        // Should only appear once
        const pdfPatterns = patterns.filter((p) => p.keyword === 'pdf');
        expect(pdfPatterns.length).toBe(1);
      });

      it('should keep first occurrence when deduplicating', () => {
        const skill: Skill = {
          name: 'create-builder',
          description: 'Create and build things',
          location: 'claude',
          path: '/test/path',
          content: 'create build',
          content_clean: 'create build',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // Both "create" and "build" might be detected as actions and from name
        // Verify no duplicates exist
        const keywords = patterns.map((p) => p.keyword);
        const uniqueKeywords = [...new Set(keywords)];
        expect(keywords.length).toBe(uniqueKeywords.length);
      });
    });

    describe('Edge cases', () => {
      it('should handle skill with empty content', () => {
        const skill: Skill = {
          name: 'empty-skill',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // Should at least extract technology keywords from name
        expect(patterns.length).toBeGreaterThan(0);
        expect(patterns.some((p) => p.keyword === 'empty')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'skill')).toBe(true);
      });

      it('should handle skill with no description', () => {
        const skill: Skill = {
          name: 'test',
          location: 'claude',
          path: '/test/path',
          content: 'create pdf documents',
          content_clean: 'create pdf documents',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // Should still extract actions and formats from content
        expect(patterns.some((p) => p.keyword === 'create')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'pdf')).toBe(true);
      });

      it('should handle skill with single-word name', () => {
        const skill: Skill = {
          name: 'builder',
          description: 'A builder tool',
          location: 'claude',
          path: '/test/path',
          content: 'build things',
          content_clean: 'build things',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        expect(patterns.some((p) => p.keyword === 'builder')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'build')).toBe(true);
      });

      it('should handle skill with no triggers', () => {
        const skill: Skill = {
          name: 'x',
          description: 'y',
          location: 'claude',
          path: '/test/path',
          content: 'z',
          content_clean: 'z',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // Should return empty or minimal patterns (only very short words)
        expect(patterns.length).toBe(0);
      });

      it('should handle special characters in skill name', () => {
        const skill: Skill = {
          name: 'pdf-to-excel!!!',
          description: '',
          location: 'claude',
          path: '/test/path',
          content: '',
          content_clean: '',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        expect(patterns.some((p) => p.keyword === 'pdf')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'excel')).toBe(true);
      });

      it('should handle very long content efficiently', () => {
        const longContent = 'create '.repeat(1000) + 'pdf '.repeat(1000);
        const skill: Skill = {
          name: 'performance-test',
          description: longContent,
          location: 'claude',
          path: '/test/path',
          content: longContent,
          content_clean: longContent,
          references: [],
          scripts: [],
        };

        const startTime = Date.now();
        const patterns = analyzeTriggers(skill);
        const duration = Date.now() - startTime;

        // Should complete in reasonable time (<100ms)
        expect(duration).toBeLessThan(100);

        // Should still deduplicate properly
        const createPatterns = patterns.filter((p) => p.keyword === 'create');
        const pdfPatterns = patterns.filter((p) => p.keyword === 'pdf');
        expect(createPatterns.length).toBe(1);
        expect(pdfPatterns.length).toBe(1);
      });
    });

    describe('Real-world examples', () => {
      it('should analyze pdf skill correctly', () => {
        const skill: Skill = {
          name: 'pdf',
          description:
            'Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs',
          location: 'claude',
          path: '/Users/user/.claude/skills/pdf/skill.md',
          content: 'Extract text, create PDFs, merge documents',
          content_clean: 'Extract text, create PDFs, merge documents',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // "pdf" extracted as technology (from name), not format (deduplication)
        expect(patterns.some((p) => p.keyword === 'pdf')).toBe(true);
        // Should have action keywords
        expect(patterns.some((p) => p.keyword === 'create' && p.category === 'action')).toBe(true);
      });

      it('should analyze duckdb skill correctly', () => {
        const skill: Skill = {
          name: 'duckdb',
          description:
            'Comprehensive DuckDB skill for managing local stateful data with support for persistent databases',
          location: 'claude',
          path: '/Users/user/.claude/skills/duckdb/skill.md',
          content: 'Create and analyze databases with DuckDB',
          content_clean: 'Create and analyze databases with DuckDB',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        expect(patterns.some((p) => p.keyword === 'duckdb')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'database')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'create')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'analyze')).toBe(true);
      });

      it('should analyze github-workflows skill correctly', () => {
        const skill: Skill = {
          name: 'github-workflows',
          description:
            'Expert-level GitHub Actions and workflow management skill covering CI/CD pipelines',
          location: 'claude',
          path: '/Users/user/.claude/skills/github-workflows/skill.md',
          content: 'Create, deploy, and test GitHub Actions workflows',
          content_clean: 'Create, deploy, and test GitHub Actions workflows',
          references: [],
          scripts: [],
        };

        const patterns = analyzeTriggers(skill);

        // Technology keywords from name
        expect(patterns.some((p) => p.keyword === 'github')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'workflows')).toBe(true);
        // Action keywords from content
        expect(patterns.some((p) => p.keyword === 'create')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'deploy')).toBe(true);
        expect(patterns.some((p) => p.keyword === 'test')).toBe(true);
      });
    });
  });

  describe('generateExampleQueries', () => {
    it('should generate example queries from patterns', () => {
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

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      expect(examples.length).toBeGreaterThan(0);
      expect(examples.length).toBeLessThanOrEqual(4);
    });

    it('should combine actions and topics in queries', () => {
      const skill: Skill = {
        name: 'test',
        description: '',
        location: 'claude',
        path: '/test/path',
        content: 'create pdf documents',
        content_clean: 'create pdf documents',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      // Should generate queries like "create a pdf" or "help me create pdf"
      const hasActionTopicCombo = examples.some(
        (ex) => ex.includes('create') && ex.includes('pdf')
      );
      expect(hasActionTopicCombo).toBe(true);
    });

    it('should generate work-with queries for topics', () => {
      const skill: Skill = {
        name: 'pdf-tool',
        description: '',
        location: 'claude',
        path: '/test/path',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      // Should generate queries like "work with pdf" or "pdf help"
      const hasWorkWithQuery = examples.some((ex) => ex.includes('work with'));
      const hasHelpQuery = examples.some((ex) => ex.includes('help'));

      expect(hasWorkWithQuery || hasHelpQuery).toBe(true);
    });

    it('should limit to 4 example queries', () => {
      const skill: Skill = {
        name: 'multi-purpose',
        description: 'create generate build analyze',
        location: 'claude',
        path: '/test/path',
        content: 'pdf excel json yaml',
        content_clean: 'pdf excel json yaml',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      expect(examples.length).toBeLessThanOrEqual(4);
    });

    it('should handle empty patterns gracefully', () => {
      const skill: Skill = {
        name: 'x',
        description: '',
        location: 'claude',
        path: '/test/path',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      // Should return empty array or minimal examples
      expect(Array.isArray(examples)).toBe(true);
    });

    it('should handle patterns with only actions', () => {
      const skill: Skill = {
        name: 'action-skill',
        description: 'create build deploy',
        location: 'claude',
        path: '/test/path',
        content: 'create build deploy',
        content_clean: 'create build deploy',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      // Should still generate some examples
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should handle patterns with only topics', () => {
      const skill: Skill = {
        name: 'pdf-json-yaml',
        description: '',
        location: 'claude',
        path: '/test/path',
        content: '',
        content_clean: '',
        references: [],
        scripts: [],
      };

      const patterns = analyzeTriggers(skill);
      const examples = generateExampleQueries(skill, patterns);

      // Should generate queries without actions
      expect(examples.length).toBeGreaterThan(0);
      expect(examples.some((ex) => ex.includes('work with') || ex.includes('help'))).toBe(true);
    });
  });
});
