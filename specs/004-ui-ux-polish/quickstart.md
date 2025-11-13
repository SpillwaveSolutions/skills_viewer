# Quick Start: UI/UX Polish and Fixes

**Feature**: 004-ui-ux-polish
**Target**: Developers implementing this feature
**Prerequisites**: Node.js 18+, npm, basic React/TypeScript knowledge

## Setup (5 minutes)

### 1. Checkout Branch

```bash
git checkout 004-ui-ux-polish
```

### 2. Install Dependencies (already installed, verify)

```bash
npm install
```

**Expected**: No new packages installed (all dependencies already present)

### 3. Verify Development Environment

```bash
npm run dev
```

**Expected**: Vite dev server starts, Tauri window opens

---

## Development Workflow

### TDD Workflow (MANDATORY per Constitution Principle VII)

**Write tests BEFORE implementation**:

```bash
# 1. Write test for a feature
vim tests/unit/OverviewTab.test.tsx

# 2. Run test (should fail initially - RED)
npm test OverviewTab.test.tsx

# 3. Implement feature to make test pass
vim src/components/OverviewTab.tsx

# 4. Run test again (should pass - GREEN)
npm test OverviewTab.test.tsx

# 5. Refactor if needed (test should still pass)
```

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test OverviewTab.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Common Development Tasks

**Task 1: Update TailwindCSS Classes for Spacing**

```bash
# 1. Write test
vim tests/unit/spacing.test.tsx

# 2. Update component
vim src/components/OverviewTab.tsx

# Change: className="p-4" → className="p-6"
# Result: 24px padding (8px minimum from borders ✅)

# 3. Verify visually
npm run dev
# Navigate to skill, check spacing looks good
```

**Task 2: Reorder Overview Tab Information**

```bash
# 1. Write test
vim tests/unit/OverviewTab.test.tsx

# 2. Update JSX rendering order
vim src/components/OverviewTab.tsx

# Reorder elements:
# - Name (h1)
# - Location badge
# - Description
# - Version
# - Triggers preview
# - Stats grid
# - Remaining metadata

# 3. Run test
npm test OverviewTab.test.tsx
```

**Task 3: Add Text Truncation**

```bash
# 1. Write test
vim tests/e2e/text-overflow.spec.ts

# 2. Add .truncate class
vim src/components/SkillList.tsx

# Add: className="truncate" to skill name
# Add: title={skill.name} for tooltip

# 3. Run E2E test
npm run test:e2e -- text-overflow.spec.ts
```

**Task 4: Fix Syntax Highlighting Bug**

```bash
# 1. Write integration test
vim tests/integration/syntax-highlighting.test.tsx

# Test: Navigate to Scripts tab 20 times, verify highlighting each time

# 2. Replace highlight.js with ReactMarkdown
vim src/components/ScriptsTab.tsx

# Remove:
# - useEffect with hljs.highlightAll()
# - highlightedCode state

# Add:
# <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
#   {`\`\`\`${script.language}\n${script.content}\n\`\`\``}
# </ReactMarkdown>

# 3. Run integration test
npm test syntax-highlighting.test.tsx
```

---

## Testing Strategy

### Unit Tests (tests/unit/)

**Purpose**: Test component logic, utility functions, hooks

**Example**:
```typescript
// tests/unit/OverviewTab.test.tsx
import { render } from '@testing-library/react';
import { OverviewTab } from '../../src/components/OverviewTab';

describe('OverviewTab', () => {
  it('displays information in correct order', () => {
    const mockSkill = { /* ... */ };
    const { container } = render(<OverviewTab skill={mockSkill} />);

    const children = Array.from(container.firstChild.children);
    expect(children[0].tagName).toBe('H1'); // Name
    expect(children[1].textContent).toContain('claude'); // Location
    expect(children[2].textContent).toContain('Description'); // Description
  });
});
```

### Integration Tests (tests/integration/)

**Purpose**: Test component interactions, state management

**Example**:
```typescript
// tests/integration/syntax-highlighting.test.tsx
describe('Syntax Highlighting Persistence', () => {
  it('works on 20 consecutive visits', async () => {
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByText('Overview'));
      await user.click(screen.getByText('Scripts'));

      const codeBlock = screen.getByRole('code');
      expect(codeBlock).toHaveClass('hljs');
      expect(codeBlock.querySelector('.hljs-keyword')).toBeInTheDocument();
    }
  });
});
```

### E2E Tests (tests/e2e/)

**Purpose**: Test full user workflows, visual regression

**Example**:
```typescript
// tests/e2e/ui-polish.spec.ts
import { test, expect } from '@playwright/test';

test('all text has minimum 8px margins', async ({ page }) => {
  await page.goto('/');

  const textElements = await page.locator('p, h1, h2, li').all();
  for (const el of textElements) {
    const box = await el.boundingBox();
    const parentBox = await el.locator('..').boundingBox();

    const marginLeft = box.x - parentBox.x;
    expect(marginLeft).toBeGreaterThanOrEqual(8);
  }
});
```

---

## File Structure

```
specs/004-ui-ux-polish/
├── spec.md              # Requirements (what to build)
├── plan.md              # Technical plan (how to build)
├── research.md          # Technology decisions (why these choices)
├── data-model.md        # Component state and data flow
├── contracts/           # TypeScript interfaces
│   ├── OverviewTab.interface.ts
│   ├── SkillList.interface.ts
│   └── ScriptsTab.interface.ts
├── checklists/
│   └── requirements.md  # Spec quality validation
├── quickstart.md        # This file
└── tasks.md             # Implementation checklist (generated by /speckit.tasks)

src/components/
├── OverviewTab.tsx      # [MODIFY] Reorder information, fix spacing
├── SkillList.tsx        # [MODIFY] Add margins, text truncation
├── ScriptsTab.tsx       # [MODIFY] Fix syntax highlighting bug
├── ReferencesTab.tsx    # [MODIFY] Add proper margins
└── SearchBar.tsx        # [MODIFY] Text truncation

tests/
├── unit/                # Component logic tests
├── integration/         # Component interaction tests
└── e2e/                 # Full workflow tests
```

---

## Key Implementation Files

### Components to Modify

1. **src/components/OverviewTab.tsx** (lines 19-101)
   - Current: Name → Location → Stats → Triggers → Description
   - Target: Name → Location → Description → Version → Triggers → Stats → Metadata
   - Action: Reorder JSX, remove duplicate description

2. **src/components/SkillList.tsx** (lines 45-68)
   - Current: `className="p-3"`
   - Target: `className="px-4 py-3 truncate" title={skill.name}`
   - Action: Update classes, add tooltip

3. **src/components/ScriptsTab.tsx** (lines 44-51)
   - Current: `useEffect(() => hljs.highlightAll())`
   - Target: `<ReactMarkdown rehypePlugins={[rehypeHighlight]}>`
   - Action: Replace imperative with declarative

---

## Common Issues & Solutions

### Issue 1: Tests Failing After Spacing Changes

**Symptom**: Visual regression tests fail with margin mismatches

**Solution**:
```bash
# Update baseline screenshots
npm run test:e2e -- --update-snapshots

# Review changes
git diff tests/e2e/__screenshots__/
```

### Issue 2: Syntax Highlighting Not Working Locally

**Symptom**: Code blocks show plain text in dev mode

**Solution**:
```bash
# Verify rehype-highlight is installed
npm list rehype-highlight

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Issue 3: Text Truncation Not Working

**Symptom**: Text overflows instead of truncating

**Solution**:
```typescript
// Ensure parent has defined width
<div className="w-full"> // or max-w-xs, etc.
  <span className="truncate block"> // must be block or inline-block
    {longText}
  </span>
</div>
```

---

## Performance Verification

### Check 60fps Rendering

```typescript
// Add performance measurement
const start = performance.now();
render(<OverviewTab skill={mockSkill} />);
const end = performance.now();

expect(end - start).toBeLessThan(16); // 60fps = 16ms per frame
```

### Check Memory Usage

```bash
# Run with Node memory profiling
node --expose-gc --inspect npm test

# Monitor memory in Chrome DevTools
# Navigate to chrome://inspect
```

---

## Checklist Before Submitting PR

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Test coverage >80% for modified files (`npm run test:coverage`)
- [ ] Visual regression tests updated if UI changed
- [ ] Manual testing on macOS (or your platform)
- [ ] No console errors or warnings
- [ ] Performance: All interactions <16ms (60fps)
- [ ] Accessibility: No new axe violations
- [ ] Code follows TailwindCSS conventions
- [ ] All tasks.md items marked [x] or [~]
- [ ] DEVIATIONS.md updated if any tasks skipped/simplified

---

## Next Steps

1. **Read tasks.md** (generated by `/speckit.tasks`)
2. **Follow TDD workflow** (write test → implement → verify)
3. **Mark tasks in real-time** ([x] complete, [~] simplified)
4. **Run tests frequently** (catch issues early)
5. **Commit often** (small, focused commits)
6. **Request review** when all tests pass

---

## References

- **Specification**: [spec.md](./spec.md)
- **Technical Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts/)
- **Constitution**: [/.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Questions?** Review the research.md for technical decisions, or consult the spec.md for requirements.
