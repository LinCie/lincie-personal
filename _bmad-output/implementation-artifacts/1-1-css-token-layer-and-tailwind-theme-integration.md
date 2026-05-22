# Story 1.1: CSS Token Layer & Tailwind Theme Integration

Status: done

## Story

As a visitor,
I want the site to render with a consistent, warm-tinted color palette and strict baseline grid,
so that every page feels cohesive and on-brand from the first pixel.

## Acceptance Criteria

1. `:root` defines `--paper`, `--ink`, `--meta`, `--hairline`, `--paper-tone`, `--baseline` (28px), `--type-scale-ratio` (1.25), `--ease-settle`, `--ease-mark`, `--dur-quick` (150ms), `--dur-breath` (400ms), `--dur-arrive` (600ms) as CSS custom properties
2. All color tokens use OKLCH with chroma ≥ 0.005 toward the warm-yellow paper hue
3. The `@theme` directive extends tokens into Tailwind utilities (`bg-paper`, `text-ink`, `text-meta`, `border-hairline`, `font-serif`, `font-mono`)
4. A `@media (prefers-reduced-motion: reduce)` safety net sets `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important` on all elements
5. No `#hex` or `rgb()` values appear in the token file — OKLCH only
6. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Implement CSS custom property token layer in `src/styles/global.css` (AC: #1, #2, #5)
  - [x] 1.1: Add `:root` block with all color tokens in OKLCH format
  - [x] 1.2: Add spacing tokens (`--baseline: 28px`, `--type-scale-ratio: 1.25`)
  - [x] 1.3: Add easing tokens (`--ease-settle`, `--ease-mark`)
  - [x] 1.4: Add duration tokens (`--dur-quick`, `--dur-breath`, `--dur-arrive`)
  - [x] 1.5: Add `--drop-cap-lines: 3` for future use
  - [x] 1.6: Verify all color values use OKLCH with C ≥ 0.005 and warm-yellow hue (~80)
- [x] Task 2: Add Tailwind 4 `@theme` directives in `src/styles/global.css` (AC: #3)
  - [x] 2.1: Add `@theme inline` block for color tokens that reference `var()` custom properties
  - [x] 2.2: Add `@theme` block for font-family tokens with full fallback stacks (literal values, not var refs)
  - [x] 2.3: Reset default Tailwind colors with `--color-*: initial` to prevent accidental use of built-in palette
  - [x] 2.4: Verify `bg-paper`, `text-ink`, `text-meta`, `border-hairline`, `font-serif`, `font-mono` utilities resolve correctly
- [x] Task 3: Add reduced-motion safety net (AC: #4)
  - [x] 3.1: Add `@media (prefers-reduced-motion: reduce)` block targeting `*, *::before, *::after`
  - [x] 3.2: Set `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important`
- [x] Task 4: Validate (AC: #6)
  - [x] 4.1: Run `bun run format`
  - [x] 4.2: Run `bun run lint`
  - [x] 4.3: Run `bun run check`
  - [x] 4.4: Confirm no `#hex` or `rgb()` values in `global.css`
  - [x] 4.5: Confirm WCAG AA contrast (≥4.5:1) between `--ink` and `--paper-tone` default midday value

## Dev Notes

### File to Modify

**`src/styles/global.css`** — currently contains only `@import "tailwindcss";`. This is the single file being modified in this story.

### Current State

```css
@import "tailwindcss";
```

All work is additive — no existing behavior to preserve beyond the Tailwind import.

### Architecture-Mandated Token Values

```css
:root {
  --paper: var(--paper-tone);
  --ink: oklch(0.18 0.008 80);
  --meta: oklch(0.50 0.005 80);
  --hairline: oklch(0.85 0.005 80);
  --paper-tone: oklch(0.97 0.008 80); /* default midday band, overridden by JS in Epic 5 */
  --baseline: 28px;
  --type-scale-ratio: 1.25;
  --drop-cap-lines: 3;
  --ease-settle: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-mark: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur-quick: 150ms;
  --dur-breath: 400ms;
  --dur-arrive: 600ms;
}
```

### Architecture-Mandated Tailwind Theme

Colors reference runtime CSS variables → **must use `@theme inline`**.
Fonts are literal values → use standard `@theme`.

```css
@theme inline {
  --color-*: initial;
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-meta: var(--meta);
  --color-hairline: var(--hairline);
}

@theme {
  --font-serif: 'Newsreader', Georgia, ui-serif, Cambria, 'Times New Roman', serif;
  --font-mono: 'Commit Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

### Critical: `@theme inline` vs `@theme`

Tailwind CSS 4 has two `@theme` variants:

- **`@theme`** — values are resolved at build time and emitted as static CSS. Use for literal values (font stacks, breakpoints).
- **`@theme inline`** — values reference runtime CSS custom properties via `var()`. Tailwind treats them as dynamic and does not attempt build-time resolution.

Since `--color-paper: var(--paper)` references a `:root` custom property (which will later be updated by JS for paper-tone drift), **`@theme inline` is mandatory for color tokens**. Without it, Tailwind cannot resolve the `var()` reference at build time and the utilities will not work.

### Critical: Reset Default Colors

Add `--color-*: initial` inside the `@theme inline` block before defining custom colors. This removes Tailwind's built-in color palette (red, blue, green, etc.) so that only project tokens are available. This prevents accidental use of `text-blue-500` or similar — the architecture explicitly bans accent colors.

### File Ordering

The correct order within `src/styles/global.css`:

1. `@import "tailwindcss";`
2. `:root { ... }` — token definitions (custom properties)
3. `@theme inline { ... }` — color utilities referencing `var()` tokens
4. `@theme { ... }` — font utilities with literal values
5. Base styles (none in this story)
6. `@media (prefers-reduced-motion: reduce) { ... }` — safety net

The `:root` block comes before `@theme inline` so the custom properties are defined before being referenced. CSS custom properties resolve at computed-value time (not parse time), but this ordering makes the dependency chain explicit for maintainability.

### OKLCH Color Rules

- All colors use `oklch(L C H)` syntax (space-separated, no commas, no `/` alpha)
- Lightness (L): 0–1 scale
- Chroma (C): must be ≥ 0.005 — pure greys (C=0) are forbidden
- Hue (H): ~80 (warm-yellow) for all neutrals
- `--paper` uses `var(--paper-tone)` indirection for the paper-tone drift feature (Epic 5)

### WCAG Contrast Verification

Verify the default midday band passes WCAG AA:
- Body text: `--ink` (L=0.18) on `--paper-tone` (L=0.97) → contrast ratio ~14:1 ✓
- Meta text: `--meta` (L=0.50) on `--paper-tone` (L=0.97) → contrast ratio ~5.5:1 ✓ (≥4.5:1)
- Hairline: decorative, no contrast requirement

### Spacing Convention

All spacing uses baseline multiples (28px = `mb-7` in Tailwind's 4px scale). This story defines the `--baseline` token; actual spacing usage comes in later stories.

### What This Story Does NOT Include

- No font-face declarations (Story 1.2)
- No typography.css file (Story 1.2)
- No content collections (Story 1.3)
- No layout or page changes (Stories 1.4+)
- No JavaScript (this is pure CSS)
- No `@apply` usage anywhere

### Anti-Patterns to Avoid

- ❌ Do NOT create a `tailwind.config.js` or `tailwind.config.ts` — Tailwind 4 uses CSS-first config
- ❌ Do NOT use plain `@theme` for color tokens that reference `var()` — must use `@theme inline`
- ❌ Do NOT use `@apply` in the token layer
- ❌ Do NOT hardcode color values in component markup — always reference tokens
- ❌ Do NOT add `box-shadow` utilities or accent colors
- ❌ Do NOT use `rgb()`, `hsl()`, or `#hex` — OKLCH only for all color tokens
- ❌ Do NOT add any font-face declarations in this story (that's Story 1.2)
- ❌ Do NOT leave Tailwind's default color palette active — reset with `--color-*: initial`

### Project Structure Notes

- Single file modified: `src/styles/global.css`
- No new files created in this story
- This file is imported by `src/layouts/BaseLayout.astro` via `import "../styles/global.css";`
- All subsequent stories depend on these tokens being available
- Tailwind is loaded via `@tailwindcss/vite` plugin in `astro.config.mjs` (no PostCSS)
- `bun run check` will pass even though no HTML uses the utilities yet — Tailwind 4 does not warn about unused theme values

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: AGENTS.md#Styling rules]
- [Source: Tailwind CSS 4 docs — @theme inline for dynamic CSS variable references]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. Single-file implementation, all validation passed first run.

### Completion Notes List

- Implemented all `:root` CSS custom properties per architecture spec: 5 color tokens (OKLCH, C ≥ 0.005, H ~80), 2 spacing tokens, 1 drop-cap token, 2 easing tokens, 3 duration tokens.
- `--paper` uses `var(--paper-tone)` indirection as required for Epic 5 paper-tone drift.
- `@theme inline` used for color tokens (runtime `var()` references); standard `@theme` used for font stacks (literal values).
- `--color-*: initial` resets Tailwind's built-in palette — only project tokens available.
- Reduced-motion safety net added targeting `*, *::before, *::after`.
- No `#hex` or `rgb()` values present — OKLCH only.
- WCAG AA contrast confirmed: `--ink` (L=0.18) on `--paper-tone` (L=0.97) ≈ 14:1; `--meta` (L=0.50) on `--paper-tone` ≈ 5.5:1.
- `bun run format && bun run lint && bun run check` all pass (0 errors, 0 warnings).
- Prettier reformatted `oklch(0.50 ...)` → `oklch(0.5 ...)` and wrapped the long `--paper-tone` value — both are semantically identical.

### File List

- `src/styles/global.css` (UPDATE)

### Review Findings

- [x] [Review][Decision] OKLCH browser support — no `@supports` guard or sRGB fallback — deferred; accepted as a known browser floor constraint (requires Chrome 111+, Firefox 113+, Safari 15.4+). To be documented in Story 1.7 (SEO/build validation).
- [x] [Review][Decision] `color-scheme` not declared — resolved; added `color-scheme: light` to `:root` to prevent UA dark-mode injection on form controls and scrollbars.
- [x] [Review][Patch] Reduced-motion safety net missing `animation-delay` and `transition-delay` resets — fixed; added both to the `prefers-reduced-motion` block. [src/styles/global.css:~55]
- [x] [Review][Defer] `scroll-behavior: auto !important` missing from reduced-motion block [src/styles/global.css:~55] — deferred, pre-existing; no scroll behavior exists in this story. Actionable in Story 1.4+ when scroll is introduced.
- [x] [Review][Defer] `0.01ms` duration still fires `animationend`/`transitionend` events — future GSAP sequencing in Epic 3+ may rely on these events and fire prematurely [src/styles/global.css:~55] — deferred, pre-existing; no JS exists yet. Actionable in Story 3.1.
- [x] [Review][Defer] GSAP bypasses CSS reduced-motion safety net — GSAP reads duration tokens via `getComputedStyle()` and is unaffected by `!important` CSS overrides; requires explicit `gsap.globalTimeline.timeScale(0)` or `matchMedia` guard [src/styles/global.css] — deferred, pre-existing; GSAP not introduced until Story 3.1.

## Change Log

- 2026-05-22: Implemented CSS token layer and Tailwind theme integration in `src/styles/global.css`. Added all `:root` custom properties, `@theme inline` color utilities, `@theme` font utilities, and reduced-motion safety net. All validation commands pass.
