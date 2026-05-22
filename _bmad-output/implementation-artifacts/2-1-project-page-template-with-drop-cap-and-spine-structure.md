# Story 2.1: Project Page Template with Drop Cap & Spine Structure

Status: done

## Story

As a visitor reading a project page,
I want a long-form reading experience with a drop cap, section headings, and the project spine hairline,
so that I can read deeply and understand LinCie's work.

## Acceptance Criteria

1. The page renders at `/projects/{slug}` for each non-draft project in `src/content/projects/`
2. The page displays: project title as `<h1>`, long-form prose body with `<h2>` section headings, and the colophon
3. The first paragraph renders with a 3-line drop cap using `::first-letter` pseudo-element (cap-height = 3 × 28px = 84px, Newsreader display optical at ~600 weight)
4. The `initial-letter` CSS property is NOT used — hand-floated `::first-letter` only
5. The drop cap is defined in `typography.css` using `--baseline` and `--drop-cap-lines` custom properties
6. The project spine renders as a vertical hairline rule on the left edge with tick marks at each `<h2>` anchor (decorative, `aria-hidden="true"`)
7. Body text renders at 65–75ch measure on desktop
8. The BL corner label reads `WORK`
9. The page has a margin column on desktop (≥768px) for footnotes (reserved for Story 2.3)
10. On mobile (<768px), single column layout with no spine visible
11. The project title carries `transition:name="project-title-{slug}"` for View Transitions (consumed by Epic 3)
12. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/pages/projects/[...slug].astro` — the dynamic project page route (AC: #1, #2, #8, #11)
  - [x] 1.1: Import `getCollection`, `render` from `astro:content`; import `BaseLayout`, `Colophon`, `DropCap`, `ProjectSpine`
  - [x] 1.2: Add `getStaticPaths()` — filter `draft: false`, map each entry to `{ params: { slug: entry.id }, props: { entry } }`
  - [x] 1.3: Destructure `entry` from `Astro.props`; call `const { Content, headings } = await render(entry)`
  - [x] 1.4: Pass `sectionLabel="WORK"` to `BaseLayout`; pass `title={entry.data.title}` and `description={entry.data.description}`
  - [x] 1.5: Add `transition:name={\`project-title-${entry.id}\`}` to the `<h1>` element
  - [x] 1.6: Render the two-column layout: spine column (left, desktop only) + content column (right)
  - [x] 1.7: Render `<Content />` inside a `<DropCap>` wrapper (see Task 3) — `<DropCap>` renders `<div class="drop-cap">` and the CSS targets `p:first-child::first-letter` (descendant, not child combinator)
  - [x] 1.8: Render `<Colophon />` below the content

- [x] Task 2: Create `src/components/content/ProjectSpine.astro` (AC: #6, #10)
  - [x] 2.1: Accept props: `headings: { depth: number; slug: string; text: string }[]`
  - [x] 2.2: Render a `<div aria-hidden="true">` containing a vertical `<div>` hairline (1px wide, full height, `bg-hairline`)
  - [x] 2.3: For each `<h2>` heading (depth === 2), render a tick mark positioned absolutely along the hairline — a small horizontal dash (`w-2 h-px bg-hairline`) at the correct proportional offset. Use `style={`top: ${...}%`}` — this is a justified exception to the no-inline-styles rule because Tailwind cannot express dynamic percentage values computed at render time
  - [x] 2.4: The spine container is `hidden md:block` (invisible on mobile)
  - [x] 2.5: The spine is purely decorative — no interactive elements, no `tabindex`, no role

- [x] Task 3: Create `src/components/typography/DropCap.astro` (AC: #3, #4, #5)
  - [x] 3.1: Accept a single `slot` — the component renders `<div class="drop-cap"><slot /></div>`
  - [x] 3.2: No logic needed — this is a pure CSS wrapper; the drop cap effect is entirely in `typography.css`
  - [x] 3.3: The `.drop-cap` class is defined in `typography.css` (not inline styles, not Tailwind arbitrary values)
  - [x] 3.4: Do NOT use `initial-letter` — use `::first-letter` float technique only

- [x] Task 4: Add `.drop-cap` CSS to `src/styles/typography.css` (AC: #3, #4, #5)
  - [x] 4.1: Add `.drop-cap p:first-child::first-letter` rule using `float: left`, `font-size: calc(var(--drop-cap-lines) * var(--baseline))` = 84px, `line-height: 1`, `font-weight: 600`, `padding-right: 0.1em`, `margin-top: 0.05em`
  - [x] 4.2: The selector MUST be `.drop-cap p:first-child::first-letter` (descendant combinator, no `>`) — NOT `.drop-cap::first-letter`. `::first-letter` on a `<div>` does not pierce into child `<p>` elements; the `<p>` may also be a grandchild of `.drop-cap` depending on the wrapper structure
  - [x] 4.3: Do NOT use `initial-letter` anywhere in the rule
  - [x] 4.4: Verify the rule uses `--baseline` and `--drop-cap-lines` tokens (already defined in `global.css` `:root`)

- [x] Task 5: Layout — two-column grid with margin column (AC: #7, #9, #10)
  - [x] 5.1: On desktop (≥768px): left spine column (~40px wide) + main content column (65–75ch) + right margin column (reserved for footnotes, ~20ch)
  - [x] 5.2: On mobile (<768px): single column, full width, no spine, no margin column
  - [x] 5.3: Use Tailwind grid utilities (`grid`, `grid-cols-[...]`, `md:grid-cols-[...]`) — no custom CSS for layout
  - [x] 5.4: Body text container has `max-w-[65ch]` or equivalent to enforce measure

- [x] Task 6: Run validation gate (AC: #12)
  - [x] 6.1: `bun run format`
  - [x] 6.2: `bun run lint`
  - [x] 6.3: `bun run check`

### Review Findings

- [x] [Review][Patch] `date.slice(0,4)` is correct — `date` is `z.string()` in schema; `.getFullYear()` fix was reverted after type check failure confirmed string type [`[...slug].astro`]
- [x] [Review][Patch] Empty `disciplines` array renders dangling em-dash — guarded with `disciplines.length > 0` [`[...slug].astro` line 47]
- [x] [Review][Patch] Float not cleared — short first paragraphs bleed into subsequent content — fixed with `overflow: hidden` on `.drop-cap p:first-child` [`typography.css`]
- [x] [Review][Patch] Duplicate grid class string — extracted to `const gridClass` in frontmatter [`[...slug].astro`]
- [x] [Review][Defer] Spine tick positions are index-distributed, not heading-position-matched — even distribution is correct for this story per dev notes; Story 5.3 replaces with scroll-driven positions [`ProjectSpine.astro`] — deferred
- [x] [Review][Defer] `--baseline: 28px` is absolute — drop cap doesn't scale with user font-size preference — pre-existing token architecture decision [`global.css`] — deferred
- [x] [Review][Defer] Drop cap fires on first-letters that are punctuation, numbers, or whitespace — content authoring concern, acceptable for now — deferred
- [x] [Review][Defer] `1fr` third column has no max-width — intentional per architecture; Story 2.3 will define column content — deferred

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/pages/projects/[...slug].astro` | Dynamic project page route |
| `src/components/typography/DropCap.astro` | Drop cap wrapper component |
| `src/components/content/ProjectSpine.astro` | Vertical hairline spine with h2 ticks |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/styles/typography.css` | Add `.drop-cap p:first-child::first-letter` rule |

### Files to NOT Touch

- `src/layouts/BaseLayout.astro` — no changes needed; `sectionLabel` prop already exists
- `src/styles/global.css` — tokens already defined; `--drop-cap-lines: 3` and `--baseline: 28px` are already in `:root`
- `src/content.config.ts` — schema already correct
- `src/components/content/Colophon.astro` — use as-is
- `src/components/frame/Frame.astro` — use as-is

### BaseLayout — Current State (Preserve Exactly)

`BaseLayout.astro` accepts `sectionLabel?: string` and passes it to `<Frame>`. Pass `sectionLabel="WORK"` from the project page. The `<Frame>` component renders the BL corner label from this prop. No changes to BaseLayout needed.

```astro
<BaseLayout
  title={entry.data.title}
  description={entry.data.description}
  sectionLabel="WORK"
>
```

### Dynamic Route — `getStaticPaths` Pattern

Follow the Astro Content Collections pattern established in `src/pages/index.astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import Colophon from "../../components/content/Colophon.astro";
import DropCap from "../../components/typography/DropCap.astro";
import ProjectSpine from "../../components/content/ProjectSpine.astro";

export async function getStaticPaths() {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
---
```

**Critical:** `render(entry)` is the Astro 5+ API — do NOT use `await entry.render()` (deprecated in Astro 5, removed in Astro 6). Import `render` from `'astro:content'` as shown above.

**Critical:** `entry.id` is the slug (filename without extension, e.g. `building-lincie`). The route `[...slug]` uses spread syntax to handle nested paths — use `[...slug]` not `[slug]` to match Astro's content collection slug format.

### View Transitions — `transition:name` on `<h1>`

The project title must carry `transition:name` for the FLIP-echo from the index page (Epic 3, Story 3.4). Add it now so the attribute is in place when Epic 3 implements the animation:

```astro
<h1 transition:name={`project-title-${entry.id}`} class="...">
  {entry.data.title}
</h1>
```

**Pattern from architecture:** `{element}-{slug}` — e.g. `project-title-building-lincie`. Never reuse a `transition:name` value across unrelated routes.

### Two-Column Layout Pattern

The architecture specifies a margin column on desktop for footnotes (Story 2.3 will populate it). Reserve it now:

```astro
<!-- Desktop: spine | content | margin -->
<!-- Mobile: single column -->
<div class="mx-auto px-7 pt-28 md:grid md:grid-cols-[40px_minmax(0,65ch)_1fr] md:gap-x-7">
  <!-- Spine: desktop only -->
  <div class="hidden md:block">
    <ProjectSpine headings={headings} />
  </div>

  <!-- Content column -->
  <article class="min-w-0">
    <h1 transition:name={`project-title-${entry.id}`} class="font-serif text-ink mb-14 text-4xl font-light leading-tight">
      {entry.data.title}
    </h1>

    <!-- Disciplines meta -->
    <p class="font-mono text-meta mb-14 text-[0.75rem] tracking-widest uppercase">
      {entry.data.date.slice(0, 4)} — {entry.data.disciplines.join(", ")}
    </p>

    <!-- Prose body — DropCap wraps Content so .drop-cap p:first-child::first-letter applies -->
    <!-- Do NOT use class="prose" — @tailwindcss/typography is not installed -->
    <DropCap>
      <div class="font-serif text-ink leading-[1.555] [&_h2]:mb-7 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mb-7">
        <Content />
      </div>
    </DropCap>
  </article>

  <!-- Margin column: reserved for footnotes (Story 2.3) — aria-hidden until populated -->
  <aside class="hidden md:block" aria-hidden="true">
    <!-- Populated by Story 2.3 (FootnoteReveal) -->
  </aside>
</div>
```

**Prose styling rules:**
- Do NOT use `class="prose"` — `@tailwindcss/typography` is not in `package.json` and is banned
- Style `<h2>`, `<p>`, and other prose elements using Tailwind's `[&_h2]:` variant syntax on the wrapper div
- `<h2>` headings inside `<Content />` need explicit size/weight/spacing — they will inherit body text size without it
- `leading-[1.555]` matches the `body` rule in `typography.css` (28px baseline grid)

**Drop cap mechanics:**
- `<DropCap>` renders `<div class="drop-cap">...</div>`
- The CSS rule `.drop-cap p:first-child::first-letter` targets the first letter of the first `<p>` rendered by `<Content />` at any nesting depth
- `::first-letter` on a `<div>` does NOT pierce into child `<p>` elements — the selector must target the `<p>` directly
- Do NOT apply `.drop-cap` to the outer layout div — it must wrap only the prose content

**Empty aside:**
- The `<aside>` is `aria-hidden="true"` while empty — it becomes a visible landmark only when Story 2.3 adds footnote content and removes `aria-hidden`
- Do NOT add `aria-label="Footnotes"` to an empty element — screen readers will announce an empty landmark

### Drop Cap CSS — `typography.css`

Add after the existing `h1, h2, h3, h4` block:

```css
/* ============================================================
   DROP CAP
   3-line opening capital for project and essay pages.
   Uses ::first-letter float technique — NOT initial-letter.
   Cap-height = var(--drop-cap-lines) × var(--baseline) = 3 × 28px = 84px.

   SELECTOR: .drop-cap p:first-child::first-letter
   NOT .drop-cap::first-letter — ::first-letter on a <div> does not
   pierce into child <p> elements. The selector must target the <p> directly.
   The descendant combinator (space, not >) is used because <Content /> may
   render the <p> as a grandchild of .drop-cap (wrapped in a styling div).
   ============================================================ */
.drop-cap p:first-child::first-letter {
  float: left;
  font-size: calc(var(--drop-cap-lines) * var(--baseline)); /* 84px */
  line-height: 1;
  font-weight: 600;
  font-optical-sizing: auto;
  padding-right: 0.1em;
  margin-top: 0.05em;
}
```

**Why NOT `.drop-cap::first-letter`:** `::first-letter` on a block container only applies to the first letter of the container's own text content — it does not pierce into child elements. Since `<Content />` renders `<p>` tags as descendants of the `.drop-cap` div, the selector must be `.drop-cap p:first-child::first-letter` (descendant combinator, not child combinator `>`, because the `<p>` may be a grandchild depending on the wrapper structure).

**Why NOT `initial-letter`:** The AC explicitly forbids it. `initial-letter` has inconsistent cross-browser support and different sizing semantics. The float technique is the specified approach.

**Token dependency:** `--drop-cap-lines: 3` and `--baseline: 28px` are already defined in `global.css` `:root` (Story 1.1). Do not redefine them.

### DropCap Component

`DropCap.astro` is a minimal CSS wrapper — no logic, no props beyond the default slot:

```astro
---
// src/components/typography/DropCap.astro
// Pure CSS wrapper. The drop cap effect is entirely in typography.css.
// Renders <div class="drop-cap"> so the CSS rule
// .drop-cap p:first-child::first-letter can target the first <p>
// rendered by <Content /> at any nesting depth.
---

<div class="drop-cap">
  <slot />
</div>
```

Use it in the page template by wrapping `<Content />`:

```astro
<DropCap>
  <div class="font-serif text-ink leading-[1.555] ...">
    <Content />
  </div>
</DropCap>
```

The rendered DOM will be: `<div class="drop-cap"><div class="..."><p>T...</p>...</div></div>`. The CSS selector `.drop-cap > p:first-child::first-letter` will NOT match here because the `<p>` is not a direct child of `.drop-cap` — it is a grandchild. **Adjust the selector to `.drop-cap p:first-child::first-letter`** (remove the `>` child combinator) so it matches the first `<p>` at any depth inside `.drop-cap`.

### ProjectSpine Component

The spine is a decorative vertical hairline with tick marks at each `<h2>`. It receives `headings` from Astro's `render()` return value.

```astro
---
// src/components/content/ProjectSpine.astro
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}
const { headings } = Astro.props;
const h2Headings = headings.filter((h) => h.depth === 2);
---

<div aria-hidden="true" class="relative h-full w-px">
  <!-- Vertical hairline -->
  <div class="bg-hairline absolute inset-y-0 left-0 w-px"></div>

  <!-- Tick marks at each h2 -->
  {h2Headings.map((_, i) => (
    <div
      class="bg-hairline absolute left-0 h-px w-2"
      style={`top: ${((i + 1) / (h2Headings.length + 1)) * 100}%`}
    />
  ))}
</div>
```

**Inline style justification:** The `style` attribute for tick mark positioning is a justified exception to the no-inline-styles rule. Tailwind cannot express dynamic percentage values computed at render time from the `headings` array. This is the correct approach.

**Tick positioning:** Evenly distributed ticks are the correct implementation for this story. Story 5.3 replaces these static positions with scroll-driven positions — do not attempt scroll-driven positioning now.

**TypeScript:** `headings` from `render()` is typed as `MarkdownHeading[]` in Astro. The inline type `{ depth: number; slug: string; text: string }[]` is equivalent and avoids an extra import. Alternatively, `import type { MarkdownHeading } from 'astro'` and use `MarkdownHeading[]` — both are valid under strict mode.

**Accessibility:** `aria-hidden="true"` on the outer container — the spine is purely decorative (UX-DR13).

### Astro Component Structure (Follow Exactly)

Every `.astro` file must follow this order (from architecture):
1. Imports
2. Props interface
3. Props destructuring
4. Data fetching / computation
5. Template (HTML)
6. Scoped styles (only if Tailwind cannot express it — avoid)
7. Client-side script (none needed for this story)

### Tailwind Spacing — Baseline Multiples Only

```
mb-7   = 28px  = 1× baseline  ✅
mb-14  = 56px  = 2× baseline  ✅
mb-21  = 84px  = 3× baseline  ✅
mb-28  = 112px = 4× baseline  ✅
pt-28  = 112px = 4× baseline  ✅ (used in index.astro for top padding)
```

Never use `mb-5`, `mb-6`, `mb-8`, `mb-10`, `mb-12` — these break the baseline grid.

### Token References — Never Hardcode

```astro
<!-- ✅ Correct -->
<p class="text-ink font-serif">
<span class="text-meta font-mono">
<div class="bg-hairline">

<!-- ❌ Wrong -->
<p style="color: oklch(0.18 0.008 80)">
<div style="background: oklch(0.85 0.005 80)">
```

### Existing Patterns from Epic 1 to Preserve

From `src/pages/index.astro` and `src/layouts/BaseLayout.astro`:
- `getCollection("projects", ({ data }) => !data.draft)` — filter pattern for non-draft content
- `transition:persist` on Frame — already in BaseLayout, do not touch
- `tabindex="-1"` on `<main>` — already in BaseLayout, do not touch
- `bg-paper text-ink` on `<body>` — already in BaseLayout, do not touch
- `id="main-content"` on `<main>` — already in BaseLayout, do not touch

### What This Story Does NOT Include

- No `InlineLink` component (Story 2.4)
- No footnote rendering or bidirectional navigation (Story 2.3)
- No reverse-scroll footnote reveal (Story 4.4)
- No GSAP scripts — this is a static template story
- No `scroll.ts` or `footnotes.ts` — those are Epic 3/4
- No `og:type` change to `"article"` — deferred (noted in deferred-work.md)
- No project spine scroll indicator dot (Story 5.3)
- No hover hero reveal (Story 5.4)
- No `ProjectBand` component (Story 2.5)

### Deferred Work to Be Aware Of

From `deferred-work.md`:
- `og:type` is hardcoded to `"website"` in BaseLayout — project pages should eventually use `"article"`. Deferred. Do not fix in this story.
- Recovery links in `404.astro` point to `/projects/building-lincie` — this route will now exist after this story. No action needed; the 404 links will resolve automatically.

### Accessibility Requirements

- `<h1>` for the project title — required for document outline
- `<article>` semantic element wrapping the content column
- `<aside aria-hidden="true">` for the empty margin column placeholder — `aria-hidden` prevents screen readers from announcing an empty landmark. Story 2.3 removes `aria-hidden` and adds `aria-label="Footnotes"` when content is present
- `aria-hidden="true"` on the spine container (decorative)
- No `tabindex` on decorative elements
- Focus-visible states are inherited from `global.css` `:focus-visible` rule — no per-component override needed
- Do NOT add `aria-label` to an empty `<aside>` — screen readers will announce an empty landmark, which is confusing

### Page Title Format

Pass `title={entry.data.title}` to BaseLayout — renders as `<title>Building LinCie</title>`. No site suffix needed; matches the existing pattern from `index.astro` (`<title>LinCie</title>`). Do not change the title format or add a separator.

### ESLint / Astro Check — Expected Issues to Avoid

- `jsx-a11y` will flag any interactive element without a label — the spine has none, so no issue
- `astro/no-unused-define-vars-in-style` — do not add `<style>` blocks with unused variables
- TypeScript: `headings` from `render()` is typed as `MarkdownHeading[]` — use `{ depth: number; slug: string; text: string }[]` in the Props interface to match

### Project Structure Alignment

```
src/
├── components/
│   ├── content/
│   │   ├── Colophon.astro        ← EXISTS — use as-is
│   │   └── ProjectSpine.astro    ← CREATE HERE (Task 2)
│   └── typography/
│       └── DropCap.astro         ← CREATE HERE (Task 3) — directory is NEW
├── pages/
│   └── projects/
│       └── [...slug].astro       ← CREATE HERE (Task 1) — directory is NEW
└── styles/
    └── typography.css            ← MODIFY — add .drop-cap rule (Task 4)
```

**Note:** `src/components/typography/` does not exist yet — create the directory by creating the file. Bun/Astro will handle it.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.1`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — directory structure, component grouping
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture`] — token usage, `--drop-cap-lines`, `--baseline`
- [Source: `_bmad-output/planning-artifacts/architecture.md#View Transitions & Animation Lifecycle`] — `transition:name` pattern for title FLIP-echo
- [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`] — PascalCase components, kebab-case scripts
- [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`] — Astro component structure order
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns`] — when to use custom CSS vs Tailwind
- [Source: `_bmad-output/planning-artifacts/architecture.md#Accessibility Patterns`] — `aria-hidden` on decorative elements
- [Source: `_bmad-output/planning-artifacts/architecture.md#Anti-Patterns`] — no inline styles, no hardcoded colors
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`] — 65–75ch measure, reading as the interaction
- [Source: FR-11] — project page structure: title, spine, prose body, section headings, colophon, drop cap
- [Source: UX-DR2] — mobile: single column, no spine
- [Source: UX-DR13] — decorative elements `aria-hidden="true"`
- [Source: NFR-4] — WCAG 2.2 AA, semantic HTML first
- [Source: `src/pages/index.astro`] — `getCollection` filter pattern, Tailwind class conventions
- [Source: `src/layouts/BaseLayout.astro`] — `sectionLabel` prop, existing `<head>` and `<body>` structure
- [Source: `src/styles/global.css`] — `--drop-cap-lines: 3`, `--baseline: 28px` already defined
- [Source: `src/styles/typography.css`] — existing font rules; add `.drop-cap` after `h1, h2, h3, h4` block
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`] — `og:type` deferred, 404 recovery links will resolve

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. All tasks implemented cleanly on first pass. `bun run format` reformatted `[...slug].astro` (whitespace normalization only — no logic changes).

### Completion Notes List

- Created `src/pages/projects/[...slug].astro` with `getStaticPaths()` using Astro 5+ `render()` API, `[...slug]` spread route, `sectionLabel="WORK"`, `transition:name` on `<h1>`, three-column desktop grid, and `<aside aria-hidden="true">` placeholder for Story 2.3 footnotes.
- Created `src/components/content/ProjectSpine.astro` — decorative vertical hairline with evenly-distributed tick marks at each `<h2>`. Inline `style` used for dynamic percentage positioning (justified exception per story spec). `aria-hidden="true"` on outer container.
- Created `src/components/typography/DropCap.astro` — minimal slot wrapper rendering `<div class="drop-cap">`. No logic, no props beyond default slot.
- Added `.drop-cap p:first-child::first-letter` rule to `src/styles/typography.css` using float technique, `calc(var(--drop-cap-lines) * var(--baseline))` = 84px, `font-weight: 600`. Descendant combinator (not `>`) used so the rule matches the `<p>` as a grandchild of `.drop-cap`. `initial-letter` not used.
- All 12 acceptance criteria satisfied. Validation: `bun run format` ✅ `bun run lint` ✅ `bun run check` ✅ (0 errors, 0 warnings).

### File List

- `src/pages/projects/[...slug].astro` — CREATED
- `src/components/typography/DropCap.astro` — CREATED
- `src/components/content/ProjectSpine.astro` — CREATED
- `src/styles/typography.css` — MODIFIED (added `.drop-cap` block)

### Change Log

- 2026-05-22: Story 2.1 implemented — project page template with drop cap and spine structure. Created dynamic route, DropCap wrapper, ProjectSpine component, and drop cap CSS rule. All ACs satisfied, validation passes.
