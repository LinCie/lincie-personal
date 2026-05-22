# Story 1.4: BaseLayout with Frame & Accessibility Scaffold

Status: done

## Story

As a visitor,
I want every page to render inside a persistent Frame with corner labels and proper accessibility structure,
so that I always know where I am and can navigate the site with keyboard or screen reader.

## Acceptance Criteria

1. The Frame renders four corner labels at fixed viewport positions: TL `INDEX` (link to `/`), TR placeholder for local time (static text at this stage), BL section label per route (home blank, project `WORK`, essay `WRITING`, 404 `404 — NOT FOUND`), BR folio (static `001 / 001` at this stage)
2. Corner labels render in Commit Mono at ~0.75rem in `--meta` color
3. TL `INDEX` is an `<a>` inside a minimal `<nav>` element
4. Non-interactive corner labels have `aria-hidden="true"`
5. A skip-to-content link is present (hidden until focused via `:focus-visible`, jumps to `<main>`)
6. Below 768px, only TL and BR are visible; TR and BL content folds into the colophon (handled in Story 1.6 — at this stage, TR and BL are hidden on mobile)
7. All interactive elements have visible `:focus-visible` states (2px paper-cream offset outline)
8. The page renders correctly with JavaScript disabled
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/frame/Frame.astro` — corner label scaffold (AC: #1, #2, #3, #4, #6)
  - [x] 1.1: Create `src/components/frame/` directory
  - [x] 1.2: Define `Props` interface: `sectionLabel?: string` (default `''`)
  - [x] 1.3: Render TL corner: `<nav>` containing `<a href="/">INDEX</a>`
  - [x] 1.4: Render TR corner: static `<span aria-hidden="true">` with placeholder time text (e.g. `00:00 LOCAL`)
  - [x] 1.5: Render BL corner: `<span aria-hidden="true">` with `{sectionLabel}` (empty string on home)
  - [x] 1.6: Render BR corner: `<span aria-hidden="true">` with static `001 / 001`
  - [x] 1.7: Apply fixed positioning, Commit Mono font, `--meta` color, and `~0.75rem` size to all four corners
  - [x] 1.8: Hide TR and BL below 768px via Tailwind responsive prefix (`md:block hidden`)
- [x] Task 2: Update `src/layouts/BaseLayout.astro` — integrate Frame, skip link, `<main>`, and `<ClientRouter />` (AC: #3, #5, #7, #8)
  - [x] 2.1: Add `Props` interface: `title: string`, `sectionLabel?: string`
  - [x] 2.2: Import `Frame` from `../components/frame/Frame.astro`
  - [x] 2.3: Import `ClientRouter` from `astro:transitions`
  - [x] 2.4: Add `<ClientRouter />` inside `<head>`
  - [x] 2.5: Add skip-to-content link as first child of `<body>` (before Frame)
  - [x] 2.6: Render `<Frame sectionLabel={sectionLabel} />` with `transition:persist`
  - [x] 2.7: Wrap `<slot />` in `<main id="main-content">` with `transition:animate="fade"`
  - [x] 2.8: Add `<meta name="description">` slot or prop for future SEO (Story 1.7)
  - [x] 2.9: Update `<title>` to use the passed `title` prop (not hardcoded `"Astro"`)
- [x] Task 3: Add skip-to-content and focus-visible styles to `src/styles/global.css` (AC: #5, #7)
  - [x] 3.1: Add `.skip-to-content` rule: visually hidden by default, visible on `:focus-visible`
  - [x] 3.2: Add global `:focus-visible` outline rule: 2px solid `--paper` (paper-cream), 2px offset
- [x] Task 4: Update `src/pages/index.astro` to use the updated `BaseLayout` signature (AC: #1, #8)
  - [x] 4.1: Pass `title="LinCie"` and no `sectionLabel` (home BL is blank)
  - [x] 4.2: Add minimal placeholder content inside `<main>` so the page is not empty
- [x] Task 5: Validate (AC: #9)
  - [x] 5.1: Run `bun run format`
  - [x] 5.2: Run `bun run lint`
  - [x] 5.3: Run `bun run check`

## Dev Notes

### Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/frame/Frame.astro` | CREATE | Corner label scaffold — new component |
| `src/layouts/BaseLayout.astro` | UPDATE | Add Frame, ClientRouter, skip link, `<main>` |
| `src/styles/global.css` | UPDATE | Skip-to-content + focus-visible styles |
| `src/pages/index.astro` | UPDATE | Pass correct props to updated BaseLayout |

No other files are modified in this story.

### Current State of Files Being Modified

**`src/layouts/BaseLayout.astro`** — current state (from Story 1.2):
```astro
---
import "../styles/global.css";
import { Font } from "astro:assets";

interface Props {
  title?: string;
}

const { title = "Astro" } = Astro.props;
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
  </head>
  <body>
    <slot />
  </body>
</html>
```

**What must be preserved:** All `<head>` content (charset, icons, viewport, generator, title, Font components). The `global.css` import. The `<html lang="en">` attribute.

**What changes:** Add `ClientRouter` import + component in `<head>`. Add `sectionLabel` prop. Import and render `Frame`. Add skip-to-content link. Wrap `<slot />` in `<main id="main-content">`.

**`src/pages/index.astro`** — current state:
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="Astro">
  <h1>Astro</h1>
</BaseLayout>
```

**What changes:** Update `title` prop to `"LinCie"`. No `sectionLabel` needed (home BL is blank). Keep placeholder content for now — Story 1.5 replaces it.

**`src/styles/global.css`** — current state: full token layer from Stories 1.1 + 1.2. Add skip-to-content and focus-visible rules at the end. Do NOT touch any existing content.

### Frame Component — Implementation Pattern

```astro
---
// src/components/frame/Frame.astro

interface Props {
  sectionLabel?: string;
}

const { sectionLabel = '' } = Astro.props;
---

<!-- TL: INDEX link — the only interactive corner, inside <nav> -->
<nav class="fixed top-7 left-7 z-50" aria-label="Site navigation">
  <a
    href="/"
    class="font-mono text-meta text-[0.75rem] leading-none tracking-widest uppercase
           no-underline hover:text-ink transition-colors duration-(--dur-quick)
           p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
  >
    INDEX
  </a>
</nav>

<!-- TR: Local time placeholder — hidden on mobile, aria-hidden (decorative) -->
<span
  aria-hidden="true"
  class="fixed top-7 right-7 z-50 font-mono text-meta text-[0.75rem] leading-none
         tracking-widest hidden md:block"
>
  00:00 LOCAL
</span>

<!-- BL: Section label — hidden on mobile, aria-hidden (decorative) -->
<span
  aria-hidden="true"
  class="fixed bottom-7 left-7 z-50 font-mono text-meta text-[0.75rem] leading-none
         tracking-widest hidden md:block"
>
  {sectionLabel}
</span>

<!-- BR: Folio — always visible, aria-hidden (decorative) -->
<span
  aria-hidden="true"
  class="fixed bottom-7 right-7 z-50 font-mono text-meta text-[0.75rem] leading-none
         tracking-widest"
>
  001 / 001
</span>
```

**Key decisions:**
- `z-50` on all corners keeps them above page content during scroll
- `top-7` / `bottom-7` / `left-7` / `right-7` = 28px = 1× baseline grid unit (Tailwind's 4px scale: 7 × 4px = 28px)
- `text-[0.75rem]` — arbitrary value because Tailwind's default `text-xs` is `0.75rem` but the explicit value makes the intent clear; either works
- `tracking-widest` — Commit Mono is already monospace; widest tracking gives the corner labels their institutional quality
- `leading-none` — prevents line-height from adding vertical space to fixed-position labels
- `hidden md:block` — TR and BL are hidden below 768px (Tailwind's `md:` breakpoint = 768px)
- BR folio is always visible (no `hidden md:block`) — UX spec requires TL and BR on mobile
- `transition:persist` is applied in BaseLayout, not in Frame itself

### BaseLayout — Updated Implementation

```astro
---
// src/layouts/BaseLayout.astro
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
    <!-- Skip to content: visually hidden until focused -->
    <a href="#main-content" class="skip-to-content">Skip to content</a>

    <!-- Frame: persists across View Transitions -->
    <Frame sectionLabel={sectionLabel} transition:persist />

    <!-- Main content: cross-fades on navigation -->
    <main id="main-content" tabindex="-1" transition:animate="fade">
      <slot />
    </main>
  </body>
</html>
```

**Critical notes:**
- `title` prop is now required (no default) — all pages must pass a title
- `bg-paper text-ink` on `<body>` applies the token-based background and text color globally
- `transition:persist` on `<Frame />` keeps corner labels stable across navigations (no flicker)
- `transition:animate="fade"` on `<main>` uses Astro's built-in fade — custom 8px settle/drift keyframes are added in Story 3.4 (View Transitions story)
- `<ClientRouter />` must be in `<head>` — Astro injects the necessary scripts there
- `id="main-content"` on `<main>` is the skip-to-content target
- `tabindex="-1"` on `<main>` is required for Safari — without it, the skip link focuses the element but Safari does not scroll to it; `tabindex="-1"` makes the element programmatically focusable without adding it to the tab order

### Skip-to-Content — CSS Pattern

Add to `src/styles/global.css` (after the reduced-motion block):

```css
/* ============================================================
   SKIP TO CONTENT
   Visually hidden until focused. Jumps keyboard users past the
   Frame to the main content area. Required for WCAG 2.2 AA.
   ============================================================ */
.skip-to-content {
  position: absolute;
  top: -100%;
  left: var(--baseline);
  z-index: 100;
  padding: calc(var(--baseline) / 2) var(--baseline);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-decoration: none;
  transition: top var(--dur-quick) var(--ease-settle);
}

.skip-to-content:focus-visible {
  top: var(--baseline);
}
```

**Why custom CSS (not Tailwind):** The `top: -100%` → `top: var(--baseline)` transition on `:focus-visible` requires a pseudo-class selector that Tailwind's `focus-visible:` prefix cannot express on the same property being transitioned. This is a legitimate custom CSS exception per AGENTS.md.

### Focus-Visible — Global Rule

Add to `src/styles/global.css` (after skip-to-content):

```css
/* ============================================================
   FOCUS-VISIBLE OUTLINE
   2px paper-cream offset outline on all interactive elements.
   Matches hover affordance for keyboard parity (UX-DR14).
   Uses :focus-visible (not :focus) to avoid outline on mouse click.
   ============================================================ */
:focus-visible {
  outline: 2px solid var(--paper);
  outline-offset: 2px;
}
```

**Note:** The `<a>` in Frame also has `focus-visible:outline-2` Tailwind classes for the INDEX link specifically. The global rule is belt-and-suspenders for any interactive element added later. They do not conflict — the Tailwind class and the global rule produce the same result.

### `transition:persist` — How It Works

`transition:persist` is an Astro View Transitions directive. When applied to an element, Astro keeps that DOM node alive across page navigations instead of destroying and recreating it. This prevents the Frame corner labels from flickering or re-animating on every navigation.

**Usage:** `<Frame sectionLabel={sectionLabel} transition:persist />`

**Caveat:** `sectionLabel` is a prop — it will NOT update automatically when the page changes, because the Frame element is persisted (not re-rendered). The section label update on navigation is handled in Story 3.4 (View Transitions) via `astro:after-swap` event. At this stage, the section label is static per page load, which is correct behavior for a no-JS first render.

**Important:** `transition:persist` requires `<ClientRouter />` to be present in `<head>`. Without it, the directive is silently ignored.

### Section Label Values Per Route

| Route | `sectionLabel` prop value |
|-------|--------------------------|
| `src/pages/index.astro` | `''` (empty string, or omit prop) |
| `src/pages/projects/[...slug].astro` | `'WORK'` |
| `src/pages/writing/[...slug].astro` | `'WRITING'` |
| `src/pages/404.astro` | `'404 — NOT FOUND'` |

Only `index.astro` exists at this story. The other pages are created in Stories 1.5, 1.6, 2.1, 2.2. Pass the correct value when those pages are created.

### Astro Component Structure — Required Order

Per architecture conventions, every `.astro` file follows this order:
1. Imports
2. Props interface
3. Props destructuring
4. Data fetching / computation (none in this story)
5. Template (HTML)
6. Scoped styles (only if Tailwind cannot express it — none needed here)
7. Client-side script (none in this story)

### Tailwind Spacing — Baseline Multiples Only

All spacing must use baseline multiples (28px = `7` in Tailwind's 4px scale):
- `top-7` = 28px = 1× baseline ✅
- `bottom-7` = 28px = 1× baseline ✅
- `left-7` = 28px = 1× baseline ✅
- `right-7` = 28px = 1× baseline ✅

Do NOT use `top-6` (24px), `top-8` (32px), or other non-baseline values for the Frame corners.

### What This Story Does NOT Include

- No live local time (Story 5.2) — TR shows static `00:00 LOCAL`
- No scroll-driven folio (Story 5.3) — BR shows static `001 / 001`
- No section label update on View Transition navigation (Story 3.4) — label is static per page load
- No custom 8px settle/drift View Transition keyframes (Story 3.4)
- No `paper-tone.ts` script (Story 5.1)
- No `reveal.ts` script (Story 3.2)
- No `cursor.ts` script (Story 3.3)
- No Colophon component (Story 1.6)
- No page templates beyond updating `index.astro` (Stories 1.5, 1.6, 2.1, 2.2)
- No `transition:name` on project titles (Story 2.1)

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
- No page templates exist yet — `index.astro` is the only page

**From git history:**
- All three stories committed cleanly with `bun run format && bun run lint && bun run check` passing
- Prettier reformats some values (trailing zeros, long lines) — this is expected and fine
- ESLint with `eslint-plugin-jsx-a11y` is active — accessibility violations will fail lint

### Anti-Patterns to Avoid

- ❌ Do NOT use `aria-hidden="true"` on the TL `INDEX` link — it is interactive and must be accessible
- ❌ Do NOT use `aria-hidden="true"` on the `<nav>` element — only on the non-interactive spans
- ❌ Do NOT use `display: none` for the skip-to-content link — use `position: absolute; top: -100%` so it is still in the accessibility tree
- ❌ Do NOT use `visibility: hidden` for the skip-to-content link — same reason
- ❌ Do NOT apply `transition:persist` inside `Frame.astro` — apply it at the usage site in `BaseLayout.astro`
- ❌ Do NOT hardcode `color: oklch(0.5 0.005 80)` — use `text-meta` Tailwind utility
- ❌ Do NOT use `font-family: 'Commit Mono'` inline — use `font-mono` Tailwind utility
- ❌ Do NOT use non-baseline spacing (e.g., `top-6`, `top-8`) for corner positions
- ❌ Do NOT add `box-shadow` anywhere
- ❌ Do NOT add accent colors (no `text-blue-500`, etc.)
- ❌ Do NOT make `title` prop optional with a default of `"Astro"` — it should be required; every page must pass a meaningful title
- ❌ Do NOT forget `id="main-content"` on `<main>` — the skip link targets this ID
- ❌ Do NOT add `<script>` tags in this story — no client-side JS in Story 1.4
- ❌ Do NOT create `src/components/frame/Folio.astro` or `src/components/frame/LocalTime.astro` yet — those are separate components for Stories 5.2 and 5.3; the static values live inline in Frame.astro for now
- ❌ Do NOT use `duration-[--dur-quick]` (square brackets) for CSS variable arbitrary values — Tailwind v4 uses parentheses: `duration-(--dur-quick)`. Square brackets are for literal values like `duration-[300ms]`; parentheses are for CSS variable references
- ❌ Do NOT use `ViewTransitions` from `astro:transitions` — it was renamed to `ClientRouter` in Astro 5 and the old name no longer exists in Astro 6. Always use `import { ClientRouter } from 'astro:transitions'`
- ❌ Do NOT omit `tabindex="-1"` from `<main>` — Safari requires it for the skip link to scroll correctly

### Accessibility Requirements (WCAG 2.2 AA)

Per NFR-4 and UX-DR3, UX-DR5, UX-DR12, UX-DR13, UX-DR14:

1. **Skip-to-content link** (UX-DR3): Hidden until focused, jumps to `<main id="main-content">`. Required for keyboard users to bypass the Frame.
2. **INDEX as escape hatch** (UX-DR5): TL `INDEX` must be visible, tappable, and obviously a link home on every page. On mobile it is the primary recovery mechanism.
3. **Decorative elements aria-hidden** (UX-DR13): TR time, BL section label, BR folio are all `aria-hidden="true"` — they are supplementary orientation, not navigation.
4. **Focus-visible states** (UX-DR14): 2px paper-cream offset outline on all interactive elements. The INDEX link must have a visible focus state.
5. **Minimum tap target** (UX-DR12): The INDEX link must have a minimum 44×44px tap target on mobile. Achieve via padding, not visual size increase.
6. **Semantic HTML**: `<nav>` wraps the INDEX link. `<main>` wraps page content. No ARIA roles needed — semantic HTML is sufficient.

**Tap target for INDEX link:** Add `p-4` (16px padding) to the `<a>` element. This gives a 44px+ tap target (text ~12px at 0.75rem + 16px padding × 2 = 44px) without changing the visual appearance of the label. Note: at the 112.5% root font size, `0.75rem` = ~13.5px, so `p-4` (16px × 2 = 32px) + ~13.5px text ≈ 45.5px — just over the 44px minimum.

### ESLint / jsx-a11y Rules to Watch

The project uses `eslint-plugin-jsx-a11y`. These rules will fail lint if violated:
- `jsx-a11y/anchor-is-valid` — `<a>` must have `href`; the INDEX link has `href="/"` ✅
- `jsx-a11y/no-redundant-roles` — `<nav>` has implicit `navigation` role; do not add `role="navigation"`
- `jsx-a11y/aria-hidden-has-no-focusable-descendants` — `aria-hidden` spans must not contain focusable elements ✅ (they are plain text)
- `jsx-a11y/interactive-supports-focus` — interactive elements must be focusable ✅ (`<a>` is natively focusable)

### Project Structure Notes

- `src/components/frame/` directory is new — create it
- `Frame.astro` follows PascalCase naming (architecture convention)
- `BaseLayout.astro` is at `src/layouts/` — already exists, update in place
- `global.css` is at `src/styles/` — already exists, append new rules at end
- `index.astro` is at `src/pages/` — already exists, update props only

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component & File Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping — FR-1, FR-2]
- [Source: _bmad-output/planning-artifacts/architecture.md#View Transitions & Animation Lifecycle]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Accessibility Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR3: Skip-to-content link]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR5: INDEX as universal escape hatch]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR12: 44×44px minimum tap targets]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR13: Decorative elements aria-hidden]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR14: Focus-visible states]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR2: Mobile layout adaptation]
- [Source: AGENTS.md#Accessibility]
- [Source: AGENTS.md#Styling rules]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

- Created `src/components/frame/Frame.astro`: four fixed-position corner labels (TL nav/link, TR time placeholder, BL section label, BR folio). TR and BL hidden below 768px via `hidden md:block`. All non-interactive corners have `aria-hidden="true"`. Commit Mono font, `text-meta` color, `text-[0.75rem]` size, baseline-grid spacing (`top-7`/`bottom-7`/`left-7`/`right-7` = 28px).
- Updated `src/layouts/BaseLayout.astro`: added `ClientRouter` import and component in `<head>`, required `title` prop (no default), optional `sectionLabel` prop, skip-to-content link as first body child, `<Frame transition:persist />`, `<main id="main-content" tabindex="-1" transition:animate="fade">` wrapping `<slot />`, `bg-paper text-ink` on `<body>`.
- Updated `src/styles/global.css`: appended `.skip-to-content` rule (visually hidden via `top: -100%`, revealed on `:focus-visible` via `top: var(--baseline)`) and global `:focus-visible` outline rule (2px solid `var(--paper)`, 2px offset). Custom CSS justified: `top` transition on `:focus-visible` cannot be expressed with Tailwind's `focus-visible:` prefix.
- Updated `src/pages/index.astro`: `title="LinCie"`, no `sectionLabel` (home BL blank), placeholder `<h1>LinCie</h1>`.
- All validation passed: `bun run format` (Prettier reformatted Frame.astro), `bun run lint` (0 ESLint errors), `bun run check` (0 Astro errors, 0 warnings, 8 files checked).

### File List

- `src/components/frame/Frame.astro` (CREATE)
- `src/layouts/BaseLayout.astro` (UPDATE)
- `src/styles/global.css` (UPDATE)
- `src/pages/index.astro` (UPDATE)

### Change Log

- 2026-05-22: Story 1.4 implemented — created Frame.astro with four corner labels, updated BaseLayout with ClientRouter/Frame/skip-link/main, added skip-to-content and focus-visible CSS, updated index.astro title and props. All ACs satisfied. Validation passed (format/lint/check).

### Review Findings

- [x] [Review][Patch] Focus outline invisible on paper background — `:focus-visible { outline: 2px solid var(--paper) }` uses the paper-cream color (~97% lightness) as the outline color. Since the body background is also `bg-paper`, the outline is invisible against the page background (WCAG 2.4.7 failure). The outline-offset means the ring renders against the body background, not the element. Fix: use `var(--ink)` or `var(--meta)` for the global outline, or use a contrasting color that works against both light and dark content. [src/styles/global.css]
- [x] [Review][Patch] TR, BL, BR spans missing `uppercase` class — The TL `<a>` has `uppercase` but TR (`00:00 LOCAL`), BL (`{sectionLabel}`), and BR (`001 / 001`) do not. While current content is already uppercase by convention, the class should be consistent across all four corners so future content (e.g. a lowercase sectionLabel) renders correctly. [src/components/frame/Frame.astro]
- [x] [Review][Patch] TR span has no stable selector target for Story 5.2 clock hydration — The TR time placeholder has no `id` or `data-` attribute. Story 5.2 will need to target this element to replace the static `00:00 LOCAL` with a live clock. Without a stable hook, the future script will rely on fragile class or content selectors. Fix: add `id="frame-local-time"` or `data-frame="local-time"` to the TR span. [src/components/frame/Frame.astro]
- [x] [Review][Defer] `001 / 001` folio is hardcoded [src/components/frame/Frame.astro] — deferred, by spec design (Story 5.3 handles scroll-driven folio)
- [x] [Review][Defer] `aria-current` on INDEX link never updates on View Transition navigation [src/components/frame/Frame.astro] — deferred, by spec design (Story 3.4 handles post-swap updates via `astro:after-swap`)
- [x] [Review][Defer] BL/BR collision risk on long sectionLabel at md breakpoint — no `max-w` or `truncate` on BL span [src/components/frame/Frame.astro] — deferred, current sectionLabel values are short; Story 3.4/2.x scope
- [x] [Review][Defer] No `env(safe-area-inset-*)` on corner positions — notched iOS devices may clip corners [src/components/frame/Frame.astro] — deferred, not in story scope
- [x] [Review][Defer] XSS risk if sectionLabel is ever rendered via `set:html` instead of `{sectionLabel}` — deferred, not a current issue; Astro auto-escapes template expressions
