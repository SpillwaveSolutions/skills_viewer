# API Contract: Diagram Cache Service

**Module**: `src/services/diagramCache.ts`  
**Purpose**: Manage cached Mermaid diagrams in file system  
**Dependencies**: Tauri commands (`invoke`), `crcHasher.ts`

## Interface

```typescript
export interface IDiagramCacheService {
  /**
   * Get platform-agnostic cache directory path
   * @returns Absolute path to cache directory
   * @example "/Users/name/.cache/skill-debugger/diagrams/"
   */
  getCacheDir(): Promise<string>;

  /**
   * Read diagram from cache
   * @param skillName - Name of skill
   * @param crcHash - CRC32 hash of skill content (8 hex chars)
   * @returns DiagramCache object or null if not found
   */
  readCache(skillName: string, crcHash: string): Promise<DiagramCache | null>;

  /**
   * Write diagram to cache
   * @param cache - DiagramCache object to write
   * @returns void
   * @throws DiagramError if write fails
   */
  writeCache(cache: DiagramCache): Promise<void>;

  /**
   * Delete specific cache entry
   * @param skillName - Name of skill
   * @param crcHash - CRC32 hash to delete
   * @returns void (no-op if file doesn't exist)
   */
  deleteCache(skillName: string, crcHash: string): Promise<void>;

  /**
   * Clear all cached diagrams
   * @returns Number of files deleted
   */
  clearAll(): Promise<number>;

  /**
   * Get cache metadata (size, count, oldest entry)
   * @returns CacheMetadata object
   */
  getMetadata(): Promise<CacheMetadata>;

  /**
   * Evict oldest entries to stay under size limit
   * @param maxSizeBytes - Maximum cache size (default: 100MB)
   * @returns Number of files evicted
   */
  evictOldest(maxSizeBytes: number): Promise<number>;
}
```

## Behavior Contract

### `getCacheDir(): Promise<string>`

**Purpose**: Get platform-agnostic cache directory path.

**Implementation**:

```typescript
async function getCacheDir(): Promise<string> {
  return await invoke<string>('get_cache_dir');
}
```

**Returns**:

- macOS: `~/Library/Caches/com.skilldebuggr.app/diagrams/`
- Linux: `~/.cache/skill-debugger/diagrams/`
- Windows: `C:\Users\{user}\AppData\Local\com.skilldebuggr.app\cache\diagrams\`

**Side Effects**:

- Creates cache directory if it doesn't exist
- Logs directory path to console

**Error Handling**:

- Throws `DiagramError` if cache directory cannot be created

---

### `readCache(skillName: string, crcHash: string): Promise<DiagramCache | null>`

**Purpose**: Read cached diagram from file system.

**Inputs**:

- `skillName`: Skill name (e.g., "sdd")
- `crcHash`: CRC32 hash (8 hex chars, e.g., "a3f4b2c1")

**Outputs**:

- `DiagramCache` object if file exists
- `null` if file not found

**Implementation**:

```typescript
async function readCache(skillName: string, crcHash: string): Promise<DiagramCache | null> {
  const cacheDir = await getCacheDir();
  const cacheKey = `${skillName}-${crcHash}.mmd`;
  const cachePath = `${cacheDir}/${cacheKey}`;

  try {
    const content = await invoke<string>('read_cache_file', { path: cachePath });
    const stat = await invoke<{ size: number; modified: number }>('get_file_stat', {
      path: cachePath,
    });

    return {
      skillName,
      crcHash,
      diagramSource: content,
      timestamp: stat.modified,
      sizeBytes: stat.size,
      cachePath,
    };
  } catch (error) {
    // File not found or read error
    return null;
  }
}
```

**Performance**:

- Must complete in <100ms (file I/O on local disk)
- Logs cache hits/misses to console

---

### `writeCache(cache: DiagramCache): Promise<void>`

**Purpose**: Write diagram to cache file.

**Inputs**:

```typescript
interface DiagramCache {
  skillName: string;
  crcHash: string;
  diagramSource: string;
  timestamp: number;
  sizeBytes: number;
  cachePath: string;
}
```

**Implementation**:

```typescript
async function writeCache(cache: DiagramCache): Promise<void> {
  const cacheDir = await getCacheDir();
  const cacheKey = `${cache.skillName}-${cache.crcHash}.mmd`;
  const cachePath = `${cacheDir}/${cacheKey}`;

  await invoke<void>('write_cache_file', {
    path: cachePath,
    content: cache.diagramSource,
  });

  console.log(`[DiagramCache] Wrote cache: ${cacheKey} (${cache.sizeBytes} bytes)`);

  // Check if cache exceeds 100MB, evict if needed
  await evictOldest(100 * 1024 * 1024);
}
```

**Side Effects**:

- Creates file in cache directory
- Triggers eviction if cache exceeds 100MB
- Logs write operation to console

**Error Handling**:

- Throws `DiagramError` if write fails
- Logs error to console

---

### `deleteCache(skillName: string, crcHash: string): Promise<void>`

**Purpose**: Delete specific cache entry (e.g., when skill content changes).

**Inputs**:

- `skillName`: Skill name
- `crcHash`: CRC32 hash to delete

**Implementation**:

```typescript
async function deleteCache(skillName: string, crcHash: string): Promise<void> {
  const cacheDir = await getCacheDir();
  const cacheKey = `${skillName}-${crcHash}.mmd`;
  const cachePath = `${cacheDir}/${cacheKey}`;

  try {
    await invoke<void>('delete_cache_file', { path: cachePath });
    console.log(`[DiagramCache] Deleted cache: ${cacheKey}`);
  } catch {
    // File doesn't exist, no-op
  }
}
```

**Behavior**:

- No-op if file doesn't exist (idempotent)
- Logs deletion to console

---

### `clearAll(): Promise<number>`

**Purpose**: Clear all cached diagrams (for "Clear Cache" button).

**Implementation**:

```typescript
async function clearAll(): Promise<number> {
  const cacheDir = await getCacheDir();
  const files = await invoke<string[]>('list_cache_files', { dir: cacheDir });

  let deletedCount = 0;
  for (const filePath of files) {
    try {
      await invoke<void>('delete_cache_file', { path: filePath });
      deletedCount++;
    } catch {
      console.error(`[DiagramCache] Failed to delete: ${filePath}`);
    }
  }

  console.log(`[DiagramCache] Cleared cache: ${deletedCount} files deleted`);
  return deletedCount;
}
```

**Returns**:

- Number of files successfully deleted

**Side Effects**:

- Deletes all `.mmd` files in cache directory
- Logs operation to console

---

### `getMetadata(): Promise<CacheMetadata>`

**Purpose**: Get cache statistics for UI display and eviction logic.

**Outputs**:

```typescript
interface CacheMetadata {
  totalSizeBytes: number;
  entryCount: number;
  oldestEntryTimestamp: number;
  entries: DiagramCache[];
}
```

**Implementation**:

```typescript
async function getMetadata(): Promise<CacheMetadata> {
  const cacheDir = await getCacheDir();
  return await invoke<CacheMetadata>('get_cache_metadata', { dir: cacheDir });
}
```

**Returns**:

```typescript
{
  totalSizeBytes: 52428800,      // 50MB
  entryCount: 12,
  oldestEntryTimestamp: 1700000000,
  entries: [
    { skillName: 'sdd', crcHash: 'a3f4b2c1', ... },
    ...
  ]
}
```

---

### `evictOldest(maxSizeBytes: number): Promise<number>`

**Purpose**: Enforce 100MB cache size limit using LRU (Least Recently Used) eviction.

**Inputs**:

- `maxSizeBytes`: Maximum cache size (default: 100MB = 104857600 bytes)

**Returns**:

- Number of files evicted

**Implementation**:

```typescript
async function evictOldest(maxSizeBytes: number = 100 * 1024 * 1024): Promise<number> {
  const metadata = await getMetadata();

  if (metadata.totalSizeBytes <= maxSizeBytes) {
    return 0; // No eviction needed
  }

  // Sort entries by timestamp (oldest first)
  const sortedEntries = [...metadata.entries].sort((a, b) => a.timestamp - b.timestamp);

  let currentSize = metadata.totalSizeBytes;
  let evictedCount = 0;

  for (const entry of sortedEntries) {
    if (currentSize <= maxSizeBytes) break;

    await deleteCache(entry.skillName, entry.crcHash);
    currentSize -= entry.sizeBytes;
    evictedCount++;

    console.log(
      `[DiagramCache] Evicted: ${entry.skillName}-${entry.crcHash} (${entry.sizeBytes} bytes)`
    );
  }

  console.log(
    `[DiagramCache] Eviction complete: ${evictedCount} files deleted, ${currentSize} bytes remaining`
  );
  return evictedCount;
}
```

**LRU Policy**:

- Sort by timestamp (oldest first)
- Delete oldest entries until size <= maxSizeBytes
- Stop when size limit satisfied

**Performance**:

- Must complete in <500ms (file I/O for deletion)

---

## Tauri Backend Commands

### Required Rust Commands

```rust
// src-tauri/src/commands/cache_manager.rs

#[tauri::command]
pub fn get_cache_dir(app_handle: AppHandle) -> Result<String, String>;

#[tauri::command]
pub fn read_cache_file(path: String) -> Result<String, String>;

#[tauri::command]
pub fn write_cache_file(path: String, content: String) -> Result<(), String>;

#[tauri::command]
pub fn delete_cache_file(path: String) -> Result<(), String>;

#[tauri::command]
pub fn list_cache_files(dir: String) -> Result<Vec<String>, String>;

#[tauri::command]
pub fn get_cache_metadata(dir: String) -> Result<CacheMetadata, String>;

#[tauri::command]
pub fn get_file_stat(path: String) -> Result<FileStat, String>;
```

**Command Registration** (in `main.rs`):

```rust
.invoke_handler(tauri::generate_handler![
  commands::cache_manager::get_cache_dir,
  commands::cache_manager::read_cache_file,
  commands::cache_manager::write_cache_file,
  commands::cache_manager::delete_cache_file,
  commands::cache_manager::list_cache_files,
  commands::cache_manager::get_cache_metadata,
  commands::cache_manager::get_file_stat,
])
```

---

## Cache File Naming Convention

**Format**: `{skill_name}-{crc_hash}.mmd`

**Examples**:

- `sdd-a3f4b2c1.mmd`
- `pdf-12345678.mmd`
- `notion-uploader-downloader-deadbeef.mmd`

**Rules**:

- Skill name: Lowercase, hyphens allowed
- CRC hash: Exactly 8 hex characters (0-9, a-f)
- Extension: `.mmd` (Mermaid)

---

## Error Handling

### Error Types

**1. Cache Directory Not Writable**:

```typescript
try {
  await writeCache(cache);
} catch (error) {
  console.error('[DiagramCache] Cache directory not writable, falling back to in-memory');
  // Fall back to in-memory caching for session
}
```

**2. Disk Space Full**:

```typescript
try {
  await writeCache(cache);
} catch (error) {
  if (error.message.includes('ENOSPC')) {
    console.error('[DiagramCache] Disk full, evicting all cache entries');
    await clearAll();
  }
}
```

**3. File Permissions Error**:

```typescript
try {
  await readCache(skillName, crcHash);
} catch (error) {
  console.error('[DiagramCache] Permission denied, skipping cache');
  return null;
}
```

---

## Testing Requirements

### Unit Tests (`tests/unit/diagramCache.test.ts`)

**Test Cases**:

1. `getCacheDir()` → Returns platform-specific path
2. `readCache()` → Returns DiagramCache object for existing file
3. `readCache()` → Returns null for missing file
4. `writeCache()` → Creates cache file successfully
5. `deleteCache()` → Deletes file successfully
6. `deleteCache()` → No-op for missing file
7. `clearAll()` → Deletes all cache files
8. `getMetadata()` → Returns correct size/count/oldest
9. `evictOldest()` → Deletes oldest entries when size exceeded
10. `evictOldest()` → No-op when size under limit

**Mock Strategy**:

- Mock Tauri `invoke()` calls to avoid file system operations
- Use in-memory file system simulator

**Coverage Target**: >90%

---

## Performance Benchmarks

| Operation               | Expected Time | Max Time |
| ----------------------- | ------------- | -------- |
| getCacheDir()           | <10ms         | 50ms     |
| readCache()             | <50ms         | 100ms    |
| writeCache()            | <100ms        | 200ms    |
| deleteCache()           | <50ms         | 100ms    |
| clearAll() (10 files)   | <200ms        | 500ms    |
| getMetadata()           | <100ms        | 200ms    |
| evictOldest() (5 files) | <300ms        | 500ms    |

---

## Integration Points

**Called By**:

- `DiagramStore.loadDiagram()` - Read cache
- `DiagramStore.generateDiagram()` - Write cache
- `DiagramToolbar.handleClearCache()` - Clear all

**Calls**:

- Tauri commands (`invoke`)
- `crcHasher.calculateSkillCrc()` (for cache key generation)

---

**Contract Version**: 1.0  
**Last Updated**: 2025-11-14
