# Story 1.5: Home Page — Honest First Paint & Content-Count Logic

Status: done

## Story

As a recruiter scanning on mobile,
I want the home page to tell me what LinCie does in the first viewport with a clear path to work and contact,
so that I can form an impression and reach out within seconds.

## Acceptance Criteria

1. The first viewport contains: a short serif paragraph stating what LinCie does (engineering, research, design), a named project link, a named essay link, and one inline contact link (mailto to `contact@lincie.me`)
2. The inline contact link has a minimum 44×44px tap target on mobile (via padding, not visual size)
3. No drop cap is used on the home page
4. The colophon renders at the bottom
5. Content-count logic resolves at build time via `getCollection()`: 1 project = direct link, 2 = two inline links, ≥3 = list + index link (same pattern for essays)
6. The home page is fully readable with all links functional without JavaScript
7. The home page renders below 50KB of HTML + CSS (excluding fonts)
8. BL corner label is blank on the home page
9. `<title>` is `"LinCie"` and `<meta name="description">` states plainly that LinCie is a thinker who builds
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/content/Colophon.astro` (AC: #4)
  - [x] 1.1: Create `src/components/content/` directory
  - [x] 1.2: Render in `<footer>` semantics with `role` implicit from element
  - [x] 1.3: Include typography credits: "Set in Newsreader and Commit Mono, both SIL OFL 1.1."
  - [x] 1.4: Include current year (resolved at build time via `new Date().getFullYear()`)
  - [x] 1.5: Include mailto link to `contact@lincie.me`
  - [x] 1.6: Include social links: `→ github` (internal-style, no `↗`), `↗ twitter`, `↗ are.na`
  - [x] 1.7: External links carry `rel="noopener"` and `↗` prefix; internal/mailto carry `→`
  - [x] 1.8: Style in `font-mono text-meta text-[0.75rem]` — colophon is metadata, not body text
  - [x] 1.9: Add `aria-label="Site colophon"` to `<footer>` for screen reader clarity

- [x] Task 2: Update `src/layouts/BaseLayout.astro` to accept and pass `description` prop (AC: #9)
  - [x] 2.1: Add `description?: string` to `Props` interface
  - [x] 2.2: Add `<meta name="description" content={description} />` in `<head>` (render only when prop is provided)

- [x] Task 3: Rewrite `src/pages/index.astro` — home page composition (AC: #1–#9)
  - [x] 3.1: Import `getCollection` from `'astro:content'`
  - [x] 3.2: Fetch and filter non-draft projects: `getCollection('projects', ({ data }) => !data.draft)`
  - [x] 3.3: Sort projects by `data.order` ascending
  - [x] 3.4: Fetch and filter non-draft essays: `getCollection('writing', ({ data }) => !data.draft)`
  - [x] 3.5: Sort essays by `data.order` ascending
  - [x] 3.6: Implement content-count logic for projects (1 = direct link, 2 = two inline links, ≥3 = list + index link)
  - [x] 3.7: Implement content-count logic for essays (same pattern)
  - [x] 3.8: Write the honest first-paint paragraph (engineering, research, design — in voice)
  - [x] 3.9: Include one inline contact link (`mailto:contact@lincie.me`) with `p-3` padding for 44px tap target
  - [x] 3.10: Pass `title="LinCie"` and `description="LinCie is a thinker who builds — engineering, research, and design as one voice."` to `BaseLayout`
  - [x] 3.11: Pass no `sectionLabel` (BL corner blank on home)
  - [x] 3.12: Import and render `Colophon` at the bottom of the page
  - [x] 3.13: Wrap page content in a centered column with `65–75ch` measure on desktop, full-width on mobile

- [x] Task 4: Validate (AC: #10)
  - [x] 4.1: Run `bun run format`
  - [x] 4.2: Run `bun run lint`
  - [x] 4.3: Run `bun run check`

## Dev Notes

### Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/content/Colophon.astro` | CREATE | Book-style footer — new component |
| `src/layouts/BaseLayout.astro` | UPDATE | Add `description` prop + `<meta name="description">` |
| `src/pages/index.astro` | UPDATE | Full rewrite — home page composition |

No other files are modified in this story.

### Current State of Files Being Modified

**`src/layouts/BaseLayout.astro`** — current state (from Story 1.4):
```astro
---
import "../styles/global.css";
import { Font } from "astro:assets";
import { ClientRouter } from "astro:transitions";
import Frame from "../components/frame/Frame.astro";

interface Props {
  title: string;
  sectionLabel?: string;
}

const { title, sectionLabel } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <Font cssVariable="--font-newsreader" preload={[{ style: "normal" }]} />
    <Font cssVariable="--font-commit-mono" />
    <ClientRouter />
  </head>
  <body class="bg-paper text-ink">
    <a href="#main-content" class="skip-to-content">Skip to content</a>
    <Frame sectionLabel={sectionLabel} transition:persist />
    <main id="main-content" tabindex="-1" transition:animate="fade">
      <slot />
    </main>
  </body>
</html>
```

**What must be preserved:** All `<head>` content (charset, icons, viewport, generator, title, Font components, ClientRouter). The `global.css` import. The `<html lang="en">` attribute. The skip-to-content link. The Frame with `transition:persist`. The `<main id="main-content" tabindex="-1">` wrapper.

**What changes:** Add `description?: string` to Props interface. Add `<meta name="description">` in `<head>` (conditional on prop being provided).

**`src/pages/index.astro`** — current state (from Story 1.4):
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="LinCie">
  <h1>LinCie</h1>
</BaseLayout>
```

**What changes:** Full rewrite. Add `getCollection` imports, content-count logic, honest first-paint paragraph, contact link, project/essay links, Colophon. Pass `description` prop to BaseLayout.

### Content-Count Logic — Implementation Pattern

The content-count logic runs entirely at build time in the Astro frontmatter. No client-side JS.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Colophon from '../components/content/Colophon.astro';

// Fetch and sort non-draft content
const allProjects = await getCollection('projects', ({ data }) => !data.draft);
const projects = allProjects.sort((a, b) => a.data.order - b.data.order);

const allEssays = await getCollection('writing', ({ data }) => !data.draft);
const essays = allEssays.sort((a, b) => a.data.order - b.data.order);
---
```

**Content-count rendering (in template):**

```astro
<!-- Projects section -->
{projects.length === 1 && (
  <p>
    Recent work: <a href={`/projects/${projects[0].id}`}>{projects[0].data.title}</a>.
  </p>
)}
{projects.length === 2 && (
  <p>
    Recent work:
    <a href={`/projects/${projects[0].id}`}>{projects[0].data.title}</a>
    {' '}and{' '}
    <a href={`/projects/${projects[1].id}`}>{projects[1].data.title}</a>.
  </p>
)}
{projects.length >= 3 && (
  <ul>
    {projects.map(p => (
      <li><a href={`/projects/${p.id}`}>{p.data.title}</a></li>
    ))}
  </ul>
  <p><a href="/projects">All work →</a></p>
)}
```

**Same pattern for essays** — replace `projects` with `essays`, `/projects/` with `/writing/`.

**Important:** At MVP there is exactly 1 project (`building-lincie`) and 1 essay (`craft-as-proof`). The `length === 1` branch will render. The other branches must still be implemented correctly — they will activate as content grows.

**Slug note:** With Astro Content Collections using the `glob` loader, `entry.id` is the filename without extension (e.g., `building-lincie`). Use `entry.id` for URL construction, not `entry.slug` (deprecated in Astro 5+).

### Colophon Component — Implementation Pattern

```astro
---
// src/components/content/Colophon.astro
// No props — all content is static or build-time computed.

const year = new Date().getFullYear();
---

<footer
  class="mt-28 border-t border-hairline pt-7 pb-14 font-mono text-[0.75rem] leading-relaxed text-meta"
  aria-label="Site colophon"
>
  <p>Set in Newsreader and Commit Mono, both SIL OFL 1.1.</p>
  <p>© {year} LinCie.</p>
  <p>
    <a href="mailto:contact@lincie.me" class="hover:text-ink transition-colors duration-(--dur-quick)">
      → contact@lincie.me
    </a>
  </p>
  <p class="mt-3">
    <a
      href="https://github.com/lincie"
      rel="noopener"
      class="hover:text-ink transition-colors duration-(--dur-quick)"
    >↗ github</a>
    {' '}
    <a
      href="https://twitter.com/lincie"
      rel="noopener"
      class="hover:text-ink transition-colors duration-(--dur-quick)"
    >↗ twitter</a>
    {' '}
    <a
      href="https://are.na/lincie"
      rel="noopener"
      class="hover:text-ink transition-colors duration-(--dur-quick)"
    >↗ are.na</a>
  </p>
</footer>
```

**Key decisions:**
- `mt-28` = 112px = 4× baseline (generous "ma" gap before the colophon)
- `border-t border-hairline` — hairline rule separates colophon from content
- `pt-7` = 28px = 1× baseline above colophon content
- `pb-14` = 56px = 2× baseline below (breathing room at page bottom)
- `font-mono text-[0.75rem] text-meta` — colophon is metadata, same visual register as Frame corners
- `→` prefix for internal/mailto links; `↗` prefix for external links
- `rel="noopener"` on all external links (no `noreferrer` needed — no referrer data is sensitive here)
- No `target="_blank"` — let the visitor decide how to open external links

**Social link URLs:** The actual GitHub/Twitter/are.na URLs for LinCie are not specified in the PRD. Use placeholder paths (`https://github.com/lincie`, etc.) — they will be updated when LinCie provides the real handles. Do NOT leave them as `#` or empty.

### Home Page — Layout & Composition Pattern

The home page has no drop cap (AC #3). It is a single-column prose layout with generous spacing.

```astro
<BaseLayout
  title="LinCie"
  description="LinCie is a thinker who builds — engineering, research, and design as one voice."
>
  <div class="mx-auto max-w-[65ch] px-7 pt-28">
    <!-- Honest first-paint paragraph -->
    <p class="font-serif text-ink leading-[1.555]">
      LinCie builds at the intersection of engineering, research, and design —
      treating them as the same discipline expressed through different materials.
      <a
        href="mailto:contact@lincie.me"
        class="text-ink underline-offset-2 hover:text-meta p-3 transition-colors duration-(--dur-quick)"
      >
        Reach out.
      </a>
    </p>

    <!-- Projects section (content-count logic here) -->
    <section class="mt-14" aria-label="Work">
      <!-- ... content-count branches ... -->
    </section>

    <!-- Essays section (content-count logic here) -->
    <section class="mt-14" aria-label="Writing">
      <!-- ... content-count branches ... -->
    </section>
  </div>

  <div class="mx-auto max-w-[65ch] px-7">
    <Colophon />
  </div>
</BaseLayout>
```

**Layout decisions:**
- `max-w-[65ch]` — 65-character measure on desktop (AC #7 and UX-DR reading comfort)
- `mx-auto` — centered column
- `px-7` = 28px = 1× baseline horizontal padding (matches Frame corner inset)
- `pt-28` = 112px = 4× baseline top padding (clears the Frame TL corner label at `top-7` = 28px, with generous breathing room)
- No `max-w-[75ch]` — 65ch is the tighter end of the 65–75ch range; appropriate for the home page's short-form prose

**Contact link tap target (AC #2):**
- `p-3` = 12px padding on all sides → 12px × 2 + ~13.5px text ≈ 37.5px. This is slightly under 44px.
- Use `py-3 px-2` or `p-3` with `inline-block` and `min-h-[44px] min-w-[44px]` to guarantee the tap target.
- Alternatively: wrap in a `<span class="inline-block">` with the padding applied to the `<a>`.
- **Recommended approach:** `class="inline-block p-3 -mx-3"` on the `<a>` — the negative margin compensates for the visual shift while the padding creates the tap target. This is the same pattern used for the INDEX link in Frame.astro.
- At 112.5% root font size, `0.75rem` = ~13.5px. For body text at `1rem` = ~18px, `p-3` (12px × 2 = 24px) + 18px = 42px — still slightly under. Use `py-3` (12px × 2 = 24px) + 18px = 42px. To guarantee 44px: use `py-[13px]` or add `min-h-[44px] flex items-center` on the link.
- **Simplest correct approach:** `class="underline-offset-2 hover:text-meta transition-colors duration-(--dur-quick) focus-visible:outline-2 focus-visible:outline-offset-2"` with a wrapping `<span class="inline-flex items-center min-h-[44px]">` — this guarantees the tap target without visual change.

### BaseLayout — `description` Prop Addition

Minimal change to `BaseLayout.astro`:

```astro
interface Props {
  title: string;
  sectionLabel?: string;
  description?: string;  // ADD THIS
}

const { title, sectionLabel, description } = Astro.props;  // ADD description
```

In `<head>`, after `<title>`:
```astro
{description && <meta name="description" content={description} />}
```

**Why optional:** Story 1.7 handles full SEO meta for all pages. At this stage, only the home page passes a description. Making it optional means existing pages (none yet, but future ones) don't break if they don't pass it.

### Spacing — Baseline Grid Compliance

All spacing must use baseline multiples (28px = `7` in Tailwind's 4px scale):

| Tailwind class | px value | Baseline multiple | Use |
|---|---|---|---|
| `pt-28` | 112px | 4× | Top padding on page content (clears Frame) |
| `mt-14` | 56px | 2× | Between sections |
| `mt-28` | 112px | 4× | Before colophon |
| `pt-7` | 28px | 1× | Colophon top padding |
| `pb-14` | 56px | 2× | Colophon bottom padding |
| `px-7` | 28px | 1× | Horizontal page padding |

Do NOT use `mt-8` (32px), `mt-6` (24px), `pt-10` (40px), or other non-baseline values.

### Typography — No Drop Cap on Home Page

The home page explicitly has no drop cap (AC #3, FR-9). Do NOT apply `.drop-cap` class or `::first-letter` pseudo-element to any paragraph on the home page. Drop caps are for project and essay pages (Stories 2.1, 2.2).

The `typography.css` file has a commented-out `@font-face` fallback block — do NOT uncomment it in this story.

### Accessibility Requirements

1. **Contact link tap target** (UX-DR1, UX-DR12): The inline `mailto:` link must have a minimum 44×44px tap target on mobile. Use padding + `inline-flex items-center min-h-[44px]` pattern.
2. **Section labels** (semantic HTML): Use `<section aria-label="Work">` and `<section aria-label="Writing">` to give screen readers context for the project/essay link groups.
3. **Link text** (WCAG 2.4.6): Link text must be descriptive. Use the project/essay title as link text — never "click here" or "read more."
4. **BL corner blank** (AC #8): Pass no `sectionLabel` prop (or pass `sectionLabel=""`) to BaseLayout. The Frame renders an empty BL span — this is correct behavior per Story 1.4.
5. **No `aria-hidden` on content links**: The project/essay links are navigation — they must be in the accessibility tree.

### ESLint / jsx-a11y Rules to Watch

- `jsx-a11y/anchor-is-valid` — all `<a>` elements must have `href`. The mailto link uses `href="mailto:contact@lincie.me"` ✅
- `jsx-a11y/no-redundant-roles` — `<footer>` has implicit `contentinfo` role; do not add `role="contentinfo"`
- `jsx-a11y/anchor-has-content` — all `<a>` elements must have text content. Ensure link text is never empty.
- `jsx-a11y/no-aria-hidden-on-focusable` — do not add `aria-hidden` to any link or interactive element

### Content-Count Edge Cases

**Zero content (no non-draft items):** The home page must not render empty containers. If `projects.length === 0`, render nothing for the projects section (or a graceful fallback). Same for essays. This is unlikely at MVP but must be handled.

```astro
{projects.length > 0 && (
  <section class="mt-14" aria-label="Work">
    {/* content-count branches */}
  </section>
)}
```

**Draft filtering:** `getCollection('projects', ({ data }) => !data.draft)` filters at the collection query level. This is the correct Astro pattern — do NOT filter after fetching all items.

### What This Story Does NOT Include

- No `og:title`, `og:description`, `og:image`, Twitter card meta (Story 1.7)
- No `robots.txt` (Story 1.7)
- No live local time in TR corner (Story 5.2)
- No scroll-driven folio in BR corner (Story 5.3)
- No paper-tone drift (Story 5.1)
- No page reveal sequence (Story 3.2)
- No cursor afterglow (Story 3.3)
- No project index page at `/projects` (Story 2.5) — the ≥3 branch links to it but the page doesn't exist yet; that's fine for a static build (the link will 404 until Story 2.5)
- No project or essay page templates (Stories 2.1, 2.2) — links to `/projects/{id}` and `/writing/{id}` will 404 until those stories are implemented
- No `transition:name` on project titles (Story 2.1)
- No `<script>` tags in this story — no client-side JS

### Previous Story Learnings

**From Story 1.1:**
- Tailwind 4 is CSS-first — no `tailwind.config.js`
- `@theme inline` required for color tokens referencing `var()`
- `color-scheme: light` is in `:root` — do not remove

**From Story 1.2:**
- `font-size: 112.5%` (not `18px`) is the correct value in `typography.css` — do not change
- `<Font cssVariable="--font-newsreader" preload={[{ style: "normal" }]} />` — selective preload syntax
- `<Font cssVariable="--font-commit-mono" />` — no preload for Commit Mono
- Both `Font` imports are already in `BaseLayout.astro` — preserve them

**From Story 1.3:**
- Config file is `src/content.config.ts` (not `src/content/config.ts`) — Astro 6 location
- `z` imported from `'astro/zod'` — not `'astro:content'`
- Use `entry.id` for slug-based URLs (not `entry.slug` — deprecated in Astro 5+)
- `getCollection` is imported from `'astro:content'`

**From Story 1.4:**
- `ClientRouter` from `'astro:transitions'` (not `ViewTransitions` — renamed in Astro 5, removed in Astro 6)
- `transition:persist` on Frame — do not remove
- `tabindex="-1"` on `<main>` — required for Safari skip-link behavior — do not remove
- `bg-paper text-ink` on `<body>` — do not remove
- Tailwind v4 CSS variable references use parentheses: `duration-(--dur-quick)` not `duration-[--dur-quick]`
- `focus-visible:outline-ink` is the correct Tailwind class for the ink-colored outline (from the global `:focus-visible` rule using `var(--ink)`)

**From Story 1.4 Review Findings (already patched in the committed code):**
- `:focus-visible` global outline uses `var(--ink)` (not `var(--paper)`) — the paper-cream outline was invisible against the paper background. This is already fixed in `global.css`.
- TR, BL, BR spans have `uppercase` class — already applied in `Frame.astro`.
- TR span has `data-frame="local-time"` attribute — already applied in `Frame.astro`.

**From git history:**
- All four stories committed cleanly with `bun run format && bun run lint && bun run check` passing
- Prettier reformats some values (trailing zeros, long lines) — this is expected and fine
- ESLint with `eslint-plugin-jsx-a11y` is active — accessibility violations will fail lint

### Anti-Patterns to Avoid

- ❌ Do NOT use `entry.slug` — use `entry.id` for URL construction (Astro 5+ deprecation)
- ❌ Do NOT import `z` from `'astro:content'` — import from `'astro/zod'`
- ❌ Do NOT add a drop cap to the home page — no `::first-letter` or `.drop-cap` class
- ❌ Do NOT use `role="contentinfo"` on `<footer>` — it has the implicit role already
- ❌ Do NOT use `role="navigation"` on `<nav>` — it has the implicit role already
- ❌ Do NOT hardcode color values — use `text-ink`, `text-meta`, `border-hairline` Tailwind utilities
- ❌ Do NOT use non-baseline spacing (e.g., `mt-8`, `mt-6`, `pt-10`) — baseline multiples only
- ❌ Do NOT add `box-shadow` anywhere
- ❌ Do NOT add accent colors (no `text-blue-500`, etc.)
- ❌ Do NOT add `<script>` tags — no client-side JS in Story 1.5
- ❌ Do NOT use `duration-[--dur-quick]` (square brackets) — use `duration-(--dur-quick)` (parentheses) for CSS variable references in Tailwind v4
- ❌ Do NOT use `target="_blank"` on external links — let the visitor decide
- ❌ Do NOT render empty section containers when `projects.length === 0` or `essays.length === 0`
- ❌ Do NOT use `getCollection('projects')` without the filter callback — always filter drafts at query time
- ❌ Do NOT add `aria-hidden` to any link or interactive element
- ❌ Do NOT use `font-size: 18px` in CSS — the root size is `112.5%` (scales with user preference)
- ❌ Do NOT modify `global.css` or `typography.css` in this story — no new CSS needed

### Current Content at MVP

**Projects (1 non-draft):**
- `building-lincie` — "Building LinCie" — "A considered personal site — engineering, research, and design as one voice."

**Essays (1 non-draft):**
- `craft-as-proof` — "Craft as Proof" — "On why the work itself is the argument."

Both collections have exactly 1 item, so the `length === 1` branch renders for both. The home page at MVP will show:
- One project link: "Building LinCie"
- One essay link: "Craft as Proof"

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Content Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component & File Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Accessibility Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR1: First-viewport contact link on mobile]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR10: Content-count home page scaling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR12: 44×44px minimum tap targets]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#FR-3: Honest first paint]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#FR-9: Home page composition]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#FR-15: Colophon composition]
- [Source: AGENTS.md#Styling rules]
- [Source: AGENTS.md#Accessibility]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. All three files implemented cleanly on first pass.

### Completion Notes List

- Created `src/components/content/Colophon.astro` — book-style footer with build-time year, typography credits, mailto link (→ prefix), and three external social links (↗ prefix). `rel="noopener"` on all external links. `aria-label="Site colophon"` on `<footer>`. Styled in `font-mono text-[0.75rem] text-meta` per metadata register.
- Updated `src/layouts/BaseLayout.astro` — added optional `description?: string` prop to `Props` interface; added conditional `<meta name="description">` in `<head>`. All existing content preserved exactly.
- Rewrote `src/pages/index.astro` — full home page composition: `getCollection` imports with draft filtering and `data.order` sort for both collections; all three content-count branches implemented for projects and essays; honest first-paint paragraph in voice; inline contact link wrapped in `inline-flex min-h-[44px] items-center` span for guaranteed 44px tap target (AC #2); `max-w-[65ch] mx-auto px-7 pt-28` centered column; `<section aria-label="Work">` and `<section aria-label="Writing">` for screen reader context; zero-content guard (`length > 0`) on both sections; `title="LinCie"` and `description` prop passed to BaseLayout; no `sectionLabel` (BL corner blank); Colophon rendered at bottom.
- Validation: `bun run format` ✅ | `bun run lint` ✅ | `bun run check` ✅ (0 errors, 0 warnings, 0 hints across 9 files)

### File List

- `src/components/content/Colophon.astro` (CREATE)
- `src/layouts/BaseLayout.astro` (UPDATE)
- `src/pages/index.astro` (UPDATE)

### Change Log

- 2026-05-22: Created `src/components/content/Colophon.astro` — book-style site footer component
- 2026-05-22: Updated `src/layouts/BaseLayout.astro` — added optional `description` prop and conditional `<meta name="description">` tag
- 2026-05-22: Rewrote `src/pages/index.astro` — full home page with honest first-paint paragraph, content-count logic for projects and essays, 44px tap target on contact link, Colophon, and correct BaseLayout props

### Review Findings

**Decision-needed (2):**

- [x] [Review][Decision] No `<h1>` on the home page — WCAG 2.4.6 — **Resolved: added `<h1 class="sr-only">LinCie</h1>` before the first paragraph.**

- [x] [Review][Decision] `↗` glyph in Colophon link text — screen reader announces arrow character — **Resolved: wrapped `↗` in `<span aria-hidden="true">` on all three social links; screen readers now hear clean link text (github, twitter, are.na).**

**Patch (4):**

- [x] [Review][Patch] Unstable sort when two entries share the same `order` value — **Fixed: added `.id.localeCompare()` tiebreaker to both sort calls.** [src/pages/index.astro:8,11]
- [x] [Review][Patch] `draft` field has no `.default(false)` — omitting the field in a content file causes a hard build failure instead of defaulting to non-draft — **Fixed: `z.boolean().default(false)` in both collections.** [src/content.config.ts]
- [x] [Review][Patch] Contact link tap target missing `min-w-[44px]` — height is enforced via `min-h-[44px]` but width is not, failing WCAG 2.5.5 on narrow viewports — **Fixed: added `min-w-[44px]` to the span.** [src/pages/index.astro:36]
- [x] [Review][Patch] External links in Colophon missing `noreferrer` — `rel="noopener"` alone does not prevent `Referer` header leakage to linked sites — **Fixed: `rel="noopener noreferrer"` on all three social links.** [src/components/content/Colophon.astro]

**Defer (4):**

- [x] [Review][Defer] `entry.id` may include subdirectory path for nested content files — deferred, pre-existing; no nested content exists at MVP; relevant when content is reorganized into subdirectories [src/pages/index.astro]
- [x] [Review][Defer] `getFullYear()` copyright year goes stale without a rebuild — deferred, pre-existing; build-time year is the correct pattern per spec; acceptable tradeoff [src/components/content/Colophon.astro]
- [x] [Review][Defer] `inline-flex` inside `<p>` may cause anonymous block box splitting in some browsers — deferred, low-probability rendering edge case; no evidence of actual breakage [src/pages/index.astro:35]
- [x] [Review][Defer] AC #1: project/essay links gated behind `length > 0` — deferred; spec explicitly states MVP has exactly 1 project and 1 essay; guard is correct defensive behavior for future zero-content states [src/pages/index.astro]
