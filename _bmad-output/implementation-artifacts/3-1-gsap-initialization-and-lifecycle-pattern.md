# Story 3.1: GSAP Initialization & Lifecycle Pattern

Status: done

## Story

As a developer,
I want a single GSAP entry point with a standardized lifecycle pattern,
so that all animation scripts share one GSAP copy, clean up on navigation, and respect accessibility preferences.

## Acceptance Criteria

1. `src/scripts/gsap-init.ts` exists and imports `gsap` from `'gsap'` and `ScrollTrigger` from `'gsap/ScrollTrigger'`, then calls `gsap.registerPlugin(ScrollTrigger)`
2. `gsap-init.ts` re-exports `gsap` and `ScrollTrigger` as named exports for use by all other scripts
3. No other file in the project imports directly from `'gsap'` or `'gsap/ScrollTrigger'` — all imports go through `gsap-init.ts`
4. `gsap-init.ts` exports `REDUCED_MOTION` (boolean, from `window.matchMedia('(prefers-reduced-motion: reduce)').matches`) and `COARSE_POINTER` (boolean, from `window.matchMedia('(pointer: coarse)').matches`)
5. A global `document.addEventListener('visibilitychange', ...)` listener pauses the global GSAP ticker on `document.hidden === true` and resumes it on `document.hidden === false`
6. The total gzipped size of GSAP core + ScrollTrigger is within the ~40KB budget (verified by checking `node_modules/gsap` — no additional plugins imported)
7. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/scripts/` directory and `src/scripts/gsap-init.ts` (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1: Create `src/scripts/gsap-init.ts` with the import, plugin registration, and re-exports
  - [x] 1.2: Export `REDUCED_MOTION` and `COARSE_POINTER` gate constants
  - [x] 1.3: Add the global `visibilitychange` listener to pause/resume the GSAP ticker
  - [x] 1.4: Verify no other file imports from `'gsap'` directly (search codebase — none should exist yet)

- [x] Task 2: Run validation gate (AC: #7)
  - [x] 2.1: `bun run format`
  - [x] 2.2: `bun run lint`
  - [x] 2.3: `bun run check`

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/scripts/gsap-init.ts` | Single GSAP entry point — imports, registers ScrollTrigger, exports gate constants, manages global ticker lifecycle |

### Files to NOT Touch

- `src/layouts/BaseLayout.astro` — no changes needed in this story; scripts are loaded in later stories
- `src/styles/global.css` — no changes needed
- `src/styles/typography.css` — no changes needed
- Any component files — no changes needed
- Any page files — no changes needed
- Any content files — no changes needed

### Scope Boundary — Critical

**This story creates the GSAP foundation only.** The following are explicitly deferred:

- **Loading `gsap-init.ts` in BaseLayout** — not needed yet; the module is imported by individual scripts (reveal.ts, cursor.ts, etc.) which are added in Stories 3.2–3.5. Vite deduplicates the GSAP import automatically.
- **Per-script cleanup arrays and lifecycle hooks** — the gate+cleanup pattern (instances array, `astro:before-swap`, `astro:after-swap`) is implemented in each individual script (3.2–3.5), not here.
- **Any actual animation** — this story has zero animation. It is infrastructure only.
- **`src/components/motion/` components** — CursorAfterGlow.astro, RevealSequence.astro, SectionPin.astro are created in their respective stories.

### `gsap-init.ts` — Full Implementation

```typescript
// src/scripts/gsap-init.ts
// Single GSAP entry point for the lincie project.
//
// RULES (enforced by architecture):
//   - This is the ONLY file that imports from 'gsap' or 'gsap/ScrollTrigger'.
//   - All other scripts import { gsap, ScrollTrigger } from './gsap-init'.
//   - No other GSAP plugins are imported (no Flip, Draggable, MotionPath, etc.).
//   - Vite tree-shakes and deduplicates — one GSAP copy ships regardless of
//     how many scripts import from this file.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once, globally.
// All scripts that use ScrollTrigger rely on this registration.
gsap.registerPlugin(ScrollTrigger);

// ─── Feature Gate Constants ───────────────────────────────────────────────────
// Evaluated once at module load time. These are constants — never re-evaluated.
// Scripts import these and use them as early-exit guards in their init() functions.
//
// REDUCED_MOTION: true → skip all GSAP animation, paint final state instantly.
// COARSE_POINTER: true → disable cursor-dependent and scroll-normalization features.

export const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

export const COARSE_POINTER = window.matchMedia("(pointer: coarse)").matches;

// ─── Global Ticker Lifecycle ──────────────────────────────────────────────────
// Pause the GSAP ticker when the tab is hidden; resume when visible.
// This prevents background animation from consuming CPU/battery and prevents
// zombie tickers from accumulating across navigations.
//
// Note: This listener is intentionally NOT cleaned up on astro:before-swap.
// It is a global, document-level concern that should persist for the lifetime
// of the page session. Individual scripts manage their own instance cleanup.

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    gsap.globalTimeline.pause();
  } else {
    gsap.globalTimeline.resume();
  }
});

// ─── Exports ──────────────────────────────────────────────────────────────────
// Re-export gsap and ScrollTrigger so all other scripts import from here.

export { gsap, ScrollTrigger };
```

### Why `gsap.globalTimeline.pause()` (not `gsap.ticker.sleep()`)

`gsap.globalTimeline.pause()` pauses all active tweens and timelines. `gsap.ticker.sleep()` stops the RAF loop entirely but can cause issues with ScrollTrigger's internal state. The `globalTimeline` approach is the GSAP-recommended pattern for visibility-based pausing and is safe to resume without re-initialization.

### Why the `visibilitychange` listener is NOT cleaned up on `astro:before-swap`

Individual scripts clean up their own GSAP instances on `astro:before-swap`. The `visibilitychange` listener is a global concern — it should survive page navigations and continue managing the ticker for the lifetime of the browser session. Adding it once at module load is correct. If it were cleaned up and re-added on every navigation, there would be a window between `astro:before-swap` and `astro:after-swap` where the ticker would not be paused on tab hide.

### Why `window.matchMedia(...).matches` (not `addEventListener`)

The gate constants are evaluated once at module load. They represent the user's preference at the time the page loads. GSAP animations are set up once per navigation — they do not need to react to mid-session preference changes. This matches the architecture spec: "Feature gates (constants, never re-evaluated)."

### Script File Structure Pattern (for all future scripts)

Every script in `src/scripts/` follows this exact structure. Story 3.1 establishes the foundation; Stories 3.2–3.5 implement this pattern:

```typescript
// 1. Imports — always from './gsap-init', never from 'gsap' directly
import { gsap, ScrollTrigger, REDUCED_MOTION, COARSE_POINTER } from './gsap-init';

// 2. Instance registry — all GSAP instances pushed here for cleanup.
//    gsap.core.Animation is the base class for both Tween and Timeline (both have kill()).
//    ScrollTrigger instances are separate — they have their own kill() method.
const instances: Array<gsap.core.Animation | ScrollTrigger> = [];

// 3. Cleanup function — kills all registered instances
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
}

// 4. Init function — gates first, then builds animations
function init(): void {
  if (REDUCED_MOTION) return; // or: paint final state, then return
  // ... build animations, push to instances array
  // e.g. instances.push(gsap.to(el, { opacity: 1 }));
  // e.g. instances.push(ScrollTrigger.create({ ... }));
}

// 5. Lifecycle hooks
//    astro:before-swap — fires before DOM is replaced; correct moment to kill tweens
//    astro:after-swap  — fires immediately after DOM swap; correct moment to re-init
//    Do NOT use astro:page-load for GSAP scripts — it fires after the transition
//    animation completes (later than after-swap), which causes a visible flash.
//    astro:page-load is correct for DOM manipulation (see FootnoteReveal.astro).
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:after-swap', init);

// 6. Initial run
init();
```

**`astro:after-swap` vs `astro:page-load` — critical distinction:**

| Event | Fires when | Use for |
|-------|-----------|---------|
| `astro:before-swap` | Before DOM is replaced | GSAP cleanup (kill tweens before DOM disappears) |
| `astro:after-swap` | Immediately after DOM swap, before transition animation completes | GSAP re-init (DOM is ready, start animations) |
| `astro:page-load` | After `runScripts()` and transition animation finishes | DOM manipulation (see `FootnoteReveal.astro`) |

GSAP scripts use `astro:after-swap` for re-init. DOM manipulation scripts (like `FootnoteReveal.astro`) use `astro:page-load`. Do not mix these up.

### GSAP Budget Verification

From architecture: GSAP core ~28KB gzip + ScrollTrigger ~12KB gzip = ~40KB gzip. No additional plugins are imported in this story or any subsequent story. The budget is met by importing only `gsap` and `gsap/ScrollTrigger`.

To verify at implementation time:
```bash
# Check what GSAP exports are available (informational only)
ls node_modules/gsap/dist/
```

The `package.json` already has `"gsap": "^3.15.0"` — no installation needed.

### TypeScript Considerations

- `gsap` and `ScrollTrigger` are typed by the `gsap` package itself — no `@types/gsap` needed.
- `gsap.globalTimeline` is typed at line 209 of `node_modules/gsap/types/gsap-core.d.ts` as `const globalTimeline: core.Timeline` — no type cast needed. Do NOT use `(gsap as any)` — `@typescript-eslint/no-explicit-any` is set to `"error"` in this project's ESLint config and will fail `bun run lint`.
- `window.matchMedia` is available in browser context. Since this file is loaded as a client-side `<script>`, `window` is always defined. No SSR guard needed (Astro static output, no SSR).
- `document.hidden` is a standard DOM property — no type assertion needed.
- The `visibilitychange` event listener callback receives an `Event` parameter (not used — the handler reads `document.hidden` directly).

### Astro `<script>` Loading Pattern (for awareness — implemented in later stories)

When individual scripts are loaded in Astro components, they use:

```astro
<script>
  import { gsap, ScrollTrigger, REDUCED_MOTION } from '../../scripts/gsap-init';
  // ... script body
</script>
```

**Import path is relative to the component file's location:**
- From `src/components/motion/CursorAfterGlow.astro` → `../../scripts/gsap-init`
- From `src/components/content/FootnoteReveal.astro` → `../../scripts/gsap-init`
- From `src/layouts/BaseLayout.astro` → `../scripts/gsap-init`
- From `src/pages/index.astro` → `../scripts/gsap-init`

Astro's Vite bundler deduplicates the `gsap-init.ts` module — even if 5 components each import from it, only one copy of GSAP ships. This is the key reason for the single entry point pattern.

### Accessibility Requirements

This story has no rendered DOM elements — it is pure TypeScript infrastructure. No accessibility requirements apply directly. However, the `REDUCED_MOTION` and `COARSE_POINTER` exports are the accessibility foundation for all subsequent animation scripts. Their correctness is critical.

### ESLint / Astro Check — Expected Issues to Avoid

- `@typescript-eslint/no-explicit-any` is set to `"error"` in this project (via `tseslint.configs.recommended` in `eslint.config.mjs`). Never use `any` in `gsap-init.ts` or any script. `gsap.globalTimeline` is properly typed — no cast needed.
- No Astro-specific lint rules apply (this is a `.ts` file, not `.astro`).
- `bun run check` runs `astro check` which type-checks `.astro` files and their `<script>` blocks. Since no `.astro` file imports from `gsap-init.ts` yet, the check should pass cleanly.

### A11y Interaction Checklist (from Epic 2 retro action item)

- Screen reader behavior: N/A — no DOM elements rendered
- Forced-colors: N/A — no visual elements
- sr-only disclosures: N/A
- ARIA target visibility: N/A

### Cross-Browser Edge Cases (from Epic 2 retro action item)

- `window.matchMedia` is supported in all target browsers (Chrome, Firefox, Safari, Edge, iOS Safari 16+) — no polyfill needed.
- `document.visibilitychange` event is supported in all target browsers — no polyfill needed.
- `gsap.globalTimeline` is a GSAP internal API — consistent across GSAP 3.x versions.

### What This Story Does NOT Include

- No `<script>` tags in any `.astro` file
- No animation of any kind
- No DOM elements created
- No `astro:before-swap` / `astro:after-swap` listeners (those belong to individual scripts)
- No `sessionStorage` usage (that's for the reveal sequence in Story 3.2)
- No `src/components/motion/` components
- No changes to BaseLayout, pages, or styles

### Project Structure After This Story

```
src/
├── scripts/                    ← NEW DIRECTORY
│   └── gsap-init.ts            ← NEW FILE (this story)
│   (cursor.ts)                 ← Story 3.3
│   (reveal.ts)                 ← Story 3.2
│   (scroll.ts)                 ← Epic 4
│   (footnotes.ts)              ← Epic 4
│   (paper-tone.ts)             ← Epic 5
│   (local-time.ts)             ← Epic 5
└── ... (all other dirs unchanged)
```

### Previous Story Learnings (from Story 2.5 and Epic 2 Retro)

- **`astro:page-load` / `astro:before-swap` patterns established in Story 2.3** — the event names are `astro:before-swap` (before navigation) and `astro:after-swap` (after navigation). Use these in all subsequent scripts. Do NOT use `astro:page-load` for GSAP cleanup — `astro:before-swap` fires before the DOM is replaced, which is the correct moment to kill tweens.
- **No `rel="noopener"` on internal links** — not applicable here, but carry forward.
- **Token references only** — not applicable here (no CSS), but carry forward.
- **Epic 2 retro: Story 3.1 is foundational** — "if the GSAP init pattern is wrong, every subsequent story inherits the problem." Get the lifecycle pattern exactly right.
- **Epic 2 retro: gate+cleanup is new territory** — the architecture document's script structure pattern is the authoritative reference. Follow it exactly.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.1`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/architecture.md#Client-Side Script Architecture`] — single entry point, gate+cleanup lifecycle, per-page loading strategy
- [Source: `_bmad-output/planning-artifacts/architecture.md#GSAP Patterns`] — never import directly, always register instances, transform/opacity only
- [Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`] — script file structure pattern
- [Source: `_bmad-output/planning-artifacts/architecture.md#View Transitions & Animation Lifecycle`] — feature gate matrix, `astro:before-swap` / `astro:after-swap` hooks
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — `src/scripts/gsap-init.ts` location
- [Source: `_bmad-output/implementation-artifacts/epic-2-retro-2026-05-22.md#Next Epic Preview`] — GSAP budget awareness, gate+cleanup is new territory, Story 3.1 is foundational
- [Source: `_bmad-output/implementation-artifacts/2-5-project-index-bands-structure-and-static-layout.md#Dev Notes`] — `astro:page-load` / `astro:before-swap` pattern carry-forward
- [Source: FR-16, FR-17, FR-18] — cursor, reveal, and their gate requirements
- [Source: NFR-2] — JS budget ≤60KB gzip total

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Created `src/scripts/gsap-init.ts` as the single GSAP entry point for the project.
- Imports `gsap` from `'gsap'` and `ScrollTrigger` from `'gsap/ScrollTrigger'`; registers ScrollTrigger once globally.
- Re-exports `gsap` and `ScrollTrigger` as named exports for all downstream scripts.
- Exports `REDUCED_MOTION` and `COARSE_POINTER` boolean gate constants, evaluated once at module load via `window.matchMedia`.
- Adds a global `visibilitychange` listener that pauses `gsap.globalTimeline` on tab hide and resumes on tab show; intentionally not cleaned up on navigation (global concern).
- Confirmed no other file in the codebase imports from `'gsap'` or `'gsap/ScrollTrigger'` directly.
- `bun run format`, `bun run lint`, and `bun run check` all pass with 0 errors, 0 warnings.

### File List

- `src/scripts/gsap-init.ts` (new)

### Review Findings

- [x] [Review][Defer] Duplicate `visibilitychange` listeners if module re-executes [src/scripts/gsap-init.ts:38] — deferred, pre-existing; Vite module deduplication guarantees single execution per session. Revisit if module loading strategy changes in Epic 4/5.
- [x] [Review][Defer] Unconditional `globalTimeline.resume()` could override intentional external pauses [src/scripts/gsap-init.ts:43] — deferred, pre-existing; no competing pause logic exists in current scope. Revisit when Epic 4/5 introduce scroll-damping or section-pin pause logic.
- [x] [Review][Defer] `gsap.globalTimeline` is typed but not part of GSAP's advertised public API surface [src/scripts/gsap-init.ts:40] — deferred, pre-existing; typed in `gsap-core.d.ts:209` and stable across GSAP 3.x. Verify on any GSAP major version bump.

## Change Log

- 2026-05-22: Story created — ready for dev.
- 2026-05-22: Implementation complete — `src/scripts/gsap-init.ts` created; all ACs satisfied; format/lint/check pass. Status → review.
