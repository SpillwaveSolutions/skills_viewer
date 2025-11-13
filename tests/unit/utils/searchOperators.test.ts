import { describe, it, expect } from 'vitest';
import {
  parseSearchQuery,
  matchSkillAgainstQuery,
  highlightMatches,
} from '../../../src/utils/searchOperators';
import { Skill } from '../../../src/types';

describe('searchOperators', () => {
  describe('parseSearchQuery', () => {
    it('should parse simple terms', () => {
      const result = parseSearchQuery('pdf excel');
      expect(result.operators.or).toContain('pdf');
      expect(result.operators.or).toContain('excel');
    });

    it('should parse field queries', () => {
      const result = parseSearchQuery('name:pdf description:excel');
      expect(result.fieldQueries.name).toContain('pdf');
      expect(result.fieldQueries.description).toContain('excel');
    });

    it('should parse AND operators', () => {
      const result = parseSearchQuery('pdf AND excel');
      expect(result.operators.and).toContain('pdf');
      expect(result.operators.and).toContain('excel');
    });

    it('should parse OR operators', () => {
      const result = parseSearchQuery('pdf OR docx');
      expect(result.operators.or).toContain('pdf');
      expect(result.operators.or).toContain('docx');
    });

    it('should parse NOT operators', () => {
      const result = parseSearchQuery('pdf NOT pptx');
      expect(result.operators.and).toContain('pdf');
      expect(result.operators.not).toContain('pptx');
    });

    it('should handle case insensitivity', () => {
      const result = parseSearchQuery('PDF and EXCEL');
      expect(result.operators.and).toContain('pdf');
      expect(result.operators.and).toContain('excel');
    });

    it('should handle empty query', () => {
      const result = parseSearchQuery('');
      expect(result.terms).toEqual([]);
      expect(result.operators.and).toEqual([]);
      expect(result.operators.or).toEqual([]);
      expect(result.operators.not).toEqual([]);
    });

    it('should handle complex query', () => {
      const result = parseSearchQuery('name:pdf AND description:excel NOT pptx');
      expect(result.fieldQueries.name).toContain('pdf');
      expect(result.fieldQueries.description).toContain('excel');
      expect(result.operators.not).toContain('pptx');
    });

    it('should parse location field query', () => {
      const result = parseSearchQuery('location:claude');
      expect(result.fieldQueries.location).toContain('claude');
    });

    it('should handle multiple field values', () => {
      const result = parseSearchQuery('name:pdf name:docx');
      expect(result.fieldQueries.name).toContain('pdf');
      expect(result.fieldQueries.name).toContain('docx');
    });
  });

  describe('matchSkillAgainstQuery', () => {
    const mockSkill: Skill = {
      name: 'PDF Converter',
      description: 'Convert documents to PDF format',
      location: 'claude',
      path: '/test/pdf-converter',
      content: 'Full content here',
      content_clean: 'Clean content here',
      references: [],
      scripts: [],
      metadata: {},
    };

    it('should match simple term in name', () => {
      const query = parseSearchQuery('pdf');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should match simple term in description', () => {
      const query = parseSearchQuery('convert');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should match field-specific query', () => {
      const query = parseSearchQuery('name:pdf');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should not match incorrect field query', () => {
      const query = parseSearchQuery('name:excel');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(false);
    });

    it('should match AND operator when both terms present', () => {
      const query = parseSearchQuery('pdf AND convert');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should not match AND operator when one term missing', () => {
      const query = parseSearchQuery('pdf AND excel');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(false);
    });

    it('should match OR operator when one term present', () => {
      const query = parseSearchQuery('pdf OR excel');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should not match OR operator when no terms present', () => {
      const query = parseSearchQuery('excel OR pptx');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(false);
    });

    it('should exclude with NOT operator', () => {
      const query = parseSearchQuery('pdf NOT excel');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should exclude when NOT term is present', () => {
      const query = parseSearchQuery('document NOT pdf');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(false);
    });

    it('should match location field', () => {
      const query = parseSearchQuery('location:claude');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should not match incorrect location', () => {
      const query = parseSearchQuery('location:opencode');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(false);
    });

    it('should handle case insensitivity', () => {
      const query = parseSearchQuery('PDF');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });

    it('should match complex query', () => {
      const query = parseSearchQuery('name:pdf AND description:convert NOT excel');
      expect(matchSkillAgainstQuery(mockSkill, query)).toBe(true);
    });
  });

  describe('highlightMatches', () => {
    it('should return original text when no query', () => {
      const result = highlightMatches('test text', '');
      expect(result).toEqual([{ text: 'test text', isMatch: false }]);
    });

    it('should highlight matching term', () => {
      const result = highlightMatches('test text', 'test');
      expect(result.length).toBeGreaterThan(1);
      // Check that we have at least one match
      const hasMatch = result.some((r) => r.isMatch);
      expect(hasMatch).toBe(true);
    });

    it('should handle case insensitive matching', () => {
      const result = highlightMatches('Test Text', 'test');
      expect(result.length).toBeGreaterThan(1);
      const hasMatch = result.some((r) => r.isMatch);
      expect(hasMatch).toBe(true);
    });

    it('should highlight multiple matches', () => {
      const result = highlightMatches('test test', 'test');
      const matches = result.filter((r) => r.isMatch);
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle special regex characters', () => {
      const result = highlightMatches('test (with) [brackets]', 'with');
      expect(result.length).toBeGreaterThan(1);
      const hasMatch = result.some((r) => r.isMatch);
      expect(hasMatch).toBe(true);
    });

    it('should handle OR operator terms', () => {
      const result = highlightMatches('pdf and excel', 'pdf OR excel');
      const matches = result.filter((r) => r.isMatch);
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });

    it('should return original text when no matches', () => {
      const result = highlightMatches('test text', 'nomatch');
      expect(result).toEqual([{ text: 'test text', isMatch: false }]);
    });

    it('should return match data structure', () => {
      const result = highlightMatches('test text', 'test');
      result.forEach((match) => {
        expect(match).toHaveProperty('text');
        expect(match).toHaveProperty('isMatch');
        expect(typeof match.text).toBe('string');
        expect(typeof match.isMatch).toBe('boolean');
      });
    });
  });
});
