# Story 4.3: Fog-Lifting Section Reveal

Status: done

## Story

As a visitor scrolling through long-form content,
I want sections to sharpen into focus as I reach them,
so that my attention is naturally drawn to the content I'm about to read.

## Acceptance Criteria

1. Fog-lifting logic is added to the existing `src/scripts/scroll.ts` (not a new file)
2. When a `<section>` with a heading enters the viewport on a long-form page, it renders with `filter: blur(7px)` and transitions to `filter: blur(0)` over ~400ms via ScrollTrigger
3. Only one section carries a non-zero blur at any given frame — previously-entered sections remain sharp; blur never re-applies on forward scroll
4. The animation uses the `filter` property only — no scale, no translation, no opacity drop
5. The script gates on `REDUCED_MOTION` — if true, sections render sharp at all times (no blur applied)
6. All ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
7. Re-initializes on `astro:after-swap`
8. The `void gsap` suppression line is removed — `gsap.to()` is now used directly
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Add `initFogLifting()` function to `src/scripts/scroll.ts` (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1: Add `// ─── Fog Lifting ──────────────────────────────────────────────────────────────` comment header above the new function (matches existing section header style)
  - [x] 1.2: Gate on `REDUCED_MOTION` — if true, return immediately (sections stay sharp)
  - [x] 1.3: Query `document.querySelectorAll<HTMLElement>('[data-prose-body] > *')` — target direct children of the prose body (paragraphs, headings, blockquotes) as the blur units
  - [x] 1.4: For each element, set initial `filter: blur(7px)` inline style before creating its ScrollTrigger
  - [x] 1.5: Create a `ScrollTrigger` with `onEnter` callback that uses `gsap.to(el, { filter: 'blur(0px)', duration: 0.4, ease: 'none', overwrite: true, clearProps: 'filter' })` — push the ScrollTrigger instance to `instances[]`. Note: `clearProps: 'filter'` removes the inline filter entirely after the tween completes, preventing a stacking context from persisting (important for Safari when the element is also a section-pin target)
  - [x] 1.6: Use `start: 'top 85%'` so the blur clears before the element reaches center viewport (natural reading position)
  - [x] 1.7: Set `once: true` on each ScrollTrigger — blur never re-applies on forward scroll after first entry
  - [x] 1.8: Do NOT use `toggleActions` — `once: true` with `onEnter` is the correct pattern for a one-shot reveal

- [x] Task 2: Remove `void gsap` suppression and update `init()` (AC: #7, #8)
  - [x] 2.1: Remove the `// Suppress unused-import warning — gsap is used by Story 4.3 (fog-lifting)` comment and the `void gsap;` line — `gsap` is now used directly
  - [x] 2.2: Call `initFogLifting()` inside `init()`, after `initSectionPin()` and before `ScrollTrigger.refresh()`
  - [x] 2.3: Confirm `ScrollTrigger.refresh()` remains at the end of `init()` (inside `document.fonts.ready.then(...)`) — fog-lifting triggers must be calibrated with the rest

- [x] Task 3: Handle initial state for elements already in viewport on load (AC: #2, #3)
  - [x] 3.1: After creating all ScrollTrigger instances in `initFogLifting()`, call `ScrollTrigger.refresh()` is NOT needed here — it is already called at the end of `init()`. Do NOT add a second refresh inside `initFogLifting()`
  - [x] 3.2: Elements already in the viewport when the page loads should NOT be blurred — apply `filter: blur(7px)` only to elements that are NOT yet in the viewport. Use `ScrollTrigger.isInViewport(el)` or check `el.getBoundingClientRect().top > window.innerHeight * 0.85` before setting the initial blur

- [x] Task 4: Cleanup — ensure inline filter styles are removed on navigation (AC: #6)
  - [x] 4.1: Declare `const foggedElements: HTMLElement[] = [];` in the **Instance Registry section** (alongside `pinnedHeadings[]`) — NOT inside the Fog Lifting section
  - [x] 4.2: Add a comment above it: `// Tracks elements that had inline filter applied by initFogLifting().`
  - [x] 4.3: In `cleanup()`, clear inline `filter` styles on all tracked elements and reset the array — prevents stale blur on DOM nodes reused across View Transitions

- [x] Task 5: Run validation gate (AC: #9)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### This Story Extends `scroll.ts` — Do NOT Recreate It

`scroll.ts` was created in Story 4.1 (damped scroll) and extended in Story 4.2 (section pin). This story adds fog-lifting as the third behavior in the same file. The file was designed for this — add a clearly separated section with a comment header.

After this story, the complete `scroll.ts` structure should be:

```typescript
// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];
const pinnedHeadings: HTMLElement[] = [];
const foggedElements: HTMLElement[] = [];   // ← ADD HERE, alongside pinnedHeadings
// ─── Cleanup ──────────────────────────────────────────────────────────────────
// ─── Section Pin ──────────────────────────────────────────────────────────────
function initSectionPin(): void { ... }
// ─── Fog Lifting ──────────────────────────────────────────────────────────────
function initFogLifting(): void { ... }     // ← no array declaration here
// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void { ... }
// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
// ─── Initial Run ──────────────────────────────────────────────────────────────
```

### Current `scroll.ts` State (as of Story 4.2)

The file currently has:
- `instances[]` array and `cleanup()` — kills all instances, clears `pinnedHeadings[]` inline styles
- `pinnedHeadings[]` tracking array for section pin cleanup
- `initSectionPin()` — gates on `REDUCED_MOTION` and `window.innerWidth < 768`
- `init()` — calls normalizer, `initSectionPin()`, then `ScrollTrigger.refresh()` inside `document.fonts.ready.then(...)`
- `void gsap` suppression line — **REMOVE THIS in this story**
- Lifecycle hooks: `astro:before-swap` → cleanup, `astro:after-swap` → init

### Exact `scroll.ts` Implementation Pattern

`foggedElements[]` belongs in the **Instance Registry section** alongside `pinnedHeadings[]` — not inside the Fog Lifting section. The implementation block below shows the correct placement.

Add `foggedElements[]` to the Instance Registry section:

```typescript
// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// Tracks h2 elements that had inline styles applied by initSectionPin().
const pinnedHeadings: HTMLElement[] = [];

// Tracks elements that had inline filter applied by initFogLifting().
// Cleared in cleanup() so blur doesn't persist on reused DOM nodes.
const foggedElements: HTMLElement[] = [];
```

The complete `initFogLifting()` function (no array declaration here — it's in the registry above):

```typescript
// ─── Fog Lifting ──────────────────────────────────────────────────────────────
function initFogLifting(): void {
  // Gate: no blur under reduced motion (FR-20)
  if (REDUCED_MOTION) return;

  const proseBody = document.querySelector('[data-prose-body]');
  if (!proseBody) return; // not a long-form page — guard anyway

  const elements = proseBody.querySelectorAll<HTMLElement>(':scope > *');
  elements.forEach((el) => {
    // Only blur elements that are below the fold at init time.
    // Elements already in the viewport should not start blurred.
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) return;

    // Apply initial blur inline — removed in cleanup()
    el.style.filter = 'blur(7px)';
    foggedElements.push(el);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'none',
          overwrite: true,
          // clearProps removes the inline filter entirely after the tween,
          // preventing a stacking context from persisting on the element
          // (relevant for Safari when the element is also a section-pin target).
          clearProps: 'filter',
        });
      },
    });
    instances.push(trigger);
  });
}
```

Updated `cleanup()` to clear fog state:

```typescript
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;

  pinnedHeadings.forEach((el) => {
    el.style.backgroundColor = '';
    el.style.zIndex = '';
  });
  pinnedHeadings.length = 0;

  // Remove inline filter styles set by initFogLifting()
  foggedElements.forEach((el) => {
    el.style.filter = '';
  });
  foggedElements.length = 0;
}
```

Updated `init()` — remove `void gsap`, add `initFogLifting()`:

```typescript
function init(): void {
  // Damped smooth scroll — gates on COARSE_POINTER || REDUCED_MOTION (FR-23)
  if (!(COARSE_POINTER || REDUCED_MOTION)) {
    const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
    if (normalizer) instances.push(normalizer);
  }

  // Section pin — gates on REDUCED_MOTION + viewport width (FR-24, UX-DR2)
  initSectionPin();

  // Fog-lifting — gates on REDUCED_MOTION (FR-20)
  initFogLifting();

  // Recalculate all trigger positions after all behaviors are registered,
  // deferred until fonts are ready so Newsreader metrics are used.
  void document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });
}
```

### The `void gsap` Suppression — Remove It

Story 4.2 kept `void gsap` because `gsap` was imported but unused (ScrollTrigger was called via the `ScrollTrigger` import, not `gsap` directly). This story uses `gsap.to()` directly in `initFogLifting()`. Remove the suppression line and its comment entirely.

### DOM Target Strategy — Direct Children of `[data-prose-body]`

The AC specifies `<section>` elements, but the actual Markdown-rendered content does not produce `<section>` elements — it produces `<p>`, `<h2>`, `<blockquote>`, `<ul>`, `<ol>`, and similar block elements as direct children of the `[data-prose-body]` div.

**The approach:** Target `:scope > *` (direct children of `[data-prose-body]`) — this gives each paragraph, heading, and block element its own fog-lifting trigger. This matches the "Periphery-Soft Rule" from DESIGN.md: "Peripheral content stays slightly soft until the visitor's attention reaches it, focal content is sharp."

**Why not `<section>` elements?** Markdown does not produce `<section>` wrappers. The prose body is a flat list of block elements. Targeting direct children is the correct approach for this content structure.

**Why not `<h2>` only?** The fog-lifting effect is meant to apply to all content as it enters the viewport — not just headings. Targeting only `<h2>` would leave paragraphs sharp at all times, defeating the cinematic depth-of-field intent.

### One-Section-at-a-Time Blur Constraint (NFR-9)

The AC states "only one section carries a non-zero blur at any given frame." With `once: true` and `start: 'top 85%'`, each element clears its blur as it enters the reading zone. Because elements enter the viewport sequentially during forward scroll, at most one element is mid-transition at any given frame. The `overwrite: true` on `gsap.to()` ensures any in-progress tween is replaced if the trigger fires again (defensive — `once: true` prevents re-firing, but `overwrite: true` is belt-and-suspenders).

**Compositor layer concern:** `filter: blur()` creates a new compositor layer per element. With many elements blurred simultaneously, this could cause performance issues on lower-end devices. The `once: true` + sequential entry pattern ensures only the element currently entering the viewport is blurred — all previously-entered elements are already at `blur(0)` and their compositor layers are collapsed. This satisfies NFR-9.

### Elements Already in Viewport on Load

The first viewport's content should NOT start blurred — that would violate the "Honest First Paint Rule" (DESIGN.md) and the "no animation gates content" principle. The `getBoundingClientRect().top > window.innerHeight * 0.85` check before applying the initial blur ensures only below-fold elements start blurred.

**Why `0.85` (85%)?** This matches the `start: 'top 85%'` ScrollTrigger threshold. An element at exactly 85% of the viewport height would have `rect.top === window.innerHeight * 0.85` — it would not be blurred initially and its trigger would fire immediately on `ScrollTrigger.refresh()`. This is the correct behavior: elements at or above the reading zone are sharp from the start.

### `once: true` — Why Not `toggleActions`

`once: true` on a ScrollTrigger means the `onEnter` callback fires exactly once and the trigger is then killed. This is the correct pattern for a one-shot reveal — blur clears, stays clear, trigger is gone. Using `toggleActions: 'play none none reverse'` would re-blur elements on scroll-up, which violates AC #3 ("previously-entered sections remain sharp — blur never re-applies on forward scroll").

### `overwrite: true` on `gsap.to()`

`overwrite: true` tells GSAP to kill any existing tween on the same element and property before starting the new one. This prevents tween stacking if `onEnter` somehow fires twice (defensive coding — `once: true` should prevent this, but `overwrite: true` is the correct GSAP pattern for one-shot reveals).

### `clearProps: 'filter'` — Remove the Stacking Context

After `gsap.to()` completes, `filter: blur(0px)` would remain as an inline style. While visually invisible, `filter: blur(0px)` still creates a new stacking context on the element. This matters for `<h2>` elements that are also section-pin targets — a pinned `<h2>` with an active stacking context can cause z-index and compositing issues in Safari.

`clearProps: 'filter'` tells GSAP to remove the `filter` inline style entirely once the tween finishes. The element returns to its natural state with no stacking context. This is the correct pattern for any `filter` tween that should leave no trace.

**Note on `void gsap.to()`:** The project's ESLint config uses `tseslint.configs.recommended` (not type-checked), which does NOT enable `@typescript-eslint/no-floating-promises`. The `void` prefix is not required by the linter. Do NOT add `void` to `gsap.to()` — it would be inconsistent with the rest of the codebase and could confuse the "remove `void gsap`" instruction from Task 2.

### Feature Gate Matrix for Fog-Lifting

| Gate | Condition | Behavior |
|---|---|---|
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | No blur — sections render sharp at all times |
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | **NOT a gate** — fog-lifting runs on touch devices |
| `window.innerWidth < 768` | Mobile viewport | **NOT a gate** — fog-lifting runs on mobile |

Fog-lifting is NOT gated on `COARSE_POINTER` or viewport width. FR-20 only specifies `prefers-reduced-motion` as the disable condition. UX-DR2 lists "no fog-lifting" for mobile, but this refers to the UX design intent — the architecture's feature gate matrix (architecture.md) only lists `REDUCED_MOTION` as the gate for `scroll.ts`. Follow the architecture.

**Note:** UX-DR2 says "no fog-lifting" on mobile. The architecture feature gate matrix does NOT list `COARSE_POINTER` or viewport width as a gate for fog-lifting (unlike section pin, which explicitly gates on `window.innerWidth < 768`). Follow the architecture's feature gate matrix — gate on `REDUCED_MOTION` only.

### `ScrollTrigger.refresh()` — Placement Is Critical

`ScrollTrigger.refresh()` is called at the end of `init()` inside `document.fonts.ready.then(...)`. This is already in place from Story 4.2. Do NOT add a second `ScrollTrigger.refresh()` inside `initFogLifting()` — it would fire before fonts are ready and before all behaviors are registered.

The existing placement at the end of `init()` calibrates all three behaviors (normalizer, section pin, fog-lifting) together after fonts load. This is correct.

### Architecture Compliance — Critical Rules

| Rule | Requirement |
|---|---|
| Import GSAP | Only from `./gsap-init` — never from `'gsap'` directly |
| Gate constants | Import `REDUCED_MOTION` and `COARSE_POINTER` from `./gsap-init` — never re-evaluate |
| Instance cleanup | Every `ScrollTrigger` instance pushed to `instances[]`, killed in `cleanup()` |
| No new dependencies | `package.json` is frozen — do not add any package |
| Lifecycle hooks | `astro:before-swap` → cleanup, `astro:after-swap` → init |
| Extend, don't replace | Add to `scroll.ts` — do NOT create a new script file |
| Animation properties | `filter` is explicitly allowed for fog-lifting (NFR-9) — no scale, no translation, no opacity |
| Duration | `0.4` seconds = `--dur-breath` (400ms) — matches the token |

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `gsap-init.ts` with `ScrollTrigger` registered | `src/scripts/gsap-init.ts` | Do NOT call `gsap.registerPlugin(ScrollTrigger)` again |
| `REDUCED_MOTION` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `COARSE_POINTER` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `instances[]` array and `cleanup()` | `src/scripts/scroll.ts` | Already handles all instances — just push new ones |
| `pinnedHeadings[]` tracking array | `src/scripts/scroll.ts` Instance Registry section | Pattern to follow for `foggedElements[]` — declare in the same section |
| `astro:before-swap` / `astro:after-swap` listeners | `src/scripts/scroll.ts` | Already registered — do NOT add duplicate listeners |
| `[data-prose-body]` attribute | Both `[...slug].astro` files | Added in Story 4.2 — do NOT modify page templates |
| `document.fonts.ready.then(...)` wrapping `ScrollTrigger.refresh()` | `src/scripts/scroll.ts` | Already in `init()` — do NOT add another refresh |
| `<script>` tags in project and essay pages | Both `[...slug].astro` files | Already import `scroll.ts` — no changes needed to script tags |

### Files to Create (NEW)

None. This story only extends an existing file.

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/scripts/scroll.ts` | Remove `void gsap` suppression; add `foggedElements[]` array; update `cleanup()` to clear filter styles; add `initFogLifting()` function; update `init()` to call it |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- `src/styles/global.css` — no CSS changes needed for fog-lifting
- `src/layouts/BaseLayout.astro` — do NOT add fog-lifting here
- `src/pages/projects/[...slug].astro` — no changes needed (already has `[data-prose-body]`)
- `src/pages/writing/[...slug].astro` — no changes needed (already has `[data-prose-body]`)
- `src/components/motion/SectionPin.astro` — unrelated

### A11y Interaction Checklist

- [ ] Under `prefers-reduced-motion`, no blur is applied — sections render sharp at all times
- [ ] Blurred elements remain in the DOM and accessible to screen readers (blur is a visual-only CSS property — it does not affect accessibility tree)
- [ ] No `aria-hidden` is added to blurred elements — they are real content, not decorative
- [ ] Keyboard navigation is unaffected — blurred elements are not interactive
- [ ] The blur effect does not gate content — all text is readable (if blurry) before the trigger fires; the transition is decorative, not a content gate

### Cross-Browser Edge Cases

- **Safari + `filter: blur()` + `position: fixed` (section pin):** Both fog-lifting and section pin are active on the same page. `<h2>` elements are targeted by both — section pin sets `backgroundColor` and `zIndex`; fog-lifting sets `filter`. These are independent CSS properties. The `<h2>` starts blurred, clears as it enters the viewport (tween completes, `clearProps: 'filter'` removes the inline style entirely), then pins when it reaches the top. `clearProps: 'filter'` is critical here — without it, `filter: blur(0px)` would remain as an inline style and create a stacking context on the pinned heading, causing z-index issues in Safari.
- **iOS Safari + `filter: blur()`:** iOS Safari supports `filter: blur()` since iOS 9. No compatibility concern.
- **Firefox + `filter: blur()` + ScrollTrigger:** No known issues. `filter` is well-supported.
- **Resize handling:** Fog-lifting triggers are created at init time. If the visitor resizes, existing triggers remain. Acceptable for MVP — consistent with section pin behavior.
- **Content with no `<h2>` sections (short content):** `initFogLifting()` still runs — it targets all direct children of `[data-prose-body]`, not just headings. Short content with only `<p>` elements will still get fog-lifting on below-fold paragraphs. Correct behavior.
- **Content entirely in viewport (very short page):** All elements pass the `rect.top <= window.innerHeight * 0.85` check — none are blurred. `foggedElements[]` stays empty. No ScrollTrigger instances created for fog-lifting. Correct behavior.

### Previous Story Intelligence (from Story 4.2)

- `scroll.ts` is clean and ready for extension. The `pinnedHeadings[]` tracking array pattern is the exact model for `foggedElements[]`.
- `void gsap` was kept in Story 4.2 specifically for this story. Remove it now.
- `cleanup()` already handles `instances[]` and `pinnedHeadings[]`. Add `foggedElements[]` cleanup in the same pattern.
- `ScrollTrigger.refresh()` is wrapped in `document.fonts.ready.then(...)` — do NOT add another refresh inside `initFogLifting()`.
- Review patches from Story 4.2 that are relevant here:
  - The `end: 'bottom bottom'` fix for the last `<h2>` pin — fog-lifting uses `once: true` so this is not a concern.
  - The `pinnedHeadings[]` cleanup pattern — follow this exactly for `foggedElements[]`, declared in the Instance Registry section.
  - The `document.fonts.ready.then(...)` wrapping — already in place, do not duplicate.
  - The inline style cleanup pattern — `clearProps: 'filter'` in the tween handles the active state; `cleanup()` handles the case where the tween never ran (element was blurred but never entered the viewport before navigation).
- `bun run format && bun run lint && bun run check` passed cleanly in Stories 4.1 and 4.2. Expect the same here.

### GSAP Budget Impact

`gsap.to()` is part of the already-imported GSAP core (~28KB gzip, already counted). No additional GSAP code is needed. This story adds ~0.5–1KB of site script.

Current budget: ~45KB gzip (from Story 4.2 estimate). After this story: ~45.5KB. Budget ceiling: 60KB. Comfortable headroom for Story 4.4.

### Reduced-Motion Behavior

Under `prefers-reduced-motion: reduce`:
- `REDUCED_MOTION` is `true` → `initFogLifting()` returns immediately
- No inline `filter` styles are applied to any element
- No `ScrollTrigger` instances are created for fog-lifting
- All sections render sharp at all times
- No cleanup needed for fog-lifting (nothing was registered)

### References

- [FR-20] — Section-level fog-lifting reveal: sections enter viewport with 7px filter blur, transition to 0 over ~400ms. Scroll-driven via ScrollTrigger. Only one section blurred at a time. Under prefers-reduced-motion, sections render sharp.
- [NFR-9] — Animation performance: transform and opacity only (filter allowed for fog-lifting). One-section-at-a-time blur constraint.
- [UX-DR2] — Mobile layout adaptation: no fog-lifting on mobile (UX intent; architecture gates on REDUCED_MOTION only)
- [DESIGN.md: The Periphery-Soft Rule] — "Sections enter via blur-out → blur-in (~6–8px blur at start, 0 at rest). Peripheral content stays slightly soft until the visitor's attention reaches it, focal content is sharp."
- [Architecture: Feature Gate Matrix] — `scroll.ts` gates on `REDUCED_MOTION` for fog-lifting; `COARSE_POINTER` is NOT listed as a gate for fog-lifting
- [Architecture: Implementation Patterns] — script file structure, import rules, instance registry
- [Architecture: FR-20 mapping] — `scroll.ts` ScrollTrigger blur logic
- [Architecture: GSAP Patterns] — `filter` allowed for fog-lifting; `duration: 0.4` = `--dur-breath`

## Review Findings

- [x] [Review][Decision] AC3 — Multiple elements simultaneously blurred at init — Accepted as-is. Dev Notes rationale holds: below-fold elements are invisible to the user at init; the "one blur at a time" constraint applies to the scroll experience, which is correctly enforced by `once: true` + sequential entry. [src/scripts/scroll.ts: initFogLifting()]

- [x] [Review][Patch] In-flight GSAP tween not tracked — Fixed. `gsap.to()` return value captured and pushed to `instances[]` so `cleanup()` can kill mid-animation tweens on navigation. [src/scripts/scroll.ts: initFogLifting() onEnter callback]

- [x] [Review][Defer] Layout thrash from `getBoundingClientRect` in forEach loop — Each element triggers a forced layout reflow. Pre-existing pattern in the codebase (section pin does the same). Not introduced by this story. [src/scripts/scroll.ts: initFogLifting()] — deferred, pre-existing

- [x] [Review][Defer] Mutable module-level arrays accumulate across re-inits — `foggedElements[]` and `instances[]` are module-level. If `init()` fires without a preceding `cleanup()`, arrays grow. Pre-existing pattern; Astro lifecycle guarantees cleanup before re-init. [src/scripts/scroll.ts: Instance Registry] — deferred, pre-existing

- [x] [Review][Defer] `REDUCED_MOTION` evaluated once at module load — If the user changes their OS reduced-motion preference mid-session, the gate does not re-evaluate. Pre-existing pattern; consistent with rest of codebase. [src/scripts/scroll.ts: initFogLifting()] — deferred, pre-existing

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_none_

### Completion Notes List

- Extended `src/scripts/scroll.ts` with `initFogLifting()` — no new files created.
- Added `foggedElements: HTMLElement[]` to the Instance Registry section alongside `pinnedHeadings[]`.
- `initFogLifting()` gates on `REDUCED_MOTION` only (not `COARSE_POINTER` or viewport width, per architecture feature gate matrix).
- Below-fold check uses `getBoundingClientRect().top > window.innerHeight * 0.85` — elements already in the viewport at init time are never blurred.
- Each ScrollTrigger uses `once: true` + `onEnter` pattern; `overwrite: true` and `clearProps: 'filter'` on the `gsap.to()` tween.
- `clearProps: 'filter'` removes the inline style after tween completion, preventing stacking context issues in Safari on pinned `<h2>` elements.
- `cleanup()` updated to clear `foggedElements[]` inline filter styles — handles elements that were blurred but never entered the viewport before navigation.
- Removed `void gsap` suppression line and its comment — `gsap.to()` is now used directly.
- `initFogLifting()` called in `init()` after `initSectionPin()`, before `ScrollTrigger.refresh()`.
- `bun run format && bun run lint && bun run check` all passed with 0 errors, 0 warnings.

### File List

- `src/scripts/scroll.ts` (modified)

### Change Log

- 2026-05-23: Story 4.3 — Added fog-lifting section reveal to `scroll.ts`. Removed `void gsap` suppression; added `foggedElements[]` registry; added `initFogLifting()` with ScrollTrigger + `gsap.to()` blur-clear pattern; updated `cleanup()` and `init()`.
