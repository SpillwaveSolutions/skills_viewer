/**
 * Mock Skills for Testing
 * Feature: 004-ui-ux-polish
 *
 * Test fixtures for UI/UX polish implementation and validation
 */

import { Skill, Script, Reference } from '../../src/types/skill';

/**
 * Mock skill with extremely long name (200+ characters)
 * Tests text truncation behavior (US3)
 */
export const mockSkillLongName: Skill = {
  name: 'A'.repeat(200), // 200 character name
  path: '/Users/test/.claude/skills/very-long-name',
  content: '# Very Long Skill Name\n\nThis skill has an extremely long name to test text truncation.',
  description: 'Test skill with very long name for truncation testing',
  metadata: {
    version: '1.0.0',
    author: 'Test Author',
  },
  references: [],
  scripts: [],
  triggers: ['test', 'truncation'],
  location: 'claude',
};

/**
 * Mock skill with minimal data (no description, version, triggers)
 * Tests graceful handling of missing metadata (US2)
 */
export const mockSkillMinimal: Skill = {
  name: 'Minimal Skill',
  path: '/Users/test/.claude/skills/minimal',
  content: '# Minimal Skill\n\nMinimal content',
  // No description
  metadata: {}, // No version, no other metadata
  references: [],
  scripts: [],
  // No triggers
  location: 'opencode',
};

/**
 * Mock skill with all fields populated
 * Tests complete data rendering (US2)
 */
export const mockSkillComplete: Skill = {
  name: 'Complete Skill',
  path: '/Users/test/.claude/skills/complete',
  content: '# Complete Skill\n\nThis is a complete skill with all fields populated.\n\n## Content\n\nMultiple lines of content here.',
  description: 'This is a comprehensive test skill with all fields populated for testing the complete data flow',
  metadata: {
    version: '2.5.3',
    author: 'Complete Author',
    tags: ['test', 'complete', 'example'],
    category: 'Testing',
    license: 'MIT',
  },
  references: [
    {
      name: 'api.md',
      path: '/Users/test/.claude/skills/complete/references/api.md',
      content: '# API Reference\n\nAPI documentation here',
    },
    {
      name: 'examples.md',
      path: '/Users/test/.claude/skills/complete/references/examples.md',
      content: '# Examples\n\nExample usage here',
    },
  ],
  scripts: [
    {
      name: 'test.py',
      language: 'python',
      path: '/Users/test/.claude/skills/complete/scripts/test.py',
      content: 'def hello():\n    """Test function"""\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    hello()',
    },
    {
      name: 'helper.js',
      language: 'javascript',
      path: '/Users/test/.claude/skills/complete/scripts/helper.js',
      content: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nmodule.exports = { greet };',
    },
  ],
  triggers: ['complete', 'test', 'example', 'comprehensive', 'full'],
  location: 'claude',
};

/**
 * Mock skill with 20+ triggers
 * Tests trigger preview truncation (US2 - should show first 5)
 */
export const mockSkillManyTriggers: Skill = {
  name: 'Skill With Many Triggers',
  path: '/Users/test/.claude/skills/many-triggers',
  content: '# Many Triggers\n\nSkill with many trigger keywords',
  description: 'Test skill with 20+ triggers to test preview functionality',
  metadata: {
    version: '1.0.0',
  },
  references: [],
  scripts: [],
  triggers: [
    'trigger01', 'trigger02', 'trigger03', 'trigger04', 'trigger05',
    'trigger06', 'trigger07', 'trigger08', 'trigger09', 'trigger10',
    'trigger11', 'trigger12', 'trigger13', 'trigger14', 'trigger15',
    'trigger16', 'trigger17', 'trigger18', 'trigger19', 'trigger20',
  ],
  location: 'claude',
};

/**
 * Mock Python script for syntax highlighting tests (US4)
 */
export const mockPythonScript: Script = {
  name: 'syntax_test.py',
  language: 'python',
  path: '/Users/test/.claude/skills/test/scripts/syntax_test.py',
  content: `# Python Syntax Test
def factorial(n):
    """Calculate factorial recursively"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

class Calculator:
    """Simple calculator class"""

    def __init__(self):
        self.result = 0

    def add(self, x, y):
        """Add two numbers"""
        self.result = x + y
        return self.result

if __name__ == "__main__":
    calc = Calculator()
    print(f"5 + 3 = {calc.add(5, 3)}")
    print(f"5! = {factorial(5)}")
`,
};

/**
 * Mock JavaScript script for syntax highlighting tests (US4)
 */
export const mockJavaScriptScript: Script = {
  name: 'helper.js',
  language: 'javascript',
  path: '/Users/test/.claude/skills/test/scripts/helper.js',
  content: `// JavaScript Syntax Test
class UserService {
  constructor(apiClient) {
    this.client = apiClient;
    this.cache = new Map();
  }

  async fetchUser(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const user = await this.client.get(\`/users/\${id}\`);
    this.cache.set(id, user);
    return user;
  }
}

export default UserService;
`,
};

/**
 * Mock skill for spacing tests (US1)
 * Regular skill to verify proper margins applied
 */
export const mockSkillForSpacing: Skill = {
  name: 'Spacing Test Skill',
  path: '/Users/test/.claude/skills/spacing',
  content: '# Spacing Test\n\nContent for testing margins and padding.',
  description: 'Used to verify 8px minimum margins from borders',
  metadata: {
    version: '1.0.0',
  },
  references: [
    {
      name: 'ref1.md',
      path: '/Users/test/.claude/skills/spacing/references/ref1.md',
      content: '# Reference 1\n\nContent here',
    },
  ],
  scripts: [
    {
      name: 'script1.py',
      language: 'python',
      path: '/Users/test/.claude/skills/spacing/scripts/script1.py',
      content: 'print("test")',
    },
  ],
  triggers: ['spacing', 'test'],
  location: 'claude',
};

/**
 * Mock empty script (edge case for US4)
 */
export const mockEmptyScript: Script = {
  name: 'empty.py',
  language: 'python',
  path: '/Users/test/.claude/skills/test/scripts/empty.py',
  content: '',
};

/**
 * Array of all mock skills for list testing
 */
export const mockSkillsList: Skill[] = [
  mockSkillComplete,
  mockSkillMinimal,
  mockSkillLongName,
  mockSkillManyTriggers,
  mockSkillForSpacing,
];

/**
 * Mock skills with special characters in names
 */
export const mockSkillSpecialChars: Skill = {
  name: 'Skill with "quotes" & <special> chars',
  path: '/Users/test/.claude/skills/special',
  content: '# Special Characters\n\nTesting special character handling',
  description: 'Tests encoding & rendering of special chars: <>&"\'',
  metadata: {},
  references: [],
  scripts: [],
  triggers: ['special', 'chars'],
  location: 'opencode',
};
