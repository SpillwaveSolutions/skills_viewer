import { Skill } from '../types';

export type DiagramLayout = 'TD' | 'LR';

/**
 * Sanitize text for use in Mermaid diagrams
 * Replaces characters that can break Mermaid syntax
 */
function sanitizeForMermaid(text: string): string {
  return text
    .replace(/"/g, '\\"') // Escape quotes
    .replace(/\[/g, '(') // Replace brackets with parens
    .replace(/]/g, ')')
    .replace(/#/g, '') // Remove hash symbols
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();
}

export function generateSkillDiagram(skill: Skill, layout: DiagramLayout = 'TD'): string {
  const lines: string[] = [];

  lines.push(`graph ${layout}`);
  lines.push(`    SKILL["📦 ${sanitizeForMermaid(skill.name)}"]`);
  lines.push(`    style SKILL fill:#4F46E5,stroke:#312E81,stroke-width:3px,color:#fff`);

  // Add references section
  if (skill.references.length > 0) {
    lines.push(`    REFS["📚 References (${skill.references.length})"]`);
    lines.push(`    SKILL --> REFS`);
    lines.push(`    style REFS fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff`);

    // Group references in rows for better layout
    const refsPerRow = 3;
    skill.references.forEach((ref, index) => {
      const refId = `REF${index}`;
      const fileName = ref.path.split('/').pop() || ref.path;
      lines.push(`    ${refId}["📄 ${sanitizeForMermaid(fileName)}"]`);
      lines.push(`    REFS --> ${refId}`);
      lines.push(`    style ${refId} fill:#D1FAE5,stroke:#065F46,color:#065F46`);

      // Create horizontal connections within each row
      if (index % refsPerRow !== 0 && index > 0) {
        const prevId = `REF${index - 1}`;
        lines.push(`    ${prevId} -.-> ${refId}`);
      }
    });
  }

  // Add scripts section
  if (skill.scripts.length > 0) {
    lines.push(`    SCRIPTS["⚙️ Scripts (${skill.scripts.length})"]`);
    lines.push(`    SKILL --> SCRIPTS`);
    lines.push(`    style SCRIPTS fill:#F59E0B,stroke:#92400E,stroke-width:2px,color:#fff`);

    // Group scripts in rows for better layout
    const scriptsPerRow = 3;
    skill.scripts.forEach((script, index) => {
      const scriptId = `SCRIPT${index}`;
      lines.push(`    ${scriptId}["🔧 ${sanitizeForMermaid(script.name)}"]`);
      lines.push(`    SCRIPTS --> ${scriptId}`);
      lines.push(`    style ${scriptId} fill:#FEF3C7,stroke:#92400E,color:#92400E`);

      // Create horizontal connections within each row
      if (index % scriptsPerRow !== 0 && index > 0) {
        const prevId = `SCRIPT${index - 1}`;
        lines.push(`    ${prevId} -.-> ${scriptId}`);
      }
    });
  }

  return lines.join('\n');
}
