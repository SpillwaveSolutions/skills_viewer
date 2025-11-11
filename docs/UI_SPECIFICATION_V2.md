# Skill Debugger UI Specification v2.0

## Overview

This specification addresses the critical issues identified in the current implementation and provides a revised design that:
- Properly separates YAML metadata from markdown content
- Uses a top overview panel instead of middle column
- Provides better visual hierarchy and usability

## Critical Issues Addressed

### 1. YAML Frontmatter Bleeding Through ✅
**Problem**: YAML headers display as plain text in markdown view

**Solution**:
- Parse YAML frontmatter separately before rendering markdown
- Display parsed metadata in Overview panel as structured data
- Strip YAML completely from Content tab

### 2. Layout Confusion ✅
**Problem**: Middle column takes space from detail view

**Solution**:
- Top overview panel (horizontal banner)
- Full-width detail panel below
- Sidebar remains on left

### 3. Description Placement ✅
**Problem**: Description in middle panel wastes space

**Solution**:
- Description shown at top of detail panel
- Overview panel shows only quick stats and trigger preview

## Revised Layout Structure

### Two-Row Layout with Sidebar

![Revised Layout v2.0](mockups/05_revised_layout_v2.png)

**Figure**: Revised layout showing top overview panel, description section, and full-width detail content.

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Overview Panel - Top Banner]                     │
│  250px     │  Full Width Above Detail Panel                     │
├────────────┼─────────────────────────────────────────────────────┤
│ [Sidebar]  │  [Detail Panel - Full Width]                       │
│            │  Description + Tabs + Content                      │
│ Search     │                                                     │
│ Filter     │  ┌─────────────────────────────────────────────┐   │
│ Skills     │  │ 📝 Description (from YAML)                  │   │
│  List      │  │ Detailed multi-line description...          │   │
│            │  └─────────────────────────────────────────────┘   │
│            │                                                     │
│            │  [Overview] [Content] [Triggers] [Diagram]         │
│            │  ┌─────────────────────────────────────────────┐   │
│            │  │ Tab Content (Pure Markdown - No YAML)       │   │
│            │  └─────────────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Overview Panel (Top Banner)

**Height**: 180px
**Position**: Top of detail area, full width
**Background**: White with subtle shadow

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│ architect-agent                                    📍 claude  ⚙️ │
│ 📊 Quick Stats              │  🎯 Common Triggers                │
│ ┌──────────┬──────────┐    │  [create] [architect] [agent]     │
│ │📚 Refs: 5│🔧 Scripts│    │  [instructions] [delegation]      │
│ │          │     2    │    │  [planning]                        │
│ ├──────────┼──────────┤    │  View all 24 triggers →           │
│ │🎯 Triggers│📏 Lines │    │                                   │
│ │    24    │  1,245   │    │                                   │
│ └──────────┴──────────┘    │                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key Elements**:
- Skill name (24px bold) with location badge
- 2x2 quick stats grid (left side)
- Trigger preview with top 6 keywords (right side)
- Settings/actions menu (top right corner)

### 2. Detail Panel - Description Section

**Position**: Top of detail panel, below overview
**Background**: Light blue/gray tint (#F8FAFC)
**Padding**: 24px

```
┌────────────────────────────────────────────────────────┐
│ 📝 Description                                         │
│                                                        │
│ Transform an AI agent from the architect role into    │
│ detailed, protocol-compliant instructions for code    │
│ agent execution. Creates delegation instructions,     │
│ initializes workspace structure, and grades work.     │
│                                                        │
│ Metadata:                                             │
│ • Location: claude                                    │
│ • Type: project, gitignored                           │
│ • Last Updated: 2 days ago                            │
└────────────────────────────────────────────────────────┘
```

**Content Source**: Parsed from YAML `description` field

### 3. Detail Panel - Tab Content

**Tabs**: `[Overview] [Content] [Triggers] [Diagram] [References] [Scripts]`

#### Content Tab (Default)

**Purpose**: Display skill documentation (SKILL.md) without YAML

**Implementation**:
```typescript
// Parse and strip YAML frontmatter
function parseSkillMarkdown(rawContent: string) {
  const yamlMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n/);

  if (yamlMatch) {
    const yamlContent = yamlMatch[1];
    const markdown = rawContent.replace(/^---\n[\s\S]*?\n---\n/, '');

    return {
      metadata: parseYAML(yamlContent),
      markdown: markdown.trim()
    };
  }

  return {
    metadata: {},
    markdown: rawContent
  };
}
```

**Display**:
- Pure markdown rendered with ReactMarkdown
- Syntax highlighting for code blocks
- No YAML visible anywhere
- Clean, readable typography

### 4. Sidebar Skill List Item

**Height**: 64px (reduced from 72px)
**Content**:
```
┌──────────────────────────────┐
│ architect-agent              │
│ 📍 claude                    │
│ 5 refs · 2 scripts · 24 trg │
└──────────────────────────────┘
```

**Hover State**: Light blue background (#F0F4FF)
**Selected State**: Blue background (#EEF2FF) + left border (3px #4F46E5)

## YAML Metadata Handling

### Supported YAML Fields

```yaml
---
name: string                 # Skill identifier
description: string          # Brief description (1-3 sentences)
location: string            # "claude" or "opencode"
tags: string[]              # Optional tags
category: string            # Optional category
last_modified: date         # Auto-generated
version: string             # Optional version
dependencies: string[]      # Optional dependencies
---
```

### Where Metadata Appears

| YAML Field | Display Location | How Displayed |
|------------|------------------|---------------|
| `name` | Overview Panel, Browser Tab | H1 heading |
| `description` | Description Section | Paragraph text |
| `location` | Overview Panel, Skill List | Badge |
| `tags` | Overview tab | Pill badges |
| `category` | Overview tab | Label |
| `last_modified` | Description Section | Small gray text |
| `version` | Description Section | Badge |
| `dependencies` | Overview tab | List |

### Metadata Parsing

```typescript
interface SkillMetadata {
  name: string;
  description?: string;
  location: 'claude' | 'opencode' | 'user';
  tags?: string[];
  category?: string;
  last_modified?: Date;
  version?: string;
  dependencies?: string[];
}

function parseYAML(yamlString: string): SkillMetadata {
  // Use js-yaml or similar
  const parsed = YAML.parse(yamlString);

  return {
    name: parsed.name || 'Unnamed Skill',
    description: parsed.description || '',
    location: parsed.location || 'user',
    tags: parsed.tags || [],
    category: parsed.category,
    last_modified: parsed.last_modified ? new Date(parsed.last_modified) : undefined,
    version: parsed.version,
    dependencies: parsed.dependencies || []
  };
}
```

## Updated Component Tree

```
App
├── Sidebar (250px fixed)
│   ├── Header (branding)
│   ├── SearchBar
│   ├── LocationFilter
│   └── SkillList
│       └── SkillListItem[]
│
└── MainContent (flex: 1)
    ├── OverviewPanel (180px fixed height)
    │   ├── SkillHeader (name, location, actions)
    │   ├── QuickStatsGrid (2x2)
    │   └── TriggerPreview
    │
    └── DetailPanel (flex: 1)
        ├── DescriptionSection (from YAML)
        ├── TabNavigation
        └── TabContent
            ├── OverviewTab
            ├── ContentTab (markdown only, no YAML)
            ├── TriggersTab
            ├── DiagramTab
            ├── ReferencesTab
            └── ScriptsTab
```

## Critical Fixes Implementation

### 1. Strip YAML from Content View

**File**: `src/components/SkillViewer.tsx`

```typescript
import { useMemo } from 'react';

export const SkillViewer: React.FC = () => {
  const { selectedSkill } = useSkillStore();

  const { metadata, cleanMarkdown } = useMemo(() => {
    if (!selectedSkill) return { metadata: {}, cleanMarkdown: '' };

    const yamlMatch = selectedSkill.content.match(/^---\n([\s\S]*?)\n---\n/);

    if (yamlMatch) {
      const yamlContent = yamlMatch[1];
      const markdown = selectedSkill.content.replace(/^---\n[\s\S]*?\n---\n/, '');

      return {
        metadata: parseYAML(yamlContent),
        cleanMarkdown: markdown.trim()
      };
    }

    return {
      metadata: {},
      cleanMarkdown: selectedSkill.content
    };
  }, [selectedSkill]);

  // Use metadata for Overview Panel
  // Use cleanMarkdown for Content Tab
};
```

### 2. Overview Panel Component

**File**: `src/components/OverviewPanel.tsx`

```typescript
interface OverviewPanelProps {
  skill: Skill;
  metadata: SkillMetadata;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ skill, metadata }) => {
  return (
    <div className="overview-panel bg-white border-b border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{metadata.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            metadata.location === 'claude'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'
          }`}>
            📍 {metadata.location}
          </span>
          <button className="p-2 hover:bg-gray-100 rounded">⚙️</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="📚" label="References" value={skill.references.length} />
            <StatCard icon="🔧" label="Scripts" value={skill.scripts.length} />
            <StatCard icon="🎯" label="Triggers" value={skill.trigger_count || 0} />
            <StatCard icon="📏" label="Lines" value={skill.line_count || 0} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Common Triggers</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {skill.top_triggers?.slice(0, 6).map((trigger, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                {trigger}
              </span>
            ))}
          </div>
          <a href="#triggers" className="text-sm text-blue-600 hover:underline">
            View all {skill.trigger_count} triggers →
          </a>
        </div>
      </div>
    </div>
  );
};
```

### 3. Description Section Component

**File**: `src/components/DescriptionSection.tsx`

```typescript
interface DescriptionSectionProps {
  metadata: SkillMetadata;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ metadata }) => {
  if (!metadata.description) return null;

  return (
    <div className="description-section bg-slate-50 border-b border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        📝 Description
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        {metadata.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        {metadata.category && (
          <span>Category: <strong>{metadata.category}</strong></span>
        )}
        {metadata.version && (
          <span className="px-2 py-1 bg-gray-200 rounded">v{metadata.version}</span>
        )}
        {metadata.last_modified && (
          <span>Updated: {formatRelativeTime(metadata.last_modified)}</span>
        )}
      </div>
    </div>
  );
};
```

### 4. Updated Layout Component

**File**: `src/components/Layout.tsx`

```typescript
export const Layout: React.FC = () => {
  const { selectedSkill } = useSkillStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - 250px fixed */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Skill Debugger</h1>
          <p className="text-sm text-gray-600 mt-1">Browse and analyze skills</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SkillList />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedSkill ? (
          <>
            {/* Overview Panel - Top Banner */}
            <OverviewPanel skill={selectedSkill} />

            {/* Detail Panel - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <DescriptionSection skill={selectedSkill} />
              <SkillViewer />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Welcome to Skill Debugger
              </h2>
              <p className="text-gray-600">
                Select a skill from the sidebar to view details
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
```

## Visual Improvements

### Typography Scale

```css
/* Headings */
.text-2xl { font-size: 24px; font-weight: 700; } /* Skill name */
.text-xl  { font-size: 20px; font-weight: 600; } /* Section titles */
.text-lg  { font-size: 18px; font-weight: 600; } /* Subsections */
.text-base{ font-size: 16px; font-weight: 400; } /* Body text */
.text-sm  { font-size: 14px; font-weight: 400; } /* Small text */
.text-xs  { font-size: 12px; font-weight: 400; } /* Tiny text */
```

### Spacing

```css
/* Content padding */
.p-6  { padding: 24px; }  /* Content areas */
.p-4  { padding: 16px; }  /* Cards */
.p-3  { padding: 12px; }  /* Compact areas */

/* Margins */
.mb-6 { margin-bottom: 24px; } /* Between sections */
.mb-4 { margin-bottom: 16px; } /* Between elements */
.mb-2 { margin-bottom: 8px; }  /* Between small items */
```

### Colors

```css
/* Backgrounds */
--bg-app: #F9FAFB;        /* Main background */
--bg-panel: #FFFFFF;      /* Panels/cards */
--bg-description: #F8FAFC; /* Description section */

/* Borders */
--border-default: #E5E7EB;
--border-hover: #D1D5DB;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;

/* Accents */
--accent-blue: #4F46E5;
--accent-purple: #8B5CF6;
--accent-green: #10B981;
```

## Implementation Checklist

### Phase 1: Critical Fixes (Week 1)
- [ ] Implement YAML parsing in Rust backend
- [ ] Strip YAML frontmatter before sending to frontend
- [ ] Create OverviewPanel component (top banner)
- [ ] Create DescriptionSection component
- [ ] Update Layout to use two-row structure
- [ ] Ensure Content tab shows only markdown (no YAML)

### Phase 2: Polish (Week 2)
- [ ] Add proper typography scale
- [ ] Implement spacing system
- [ ] Add card shadows and borders
- [ ] Create QuickStatsGrid component
- [ ] Add TriggerPreview component
- [ ] Improve color contrast

### Phase 3: Enhancement (Week 3)
- [ ] Add hover states and transitions
- [ ] Implement loading states
- [ ] Add collapsible sections
- [ ] Create export functionality
- [ ] Add keyboard navigation

## Success Criteria

1. ✅ YAML never appears in Content tab
2. ✅ Description shown prominently at top of detail panel
3. ✅ Overview panel provides at-a-glance information
4. ✅ Full-width detail panel for comfortable reading
5. ✅ Professional visual design with proper hierarchy
6. ✅ Responsive and performant

## Conclusion

This revised specification addresses the critical layout and content parsing issues while maintaining the goal of a professional, user-friendly interface. The top banner overview panel provides quick information without sacrificing detail panel real estate, and proper YAML handling ensures clean markdown rendering.
