# Accessibility Guide

**Project**: Skill Debugger
**Target Standard**: WCAG 2.1 Level AA
**Last Updated**: 2025-11-13
**Maintained By**: Development Team

---

## Table of Contents

- [Overview](#overview)
- [WCAG 2.1 AA Compliance](#wcag-21-aa-compliance)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Visual Design](#visual-design)
- [Testing Accessibility](#testing-accessibility)
- [Accessibility Checklist](#accessibility-checklist)
- [Common Patterns](#common-patterns)
- [Resources](#resources)

---

## Overview

The Skill Debugger is committed to **WCAG 2.1 Level AA** compliance to ensure all users, including those with disabilities, can effectively use the application.

**Why Accessibility Matters**:

- **Legal Compliance**: Many jurisdictions require digital accessibility
- **Inclusive Design**: 15% of the global population has some form of disability
- **Better UX**: Accessible design benefits all users (keyboard shortcuts, clear labels, etc.)
- **Developer Tool**: Our users are developers who may rely on assistive technologies

**Current Status**: Feature 003 (Keyboard Shortcuts) achieved high accessibility compliance with:

- Full keyboard navigation support
- Screen reader compatibility with ARIA labels
- Focus management and keyboard trap prevention
- Visual focus indicators for all interactive elements

---

## WCAG 2.1 AA Compliance

### Four Principles (POUR)

1. **Perceivable**: Information must be presentable to users in ways they can perceive
2. **Operable**: User interface components must be operable
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must be robust enough for assistive technologies

### Level AA Requirements

| Criterion                           | Requirement                                                    | Status         |
| ----------------------------------- | -------------------------------------------------------------- | -------------- |
| **1.1.1 Non-text Content**          | All images have alt text                                       | ✅ Compliant   |
| **1.4.3 Contrast (Minimum)**        | 4.5:1 for normal text, 3:1 for large text                      | ✅ Compliant   |
| **1.4.11 Non-text Contrast**        | 3:1 for UI components and graphics                             | ✅ Compliant   |
| **2.1.1 Keyboard**                  | All functionality via keyboard                                 | ✅ Compliant   |
| **2.1.2 No Keyboard Trap**          | Users can navigate away from any component                     | ✅ Compliant   |
| **2.4.7 Focus Visible**             | Keyboard focus indicator visible                               | ✅ Compliant   |
| **3.2.4 Consistent Identification** | Components with same functionality are consistently identified | ✅ Compliant   |
| **4.1.2 Name, Role, Value**         | All UI components have accessible name and role                | ✅ Compliant   |
| **4.1.3 Status Messages**           | Status messages can be programmatically determined             | 🔄 In Progress |

---

## Keyboard Navigation

All features are accessible via keyboard. **No mouse required**.

### Global Shortcuts

| Shortcut       | Action       | Context               |
| -------------- | ------------ | --------------------- |
| `Cmd/Ctrl + F` | Focus search | Global (anywhere)     |
| `?`            | Show help    | Global (not in input) |
| `Esc`          | Close/Clear  | Modals, search, etc.  |
| `Tab`          | Next element | Focus management      |
| `Shift+Tab`    | Prev element | Focus management      |

### Search

| Shortcut       | Action       | Description                        |
| -------------- | ------------ | ---------------------------------- |
| `Cmd/Ctrl + F` | Focus search | Jump to search input from anywhere |
| `Esc`          | Clear search | Clear search and unfocus input     |

### List Navigation

| Shortcut | Action          | Description                                   |
| -------- | --------------- | --------------------------------------------- |
| `↓`      | Next skill      | Highlight next skill in list (wraps to first) |
| `↑`      | Previous skill  | Highlight previous skill (wraps to last)      |
| `Enter`  | Select          | Select the highlighted skill                  |
| `Esc`    | Clear highlight | Remove highlight from list                    |

### Tab Navigation (Skill Viewer)

| Shortcut       | Tab        | Content                           |
| -------------- | ---------- | --------------------------------- |
| `Cmd/Ctrl + 1` | Overview   | Skill metadata and summary        |
| `Cmd/Ctrl + 2` | Content    | Full skill markdown content       |
| `Cmd/Ctrl + 3` | Triggers   | Trigger patterns and confidence   |
| `Cmd/Ctrl + 4` | Diagram    | Mermaid architecture diagram      |
| `Cmd/Ctrl + 5` | References | Referenced files and dependencies |
| `Cmd/Ctrl + 6` | Scripts    | Embedded scripts and commands     |

### Implementation

**Custom Hook**: `useKeyboardShortcuts.ts`

```typescript
import { useEffect } from 'react';
import { useKeyboardStore } from '@/stores/keyboardStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, metaKey, ctrlKey, shiftKey } = event;
      const isMac = navigator.platform.includes('Mac');
      const modKey = isMac ? metaKey : ctrlKey;

      // Cmd/Ctrl+F: Focus search
      if (modKey && key.toLowerCase() === 'f') {
        event.preventDefault();
        useKeyboardStore.getState().setSearchFocusRequested(true);
      }

      // ? : Show help
      if (key === '?' && !isInputFocused()) {
        event.preventDefault();
        useKeyboardStore.getState().setIsHelpModalOpen(true);
      }

      // ... more shortcuts
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

### Focus Management

**Focus Indicators**: All interactive elements show a visible focus indicator:

```css
/* Tailwind focus styles */
focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
```

**Focus Traps**: Modals trap focus to prevent tabbing outside:

```typescript
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  element.addEventListener('keydown', handleTab);
  return () => element.removeEventListener('keydown', handleTab);
};
```

---

## Screen Reader Support

### Tested Screen Readers

| Screen Reader | OS      | Status     | Notes                          |
| ------------- | ------- | ---------- | ------------------------------ |
| **VoiceOver** | macOS   | ✅ Tested  | Primary testing platform       |
| **NVDA**      | Windows | ✅ Tested  | Free, open-source              |
| **JAWS**      | Windows | 🔄 Planned | Commercial, widely used        |
| **Narrator**  | Windows | 🔄 Planned | Built-in Windows screen reader |
| **Orca**      | Linux   | 🔄 Planned | Built-in Linux screen reader   |

### Semantic HTML

Use semantic elements for structure:

```html
<!-- Good: Semantic structure -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Skill Name</h1>
    <section>
      <h2>Description</h2>
      <p>Skill description...</p>
    </section>
  </article>
</main>

<!-- Bad: Non-semantic -->
<div class="nav">
  <div class="link">Home</div>
</div>

<div class="content">
  <div class="title">Skill Name</div>
  <div class="text">Skill description...</div>
</div>
```

### ARIA Attributes

**ARIA Labels**: Provide accessible names for elements without visible text:

```tsx
// Icon-only button
<button
  aria-label="Close modal"
  onClick={onClose}
>
  <XIcon />
</button>

// Search input
<input
  type="search"
  aria-label="Search skills by name or description"
  placeholder="Search skills..."
/>
```

**ARIA Roles**: Clarify element purpose when semantic HTML isn't sufficient:

```tsx
// Modal dialog
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Keyboard Shortcuts</h2>
  <p id="modal-description">Available keyboard shortcuts for navigation</p>
</div>

// Tab panel
<div
  role="tabpanel"
  aria-labelledby="tab-content"
  tabIndex={0}
>
  {/* Tab content */}
</div>
```

**ARIA Live Regions**: Announce dynamic changes:

```tsx
// Status messages
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>

// Error messages (immediate announcement)
<div
  role="alert"
  aria-live="assertive"
>
  {errorMessage}
</div>
```

### State Announcements

Announce state changes to screen readers:

```typescript
const announceTabChange = (tabName: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = `${tabName} tab active`;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => document.body.removeChild(announcement), 1000);
};
```

---

## Visual Design

### Color Contrast

**WCAG AA Requirements**:

- **Normal text** (< 18pt or < 14pt bold): 4.5:1 contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

**Project Color Palette** (all meet AA standards):

```css
/* Primary colors */
--color-text: #111827; /* Gray 900 on White = 14.47:1 ✅ */
--color-text-muted: #6b7280; /* Gray 500 on White = 4.61:1 ✅ */
--color-primary: #4f46e5; /* Indigo 600 on White = 6.19:1 ✅ */
--color-bg: #f9fafb; /* Gray 50 */
--color-surface: #ffffff; /* White */

/* Interactive elements */
--color-border: #e5e7eb; /* Gray 200 */
--color-focus: #4f46e5; /* Indigo 600 */
```

**Verify Contrast**:

- **Chrome DevTools**: Lighthouse audit
- **Online**: https://webaim.org/resources/contrastchecker/
- **Design Tool**: Figma Contrast plugin

### Focus Indicators

All interactive elements have visible focus indicators:

```css
/* Default focus ring */
*:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

/* Tailwind focus utilities */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

**Requirements**:

- Focus indicator must be **visible** (not `outline: none` without alternative)
- Focus indicator must have **3:1 contrast** with adjacent colors
- Focus indicator must **not be obscured** by other elements

### Text Sizing

All text is resizable up to 200% without loss of functionality:

```css
/* Base font size: 16px (1rem) */
body {
  font-size: 16px;
}

/* Use rem units for scalability */
.text-sm {
  font-size: 0.875rem;
} /* 14px */
.text-base {
  font-size: 1rem;
} /* 16px */
.text-lg {
  font-size: 1.125rem;
} /* 18px */
.text-xl {
  font-size: 1.25rem;
} /* 20px */
```

**Test Text Resizing**:

- **Chrome/Edge**: Cmd/Ctrl + Plus/Minus
- **Firefox**: View > Zoom > Zoom Text Only
- **Safari**: View > Zoom In/Out

### Motion and Animation

Respect user's motion preferences:

```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Accessibility

### Automated Testing

#### 1. Vitest + jest-axe (Unit Tests)

**Not currently implemented** but planned for unit tests:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### 2. Playwright + axe-core (E2E Tests)

**Currently implemented**:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations on home page', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

#### 3. Chrome DevTools Lighthouse

Run Lighthouse audit:

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"

**Target Score**: 90+ (current: 95+)

#### 4. Browser Extensions

- **WAVE** (Web Accessibility Evaluation Tool): https://wave.webaim.org/extension/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Accessibility Insights**: https://accessibilityinsights.io/

### Manual Testing

#### Keyboard Navigation Test

1. **Tab through the application**:
   - Can you reach all interactive elements?
   - Is the focus order logical?
   - Are focus indicators visible?

2. **Use application with keyboard only**:
   - Can you complete all tasks without a mouse?
   - Are shortcuts discoverable (via help modal)?

3. **Test Escape key**:
   - Does Escape close modals?
   - Does Escape clear selections?
   - Can you always "escape" from any state?

#### Screen Reader Test

**macOS (VoiceOver)**:

```bash
# Enable VoiceOver
Cmd + F5

# Basic commands
Ctrl + Option + Right Arrow  # Next item
Ctrl + Option + Left Arrow   # Previous item
Ctrl + Option + Space        # Activate item
```

**Windows (NVDA)**:

```bash
# Start NVDA
Ctrl + Alt + N

# Basic commands
Down Arrow           # Next item
Up Arrow             # Previous item
Enter or Space       # Activate item
Insert + F7          # Elements list
```

**Test Checklist**:

- [ ] Can you navigate the entire app with screen reader?
- [ ] Are all buttons and links announced with correct labels?
- [ ] Are form inputs announced with correct labels?
- [ ] Are state changes announced (e.g., tab switches)?
- [ ] Are error messages announced?

#### Color Contrast Test

1. **Grayscale Test**: Convert page to grayscale
   - Does all information remain visible?
   - Is contrast sufficient?

2. **High Contrast Mode**: Test in OS high contrast mode
   - Windows: Settings > Ease of Access > High contrast
   - macOS: System Preferences > Accessibility > Display > Increase contrast

3. **Colorblindness Simulation**:
   - Chrome extension: "Colorblind – Dalton"
   - Verify information isn't conveyed by color alone

---

## Accessibility Checklist

Use this checklist before merging PRs:

### Keyboard Accessibility

- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Focus indicators are clearly visible (3:1 contrast)
- [ ] No keyboard traps (user can always escape)
- [ ] Keyboard shortcuts documented in help modal

### Screen Reader Accessibility

- [ ] Semantic HTML elements used (`<nav>`, `<main>`, `<button>`)
- [ ] All images have alt text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` or `aria-label`
- [ ] Icon-only buttons have `aria-label`
- [ ] Modals have `role="dialog"` and `aria-labelledby`
- [ ] Dynamic content changes are announced (`aria-live`)
- [ ] Headings form logical hierarchy (h1 > h2 > h3)

### Visual Accessibility

- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Information not conveyed by color alone
- [ ] Text is resizable up to 200% without loss of functionality
- [ ] Focus indicators visible on all interactive elements
- [ ] No flashing content (>3 times per second)

### Testing

- [ ] Automated accessibility tests pass (`npm run test:e2e`)
- [ ] Lighthouse accessibility score > 90
- [ ] Manual keyboard navigation test passed
- [ ] Screen reader test passed (VoiceOver or NVDA)
- [ ] High contrast mode test passed

---

## Common Patterns

### Accessible Button

```tsx
// With visible text (preferred)
<button
  onClick={handleClick}
  className="px-4 py-2 bg-indigo-600 text-white rounded-md
             hover:bg-indigo-700 focus:outline-none focus:ring-2
             focus:ring-indigo-500 focus:ring-offset-2"
>
  Click Me
</button>

// Icon-only button (requires aria-label)
<button
  onClick={handleClose}
  aria-label="Close modal"
  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none
             focus:ring-2 focus:ring-indigo-500"
>
  <XIcon className="h-5 w-5" aria-hidden="true" />
</button>
```

### Accessible Form Input

```tsx
<div className="mb-4">
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    name="email"
    aria-describedby="email-hint"
    aria-required="true"
    className="mt-1 block w-full rounded-md border-gray-300
               focus:border-indigo-500 focus:ring-indigo-500"
  />
  <p id="email-hint" className="mt-1 text-sm text-gray-500">
    We'll never share your email with anyone.
  </p>
</div>
```

### Accessible Modal

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  className="fixed inset-0 z-50 flex items-center justify-center
             bg-black bg-opacity-50"
  onClick={handleBackdropClick}
>
  <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
    <h2 id="modal-title" className="text-xl font-bold mb-4">
      Keyboard Shortcuts
    </h2>
    <div id="modal-description" className="mb-4">
      <p>Use these shortcuts to navigate the application:</p>
      {/* Shortcuts list */}
    </div>
    <button
      onClick={onClose}
      aria-label="Close modal"
      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
    >
      Close
    </button>
  </div>
</div>
```

### Accessible Tabs

```tsx
<div>
  <div role="tablist" aria-label="Skill information tabs">
    <button
      role="tab"
      aria-selected={activeTab === 0}
      aria-controls="panel-overview"
      id="tab-overview"
      tabIndex={activeTab === 0 ? 0 : -1}
      onClick={() => setActiveTab(0)}
      className={`px-4 py-2 ${activeTab === 0 ? 'border-b-2 border-indigo-600' : ''}`}
    >
      Overview
    </button>
    {/* More tabs */}
  </div>

  <div
    role="tabpanel"
    id="panel-overview"
    aria-labelledby="tab-overview"
    tabIndex={0}
    hidden={activeTab !== 0}
  >
    {/* Panel content */}
  </div>
</div>
```

### Accessible List Navigation

```tsx
<ul role="listbox" aria-label="Skills">
  {skills.map((skill, index) => (
    <li
      key={skill.id}
      role="option"
      aria-selected={highlightedIndex === index}
      onClick={() => selectSkill(skill)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') selectSkill(skill);
      }}
      tabIndex={highlightedIndex === index ? 0 : -1}
      className={`p-4 cursor-pointer ${highlightedIndex === index ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {skill.name}
    </li>
  ))}
</ul>
```

---

## Resources

### WCAG Guidelines

- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **Understanding WCAG 2.1**: https://www.w3.org/WAI/WCAG21/Understanding/
- **How to Meet WCAG**: https://www.w3.org/WAI/WCAG21/quickref/

### Testing Tools

- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/
- **Lighthouse**: Built into Chrome DevTools
- **Accessibility Insights**: https://accessibilityinsights.io/

### Screen Readers

- **VoiceOver** (macOS): Built-in (Cmd+F5)
- **NVDA** (Windows): https://www.nvaccess.org/ (Free)
- **JAWS** (Windows): https://www.freedomscientific.com/products/software/jaws/ (Commercial)

### Documentation

- **MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **W3C ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/

### Courses

- **Web Accessibility by Google** (Udacity): Free
- **Digital Accessibility** (W3C): https://www.edx.org/learn/web-accessibility
- **Accessibility for Web Developers** (Udemy): Paid

---

**Last Updated**: 2025-11-13
**Version**: 1.0
**Maintained By**: Development Team
