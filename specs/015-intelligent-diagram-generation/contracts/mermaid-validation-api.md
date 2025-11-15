# API Contract: Mermaid Validation Service

**Module**: `src/services/mermaidValidator.ts`  
**Purpose**: Validate Mermaid syntax before rendering to detect errors  
**Dependencies**: `mermaid@11.12.1`

## Interface

```typescript
export interface IMermaidValidator {
  /**
   * Validate Mermaid syntax using mermaid.parse()
   * @param source - Mermaid diagram source code
   * @returns ValidationResult with isValid, error, and lineNumber
   * @throws Never throws (errors are captured in ValidationResult)
   */
  validate(source: string): Promise<ValidationResult>;

  /**
   * Extract line number from error message (if available)
   * @param errorMessage - Error message from mermaid.parse()
   * @returns Line number or null if not found
   * @example extractLineNumber("Parse error on line 5") → 5
   */
  extractLineNumber(errorMessage: string): number | null;
}
```

## Behavior Contract

### `validate(source: string): Promise<ValidationResult>`

**Inputs**:

- `source`: String containing Mermaid diagram code

**Outputs**:

```typescript
interface ValidationResult {
  isValid: boolean;
  error: string | null;
  lineNumber: number | null;
  timestamp: number;
}
```

**Success Case** (Valid Mermaid):

```typescript
const result = await validator.validate('graph TD\n  A-->B');
// result = {
//   isValid: true,
//   error: null,
//   lineNumber: null,
//   timestamp: 1700000000000
// }
```

**Error Case** (Invalid Mermaid):

```typescript
const result = await validator.validate('graph TD\n  A-->>'); // Missing target
// result = {
//   isValid: false,
//   error: "Parse error on line 2: Expecting 'IDENTIFIER', got 'EOF'",
//   lineNumber: 2,
//   timestamp: 1700000000000
// }
```

**Edge Cases**:

- Empty string → `{ isValid: false, error: "Empty diagram source", ... }`
- Whitespace only → `{ isValid: false, error: "No diagram content", ... }`
- Unknown diagram type → `{ isValid: false, error: "Unknown diagram type: 'foobar'", ... }`

**Performance**:

- Must complete within 50ms for typical diagrams (<1000 lines)
- Must use `suppressErrors: true` to prevent console spam

**Error Handling**:

- NEVER throws exceptions
- All errors captured in ValidationResult
- Logs validation attempts to console (FR-017)

---

### `extractLineNumber(errorMessage: string): number | null`

**Inputs**:

- `errorMessage`: Error message string from mermaid.parse()

**Outputs**:

- Line number (integer) if found in message
- `null` if no line number present

**Examples**:

```typescript
extractLineNumber("Parse error on line 5: Expecting 'SEMI'") → 5
extractLineNumber("Syntax error in graph definition") → null
extractLineNumber("Line 123 has an error") → 123
```

**Implementation Strategy**:

```typescript
function extractLineNumber(errorMessage: string): number | null {
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}
```

---

## Implementation Requirements

### Initialization

Mermaid must be initialized before validation:

```typescript
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});
```

This is already done in `InteractiveDiagram.tsx` - DO NOT re-initialize.

### Suppressing Errors

Always use `suppressErrors: true` to prevent console pollution:

```typescript
await mermaid.parse(source, { suppressErrors: true });
```

### Logging

All validation attempts must log to console:

```typescript
console.log(`[MermaidValidator] Validating diagram (${source.length} chars)`);
if (!result.isValid) {
  console.error(`[MermaidValidator] Validation failed: ${result.error}`);
}
```

---

## Testing Requirements

### Unit Tests (`tests/unit/mermaidValidator.test.ts`)

**Test Cases**:

1. Valid flowchart → `isValid = true`
2. Valid sequence diagram → `isValid = true`
3. Invalid syntax (missing semicolon) → `isValid = false`, error message present
4. Invalid syntax with line number → `lineNumber` extracted correctly
5. Empty string → `isValid = false`
6. Whitespace only → `isValid = false`
7. Unknown diagram type → `isValid = false`
8. Large diagram (1000+ lines) → Completes within 50ms

**Coverage Target**: >90% (critical path for error detection)

---

## Integration Points

**Called By**:

- `DiagramStore.loadDiagram()` - Before rendering existing diagrams
- `ClaudeCliService.generateDiagram()` - After Claude CLI generation

**Calls**:

- `mermaid.parse()` (from `mermaid` package)

---

## Error Messages Reference

Common error patterns from `mermaid.parse()`:

```
"Parse error on line X: Expecting 'SEMI', got 'IDENTIFIER'"
"Parse error on line X: Expecting 'IDENTIFIER', got 'EOF'"
"Syntax error in graph definition"
"Unknown diagram type: 'foobar'"
"Lexical error on line X: Unrecognized text."
```

Line numbers are NOT always present - handle gracefully.

---

## Performance Benchmarks

| Diagram Size   | Expected Time | Max Time |
| -------------- | ------------- | -------- |
| <100 lines     | <10ms         | 20ms     |
| 100-500 lines  | <25ms         | 50ms     |
| 500-1000 lines | <40ms         | 100ms    |

If validation exceeds 100ms, log warning but don't fail.

---

**Contract Version**: 1.0  
**Last Updated**: 2025-11-14
