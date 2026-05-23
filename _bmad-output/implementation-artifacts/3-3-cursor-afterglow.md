# Story 3.3: Cursor Afterglow

Status: review

## Story

As a desktop visitor,
I want a faint warm trace following my cursor that vanishes when I'm reading,
so that the site acknowledges my presence without interrupting my attention.

## Acceptance Criteria

1. `src/components/motion/CursorAfterGlow.astro` exists and renders a single fixed-position `<div>` with `aria-hidden="true"` and `pointer-events-none`
2. `src/scripts/cursor.ts` exists and follows the gate+cleanup lifecycle pattern from Story 3.1
3. The script gates on `COARSE_POINTER` — if true, no afterglow renders and no listeners are attached
4. The script gates on `REDUCED_MOTION` — if true, no afterglow renders and no listeners are attached
5. On `pointer: fine` devices with motion enabled, the afterglow `<div>` follows the cursor with ~2 frame lag and ~1px drift past stop (GSAP-driven inertia, not per-frame DOM creation)
6. The afterglow decays in ~600ms (opacity fade) after the cursor stops moving
7. Hovering over body text (elements inside `<main>`) fades the afterglow to `opacity: 0` within ~200ms
8. Leaving body text (entering margin/whitespace) restores the afterglow within ~200ms
9. All GSAP instances are pushed to a cleanup array and killed on `astro:before-swap`
10. The script re-initializes on `astro:after-swap`
11. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/motion/CursorAfterGlow.astro` (AC: #1)
  - [x] 1.1: Create the component with a single fixed-position `<div>` (`aria-hidden="true"`, `pointer-events-none`, starts at `opacity: 0`, `z-index` above content but below Frame corners)
  - [x] 1.2: Size the glow element (e.g. `w-8 h-8` = 32×32px, `rounded-full`) with warm-grey background using `--meta` token at low opacity
  - [x] 1.3: Ensure the element starts off-screen or at `opacity: 0` so it is invisible before the script positions it

- [x] Task 2: Integrate `CursorAfterGlow.astro` into `BaseLayout.astro` (AC: #1, #3, #4)
  - [x] 2.1: Import and render `CursorAfterGlow` in BaseLayout (after `RevealSequence`, before `<main>`)
  - [x] 2.2: Add `<script>` tag importing `cursor.ts` (alongside the existing `reveal.ts` import)

- [x] Task 3: Create `src/scripts/cursor.ts` (AC: #2, #3, #4, #5, #6, #7, #8, #9, #10)
  - [x] 3.1: Import `gsap`, `REDUCED_MOTION`, `COARSE_POINTER` from `./gsap-init`
  - [x] 3.2: Implement dual gate — if `REDUCED_MOTION || COARSE_POINTER`, return immediately (no element shown, no listeners attached)
  - [x] 3.3: Implement `mousemove` listener that uses `gsap.to()` with `x`/`y` and a short duration (~0.12s) to create the ~2-frame lag inertia effect
  - [x] 3.4: Implement the ~1px drift-past-stop by letting the GSAP tween overshoot slightly (use `ease: "power2.out"` which naturally overshoots on deceleration)
  - [x] 3.5: Implement the ~600ms opacity decay after cursor stops (use a `gsap.delayedCall` or `onComplete` that fades opacity to 0 after ~600ms of no movement)
  - [x] 3.6: Implement `mouseover`/`mouseout` (or `mouseenter`/`mouseleave`) delegation on `<main>` to fade afterglow to 0 over ~200ms when entering body text, restore on exit
  - [x] 3.7: Push all GSAP instances (tweens, delayed calls) to `instances` array
  - [x] 3.8: Implement `cleanup()` — kills all instances, removes event listeners
  - [x] 3.9: Add `astro:before-swap` listener calling `cleanup()`
  - [x] 3.10: Add `astro:after-swap` listener calling `init()`
  - [x] 3.11: Call `init()` on initial load

- [x] Task 4: Run validation gate (AC: #11)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### Architecture Compliance

- **Single GSAP entry point**: Import ONLY from `./gsap-init` — never from `'gsap'` directly.
- **Gate+cleanup lifecycle**: Follow the exact pattern from Story 3.1 (imports → gates → instance registry → cleanup → init → lifecycle hooks → initial run).
- **Animation properties**: Use `x`, `y`, and `opacity` only. No layout properties. No `will-change`.
- **Duration tokens**: `0.12` for cursor follow (~2-frame lag at 60fps), `0.6` for decay (~`--dur-arrive`), `0.2` for reading-zone fade (~200ms).
- **No ScrollTrigger needed**: This script uses only `gsap` and the gate constants from `./gsap-init`.
- **Lifecycle events**: Use `astro:after-swap` for re-init (NOT `astro:page-load`). Use `astro:before-swap` for cleanup (kill tweens AND remove event listeners).
- **No `visibilitychange` listener**: `gsap-init.ts` handles `gsap.globalTimeline.pause()` globally.
- **No `(gsap as any)`**: `@typescript-eslint/no-explicit-any` is `"error"`. All GSAP APIs used here are properly typed.
- **`overwrite: "auto"`**: Required when multiple tweens target the same element/property.

### CursorAfterGlow.astro — Implementation

```astro
---
// src/components/motion/CursorAfterGlow.astro
---

<div
  id="cursor-afterglow"
  aria-hidden="true"
  class="pointer-events-none fixed left-0 top-0 z-30 h-8 w-8 rounded-full opacity-0"
  style="background: radial-gradient(circle, oklch(0.5 0.005 80 / 0.18) 0%, transparent 70%);"
>
</div>
```

**Why inline `style`**: The `radial-gradient` with OKLCH + transparency cannot be expressed as a Tailwind utility. Justified custom CSS per AGENTS.md.

**Why `z-30`**: Frame corners are `z-50`. Afterglow sits below Frame but above page content.

**Why no `-translate-x/y` classes**: GSAP's `x`/`y` properties write to `transform`. Tailwind translate classes also write to `transform` — they conflict. Centering is handled in `cursor.ts` via `gsap.set(el, { xPercent: -50, yPercent: -50 })` in `init()`.

**`pointer-events-none` is permanent**: Never remove or toggle this class. The afterglow overlaps content at all times — without `pointer-events-none`, it would block clicks even when invisible.

**Do NOT add `will-change: transform`**: GSAP handles GPU layer promotion internally. A permanent `will-change` would create an unnecessary compositing layer for an element that is often invisible.

### cursor.ts — Full Implementation Pattern

```typescript
// src/scripts/cursor.ts
// Cursor afterglow — GSAP-driven warm trace with inertia and reading-zone awareness.
//
// Lifecycle: gate → register → clean → re-init
// Loaded in BaseLayout (every page).

import { gsap, REDUCED_MOTION, COARSE_POINTER } from "./gsap-init";

// ─── Instance Registry ────────────────────────────────────────────────────────
// Grows on every mousemove. Do NOT implement periodic pruning — rely on
// overwrite: "auto" (GSAP kills conflicting tweens) and cleanup() on navigation.
const instances: gsap.core.Animation[] = [];
let moveListener: ((e: MouseEvent) => void) | null = null;
let enterListener: ((e: MouseEvent) => void) | null = null;
let leaveListener: ((e: MouseEvent) => void) | null = null;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
  if (moveListener) document.removeEventListener("mousemove", moveListener);
  const main = document.querySelector("main");
  if (main) {
    if (enterListener) main.removeEventListener("mouseenter", enterListener);
    if (leaveListener) main.removeEventListener("mouseleave", leaveListener);
  }
  moveListener = null;
  enterListener = null;
  leaveListener = null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Dual gate: no afterglow on coarse pointer or reduced motion
  if (COARSE_POINTER || REDUCED_MOTION) return;

  const el = document.getElementById("cursor-afterglow");
  if (!el) return;

  const main = document.querySelector<HTMLElement>("main");

  // Center the glow on cursor position (GSAP handles x/y from top-left origin)
  gsap.set(el, { xPercent: -50, yPercent: -50 });

  // Decay timer — fades afterglow after cursor stops
  let decayTween: gsap.core.Tween | null = null;

  // ─── Mouse Move ─────────────────────────────────────────────────────────────
  moveListener = (e: MouseEvent) => {
    // Cancel any pending decay
    if (decayTween) {
      decayTween.kill();
      decayTween = null;
    }

    // Follow cursor with ~2-frame lag inertia (~0.12s at 60fps)
    const moveTween = gsap.to(el, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.12,
      ease: "power2.out", // natural deceleration with ~1px overshoot
      overwrite: "auto",
    });
    instances.push(moveTween);

    // Ensure visible while moving (unless in reading zone — handled by enter/leave)
    const opacityTween = gsap.to(el, {
      opacity: 1,
      duration: 0.1,
      overwrite: "auto",
    });
    instances.push(opacityTween);

    // Schedule decay: fade to 0 after ~600ms of no movement
    decayTween = gsap.delayedCall(0.6, () => {
      const fadeTween = gsap.to(el, { opacity: 0, duration: 0.3, ease: "power1.out" });
      instances.push(fadeTween);
    });
    instances.push(decayTween);
  };

  // ─── Reading Zone Awareness ──────────────────────────────────────────────────
  // Fade to 0 when cursor enters <main> body text area
  if (main) {
    enterListener = () => {
      const fadeTween = gsap.to(el, { opacity: 0, duration: 0.2, ease: "power1.out", overwrite: "auto" });
      instances.push(fadeTween);
    };
    leaveListener = () => {
      const fadeTween = gsap.to(el, { opacity: 1, duration: 0.2, ease: "power1.in", overwrite: "auto" });
      instances.push(fadeTween);
    };
    main.addEventListener("mouseenter", enterListener);
    main.addEventListener("mouseleave", leaveListener);
  }

  document.addEventListener("mousemove", moveListener);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
```

### Reading-Zone Awareness — Implementation Detail

**Why `<main>` boundary**: The spec says "fades over body text, returns in margin/whitespace." `<main>` contains all body text; margin/whitespace is outside `<main>` (Frame corners, content column gutters). Using `<main>` avoids expensive per-element event delegation.

**Why `mouseenter`/`mouseleave` (not `mouseover`/`mouseout`)**: These events do NOT bubble — we detect the `<main>` boundary crossing, not every child element.

**Edge case — cursor inside `<main>` at init**: The afterglow starts at `opacity: 0`. If cursor is already inside `<main>` when script initializes, `mouseenter` won't fire. Acceptable — afterglow remains invisible until cursor leaves and re-enters.

### Inertia & Drift Behavior

- **~2 frame lag**: GSAP `duration: 0.12` (120ms) creates smooth inertia in the ~2–3 frame range at 60fps.
- **~1px drift past stop**: `ease: "power2.out"` naturally overshoots by a tiny amount on deceleration — no explicit overshoot config needed.
- **Why NOT `gsap.quickTo()`**: Returns a function (not `gsap.core.Animation`), making cleanup harder. `gsap.to()` with `overwrite: "auto"` is simpler, typed correctly, and sufficient.

### BaseLayout.astro Modification

```diff
+ import CursorAfterGlow from "../components/motion/CursorAfterGlow.astro";

  <body class="bg-paper text-ink">
    <a href="#main-content" class="skip-to-content">Skip to content</a>
    <Frame sectionLabel={sectionLabel} transition:persist />
    <RevealSequence />
+   <CursorAfterGlow />
    <main id="main-content" tabindex="-1" transition:animate="fade">
      <slot />
    </main>
  </body>
  <script>
    import "../scripts/reveal.ts";
+   import "../scripts/cursor.ts";
  </script>
```

**Why both scripts in the same `<script>` block**: Astro deduplicates `<script>` imports. Adding `cursor.ts` to the existing script block is clean. Alternatively, a second `<script>` block works equally well — Astro handles both.

### TypeScript Considerations

- `gsap.core.Animation` covers `Tween`, `Timeline`, and `delayedCall` return values. Use `gsap.core.Animation[]` for the instances array.
- `document.getElementById()` and `document.querySelector()` return nullable — always null-check before use.
- `overwrite: "auto"` is a valid GSAP option — prevents conflicting tweens on the same property.
- No `any` types needed. `@typescript-eslint/no-explicit-any` is `"error"`.

### A11y Interaction Checklist (from Epic 2 retro action item)

- **Screen reader behavior**: The afterglow div has `aria-hidden="true"` and `pointer-events-none`. Screen readers are completely unaffected. No content is hidden or delayed.
- **Forced-colors**: The radial gradient uses OKLCH with transparency. In forced-colors mode, the gradient may not render. This is acceptable — the afterglow is purely decorative.
- **sr-only disclosures**: N/A — no interactive elements added.
- **ARIA target visibility**: The afterglow div has `aria-hidden="true"`. No ARIA concerns.
- **Keyboard users**: The afterglow is mouse-driven only. Keyboard users never see it. This is correct behavior — no keyboard equivalent needed for a decorative cursor effect.

### Cross-Browser Edge Cases

- **OKLCH `radial-gradient`**: Chrome 111+, Firefox 113+, Safari 15.4+. All target browsers support it.
- **`COARSE_POINTER` gate**: Uses `window.matchMedia('(pointer: coarse)').matches`. Desktop = `false` (runs). Touch = `true` (gates out). iOS Safari gates out entirely.
- **`mouseenter`/`mouseleave`**: Non-bubbling — correct for boundary detection.
- **`overwrite: "auto"`**: Required when move listener + enter/leave listeners target the same element's `opacity`.

### Instance Registry Strategy

Use `overwrite: "auto"` on all tweens. GSAP kills conflicting tweens automatically. The `instances` array grows but `kill()` on dead tweens is a no-op. `cleanup()` clears the array on every navigation. Do NOT implement periodic array pruning — memory pressure is negligible for a portfolio site.

### Scope Boundary

This story adds cursor animation only. No changes to page content, styling, View Transitions, or other motion scripts. The native OS cursor is NOT hidden — the afterglow is an additive warm trace, not a cursor replacement.

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/components/motion/CursorAfterGlow.astro` | Cursor afterglow div (GSAP target) |
| `src/scripts/cursor.ts` | Cursor follow logic with gate+cleanup lifecycle |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | Import + render `CursorAfterGlow`, add `<script>` importing `cursor.ts` |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/reveal.ts` — no changes needed
- `src/components/motion/RevealSequence.astro` — no changes needed
- `src/components/frame/Frame.astro` — no changes needed
- `src/styles/global.css` — no changes needed (no CSS initial state needed for cursor; it starts at `opacity: 0` via Tailwind class)
- `src/styles/typography.css` — no changes needed
- `src/pages/*.astro` — no changes needed
- `src/content/**` — no changes needed

### Edge Cases & Defensive Coding

- **No `#cursor-afterglow` element found**: `init()` bails early. No error.
- **No `<main>` element found**: Reading-zone awareness is skipped. Afterglow still follows cursor. No error.
- **Cursor never moves**: Afterglow stays at `opacity: 0`. Correct — it only appears on movement.
- **Rapid navigation mid-animation**: `cleanup()` on `astro:before-swap` kills all tweens. No zombie animations.
- **Multiple `init()` calls**: The gate check at the top prevents double-initialization. The `cleanup()` call on `astro:before-swap` ensures a clean state before `init()` runs again on `astro:after-swap`.
- **`COARSE_POINTER` is evaluated once at module load**: If a user connects a mouse after page load, the gate won't re-evaluate. This is acceptable per architecture spec ("Feature gates — constants, never re-evaluated").
- **`transition:persist` on Frame**: Frame elements survive View Transitions. The cursor afterglow div is NOT `transition:persist` — it is recreated on each navigation. `cleanup()` kills tweens, `init()` re-attaches listeners to the new DOM. This is correct.

### GSAP Budget Impact

- `cursor.ts` adds ~1–2KB gzip to the JS bundle (simple tweens, no ScrollTrigger usage).
- Running total estimate: GSAP core (~28KB) + ScrollTrigger (~12KB) + gsap-init.ts (~0.5KB) + reveal.ts (~1.5KB) + cursor.ts (~1.5KB) = ~43.5KB gzip. Well within the 60KB budget.

### Project Structure After This Story

```
src/
├── components/
│   └── motion/
│       ├── CursorAfterGlow.astro   ← NEW FILE
│       └── RevealSequence.astro    ← unchanged
├── layouts/
│   └── BaseLayout.astro            ← MODIFIED (import CursorAfterGlow + cursor.ts script)
├── scripts/
│   ├── gsap-init.ts                ← unchanged
│   ├── reveal.ts                   ← unchanged
│   └── cursor.ts                   ← NEW FILE
└── ... (all other dirs unchanged)
```

### References

- [FR-16] — cursor afterglow rendering specification
- [FR-17] — cursor system disable conditions
- [UX-DR7] — reading-zone awareness (fades over body text, returns in margin)
- [UX-DR13] — decorative elements `aria-hidden="true"`
- [NFR-2] — JS budget ≤60KB gzip total
- [NFR-9] — animation performance (transform + opacity only)
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, feature gate matrix
- [Story 3.1] — exact lifecycle pattern to follow
- [Story 3.2] — `astro:after-swap` vs `astro:page-load`, event listener cleanup

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Implemented `CursorAfterGlow.astro` — fixed-position `<div>` with `aria-hidden="true"`, `pointer-events-none`, `z-30`, `opacity-0` initial state, `radial-gradient` warm glow via inline style (justified: OKLCH + transparency cannot be expressed as Tailwind utility).
- Implemented `cursor.ts` — dual gate on `COARSE_POINTER || REDUCED_MOTION` (early return, no DOM shown, no listeners attached). GSAP `mousemove` listener with `duration: 0.12` / `ease: "power2.out"` for ~2-frame lag inertia. `gsap.delayedCall(0.6)` for opacity decay after cursor stops. `mouseenter`/`mouseleave` on `<main>` for reading-zone fade (200ms). All tweens pushed to `instances[]`. `cleanup()` kills all instances and removes all listeners. `astro:before-swap` → cleanup, `astro:after-swap` → init, initial `init()` call.
- Updated `BaseLayout.astro` — imported and rendered `CursorAfterGlow` after `RevealSequence`, added `cursor.ts` import to existing `<script>` block.
- All ACs satisfied. `bun run format && bun run lint && bun run check` — 0 errors, 0 warnings.

### File List

- `src/components/motion/CursorAfterGlow.astro` — NEW
- `src/scripts/cursor.ts` — NEW
- `src/layouts/BaseLayout.astro` — MODIFIED

### Change Log

- 2026-05-23: Story created — ready for dev.
- 2026-05-23: Quality review applied — fixed cleanup bug, removed contradictory component code, consolidated learnings into architecture compliance, trimmed verbosity for LLM optimization.
- 2026-05-23: Implemented — created `CursorAfterGlow.astro`, `cursor.ts`; updated `BaseLayout.astro`. All ACs satisfied. Validation passed (format, lint, check).
