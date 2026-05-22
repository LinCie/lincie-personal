# Story 2.5: Project Index Bands — Structure & Static Layout

Status: done

## Story

As a visitor browsing projects,
I want to see projects listed as generous exhibition-style bands with title and metadata,
so that I can scan the work at a glance and choose what to read.

## Acceptance Criteria

1. `src/components/content/ProjectBand.astro` exists and renders a single project as an `<article>` with `<h2>` title at display serif size and monospace meta below
2. The meta line renders as `YYYY — Discipline, Discipline` in Commit Mono at `--meta` color
3. Each band occupies 30–40vh on desktop, compressed on mobile (no fixed vh on mobile)
4. Bands are separated by generous "ma" gaps (4×–6× baseline = 112–168px on desktop, 3× baseline = 84px on mobile)
5. The right whitespace area is reserved for the hover-revealed hero image (hero interaction added in Epic 5 — no image rendered in this story)
6. The entire band is a link to the project page (`/projects/{slug}`)
7. Project titles carry `transition:name="project-title-{slug}"` for View Transitions (Epic 3)
8. Semantic markup: `<article>` per project, `<h2>` title, meta in `<p>` with `<dl>` or plain text
9. `src/pages/projects/index.astro` exists and renders all non-draft projects as `ProjectBand` components
10. The home page (`src/pages/index.astro`) is updated so that when `projects.length >= 3`, it links to `/projects` (the new index page) instead of listing projects inline
11. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/content/ProjectBand.astro` (AC: #1, #2, #3, #4, #5, #6, #7, #8)
  - [x] 1.1: Define props interface: `title: string`, `slug: string`, `date: string`, `disciplines: string[]`, `heroImage?: string` (reserved for Story 5.4 — intentionally omitted from destructuring; Astro will not warn on unused optional props)
  - [x] 1.2: Render `<article>` wrapping an `<a href="/projects/{slug}">` that covers the entire band
  - [x] 1.3: Inside the link, render `<h2>` with `transition:name="project-title-{slug}"` at display serif size (`clamp(2.5rem, 6.5vw, 4.25rem)`, Newsreader, weight 400, line-height 1.05)
  - [x] 1.4: Render meta `<p>` below the title: `{date.slice(0, 4)} — {disciplines.join(', ')}` in Commit Mono at `0.75rem`, `--meta` color
  - [x] 1.5: Apply band height: `min-h-[30vh]` on desktop, no min-height on mobile (use responsive prefix `md:min-h-[30vh]`)
  - [x] 1.6: Reserve right whitespace for hero: use a two-column layout on desktop (`md:grid md:grid-cols-[1fr_40%]`) — left column holds title+meta, right column is empty placeholder with `aria-hidden="true"` (Epic 5 will inject the hero image here)
  - [x] 1.7: Apply "ma" gap spacing: the gap between bands is handled by the parent page, not the component itself — the component should NOT add bottom margin; the index page applies `space-y-21 md:space-y-[168px]` (3× baseline = 84px mobile, 6× baseline = 168px desktop) between bands
  - [x] 1.8: Ensure the `<a>` covers the full band area (use `block` display on the link, or wrap the article content inside the `<a>`)
  - [x] 1.9: Add `rel="noopener"` is NOT needed — this is an internal link; do not add it

- [x] Task 2: Create `src/pages/projects/index.astro` (AC: #9)
  - [x] 2.1: Fetch all non-draft projects via `getCollection('projects', ({ data }) => !data.draft)` and sort by `order` then `id`
  - [x] 2.2: Render each project as `<ProjectBand>` passing `title`, `slug` (= `entry.id`), `date`, `disciplines`
  - [x] 2.3: Use `BaseLayout` with `title="Work — LinCie"`, `description="Projects by LinCie — engineering, research, and design."`, `sectionLabel="WORK"`
  - [x] 2.4: Apply consistent page padding: `pt-28 px-7` on the content wrapper (matches project page pattern)
  - [x] 2.5: Add a visually-hidden `<h1>` for screen readers: `<h1 class="sr-only">Work</h1>`
  - [x] 2.6: Render `<Colophon />` at the bottom (import from `../../components/content/Colophon.astro`)
  - [x] 2.7: Apply `space-y-21 md:space-y-[168px]` on the bands container for "ma" gaps (84px = 3× baseline mobile, 168px = 6× baseline desktop)

- [x] Task 3: Update `src/pages/index.astro` for `projects.length >= 3` case (AC: #10)
  - [x] 3.1: In the `projects.length >= 3` branch, replace the inline project list with a link to `/projects` — e.g. `See all work →` or `Work: {projects.length} projects →`
  - [x] 3.2: Keep the `projects.length === 1` and `projects.length === 2` branches unchanged — they link directly to individual project pages
  - [x] 3.3: Do NOT change the essays section — it is out of scope for this story

- [x] Task 4: Run validation gate (AC: #11)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/components/content/ProjectBand.astro` | Exhibition-style project band component |
| `src/pages/projects/index.astro` | Project index page rendering all ProjectBand components |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/pages/index.astro` | Update `projects.length >= 3` branch to link to `/projects` |

### Files to NOT Touch

- `src/pages/projects/[...slug].astro` — project detail page; do NOT modify
- `src/styles/global.css` — no token changes needed
- `src/styles/typography.css` — no typography changes needed
- `src/layouts/BaseLayout.astro` — no layout changes needed
- `src/components/content/Colophon.astro` — import and use as-is
- Any content `.md` files — do NOT modify
- `src/components/frame/Frame.astro` — do NOT modify

### Scope Boundary — Critical

**This story creates the static structure only.** The following are explicitly deferred:

- **Hero image reveal on hover** — Epic 5 (Story 5.4). The right column is reserved but empty. Do NOT add any hover image logic.
- **Inkstroke underline animation on title hover** — Epic 3 (Story 3.5). The `InlineLink` component is NOT used here — the entire band is a link, not an inline text link. The title hover animation is added in Story 3.5.
- **`transition:name` morph animation** — the attribute is added in this story (required for Epic 3 to work), but the animation itself fires via Astro View Transitions which is already configured in `BaseLayout.astro`. No additional script needed.
- **Damped scroll / section pin** — Epic 4. No scripts in this story.

### ProjectBand Component — Full Implementation

```astro
---
// src/components/content/ProjectBand.astro
// Exhibition-style project band. Static structure only.
// Hero image reveal added in Story 5.4. Hover animation added in Story 3.5.

interface Props {
  title: string;
  slug: string;
  date: string;
  disciplines: string[];
  // heroImage reserved for Story 5.4 — intentionally omitted from destructuring in this story
  heroImage?: string;
}

const { title, slug, date, disciplines } = Astro.props;

const metaLine = `${date.slice(0, 4)}${disciplines.length > 0 ? ` — ${disciplines.join(', ')}` : ''}`;
---

<article class="group">
  <a
    href={`/projects/${slug}`}
    class="block md:grid md:grid-cols-[1fr_40%] md:min-h-[30vh] items-start"
  >
    <!-- Left: title + meta.
         items-start on the grid container prevents this div from stretching
         to fill the full min-h-[30vh] height when content is short. -->
    <div class="py-7 md:py-14">
      <h2
        transition:name={`project-title-${slug}`}
        class="text-ink font-serif font-normal leading-[1.05]"
        style="font-size: clamp(2.5rem, 6.5vw, 4.25rem);"
      >
        {title}
      </h2>
      <p class="text-meta font-mono mt-7 text-[0.75rem]">
        {metaLine}
      </p>
    </div>

    <!-- Right: hero placeholder (Epic 5 injects image here) -->
    <div class="hidden md:block" aria-hidden="true"></div>
  </a>
</article>
```

**Why `<article>` wrapping `<a>`:** The `<article>` provides semantic meaning (each project is a self-contained piece of content). The `<a>` inside it covers the full band as a block link. This is the correct pattern — `<a>` cannot wrap `<article>` (block element inside inline element is invalid HTML).

**Why `group` class on `<article>`:** Tailwind's `group` utility enables `group-hover:` variants on child elements. Story 3.5 and 5.4 will use `group-hover:` to trigger the title underline and hero reveal. Adding `group` now costs nothing and prevents a future regression.

**Why `style` for `font-size` instead of Tailwind:** The display size uses `clamp(2.5rem, 6.5vw, 4.25rem)` — a fluid value from the UX spec type scale. Tailwind 4 does not have a built-in utility for this exact clamp. Use an inline `style` attribute rather than an arbitrary value `text-[clamp(...)]` to keep the class string readable. This is the same pattern used in the project page `<h1>`.

**Why `transition:name` on `<h2>` not `<h1>`:** On the index page, the project title is an `<h2>` (correct heading hierarchy — the page `<h1>` is "Work"). On the project detail page (`[...slug].astro`), the same title is an `<h1>`. Astro View Transitions matches by `transition:name` value, not element type — the morph works correctly across `<h2>` → `<h1>`.

### Project Index Page — Full Implementation

```astro
---
// src/pages/projects/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Colophon from '../../components/content/Colophon.astro';
import ProjectBand from '../../components/content/ProjectBand.astro';

const allProjects = await getCollection('projects', ({ data }) => !data.draft);
const projects = allProjects.sort(
  (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
);
---

<BaseLayout
  title="Work — LinCie"
  description="Projects by LinCie — engineering, research, and design."
  sectionLabel="WORK"
>
  <div class="mx-auto max-w-[65ch] px-7 pt-28 md:max-w-none md:px-14">
    <h1 class="sr-only">Work</h1>

    <div class="space-y-21 md:space-y-[168px]">
      {projects.map((entry) => (
        <ProjectBand
          title={entry.data.title}
          slug={entry.id}
          date={entry.data.date}
          disciplines={entry.data.disciplines}
        />
      ))}
    </div>
  </div>

  <div class="mx-auto max-w-[65ch] px-7 md:max-w-none md:px-14">
    <Colophon />
  </div>
</BaseLayout>
```

**Why `md:max-w-none md:px-14` on desktop:** The project index bands are wider than the 65ch prose column — they need room for the two-column layout (title + hero placeholder). On desktop, remove the `max-w-[65ch]` constraint and use `px-14` (56px = 2× baseline) for breathing room. On mobile, keep `max-w-[65ch] px-7` for consistent prose-width reading.

**Why `space-y-21 md:space-y-[168px]`:** In Tailwind's 4px scale, `space-y-21` = 84px = 3× baseline (the spec's mobile minimum). On desktop, 168px = 6× baseline matches the spec's "4×–6× baseline" range. Use the upper end for maximum exhibition feel.

**Note on `space-y-[168px]`:** Tailwind 4 supports arbitrary values in `space-y-[...]`. This is correct usage.

### Home Page Update — `projects.length >= 3` Branch

Replace the current `projects.length >= 3` block in `src/pages/index.astro`:

```astro
{projects.length >= 3 && (
  <p class="text-ink font-serif leading-[1.555]">
    Work:{" "}
    <a
      href="/projects"
      class="hover:text-meta underline-offset-2 transition-colors duration-(--dur-quick)"
    >
      {projects.length} projects →
    </a>
  </p>
)}
```

**Keep the `projects.length === 1` and `projects.length === 2` branches exactly as they are.** Only the `>= 3` branch changes.

### Existing Patterns to Follow

**From `src/pages/projects/[...slug].astro`:**
- `pt-28` top padding on the content wrapper — match this on the index page
- `px-7` horizontal padding — match on mobile
- `getCollection('projects', ({ data }) => !data.draft)` + sort by `order` then `id` — use the same pattern

**From `src/pages/index.astro`:**
- `getCollection` import from `astro:content`
- `BaseLayout` with `title`, `description`, `sectionLabel` props
- `Colophon` import and usage pattern

**From `src/components/content/Colophon.astro`:**
- Import path from `projects/index.astro` is `../../components/content/Colophon.astro`

**From `src/components/content/ProjectSpine.astro`:**
- The spine is NOT used on the index page — it's only for the project detail page

### `transition:name` — Critical Constraint

The `transition:name` value `project-title-{slug}` must match exactly between:
- `ProjectBand.astro` `<h2 transition:name={`project-title-${slug}`}>`
- `src/pages/projects/[...slug].astro` `<h1 transition:name={`project-title-${entry.id}`}>`

The `slug` prop passed to `ProjectBand` must equal `entry.id` (the Astro content collection ID, which is the filename without extension). Verify this in the index page: `slug={entry.id}`.

**Never reuse a `transition:name` value across unrelated routes** — each project slug is unique, so `project-title-building-lincie` only appears on the index page and the `/projects/building-lincie` detail page.

**Duplicate slug guard:** If two content files somehow share the same slug (filename), Astro will throw a build error about duplicate `transition:name` values on the index page. This is a content authoring error, not a component bug — the build failure is the correct behavior.

### Accessibility Requirements

- `<h1 class="sr-only">Work</h1>` — required for screen reader document outline; the page has no visible `<h1>` (the bands use `<h2>`)
- `<article>` per project — correct semantic element for self-contained content
- The `<a>` covering the full band must have accessible text — the `<h2>` title inside it provides the accessible name; no `aria-label` needed
- The `:focus-visible` outline from `global.css` (`2px solid var(--ink)`) will appear around the entire band rectangle (the full `<a>` bounding box), not just the title text. This is correct and intentional — do NOT scope the outline to the `<h2>` only.
- The right hero placeholder column: `aria-hidden="true"` — it's empty in this story; keep it hidden from screen readers
- `transition:name` attributes are purely presentational — no accessibility impact

### ESLint / Astro Check — Expected Issues to Avoid

- `jsx-a11y` will NOT flag the block `<a>` wrapping `<h2>` — this is valid HTML and accessible (the heading text is the link's accessible name)
- `jsx-a11y` may flag an empty `<div aria-hidden="true">` — this is intentional; the linter should not flag `aria-hidden` on a decorative placeholder
- TypeScript: `entry.data.date` is typed as `string` in the content schema — `date.slice(0, 4)` is safe
- `transition:name` with template literals: Astro supports this natively — no TypeScript error expected
- `style` attribute with `font-size: clamp(...)` — Astro allows inline styles; no lint error expected

### Content Schema Reminder

The `projects` collection schema is defined in `src/content/config.ts` (created in Story 1.3). Fields used by `ProjectBand`:

```typescript
// Expected fields used by ProjectBand:
title: z.string()
date: z.string()        // YYYY-MM-DD format
disciplines: z.string[] // e.g. ["Engineering", "Design"]
draft: z.boolean()
order: z.number()
```

The current sample project (`building-lincie.md`) has:
- `title: "Building LinCie"`
- `date: "2026-05-21"`
- `disciplines: ["Engineering", "Design"]`
- `draft: false`
- `order: 1`

This will render as: `2026 — Engineering, Design`

### Deferred Work Awareness

From `deferred-work.md`:
- **`order` allows duplicates** — the sort uses `a.id.localeCompare(b.id)` as a tiebreaker; this is already handled in the existing pattern from `index.astro`
- **`disciplines` allows empty array** — the meta line handles this: `disciplines.length > 0 ? ` — ${disciplines.join(', ')}` : ''` — renders just the year if empty
- **Recovery links in `404.astro`** — `/projects/building-lincie` will now resolve correctly once the project detail page exists (it does, from Story 2.1)
- **Empty projects array on index page** — if all projects are drafts, the index page renders with only the sr-only `<h1>` and Colophon. This is acceptable — the home page's content-count logic (`projects.length >= 3`) prevents linking to `/projects` when count is below threshold, so a visitor should never reach an empty index in normal operation.

### What This Story Does NOT Include

- No hover animation (Story 3.5)
- No hero image (Story 5.4)
- No GSAP scripts
- No scroll behavior
- No `<script>` tags in any new file
- No changes to the essay section on the home page
- No changes to the writing index (no `/writing` index page — that is not in scope for any current story)
- No `ProjectSpine` on the index page

### Project Structure Alignment

```
src/
├── components/
│   └── content/
│       ├── Colophon.astro          ← EXISTS — import as-is
│       ├── FootnoteReveal.astro    ← EXISTS — do NOT touch
│       ├── ProjectBand.astro       ← CREATE HERE (Task 1)
│       └── ProjectSpine.astro      ← EXISTS — do NOT touch
└── pages/
    ├── index.astro                 ← MODIFY — projects >= 3 branch only (Task 3)
    └── projects/
        ├── index.astro             ← CREATE HERE (Task 2)
        └── [...slug].astro         ← EXISTS — do NOT touch
```

### Previous Story Learnings (from Story 2.4)

- **`display: inline-block` for tap targets**: When an element needs a minimum tap target via `padding-block`, it must be `display: inline-block`. For block links (like the full-band `<a>`), `display: block` is correct and padding works normally.
- **`rel="noopener noreferrer"` only on external links**: Internal links (`/projects/{slug}`) must NOT have `rel` or `target` attributes. The `InlineLink` component handles this automatically; for raw `<a>` tags, verify manually.
- **Scoped `<style>` vs global CSS**: The `ProjectBand` component uses Tailwind utilities only — no `<style>` block needed. If custom CSS is required (e.g. for the hero reveal in Story 5.4), add a scoped `<style>` block then.
- **`astro:page-load` for scripts**: Not applicable here — no `<script>` in this story.
- **Token references**: Never hardcode OKLCH values. Use `text-meta`, `text-ink`, `font-mono`, `font-serif` Tailwind utilities.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.5`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 5.4`] — hero reveal deferred; right column reserved
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.5`] — hover animation deferred; `group` class added now
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — `ProjectBand.astro` in `src/components/content/`
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture`] — token usage, no hardcoded values
- [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`] — `transition:name` pattern: `{element}-{slug}`
- [Source: `_bmad-output/planning-artifacts/architecture.md#View Transitions & Animation Lifecycle`] — `transition:name` on `<h2>` index / `<h1>` detail; same value required
- [Source: `_bmad-output/planning-artifacts/architecture.md#Anti-Patterns`] — no hardcoded colors, no layout animation
- [Source: `_bmad-output/planning-artifacts/architecture.md#Accessibility Patterns`] — semantic HTML, `aria-hidden` on decorative elements
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#FR-10`] — 30–40vh bands, serif display title, monospace meta, right whitespace for hero
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy — ProjectBand`] — `<article>` with `<h2>`, meta, hover hero placeholder, `group` for hover variants
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Spacing & Layout Foundation`] — 4×–6× baseline "ma" gaps desktop, 3× mobile
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Typography System`] — Display: `clamp(2.5rem, 6.5vw, 4.25rem)`, weight 400, line-height 1.05
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#UX-DR10`] — `projects.length >= 3` → link to index page
- [Source: `src/pages/index.astro`] — existing content-count logic; `>= 3` branch to update
- [Source: `src/pages/projects/[...slug].astro`] — `pt-28 px-7` padding pattern; `getCollection` + sort pattern
- [Source: `_bmad-output/implementation-artifacts/2-4-inlinelink-component-base-styling-and-external-annotations.md#Dev Notes`] — `group` class for future hover variants; `rel` only on external links
- [Source: FR-10] — project index bands structure
- [Source: UX-DR10] — content-count home page scaling

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Created `src/components/content/ProjectBand.astro`: exhibition-style band with `<article>` + block `<a>`, display serif `<h2>` with `transition:name`, Commit Mono meta line, two-column desktop grid with `aria-hidden` hero placeholder, `group` class for future hover variants (Stories 3.5, 5.4).
- Created `src/pages/projects/index.astro`: fetches and sorts non-draft projects, renders `ProjectBand` per entry, `sr-only` `<h1>`, `space-y-21 md:space-y-[168px]` band gaps, `Colophon` at bottom, desktop-expanded layout (`md:max-w-none md:px-14`).
- Updated `src/pages/index.astro` `projects.length >= 3` branch: replaced inline project list with a single `Work: N projects →` link to `/projects`. The `=== 1` and `=== 2` branches are unchanged. Essays section untouched.
- All 11 ACs satisfied. `bun run format && bun run lint && bun run check` passes with 0 errors, 0 warnings.

### File List

- `src/components/content/ProjectBand.astro` — CREATED
- `src/pages/projects/index.astro` — CREATED
- `src/pages/index.astro` — MODIFIED (projects >= 3 branch only)

### Review Findings

- [x] [Review][Defer] `date.slice(0, 4)` on unvalidated string [src/components/content/ProjectBand.astro:16] — deferred, pre-existing; schema enforces `z.string()` only, same pattern exists in `[...slug].astro`; a malformed date would silently truncate the year display
- [x] [Review][Defer] Empty projects array — `/projects` index renders blank content area [src/pages/projects/index.astro] — deferred, pre-existing design decision; dev notes acknowledge this as acceptable since home page prevents linking to `/projects` when `projects.length < 3`
- [x] [Review][Defer] `entry.id` as slug may contain path separators if nested content files are added [src/pages/projects/index.astro:22] — deferred, pre-existing pattern; same `entry.id` usage exists in `index.astro` and `[...slug].astro`; would produce 404 and invalid `transition:name` if subdirectory content files are ever added
- [x] [Review][Defer] `order` NaN risk if schema relaxes `order` to optional in future [src/pages/projects/index.astro:9] — deferred, latent risk not introduced by this story; `a.data.order - b.data.order` with NaN produces non-deterministic sort order

## Change Log

- 2026-05-22: Implemented story 2.5 — created `ProjectBand.astro`, `src/pages/projects/index.astro`, updated home page `>= 3` branch to link to `/projects`. All ACs satisfied, validation passes.
- 2026-05-22: Code review complete — 0 patch, 0 decision-needed, 4 deferred, 11 dismissed. Story status: done.
