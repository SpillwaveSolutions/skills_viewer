import { Skill } from '../types';

export interface ParsedQuery {
  terms: string[];
  fieldQueries: Record<string, string[]>;
  operators: {
    and: string[];
    or: string[];
    not: string[];
  };
}

export interface HighlightMatch {
  text: string;
  isMatch: boolean;
}

/**
 * Parse search query with operators
 * Supports:
 * - Field-specific: name:pdf, description:excel, location:claude
 * - AND operator: pdf AND excel
 * - OR operator: pdf OR excel
 * - NOT operator: pdf NOT pptx
 * - Simple terms: pdf excel (implicit OR)
 */
export function parseSearchQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {
    terms: [],
    fieldQueries: {},
    operators: {
      and: [],
      or: [],
      not: [],
    },
  };

  if (!query.trim()) {
    return result;
  }

  // Regular expression to match field queries (field:value) or terms
  const fieldQueryRegex = /(\w+):(\S+)/g;
  const andRegex = /\s+AND\s+/gi;
  const orRegex = /\s+OR\s+/gi;
  const notRegex = /\s+NOT\s+/gi;

  let workingQuery = query;

  // Extract field queries first
  let match;
  while ((match = fieldQueryRegex.exec(query)) !== null) {
    const field = match[1].toLowerCase();
    const value = match[2].toLowerCase();

    if (!result.fieldQueries[field]) {
      result.fieldQueries[field] = [];
    }
    result.fieldQueries[field].push(value);

    // Remove from working query
    workingQuery = workingQuery.replace(match[0], '');
  }

  // Split by operators and categorize
  const andParts = workingQuery
    .split(andRegex)
    .map((s) => s.trim())
    .filter(Boolean);

  andParts.forEach((part) => {
    const notParts = part
      .split(notRegex)
      .map((s) => s.trim())
      .filter(Boolean);

    if (notParts.length > 1) {
      // First part is what to include, rest are NOT
      const includeTerm = notParts[0].toLowerCase();
      if (includeTerm) result.operators.and.push(includeTerm);

      for (let i = 1; i < notParts.length; i++) {
        const notTerm = notParts[i].toLowerCase();
        if (notTerm) result.operators.not.push(notTerm);
      }
    } else if (notParts.length === 1) {
      // No NOT, check for OR
      const orParts = notParts[0]
        .split(orRegex)
        .map((s) => s.trim())
        .filter(Boolean);

      if (orParts.length > 1) {
        orParts.forEach((orTerm) => {
          const term = orTerm.toLowerCase();
          if (term) result.operators.or.push(term);
        });
      } else if (orParts.length === 1) {
        // Simple term
        const term = orParts[0].toLowerCase();
        if (term) result.terms.push(term);
      }
    }
  });

  // If no operators used, treat all terms as OR
  if (
    result.terms.length > 0 &&
    result.operators.and.length === 0 &&
    result.operators.or.length === 0 &&
    result.operators.not.length === 0
  ) {
    result.operators.or = [...result.terms];
    result.terms = [];
  }

  return result;
}

/**
 * Match a skill against parsed query
 */
export function matchSkillAgainstQuery(skill: Skill, parsedQuery: ParsedQuery): boolean {
  const searchableText = [skill.name, skill.description || '', skill.location, skill.content_clean]
    .join(' ')
    .toLowerCase();

  // Check NOT operators first (exclusions)
  for (const notTerm of parsedQuery.operators.not) {
    if (searchableText.includes(notTerm)) {
      return false;
    }
  }

  // Check field queries
  for (const [field, values] of Object.entries(parsedQuery.fieldQueries)) {
    let fieldMatched = false;

    for (const value of values) {
      switch (field) {
        case 'name':
          if (skill.name.toLowerCase().includes(value)) {
            fieldMatched = true;
          }
          break;
        case 'description':
          if (skill.description?.toLowerCase().includes(value)) {
            fieldMatched = true;
          }
          break;
        case 'location':
          if (skill.location.toLowerCase().includes(value)) {
            fieldMatched = true;
          }
          break;
        default:
          // Search in all text
          if (searchableText.includes(value)) {
            fieldMatched = true;
          }
      }
    }

    if (!fieldMatched) {
      return false;
    }
  }

  // Check AND operators (all must match)
  if (parsedQuery.operators.and.length > 0) {
    for (const andTerm of parsedQuery.operators.and) {
      if (!searchableText.includes(andTerm)) {
        return false;
      }
    }
  }

  // Check OR operators (at least one must match)
  if (parsedQuery.operators.or.length > 0) {
    let orMatched = false;
    for (const orTerm of parsedQuery.operators.or) {
      if (searchableText.includes(orTerm)) {
        orMatched = true;
        break;
      }
    }
    if (!orMatched) {
      return false;
    }
  }

  return true;
}

/**
 * Highlight matching text in a string
 * Returns an array of {text, isMatch} objects
 */
export function highlightMatches(text: string, query: string): HighlightMatch[] {
  if (!query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const parsedQuery = parseSearchQuery(query);
  const allTerms = [
    ...parsedQuery.terms,
    ...parsedQuery.operators.and,
    ...parsedQuery.operators.or,
    ...Object.values(parsedQuery.fieldQueries).flat(),
  ].filter(Boolean);

  if (allTerms.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Create a case-insensitive regex for all terms
  const escapedTerms = allTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  const parts = text.split(regex);
  const result: HighlightMatch[] = [];

  parts.forEach((part) => {
    if (!part) return;

    const isMatch = allTerms.some((term) => part.toLowerCase() === term.toLowerCase());
    result.push({ text: part, isMatch });
  });

  return result;
}
