# Story 2.2: Essay Page Template with Italic Closing Line

Status: done

## Story

As a visitor reading an essay,
I want a long-form reading experience with drop cap, footnotes, and a warm closing invitation,
so that I can read at depth and reach out if the writing resonates.

## Acceptance Criteria

1. The page renders at `/writing/{slug}` for each non-draft essay in `src/content/writing/`
2. The page displays: essay title as `<h1>`, optional subtitle as `<p>` or `<h2>`, drop cap on first paragraph, prose body with `<h2>` section headings, and the colophon
3. The italic closing line "This was made by LinCie. Reach out if it speaks to you." renders at the end of the prose body (before the colophon) with a mailto link to `contact@lincie.me`
4. The closing line is italic (`font-style: italic`) and rendered in the same serif body font
5. The BL corner label reads `WRITING`
6. Body text renders at 65–75ch measure on desktop
7. The first essay shipped at MVP (`craft-as-proof.md`) carries at least one footnote reference in its first paragraph — already satisfied by existing content file
8. Adding a new content file with valid frontmatter and pushing to main results in a new live essay at its slug after build
9. No per-page design decisions are required — the template handles everything
10. The page has a margin column on desktop (≥768px) for footnotes (reserved for Story 2.3, same pattern as project page)
11. On mobile (<768px), single column layout
12. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/pages/writing/[...slug].astro` — the dynamic essay page route (AC: #1, #2, #5, #6, #10, #11)
  - [x] 1.1: Import `getCollection`, `render` from `astro:content`; import `BaseLayout`, `Colophon`, `DropCap`
  - [x] 1.2: Add `getStaticPaths()` — filter `draft: false`, map each entry to `{ params: { slug: entry.id }, props: { entry } }`
  - [x] 1.3: Destructure `entry` from `Astro.props`; call `const { Content } = await render(entry)` — no `headings` needed (no spine on essay pages)
  - [x] 1.4: Pass `sectionLabel="WRITING"` to `BaseLayout`; pass `title={entry.data.title}` and `description={entry.data.description}`
  - [x] 1.5: Render the two-column layout: empty left column (spine spacer) + content column + margin column — same grid as project page
  - [x] 1.6: Render essay title as `<h1>`, optional subtitle if `entry.data.subtitle` is defined
  - [x] 1.7: Render `<Content />` inside a `<DropCap>` wrapper with the same prose styling div as the project page
  - [x] 1.8: Render the italic closing line after `<DropCap>` and before `<Colophon />`
  - [x] 1.9: Render `<Colophon />` in the content column (same grid alignment as project page)

- [x] Task 2: Implement the italic closing line (AC: #3, #4)
  - [x] 2.1: Render as `<p class="mt-14 font-serif italic text-ink">This was made by LinCie. <a href="mailto:contact@lincie.me" class="...">Reach out if it speaks to you.</a></p>`
  - [x] 2.2: The entire paragraph is italic — apply `italic` Tailwind class to the `<p>`, not just the link
  - [x] 2.3: The mailto link uses `href="mailto:contact@lincie.me"` — no `rel` needed for mailto
  - [x] 2.4: The link inherits the italic style from the parent `<p>` — no separate italic class on the `<a>`

- [x] Task 3: Run validation gate (AC: #12)
  - [x] 3.1: `bun run format`
  - [x] 3.2: `bun run lint`
  - [x] 3.3: `bun run check`

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/pages/writing/[...slug].astro` | Dynamic essay page route |

### Files to Modify (UPDATE)

None. All required components and CSS already exist from Story 2.1.

### Files to NOT Touch

- `src/styles/typography.css` — `.drop-cap` rule already correct; no changes needed
- `src/styles/global.css` — tokens already defined; no changes needed
- `src/components/typography/DropCap.astro` — use as-is
- `src/components/content/Colophon.astro` — use as-is
- `src/layouts/BaseLayout.astro` — `sectionLabel` prop already exists; no changes needed
- `src/content.config.ts` — writing schema already correct with optional `subtitle`
- `src/content/writing/craft-as-proof.md` — already has footnote in first paragraph; do not modify

### Dynamic Route — `getStaticPaths` Pattern

Mirror the project page exactly. Use `[...slug]` spread syntax (not `[slug]`) to handle nested paths:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";
import Colophon from "../../components/content/Colophon.astro";
import DropCap from "../../components/typography/DropCap.astro";

export async function getStaticPaths() {
  const essays = await getCollection("writing", ({ data }) => !data.draft);
  return essays.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
```

**Critical:** `render(entry)` is the Astro 5+ API — do NOT use `await entry.render()` (removed in Astro 6). Import `render` from `'astro:content'`.

**No `headings` needed:** Essay pages have no spine component, so destructure only `Content` from `render(entry)`.

### Layout — Two-Column Grid (Same as Project Page)

Use the identical grid class from `[...slug].astro` in projects. Define `gridClass` in the frontmatter (`---` block), not in the template — matches the project page pattern:

```astro
---
// ... imports and getStaticPaths above ...
const { entry } = Astro.props;
const { Content } = await render(entry);
const gridClass =
  "mx-auto px-7 md:grid md:grid-cols-[40px_minmax(0,65ch)_1fr] md:gap-x-7";
---
```

The left column is a spacer (no spine on essays), the content column holds the prose, and the right column is reserved for footnotes (Story 2.3):

```astro
<BaseLayout
  title={entry.data.title}
  description={entry.data.description}
  sectionLabel="WRITING"
>
  <div class={`pt-28 ${gridClass}`}>
    <!-- Left spacer: no spine on essay pages -->
    <div class="hidden md:block"></div>

    <!-- Content column -->
    <article class="min-w-0">
      <h1 class="text-ink mb-14 font-serif text-4xl leading-tight font-light">
        {entry.data.title}
      </h1>

      <!-- Optional subtitle -->
      {entry.data.subtitle && (
        <p class="text-meta mb-14 font-serif text-xl italic leading-snug">
          {entry.data.subtitle}
        </p>
      )}

      <!-- Date meta -->
      <p class="text-meta mb-14 font-mono text-[0.75rem] tracking-widest uppercase">
        {entry.data.date.slice(0, 4)}
      </p>

      <!-- Prose body with drop cap -->
      <DropCap>
        <div
          class="text-ink font-serif leading-[1.555] [&_h2]:mt-14 [&_h2]:mb-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mb-7"
        >
          <Content />
        </div>
      </DropCap>

      <!-- Italic closing line — always present on every essay.
           mt-14 (56px) + last prose paragraph's mb-7 (28px) = 84px = 3× baseline gap.
           This is intentional — do NOT reduce mt-14 to "fix" the spacing. -->
      <p class="text-ink mt-14 font-serif italic">
        This was made by LinCie.{" "}
        <a
          href="mailto:contact@lincie.me"
          class="hover:text-meta transition-colors duration-(--dur-quick)"
        >
          Reach out if it speaks to you.
        </a>
      </p>
    </article>

    <!-- Margin column: reserved for footnotes (Story 2.3) -->
    <aside class="hidden md:block" aria-hidden="true">
      <!-- Populated by Story 2.3 (FootnoteReveal) -->
    </aside>
  </div>

  <div class={gridClass}>
    <!-- Left spacer -->
    <div class="hidden md:block"></div>
    <!-- Colophon in content column -->
    <div>
      <Colophon />
    </div>
  </div>
</BaseLayout>
```

### Italic Closing Line — Exact Spec

The closing line is defined in FR-13 and UX-DR11:

> "This was made by LinCie. Reach out if it speaks to you." in italic with a mailto link to `contact@lincie.me`

Implementation rules:
- The `<p>` carries `italic` — the entire paragraph is italic, including the link text
- The link text is "Reach out if it speaks to you." (with period inside the `<a>`)
- `href="mailto:contact@lincie.me"` — no `rel` attribute needed for mailto links
- `mt-14` (56px = 2× baseline) separates it from the last prose paragraph; combined with the last `<p>`'s `mb-7` (28px from `[&_p]:mb-7`), the total gap is 84px = 3× baseline — intentional, do not reduce
- Do NOT add `font-style: italic` in custom CSS — use Tailwind `italic` class
- Do NOT add `underline-offset-2` — the closing line link has no underline at rest; Story 2.4 handles link underline animation globally
- Do NOT add `focus-visible:outline-2` or `focus-visible:outline-offset-2` — the global `:focus-visible` rule in `global.css` already applies `outline: 2px solid var(--ink); outline-offset: 2px` to all interactive elements; adding Tailwind focus-visible classes would be redundant

### Subtitle Rendering

The `subtitle` field is `z.string().optional()` in the writing schema. Render it only when present:

```astro
{entry.data.subtitle && (
  <p class="text-meta mb-14 font-serif text-xl italic leading-snug">
    {entry.data.subtitle}
  </p>
)}
```

- Render as `<p>`, not `<h2>` — it is a subtitle/deck, not a section heading
- `text-meta` (lighter than `text-ink`) distinguishes it from the title
- `italic` matches the essay's voice register
- `mb-14` (56px = 2× baseline) maintains grid rhythm

### Drop Cap — Reuse Existing Component and CSS

`DropCap.astro` and the `.drop-cap p:first-child::first-letter` rule in `typography.css` are already correct from Story 2.1. No changes needed. The same wrapper pattern applies:

```astro
<DropCap>
  <div class="text-ink font-serif leading-[1.555] [&_h2]:mt-14 [&_h2]:mb-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mb-7">
    <Content />
  </div>
</DropCap>
```

**Critical:** The `overflow: hidden` fix on `.drop-cap p:first-child` is already in `typography.css` — short first paragraphs will not bleed into subsequent content.

### Existing Writing Content File

`src/content/writing/craft-as-proof.md` already exists with:
- Valid frontmatter (`title`, `description`, `date`, `draft: false`, `order: 1`)
- A footnote reference `[^1]` in the first paragraph (AC #7 satisfied)
- No `subtitle` field (optional — the template handles its absence)

Do NOT modify this file. The essay page template must render it correctly as-is.

### Footnote Default Rendering — Expected Behavior

`craft-as-proof.md` contains `[^1]` footnote syntax. Astro's remark processor renders this as a `<section class="footnotes">` containing an `<ol>` with `<li>` elements — not `<p>` tags. This means:

- The `[&_p]:mb-7` variant on the prose wrapper does NOT affect footnote list items
- The `<section class="footnotes">` will appear at the bottom of `<Content />` with no special styling — this is acceptable for this story
- Do NOT add footnote-specific styling in this story — Story 2.3 handles all footnote rendering and placement
- The footnote superscript reference `[1]` will render as a default browser link — also acceptable for now

The collection name is `"writing"` (not `"essays"` or `"essay"`) — match exactly what is defined in `src/content.config.ts`.

### Prose Styling — No `@tailwindcss/typography`

Do NOT use `class="prose"` — `@tailwindcss/typography` is not installed and is banned. Style prose elements using Tailwind's `[&_h2]:` variant syntax on the wrapper div, exactly as in the project page.

### Spacing — Baseline Multiples Only

```
mb-7   = 28px  = 1× baseline  ✅
mb-14  = 56px  = 2× baseline  ✅
mt-14  = 56px  = 2× baseline  ✅ (closing line top margin)
pt-28  = 112px = 4× baseline  ✅ (top padding, matches project page)
```

Never use `mb-5`, `mb-6`, `mb-8`, `mb-10`, `mb-12` — these break the baseline grid.

### Token References — Never Hardcode

```astro
<!-- ✅ Correct -->
<p class="text-ink font-serif italic">
<a class="hover:text-meta transition-colors duration-(--dur-quick)">

<!-- ❌ Wrong -->
<p style="color: oklch(0.18 0.008 80); font-style: italic">
```

### Astro Component Structure (Follow Exactly)

Every `.astro` file follows this order:
1. Imports
2. `getStaticPaths` export (page routes only — comes before props destructuring)
3. Props destructuring (`const { entry } = Astro.props`)
4. Data fetching (`const { Content } = await render(entry)`)
5. `gridClass` const (defined in frontmatter, not in template)
6. Template (HTML)
7. No scoped styles (Tailwind handles everything)
8. No client-side script (this is a static template story)

### Accessibility Requirements

- `<h1>` for the essay title — required for document outline
- `<article>` semantic element wrapping the content column
- `<aside aria-hidden="true">` for the empty margin column — same pattern as project page; Story 2.3 removes `aria-hidden` and adds `aria-label="Footnotes"` when content is present
- The closing line `<a>` is a standard mailto link — no ARIA needed
- Focus-visible states inherited from `global.css` — no per-component override needed
- Do NOT add `aria-label` to an empty `<aside>` — screen readers will announce an empty landmark

### Page Title Format

Pass `title={entry.data.title}` to BaseLayout — renders as `<title>Craft as Proof</title>`. Matches the existing pattern from `index.astro` and `[...slug].astro` in projects. No site suffix, no separator.

### No `transition:name` on Essay Title

Unlike project pages, essay titles do NOT carry `transition:name`. The FLIP-echo in Epic 3 (Story 3.4) is only for project titles (index → project page). Essay titles have no corresponding index band to FLIP from. Do not add `transition:name` to the essay `<h1>`.

### What This Story Does NOT Include

- No `InlineLink` component (Story 2.4)
- No footnote rendering or bidirectional navigation (Story 2.3) — footnotes in `craft-as-proof.md` will render as Astro's default HTML (superscript refs + list at bottom) until Story 2.3 restyling
- No reverse-scroll footnote reveal (Story 4.4)
- No GSAP scripts — this is a static template story
- No `scroll.ts` or `footnotes.ts` — those are Epic 3/4
- No project spine (essays have no spine)
- No `transition:name` on the essay title (project-only feature)
- No `og:type` change to `"article"` — deferred (noted in deferred-work.md)

### Project Structure Alignment

```
src/
├── components/
│   ├── content/
│   │   └── Colophon.astro        ← EXISTS — use as-is
│   └── typography/
│       └── DropCap.astro         ← EXISTS — use as-is
├── pages/
│   ├── projects/
│   │   └── [...slug].astro       ← EXISTS — reference for patterns
│   └── writing/
│       └── [...slug].astro       ← CREATE HERE (Task 1) — directory is NEW
└── styles/
    └── typography.css            ← EXISTS — no changes needed
```

**Note:** `src/pages/writing/` does not exist yet — create the directory by creating the file.

### ESLint / Astro Check — Expected Issues to Avoid

- `jsx-a11y` will flag any interactive element without a label — the closing line `<a>` has visible text content, so no issue
- TypeScript: `entry.data.subtitle` is `string | undefined` — the conditional `{entry.data.subtitle && (...)}` is the correct guard
- `astro/no-unused-define-vars-in-style` — do not add `<style>` blocks

### Deferred Work to Be Aware Of

From `deferred-work.md`:
- `og:type` is hardcoded to `"website"` in BaseLayout — essay pages should eventually use `"article"`. Deferred. Do not fix in this story.
- Recovery links in `404.astro` point to `/writing/craft-as-proof` — this route will now exist after this story. No action needed; the 404 link will resolve automatically.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.2`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — directory structure
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture`] — token usage, baseline grid
- [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`] — Astro component structure order
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns`] — no prose class, variant syntax
- [Source: `_bmad-output/planning-artifacts/architecture.md#Accessibility Patterns`] — `aria-hidden` on decorative/empty elements
- [Source: `_bmad-output/planning-artifacts/architecture.md#Anti-Patterns`] — no inline styles, no hardcoded colors
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`] — 65–75ch measure, reading as the interaction
- [Source: FR-13] — essay page structure: title, optional subtitle, drop cap, prose body, italic closing line, colophon
- [Source: UX-DR11] — italic closing line exact text and mailto
- [Source: UX-DR2] — mobile: single column
- [Source: UX-DR13] — decorative elements `aria-hidden="true"`
- [Source: NFR-4] — WCAG 2.2 AA, semantic HTML first
- [Source: `src/pages/projects/[...slug].astro`] — grid class, DropCap usage, Colophon placement, aside placeholder pattern
- [Source: `src/layouts/BaseLayout.astro`] — `sectionLabel` prop, existing `<head>` and `<body>` structure
- [Source: `src/styles/typography.css`] — `.drop-cap` rule already correct; no changes needed
- [Source: `src/content/writing/craft-as-proof.md`] — existing essay content; do not modify
- [Source: `_bmad-output/implementation-artifacts/2-1-project-page-template-with-drop-cap-and-spine-structure.md`] — grid pattern, DropCap usage, aside placeholder, Colophon placement
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`] — `og:type` deferred, 404 recovery links will resolve

### Review Findings

- [x] [Review][Defer] `[&_p]:mb-7` applies to footnote paragraphs [`src/pages/writing/[...slug].astro:63`] — deferred, pre-existing; Story 2.3 owns all footnote styling
- [x] [Review][Defer] Drop cap silently absent if first rendered element is not `<p>` [`src/pages/writing/[...slug].astro:62`] — deferred, pre-existing content authoring constraint; same as project page
- [x] [Review][Defer] `aria-hidden="true"` hardcoded on aside — Story 2.3 must remove it when footnote content is injected [`src/pages/writing/[...slug].astro:85`] — deferred, future integration concern

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. Implementation was straightforward — single file creation mirroring the project page pattern.

### Completion Notes List

- Created `src/pages/writing/[...slug].astro` as the dynamic essay route
- Used `[...slug]` spread syntax and `getCollection("writing")` with `draft: false` filter
- Used Astro 5+ `render(entry)` API (not deprecated `entry.render()`); destructured only `Content` (no `headings` — no spine on essays)
- `gridClass` defined in frontmatter, not template — matches project page pattern
- Left column is an empty spacer `<div>` (no `ProjectSpine`); right column is `<aside aria-hidden="true">` placeholder for Story 2.3
- Optional subtitle rendered as `<p>` with `text-meta italic` when `entry.data.subtitle` is defined
- Date meta rendered as year-only (`entry.data.date.slice(0, 4)`) in mono uppercase
- `<DropCap>` wraps `<Content />` with identical prose variant classes as project page
- Italic closing line: `<p class="text-ink mt-14 font-serif italic">` with mailto `<a>` — no `rel`, no underline, no focus-visible override (global.css handles it)
- `bun run format` reformatted the new file; all other files unchanged
- `bun run lint` — 0 errors
- `bun run check` — 0 errors, 0 warnings, 0 hints across 14 files

### File List

- `src/pages/writing/[...slug].astro` (created)

### Change Log

- 2026-05-22: Created essay page dynamic route `src/pages/writing/[...slug].astro` — implements AC #1–#12 for Story 2.2
