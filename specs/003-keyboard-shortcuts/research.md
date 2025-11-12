# Phase 0: Research - Keyboard Shortcuts for Power Users

**Feature**: 003-keyboard-shortcuts
**Date**: 2025-11-10
**Status**: MINIMAL RESEARCH REQUIRED

## Research Scope

**Specification Status**: ✅ COMPLETE
- Zero "NEEDS CLARIFICATION" markers in spec.md
- All functional requirements unambiguous
- All acceptance scenarios well-defined
- Industry-standard patterns used throughout

**Research Approach**: Validate existing implementation patterns in codebase and confirm technology stack capabilities.

---

## 1. Existing Codebase Patterns

### 1.1 Component Structure
**Research Question**: What components exist that need keyboard enhancement?

**Findings**:
- `src/components/SkillList.tsx` - Needs arrow key navigation (US3)
- `src/components/SearchBar.tsx` - Needs Cmd/Ctrl+F focus handler (US1)
- `src/components/TabSystem.tsx` - Needs Cmd/Ctrl+1-6 shortcuts (US2)

**Decision**: Enhance existing components rather than creating wrappers. This maintains consistency with current architecture.

### 1.2 State Management
**Research Question**: How is application state currently managed?

**Findings**:
- Zustand 5.0.8 already in use (from package.json)
- Store structure in `src/stores/`
- Ephemeral keyboard state fits Zustand's design

**Decision**: Create `src/stores/keyboardStore.ts` to manage:
- Current focus state
- Highlighted item in list (for arrow keys)
- Help modal visibility
- Platform modifier key (Cmd vs Ctrl)

### 1.3 Testing Infrastructure
**Research Question**: What testing tools are available?

**Findings**:
- Vitest configured (from constitution)
- Playwright available for E2E
- @testing-library/react for component tests
- Existing test structure: `tests/unit/`, `tests/e2e/`, `tests/rust/`

**Decision**: Follow existing test organization. TDD approach with >80% coverage target.

---

## 2. Technology Stack Validation

### 2.1 React Keyboard Events
**Research Question**: Can React handle all required keyboard events?

**Findings**:
- React SyntheticEvent supports `onKeyDown`, `onKeyUp`, `onKeyPress`
- `event.preventDefault()` prevents browser defaults (e.g., Cmd/Ctrl+F search)
- `event.key`, `event.code`, `event.metaKey`, `event.ctrlKey` provide full control

**Decision**: Use React's keyboard event system. No additional libraries needed.

**Code Pattern**:
```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifier = isMac ? event.metaKey : event.ctrlKey;

  if (modifier && event.key === 'f') {
    event.preventDefault();
    // Focus search
  }
};
```

### 2.2 Focus Management
**Research Question**: How to programmatically manage focus in React?

**Findings**:
- React refs (`useRef<HTMLInputElement>`) for direct DOM access
- `.focus()` and `.blur()` methods available
- `document.activeElement` to track current focus

**Decision**: Use React refs for focus targets, useEffect to respond to keyboard state changes.

**Code Pattern**:
```typescript
const searchInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (shouldFocusSearch) {
    searchInputRef.current?.focus();
    searchInputRef.current?.select(); // Select existing text
  }
}, [shouldFocusSearch]);
```

### 2.3 Platform Detection
**Research Question**: How to detect macOS vs Windows/Linux for modifier keys?

**Findings**:
- `navigator.platform` provides OS info
- Tauri may provide `platform` via Rust backend (optional)
- Detection needed for: modifier key logic + help modal display text

**Decision**: Create `usePlatformModifier` hook for reusable platform logic.

**Code Pattern**:
```typescript
const usePlatformModifier = () => {
  const isMac = useMemo(
    () => navigator.platform.toUpperCase().indexOf('MAC') >= 0,
    []
  );

  return {
    isMac,
    modifierKey: isMac ? 'Cmd' : 'Ctrl',
    modifierSymbol: isMac ? '⌘' : 'Ctrl'
  };
};
```

### 2.4 Modal Accessibility
**Research Question**: How to implement accessible help modal with focus trap?

**Findings**:
- TailwindCSS provides styling (overlay, positioning)
- Focus trap requires custom logic or library (e.g., `focus-trap-react`)
- ARIA attributes needed: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

**Decision**: Implement custom focus trap using `useEffect` to avoid new dependencies. Simpler than full library for this use case.

**Code Pattern**:
```typescript
// Trap focus within modal
useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modalRef.current?.querySelectorAll(
    'a[href], button, textarea, input, select'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

---

## 3. Third-Party Libraries

### 3.1 Required Libraries
**None** - All functionality achievable with existing stack:
- React 19 (keyboard events, refs, effects)
- TypeScript 5.8.3 (type safety)
- Zustand 5.0.8 (state management)
- TailwindCSS 4.1.17 (styling)

### 3.2 Optional Libraries (Rejected)
- ❌ `react-hotkeys-hook` - Adds unnecessary abstraction, increases bundle size
- ❌ `mousetrap` - Non-React library, doesn't integrate well with hooks
- ❌ `focus-trap-react` - Simple enough to implement directly

**Decision**: Zero new dependencies. Keep implementation lean and maintainable.

---

## 4. Accessibility Research

### 4.1 WCAG 2.1 AA Requirements
**Research Question**: What accessibility standards apply?

**Findings** (from WCAG 2.1 AA):
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Users can navigate away from any component
- **2.4.7 Focus Visible**: Keyboard focus clearly visible
- **4.1.2 Name, Role, Value**: Components have proper ARIA labels

**Decision**: Implement all WCAG requirements from the start (not as afterthought).

### 4.2 Screen Reader Testing
**Research Question**: How to test with screen readers?

**Findings**:
- macOS: VoiceOver (built-in)
- Windows: NVDA (free)
- Testing: Verify ARIA labels are announced correctly

**Decision**: Include screen reader testing in manual checklist before release.

---

## 5. Performance Considerations

### 5.1 Event Handler Performance
**Research Question**: Will global keyboard listeners impact performance?

**Findings**:
- Keyboard events are infrequent (human-speed, not programmatic)
- Modern browsers handle event listeners efficiently
- Key concern: avoid memory leaks by cleaning up listeners

**Decision**: Attach listeners at component mount, clean up on unmount. Use `useEffect` cleanup functions.

### 5.2 State Update Performance
**Research Question**: Will frequent state updates (e.g., arrow keys) cause lag?

**Findings**:
- Zustand uses shallow equality checks (fast)
- Highlighting is visual only (no expensive operations)
- React 19 concurrent rendering optimizes updates

**Decision**: No special optimizations needed. Monitor during E2E tests to confirm <16ms response time.

---

## 6. Edge Cases & Browser Quirks

### 6.1 Browser Default Behaviors
**Research Question**: Which browser shortcuts conflict with our shortcuts?

**Findings**:
- **Cmd/Ctrl+F**: Browser's native find (must prevent default)
- **Cmd/Ctrl+1-9**: Browser tab switching (must prevent default)
- **Escape**: May close browser devtools (safe to use)
- **?**: No browser conflict (Shift+/ is safe)

**Decision**: Call `event.preventDefault()` for Cmd/Ctrl+F and Cmd/Ctrl+1-6 when appropriate.

### 6.2 Tauri Webview Specifics
**Research Question**: Are there Tauri-specific keyboard issues?

**Findings**:
- Tauri uses platform-native webview (WKWebView on macOS, WebView2 on Windows)
- Keyboard events work identically to browser
- No special Tauri APIs needed for keyboard handling

**Decision**: Standard React keyboard handling works in Tauri. No special cases needed.

---

## 7. Testing Strategy

### 7.1 Unit Testing
**Approach**:
- Test hooks (`useKeyboardShortcuts`, `useListNavigation`, `usePlatformModifier`) in isolation
- Mock keyboard events using `@testing-library/user-event`
- Test Zustand store state updates

**Tools**: Vitest + @testing-library/react + @testing-library/user-event

### 7.2 Component Testing
**Approach**:
- Test enhanced components (SkillList, SearchBar, TabSystem) with keyboard interactions
- Test new component (KeyboardShortcutHelp modal)
- Verify focus changes, state updates, ARIA attributes

**Tools**: Vitest + @testing-library/react

### 7.3 E2E Testing
**Approach**:
- Test all 4 user stories end-to-end
- Test cross-platform (macOS simulation + Windows/Linux simulation)
- Test accessibility with axe-core

**Tools**: Playwright + @axe-core/playwright

---

## 8. Research Conclusions

### 8.1 Technical Feasibility
✅ **CONFIRMED** - All requirements achievable with existing technology stack.

### 8.2 Risk Assessment
**Low Risk**:
- Well-understood technologies (React keyboard events, focus management)
- No new dependencies required
- Clear testing strategy with >80% coverage target

**Mitigations**:
- TDD approach ensures early detection of issues
- E2E tests validate cross-platform behavior
- Manual accessibility testing before release

### 8.3 Unknowns Resolved
- ✅ Platform detection: `navigator.platform`
- ✅ Focus management: React refs + `.focus()`
- ✅ Browser conflicts: `event.preventDefault()` for Cmd/Ctrl+F and Cmd/Ctrl+1-6
- ✅ Modal focus trap: Custom implementation with `useEffect`
- ✅ Testing approach: Vitest + Playwright + @testing-library

### 8.4 Ready for Phase 1
**Status**: ✅ APPROVED

All technical questions answered. No blockers identified. Ready to proceed to data model design and contract definition.

---

**Research Completed**: 2025-11-10
**Next Step**: Phase 1 - Data Model & Contracts
