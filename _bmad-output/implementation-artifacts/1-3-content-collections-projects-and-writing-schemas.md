# Story 1.3: Content Collections — Projects & Writing Schemas

Status: done

## Story

As LinCie,
I want typed content collections for projects and writing with validated frontmatter,
so that I can publish new content by dropping a Markdown file with confidence that invalid data fails the build.

## Acceptance Criteria

1. `src/content/config.ts` defines a `projects` collection with Zod schema: `title` (string), `description` (string), `date` (string, YYYY-MM-DD), `disciplines` (string[]), `draft` (boolean), `order` (number)
2. `src/content/config.ts` defines a `writing` collection with Zod schema: `title` (string), `subtitle` (optional string), `description` (string), `date` (string, YYYY-MM-DD), `draft` (boolean), `order` (number)
3. At least one sample project file exists in `src/content/projects/` with valid frontmatter
4. At least one sample essay file exists in `src/content/writing/` with valid frontmatter and at least one footnote reference (`[^1]`) in the first paragraph
5. A content file with invalid frontmatter causes `bun run build` to fail
6. Draft content (`draft: true`) is excluded from production builds
7. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/content/config.ts` with Zod schemas (AC: #1, #2)
  - [x] 1.1: Create `src/content/` directory
  - [x] 1.2: Create `src/content/config.ts` — define `projects` collection with Zod schema
  - [x] 1.3: Add `writing` collection with Zod schema (subtitle optional)
  - [x] 1.4: Export both collections via `defineCollection` and `collections` named export
- [x] Task 2: Create sample project content file (AC: #3)
  - [x] 2.1: Create `src/content/projects/` directory
  - [x] 2.2: Create `src/content/projects/building-lincie.md` with all required frontmatter fields
  - [x] 2.3: Write short but real prose body (2–3 paragraphs) — this is LinCie's actual content
- [x] Task 3: Create sample essay content file (AC: #4)
  - [x] 3.1: Create `src/content/writing/` directory
  - [x] 3.2: Create `src/content/writing/craft-as-proof.md` with all required frontmatter fields
  - [x] 3.3: Ensure first paragraph contains at least one footnote reference (`[^1]`)
  - [x] 3.4: Add footnote definition at the bottom of the file
  - [x] 3.5: Write short but real prose body (2–3 paragraphs) in LinCie's voice
- [x] Task 4: Validate (AC: #5, #6, #7)
  - [x] 4.1: Run `bun run format`
  - [x] 4.2: Run `bun run lint`
  - [x] 4.3: Run `bun run check` — verify Astro type-checks the collection schemas
  - [x] 4.4: Verify `bun run build` succeeds with the sample content (both files with `draft: false`)
  - [x] 4.5: Verify schema rejects invalid frontmatter: temporarily add a file with a missing required field (e.g., omit `order`) and confirm `bun run build` fails with a Zod validation error

## Dev Notes

### Files to Create

| File | Action | Notes |
|------|--------|-------|
| `src/content.config.ts` | CREATE | Zod schemas for both collections (Astro 6 location) |
| `src/content/projects/building-lincie.md` | CREATE | Sample project with valid frontmatter |
| `src/content/writing/craft-as-proof.md` | CREATE | Sample essay with footnote in first paragraph |

No existing files are modified in this story.

### Astro Content Collections — Implementation Pattern

Astro 6 uses the `defineCollection` + `glob()` loader API. The config file must be at `src/content.config.ts` exactly (at the `src/` level, not inside `src/content/`) — Astro discovers it automatically.

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),           // YYYY-MM-DD — kept as string per architecture spec
    disciplines: z.array(z.string()),
    draft: z.boolean(),
    order: z.number(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    date: z.string(),           // YYYY-MM-DD
    draft: z.boolean(),
    order: z.number(),
  }),
});

export const collections = { projects, writing };
```

**Critical details:**
- Config file is `src/content.config.ts` — NOT `src/content/config.ts` (the legacy location removed in Astro 6)
- Each collection requires a `loader` — use `glob()` from `'astro/loaders'` for Markdown files
- `z` must be imported from `'astro/zod'` — importing from `'astro:content'` triggers deprecation hints in Astro 6
- `defineCollection` is imported from `'astro:content'` as before
- `date` is `z.string()` not `z.date()` — architecture spec keeps it as a string (YYYY-MM-DD format)
- `subtitle` uses `.optional()` — not `.nullable()` — so it can be omitted from frontmatter entirely
- The named export `collections` is required — Astro discovers collections via this export
- No `z.coerce.date()` — the architecture explicitly chose string dates for simplicity

### Frontmatter Schema — Exact Field Requirements

**Projects schema:**
```yaml
title: string          # display title
description: string    # meta description + home page teaser
date: string           # YYYY-MM-DD
disciplines: string[]  # e.g. ["Engineering", "Research"]
draft: boolean         # excluded from build when true
order: number          # display order on home/index
```

**Writing schema:**
```yaml
title: string          # required
subtitle: string       # optional — omit entirely if not needed
description: string    # required
date: string           # YYYY-MM-DD
draft: boolean         # required
order: number          # required
```

### Sample Content Files — Exact Format

**`src/content/projects/building-lincie.md`:**
```markdown
---
title: "Building LinCie"
description: "A considered personal site — engineering, research, and design as one voice."
date: "2026-05-21"
disciplines: ["Engineering", "Design"]
draft: false
order: 1
---

[prose body here — 2–3 paragraphs in LinCie's voice]
```

**`src/content/writing/craft-as-proof.md`:**
```markdown
---
title: "Craft as Proof"
description: "On why the work itself is the argument."
date: "2026-05-21"
draft: false
order: 1
---

[First paragraph must contain at least one footnote reference, e.g. `[^1]`]

[^1]: [footnote text here]
```

### Footnote Syntax — Required for Essay

The architecture specifies standard Markdown `[^1]` footnote syntax. The essay file **must** have at least one footnote reference in the first paragraph — this is a hard requirement (AC #4) and is also required by the UX spec (UX-DR4: bidirectional footnote navigation).

Correct syntax:
```markdown
Engineering and design are the same voice[^1]. The site exhibits and reads.

[^1]: This is supplementary context — never essential to understanding the main text.
```

The footnote definition (`[^1]:`) goes at the bottom of the file. Astro's built-in remark processor handles `[^1]` syntax natively — no additional remark plugin is needed.

### Draft Filtering — How It Works

Draft filtering is NOT automatic in Astro Content Collections. Pages must explicitly filter:

```typescript
// In page frontmatter scripts (Stories 1.4, 1.5, 2.x):
const projects = await getCollection('projects', ({ data }) => !data.draft);
const essays = await getCollection('writing', ({ data }) => !data.draft);
```

This story only defines the schema and sample content. The actual `getCollection()` calls with draft filtering happen in Stories 1.4 and 1.5. However, AC #6 requires verifying the filtering works — test it manually during validation (Task 4.5).

### Content Voice — LinCie's Writing Style

Content must be in LinCie's voice (from UX spec and DESIGN.md):
- Quiet confidence — no "I'm passionate about" copy, no buzzword lists
- Engineering, research, and design as expressions of the same considered voice
- The site "exhibits and reads" — it does not announce, summarize, or sell
- Footnotes are supplementary — never essential to understanding the main text

The sample content is real content that will appear on the live site. Write it as if it's the actual first project and essay, not placeholder text.

### File Naming Convention

Content files use kebab-case English (from architecture naming patterns):
- `building-lincie.md` ✅
- `Building_Lincie.md` ❌
- `buildingLincie.md` ❌

Astro derives the slug automatically from the filename. `building-lincie.md` → slug `building-lincie` → URL `/projects/building-lincie`.

### What This Story Does NOT Include

- No page templates (`src/pages/projects/[...slug].astro`, `src/pages/writing/[...slug].astro`) — those are Stories 2.1 and 2.2
- No `getCollection()` calls in pages — those are Stories 1.4, 1.5, 2.1, 2.2
- No drop cap rendering — Story 2.1
- No footnote reveal behavior — Story 4.4
- No changes to `BaseLayout.astro`, `global.css`, or `typography.css`

### Previous Story Learnings

From Story 1.1:
- Tailwind 4 is CSS-first — no `tailwind.config.js`
- `bun run check` passes even when utilities are unused

From Story 1.2:
- `bun run check` runs Astro's type checker — it will validate the content collection schemas
- Prettier reformats some values (e.g., trailing zeros) — this is fine
- The `src/assets/fonts/` directory already exists with 4 pre-staged woff2 files
- `font-size: 112.5%` (not `18px`) is the correct value in `typography.css` — do not change it

### Anti-Patterns to Avoid

- ❌ Do NOT place the config at `src/content/config.ts` — Astro 6 removed this legacy location; use `src/content.config.ts`
- ❌ Do NOT omit the `loader` from `defineCollection` — Astro 6 requires it; use `glob()` from `'astro/loaders'`
- ❌ Do NOT use `import { z } from 'astro:content'` — this triggers deprecation hints in Astro 6; use `import { z } from 'astro/zod'` instead
- ❌ Do NOT use `z.date()` or `z.coerce.date()` for the `date` field — keep it as `z.string()`
- ❌ Do NOT use `z.nullable()` for `subtitle` — use `.optional()` so it can be omitted from frontmatter
- ❌ Do NOT add extra fields to the schema beyond what's specified — the schema is minimal by design
- ❌ Do NOT use placeholder text ("Lorem ipsum") — write real content in LinCie's voice
- ❌ Do NOT forget the footnote reference in the essay's first paragraph (AC #4)
- ❌ Do NOT create a `src/content/config.js` — must be `.ts` for type safety
- ❌ Do NOT add `type: 'content'` — the Astro 6 loader API does not use `type`; use `loader` instead
- ❌ Do NOT modify any existing files (global.css, typography.css, BaseLayout.astro, astro.config.mjs)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Content Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component & File Organization]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UJ-3: LinCie Publishes a New Essay]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR4: Bidirectional footnote navigation]
- [Source: AGENTS.md#TypeScript and code quality]
- [Source: https://docs.astro.build/en/guides/content-collections/ — Astro 6 Content Collections]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Story Dev Notes specified `src/content/config.ts` and `import { z } from 'astro/zod'`, but Astro 6 requires the config at `src/content.config.ts` with a `loader` on each collection. The `LegacyContentConfigError` from `bun run check` confirmed this. Config was placed at `src/content.config.ts` with `glob()` loaders from `astro/loaders`.
- `z` imported from `astro/zod` resolves cleanly with 0 hints (vs. importing from `astro:content` which triggers deprecation hints, or from `zod` directly which also works but is less explicit about the Astro-managed Zod instance).

### Completion Notes List

- `src/content.config.ts` created with Astro 6 Content Collections API: `defineCollection` + `glob()` loader + `z` from `astro/zod`
- `projects` collection schema: title, description, date (string), disciplines (string[]), draft, order — all required
- `writing` collection schema: title, subtitle (optional), description, date (string), draft, order
- `src/content/projects/building-lincie.md` created with valid frontmatter and 3-paragraph prose in LinCie's voice
- `src/content/writing/craft-as-proof.md` created with valid frontmatter, footnote `[^1]` in first paragraph, and footnote definition at bottom
- AC #5 verified: build fails with `InvalidContentEntryDataError` + `order: Required` when `order` field is omitted
- AC #7 verified: `bun run format && bun run lint && bun run check` all pass with 0 errors, 0 warnings, 0 hints

### File List

- `src/content.config.ts` (created)
- `src/content/projects/building-lincie.md` (created)
- `src/content/writing/craft-as-proof.md` (created)

### Change Log

- 2026-05-22: Implemented Story 1.3 — content collections config and sample content files created
- 2026-05-22: Code review completed — 0 patches, 6 deferred, 3 dismissed

## Review Findings

- [x] [Review][Defer] `date` field accepts any string — no format enforcement [`src/content.config.ts:8,22`] — deferred, pre-existing design decision (architecture spec chose `z.string()` for dates; regex enforcement is a future enhancement)
- [x] [Review][Defer] `order` allows negatives, floats, and duplicates [`src/content.config.ts:10,24`] — deferred, pre-existing; schema is minimal by design per Dev Notes; enforcement at query time is a future story concern
- [x] [Review][Defer] `disciplines` allows empty array [`src/content.config.ts:7`] — deferred, pre-existing; minimal schema by design; content authoring guidelines handle this
- [x] [Review][Defer] `title`/`description` accept empty strings [`src/content.config.ts`] — deferred, pre-existing; minimal schema by design; empty string is a content authoring error
- [x] [Review][Defer] `glob("**/*.md")` ingests stray files [`src/content.config.ts:6,16`] — deferred, pre-existing; pattern matches spec exactly; stray file handling is a content governance concern
- [x] [Review][Defer] No `slug` override field in schema — deferred, pre-existing; slug override is out of scope for this story