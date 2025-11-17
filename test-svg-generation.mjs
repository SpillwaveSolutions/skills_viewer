#!/usr/bin/env node

/**
 * Test script to generate a Mermaid SVG and save it to a file for inspection
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const mermaidCode = `
graph TD
    skill[plantuml]
    skill --> refs[References<br/>25 refs]

    refs --> ref1[ditaa_diagrams.md]
    refs --> ref2[timing_diagrams.md]
    refs --> ref3[unicode_symbols.md]

    style skill fill:#e1f5ff,stroke:#01579b
    style refs fill:#c8e6c9,stroke:#2e7d32
    style ref1 fill:#fff9c4,stroke:#f57f17
    style ref2 fill:#fff9c4,stroke:#f57f17
    style ref3 fill:#fff9c4,stroke:#f57f17
`;

try {
    const inputPath = join(tmpdir(), 'test-mermaid.mmd');
    const outputPath = join(process.cwd(), 'test-diagram-output.svg');

    console.log('Writing Mermaid code to:', inputPath);
    writeFileSync(inputPath, mermaidCode);

    console.log('Generating SVG with mmdc...');
    const command = `npx -p @mermaid-js/mermaid-cli mmdc -i ${inputPath} -o ${outputPath} -b transparent`;
    console.log('Command:', command);

    execSync(command, { stdio: 'inherit' });

    console.log('✅ SVG generated successfully at:', outputPath);
    console.log('\nYou can open this file to inspect the SVG structure.');

} catch (error) {
    console.error('❌ Error generating SVG:', error.message);
    process.exit(1);
}
