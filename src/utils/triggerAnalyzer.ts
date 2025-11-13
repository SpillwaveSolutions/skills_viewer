import { Skill } from '../types';

export interface TriggerPattern {
  keyword: string;
  category: 'action' | 'topic' | 'technology' | 'format';
  confidence: 'high' | 'medium' | 'low';
}

export function analyzeTriggers(skill: Skill): TriggerPattern[] {
  const patterns: TriggerPattern[] = [];
  const text = `${skill.name} ${skill.description || ''} ${skill.content}`.toLowerCase();

  // Action keywords
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
  actions.forEach((action) => {
    if (text.includes(action)) {
      patterns.push({ keyword: action, category: 'action', confidence: 'high' });
    }
  });

  // Technology keywords from skill name
  const skillNameWords = skill.name.toLowerCase().split(/[-_\s]+/);
  skillNameWords.forEach((word) => {
    if (word.length > 2) {
      patterns.push({ keyword: word, category: 'technology', confidence: 'high' });
    }
  });

  // Format keywords
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
  formats.forEach((format) => {
    if (text.includes(format)) {
      patterns.push({ keyword: format, category: 'format', confidence: 'high' });
    }
  });

  // Topic keywords from description
  if (skill.description) {
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
    topics.forEach((topic) => {
      if (skill.description!.toLowerCase().includes(topic)) {
        patterns.push({ keyword: topic, category: 'topic', confidence: 'medium' });
      }
    });
  }

  // Remove duplicates
  const unique = patterns.filter(
    (p, i, arr) => arr.findIndex((t) => t.keyword === p.keyword) === i
  );

  return unique;
}

export function generateExampleQueries(_skill: Skill, patterns: TriggerPattern[]): string[] {
  const examples: string[] = [];
  const actions = patterns.filter((p) => p.category === 'action').map((p) => p.keyword);
  const topics = patterns
    .filter((p) => p.category === 'technology' || p.category === 'format')
    .map((p) => p.keyword);

  if (actions.length > 0 && topics.length > 0) {
    examples.push(`${actions[0]} a ${topics[0]}`);
    examples.push(`help me ${actions[0]} ${topics[0]}`);
  }

  if (topics.length > 0) {
    examples.push(`work with ${topics[0]}`);
    examples.push(`${topics[0]} help`);
  }

  return examples.slice(0, 4);
}
