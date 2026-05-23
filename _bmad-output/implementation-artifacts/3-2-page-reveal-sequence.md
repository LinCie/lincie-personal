# Story 3.2: Page Reveal Sequence

Status: review

## Story

As a visitor arriving at the site,
I want a subtle one-shot reveal that settles the Frame and title into place,
so that I feel the site is considered and alive without being delayed from reading.

## Acceptance Criteria

1. `src/scripts/reveal.ts` exists and follows the gate+cleanup lifecycle pattern from Story 3.1
2. On first page load in a session, a GSAP timeline runs: corner labels opacity 0→1 (~300ms) → baseline grid overlay at ~3% opacity for ~800ms then fades to 0 → page title font-weight 300→400 (~400ms)
3. The total timeline duration is ≤1.5s
4. Body element `opacity` remains `1` at every frame — content is never gated behind the reveal
5. The timeline fires only once per session per page (tracked via `sessionStorage`)
6. Subsequent View Transition navigations within the session skip the reveal
7. Under `prefers-reduced-motion: reduce`, the reveal is skipped and final state is painted instantly
8. All GSAP instances are pushed to a cleanup array and killed on `astro:before-swap`
9. The script re-initializes on `astro:after-swap` (checks sessionStorage for new pages)
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/motion/RevealSequence.astro` (AC: #2, #4)
  - [x] 1.1: Create `src/components/motion/` directory
  - [x] 1.2: Create `RevealSequence.astro` with the baseline grid overlay `<div>` (decorative, `aria-hidden="true"`, fixed position, pointer-events-none, starts at opacity 0)
  - [x] 1.3: Ensure the component renders no visible content at rest — it is a GSAP target only

- [x] Task 2: Integrate `RevealSequence.astro` into `BaseLayout.astro` and add CSS initial state (AC: #2, #4, #5, #6)
  - [x] 2.1: Import and render `RevealSequence` in BaseLayout (after Frame, before `<main>`)
  - [x] 2.2: Ensure body opacity remains 1 — do NOT add any opacity manipulation to `<body>` or `<main>`
  - [x] 2.3: Add `[data-reveal="corner"] { opacity: 0; }` rule to `src/styles/global.css` to prevent FOUC

- [x] Task 3: Create `src/scripts/reveal.ts` (AC: #1, #2, #3, #5, #6, #7, #8, #9)
  - [x] 3.1: Import `gsap`, `REDUCED_MOTION` from `./gsap-init` (never import from `'gsap'` directly)
  - [x] 3.2: Implement `sessionStorage` logic — single session-wide key `reveal-played` — check via `hasPlayed()` helper with try/catch before running timeline
  - [x] 3.3: Implement the GSAP timeline sequence (corner labels → grid overlay → title weight)
  - [x] 3.4: Implement `REDUCED_MOTION` gate — if true, paint final state instantly (corner labels opacity 1, title weight 400), mark sessionStorage, return
  - [x] 3.5: Push all GSAP instances to `instances` array
  - [x] 3.6: Implement `cleanup()` function that kills all instances
  - [x] 3.7: Add `astro:before-swap` listener calling `cleanup()`
  - [x] 3.8: Add `astro:after-swap` listener calling `init()`
  - [x] 3.9: Call `init()` on initial load

- [x] Task 4: Load `reveal.ts` in BaseLayout (AC: #1, #9)
  - [x] 4.1: Add `<script>` tag in BaseLayout that imports and executes the reveal logic (inline script importing from `../scripts/reveal.ts`, OR load RevealSequence.astro's `<script>` block)

- [x] Task 5: Run validation gate (AC: #10)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### Architecture Compliance

- **Single GSAP entry point**: Import ONLY from `./gsap-init` — never from `'gsap'` directly.
- **Gate+cleanup lifecycle**: Follow the exact pattern from Story 3.1's Dev Notes (imports → gates → instance registry → cleanup → init → lifecycle hooks → initial run).
- **Animation properties**: Use `opacity` and `fontWeight` only. No layout properties. (`fontWeight` on a variable font like Newsreader is interpolated by the font renderer without triggering layout recalculation — it behaves like opacity, not like width/height. This is acceptable under NFR-9.)
- **Duration tokens**: Use `0.3` (~300ms = `--dur-quick` × 2), `0.8` (800ms), `0.4` (`--dur-breath`). Total ≤ 1.5s.
- **No `ScrollTrigger` needed**: This script does not use scroll-linked behavior. Import only `gsap` and `REDUCED_MOTION` from `./gsap-init`.

### DOM Targets — What the Script Animates

The reveal targets these existing DOM elements (do NOT create new wrappers around them):

| Target | Selector | Animation | Notes |
|--------|----------|-----------|-------|
| Corner labels (all 4) | `nav[aria-label="Site navigation"], [data-frame="local-time"], [aria-hidden="true"].fixed.bottom-7.left-7, [aria-hidden="true"].fixed.right-7.bottom-7` | opacity 0→1 over ~300ms | Use `data-reveal="corner"` attribute added to Frame.astro for clean targeting |
| Baseline grid overlay | `[data-reveal="grid"]` | opacity 0→0.03 over ~200ms, hold ~600ms, then fade to 0 over ~200ms | Created by RevealSequence.astro |
| Page title | `h1` or `.sr-only + *` (first visible heading) | fontWeight 300→400 over ~400ms | Home page has `sr-only` h1 — target the first visible `<p>` or `<h1>` that is NOT `.sr-only` |

**CRITICAL — Title targeting strategy:**
- On project/essay pages: `h1` exists and is visible (has `font-light` = weight 300 already). Target `h1`.
- On home page: the `<h1>` is `.sr-only`. The first visible text is the `<p>` paragraph. Target `main h1:not(.sr-only)` — if none found, skip the title weight animation (home page has no visible title to animate).
- On 404 page: same as home — check for visible `h1`.

**Recommended approach**: Use `document.querySelector('main h1:not(.sr-only)')` as the title target. If null, skip the title step in the timeline (use a conditional `.to()` or simply don't add it).

### RevealSequence.astro — Implementation

```astro
---
// src/components/motion/RevealSequence.astro
// Renders the baseline grid overlay div targeted by reveal.ts.
// This component has no visible output at rest — it exists as a GSAP target.
---

<!-- Baseline grid overlay: decorative, invisible at rest, pointer-events-none -->
<div
  data-reveal="grid"
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-40 opacity-0"
  style="background-image: repeating-linear-gradient(to bottom, var(--hairline) 0px, var(--hairline) 1px, transparent 1px, transparent var(--baseline)); background-size: 100% var(--baseline);"
>
</div>
```

**Why inline `style` for the grid**: The repeating-linear-gradient with CSS custom property references cannot be expressed as a Tailwind utility. This is one of the justified custom CSS cases per AGENTS.md.

### Frame.astro Modification — Add `data-reveal="corner"` Attributes

Add `data-reveal="corner"` to all four corner elements in `Frame.astro` for clean DOM targeting. The corners start at opacity 0 via CSS (see global.css modification below) and are revealed by the GSAP timeline or painted to final state immediately if the reveal has already played.

```diff
- <nav class="fixed top-7 left-7 z-50" aria-label="Site navigation">
+ <nav class="fixed top-7 left-7 z-50" aria-label="Site navigation" data-reveal="corner">

- <span aria-hidden="true" data-frame="local-time" class="...">
+ <span aria-hidden="true" data-frame="local-time" data-reveal="corner" class="...">

- <span aria-hidden="true" class="text-meta fixed bottom-7 left-7 z-50 ...">
+ <span aria-hidden="true" data-reveal="corner" class="text-meta fixed bottom-7 left-7 z-50 ...">

- <span aria-hidden="true" class="text-meta fixed right-7 bottom-7 z-50 ...">
+ <span aria-hidden="true" data-reveal="corner" class="text-meta fixed right-7 bottom-7 z-50 ...">
```

### global.css Modification — Initial Hidden State for Reveal Targets

Add a single CSS rule to `global.css` (after the `:focus-visible` block) that hides corner labels by default. The reveal script paints them visible either via the GSAP timeline (first visit) or immediately via `paintFinalState()` (subsequent navigations). This prevents FOUC — corners never flash visible before the script runs.

```css
/* ============================================================
   REVEAL SEQUENCE — Initial Hidden State
   Corner labels start invisible. The reveal script (reveal.ts)
   animates them in on first session load, or paints them visible
   immediately on subsequent navigations. This prevents a flash
   of visible corners before the script executes.
   ============================================================ */
[data-reveal="corner"] {
  opacity: 0;
}
```

**Why CSS (not Tailwind `opacity-0` class):** Using a data-attribute selector keeps the reveal concern decoupled from the component's utility classes. The reveal script sets `el.style.opacity = "1"` which overrides this CSS rule. If the script fails to load (broken build, etc.), corners remain invisible — this is acceptable because the site is still fully functional (INDEX link is keyboard-accessible via skip-to-content, and content is never gated).

**CRITICAL — `prefers-reduced-motion` interaction:** The CSS reduced-motion safety net in global.css sets `transition-duration: 0.01ms !important` but does NOT affect `opacity` set via CSS properties. The reveal script's `REDUCED_MOTION` gate handles this correctly by calling `paintFinalState()` which sets opacity to 1 immediately.

### reveal.ts — Full Implementation Pattern

```typescript
// src/scripts/reveal.ts
// Page reveal sequence — one-shot GSAP timeline, fires once per session.
//
// Lifecycle: gate → register → clean → re-init → session memory
// Loaded in BaseLayout (every page).

import { gsap, REDUCED_MOTION } from "./gsap-init";

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY = "reveal-played";

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: gsap.core.Animation[] = [];

// ─── SessionStorage Helpers (try/catch for private browsing) ──────────────────
function hasPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false; // If sessionStorage throws, treat as not played
  }
}

function markPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Graceful degradation: reveal may play again on next navigation
  }
}

// ─── Paint Final State ────────────────────────────────────────────────────────
// Used when reveal has already played OR reduced-motion is active.
// Ensures corners are visible and title is at final weight.
function paintFinalState(): void {
  const corners = document.querySelectorAll<HTMLElement>("[data-reveal='corner']");
  corners.forEach((el) => { el.style.opacity = "1"; });
  const title = document.querySelector<HTMLElement>("main h1:not(.sr-only)");
  if (title) title.style.fontWeight = "400";
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Already played this session → paint final state, bail
  if (hasPlayed()) {
    paintFinalState();
    return;
  }

  const corners = document.querySelectorAll<HTMLElement>("[data-reveal='corner']");
  const grid = document.querySelector<HTMLElement>("[data-reveal='grid']");
  const title = document.querySelector<HTMLElement>("main h1:not(.sr-only)");

  // If no corners found, nothing to reveal — bail
  if (corners.length === 0) return;

  // Gate: reduced motion → paint final state, mark played, return
  if (REDUCED_MOTION) {
    paintFinalState();
    markPlayed();
    return;
  }

  // Corners start at opacity 0 via CSS ([data-reveal="corner"] { opacity: 0 })
  // No gsap.set needed — CSS handles the initial hidden state.

  // Build timeline
  const tl = gsap.timeline({
    onComplete: () => {
      markPlayed();
    },
  });

  // Step 1: Corner labels fade in (~300ms)
  tl.to(corners, { opacity: 1, duration: 0.3, ease: "power1.out" });

  // Step 2: Baseline grid flash (~200ms in, hold ~400ms, ~200ms out = ~800ms total)
  if (grid) {
    tl.to(grid, { opacity: 0.03, duration: 0.2, ease: "power1.in" });
    tl.to(grid, { opacity: 0, duration: 0.2, ease: "power1.out" }, "+=0.4");
  }

  // Step 3: Title font-weight 300→400 (~400ms)
  if (title) {
    tl.to(title, { fontWeight: 400, duration: 0.4, ease: "power1.out" });
  }

  instances.push(tl);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
```

### BaseLayout.astro Modification — Load Reveal Script

Add the RevealSequence component and a script import:

```diff
+ import RevealSequence from "../components/motion/RevealSequence.astro";

  <body class="bg-paper text-ink">
    <a href="#main-content" class="skip-to-content">Skip to content</a>
    <Frame sectionLabel={sectionLabel} transition:persist />
+   <RevealSequence />
    <main id="main-content" tabindex="-1" transition:animate="fade">
      <slot />
    </main>
  </body>
+ <script>
+   import "../scripts/reveal.ts";
+ </script>
```

**Why the script is in BaseLayout (not in RevealSequence.astro):** The reveal targets elements from BOTH `Frame.astro` (corner labels) and `RevealSequence.astro` (grid overlay) and the page content (title). Placing the script in BaseLayout ensures it runs after all DOM targets are rendered. Astro deduplicates `<script>` imports — even if BaseLayout renders on every page, the script ships once.

### `transition:persist` Interaction — Critical

Frame elements have `transition:persist` in BaseLayout. This means:
- Corner label DOM nodes are the **same elements** across all View Transition navigations — they are NOT destroyed and recreated.
- The reveal script must NEVER re-animate corners that are already visible. The session-wide sessionStorage key ensures this.
- On `astro:after-swap`, `init()` is called. Since `hasPlayed()` returns true (set during the first reveal), `paintFinalState()` runs — this is a no-op on already-visible corners (setting opacity 1 on an element already at opacity 1 is harmless).
- The `cleanup()` function kills any in-progress timeline on `astro:before-swap`. If the user navigates mid-reveal, the timeline is killed. On the next page, `hasPlayed()` returns false (timeline didn't complete → `markPlayed()` never fired) → the reveal replays from the beginning. This is acceptable edge-case behavior.

### SessionStorage Strategy

- **Key**: `reveal-played` (single key, session-wide — NOT per-page)
- **Value**: `"1"` (truthy string)
- **Lifetime**: SessionStorage clears on tab close. Returning visitors get the reveal again — this is intentional per architecture ("appropriate for a portfolio where the reveal is part of the brand experience").
- **View Transitions**: After the first page reveal, navigating to another page via View Transitions calls `init()` via `astro:after-swap`. The sessionStorage key is already set → `init()` paints final state and returns immediately. The reveal fires ONCE per session on the very first page load, then never again. This matches AC #6: "subsequent View Transition navigations within the session skip the reveal."
- **Why session-wide (not per-page)**: Frame elements use `transition:persist` — they are the SAME DOM nodes across navigations. Re-animating them on each new page would cause a visible flash (corners go invisible then fade back in). The reveal is a session-level "hello" moment, not a per-page effect.

### Timeline Timing Breakdown

| Step | Start | Duration | End | Cumulative |
|------|-------|----------|-----|------------|
| Corner labels opacity 0→1 | 0.0s | 0.3s | 0.3s | 0.3s |
| Grid overlay opacity 0→0.03 | 0.3s | 0.2s | 0.5s | 0.5s |
| Grid overlay hold | 0.5s | 0.4s | 0.9s | 0.9s |
| Grid overlay opacity 0.03→0 | 0.9s | 0.2s | 1.1s | 1.1s |
| Title fontWeight 300→400 | 1.1s | 0.4s | 1.5s | 1.5s |

**Total: 1.5s** — exactly at the ≤1.5s budget.

### What This Story Does NOT Include

- **Cursor afterglow** — Story 3.3
- **View Transitions configuration** — Story 3.4 (the `<ClientRouter />` already exists in BaseLayout from Epic 1)
- **Inkstroke underline animation** — Story 3.5
- **Paper-tone drift** — Epic 5
- **Local time updates** — Epic 5
- **Folio scroll tracking** — Epic 5
- **Any changes to page content or styling** — this story only adds animation behavior

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/components/motion/RevealSequence.astro` | Baseline grid overlay div (GSAP target) |
| `src/scripts/reveal.ts` | Page reveal timeline logic with gate+cleanup lifecycle |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/components/frame/Frame.astro` | Add `data-reveal="corner"` to all 4 corner elements |
| `src/layouts/BaseLayout.astro` | Import + render `RevealSequence`, add `<script>` importing `reveal.ts` |
| `src/styles/global.css` | Add `[data-reveal="corner"] { opacity: 0; }` rule for initial hidden state |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/styles/typography.css` — no changes needed
- `src/pages/*.astro` — no changes needed
- `src/content/**` — no changes needed
- Any other component files — no changes needed

### Edge Cases & Defensive Coding

- **No visible h1 on page** (home, 404): Skip the title weight step. Do NOT error.
- **No grid overlay element** (if RevealSequence not rendered for some reason): Skip the grid step. Do NOT error.
- **No corner elements found**: Bail early from `init()`. Do NOT error.
- **sessionStorage unavailable** (private browsing in some browsers): Wrapped in try/catch via `hasPlayed()` and `markPlayed()` helpers. If sessionStorage throws, the reveal plays (graceful degradation — better to show the animation than crash).
- **Multiple `init()` calls**: The `hasPlayed()` check at the top of `init()` prevents double-play. Safe to call multiple times.
- **`transition:persist` on Frame**: Corner elements survive View Transitions. After the first reveal, `init()` on subsequent navigations calls `paintFinalState()` which sets opacity to 1 on the persisted elements. No re-animation occurs.
- **Script loads after DOM render**: Corners start at opacity 0 via CSS rule `[data-reveal="corner"] { opacity: 0 }`. No FOUC possible — corners are invisible until the script explicitly shows them.
- **JavaScript disabled**: Corners remain invisible (opacity 0 from CSS). This is acceptable — the site is fully functional without JS per FR-3 (honest first paint applies to content, not decorative Frame labels). The INDEX link is still accessible via skip-to-content.

### TypeScript Considerations

- `gsap.core.Animation` is the correct type for the instances array (covers both `Tween` and `Timeline`).
- `document.querySelectorAll<HTMLElement>` returns `NodeListOf<HTMLElement>` — GSAP accepts this directly as a target.
- `document.querySelector<HTMLElement>` returns `HTMLElement | null` — check for null before using.
- `sessionStorage.getItem()` returns `string | null` — truthy check is sufficient.
- No `any` types needed anywhere. `@typescript-eslint/no-explicit-any` is `"error"`.

### A11y Interaction Checklist (from Epic 2 retro action item)

- **Screen reader behavior**: The reveal is purely visual (opacity, font-weight). Screen readers are unaffected. No content is hidden or delayed — body opacity stays 1 throughout.
- **Forced-colors**: The grid overlay uses `var(--hairline)` which may not render in forced-colors mode. This is acceptable — the grid is decorative and `aria-hidden="true"`.
- **sr-only disclosures**: N/A — no interactive elements added.
- **ARIA target visibility**: The grid overlay has `aria-hidden="true"`. Corner labels already have appropriate ARIA from Frame.astro.

### Cross-Browser Edge Cases (from Epic 2 retro action item)

- **`fontWeight` animation**: GSAP animates `fontWeight` as a numeric value (300→400). This works in all target browsers. Variable fonts interpolate smoothly; static fonts snap at the nearest weight. Newsreader is variable — smooth interpolation expected.
- **`sessionStorage`**: Available in all target browsers including iOS Safari 16+. May throw in private browsing on older Safari — wrap in try/catch.
- **`repeating-linear-gradient` with CSS variables**: Supported in all target browsers. No fallback needed.
- **`pointer-events: none`** on grid overlay: Supported everywhere. Ensures the overlay never intercepts clicks.

### Previous Story Learnings (from Story 3.1)

- **`astro:after-swap` for GSAP re-init, NOT `astro:page-load`**: `astro:after-swap` fires immediately after DOM swap (before transition animation completes). This is the correct moment to start GSAP animations. `astro:page-load` fires too late and causes a visible flash.
- **`astro:before-swap` for cleanup**: Fires before DOM is replaced — correct moment to kill tweens.
- **Import from `./gsap-init` only**: Never from `'gsap'` directly.
- **`gsap.globalTimeline.pause()`** is handled globally by `gsap-init.ts` — individual scripts do NOT need their own `visibilitychange` listener.
- **No `(gsap as any)`**: `@typescript-eslint/no-explicit-any` is `"error"`. All GSAP APIs used here are properly typed.

### GSAP Budget Impact

- `reveal.ts` adds ~1–2KB gzip to the JS bundle (simple timeline, no ScrollTrigger usage).
- Running total estimate: GSAP core (~28KB) + ScrollTrigger (~12KB) + gsap-init.ts (~0.5KB) + reveal.ts (~1.5KB) = ~42KB gzip. Well within the 60KB budget.

### Project Structure After This Story

```
src/
├── components/
│   ├── motion/                     ← NEW DIRECTORY
│   │   └── RevealSequence.astro    ← NEW FILE
│   ├── frame/
│   │   └── Frame.astro             ← MODIFIED (data-reveal attributes)
│   ├── content/
│   │   └── ... (unchanged)
│   └── typography/
│       └── ... (unchanged)
├── layouts/
│   └── BaseLayout.astro            ← MODIFIED (import RevealSequence + script)
├── scripts/
│   ├── gsap-init.ts                ← unchanged
│   └── reveal.ts                   ← NEW FILE
└── ... (all other dirs unchanged)
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.2`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/architecture.md#Client-Side Script Architecture`] — gate+cleanup lifecycle, per-page loading, sessionStorage for one-shot behaviors
- [Source: `_bmad-output/planning-artifacts/architecture.md#View Transitions & Animation Lifecycle`] — reveal sequence session logic, feature gate matrix, `astro:before-swap` / `astro:after-swap`
- [Source: `_bmad-output/planning-artifacts/architecture.md#GSAP Patterns`] — never import directly, always register instances, transform/opacity only
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — `src/components/motion/RevealSequence.astro`, `src/scripts/reveal.ts`
- [Source: `_bmad-output/implementation-artifacts/3-1-gsap-initialization-and-lifecycle-pattern.md#Script File Structure Pattern`] — exact lifecycle pattern to follow
- [Source: `_bmad-output/implementation-artifacts/3-1-gsap-initialization-and-lifecycle-pattern.md#Dev Notes`] — `astro:after-swap` vs `astro:page-load` distinction
- [Source: `_bmad-output/implementation-artifacts/epic-2-retro-2026-05-22.md#Action Items`] — a11y interaction checklist, cross-browser edge cases
- [Source: FR-18] — first-paint reveal sequence specification
- [Source: NFR-2] — JS budget ≤60KB gzip total
- [Source: NFR-9] — animation performance (transform + opacity only)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

_None._

### Completion Notes List

- All 5 tasks and all subtasks implemented and verified.
- `src/components/motion/RevealSequence.astro` created — decorative grid overlay div, `aria-hidden`, `pointer-events-none`, starts at opacity 0.
- `src/scripts/reveal.ts` created — follows gate+cleanup lifecycle from Story 3.1. One-shot GSAP timeline: corners fade in (300ms) → grid flash (800ms) → title weight shift (400ms) = 1.5s total.
- `src/components/frame/Frame.astro` modified — `data-reveal="corner"` added to all 4 corner elements.
- `src/layouts/BaseLayout.astro` modified — imports RevealSequence, renders it after Frame, adds `<script>` importing reveal.ts.
- `src/styles/global.css` modified — `[data-reveal="corner"] { opacity: 0; }` rule added to prevent FOUC.
- SessionStorage key `reveal-played` ensures one-shot per session. View Transition navigations skip the reveal.
- `prefers-reduced-motion: reduce` gate paints final state instantly.
- All GSAP instances registered and cleaned up on `astro:before-swap`.
- Validation gate passed: `bun run format` ✓, `bun run lint` ✓, `bun run check` ✓ (0 errors, 0 warnings).

### File List

- `src/components/motion/RevealSequence.astro` (NEW)
- `src/scripts/reveal.ts` (NEW)
- `src/components/frame/Frame.astro` (MODIFIED)
- `src/layouts/BaseLayout.astro` (MODIFIED)
- `src/styles/global.css` (MODIFIED)

### Change Log

- 2026-05-23: Story created — ready for dev.
- 2026-05-23: Implementation complete — all tasks done, validation passed. Status → review.
