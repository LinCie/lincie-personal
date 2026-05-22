# Story 1.6: Colophon & 404 Page

Status: done

## Story

As a visitor,
I want a book-style colophon on every page and a graceful 404 page in voice,
so that I can always find contact information and never feel lost on a dead link.

## Acceptance Criteria

1. The colophon contains: typography credits ("Set in Newsreader and Commit Mono, both SIL OFL 1.1."), the current year, a mailto link to `contact@lincie.me`, and social links (`→ github  ↗ twitter  ↗ are.na`)
2. The colophon is rendered in `<footer>` semantics
3. External social links carry `rel="noopener noreferrer"` and the `↗` prefix (inside `<span aria-hidden="true">`); the mailto link carries `→`
4. The mailto opens the visitor's mail client to `contact@lincie.me`
5. The colophon renders on every page (home, project, essay, 404)
6. A visitor hitting an unknown route sees a single centered serif paragraph in voice with inline links to home, the project, and the essay
7. The BL corner label on the 404 page reads `404 — NOT FOUND`
8. The Frame renders normally around the 404 content
9. No big "404" number, no humor, no broken-character moment
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Verify `src/components/content/Colophon.astro` is complete (AC: #1–#5)
  - [x] 1.1: Confirm the component already exists from Story 1.5 — **do NOT recreate it**
  - [x] 1.2: Verify it renders in `<footer>` with `aria-label="Site colophon"`
  - [x] 1.3: Verify typography credits, year, mailto, and social links are present
  - [x] 1.4: Verify `↗` glyphs are wrapped in `<span aria-hidden="true">` on social links
  - [x] 1.5: Verify `rel="noopener noreferrer"` on all three external social links
  - [x] 1.6: If any of the above are missing, patch the component — otherwise leave it untouched

- [x] Task 2: Create `src/pages/404.astro` (AC: #6–#9)
  - [x] 2.1: Import `BaseLayout` from `../layouts/BaseLayout.astro`
  - [x] 2.2: Import `Colophon` from `../components/content/Colophon.astro`
  - [x] 2.3: Pass `title="404 — Not Found"` to BaseLayout
  - [x] 2.4: Pass `sectionLabel="404 — NOT FOUND"` to BaseLayout (sets BL corner label)
  - [x] 2.5: Pass `description="This page seems to have been left out of the index."` to BaseLayout
  - [x] 2.6: Add `<h1 class="sr-only">Page not found</h1>` before the paragraph (screen reader document outline — WCAG 2.4.6)
  - [x] 2.7: Write the single centered serif paragraph in voice (see implementation pattern below)
  - [x] 2.8: Include inline links to home (`/`), the project (`/projects/building-lincie`), and the essay (`/writing/craft-as-proof`)
  - [x] 2.9: Render `<Colophon />` at the bottom
  - [x] 2.10: Wrap content in the same centered column pattern as the home page (`mx-auto max-w-[65ch] px-7 pt-28`)

- [x] Task 3: Validate (AC: #10)
  - [x] 3.1: Run `bun run format`
  - [x] 3.2: Run `bun run lint`
  - [x] 3.3: Run `bun run check`

## Dev Notes

### Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/content/Colophon.astro` | VERIFY (likely no change) | Already built in Story 1.5 — check only |
| `src/pages/404.astro` | CREATE | Does not exist yet |

No other files are modified in this story.

### Critical: Colophon Already Exists — Do NOT Recreate

`src/components/content/Colophon.astro` was created in Story 1.5. Verify these properties before proceeding — if all match, leave the file untouched:

| Property | Expected value |
|----------|---------------|
| Element | `<footer aria-label="Site colophon">` |
| Typography credit | `Set in Newsreader and Commit Mono, both SIL OFL 1.1.` |
| Year | `{new Date().getFullYear()}` (build-time) |
| Mailto | `href="mailto:contact@lincie.me"` with `→` prefix |
| Social links | `rel="noopener noreferrer"` on all three |
| Arrow glyphs | `↗` wrapped in `<span aria-hidden="true">` on all three social links |
| Styling | `font-mono text-[0.75rem] text-meta` — metadata register |

If any property is missing, patch only that property. The only new file to create is `src/pages/404.astro`.

### 404 Page — Implementation Pattern

In Astro static output mode, `src/pages/404.astro` compiles to `dist/404.html` (not `dist/404/index.html`). Vercel automatically serves `404.html` for all unmatched routes. No `vercel.json` or special configuration needed. Do NOT create `src/pages/404/index.astro` — the flat file is correct.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Colophon from "../components/content/Colophon.astro";
---

<BaseLayout
  title="404 — Not Found"
  sectionLabel="404 — NOT FOUND"
  description="This page seems to have been left out of the index."
>
  <div class="mx-auto max-w-[65ch] px-7 pt-28">
    <!-- sr-only h1 for screen reader document outline (WCAG 2.4.6) — same pattern as index.astro -->
    <h1 class="sr-only">Page not found</h1>

    <p class="font-serif text-ink leading-[1.555]">
      This page seems to have been left out of the index. Try the{" "}
      <a href="/" class="underline-offset-2 hover:text-meta transition-colors duration-(--dur-quick)">
        home page
      </a>
      , a look at{" "}
      <a href="/projects/building-lincie" class="underline-offset-2 hover:text-meta transition-colors duration-(--dur-quick)">
        the work
      </a>
      , or{" "}
      <a href="/writing/craft-as-proof" class="underline-offset-2 hover:text-meta transition-colors duration-(--dur-quick)">
        the writing
      </a>
      .
    </p>
  </div>

  <div class="mx-auto max-w-[65ch] px-7">
    <Colophon />
  </div>
</BaseLayout>
```

**Key decisions:**
- `sectionLabel="404 — NOT FOUND"` — passed to BaseLayout → Frame → BL corner label (AC #7)
- `<h1 class="sr-only">Page not found</h1>` — visually hidden, provides document outline for screen readers (WCAG 2.4.6). Same pattern as `index.astro`'s `<h1 class="sr-only">LinCie</h1>`. The `<title>` tag alone is insufficient for document structure.
- Single visible `<p>` — no big number, no humor (AC #9). The paragraph is the entire visible content.
- Link classes match `index.astro` exactly: `underline-offset-2 hover:text-meta transition-colors duration-(--dur-quick)` — no `underline` class at rest. Links have no underline at rest on this site; the inkstroke animation (Epic 3) will add the hover underline later.
- `hover:text-meta` — subtle hover state, consistent with the site's quiet aesthetic
- `transition-colors duration-(--dur-quick)` — matches the token-based transition pattern
- Same `max-w-[65ch] mx-auto px-7 pt-28` column as the home page — consistent layout
- Colophon wrapped in its own `max-w-[65ch]` div — same pattern as `index.astro`
- `transition:animate="fade"` on `<main>` in BaseLayout applies to the 404 page automatically — the content cross-fades correctly on navigation without any extra configuration
- No `<script>` tags — no client-side JS in this story

**Voice note:** The paragraph must be in LinCie's voice — quiet, direct, no apology, no humor. "This page seems to have been left out of the index." is the correct register. Do NOT write "Oops!", "404 error", "Page not found", or anything that breaks the typographic voice.

**Link targets:** At MVP there is 1 project (`building-lincie`) and 1 essay (`craft-as-proof`). Link directly to those slugs. The FR-14 spec says "inline links to home, the project, and the essay" — these are the correct targets.

### BaseLayout — Current State (No Changes Needed)

`src/layouts/BaseLayout.astro` already accepts `title`, `sectionLabel`, and `description` props (added in Story 1.5). The `sectionLabel` prop flows to `Frame.astro` which renders it in the BL corner. No changes to BaseLayout are needed in this story.

```astro
interface Props {
  title: string;
  sectionLabel?: string;
  description?: string;
}
```

Passing `sectionLabel="404 — NOT FOUND"` will render correctly in the BL corner per the Frame implementation from Story 1.4.

### Frame — BL Corner Label Behavior

From Story 1.4, the Frame renders the BL corner label from the `sectionLabel` prop. The value `"404 — NOT FOUND"` will render in Commit Mono at `~0.75rem` in `--meta` color, uppercase (the `uppercase` class is already applied in `Frame.astro`). The em dash (`—`) is a literal character — do not use `&mdash;` or `--`.

### Spacing — Baseline Grid Compliance

All spacing must use baseline multiples (28px = `7` in Tailwind's 4px scale):

| Tailwind class | px value | Baseline multiple | Use |
|---|---|---|---|
| `pt-28` | 112px | 4× | Top padding on page content (clears Frame) |
| `mt-28` | 112px | 4× | Colophon top margin (already in Colophon.astro) |
| `pt-7` | 28px | 1× | Colophon top padding (already in Colophon.astro) |
| `pb-14` | 56px | 2× | Colophon bottom padding (already in Colophon.astro) |
| `px-7` | 28px | 1× | Horizontal page padding |

Do NOT use `mt-8` (32px), `mt-6` (24px), `pt-10` (40px), or other non-baseline values.

### Accessibility Requirements

1. **`<h1 class="sr-only">Page not found</h1>`** — required for WCAG 2.4.6 document outline. Visually hidden but present in the accessibility tree. Same pattern as `index.astro`. Place it before the visible paragraph inside the content div.
2. **No `aria-hidden` on links** — all three inline links in the 404 paragraph are navigation and must be in the accessibility tree.
3. **Link text is descriptive** — "home page", "the work", "the writing" are acceptable. Never "click here" or "here".
4. **`<footer>` implicit role** — do NOT add `role="contentinfo"` to the Colophon's `<footer>` element.
5. **Focus-visible states** — the global `:focus-visible` rule in `global.css` applies `outline: 2px solid var(--ink)` to all interactive elements automatically. No additional focus styling is needed on the 404 links.

### ESLint / jsx-a11y Rules to Watch

- `jsx-a11y/anchor-has-content` — all `<a>` elements must have text content. "home page", "the work", "the writing" satisfy this.
- `jsx-a11y/anchor-is-valid` — all `<a>` elements must have `href`. All three links have valid `href` values.
- `jsx-a11y/no-redundant-roles` — `<footer>` has implicit `contentinfo` role; do not add `role="contentinfo"`.

### What This Story Does NOT Include

- No `og:title`, `og:description`, `og:image`, Twitter card meta on the 404 page (Story 1.7)
- No `robots.txt` (Story 1.7)
- No live local time in TR corner (Story 5.2)
- No scroll-driven folio in BR corner (Story 5.3)
- No paper-tone drift (Story 5.1)
- No page reveal sequence (Story 3.2)
- No cursor afterglow (Story 3.3)
- No inkstroke underline animation on the 404 links (Story 3.5) — links use `underline-offset-2` at rest with no underline; the animated inkstroke draws on hover in Epic 3
- No `<script>` tags — no client-side JS in this story

### Previous Story Learnings (from Story 1.5)

- `entry.id` for URL construction (not `entry.slug` — deprecated in Astro 5+)
- `ClientRouter` from `'astro:transitions'` (not `ViewTransitions`)
- `transition:persist` on Frame — do not remove
- `tabindex="-1"` on `<main>` — required for Safari skip-link behavior — do not remove
- `bg-paper text-ink` on `<body>` — do not remove
- Tailwind v4 CSS variable references use parentheses: `duration-(--dur-quick)` not `duration-[--dur-quick]`
- `focus-visible:outline-ink` is the correct Tailwind class for the ink-colored outline
- `rel="noopener noreferrer"` on external links (not just `noopener`)
- `↗` glyphs wrapped in `<span aria-hidden="true">` so screen readers hear clean link text
- Sort tiebreaker: `.id.localeCompare()` when two entries share the same `order` value
- `z.boolean().default(false)` for `draft` field in content schemas

**From Story 1.4 Review Findings (already patched in committed code):**
- `:focus-visible` global outline uses `var(--ink)` (not `var(--paper)`) — already fixed in `global.css`
- TR, BL, BR spans have `uppercase` class — already applied in `Frame.astro`
- TR span has `data-frame="local-time"` attribute — already applied in `Frame.astro`

### Anti-Patterns to Avoid

- ❌ Do NOT recreate `Colophon.astro` — it already exists from Story 1.5
- ❌ Do NOT create `src/pages/404/index.astro` — the correct file is `src/pages/404.astro` (compiles to `dist/404.html`)
- ❌ Do NOT add a big "404" heading or number — FR-14 explicitly forbids it
- ❌ Do NOT omit `<h1 class="sr-only">Page not found</h1>` — required for WCAG 2.4.6 document outline
- ❌ Do NOT add `underline` class to the 404 links — links have no underline at rest on this site (matches `index.astro` pattern)
- ❌ Do NOT add humor ("Oops!", "Lost?", etc.) — breaks the typographic voice
- ❌ Do NOT use `role="contentinfo"` on `<footer>` — it has the implicit role already
- ❌ Do NOT hardcode color values — use `text-ink`, `text-meta`, `border-hairline` Tailwind utilities
- ❌ Do NOT use non-baseline spacing (e.g., `mt-8`, `mt-6`, `pt-10`) — baseline multiples only
- ❌ Do NOT add `box-shadow` anywhere
- ❌ Do NOT add accent colors (no `text-blue-500`, etc.)
- ❌ Do NOT add `<script>` tags — no client-side JS in Story 1.6
- ❌ Do NOT use `duration-[--dur-quick]` (square brackets) — use `duration-(--dur-quick)` (parentheses) for CSS variable references in Tailwind v4
- ❌ Do NOT use `target="_blank"` on any links — let the visitor decide
- ❌ Do NOT add `aria-hidden` to any link or interactive element
- ❌ Do NOT modify `global.css`, `typography.css`, or `BaseLayout.astro` in this story
- ❌ Do NOT use `&mdash;` in the `sectionLabel` prop — use the literal `—` character

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component & File Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Accessibility Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: FR-14: 404 page composition]
- [Source: FR-15: Colophon composition]
- [Source: AGENTS.md#Styling rules]
- [Source: AGENTS.md#Accessibility]

### Review Findings

- [x] [Review][Decision] Links have no underline at rest — WCAG 1.4.1 color-only distinction — Accepted as deliberate design. No-underline-at-rest is a site-wide rule matching `index.astro`; the inkstroke animation (Story 3.5) is the planned visual affordance. [`src/pages/404.astro` lines 18–36]
- [x] [Review][Defer] Recovery links point to routes that don't exist yet [`src/pages/404.astro` lines 24, 30] — deferred, pre-existing; routes created in Epic 2 per spec
- [x] [Review][Defer] HTTP 404 status code not guaranteed in static output mode — Astro static output generates `404.html`; whether the server serves it with HTTP 404 depends on the hosting platform. Vercel handles this automatically by convention, but worth confirming before launch. — deferred, pre-existing deployment concern, out of scope for this story
- [x] [Review][Defer] `border-hairline` Tailwind token dependency in Colophon — requires `@theme inline` in `global.css`; silent visual regression if `inline` keyword is removed in a future refactor. [`src/components/content/Colophon.astro`] — deferred, pre-existing, not introduced by this story

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Task 1: `Colophon.astro` verified complete from Story 1.5 — all properties matched (`<footer aria-label="Site colophon">`, typography credit, build-time year, mailto with `→`, `rel="noopener noreferrer"` on all three social links, `↗` in `<span aria-hidden="true">` on all three). No changes made.
- Task 2: Created `src/pages/404.astro` — single centered serif paragraph in voice with inline links to `/`, `/projects/building-lincie`, and `/writing/craft-as-proof`. `<h1 class="sr-only">Page not found</h1>` included for WCAG 2.4.6. `sectionLabel="404 — NOT FOUND"` passed to BaseLayout for BL corner. `<Colophon />` rendered at bottom. No client-side JS.
- Task 3: `bun run format` (Prettier sorted Tailwind classes), `bun run lint` (0 errors), `bun run check` (0 errors, 0 warnings, 0 hints) — all pass.

### File List

- `src/pages/404.astro` — created
- `src/components/content/Colophon.astro` — verified, no changes

### Change Log

- 2026-05-22: Created `src/pages/404.astro` with voice paragraph, sr-only h1, inline links, Colophon, and correct BaseLayout props (Story 1.6)
