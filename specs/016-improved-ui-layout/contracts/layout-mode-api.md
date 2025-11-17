# API Contract: Layout Mode

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Define the API for layout mode state management and persistence

## Overview

The Layout Mode API manages the application's layout configuration (standard vs compact mode) and persists user preferences to localStorage. It provides a Zustand store for reactive state updates and hooks for component integration.

## Store API

### `useLayoutStore`

**Type**: Zustand store

**State Shape**:

```typescript
interface LayoutState {
  mode: LayoutMode; // 'standard' | 'compact'
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
}
```

**Methods**:

#### `setMode(mode: LayoutMode): void`

Sets the layout mode and persists to localStorage.

**Parameters**:

- `mode`: `'standard'` | `'compact'`

**Side Effects**:

- Updates store state
- Writes to localStorage (key: 'layoutMode')
- Triggers re-render of dependent components

**Example**:

```typescript
const { setMode } = useLayoutStore();
setMode('compact'); // Switch to compact mode
```

**Referenced Requirements**:

- FR-024: Provide compact layout mode toggle
- FR-028: Persist layout mode preference in localStorage

---

#### `toggleMode(): void`

Toggles between standard and compact mode.

**Side Effects**:

- Reads current mode from store
- Calls `setMode()` with opposite mode
- Persists new mode to localStorage

**Example**:

```typescript
const { toggleMode } = useLayoutStore();
toggleMode(); // standard → compact or compact → standard
```

**Referenced Requirements**:

- FR-024: Provide compact layout mode toggle

---

## Hook API

### `useLayoutMode`

**Type**: React hook

**Purpose**: Encapsulates layout mode logic with localStorage restoration

**Returns**:

```typescript
{
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
  isCompact: boolean;
  isStandard: boolean;
}
```

**Computed Properties**:

- `isCompact`: `mode === 'compact'`
- `isStandard`: `mode === 'standard'`

**Behavior**:

- Restores mode from localStorage on first mount
- Syncs store state with localStorage
- Provides convenience boolean flags for conditional rendering

**Example**:

```typescript
function SkillHeader() {
  const { mode, isCompact, toggleMode } = useLayoutMode();

  return (
    <header>
      {isCompact ? <InlineStats /> : <Description />}
      <button onClick={toggleMode}>Toggle Mode</button>
    </header>
  );
}
```

**Referenced Requirements**:

- FR-029: Restore layout mode preference on application restart

---

## LocalStorage Contract

### Key

`layoutMode`

### Value Format

**Type**: JSON string

**Schema**:

```typescript
type StoredLayoutMode = 'standard' | 'compact';
```

**Example**:

```json
"compact"
```

### Storage Operations

#### Write

```typescript
localStorage.setItem('layoutMode', JSON.stringify(mode));
```

**Error Handling**:

- Catches QuotaExceededError (quota limits)
- Catches SecurityError (privacy mode)
- Logs error but does not throw (graceful degradation)

#### Read

```typescript
const mode = JSON.parse(localStorage.getItem('layoutMode') || '"standard"');
```

**Default Value**: `'standard'` if key not found

**Error Handling**:

- Catches SyntaxError (invalid JSON)
- Returns default value on error

**Referenced Requirements**:

- FR-028: Persist layout mode preference in localStorage
- FR-029: Restore layout mode preference on application restart

---

## Component Integration

### SkillHeader Component

**Usage**:

```typescript
import { useLayoutMode } from '../hooks/useLayoutMode';

export const SkillHeader: React.FC<{ skill: Skill }> = ({ skill }) => {
  const { mode, isCompact } = useLayoutMode();

  return (
    <header className="px-6 py-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold truncate">{skill.name}</h1>
        <span className="text-sm text-gray-600">{skill.location}</span>
      </div>

      {isCompact ? (
        <InlineStats skill={skill} />
      ) : (
        <Description text={skill.description} />
      )}
    </header>
  );
};
```

**Referenced Requirements**:

- FR-025: Show inline stats in header when compact mode enabled
- FR-026: Hide description from header in compact mode

---

## Performance Requirements

| Operation             | Target        | Measurement             |
| --------------------- | ------------- | ----------------------- |
| `setMode()` execution | <5ms          | `performance.now()`     |
| localStorage write    | <10ms         | `performance.now()`     |
| localStorage read     | <10ms         | `performance.now()`     |
| Store state update    | <2ms          | React DevTools Profiler |
| Component re-render   | <16ms (60fps) | React DevTools Profiler |

**Referenced Requirements**:

- Principle V: Performance and Efficiency

---

## Error Handling

### QuotaExceededError

**Scenario**: localStorage quota exceeded (rare, ~5-10MB limit)

**Handling**:

```typescript
try {
  localStorage.setItem('layoutMode', JSON.stringify(mode));
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    console.warn('localStorage quota exceeded, mode will not persist');
  }
}
```

**User Impact**: Mode changes work during session but do not persist across restarts

---

### SecurityError

**Scenario**: localStorage access blocked (privacy mode, cross-origin)

**Handling**:

```typescript
try {
  localStorage.setItem('layoutMode', JSON.stringify(mode));
} catch (error) {
  if (error instanceof DOMException && error.name === 'SecurityError') {
    console.warn('localStorage access denied, mode will not persist');
  }
}
```

**User Impact**: Same as QuotaExceededError (ephemeral mode only)

---

### Invalid JSON in localStorage

**Scenario**: localStorage contains corrupted data

**Handling**:

```typescript
try {
  const stored = localStorage.getItem('layoutMode');
  const mode = stored ? JSON.parse(stored) : 'standard';
  return mode === 'compact' ? 'compact' : 'standard'; // Validate
} catch {
  return 'standard'; // Default on error
}
```

**User Impact**: Falls back to standard mode (safe default)

---

## Test Requirements

### Unit Tests

**Store Tests** (`layoutStore.test.ts`):

- ✅ Initial state is 'standard'
- ✅ `setMode()` updates state
- ✅ `setMode()` writes to localStorage
- ✅ `toggleMode()` switches modes correctly
- ✅ Store initialization reads from localStorage

**Hook Tests** (`useLayoutMode.test.ts`):

- ✅ Hook returns store state
- ✅ Hook restores mode from localStorage on mount
- ✅ Hook provides computed boolean flags (isCompact, isStandard)

**LocalStorage Tests** (`localStorage.test.ts`):

- ✅ Write valid mode to localStorage
- ✅ Read valid mode from localStorage
- ✅ Handle QuotaExceededError gracefully
- ✅ Handle SecurityError gracefully
- ✅ Handle invalid JSON gracefully (return default)

### Integration Tests

**Layout Mode Toggle** (`LayoutModeToggle.test.tsx`):

- ✅ Clicking toggle button switches mode
- ✅ Header updates to show inline stats in compact mode
- ✅ Header updates to show description in standard mode
- ✅ Mode persists to localStorage on toggle

### E2E Tests

**Compact Mode Persistence** (`compact-mode.spec.ts`):

- ✅ Toggle to compact mode, reload app, verify mode restored
- ✅ Toggle to standard mode, reload app, verify mode restored
- ✅ Default to standard mode on first load (no localStorage entry)

**Referenced Requirements**:

- Principle VII: >80% test coverage required

---

## Migration Strategy

### v0.1.0 → v0.2.0 (Initial Implementation)

No existing layout mode - this is a new feature.

**Steps**:

1. Create `layoutStore.ts` with initial state 'standard'
2. Add localStorage integration to store
3. Create `useLayoutMode.ts` hook
4. Update SkillHeader to use hook
5. Add toggle button in UI (location TBD during tasks)

**Backward Compatibility**: N/A (new feature)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
