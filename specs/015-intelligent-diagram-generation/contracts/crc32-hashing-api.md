# API Contract: CRC32 Hasher

**Module**: `src/utils/crcHasher.ts`  
**Purpose**: Calculate CRC32 hashes for cache invalidation  
**Dependencies**: `crc-32` npm package

## Interface

```typescript
export interface ICrcHasher {
  /**
   * Calculate CRC32 hash of skill content
   * @param content - SkillContent object with skillMd, references, scripts
   * @returns 8-character hex string (e.g., "a3f4b2c1")
   */
  calculateSkillCrc(content: SkillContent): string;

  /**
   * Concatenate skill files in deterministic order
   * @param content - SkillContent object
   * @returns Concatenated string with separators
   */
  concatenateSkillContent(content: SkillContent): string;

  /**
   * Calculate CRC32 hash of string
   * @param input - Input string
   * @returns 8-character hex string
   */
  calculateCrc32(input: string): string;
}
```

## Behavior Contract

### `calculateSkillCrc(content: SkillContent): string`

**Purpose**: Calculate deterministic CRC32 hash of all skill files for cache key generation.

**Inputs**:

```typescript
interface SkillContent {
  skillMd: string; // Contents of skill.md
  references: string[]; // Array of reference file contents
  scripts: string[]; // Array of script file contents
}
```

**Outputs**:

- 8-character lowercase hex string (e.g., `"a3f4b2c1"`)
- Deterministic (same input = same output)
- Range: `00000000` to `ffffffff` (4.3 billion possibilities)

**Implementation**:

```typescript
function calculateSkillCrc(content: SkillContent): string {
  const concatenated = concatenateSkillContent(content);
  return calculateCrc32(concatenated);
}
```

**Example**:

```typescript
const content: SkillContent = {
  skillMd: 'Skill content here...',
  references: ['Reference 1 content', 'Reference 2 content'],
  scripts: ['#!/bin/bash\necho "script 1"', 'echo "script 2"'],
};

const hash = calculateSkillCrc(content);
// Result: "a3f4b2c1"
```

**Determinism Guarantee**:

- Same skill content → Always same hash
- Order-independent for references/scripts (sorted before hashing)
- Platform-independent (identical on macOS/Linux/Windows)

---

### `concatenateSkillContent(content: SkillContent): string`

**Purpose**: Combine skill files in deterministic order for hashing.

**Inputs**:

```typescript
interface SkillContent {
  skillMd: string;
  references: string[];
  scripts: string[];
}
```

**Outputs**:

- Single concatenated string with separators

**Implementation**:

```typescript
function concatenateSkillContent(content: SkillContent): string {
  const parts = [
    content.skillMd,
    ...content.references.sort(), // Alphabetical order
    ...content.scripts.sort(), // Alphabetical order
  ];

  return parts.join('\n---\n'); // Separator to prevent accidental merging
}
```

**Example**:

```typescript
const content: SkillContent = {
  skillMd: 'Skill description',
  references: ['Ref B', 'Ref A'], // Unsorted
  scripts: ['Script 2', 'Script 1'], // Unsorted
};

const concatenated = concatenateSkillContent(content);
// Result:
// "Skill description\n---\nRef A\n---\nRef B\n---\nScript 1\n---\nScript 2"
```

**Key Decisions**:

- **Separator**: `\n---\n` prevents false matches (e.g., "fileA" + "fileB" vs "fileAfile" + "B")
- **Sorting**: Ensures deterministic order regardless of file system ordering
- **Skill.md first**: Always first element (before refs/scripts)

---

### `calculateCrc32(input: string): string`

**Purpose**: Calculate raw CRC32 hash of any string.

**Inputs**:

- `input`: String to hash

**Outputs**:

- 8-character lowercase hex string

**Implementation**:

```typescript
import CRC32 from 'crc-32';

function calculateCrc32(input: string): string {
  const hash = CRC32.str(input); // Returns signed 32-bit integer

  // Convert to unsigned hex string (8 characters, zero-padded)
  return (hash >>> 0).toString(16).padStart(8, '0');
}
```

**Examples**:

```typescript
calculateCrc32('hello world') → "0d4a1185"
calculateCrc32('') → "00000000"
calculateCrc32('a') → "e8b7be43"
```

**Edge Cases**:

- Empty string → `"00000000"`
- Unicode characters → Handled correctly (UTF-8 encoding)
- Large strings (>1MB) → May take >10ms, acceptable

---

## CRC32 Algorithm Details

### Why CRC32?

**Advantages**:

- Fast computation (<1ms for typical skill files)
- Deterministic (same input = same output)
- Low collision rate for small datasets
- 32-bit output (compact cache keys)

**Disadvantages**:

- Not cryptographically secure (not a concern for cache keys)
- Higher collision rate than MD5/SHA (acceptable for <10,000 skills)

**Collision Probability**:

- For 100 skills: ~0.0001% (1 in 1 million)
- For 1,000 skills: ~0.01% (1 in 10,000)
- For 10,000 skills: ~1% (1 in 100)

**Mitigation**: Include skill name in cache key (`{name}-{crc}.mmd`) to further reduce collisions.

---

### Unsigned Integer Conversion

CRC32 library returns **signed 32-bit integer** (-2,147,483,648 to 2,147,483,647).

We need **unsigned hex string** for filenames:

```typescript
const signed = CRC32.str('test'); // e.g., -123456789
const unsigned = signed >>> 0; // Zero-fill right shift → unsigned
const hex = unsigned.toString(16).padStart(8, '0');
```

**Example**:

- Signed: `-123456789`
- Unsigned: `4171510507`
- Hex: `f8a432bb`

---

## Determinism Requirements

### Ensuring Same Hash Across Platforms

**Challenge**: File system ordering differs across platforms.

**Solution**: Sort references/scripts before concatenation.

**Example**:

```typescript
// macOS might return: ['z.md', 'a.md']
// Linux might return: ['a.md', 'z.md']

// After sorting: Always ['a.md', 'z.md']
const sorted = content.references.sort();
```

### Handling Line Endings

**Challenge**: Windows uses CRLF (`\r\n`), Unix uses LF (`\n`).

**Solution**: Files are read as-is (no normalization). CRC32 will differ if line endings differ.

**Mitigation**: Not a concern because:

- Cache is per-machine (not shared across platforms)
- Skills edited on same platform maintain consistent line endings

---

## Error Handling

### Edge Cases

**1. Empty Skill Content**:

```typescript
const content: SkillContent = {
  skillMd: '',
  references: [],
  scripts: [],
};

const hash = calculateSkillCrc(content);
// Result: "00000000" (CRC32 of empty string)
```

**2. Missing Fields**:

```typescript
const content: SkillContent = {
  skillMd: 'Content',
  references: undefined, // Invalid
  scripts: [],
};

// Must throw error or handle gracefully
if (!content.references) {
  throw new DiagramError(
    DiagramErrorCode.CRC_CALCULATION_FAILED,
    'SkillContent.references is undefined'
  );
}
```

**3. Very Large Files** (>10MB):

```typescript
// CRC32 calculation may take >100ms
const startTime = Date.now();
const hash = calculateCrc32(largeString);
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn(`[CrcHasher] Slow CRC calculation: ${duration}ms`);
}
```

---

## Testing Requirements

### Unit Tests (`tests/unit/crcHasher.test.ts`)

**Test Cases**:

1. Same input → Same hash (determinism)
2. Different input → Different hash
3. Empty string → `"00000000"`
4. Known test vectors → Expected hashes
5. References sorted → Same hash regardless of input order
6. Scripts sorted → Same hash regardless of input order
7. Unicode characters → Handled correctly
8. Large input (1MB) → Completes within 100ms
9. Missing fields → Throws error or handles gracefully

**Known Test Vectors** (for regression testing):

```typescript
expect(calculateCrc32('hello world')).toBe('0d4a1185');
expect(calculateCrc32('')).toBe('00000000');
expect(calculateCrc32('a')).toBe('e8b7be43');
expect(calculateCrc32('The quick brown fox jumps over the lazy dog')).toBe('414fa339');
```

**Coverage Target**: >95% (critical for cache correctness)

---

### Property-Based Tests

Use `fast-check` library for property-based testing:

```typescript
import fc from 'fast-check';

test('Same input always produces same hash', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const hash1 = calculateCrc32(input);
      const hash2 = calculateCrc32(input);
      return hash1 === hash2;
    })
  );
});

test('Hash is always 8 hex characters', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const hash = calculateCrc32(input);
      return /^[0-9a-f]{8}$/.test(hash);
    })
  );
});
```

---

## Performance Benchmarks

| Input Size | Expected Time | Max Time |
| ---------- | ------------- | -------- |
| <1KB       | <1ms          | 5ms      |
| 1-10KB     | <5ms          | 10ms     |
| 10-100KB   | <10ms         | 50ms     |
| 100KB-1MB  | <50ms         | 100ms    |

**Measurement**:

```typescript
const startTime = performance.now();
const hash = calculateSkillCrc(content);
const duration = performance.now() - startTime;
console.log(`[CrcHasher] Calculated CRC in ${duration.toFixed(2)}ms`);
```

---

## Integration Points

**Called By**:

- `DiagramCache.readCache()` - Generate cache key for lookup
- `DiagramCache.writeCache()` - Generate cache key for write
- `DiagramStore.loadDiagram()` - Calculate CRC to check cache

**Calls**:

- `CRC32.str()` (from `crc-32` package)

---

## Example Usage

```typescript
import { calculateSkillCrc } from './crcHasher';

// 1. Read skill files
const skillContent: SkillContent = {
  skillMd: await readFile('~/.claude/skills/sdd/skill.md'),
  references: await Promise.all([
    readFile('~/.claude/skills/sdd/references/greenfield.md'),
    readFile('~/.claude/skills/sdd/references/brownfield.md'),
  ]),
  scripts: await Promise.all([readFile('~/.claude/skills/sdd/scripts/validate.sh')]),
};

// 2. Calculate CRC32 hash
const crcHash = calculateSkillCrc(skillContent);
// Result: "a3f4b2c1"

// 3. Generate cache key
const cacheKey = `sdd-${crcHash}.mmd`;
// Result: "sdd-a3f4b2c1.mmd"

// 4. Check cache
const cached = await readCache('sdd', crcHash);
if (cached) {
  console.log('Cache hit!');
} else {
  console.log('Cache miss, generating new diagram...');
}
```

---

**Contract Version**: 1.0  
**Last Updated**: 2025-11-14
