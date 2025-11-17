# Skill Debugger

A native desktop application for exploring, analyzing, and debugging Claude Code skills. Built with Tauri, React, and TypeScript.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)

---

## 🎯 Purpose

Skill Debugger helps developers understand, debug, and optimize their Claude Code skills by providing:

- **Skill Discovery**: Automatically scans `~/.claude/skills` and `~/.config/opencode/skills`
- **Rich Metadata Visualization**: Displays skill descriptions, triggers, references, and scripts
- **Trigger Analysis**: Shows confidence levels and pattern matching for skill activation
- **Dependency Graphs**: Visual Mermaid diagrams of skill architecture
- **Smart Search**: Instant filtering across skill names and descriptions

---

## ✨ Features

### v0.1.0 (Current)

- ✅ **Skill Discovery** (US1)
  - Scans multiple skill directories
  - Displays skill list with location badges
  - Fast scanning (<500ms for 20 skills)

- ✅ **Skill Viewing** (US2)
  - YAML frontmatter parsing
  - Markdown rendering with syntax highlighting
  - Tab-based interface (Overview, Content, Triggers, Diagram, References, Scripts)

- ✅ **Navigation** (US3)
  - Select skills from list
  - Back button to return to list
  - Responsive layout (800px - 1920px)

- ✅ **Trigger Analysis** (US4)
  - Keyword extraction from descriptions
  - Confidence level indicators
  - Pattern matching insights

- ✅ **Visualization** (US5)
  - Mermaid diagram generation
  - Shows skill dependencies and references
  - Interactive graph rendering

- ✅ **Search & Filtering** (US6)
  - Real-time search across skills
  - Filters by name and description
  - Instant results

### Upcoming Features

See [specs/BACKLOG.md](specs/BACKLOG.md) for the full roadmap.

---

## ⌨️ Keyboard Shortcuts

**Power-user features for keyboard-only navigation** (v0.2.0)

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

### Tab Navigation

**When viewing a skill**, use these shortcuts to switch between tabs:

| Shortcut       | Tab        | Content                           |
| -------------- | ---------- | --------------------------------- |
| `Cmd/Ctrl + 1` | Overview   | Skill metadata and summary        |
| `Cmd/Ctrl + 2` | Content    | Full skill markdown content       |
| `Cmd/Ctrl + 3` | Triggers   | Trigger patterns and confidence   |
| `Cmd/Ctrl + 4` | Diagram    | Mermaid architecture diagram      |
| `Cmd/Ctrl + 5` | References | Referenced files and dependencies |
| `Cmd/Ctrl + 6` | Scripts    | Embedded scripts and commands     |

### Help

| Shortcut | Action     | Description                         |
| -------- | ---------- | ----------------------------------- |
| `?`      | Show help  | Display keyboard shortcut reference |
| `Esc`    | Close help | Close the help modal                |

**Platform Notes**:

- **macOS**: Use `Cmd` (⌘) key
- **Windows/Linux**: Use `Ctrl` key

**Test Coverage**: 97.12% (113 passing unit tests + 24 E2E tests)

---

## 🏗️ Technology Stack

### Frontend

- **React** 19.1.0 with TypeScript 5.8.3
- **Vite** 7.0.4 (build tool, dev server)
- **TailwindCSS** 4.1.17 (utility-first styling)
- **Zustand** 5.0.8 (state management)
- **react-markdown** 10.1.0 (markdown rendering)
- **Mermaid** 11.12.1 (diagram rendering)
- **highlight.js** 11.11.1 (syntax highlighting)

### Backend

- **Tauri** 2.x (Rust + webview hybrid)
- **serde** + **serde_json** (serialization)
- **serde_yaml** 0.9 (YAML frontmatter parsing)
- **dirs** 5.0 (cross-platform paths)

### Development

- **Vite** (fast HMR, optimized builds)
- **TypeScript** (strict mode, no `any`)
- **Rust** (performance-critical backend)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ ([rustup.rs](https://rustup.rs))
- **System dependencies** (varies by platform)

#### macOS

```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Windows

- Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

---

### Installation

```bash
# Clone the repository
git clone https://github.com/SpillwaveSolutions/skills_viewer.git
cd skills_viewer

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

---

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev              # Vite dev server only (frontend)
npm run tauri dev        # Full Tauri app with hot reload

# Building
npm run build            # Build frontend (dist/)
npm run tauri build      # Build desktop app (src-tauri/target/)

# Testing
npm test                 # Run unit tests (Vitest)
npm run test:ui          # Run tests with interactive UI
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run end-to-end tests (Playwright)

# Code Quality
npm run lint             # Check for linting errors (ESLint)
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all files (Prettier)
npm run format:check     # Verify formatting without changes
```

### Project Structure

```
skill-debugger/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── SkillList/
│   │   ├── SkillViewer/
│   │   └── Layout/
│   ├── stores/                   # Zustand state
│   │   └── useSkillStore.ts
│   ├── types/                    # TypeScript interfaces
│   ├── main.tsx                  # Entry point
│   └── App.tsx                   # Root component
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri commands
│   │   └── skills.rs             # Skill scanning logic
│   └── Cargo.toml                # Rust dependencies
│
├── specs/                        # SDD specifications
│   ├── 001-core-skill-explorer/  # Feature 001
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── DEVIATIONS.md
│   │   └── IMPLEMENTATION_NOTES.md
│   ├── 002-ui-redesign/          # Feature 002
│   │   └── ...
│   ├── IMPLEMENTATION_REALITY.md # Post-mortem audit
│   ├── BACKLOG.md                # Consolidated roadmap
│   └── TEST_BACKFILL_STRATEGY.md # Test remediation plan
│
├── .specify/                     # SDD memory
│   └── memory/
│       └── constitution.md       # Project principles
│
├── .claude/                      # Claude Code config
│   └── CLAUDE.md                 # Local instructions
│
└── docs/                         # Requirements docs
    └── requirements/
        ├── main.md
        └── features/
```

---

## 📋 Specification-Driven Development (SDD)

This project follows **Specification-Driven Development (SDD)** methodology using the [SDD skill](~/.claude/skills/sdd/).

### What is SDD?

SDD is an AI-native development methodology that emphasizes:

- **Intent-driven development**: Define "what" before "how"
- **Executable specifications**: Specs drive implementation, not document it
- **Multi-step refinement**: Iterative specification → planning → tasks → implementation
- **Quality enforcement**: Tests and validation at every step

### SDD Workflow

All new features MUST follow this workflow:

```bash
# 1. Create feature branch
git checkout -b feature/XXX-feature-name

# 2. Define requirements
/speckit.specify <detailed feature requirements>

# 3. Clarify ambiguities
/speckit.clarify

# 4. Create implementation plan
/speckit.plan <technical decisions, architecture, constraints>

# 5. Generate task breakdown
/speckit.tasks

# 6. Validate consistency
/speckit.analyze

# 7. Implement following tasks.md STRICTLY
/speckit.implement
# - Follow tasks sequentially
# - Mark [x] only when complete
# - Mark [~] if simplified (with notes)
# - NO freelancing
```

### SDD Commands Reference

| Command                 | Purpose                       | When to Use               |
| ----------------------- | ----------------------------- | ------------------------- |
| `/speckit.constitution` | Define project principles     | Once at project start     |
| `/speckit.specify`      | Create feature specification  | Start of every feature    |
| `/speckit.clarify`      | Ask clarifying questions      | When spec has ambiguities |
| `/speckit.plan`         | Technical implementation plan | After spec approved       |
| `/speckit.tasks`        | Generate task breakdown       | After plan approved       |
| `/speckit.analyze`      | Validate consistency          | Before implementing       |
| `/speckit.implement`    | Execute tasks                 | Follow tasks.md strictly  |

### SDD Skill Location

The SDD skill is located at: **`~/.claude/skills/sdd/`**

**Key References**:

- `~/.claude/skills/sdd/skill.md` - Core methodology
- `~/.claude/skills/sdd/references/greenfield.md` - Greenfield workflow (6 steps)
- `~/.claude/skills/sdd/references/brownfield.md` - Brownfield strategies
- `~/.claude/skills/sdd/references/commands.md` - Command reference

### Lessons from v0.1.0

**What Went Wrong**:

- Created spec artifacts but **ignored them during implementation**
- Implemented features based on intuition, not task list
- Marked tasks complete retroactively
- Zero test coverage (violates constitutional requirement)

**Result**: 42% of tasks skipped or simplified

**v0.2.0 Commitment**:

- ✅ Follow SDD workflow strictly
- ✅ Write tests BEFORE implementation (TDD)
- ✅ Mark tasks in real-time
- ✅ Use `/speckit` commands for ALL features
- ✅ Stop at checkpoints for validation

See [.specify/memory/constitution.md](.specify/memory/constitution.md) for full lessons learned.

---

## 🧪 Testing

### Current Status (v0.2.0)

✅ **Test Coverage**: 97.12% (Constitutional compliance achieved!)

| Category   | Coverage | Tests                    |
| ---------- | -------- | ------------------------ |
| Unit Tests | 97.12%   | 113/113 passing          |
| E2E Tests  | -        | 24/35 passing            |
| Overall    | 97.12%   | Well above 80% target ✅ |

**Coverage Breakdown**:

- Components: 100% (KeyboardShortcutHelp, SearchBar, SkillList)
- Hooks: 96.82% (useKeyboardShortcuts, usePlatformModifier)
- Stores: 100% (keyboardStore)
- Utils: 91.42% (keyboardUtils)

### Test Stack

- **Vitest**: Unit and integration tests
- **Playwright**: E2E browser testing
- **@testing-library/react**: Component testing
- **happy-dom**: JSDOM environment
- **cargo test**: Rust unit tests (planned)

### Running Tests

```bash
npm test                  # Run unit tests
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run E2E tests (Playwright)
```

---

## 🧪 Testing

### Overview

Testing is a constitutional requirement for this project (Principle VII: >80% coverage). We follow Test-Driven Development (TDD) for all new features.

### Test Stack

- **Vitest**: Fast unit and integration testing for React components, hooks, and utilities
- **Playwright**: End-to-end browser testing for full user workflows
- **@testing-library/react**: Component testing with user-centric queries
- **happy-dom**: Lightweight DOM environment for unit tests
- **@axe-core/playwright**: Automated accessibility testing

### Running Tests

```bash
# Unit Tests
npm test                  # Run unit tests (watch mode)
npm run test:ui           # Run tests with interactive UI
npm run test:coverage     # Generate coverage report

# E2E Tests
npm run test:e2e          # Run Playwright E2E tests

# Rust Backend Tests
cd src-tauri
cargo test                # Run Rust unit tests
```

### Writing Tests

**Location**: Tests are colocated in `/tests` directory:

```
tests/
├── unit/                 # Unit and integration tests
│   ├── components/       # Component tests
│   ├── hooks/            # Hook tests
│   ├── stores/           # Store tests
│   └── utils/            # Utility tests
├── e2e/                  # End-to-end tests
│   ├── keyboard.spec.ts
│   ├── search.spec.ts
│   └── navigation.spec.ts
└── setup.ts              # Test configuration
```

**Example Test** (TDD approach):

```typescript
// tests/unit/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render with correct text', () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Coverage Requirements

Per constitutional Principle VII, all core logic must maintain:

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

**Current Coverage**: 97.12% (exceeds constitutional requirement)

View coverage report:

```bash
npm run test:coverage
open coverage/index.html  # View HTML report
```

### Testing Best Practices

1. **Write Tests First**: Follow TDD - write failing tests before implementation
2. **Test Behavior, Not Implementation**: Focus on what the component does, not how
3. **Use User-Centric Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Test Accessibility**: Include ARIA attributes and keyboard navigation in tests
5. **Mock External Dependencies**: Use Vitest mocks for Tauri commands and external APIs
6. **Keep Tests Fast**: Unit tests should run in <1s, E2E tests in <10s per test

### Continuous Integration

All PRs must pass:

- Unit tests with 80%+ coverage
- E2E tests for critical user flows
- Linting and formatting checks

See [docs/TESTING.md](/Users/richardhightower/src/skill-debugger/docs/TESTING.md) for detailed testing guide.

---

## 📸 Visual Regression Testing

### Overview

Visual regression testing captures screenshots of UI components and validates them against expected visual criteria. This catches UI regressions that selector-based E2E tests miss (blank screens, broken rendering, CSS issues).

### Quick Start

```bash
# 1. Start the development server
npm run dev

# 2. Run visual regression tests
npm run test:visual

# 3. Review captured screenshots
open test-results/visual/
```

### Test Infrastructure

**Location**: `tests/e2e/visual-regression.spec.ts`

The visual tests capture screenshots of all 6 tabs for each skill:

- Overview Panel
- Content Tab
- Diagram Tab
- References Tab
- Scripts Tab
- Triggers Tab

Each screenshot is paired with a JSON metadata file containing visual expectations.

### Mock Skills for Testing

Visual tests run in **web-only mode** using mock skill data, eliminating the need for Tauri runtime:

**Implementation**: `src/hooks/useSkills.ts`

```typescript
// Tauri environment guard pattern
const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Conditionally use Tauri API or mock data
if (isTauriEnvironment()) {
  const result = await invoke<Skill[]>('scan_skills');
  setSkills(result);
} else {
  // Web-only mode - use mock skills
  const mockSkills = getMockSkills();
  setSkills(mockSkills);
}
```

This pattern enables:

- ✅ Playwright tests to run without Tauri desktop app
- ✅ Fast test execution (<15 seconds for 6 tests)
- ✅ CI/CD integration without desktop environment
- ✅ Consistent test data across runs

### Visual Expectations

Each screenshot test defines what **should** and **should not** be visible:

```typescript
const expectation: VisualExpectation = {
  should: ['Skill name displayed at top', 'Tab navigation visible', 'Content rendered correctly'],
  shouldNot: ['Blank white screen', 'Error messages', 'Loading spinner'],
  description: 'Overview panel showing skill metadata',
};
```

### Screenshot Archive

Previous screenshots are automatically archived before each test run to prevent data loss:

```
test-results/
├── visual/                      # Current screenshots
│   ├── puml-overview-*.png
│   ├── puml-content-*.png
│   └── ...
└── visual-archive/              # Historical screenshots
    └── 2025-11-14_11-41-24/
        ├── puml-overview-*.png
        └── ...
```

### Helper Functions

**Location**: `tests/e2e/helpers/visual-verification.ts`

```typescript
// Capture screenshot with metadata
await captureAndDescribe(page, 'skill-overview', expectation);

// Archive previous screenshots
await archiveScreenshots();
```

### Known Limitations

**Claude Code CLI Analysis**: The automated analysis step using Claude Code CLI is currently disabled due to performance issues (>15min per screenshot). Visual verification is performed manually by reviewing captured screenshots.

**Workaround**: Developers can manually inspect screenshots in `test-results/visual/` to verify visual correctness.

**Future Improvement**: Replace Claude Code CLI with a lighter-weight vision API or image diff tool for automated verification.

### Best Practices

1. **Run Visual Tests Before Commits**: Catch visual regressions early

   ```bash
   npm run test:visual
   ```

2. **Review Screenshots After UI Changes**: Verify all tabs render correctly

   ```bash
   open test-results/visual/
   ```

3. **Update Expectations When UI Intentionally Changes**: Modify `VisualExpectation` objects in test file when designs change

4. **Check Archived Screenshots**: Compare current vs. previous screenshots when debugging regressions
   ```bash
   open test-results/visual-archive/
   ```

### Integration with Development Workflow

Visual regression tests complement existing E2E tests:

| Test Type              | What It Catches                 | Example                   |
| ---------------------- | ------------------------------- | ------------------------- |
| **Selector-based E2E** | Element existence, interactions | "Click button works"      |
| **Visual Regression**  | Visual correctness, rendering   | "Button actually visible" |

**Example Regression Caught**:

- E2E test: ✅ `page.locator('h1')` found element
- Visual test: ❌ Screenshot shows blank white screen
- **Root Cause**: Missing mock data fields caused render failure

### Troubleshooting

**Test Failure**: "Cannot connect to localhost:1420"

```bash
# Solution: Start dev server first
npm run dev
# Then in another terminal:
npm run test:visual
```

**No Screenshots Captured**

```bash
# Check Playwright is installed
npx playwright install chromium
```

**Mock Skills Not Loading**

```bash
# Verify mock data in src/hooks/useSkills.ts
# Ensure all required Skill fields are present:
# - name, description, location, path
# - content, content_clean
# - references, scripts, metadata
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

This application targets **WCAG 2.1 Level AA** compliance for accessibility.

**Current Status**: Feature 003 (Keyboard Shortcuts) achieved high accessibility compliance with:

- Full keyboard navigation support
- Screen reader compatibility with ARIA labels
- Focus management and keyboard trap prevention
- Visual focus indicators for all interactive elements

### Keyboard Navigation

All features are accessible via keyboard. See **Keyboard Shortcuts** section above for full reference.

**Core Navigation**:

- `Tab` / `Shift+Tab`: Move focus between interactive elements
- `Enter` / `Space`: Activate buttons and links
- `Escape`: Close modals, clear selections
- Arrow keys: Navigate lists

### Screen Reader Support

**Tested With**:

- VoiceOver (macOS)
- NVDA (Windows)
- JAWS (Windows)

**Features**:

- Semantic HTML elements (`<nav>`, `<main>`, `<button>`)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Focus announcements for state changes

### Testing Accessibility

```bash
# E2E tests include automated accessibility checks
npm run test:e2e

# Manual testing with screen readers
# - macOS: Cmd+F5 to toggle VoiceOver
# - Windows: Download NVDA (free, open-source)
```

**Automated Tools**:

- `@axe-core/playwright` (E2E tests)
- Chrome DevTools Lighthouse
- WAVE Browser Extension

### Accessibility Checklist

Before merging PRs, verify:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical and predictable
- [ ] Visual focus indicators are clearly visible
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Form inputs have associated labels
- [ ] Images have alt text (or `alt=""` for decorative images)
- [ ] Dynamic content changes are announced to screen readers
- [ ] No keyboard traps (user can always escape)

See [docs/ACCESSIBILITY.md](/Users/richardhightower/src/skill-debugger/docs/ACCESSIBILITY.md) for detailed accessibility guide.

---

## 📚 Documentation

### Specifications

- [specs/001-core-skill-explorer/spec.md](specs/001-core-skill-explorer/spec.md) - Core feature specification
- [specs/002-ui-redesign/spec.md](specs/002-ui-redesign/spec.md) - UI redesign specification
- [specs/IMPLEMENTATION_REALITY.md](specs/IMPLEMENTATION_REALITY.md) - Post-mortem audit
- [specs/BACKLOG.md](specs/BACKLOG.md) - Consolidated roadmap (70 tasks)

### Requirements

- [docs/requirements/main.md](docs/requirements/main.md) - Requirements entry point
- [docs/requirements/technical-architecture.md](docs/requirements/technical-architecture.md) - Architecture details
- [docs/requirements/ui-ux-requirements.md](docs/requirements/ui-ux-requirements.md) - UI acceptance criteria

### Constitutional Principles

- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Project principles (v1.1.0)

---

## 🎨 Design System

### Typography Scale

| Element         | Size            | Weight   |
| --------------- | --------------- | -------- |
| H1 (Skill Name) | 24px (1.5rem)   | Bold     |
| H2 (Section)    | 20px (1.25rem)  | Semibold |
| H3 (Subsection) | 16px (1rem)     | Semibold |
| Body            | 14px (0.875rem) | Normal   |
| Small           | 12px (0.75rem)  | Normal   |

### Color Palette

```css
--color-primary: #4f46e5 /* Indigo 600 */ --color-bg: #f9fafb /* Gray 50 */ --color-surface: #ffffff
  /* White */ --color-text: #111827 /* Gray 900 */ --color-text-muted: #6b7280 /* Gray 500 */
  --color-border: #e5e7eb /* Gray 200 */;
```

### Spacing (8px Grid)

All spacing uses multiples of 8px: `0, 4px, 8px, 16px, 24px, 32px, 40px, 48px`

---

## 🤝 Contributing

This project follows strict SDD methodology. Before contributing:

1. Read [.specify/memory/constitution.md](.specify/memory/constitution.md)
2. Review [specs/BACKLOG.md](specs/BACKLOG.md) for planned work
3. Follow the SDD workflow (no exceptions)
4. All PRs require tests (>80% coverage for new code)
5. No PRs without constitutional compliance statement

**Constitutional Requirements**:

- All core logic must have >80% test coverage (Principle VII)
- Follow platform design guidelines (Principle I)
- Developer-first design (Principle II)
- Read-only safety (Principle III)
- Cross-platform consistency (Principle IV)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines _(coming in v0.2.0)_.

---

## 📖 Performance Targets

| Metric                     | Target | Actual (v0.1.0) | Status      |
| -------------------------- | ------ | --------------- | ----------- |
| Cold start                 | <2s    | ~1.2s           | ✅ Exceeded |
| Skill scanning (20 skills) | <500ms | ~300ms          | ✅ Exceeded |
| UI rendering               | 60fps  | 60fps           | ✅ Met      |
| Memory usage               | <200MB | ~120MB          | ✅ Exceeded |
| Markdown rendering         | <100ms | ~50ms           | ✅ Exceeded |

---

## 🔒 Security

- ✅ **Read-only by default**: No file modifications
- ✅ **Local-only**: No network requests
- ✅ **Sandboxed file access**: Limited to skill directories
- ✅ **Content Security Policy**: Webview security
- ✅ **Input sanitization**: All user inputs validated

**Security Audit**: Planned for v0.4.0 (see BACKLOG: SEC-001)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details _(coming in v0.2.0)_.

---

## 🚦 Current Status

**Version**: v0.2.0 (in progress)
**Branch**: `003-keyboard-shortcuts`
**Status**: Keyboard Shortcuts Complete ✅

**What's Working**:

- ✅ Skill discovery and display
- ✅ Metadata parsing (YAML frontmatter)
- ✅ Markdown rendering
- ✅ Trigger analysis
- ✅ Diagram visualization
- ✅ Search and filtering
- ✅ **Keyboard shortcuts** (all 4 user stories)
- ✅ **Testing infrastructure** (97.12% coverage)
- ✅ **Accessibility** (ARIA attributes)

**What's Complete** (Feature 003):

- ✅ US1: Quick Search Access (Cmd/Ctrl+F)
- ✅ US2: Tab Navigation (Cmd/Ctrl+1-6)
- ✅ US3: List Navigation (Arrow keys)
- ✅ US4: Help Modal (? key)

**What's Missing** (see [BACKLOG.md](specs/BACKLOG.md)):

- ⚠️ ESLint/Prettier configuration
- ⚠️ Navigation history
- ⚠️ Skill editing capabilities
- ⚠️ Export/import features

**Next Up**: Merge to main, plan v0.3.0 features

---

## 📞 Support

For issues and feature requests:

- GitHub Issues: [https://github.com/SpillwaveSolutions/skills_viewer/issues](https://github.com/SpillwaveSolutions/skills_viewer/issues)

---

## 🎓 Learning Resources

**SDD Methodology**:

- Local skill: `~/.claude/skills/sdd/`
- Greenfield workflow: `~/.claude/skills/sdd/references/greenfield.md`
- Command reference: `~/.claude/skills/sdd/references/commands.md`

**Technologies**:

- [Tauri Documentation](https://tauri.app/)
- [React 19 Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

---

**Last Updated**: 2025-11-10
**Document Version**: 2.0 (Comprehensive rewrite with SDD documentation)
