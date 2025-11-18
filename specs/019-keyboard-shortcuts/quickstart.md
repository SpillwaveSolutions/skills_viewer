# Quickstart Guide: Keyboard Shortcuts

**Feature**: 019-keyboard-shortcuts | **Date**: 2025-11-16 | **For**: Developers

## Overview

This guide helps developers set up, test, and debug keyboard shortcuts in Skill Debugger. Follow this guide to:

- Run keyboard shortcuts locally
- Test shortcuts on different platforms
- Debug keyboard event issues
- Verify accessibility compliance

---

## Prerequisites

Before working on keyboard shortcuts, ensure you have:

```bash
# Required tools
node --version    # Should be 18+
npm --version     # Should be 9+
rustc --version   # Should be 1.75+

# Install dependencies
npm install

# Verify Tauri is working
npm run tauri dev  # Should launch app
```

**Platform Testing Requirements**:

- macOS: For testing Cmd modifier key
- Windows or Linux VM: For testing Ctrl modifier key
- Screen reader: VoiceOver (macOS) or NVDA (Windows)

---

## Quick Start (5 Minutes)

### 1. Run Development Server

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Tauri in dev mode
npm run tauri dev
```

**Expected**: App launches, no console errors

### 2. Test Existing Shortcuts

Once app is running:

1. **Press Cmd+F (macOS) or Ctrl+F (Windows/Linux)**
   - ✅ Search field should focus
   - ✅ Existing search text should be selected

2. **Select any skill from the list**

3. **Press Cmd+2 (macOS) or Ctrl+2 (Windows/Linux)**
   - ✅ Details tab should activate

4. **Press Cmd+/ (macOS) or Ctrl+/ (Windows/Linux)**
   - ✅ Help overlay should appear
   - ✅ Press Escape to close

### 3. Check Console for Errors

Open Tauri DevTools (Right-click → Inspect Element):

```javascript
// Should NOT see these errors:
❌ "Uncaught TypeError: Cannot read property 'focus'"
❌ "Shortcut already registered"
❌ "Invalid key: undefined"

// Should see (if logging enabled):
✅ "Registered shortcut: search-focus"
✅ "Shortcut triggered: search-focus"
```

---

## Development Workflow

### File Structure

```text
src/
├── hooks/
│   ├── useKeyboardShortcuts.ts          # Main hook implementation
│   └── __tests__/
│       └── useKeyboardShortcuts.test.ts # Hook unit tests
├── components/
│   ├── KeyboardShortcutsHelp.tsx        # Help overlay component
│   ├── SearchBar.tsx                    # Enhanced with Cmd+F
│   ├── SkillList.tsx                    # Enhanced with arrow keys
│   └── SkillViewer.tsx                  # Enhanced with Cmd+1-6
├── utils/
│   ├── keyboardUtils.ts                 # Platform detection, helpers
│   └── __tests__/
│       └── keyboardUtils.test.ts
└── App.tsx                              # Global keyboard listener

tests/
└── e2e/
    └── keyboard-shortcuts.spec.ts       # Playwright E2E tests
```

### Making Changes

**1. Modify Hook Implementation**:

```bash
# Edit hook
code src/hooks/useKeyboardShortcuts.ts

# Run unit tests (watch mode)
npm test -- --watch useKeyboardShortcuts

# Expected output:
# ✓ should register shortcut successfully (12ms)
# ✓ should trigger handler on Cmd+F (macOS) (8ms)
# ✓ should trigger handler on Ctrl+F (Windows) (7ms)
```

**2. Add New Shortcut**:

```typescript
// src/App.tsx
registerShortcut({
  id: 'new-shortcut',
  key: 'n',
  modifiers: ['ctrl', 'cmd', 'shift'],
  handler: () => console.log('New shortcut triggered!'),
  description: 'Trigger new action',
  category: 'Navigation',
});
```

**3. Test in Running App**:

```bash
# App auto-reloads (Vite HMR)
# Press Cmd+Shift+N (macOS) or Ctrl+Shift+N (Windows)
# Check console for "New shortcut triggered!"
```

---

## Testing Guide

### Unit Tests (Vitest)

**Run all tests**:

```bash
npm test                          # Run once
npm test -- --watch              # Watch mode
npm test -- --coverage           # With coverage
npm test -- useKeyboardShortcuts # Specific file
```

**Test keyboard events**:

```typescript
// src/hooks/__tests__/useKeyboardShortcuts.test.ts
import { fireEvent } from '@testing-library/react';

it('should trigger handler on Cmd+F', () => {
  const handler = vi.fn();

  // Register shortcut
  result.current.registerShortcut({
    id: 'test',
    key: 'f',
    modifiers: ['ctrl', 'cmd'],
    handler,
    description: 'Test',
    category: 'Search',
  });

  // Simulate Cmd+F on macOS
  fireEvent.keyDown(window, {
    key: 'f',
    metaKey: true, // Cmd key
    ctrlKey: false,
  });

  expect(handler).toHaveBeenCalledTimes(1);
});
```

**Expected Coverage**:

- `useKeyboardShortcuts.ts`: 100%
- `keyboardUtils.ts`: 100%
- `KeyboardShortcutsHelp.tsx`: >90%

### Integration Tests

**Run integration tests**:

```bash
npm test -- --grep "integration"
```

**Example test**:

```typescript
// tests/integration/keyboard-shortcuts.test.tsx
it('should focus search and select text on Cmd/Ctrl+F', () => {
  render(<App />);

  const searchInput = screen.getByRole('searchbox');
  searchInput.value = 'react';

  // Simulate Cmd+F
  fireEvent.keyDown(window, {
    key: 'f',
    metaKey: true
  });

  expect(document.activeElement).toBe(searchInput);
  expect(searchInput.selectionStart).toBe(0);
  expect(searchInput.selectionEnd).toBe(5);
});
```

### E2E Tests (Playwright)

**Run E2E tests**:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- --grep "search focus"
```

**Example E2E test**:

```typescript
// tests/e2e/keyboard-shortcuts.spec.ts
import { test, expect } from '@playwright/test';

test('Cmd+F focuses search field', async ({ page }) => {
  await page.goto('http://localhost:1420');

  // Press Cmd+F (or Ctrl+F on Windows)
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+F`);

  // Verify focus
  const searchInput = page.locator('[role="searchbox"]');
  await expect(searchInput).toBeFocused();
});
```

### Accessibility Tests

**Run axe DevTools scan**:

```bash
npm test -- --grep "accessibility"
```

**Example accessibility test**:

```typescript
// src/components/__tests__/KeyboardShortcutsHelp.a11y.test.tsx
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(
    <KeyboardShortcutsHelp isOpen={true} onClose={() => {}} />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual screen reader testing**:

**macOS (VoiceOver)**:

```bash
# Enable VoiceOver
Cmd+F5

# Test flow:
# 1. Press Cmd+F → Should announce "Search field, edit text"
# 2. Press Escape → Should announce "Search cleared"
# 3. Press Cmd+/ → Should announce "Keyboard Shortcuts, dialog"
# 4. Press Escape → Should announce "Dialog closed"
```

**Windows (NVDA)**:

```bash
# Start NVDA
Ctrl+Alt+N

# Test flow:
# 1. Press Ctrl+F → Should announce "Search field, edit text"
# 2. Press Escape → Should announce "Search cleared"
# 3. Press Ctrl+/ → Should announce "Keyboard Shortcuts, dialog"
# 4. Press Escape → Should announce "Dialog closed"
```

---

## Cross-Platform Testing

### Testing on macOS

**Modifier key**: Cmd (⌘)

```bash
# Run app
npm run tauri dev

# Test shortcuts:
Cmd+F        # Focus search
Cmd+1        # Skills tab
Cmd+2        # Details tab (skill must be selected)
Cmd+/        # Help overlay
Escape       # Clear search or close overlay
```

**Expected behavior**:

- ✅ Cmd key triggers shortcuts (NOT Ctrl)
- ✅ Help overlay shows "Cmd+F" (not "Ctrl+F")
- ✅ No conflicts with browser shortcuts (prevented by preventDefault)

### Testing on Windows/Linux

**Modifier key**: Ctrl

**Option 1: Use VM**:

```bash
# Install Windows VM (Parallels, VirtualBox, or cloud)
# Install Node.js, Rust, and Tauri prerequisites
# Clone repo and run:
npm install
npm run tauri dev

# Test shortcuts:
Ctrl+F       # Focus search
Ctrl+1       # Skills tab
Ctrl+2       # Details tab (skill must be selected)
Ctrl+/       # Help overlay
Escape       # Clear search or close overlay
```

**Option 2: Mock platform in tests**:

```typescript
// tests/utils/mockPlatform.ts
import { vi } from 'vitest';

export function mockPlatform(platform: 'macos' | 'windows' | 'linux') {
  vi.mock('@/utils/keyboardUtils', () => ({
    getPlatform: vi.fn().mockResolvedValue(platform),
  }));
}

// Usage:
describe('Windows shortcuts', () => {
  beforeEach(() => mockPlatform('windows'));

  it('should work with Ctrl+F', () => {
    fireEvent.keyDown(window, {
      key: 'f',
      ctrlKey: true, // Ctrl on Windows
      metaKey: false,
    });
    // assertions...
  });
});
```

### Platform Detection Debugging

**Check detected platform**:

```typescript
// src/utils/keyboardUtils.ts
export async function getPlatform(): Promise<PlatformInfo> {
  const platform = await detectPlatform();
  console.log(`Detected platform: ${platform}`);
  return platform;
}
```

**Manual override (for testing)**:

```typescript
// src/App.tsx
const [forcePlatform, setForcePlatform] = useState<PlatformInfo | null>(null);

// In DevTools console:
window.__forcePlatform = 'windows'; // Test Windows behavior on macOS
```

---

## Common Issues & Solutions

### Issue 1: Shortcuts Not Triggering

**Symptoms**:

- Press Cmd+F, nothing happens
- No console errors

**Debug steps**:

```typescript
// 1. Add logging to hook
const handleKeyDown = (event: KeyboardEvent) => {
  console.log('Key pressed:', event.key, 'Modifiers:', {
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
  });

  // Check if shortcut matches...
};

// 2. Verify shortcut is registered
console.log('Registered shortcuts:', getAllShortcuts());

// 3. Check condition (if any)
const shortcut = shortcutRegistry.get('search-focus');
if (shortcut?.condition) {
  console.log('Condition result:', shortcut.condition());
}
```

**Common causes**:

- Shortcut not registered (check `getAllShortcuts()`)
- Condition returns false (check `condition()` return value)
- Wrong modifier key (Cmd on Windows, Ctrl on macOS)
- Event listener not attached (check `window.addEventListener`)

### Issue 2: Browser Shortcut Conflict

**Symptoms**:

- Cmd+F opens browser search instead of app search
- Tab shortcuts navigate browser history

**Solution**:

```typescript
handler: (event) => {
  event.preventDefault(); // ← MUST call this!
  event.stopPropagation();
  // ... rest of handler
};
```

**Verify**:

```bash
# In DevTools console, should NOT see browser default behavior:
❌ Browser search overlay opens
❌ Browser tab changes
✅ App search field focuses
✅ App tab changes
```

### Issue 3: Focus Not Returning After Dialog

**Symptoms**:

- Open help overlay (Cmd+/)
- Press Escape to close
- Focus lost (nowhere to go with Tab key)

**Solution**:

```typescript
// src/components/KeyboardShortcutsHelp.tsx
const previousFocusRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    // Save focus before opening
    previousFocusRef.current = document.activeElement as HTMLElement;
  } else {
    // Restore focus after closing
    previousFocusRef.current?.focus();
  }
}, [isOpen]);
```

**Verify**:

```bash
# Manual test:
# 1. Focus search field (click or Cmd+F)
# 2. Press Cmd+/ (help opens)
# 3. Press Escape (help closes)
# 4. Press Tab
# ✅ Focus should be back on search field
```

### Issue 4: Screen Reader Not Announcing

**Symptoms**:

- VoiceOver/NVDA silent when navigating with arrows
- No announcement when tab changes

**Solution**:

```tsx
// Add AriaLiveAnnouncer component
const [announcement, setAnnouncement] = useState('');

<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>;

// Update on navigation
const handleArrowDown = () => {
  const newIndex = currentIndex + 1;
  setCurrentIndex(newIndex);
  setAnnouncement(`${skills[newIndex].name}, ${newIndex + 1} of ${skills.length}`);
};
```

**Verify**:

```bash
# macOS: Enable VoiceOver (Cmd+F5)
# Windows: Start NVDA (Ctrl+Alt+N)

# Press arrow keys in skill list
# ✅ Should hear: "React Skill, 1 of 15"
# ✅ Should hear: "Vue Skill, 2 of 15"
```

### Issue 5: Tests Failing on CI

**Symptoms**:

- Tests pass locally
- Fail on GitHub Actions

**Common causes**:

```yaml
# .github/workflows/test.yml
# 1. Missing Playwright browsers
- name: Install Playwright
  run: npx playwright install --with-deps

# 2. Wrong platform detection (Linux on CI)
- name: Run tests
  run: npm test
  env:
    FORCE_PLATFORM: linux # Override platform detection
```

**Debug in CI**:

```typescript
// Add debug logging (remove after fixing)
console.log('Platform:', await getPlatform());
console.log('User agent:', navigator.userAgent);
console.log('User agent data:', navigator.userAgentData);
```

---

## Performance Profiling

### Measure Keyboard Response Time

```typescript
// src/hooks/useKeyboardShortcuts.ts
const handleKeyDown = (event: KeyboardEvent) => {
  const startTime = performance.now();

  // ... shortcut matching logic ...

  const endTime = performance.now();
  console.log(`Keyboard event processed in ${endTime - startTime}ms`);
  // Target: <10ms
};
```

**Expected results**:

- Typical: 0.5-2ms
- Max acceptable: 10ms
- If >10ms: Optimize shortcut lookup (use Map instead of array iteration)

### Measure Focus Time

```typescript
// src/components/SearchBar.tsx
const handleFocus = () => {
  const focusTime = performance.now();
  console.log(`Focus time: ${focusTime - keyPressTime}ms`);
  // Target: <100ms
};
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Keyboard Shortcuts

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] App runs without errors (`npm run tauri dev`)
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] No console errors in Tauri DevTools
- [ ] Shortcuts registered (`console.log(getAllShortcuts())`)
- [ ] Correct modifier key for platform (Cmd on macOS, Ctrl on Windows)
- [ ] `preventDefault()` called in handlers
- [ ] Focus indicators visible (WCAG 2.1 AA)
- [ ] Screen reader announces navigation (manual test)

---

## Additional Resources

**Documentation**:

- [Keyboard Event Reference](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [WAI-ARIA Keyboard Patterns](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Vitest Testing Library](https://vitest.dev/guide/)
- [Playwright Keyboard API](https://playwright.dev/docs/api/class-keyboard)

**Spec Documents** (this feature):

- [spec.md](./spec.md) - User stories and requirements
- [plan.md](./plan.md) - Technical implementation plan
- [research.md](./research.md) - Technology decisions
- [data-model.md](./data-model.md) - Data structures and state machines
- [contracts/](./contracts/) - TypeScript interface contracts

**Project Docs**:

- [CLAUDE.md](../CLAUDE.md) - Project guidelines
- [.specify/memory/constitution.md](../.specify/memory/constitution.md) - Project principles

---

## Next Steps

1. ✅ Read this quickstart guide
2. ✅ Set up development environment
3. ✅ Run app and test existing shortcuts
4. ⏭️ Proceed to implementation following [tasks.md](./tasks.md)
5. ⏭️ Write tests BEFORE implementation (TDD)
6. ⏭️ Verify accessibility with screen readers

**Status**: ✅ Quickstart Complete | ⏭️ Ready for Implementation
