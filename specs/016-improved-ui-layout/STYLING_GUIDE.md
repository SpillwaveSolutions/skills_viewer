# Visual Feedback Styling Guide

**Feature**: 016-improved-ui-layout - Phase 7
**Component**: Tab Navigation System
**Updated**: 2025-11-14

## Overview

This guide documents the complete visual feedback system for tab interactions, including all TailwindCSS classes, visual states, and accessibility features.

## Tab Component Classes

### Complete Class Breakdown

```tsx
<button
  className={`
    flex items-center gap-2 px-4 py-3
    border-b-2 transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
    ${isActive
      ? 'border-purple-500 text-purple-400 bg-gray-800 shadow-sm'
      : 'border-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-300'
    }
    font-medium text-sm
  `}
>
```

### Layout Classes

| Class          | Purpose            | Visual Effect                            |
| -------------- | ------------------ | ---------------------------------------- |
| `flex`         | Flexbox container  | Enables flexible layout                  |
| `items-center` | Vertical alignment | Centers icon, label, shortcut vertically |
| `gap-2`        | Spacing            | 0.5rem (8px) gap between children        |
| `px-4`         | Horizontal padding | 1rem (16px) left/right padding           |
| `py-3`         | Vertical padding   | 0.75rem (12px) top/bottom padding        |

### Typography Classes

| Class             | Purpose             | Visual Effect              |
| ----------------- | ------------------- | -------------------------- |
| `font-medium`     | Font weight         | 500 weight for readability |
| `text-sm`         | Font size           | 0.875rem (14px)            |
| `text-purple-400` | Active text color   | rgb(192, 132, 252)         |
| `text-gray-400`   | Inactive text color | rgb(156, 163, 175)         |
| `text-gray-300`   | Hover text color    | rgb(209, 213, 219)         |

### Border Classes

| Class                | Purpose             | Visual Effect     |
| -------------------- | ------------------- | ----------------- |
| `border-b-2`         | Bottom border width | 2px solid border  |
| `border-purple-500`  | Active border color | rgb(168, 85, 247) |
| `border-transparent` | Inactive border     | No visible border |

### Background Classes

| Class               | Purpose           | Visual Effect                 |
| ------------------- | ----------------- | ----------------------------- |
| `bg-gray-800`       | Active background | rgb(31, 41, 55)               |
| `bg-gray-700`       | Hover background  | rgb(55, 65, 81)               |
| `hover:bg-gray-700` | Hover state       | Applied on inactive tab hover |

### Shadow Classes

| Class       | Purpose           | Visual Effect                |
| ----------- | ----------------- | ---------------------------- |
| `shadow-sm` | Active tab shadow | Subtle drop shadow for depth |

### Transition Classes

| Class               | Purpose             | Visual Effect               |
| ------------------- | ------------------- | --------------------------- |
| `transition-colors` | Animated properties | Animates color changes only |
| `duration-150`      | Animation duration  | 150ms (0.15s)               |

### Focus Classes

| Class                        | Purpose                | Visual Effect                      |
| ---------------------------- | ---------------------- | ---------------------------------- |
| `focus:outline-none`         | Remove default outline | Cleaner custom focus indicator     |
| `focus:ring-2`               | Focus ring width       | 2px ring width                     |
| `focus:ring-purple-500`      | Focus ring color       | rgb(168, 85, 247)                  |
| `focus:ring-offset-2`        | Focus ring offset      | 2px space between element and ring |
| `focus:ring-offset-gray-800` | Offset color           | Matches dark background            |

## TabBar Component Classes

### Container Classes

```tsx
<div
  role="tablist"
  className="flex gap-1 border-b border-gray-700 bg-gray-800 px-4 transition-colors duration-150"
  aria-label="Skill content navigation"
>
```

| Class               | Purpose              | Visual Effect              |
| ------------------- | -------------------- | -------------------------- |
| `flex`              | Flexbox container    | Horizontal tab layout      |
| `gap-1`             | Tab spacing          | 0.25rem (4px) between tabs |
| `border-b`          | Bottom border        | 1px solid border           |
| `border-gray-700`   | Border color         | rgb(55, 65, 81)            |
| `bg-gray-800`       | Background           | rgb(31, 41, 55)            |
| `px-4`              | Horizontal padding   | 1rem (16px) left/right     |
| `transition-colors` | Animated transitions | Smooth color changes       |
| `duration-150`      | Animation duration   | 150ms                      |

## Visual State Matrix

### Active Tab

```css
border-bottom: 2px solid rgb(168, 85, 247); /* purple-500 */
color: rgb(192, 132, 252); /* purple-400 */
background: rgb(31, 41, 55); /* gray-800 */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
```

### Inactive Tab

```css
border-bottom: 2px solid transparent;
color: rgb(156, 163, 175); /* gray-400 */
background: transparent;
```

### Inactive Tab (Hover)

```css
border-bottom: 2px solid transparent;
color: rgb(209, 213, 219); /* gray-300 */
background: rgb(55, 65, 81); /* gray-700 */
```

### Any Tab (Focus)

```css
outline: none;
box-shadow: 0 0 0 2px rgb(168, 85, 247); /* ring-2 ring-purple-500 */
/* Plus 2px offset with gray-800 color */
```

## Keyboard Shortcut Badge

### Active Tab Badge

```tsx
<span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-purple-900 text-purple-300">
  {tab.shortcutIndex}
</span>
```

| Class             | Purpose            | Visual Effect                 |
| ----------------- | ------------------ | ----------------------------- |
| `ml-1`            | Left margin        | 0.25rem (4px) spacing         |
| `text-xs`         | Font size          | 0.75rem (12px)                |
| `px-1.5`          | Horizontal padding | 0.375rem (6px)                |
| `py-0.5`          | Vertical padding   | 0.125rem (2px)                |
| `rounded`         | Border radius      | 0.25rem (4px) rounded corners |
| `bg-purple-900`   | Background         | rgb(88, 28, 135)              |
| `text-purple-300` | Text color         | rgb(216, 180, 254)            |

### Inactive Tab Badge

```tsx
<span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-500">
  {tab.shortcutIndex}
</span>
```

| Class           | Purpose    | Visual Effect      |
| --------------- | ---------- | ------------------ |
| `bg-gray-700`   | Background | rgb(55, 65, 81)    |
| `text-gray-500` | Text color | rgb(107, 114, 128) |

## Accessibility Features

### Screen Reader Support

```tsx
// TabAnnouncer component
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement} {/* e.g., "Content tab active" */}
</div>
```

| Class     | Purpose            | Visual Effect             |
| --------- | ------------------ | ------------------------- |
| `sr-only` | Screen reader only | Hidden from sighted users |

### ARIA Attributes

```tsx
// Tab button
<button
  role="tab"
  aria-selected={isActive}
  aria-label={tab.ariaLabel}
  aria-controls={`tabpanel-${tab.id}`}
  id={`tab-${tab.id}`}
>
```

| Attribute       | Purpose           | Example            |
| --------------- | ----------------- | ------------------ |
| `role="tab"`    | Defines tab role  | ARIA role          |
| `aria-selected` | Active state      | `true` or `false`  |
| `aria-label`    | Accessible label  | "Content tab"      |
| `aria-controls` | Links to panel    | "tabpanel-content" |
| `id`            | Unique identifier | "tab-content"      |

## Animation Timing

### Transition Properties

```css
/* All color-related properties transition in 150ms */
transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 150ms;
```

### Performance Characteristics

- **Duration**: 150ms (as per FR-037)
- **Timing Function**: `ease` (default cubic-bezier)
- **Properties**: Only color-related (more performant than `transition-all`)
- **Hardware Acceleration**: Enabled via `will-change: auto` (implicit)

## Color Palette

### Purple (Active State)

- **purple-300**: `rgb(216, 180, 254)` - Badge text (active)
- **purple-400**: `rgb(192, 132, 252)` - Tab text (active)
- **purple-500**: `rgb(168, 85, 247)` - Border, focus ring (active)
- **purple-900**: `rgb(88, 28, 135)` - Badge background (active)

### Gray (Inactive/Neutral)

- **gray-300**: `rgb(209, 213, 219)` - Tab text (hover)
- **gray-400**: `rgb(156, 163, 175)` - Tab text (inactive)
- **gray-500**: `rgb(107, 114, 128)` - Badge text (inactive)
- **gray-700**: `rgb(55, 65, 81)` - Background (hover), border
- **gray-800**: `rgb(31, 41, 55)` - Background (active), TabBar

## Dark Mode Optimization

All colors are optimized for dark backgrounds:

- High contrast ratios (WCAG AA compliant)
- Visible focus indicators on dark backgrounds
- Ring offset matches background color (`ring-offset-gray-800`)

## Responsive Behavior

### Minimum Width

- Each tab: `auto` width based on content
- Minimum touch target: 44px × 44px (WCAG 2.1 Level AA)
- Padding ensures adequate touch area: `px-4 py-3` = 16px × 12px

### Flexible Layout

- TabBar uses `flex` with `gap-1`
- Tabs wrap gracefully if needed (future enhancement)
- No fixed widths - content-based sizing

## Browser Compatibility

### Supported Features

- ✅ Flexbox (all modern browsers)
- ✅ CSS Transitions (all modern browsers)
- ✅ CSS `calc()` (TailwindCSS uses internally)
- ✅ Custom properties (used by TailwindCSS)
- ✅ `box-shadow` (all modern browsers)

### Fallbacks

- Focus ring degrades gracefully (outline fallback)
- Transitions degrade to instant changes (no animation)
- Shadow degrades to no shadow (still usable)

## Testing Checklist

### Visual Regression

- [ ] Active tab shows purple border
- [ ] Active tab shows subtle shadow
- [ ] Inactive tabs have transparent border
- [ ] Hover shows gray background
- [ ] Focus shows purple ring with offset
- [ ] Transitions are smooth (150ms)

### Accessibility

- [ ] Tab key navigates between tabs
- [ ] Focus ring is visible
- [ ] Screen reader announces tab changes
- [ ] ARIA attributes are correct
- [ ] Keyboard shortcuts work (Cmd/Ctrl+1-6)

### Performance

- [ ] No jank during transitions
- [ ] No layout shift when changing tabs
- [ ] Smooth hover animations

## Usage Examples

### Basic Tab Implementation

```tsx
import { Tab } from './components/Tab';
import { TABS } from './types/layout';

<Tab
  tab={TABS[0]} // Overview tab
  index={0}
  isActive={activeTabIndex === 0}
  onClick={() => setActiveTabIndex(0)}
/>;
```

### Complete TabBar Implementation

```tsx
import { TabBar } from './components/TabBar';

<TabBar activeTabIndex={activeTabIndex ?? 0} onTabChange={(index) => setActiveTabIndex(index)} />;
```

### With Screen Reader Support

```tsx
import { TabBar } from './components/TabBar';
import { TabAnnouncer } from './components/TabAnnouncer';

<>
  <TabBar activeTabIndex={activeTabIndex ?? 0} onTabChange={(index) => setActiveTabIndex(index)} />
  <TabAnnouncer activeTabIndex={activeTabIndex} />
</>;
```

## Future Enhancements

### Potential Improvements

1. Add subtle scale transform on hover (`hover:scale-105`)
2. Add smooth shadow transition (`transition: box-shadow 150ms`)
3. Support custom theme colors via CSS variables
4. Add `prefers-reduced-motion` media query support
5. Add ripple effect on click (Material Design)
6. Add tab icons for additional visual context

### Performance Optimizations

1. Use `will-change: color` for frequently changing tabs
2. Debounce rapid tab switches (prevent transition overload)
3. Lazy-load tab content (reduce initial render time)

## References

- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **ARIA Tabs Pattern**: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Feature Spec**: `/specs/016-improved-ui-layout/spec.md`
- **Tasks**: `/specs/016-improved-ui-layout/tasks.md`
