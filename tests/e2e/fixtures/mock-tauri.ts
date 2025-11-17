/**
 * Playwright Fixture: Mock Tauri API for Visual Regression Tests
 *
 * This fixture provides mock skill data by intercepting Tauri invoke calls
 * at the browser level, rather than polluting production code with test data.
 *
 * Usage:
 *   import { test } from './fixtures/mock-tauri';
 *   // test() now automatically has mocked Tauri API
 */

import { test as base } from '@playwright/test';
import { Skill } from '../../../src/types';

const getMockSkills = (): Skill[] => {
  const pumlContent = `---
description: Generate PlantUML diagrams from text descriptions
---

# PlantUML Skill

Generate UML diagrams using PlantUML syntax.

## Overview

This skill helps you create various types of UML diagrams including:
- Sequence diagrams
- Class diagrams
- Activity diagrams
- State diagrams

## Usage

Simply describe the diagram you want and this skill will generate the PlantUML syntax.

## Examples

\`\`\`plantuml
@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi there!
@enduml
\`\`\`
`;

  const taskfileContent = `---
description: Help with Taskfile.yml configuration
---

# Taskfile Skill

Work with Taskfiles for build automation.

## Overview

This skill provides assistance with creating and managing Taskfile.yml files for build automation.

## Features

- Task definition syntax
- Dependency management
- Variable usage
- Command execution

## Example

\`\`\`yaml
version: '3'
tasks:
  build:
    desc: Build the application
    cmds:
      - go build -o app
\`\`\`
`;

  return [
    {
      name: 'puml',
      description: 'Generate PlantUML diagrams from text descriptions',
      location: 'claude',
      path: '~/.claude/skills/puml/skill.md',
      content: pumlContent,
      content_clean: pumlContent.replace(/^---[\s\S]*?---\n\n/, ''),
      references: [],
      scripts: [],
      metadata: {
        description: 'Generate PlantUML diagrams from text descriptions',
      },
    },
    {
      name: 'taskfile',
      description: 'Help with Taskfile.yml configuration',
      location: 'claude',
      path: '~/.claude/skills/taskfile/skill.md',
      content: taskfileContent,
      content_clean: taskfileContent.replace(/^---[\s\S]*?---\n\n/, ''),
      references: [],
      scripts: [],
      metadata: {
        description: 'Help with Taskfile.yml configuration',
      },
    },
  ];
};

export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept Tauri API calls before page loads
    await page.addInitScript(() => {
      // Mock Tauri globals
      (window as any).__TAURI__ = {
        core: {
          invoke: async (command: string) => {
            if (command === 'scan_skills') {
              // Return mock skills data
              return getMockSkills();
            }
            throw new Error(`Unmocked Tauri command: ${command}`);
          },
        },
      };
    });

    // Inject getMockSkills function into page context for the invoke mock
    await page.evaluateOnNewDocument(`
      function getMockSkills() {
        const pumlContent = \`---
description: Generate PlantUML diagrams from text descriptions
---

# PlantUML Skill

Generate UML diagrams using PlantUML syntax.

## Overview

This skill helps you create various types of UML diagrams including:
- Sequence diagrams
- Class diagrams
- Activity diagrams
- State diagrams

## Usage

Simply describe the diagram you want and this skill will generate the PlantUML syntax.

## Examples

\\\`\\\`\\\`plantuml
@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi there!
@enduml
\\\`\\\`\\\`
\`;

        const taskfileContent = \`---
description: Help with Taskfile.yml configuration
---

# Taskfile Skill

Work with Taskfiles for build automation.

## Overview

This skill provides assistance with creating and managing Taskfile.yml files for build automation.

## Features

- Task definition syntax
- Dependency management
- Variable usage
- Command execution

## Example

\\\`\\\`\\\`yaml
version: '3'
tasks:
  build:
    desc: Build the application
    cmds:
      - go build -o app
\\\`\\\`\\\`
\`;

        return [
          {
            name: 'puml',
            description: 'Generate PlantUML diagrams from text descriptions',
            location: 'claude',
            path: '~/.claude/skills/puml/skill.md',
            content: pumlContent,
            content_clean: pumlContent.replace(/^---[\\s\\S]*?---\\n\\n/, ''),
            references: [],
            scripts: [],
            metadata: {
              description: 'Generate PlantUML diagrams from text descriptions',
            },
          },
          {
            name: 'taskfile',
            description: 'Help with Taskfile.yml configuration',
            location: 'claude',
            path: '~/.claude/skills/taskfile/skill.md',
            content: taskfileContent,
            content_clean: taskfileContent.replace(/^---[\\s\\S]*?---\\n\\n/, ''),
            references: [],
            scripts: [],
            metadata: {
              description: 'Help with Taskfile.yml configuration',
            },
          },
        ];
      }

      // Mock __TAURI__ global with invoke method
      window.__TAURI__ = {
        core: {
          invoke: async (command) => {
            if (command === 'scan_skills') {
              return getMockSkills();
            }
            throw new Error('Unmocked Tauri command: ' + command);
          },
        },
      };
    `);

    await use(page);
  },
});

export { expect } from '@playwright/test';
