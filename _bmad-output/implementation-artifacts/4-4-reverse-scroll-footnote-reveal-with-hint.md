# Story 4.4: Reverse-Scroll Footnote Reveal with Hint

Status: done

## Story

As a desktop visitor re-reading content,
I want footnotes to appear when I scroll backward,
so that I discover supplementary context as a reward for paying attention.

## Acceptance Criteria

1. `src/scripts/footnotes.ts` is created following the gate+cleanup lifecycle pattern
2. On desktop with motion enabled, forward scroll keeps `#footnote-margin` at `opacity: 0`
3. Reverse scroll (detected via ScrollTrigger) fades `#footnote-margin` to `opacity: 1` over ~250ms
4. On the first reverse-scroll of the session on this page, a one-time monospace hint ("footnotes reveal as you re-read") fades in near the spine, holds ~2 seconds, fades out, and never repeats on this page (tracked via `sessionStorage`)
5. Forward scroll after reveal fades `#footnote-margin` back to `opacity: 0` over ~250ms
6. The script gates on `COARSE_POINTER` — if true, footnotes are always visible (no reveal behavior)
7. The script gates on `REDUCED_MOTION` — if true, footnotes are always visible (no reveal behavior)
8. All GSAP/ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
9. Re-initializes on `astro:after-swap`
10. The hint element is injected by `footnotes.ts` into the DOM — it does NOT exist in any Astro component template
11. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/scripts/footnotes.ts` with gate+cleanup lifecycle (AC: #1, #6, #7, #8, #9)
  - [x] 1.1: Add file header comment: `// src/scripts/footnotes.ts` / `// Reverse-scroll footnote reveal with one-time hint.` / `// Loaded only on long-form pages (project + essay).`
  - [x] 1.2: Import `{ gsap, ScrollTrigger, REDUCED_MOTION, COARSE_POINTER }` from `'./gsap-init'`
  - [x] 1.3: Add Instance Registry section with `const instances: { kill: () => void }[] = [];`
  - [x] 1.4: Add Cleanup function that kills all instances and resets `instances.length = 0`
  - [x] 1.5: Add Init function with dual gate: `if (REDUCED_MOTION || COARSE_POINTER) { /* make visible */ return; }` — see Dev Notes for the exact make-visible pattern
  - [x] 1.6: Add Lifecycle hooks: `document.addEventListener('astro:before-swap', cleanup)` and `document.addEventListener('astro:after-swap', init)`
  - [x] 1.7: Add Initial Run: `init();`

- [x] Task 2: Implement scroll-direction detection and opacity toggle (AC: #2, #3, #5)
  - [x] 2.1: Query `const marginEl = document.getElementById('footnote-margin')` — guard with `if (!marginEl) return;` (not a long-form page or no footnotes)
  - [x] 2.2: Create a `ScrollTrigger` with `onUpdate` callback that reads `self.getVelocity()` to detect direction — negative velocity = scrolling up (reverse), positive = scrolling down (forward)
  - [x] 2.3: On reverse scroll (velocity < 0): `gsap.to(marginEl, { opacity: 1, duration: 0.25, ease: 'none', overwrite: true })` — push the tween to `instances[]`
  - [x] 2.4: On forward scroll (velocity > 0): `gsap.to(marginEl, { opacity: 0, duration: 0.25, ease: 'none', overwrite: true })` — push the tween to `instances[]`
  - [x] 2.5: Use `start: 'top top', end: 'bottom bottom'` on the ScrollTrigger so it covers the full page scroll range
  - [x] 2.6: Push the ScrollTrigger instance to `instances[]`

- [x] Task 3: Implement one-time hint (AC: #4)
  - [x] 3.1: Define `sessionStorage` key as `const HINT_KEY = \`footnote-hint-shown-${window.location.pathname}\`` — per-page key so the hint can fire once per page per session
  - [x] 3.2: Create a `showHint()` function that: checks `sessionStorage.getItem(HINT_KEY)` — if set, return immediately; otherwise proceed
  - [x] 3.3: In `showHint()`, inject a `<div>` hint element into the DOM (see Dev Notes for exact markup and positioning)
  - [x] 3.4: Animate the hint: `gsap.timeline()` — fade in over 0.25s, hold for 2s, fade out over 0.25s — then remove the element from the DOM in the `onComplete` callback
  - [x] 3.5: Set `sessionStorage.setItem(HINT_KEY, '1')` immediately before starting the timeline (not in onComplete — prevents double-fire if navigation happens mid-animation)
  - [x] 3.6: Push the timeline to `instances[]` so it is killed on navigation if still running
  - [x] 3.7: Call `showHint()` from the `onUpdate` callback when reverse scroll is first detected (before the opacity tween)

- [x] Task 4: Load `footnotes.ts` in both long-form page templates (AC: #1)
  - [x] 4.1: In `src/pages/projects/[...slug].astro`, add `import '../../scripts/footnotes';` inside the existing `<script>` block (alongside the existing `import '../../scripts/scroll';`)
  - [x] 4.2: In `src/pages/writing/[...slug].astro`, add `import '../../scripts/footnotes';` to the existing `<script>` block — the writing page already has `import '../../scripts/scroll';` in its `<script>` block; add `footnotes.ts` on the next line alongside it. Do NOT create a second `<script>` block.

- [x] Task 5: Run validation gate (AC: #11)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### This Story Creates `footnotes.ts` — A New Script File

`footnotes.ts` is a new file in `src/scripts/`. It does NOT extend `scroll.ts`. The architecture explicitly separates these concerns:
- `scroll.ts` — damped scroll, section pin, fog-lifting (FR-23, FR-24, FR-20)
- `footnotes.ts` — reverse-scroll footnote reveal + hint (FR-12)

Both files are loaded on long-form pages. They share the same lifecycle pattern but are independent modules.

### Complete `footnotes.ts` Structure

```typescript
// src/scripts/footnotes.ts
// Reverse-scroll footnote reveal with one-time hint.
// Loaded only on long-form pages (project + essay).

import { gsap, ScrollTrigger, REDUCED_MOTION, COARSE_POINTER } from './gsap-init';

// ─── Constants ────────────────────────────────────────────────────────────────
// Per-page sessionStorage key — hint fires once per page per session.
const HINT_KEY = `footnote-hint-shown-${window.location.pathname}`;

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
  // Remove any hint element left over from an interrupted animation.
  // The hint is identified by data-footnote-hint so cleanup() can find it
  // without holding a module-level reference to the DOM node.
  document.querySelector('[data-footnote-hint]')?.remove();
}

// ─── Hint ─────────────────────────────────────────────────────────────────────
function showHint(): void {
  if (sessionStorage.getItem(HINT_KEY)) return;

  // Inject hint element — positioned near the spine (left edge of viewport)
  const hint = document.createElement('div');
  hint.setAttribute('aria-hidden', 'true');
  hint.dataset.footnoteHint = 'true'; // selector used by cleanup() to remove on navigation
  hint.style.cssText = [
    'position: fixed',
    'left: 1.5rem',
    'bottom: 3rem',
    'font-family: var(--font-mono)',
    'font-size: 0.65rem',
    'color: var(--meta)',
    'letter-spacing: 0.05em',
    'opacity: 0',
    'pointer-events: none',
    'z-index: 10',
  ].join(';');
  hint.textContent = 'footnotes reveal as you re-read';
  document.body.appendChild(hint);

  // Mark as shown before animating — prevents double-fire on rapid scroll
  sessionStorage.setItem(HINT_KEY, '1');

  const tl = gsap.timeline({
    onComplete: () => {
      hint.remove();
    },
  });
  tl.to(hint, { opacity: 1, duration: 0.25, ease: 'none' })
    .to(hint, { opacity: 1, duration: 2 })
    .to(hint, { opacity: 0, duration: 0.25, ease: 'none' });

  instances.push(tl);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  const marginEl = document.getElementById('footnote-margin');
  if (!marginEl) return; // not a long-form page, or no footnotes on this page

  // Gate: under reduced motion or coarse pointer, footnotes are always visible
  if (REDUCED_MOTION || COARSE_POINTER) {
    marginEl.style.opacity = '1';
    return;
  }

  // Scroll-direction detection via ScrollTrigger onUpdate velocity
  const trigger = ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const velocity = self.getVelocity();

      if (velocity < 0) {
        // Reverse scroll — reveal footnotes
        showHint();
        const tween = gsap.to(marginEl, {
          opacity: 1,
          duration: 0.25,
          ease: 'none',
          overwrite: true,
        });
        instances.push(tween);
      } else if (velocity > 0) {
        // Forward scroll — hide footnotes
        const tween = gsap.to(marginEl, {
          opacity: 0,
          duration: 0.25,
          ease: 'none',
          overwrite: true,
        });
        instances.push(tween);
      }
    },
  });
  instances.push(trigger);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:after-swap', init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
```

### Gate Behavior — Make Visible Pattern

When `REDUCED_MOTION || COARSE_POINTER` is true, the script must make `#footnote-margin` visible immediately. The CSS in `typography.css` sets `opacity: 0` on `#footnote-margin` by default (with a `prefers-reduced-motion` media query that sets `opacity: 1 !important`). The `COARSE_POINTER` case is not covered by CSS — the JS gate must handle it:

```typescript
if (REDUCED_MOTION || COARSE_POINTER) {
  marginEl.style.opacity = '1';
  return;
}
```

This inline style overrides the CSS `opacity: 0`. It is intentional and correct. Do NOT add a CSS rule for `pointer: coarse` — the JS gate is the correct mechanism per the architecture's feature gate matrix.

**Important:** The `prefers-reduced-motion` CSS media query in `typography.css` already sets `opacity: 1 !important` for reduced-motion users. The JS gate is belt-and-suspenders for reduced-motion AND the primary mechanism for coarse-pointer users.

### Hint Element — Positioning and Styling

The hint is positioned `fixed` at the bottom-left of the viewport, near the spine column. This matches UX-DR6: "fades in near the spine." The spine is the leftmost column on desktop (40px wide, at `left: 0`). `left: 1.5rem` places the hint just inside the spine area.

**Why inject via JS, not Astro template?** The hint is a one-time, session-gated UI element that only appears on first reverse-scroll. It has no meaningful static state. Injecting it via JS keeps the Astro templates clean and avoids rendering a hidden element on every page load. The hint element does not exist in the DOM until `showHint()` is called.

**Accessibility:** `aria-hidden="true"` is correct — the hint is decorative/supplementary. Screen readers already have access to the footnotes via the `<aside aria-label="Footnotes">` landmark. The hint is a visual affordance for sighted users only.

**Cleanup:** The hint element is removed from the DOM in the `onComplete` callback of the GSAP timeline. If navigation happens while the hint is animating, `cleanup()` kills the timeline (via `instances[]`) and removes the hint element via `document.querySelector('[data-footnote-hint]')?.remove()`. The `data-footnote-hint` attribute on the element is what makes this selector work — it is set in `showHint()` via `hint.dataset.footnoteHint = 'true'`.

### ScrollTrigger Velocity Detection — Why `onUpdate` + `getVelocity()`

The AC specifies "reverse scroll detected via ScrollTrigger." The correct pattern is a ScrollTrigger with `onUpdate` that reads `self.getVelocity()`:

- `getVelocity()` returns pixels/second — negative = scrolling up, positive = scrolling down, 0 = stopped
- `onUpdate` fires on every scroll tick while the trigger is active
- `start: 'top top', end: 'bottom bottom'` covers the full page scroll range

**Why not `onEnterBack` / `onLeave`?** Those fire on trigger boundary crossings, not on continuous scroll direction. The footnote reveal needs to respond to any reverse scroll anywhere on the page, not just at a specific scroll position.

**Why not a `scroll` event listener?** ScrollTrigger's `onUpdate` is already integrated with GSAP's ticker and the normalizeScroll damping from `scroll.ts`. Using a raw `scroll` event listener would bypass the damped scroll normalization and could produce jittery behavior.

**Velocity threshold:** `velocity < 0` for reverse, `velocity > 0` for forward. No threshold needed — any reverse scroll should reveal footnotes. The `overwrite: true` on `gsap.to()` prevents tween stacking if the user rapidly alternates scroll direction.

**No `trigger` element:** `ScrollTrigger.create({ start: 'top top', end: 'bottom bottom', onUpdate: ... })` without a `trigger` element attaches to the scroller (window) by default. This is correct — the goal is to detect scroll direction anywhere on the page, not at a specific element boundary.

### `overwrite: true` on `gsap.to()`

Both the reveal and hide tweens use `overwrite: true`. This kills any in-progress tween on `marginEl` before starting the new one. Without this, rapid direction changes would stack tweens and produce incorrect opacity values.

### `instances[]` Array — Tween Accumulation

The `onUpdate` callback fires on every scroll tick. Each call to `gsap.to()` pushes a new tween to `instances[]`. Over a long scroll session, `instances[]` could accumulate many completed tweens. This is acceptable for MVP — completed tweens are lightweight objects. The array is cleared on `cleanup()` (navigation), which is the correct lifecycle boundary.

If this becomes a concern in a future story, a pattern like `instances = instances.filter(i => !i.progress || i.progress() < 1)` could prune completed tweens. Do NOT add this optimization now — it is not required.

**Note:** `overwrite: true` means GSAP kills the previous tween on `marginEl` before starting the new one. The old tween object in `instances[]` is already dead (killed by GSAP). The array accumulates dead references, not live tweens — making the accumulation even more benign than it appears.

### `sessionStorage` Key — Per-Page Scoping

`HINT_KEY = \`footnote-hint-shown-${window.location.pathname}\`` scopes the hint to the current page path. This means:
- Visiting `/projects/building-lincie` and reverse-scrolling → hint fires, key set for that path
- Navigating to `/writing/craft-as-proof` → hint fires again (different path, different key)
- Returning to `/projects/building-lincie` in the same session → hint does NOT fire (key already set)

This matches UX-DR6: "Never repeats per session" (per page, per session).

### Loading `footnotes.ts` in Page Templates

Both long-form page templates already have a `<script>` block that imports `scroll.ts`. Add `footnotes.ts` to the same block:

**`src/pages/projects/[...slug].astro`** (existing `<script>` block at bottom):
```astro
<script>
  import "../../scripts/scroll";
  import "../../scripts/footnotes";
</script>
```

**`src/pages/writing/[...slug].astro`** (existing `<script>` block at bottom — `scroll.ts` is already there):
```astro
<script>
  import "../../scripts/scroll";
  import "../../scripts/footnotes";
</script>
```

Vite deduplicates the `gsap-init.ts` import — both `scroll.ts` and `footnotes.ts` import from it, but only one copy of GSAP ships.

### Interaction with `FootnoteReveal.astro` — Timing

`FootnoteReveal.astro` moves footnote `<li>` items into `#footnote-margin` on `astro:page-load`. `footnotes.ts` initializes on `astro:after-swap` (and on initial module execution). The timing is:

1. `astro:after-swap` fires → `footnotes.ts` `init()` runs → queries `#footnote-margin`
2. `astro:page-load` fires → `FootnoteReveal.astro` script moves `<li>` items into `#footnote-margin`

`#footnote-margin` exists in the DOM at step 1 (it's part of `FootnoteReveal.astro`'s static markup). The `<li>` items are not yet present, but `footnotes.ts` only animates the container's `opacity` — it does not depend on the `<li>` items being present. This ordering is safe.

**On pages with no footnotes:** `FootnoteReveal.astro` guards with `if (!footnoteSection || !marginContainer) return;`. `footnotes.ts` guards with `if (!marginEl) return;`. Both handle the no-footnotes case cleanly.

### Interaction with `scroll.ts` — No Conflicts

`scroll.ts` and `footnotes.ts` are independent modules. They share:
- The same `gsap-init.ts` import (deduplicated by Vite)
- The same `REDUCED_MOTION` and `COARSE_POINTER` constants (imported, not shared state)
- The same lifecycle event names (`astro:before-swap`, `astro:after-swap`)

They do NOT share:
- Instance arrays (each has its own `instances[]`)
- DOM targets (`scroll.ts` targets `[data-prose-body]` children; `footnotes.ts` targets `#footnote-margin`)
- ScrollTrigger instances (independent)

No coordination between the two files is needed.

### Feature Gate Matrix for `footnotes.ts`

| Gate | Condition | Behavior |
|---|---|---|
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | `opacity: 1` immediately — footnotes always visible |
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | `opacity: 1` immediately — footnotes always visible |
| Desktop width | `window.innerWidth >= 768` | **NOT a gate** — `#footnote-margin` is `hidden md:block` via Tailwind; on mobile the aside is hidden by CSS, so `document.getElementById('footnote-margin')` returns the element but it's not visible. The `if (!marginEl) return;` guard handles pages without footnotes; the CSS handles mobile visibility. |

**Note on mobile:** On mobile, `FootnoteReveal.astro` does not move footnotes (it gates on `window.matchMedia('(min-width: 768px)').matches`). The `<aside>` with `#footnote-margin` is `hidden md:block` — invisible on mobile. `footnotes.ts` will find `#footnote-margin` in the DOM but it's CSS-hidden. Setting `opacity: 1` on a `display: none` element is harmless. The footnotes are visible on mobile via `section[data-footnotes]` in the content column (always visible, per Story 2.3 AC #2).

### Architecture Compliance — Critical Rules

| Rule | Requirement |
|---|---|
| Import GSAP | Only from `./gsap-init` — never from `'gsap'` directly |
| Gate constants | Import `REDUCED_MOTION` and `COARSE_POINTER` from `./gsap-init` — never re-evaluate |
| Instance cleanup | Every GSAP tween and ScrollTrigger instance pushed to `instances[]`, killed in `cleanup()` |
| No new dependencies | `package.json` is frozen — do not add any package |
| Lifecycle hooks | `astro:before-swap` → cleanup, `astro:after-swap` → init |
| New file, not extension | Create `footnotes.ts` — do NOT add to `scroll.ts` |
| Animation properties | `opacity` only — no transform, no filter, no layout properties |
| Duration | `0.25` seconds = `--dur-quick` adjacent (250ms, between `--dur-quick` 150ms and `--dur-breath` 400ms) — matches the spec's "~250ms" |

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `gsap-init.ts` with `ScrollTrigger` registered | `src/scripts/gsap-init.ts` | Do NOT call `gsap.registerPlugin(ScrollTrigger)` again |
| `REDUCED_MOTION` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `COARSE_POINTER` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `#footnote-margin` with `opacity: 0` | `src/styles/typography.css` + `src/components/content/FootnoteReveal.astro` | The container exists; `footnotes.ts` animates its opacity |
| `prefers-reduced-motion` CSS rule for `#footnote-margin` | `src/styles/typography.css` | `opacity: 1 !important` under reduced-motion — JS gate is belt-and-suspenders |
| `FootnoteReveal.astro` DOM move script | `src/components/content/FootnoteReveal.astro` | Moves `<li>` items on `astro:page-load` — do NOT touch this file |
| `<script>` tags in project and essay pages | Both `[...slug].astro` files | Already import `scroll.ts` — add `footnotes.ts` alongside |
| `astro:before-swap` / `astro:after-swap` pattern | `src/scripts/scroll.ts` | Follow the same pattern — do NOT share listeners |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/scripts/footnotes.ts` | Reverse-scroll detection, opacity toggle, one-time hint |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/pages/projects/[...slug].astro` | Add `import '../../scripts/footnotes';` to existing `<script>` block |
| `src/pages/writing/[...slug].astro` | Add `import '../../scripts/footnotes';` to existing `<script>` block |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/scroll.ts` — unrelated; do NOT add footnote logic here
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/components/content/FootnoteReveal.astro` — do NOT modify; it owns the DOM move
- `src/styles/typography.css` — do NOT modify; `opacity: 0` and reduced-motion rule are correct as-is
- `src/styles/global.css` — no CSS changes needed for this story
- `src/layouts/BaseLayout.astro` — do NOT add footnote logic here

### A11y Interaction Checklist

- [ ] Under `prefers-reduced-motion`, footnotes are always visible — no animation, no opacity toggle
- [ ] Under `pointer: coarse`, footnotes are always visible — no reveal behavior
- [ ] The hint element has `aria-hidden="true"` — it is a visual affordance, not content
- [ ] The hint element has `pointer-events: none` — it does not interfere with interaction
- [ ] `#footnote-margin` opacity animation does not affect the accessibility tree — opacity is a visual-only property; screen readers can access `opacity: 0` content
- [ ] The `<aside aria-label="Footnotes">` landmark is always present in the DOM — screen readers can navigate to it regardless of opacity state
- [ ] Keyboard navigation is unaffected — footnote back-links and refs remain focusable at all opacity values

### Cross-Browser Edge Cases

- **Safari + `getVelocity()` + normalizeScroll:** `scroll.ts` uses `ScrollTrigger.normalizeScroll({ momentum: 0.09 })` for damped scroll. `getVelocity()` reads the normalized scroll velocity, not the raw wheel delta. This is correct — the velocity reflects the damped scroll experience, so the footnote reveal responds to the same scroll the user perceives.
- **iOS Safari (mobile):** `COARSE_POINTER` is true on iOS → footnotes always visible → no ScrollTrigger created. No compatibility concern.
- **Firefox + `getVelocity()`:** Supported. No known issues.
- **Rapid direction changes:** `overwrite: true` on both tweens prevents stacking. Tested pattern from Story 4.3.
- **Page with no footnotes (e.g. `building-lincie.md`):** `document.getElementById('footnote-margin')` returns the element (it's in the DOM from `FootnoteReveal.astro`), but `FootnoteReveal.astro` does not move any `<li>` items (no `section[data-footnotes]` exists). The margin container is empty. `footnotes.ts` still runs — it animates an empty container's opacity. This is harmless. The `if (!marginEl) return;` guard only fires if the element is completely absent from the DOM (which won't happen on long-form pages since `FootnoteReveal.astro` always renders the `<aside>`).
- **Very short pages (no scroll):** `ScrollTrigger.create({ start: 'top top', end: 'bottom bottom' })` on a non-scrollable page — the trigger exists but `onUpdate` never fires (no scroll). Footnotes remain at `opacity: 0`. This is correct behavior — if there's no scroll, there's no reverse scroll, so footnotes stay hidden. Acceptable for MVP.

### Previous Story Intelligence (from Story 4.3)

- The `instances[]` + `cleanup()` pattern is established and proven. Follow it exactly.
- `overwrite: true` on `gsap.to()` is the correct pattern for tweens that may be interrupted by rapid user interaction.
- `REDUCED_MOTION` and `COARSE_POINTER` are imported from `gsap-init.ts` — never re-evaluated.
- `bun run format && bun run lint && bun run check` passed cleanly in Stories 4.1–4.3. Expect the same here.
- The `void gsap.to()` pattern is NOT used in this project — do not add `void` prefix to GSAP calls.
- `document.fonts.ready.then(...)` wrapping `ScrollTrigger.refresh()` is in `scroll.ts`. `footnotes.ts` does NOT need a `ScrollTrigger.refresh()` call — the footnote reveal trigger covers the full page and does not depend on font metrics.

### Deferred Work Owned by This Story

From `deferred-work.md`:
- **`opacity: 0` on `#footnote-margin` with no fallback** — this story ships the reveal animation, resolving the deferred item. After this story, `#footnote-margin` is revealed on reverse scroll (or always visible under gates).
- **Footnote vertical alignment is approximate** — `padding-top: calc(var(--baseline) * 4)` aligns the container. Per-footnote positioning (aligning each footnote next to its reference) was deferred to this story. **However**, the AC does not specify per-footnote positioning — it specifies container-level opacity toggle. Per-footnote GSAP positioning is NOT in scope for this story. Do NOT implement it. The deferred item remains deferred.

### GSAP Budget Impact

`gsap.to()` and `gsap.timeline()` are part of the already-imported GSAP core (~28KB gzip, already counted). `ScrollTrigger` is already imported. No additional GSAP code is needed. This story adds ~0.8–1.2KB of site script.

Current budget: ~45.5KB gzip (from Story 4.3 estimate). After this story: ~46.5KB. Budget ceiling: 60KB. Comfortable headroom for Epic 5.

### References

- [FR-12] — Reverse-scroll footnote reveal: footnotes hidden by default on desktop. Forward scroll keeps hidden; reverse scroll fades them in (~250ms). One-time monospace hint on first reverse-scroll per session. Under prefers-reduced-motion or pointer: coarse, footnotes always visible.
- [UX-DR6] — One-time reverse-scroll hint: "footnotes reveal as you re-read" fades in near the spine, holds ~2 seconds, fades out. Never repeats per session.
- [Architecture: Feature Gate Matrix] — `footnotes.ts` gates on `REDUCED_MOTION` and `COARSE_POINTER`
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading, sessionStorage for one-shot behaviors
- [Architecture: FR-12 mapping] — `FootnoteReveal.astro` + `footnotes.ts`
- [Architecture: GSAP Patterns] — `opacity` only; `duration: 0.25` ≈ `--dur-quick` adjacent (250ms)
- [Story 2.3 Dev Notes] — `#footnote-margin` opacity: 0 initial state; Story 4.4 owns the reveal animation
- [deferred-work.md] — `opacity: 0` on `#footnote-margin` deferred to this story

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_none_

### Completion Notes List

- Created `src/scripts/footnotes.ts` following the established gate+cleanup lifecycle pattern from Stories 4.1–4.3.
- Imports `gsap`, `ScrollTrigger`, `REDUCED_MOTION`, and `COARSE_POINTER` from `./gsap-init` — no direct GSAP imports.
- `instances[]` array tracks all GSAP tweens, timelines, and ScrollTrigger instances; `cleanup()` kills all and resets the array on `astro:before-swap`.
- Dual gate: `REDUCED_MOTION || COARSE_POINTER` → sets `marginEl.style.opacity = '1'` and returns early; no ScrollTrigger created.
- `ScrollTrigger.create({ start: 'top top', end: 'bottom bottom', onUpdate })` covers full page scroll range; `self.getVelocity()` detects direction (negative = reverse, positive = forward).
- Both reveal and hide tweens use `overwrite: true` to prevent stacking on rapid direction changes.
- `showHint()` injects a fixed-position monospace hint element, marks `sessionStorage` before animating (prevents double-fire), runs a 0.25s fade-in → 2s hold → 0.25s fade-out timeline, removes element in `onComplete`. Cleanup removes it via `[data-footnote-hint]` selector if navigation interrupts.
- `HINT_KEY` is scoped per page path — hint fires once per page per session.
- Added `import '../../scripts/footnotes';` to the existing `<script>` block in both `src/pages/projects/[...slug].astro` and `src/pages/writing/[...slug].astro` (no second `<script>` block created).
- `bun run format && bun run lint && bun run check` all passed with 0 errors, 0 warnings.

### File List

- `src/scripts/footnotes.ts` (created)
- `src/pages/projects/[...slug].astro` (modified — added footnotes import)
- `src/pages/writing/[...slug].astro` (modified — added footnotes import)

### Change Log

- 2026-05-23: Story 4.4 created — reverse-scroll footnote reveal with one-time hint.
- 2026-05-23: Story 4.4 implemented — `footnotes.ts` created; loaded in both long-form page templates; all ACs satisfied; validation gate passed.
- 2026-05-23: Story 4.4 code review — 2 patch findings, 2 deferred, 9 dismissed.

### Review Findings

- [ ] [Review][Patch] `HINT_KEY` stale after View Transitions — module-level constant captures initial `window.location.pathname`; after Astro View Transitions the pathname changes but `HINT_KEY` still holds the original path, causing per-page hint suppression to break [src/scripts/footnotes.ts:13]
- [ ] [Review][Patch] `instances[]` grows unboundedly during scroll — `onUpdate` fires every animation frame; every frame with non-zero velocity pushes a new (immediately overwritten/dead) tween into `instances[]`, accumulating thousands of dead references on long scroll sessions [src/scripts/footnotes.ts:82-97]
- [x] [Review][Defer] `showHint()` called every reverse-scroll frame — `sessionStorage` guard makes this functionally correct per AC4, but the function is invoked on every `onUpdate` frame where velocity < 0 rather than only on the first; minor inefficiency, not a correctness bug [src/scripts/footnotes.ts:80] — deferred, pre-existing
- [x] [Review][Defer] Aborted View Transition leaves footnotes hidden — `astro:before-swap` fires (cleanup runs) but if `astro:after-swap` never fires (aborted transition), `init()` never runs and footnotes stay hidden until full reload [src/scripts/footnotes.ts:103-104] — deferred, pre-existing pattern across all scripts
