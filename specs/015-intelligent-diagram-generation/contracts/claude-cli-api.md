# API Contract: Claude CLI Service

**Module**: `src/services/claudeCliService.ts`  
**Purpose**: Generate Mermaid diagrams via Claude Code CLI  
**Dependencies**: `child_process` (Node.js built-in), Claude Code CLI (external)

## Interface

```typescript
export interface IClaudeCliService {
  /**
   * Check if Claude CLI is installed and available
   * @returns true if `claude` command exists in PATH
   */
  isCliAvailable(): Promise<boolean>;

  /**
   * Generate Mermaid diagram via Claude CLI
   * @param request - Generation request with prompt, content, timeout
   * @returns GenerationResult with status, diagram source, or error
   */
  generateDiagram(request: GenerationRequest): Promise<GenerationResult>;

  /**
   * Extract Mermaid syntax from Claude CLI response
   * @param response - Raw stdout from Claude CLI
   * @returns Mermaid diagram source (no markdown fences)
   * @throws DiagramError if response doesn't contain valid Mermaid
   */
  extractMermaid(response: string): string;
}
```

## Behavior Contract

### `isCliAvailable(): Promise<boolean>`

**Purpose**: Check if Claude CLI is installed before attempting generation.

**Implementation**:

```typescript
async function isCliAvailable(): Promise<boolean> {
  try {
    const { stdout } = await exec('which claude'); // Unix
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}
```

**Platform Differences**:

- macOS/Linux: Use `which claude`
- Windows: Use `where claude`

**Returns**:

- `true` if Claude CLI found in PATH
- `false` if not installed or not in PATH

---

### `generateDiagram(request: GenerationRequest): Promise<GenerationResult>`

**Inputs**:

```typescript
interface GenerationRequest {
  skillName: string;
  skillContent: string;
  timeout: number; // milliseconds (default: 30000)
  retryCount: number; // default: 0
  prompt: string;
}
```

**Outputs**:

```typescript
interface GenerationResult {
  status: 'success' | 'timeout' | 'error' | 'cli_not_found';
  diagramSource: string | null;
  error: string | null;
  durationMs: number;
  validation: ValidationResult | null;
}
```

**Success Case**:

```typescript
const result = await service.generateDiagram({
  skillName: 'sdd',
  skillContent: '...',
  timeout: 30000,
  retryCount: 0,
  prompt: 'Generate Mermaid flowchart...',
});

// result = {
//   status: 'success',
//   diagramSource: 'graph TD\n  A-->B\n  B-->C',
//   error: null,
//   durationMs: 8500,
//   validation: { isValid: true, ... }
// }
```

**Timeout Case** (>30s):

```typescript
// result = {
//   status: 'timeout',
//   diagramSource: null,
//   error: 'Claude CLI timed out after 30000ms',
//   durationMs: 30000,
//   validation: null
// }
```

**CLI Not Found Case**:

```typescript
// result = {
//   status: 'cli_not_found',
//   diagramSource: null,
//   error: 'Claude CLI not installed. Visit https://claude.com/claude-code',
//   durationMs: 0,
//   validation: null
// }
```

**Error Case** (CLI returns non-zero exit code):

```typescript
// result = {
//   status: 'error',
//   diagramSource: null,
//   error: 'Claude CLI failed with code 1: Authentication required',
//   durationMs: 1200,
//   validation: null
// }
```

---

### Claude CLI Invocation Details

**Command**:

```bash
claude -p <prompt>
```

**Input Method**: Write skill content to stdin

```typescript
process.stdin.write(request.skillContent);
process.stdin.end();
```

**Timeout Enforcement**:

```typescript
const process = spawn('claude', ['-p', request.prompt], {
  timeout: request.timeout,
  shell: true,
});

// Kill process after timeout
setTimeout(() => {
  if (!process.killed) {
    process.kill('SIGTERM');
  }
}, request.timeout);
```

---

### Prompt Template

**Default Prompt**:

```typescript
const DIAGRAM_GENERATION_PROMPT = `
You are a Mermaid diagram expert. Generate a flowchart diagram for the following Claude Code skill.

Requirements:
- Output ONLY valid Mermaid syntax (no markdown fences, no explanations)
- Use flowchart syntax (graph TD or graph LR)
- Include skill name, references, and scripts as nodes
- Show dependencies with arrows
- Use descriptive node labels
- Ensure syntax is valid (use proper Mermaid keywords)

Skill Content:
{skill_content}

Output format:
graph TD
  SKILL["Skill Name"]
  REF1["reference.md"]
  SKILL --> REF1
`;
```

**Customization**:

- Replace `{skill_content}` with actual skill content
- Keep prompt concise (Claude CLI has token limits)
- Emphasize "ONLY Mermaid syntax" to avoid explanations

---

### `extractMermaid(response: string): string`

**Purpose**: Extract Mermaid syntax from Claude CLI response, removing markdown fences and explanations.

**Inputs**:

- `response`: Raw stdout from Claude CLI

**Outputs**:

- Clean Mermaid diagram source (no ```mermaid fences)

**Implementation**:

````typescript
function extractMermaid(response: string): string {
  // Remove markdown code fences
  let cleaned = response
    .replace(/```mermaid\n/g, '')
    .replace(/```\n?$/g, '')
    .trim();

  // Remove leading/trailing explanations
  const lines = cleaned.split('\n');
  const startIdx = lines.findIndex((line) =>
    line.match(/^(graph|flowchart|sequenceDiagram|classDiagram)/)
  );

  if (startIdx === -1) {
    throw new DiagramError(
      DiagramErrorCode.GENERATION_FAILED,
      'Response does not contain valid Mermaid syntax'
    );
  }

  // Extract from first Mermaid keyword to end
  cleaned = lines.slice(startIdx).join('\n');

  return cleaned;
}
````

**Edge Cases**:

- Response contains multiple code blocks → Extract first Mermaid block
- Response has explanations before diagram → Skip to first `graph` keyword
- Response has markdown formatting → Remove all formatting

---

## Error Handling

### Error Types

**1. CLI Not Installed**:

```typescript
if (!await isCliAvailable()) {
  return {
    status: 'cli_not_found',
    error: 'Claude CLI not installed. Visit https://claude.com/claude-code',
    ...
  };
}
```

**2. Timeout**:

```typescript
if (durationMs >= request.timeout) {
  return {
    status: 'timeout',
    error: `Claude CLI timed out after ${request.timeout}ms`,
    ...
  };
}
```

**3. Non-Zero Exit Code**:

```typescript
if (exitCode !== 0) {
  return {
    status: 'error',
    error: `Claude CLI failed with code ${exitCode}: ${stderr}`,
    ...
  };
}
```

**4. Invalid Response**:

```typescript
try {
  const mermaid = extractMermaid(stdout);
} catch (error) {
  return {
    status: 'error',
    error: `Failed to extract Mermaid: ${error.message}`,
    ...
  };
}
```

---

## Logging Requirements

All CLI calls must log to console (FR-017):

```typescript
console.log(`[ClaudeCliService] Generating diagram for skill: ${request.skillName}`);
console.log(`[ClaudeCliService] Prompt length: ${request.prompt.length} chars`);
console.log(`[ClaudeCliService] Content length: ${request.skillContent.length} chars`);
console.log(`[ClaudeCliService] Timeout: ${request.timeout}ms`);

// After completion
if (result.status === 'success') {
  console.log(`[ClaudeCliService] ✓ Generated diagram (${result.durationMs}ms)`);
} else {
  console.error(`[ClaudeCliService] ✗ Generation failed: ${result.error}`);
}
```

---

## Testing Requirements

### Unit Tests (`tests/unit/claudeCliService.test.ts`)

**Mock CLI Responses**:

```typescript
// Mock successful response
jest.spyOn(child_process, 'spawn').mockImplementation(() => ({
  stdout: mockStream('graph TD\n  A-->B'),
  stderr: mockStream(''),
  stdin: { write: jest.fn(), end: jest.fn() },
  on: jest.fn((event, callback) => {
    if (event === 'close') callback(0); // Exit code 0
  }),
}));
```

**Test Cases**:

1. Successful generation → `status = 'success'`, diagram source present
2. Timeout → `status = 'timeout'`, error message present
3. CLI not found → `status = 'cli_not_found'`
4. Non-zero exit code → `status = 'error'`
5. Invalid response (no Mermaid) → `status = 'error'`
6. Response with markdown fences → Correctly extracted
7. Large skill content (>100KB) → Handles gracefully

**Coverage Target**: >85%

---

### Integration Tests (`tests/integration/claudeCliService.test.ts`)

**Mock CLI Behavior**:

- Use `jest.mock('child_process')` to avoid real CLI calls
- Simulate various response scenarios
- Test timeout enforcement
- Test stdin/stdout handling

---

## Performance Benchmarks

| Skill Size      | Expected Time | Max Time |
| --------------- | ------------- | -------- |
| Small (<5KB)    | <5s           | 10s      |
| Medium (5-20KB) | <10s          | 20s      |
| Large (>20KB)   | <20s          | 30s      |

All calls timeout at 30s (FR-012).

---

## Integration Points

**Called By**:

- `DiagramStore.loadDiagram()` - When validation fails
- `InteractiveDiagram.handleRegenerateDiagram()` - Manual regeneration

**Calls**:

- `child_process.spawn()` (Node.js)
- `MermaidValidator.validate()` (to validate generated diagram)

---

**Contract Version**: 1.0  
**Last Updated**: 2025-11-14
