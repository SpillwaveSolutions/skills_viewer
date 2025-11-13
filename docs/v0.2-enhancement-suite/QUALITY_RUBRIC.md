# Skill Quality Assessment Rubric

## Overview

This document defines the comprehensive quality scoring system for Claude Code skills, including algorithms, thresholds, and recommendation mappings.

## Scoring Philosophy

A "good" skill:
1. **Efficient**: Doesn't waste context with unnecessary content
2. **Progressive**: Uses references/ for detailed information
3. **Actionable**: Provides scripts for deterministic tasks
4. **Discoverable**: Has clear, unambiguous triggers
5. **Self-documenting**: Description explains when/how to use it
6. **Well-structured**: Follows progressive disclosure patterns

## Overall Score Formula

```typescript
overall_score = (
  size_score * 0.25 +
  references_score * 0.20 +
  scripts_score * 0.20 +
  triggers_score * 0.15 +
  description_score * 0.15 +
  disclosure_score * 0.10
)
```

Total possible: **100 points**

---

## Criterion 1: SKILL.md Size

**Weight**: 25% (25 points)
**Rationale**: Large SKILL.md files consume context budget inefficiently

### Scoring Algorithm

```typescript
function calculateSizeScore(wordCount: number): number {
  if (wordCount <= 5000) {
    return 100;
  }

  // Linear penalty: lose 2 points per 100 words over 5000
  const excessWords = wordCount - 5000;
  const penalty = (excessWords / 100) * 2;

  return Math.max(0, 100 - penalty);
}
```

### Thresholds

| Word Count | Score | Rating | Color |
|------------|-------|--------|-------|
| 0-5000 | 100 | ✓ Excellent | Green |
| 5001-7500 | 50-99 | ⚠ Good but could improve | Yellow |
| 7501-10000 | 0-49 | ✗ Too large | Red |
| 10000+ | 0 | ✗ Way too large | Red |

### Recommendations

**If word_count > 5000:**
- "Your SKILL.md is {word_count} words. Consider moving sections to references/"
- "Large skills consume context budget. Target: <5000 words"

**If word_count > 7500:**
- "🚨 URGENT: SKILL.md is too large ({word_count} words)"
- "Break into smaller reference files immediately"
- Analyze headings and suggest specific sections to extract

**If word_count > 10000:**
- "❌ CRITICAL: SKILL.md is extremely large ({word_count} words)"
- "This skill will dominate context and may not trigger properly"
- "REQUIRED: Refactor into references/ before using"

---

## Criterion 2: References Usage

**Weight**: 20% (20 points)
**Rationale**: Progressive disclosure via references/ is best practice

### Scoring Algorithm

```typescript
function calculateReferencesScore(
  referencesDir: string | null,
  referenceCount: number,
  totalReferenceSize: number
): number {
  if (!referencesDir) {
    return 0; // No references/ directory
  }

  if (referenceCount === 0) {
    return 50; // Directory exists but empty
  }

  // Score based on number of reference files
  if (referenceCount >= 5) {
    return 100;
  } else if (referenceCount >= 3) {
    return 80;
  } else if (referenceCount >= 1) {
    return 60;
  }

  return 50;
}
```

### Thresholds

| Reference Files | Score | Rating | Color |
|-----------------|-------|--------|-------|
| ≥5 | 100 | ✓ Excellent | Green |
| 3-4 | 80 | ✓ Good | Green |
| 1-2 | 60 | ⚠ Okay | Yellow |
| 0 (dir exists) | 50 | ⚠ Unused | Yellow |
| No directory | 0 | ✗ Missing | Red |

### Recommendations

**If no references/ directory:**
- "Create a `references/` directory for detailed documentation"
- "Move API docs, examples, and tutorials to references/"
- "Example structure: `references/quickstart.md`, `references/api.md`"

**If references/ empty:**
- "You have a `references/` directory but it's empty"
- "Consider moving these sections from SKILL.md:"
  - Long examples
  - API documentation
  - Troubleshooting guides
  - Advanced usage patterns

**If 1-2 references:**
- "Good start! Consider adding more reference files:"
  - `references/examples.md` - Common use cases
  - `references/api.md` - Detailed API documentation
  - `references/troubleshooting.md` - Common issues

**If ≥3 references:**
- "✓ Great use of references/ for progressive disclosure"
- "Keep SKILL.md concise and use references for details"

---

## Criterion 3: Scripts Usage

**Weight**: 20% (20 points)
**Rationale**: Scripts offload deterministic work from LLM

### Scoring Algorithm

```typescript
function calculateScriptsScore(
  scriptsDir: string | null,
  scriptCount: number,
  languages: string[]
): number {
  if (!scriptsDir) {
    return 0; // No scripts/ directory
  }

  if (scriptCount === 0) {
    return 50; // Directory exists but empty
  }

  // Base score from script count
  let score = Math.min(100, 60 + (scriptCount * 10));

  // Bonus for diverse languages
  if (languages.length >= 2) {
    score = Math.min(100, score + 10);
  }

  return score;
}
```

### Thresholds

| Scripts | Score | Rating | Color |
|---------|-------|--------|-------|
| ≥4 | 100 | ✓ Excellent | Green |
| 2-3 | 70-90 | ✓ Good | Green |
| 1 | 60-70 | ⚠ Minimal | Yellow |
| 0 (dir exists) | 50 | ⚠ Unused | Yellow |
| No directory | 0 | ✗ Missing | Red |

### Recommendations

**If no scripts/ directory:**
- "Create a `scripts/` directory for helper scripts"
- "Offload deterministic operations to scripts (Python, Bash, etc.)"
- Suggest scripts based on skill type:
  - PDF skills → `scripts/rotate_pdf.py`, `scripts/merge_pdfs.py`
  - Excel skills → `scripts/analyze_sheets.py`
  - Image skills → `scripts/resize_image.py`

**If scripts/ empty:**
- "You have a `scripts/` directory but it's empty"
- "Consider adding scripts for common operations"
- "Scripts are token-efficient: execute without loading into context"

**If 1 script:**
- "Good! You have a helper script"
- "Consider adding more scripts for other common operations"

**If ≥2 scripts:**
- "✓ Excellent use of scripts for deterministic operations"
- "This reduces LLM workload and improves reliability"

---

## Criterion 4: Clear Triggers

**Weight**: 15% (15 points)
**Rationale**: Explicit triggers improve skill matching accuracy

### Scoring Algorithm

```typescript
function calculateTriggersScore(
  triggers: string[] | undefined,
  description: string
): number {
  if (!triggers || triggers.length === 0) {
    // Check if description has trigger-like keywords
    const implicitTriggers = extractTriggerKeywordsFromDescription(description);
    if (implicitTriggers.length >= 3) {
      return 40; // Some implicit triggers
    }
    return 0; // No triggers at all
  }

  // Score based on trigger count and quality
  const triggerCount = triggers.length;

  if (triggerCount >= 7) {
    return 100;
  } else if (triggerCount >= 5) {
    return 85;
  } else if (triggerCount >= 3) {
    return 70;
  } else if (triggerCount >= 1) {
    return 50;
  }

  return 0;
}
```

### Thresholds

| Triggers | Score | Rating | Color |
|----------|-------|--------|-------|
| ≥7 | 100 | ✓ Excellent | Green |
| 5-6 | 85 | ✓ Good | Green |
| 3-4 | 70 | ⚠ Okay | Yellow |
| 1-2 | 50 | ⚠ Minimal | Yellow |
| 0 | 0-40 | ✗ Missing | Red |

### Trigger Quality Factors

**Good triggers are:**
- **Specific**: "pdf rotation" not just "pdf"
- **Unambiguous**: "convert excel to json" not "convert"
- **Action-oriented**: Include verbs (create, analyze, convert)
- **Format-aware**: Include file types (xlsx, docx, md)

**Poor triggers are:**
- Too generic ("help", "code", "file")
- Overlapping with many other skills
- Ambiguous ("process", "handle", "manage")

### Recommendations

**If 0 triggers:**
- "⚠️ No explicit triggers defined in YAML frontmatter"
- "Add triggers to improve skill discoverability"
- "Format: `triggers: ['keyword1', 'keyword2', ...]`"

**If 1-2 triggers:**
- "You have minimal triggers. Add more for better matching"
- "Include: action verbs, file formats, technology names"
- "Examples: 'pdf', 'rotate pdf', 'merge documents'"

**If 3-4 triggers:**
- "Good trigger coverage. Consider adding more specific keywords"
- "Diversify: actions, formats, domain terms"

**If 5-6 triggers:**
- "✓ Good trigger coverage"
- "Ensure triggers are specific and unambiguous"

**If ≥7 triggers:**
- "✓ Excellent trigger coverage"
- "Your skill should be highly discoverable"

---

## Criterion 5: Description Clarity

**Weight**: 15% (15 points)
**Rationale**: Clear descriptions help both users and LLM understand when to use the skill

### Scoring Algorithm

```typescript
function calculateDescriptionScore(
  description: string | undefined,
  metadata: Record<string, any>
): number {
  if (!description || description.trim().length === 0) {
    return 0;
  }

  let score = 40; // Base score for having a description

  // Check for key phrases
  const hasWhenToUse = /when to use|use this|should.*use/i.test(description);
  const hasExamples = /example|for instance|such as/i.test(description);
  const hasPurpose = /this skill|purpose|helps?|enables?/i.test(description);

  if (hasPurpose) score += 20;
  if (hasWhenToUse) score += 25;
  if (hasExamples) score += 15;

  return Math.min(100, score);
}
```

### Thresholds

| Description Quality | Score | Rating | Color |
|---------------------|-------|--------|-------|
| Purpose + When + Examples | 100 | ✓ Excellent | Green |
| Purpose + When | 85 | ✓ Good | Green |
| Purpose only | 60 | ⚠ Basic | Yellow |
| Vague or generic | 40 | ⚠ Poor | Yellow |
| Missing | 0 | ✗ None | Red |

### Good Description Template

```yaml
---
name: skill-name
description: This skill [PURPOSE]. Use this skill when [WHEN TO USE]. For example, [EXAMPLE]. It helps [BENEFIT].
---
```

### Recommendations

**If no description:**
- "❌ No description defined"
- "Add a clear description explaining what the skill does and when to use it"

**If vague description:**
- "⚠️ Description lacks key information"
- "Include: What it does, when to use it, example use cases"

**If basic description (purpose only):**
- "Good start! Enhance your description with:"
  - "When to use: Specify scenarios where this skill helps"
  - "Examples: Provide concrete use cases"

**If good description:**
- "✓ Clear, informative description"
- "Includes purpose, usage context, and examples"

---

## Criterion 6: Progressive Disclosure

**Weight**: 10% (10 points)
**Rationale**: Good skills keep main file concise, details in references/

### Scoring Algorithm

```typescript
function calculateDisclosureScore(
  skillMdSize: number,
  referencesTotalSize: number
): number {
  if (referencesTotalSize === 0) {
    // No references - all content in SKILL.md
    return 0;
  }

  const ratio = referencesTotalSize / skillMdSize;

  if (ratio >= 2.0) {
    return 100; // References 2x+ larger than SKILL.md - excellent
  } else if (ratio >= 1.0) {
    return 75; // References ≈ SKILL.md - good
  } else if (ratio >= 0.5) {
    return 50; // References smaller but present
  } else {
    return 25; // Very small references
  }
}
```

### Thresholds

| References/SKILL.md Ratio | Score | Rating | Color |
|---------------------------|-------|--------|-------|
| ≥2.0 | 100 | ✓ Excellent | Green |
| 1.0-1.9 | 75 | ✓ Good | Green |
| 0.5-0.9 | 50 | ⚠ Okay | Yellow |
| 0.1-0.4 | 25 | ⚠ Poor | Yellow |
| 0 | 0 | ✗ None | Red |

### Recommendations

**If ratio = 0 (no references):**
- "All content is in SKILL.md - no progressive disclosure"
- "Move detailed sections to references/"
- "Keep SKILL.md as a concise guide, not exhaustive docs"

**If ratio < 0.5:**
- "SKILL.md is much larger than references/"
- "Move more detailed content to reference files"
- "Target: references/ should be ≥50% of SKILL.md size"

**If ratio 0.5-1.0:**
- "Good balance between SKILL.md and references/"
- "Consider moving more detail to references/ for better disclosure"

**If ratio ≥1.0:**
- "✓ Excellent progressive disclosure"
- "SKILL.md is concise, details in references/"
- "This pattern optimizes context usage"

---

## Rating Bands

### Overall Score Interpretation

| Overall Score | Grade | Rating | Recommendation |
|---------------|-------|--------|----------------|
| 90-100 | A+ | ⭐ Excellent | This is a well-structured skill following all best practices |
| 80-89 | A | ✓ Very Good | Minor improvements possible but solid overall |
| 70-79 | B | ✓ Good | Some improvements recommended |
| 60-69 | C | ⚠ Acceptable | Several improvements needed |
| 50-59 | D | ⚠ Needs Work | Significant improvements required |
| 0-49 | F | ✗ Poor | Major restructuring needed |

---

## Example Skill Analysis

### Example 1: "pdf-editor" Skill

**Metrics:**
- SKILL.md size: 3,200 words
- References: 4 files (12,500 words total)
- Scripts: 3 files (rotate.py, merge.py, split.py)
- Triggers: 8 keywords (pdf, rotate, merge, split, pdf editor, pdf manipulation, convert pdf, extract pages)
- Description: "This skill helps with PDF manipulation. Use when you need to rotate, merge, or split PDF files. For example, 'rotate this PDF 90 degrees' or 'merge these PDFs into one'."

**Scores:**
- Size: 100 (3,200 ≤ 5,000)
- References: 100 (4 files)
- Scripts: 100 (3 scripts)
- Triggers: 100 (8 triggers)
- Description: 100 (purpose + when + examples)
- Disclosure: 100 (12,500 / 3,200 = 3.9 ratio)

**Overall Score: 100 (A+) ⭐ Excellent**

---

### Example 2: "api-helper" Skill

**Metrics:**
- SKILL.md size: 8,500 words
- References: 0 files
- Scripts: 0 files
- Triggers: 2 keywords (api, help)
- Description: "Helps with API stuff"

**Scores:**
- Size: 30 (8,500 words - heavy penalty)
- References: 0 (no directory)
- Scripts: 0 (no directory)
- Triggers: 50 (only 2 generic triggers)
- Description: 40 (vague, no examples)
- Disclosure: 0 (no references)

**Overall Score: 24 (F) ✗ Poor**

**Critical Issues:**
1. SKILL.md too large (needs immediate refactoring)
2. No progressive disclosure (everything inline)
3. Generic triggers (won't match effectively)
4. Vague description

---

## Implementation Notes

### Frontend Display

```typescript
interface QualityReport {
  overall_score: number;
  grade: string;
  rating: string;
  criteria: {
    size: CriterionResult;
    references: CriterionResult;
    scripts: CriterionResult;
    triggers: CriterionResult;
    description: CriterionResult;
    disclosure: CriterionResult;
  };
  recommendations: string[];
  refactorSuggestions: RefactorSuggestion[];
}

interface CriterionResult {
  score: number;
  weight: number;
  weighted_score: number;
  status: '✓' | '⚠' | '✗';
  color: 'green' | 'yellow' | 'red';
  description: string;
}

interface RefactorSuggestion {
  severity: 'critical' | 'important' | 'suggestion';
  section: string;
  current_location: 'SKILL.md';
  suggested_location: string; // e.g., "references/api.md"
  reason: string;
  estimated_impact: string; // e.g., "+15 points to size score"
}
```

### Radar Chart Configuration

```typescript
const radarChartData = {
  labels: ['Size', 'References', 'Scripts', 'Triggers', 'Description', 'Disclosure'],
  datasets: [{
    label: 'Current Skill',
    data: [
      criteria.size.score,
      criteria.references.score,
      criteria.scripts.score,
      criteria.triggers.score,
      criteria.description.score,
      criteria.disclosure.score,
    ],
    fill: true,
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgb(54, 162, 235)',
    pointBackgroundColor: 'rgb(54, 162, 235)',
  }],
};
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-12
**Status**: Ready for Implementation
