import { describe, it, expect } from 'vitest';
import { generateSkillDiagram } from '../../src/utils/diagramGenerator';
import { Skill } from '../../src/types';

describe('diagramGenerator', () => {
  const mockSkill: Skill = {
    name: 'test-skill',
    path: '/path/to/test-skill',
    description: 'Test skill description',
    triggers: ['test trigger'],
    location: 'user',
    references: [
      {
        path: '/path/to/reference1.md',
        content: 'Reference 1 content',
      },
      {
        path: '/path/to/reference2.md',
        content: 'Reference 2 content',
      },
    ],
    scripts: [
      {
        name: 'script1',
        command: 'echo test',
        description: 'Test script 1',
      },
      {
        name: 'script2',
        command: 'echo test2',
        description: 'Test script 2',
      },
    ],
  };

  it('generates diagram with TD (top-down) layout by default', () => {
    const diagram = generateSkillDiagram(mockSkill);
    expect(diagram).toContain('graph TD');
  });

  it('generates diagram with TD layout when specified', () => {
    const diagram = generateSkillDiagram(mockSkill, 'TD');
    expect(diagram).toContain('graph TD');
  });

  it('generates diagram with LR (left-right) layout when specified', () => {
    const diagram = generateSkillDiagram(mockSkill, 'LR');
    expect(diagram).toContain('graph LR');
  });

  it('includes skill name in diagram', () => {
    const diagram = generateSkillDiagram(mockSkill);
    expect(diagram).toContain('test-skill');
  });

  it('includes references section when skill has references', () => {
    const diagram = generateSkillDiagram(mockSkill);
    expect(diagram).toContain('References (2)');
    expect(diagram).toContain('reference1.md');
    expect(diagram).toContain('reference2.md');
  });

  it('includes scripts section when skill has scripts', () => {
    const diagram = generateSkillDiagram(mockSkill);
    expect(diagram).toContain('Scripts (2)');
    expect(diagram).toContain('script1');
    expect(diagram).toContain('script2');
  });

  it('handles skill with no references', () => {
    const skillWithoutRefs: Skill = {
      ...mockSkill,
      references: [],
    };
    const diagram = generateSkillDiagram(skillWithoutRefs);
    expect(diagram).not.toContain('References');
  });

  it('handles skill with no scripts', () => {
    const skillWithoutScripts: Skill = {
      ...mockSkill,
      scripts: [],
    };
    const diagram = generateSkillDiagram(skillWithoutScripts);
    expect(diagram).not.toContain('Scripts');
  });

  it('sanitizes special characters in skill name', () => {
    const skillWithSpecialChars: Skill = {
      ...mockSkill,
      name: 'test-skill [with] "quotes" #and #hash',
    };
    const diagram = generateSkillDiagram(skillWithSpecialChars);
    // Should not contain raw special characters that break Mermaid
    expect(diagram).not.toContain('[with]');
    expect(diagram).not.toContain('#and');
  });

  it('maintains consistent layout across same skill', () => {
    const diagram1 = generateSkillDiagram(mockSkill, 'TD');
    const diagram2 = generateSkillDiagram(mockSkill, 'TD');
    expect(diagram1).toBe(diagram2);
  });
});
