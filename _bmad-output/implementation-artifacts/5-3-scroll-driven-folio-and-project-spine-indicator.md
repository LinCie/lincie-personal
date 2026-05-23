# Story 5.3: Scroll-Driven Folio & Project Spine Indicator

Status: done

## Story

As a visitor reading a long page,
I want the folio to track my scroll position and the project spine dot to show where I am,
so that I have ambient awareness of my progress without looking away from the content.

## Acceptance Criteria

1. The BR folio updates fractionally as a zero-padded `NNN / TTT` value where NNN is scroll-percentage-derived and TTT reflects the count of major `<h2>` sections (or `001` on pages with no `<h2>`)
2. Folio updates are debounced to ~60fps (via `requestAnimationFrame` or ScrollTrigger's `onUpdate`)
3. The folio never animates digits — it snaps to the new value
4. On a single-viewport route (no scroll), the folio shows `001 / 001`
5. On a project page, a small dot on the spine moves down the hairline as the visitor scrolls, driven by ScrollTrigger
6. The spine dot is decorative (`aria-hidden="true"` on the spine container, which already exists)
7. All ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
8. Re-initializes on `astro:after-swap`
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/frame/Folio.astro` (AC: #1, #3, #4)
  - [x] 1.1: Add file header comment: `<!-- src/components/frame/Folio.astro -->`
  - [x] 1.2: Render a `<span>` with `data-frame="folio"` attribute (the JS target selector)
  - [x] 1.3: Set static fallback text `001 / 001`
  - [x] 1.4: Match the exact classes from the existing BR span in `Frame.astro`: `aria-hidden="true"`, `data-reveal="corner"`, `class="text-meta fixed right-7 bottom-7 z-50 font-mono text-[0.75rem] leading-none tracking-widest uppercase"`

- [x] Task 2: Update `src/components/frame/Frame.astro` to use `Folio.astro` (AC: #1)
  - [x] 2.1: Import `Folio` from `./Folio.astro`
  - [x] 2.2: Replace the existing BR `<span>` (the one with static `001 / 001`) with `<Folio />`
  - [x] 2.3: Verify the rendered HTML is identical to the current BR span — same classes, same `aria-hidden`, same `data-reveal`, same `data-frame` attribute

- [x] Task 3: Add a scroll indicator dot to `src/components/content/ProjectSpine.astro` (AC: #5, #6)
  - [x] 3.1: Add a `<div>` with `data-spine="dot"` inside the spine container, positioned absolutely on the hairline
  - [x] 3.2: Style the dot: `absolute left-[-2px] w-[5px] h-[5px] rounded-full bg-ink` (centered on the hairline, starts at top)
  - [x] 3.3: Set initial `top: 0%` via inline style — JS will update this via `style.top`
  - [x] 3.4: Confirm the outer `<div aria-hidden="true">` already covers the dot (it does — no change needed)

- [x] Task 4: Add folio + spine scroll logic to `src/scripts/scroll.ts` (AC: #1, #2, #3, #4, #5, #7, #8)
  - [x] 4.1: Implement `initFolio()` — queries `[data-frame="folio"]`, counts `<h2>` elements in `[data-prose-body]` (or `document.querySelectorAll('h2')` on non-long-form pages), computes TTT, sets up a ScrollTrigger `onUpdate` callback that snaps NNN and updates `element.textContent`
  - [x] 4.2: Folio NNN formula inside `onUpdate`: `Math.max(1, Math.round(self.progress * total))` — zero-pad to 3 digits with `String(n).padStart(3, '0')`. See `initFolio()` code example in Dev Notes.
  - [x] 4.3: On single-viewport pages (no scroll depth), folio stays `001 / TTT` — guard with `document.body.scrollHeight <= window.innerHeight + 1`
  - [x] 4.4: Implement `initSpineDot()` — queries `[data-spine="dot"]`, creates a ScrollTrigger that updates `dot.style.top` as a percentage of scroll progress (0% → 100%)
  - [x] 4.5: `initSpineDot()` guards on `[data-spine="dot"]` not existing — `if (!dot) return`. This is the correct guard. Do NOT add a `[data-prose-body]` guard — that attribute exists on both project AND essay pages, so it would not correctly limit the function to project pages. The dot's absence from the DOM is the right signal.
  - [x] 4.6: Register all new ScrollTrigger instances in `instances[]` for cleanup
  - [x] 4.7: Call `initFolio()` and `initSpineDot()` from `init()` (after existing calls)

- [x] Task 5: Run validation gate (AC: #9)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### Architecture: Three-Part Implementation

This story touches three files and creates two new ones:

| File | Action | Purpose |
|---|---|---|
| `src/components/frame/Folio.astro` | **CREATE** | BR corner DOM element with `data-frame="folio"` |
| `src/components/frame/Frame.astro` | **UPDATE** | Replace BR `<span>` with `<Folio />` |
| `src/components/content/ProjectSpine.astro` | **UPDATE** | Add `data-spine="dot"` element |
| `src/scripts/scroll.ts` | **UPDATE** | Add `initFolio()` and `initSpineDot()` |

The architecture document lists `src/components/frame/Folio.astro` explicitly as a planned component (same split pattern as `LocalTime.astro`). Follow the same two-part pattern: component for DOM, script for behavior.

### Current State of Frame.astro — BR Span to Extract

The BR corner is currently a plain `<span>` with static text `001 / 001`:

```astro
<!-- BR: Folio — always visible, aria-hidden (decorative) -->
<span
  aria-hidden="true"
  data-reveal="corner"
  class="text-meta fixed right-7 bottom-7 z-50 font-mono text-[0.75rem] leading-none tracking-widest uppercase"
>
  001 / 001
</span>
```

Extract this into `Folio.astro` and add `data-frame="folio"` as the JS selector target. The rendered HTML must be identical — same classes, same attributes.

**CRITICAL — `data-reveal="corner"` on the BR span:** Story 5.2 Dev Notes documented that the BR folio span "intentionally does NOT have `data-reveal="corner"`" (always visible), but the actual code in `Frame.astro` **does have `data-reveal="corner"`** on the BR span. This was flagged as a pre-existing discrepancy in the Story 5.2 review findings. When creating `Folio.astro`, **preserve `data-reveal="corner"` exactly as it exists in the current code** — do not remove it. The discrepancy is pre-existing and out of scope for this story.

### Complete `Folio.astro` Structure

```astro
---
// src/components/frame/Folio.astro
// BR corner label — scroll-driven folio.
// Static fallback: "001 / 001". Updated by scroll.ts initFolio().
---

<!-- BR: Folio — aria-hidden (decorative) -->
<span
  aria-hidden="true"
  data-frame="folio"
  data-reveal="corner"
  class="text-meta fixed right-7 bottom-7 z-50 font-mono text-[0.75rem] leading-none tracking-widest uppercase"
>
  001 / 001
</span>
```

### `initFolio()` — Implementation Details

```typescript
function initFolio(): void {
  const el = document.querySelector<HTMLElement>('[data-frame="folio"]');
  if (!el) return;

  // Count h2 headings for TTT — on long-form pages use prose body scope,
  // on other pages count all h2s (home page has none → TTT = 1).
  const proseBody = document.querySelector('[data-prose-body]');
  const h2s = proseBody
    ? proseBody.querySelectorAll('h2')
    : document.querySelectorAll('h2');
  const total = Math.max(1, h2s.length);
  const ttt = String(total).padStart(3, '0');

  // Single-viewport guard: no scroll depth → always 001 / TTT
  if (document.body.scrollHeight <= window.innerHeight + 1) {
    el.textContent = `001 / ${ttt}`;
    return;
  }

  const trigger = ScrollTrigger.create({
    id: 'folio-progress',
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const nnn = Math.max(1, Math.round(self.progress * total));
      el.textContent = `${String(nnn).padStart(3, '0')} / ${ttt}`;
    },
  });
  instances.push(trigger);
}
```

**Key details:**
- `ScrollTrigger.create` with `onUpdate` fires on every scroll tick — already debounced to rAF by GSAP internally (~60fps)
- `Math.max(1, ...)` ensures NNN never shows `000`
- `Math.round(progress * total)` maps 0–1 scroll progress to 1–TTT section steps
- `document.body.scrollHeight <= window.innerHeight + 1` is the single-viewport guard (the `+1` handles sub-pixel rounding)
- No `REDUCED_MOTION` gate — folio is information, not motion (same reasoning as `local-time.ts`)
- No `COARSE_POINTER` gate — folio runs on all devices

### `initSpineDot()` — Implementation Details

```typescript
function initSpineDot(): void {
  const dot = document.querySelector<HTMLElement>('[data-spine="dot"]');
  if (!dot) return; // no spine on this page (essay pages, home, 404) — guard

  // NOTE: Do NOT guard on [data-prose-body] — that attribute exists on BOTH
  // project AND essay pages. The dot's absence from the DOM is the correct guard.

  const trigger = ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      dot.style.top = `${self.progress * 100}%`;
    },
  });
  instances.push(trigger);
}
```

**Key details:**
- `dot.style.top` is a percentage of the spine container height — the spine container is `relative h-full`, so `top: 0%` = top of spine, `top: 100%` = bottom
- No `REDUCED_MOTION` gate — position indicator is information, not motion
- Guard `if (!dot) return` is the correct guard. `[data-prose-body]` exists on both project AND essay pages — do NOT use it as a guard here. The dot only exists in the DOM on project pages (essay pages have no `ProjectSpine.astro`).

### `ProjectSpine.astro` — Dot Addition

Add the dot element inside the existing `<div aria-hidden="true" class="relative h-full w-px">`:

```astro
<div aria-hidden="true" class="relative h-full w-px">
  <!-- Vertical hairline -->
  <div class="bg-hairline absolute inset-y-0 left-0 w-px"></div>

  <!-- Tick marks at each h2 — evenly distributed -->
  {
    h2Headings.map((_, i) => (
      <div
        class="bg-hairline absolute left-0 h-px w-2"
        style={`top: ${((i + 1) / (h2Headings.length + 1)) * 100}%`}
      />
    ))
  }

  <!-- Scroll indicator dot — position updated by scroll.ts initSpineDot() -->
  <div
    data-spine="dot"
    class="bg-ink absolute left-[-2px] h-[5px] w-[5px] rounded-full"
    style="top: 0%"
  />
</div>
```

The outer `<div aria-hidden="true">` already covers the dot — no additional `aria-hidden` needed on the dot itself.

### Where to Call `initFolio()` and `initSpineDot()` in `scroll.ts`

Add both calls at the end of `init()`, after the existing `initSectionPin()` and `initFogLifting()` calls:

```typescript
function init(): void {
  // Damped smooth scroll
  if (!(COARSE_POINTER || REDUCED_MOTION)) {
    const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
    if (normalizer) instances.push(normalizer);
  }

  initSectionPin();
  initFogLifting();
  initFolio();      // ← ADD
  initSpineDot();   // ← ADD

  void document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });
}
```

### `transition:persist` Scope — Frame Covers Folio

`BaseLayout.astro` renders `<Frame ... transition:persist />`. The entire Frame component (including the `Folio.astro` span) persists across View Transitions. `Folio.astro` does NOT need its own `transition:persist` — it inherits from the parent `<Frame>`.

This means `initFolio()` must re-run on `astro:after-swap` to recalculate TTT for the new page's headings and re-attach the ScrollTrigger. The existing `cleanup()` + `init()` lifecycle in `scroll.ts` already handles this correctly.

### `scroll.ts` is Loaded Only on Long-Form Pages

`scroll.ts` is imported in `src/pages/projects/[...slug].astro` and `src/pages/writing/[...slug].astro` via `<script>`. It is NOT loaded in `BaseLayout.astro`.

**Implication for folio:** The folio element (`[data-frame="folio"]`) exists on every page (it's in `Frame.astro` which is in `BaseLayout`), but `initFolio()` only runs on project/essay pages. On the home page and 404, the folio stays at the static `001 / 001` fallback — this is correct behavior per the spec ("on a single-viewport route, shows 001 / 001").

**Wait — this is a problem for the home page.** The home page has no `scroll.ts` loaded, so `initFolio()` never runs there. The static `001 / 001` is the correct display for single-viewport pages. No fix needed.

### `data-frame="folio"` — Why This Selector

The architecture uses `data-frame` attributes as JS hooks on Frame elements (established by `local-time.ts` using `data-frame="local-time"`). Use `data-frame="folio"` as the selector in `initFolio()`. Do NOT use `getElementById` — the element has no `id`.

### Cleanup — What Gets Cleaned

The existing `cleanup()` function in `scroll.ts` kills all instances in `instances[]`. The new ScrollTrigger instances from `initFolio()` and `initSpineDot()` are pushed to `instances[]`, so they are automatically killed on `astro:before-swap`. No additional cleanup code needed.

The folio `textContent` is NOT reset on cleanup — the persisted element retains its last value across navigations. On `astro:after-swap`, `initFolio()` re-runs and immediately recalculates the correct value for the new page. This prevents a flash of `001 / 001` on navigation.

**Edge case — navigating from a long-form page to the home page:** When a visitor navigates from a project/essay page to the home page, `cleanup()` fires and kills the ScrollTrigger, but `init()` does NOT re-run on the home page (because `scroll.ts` is not loaded there). The folio retains whatever `NNN / TTT` value it had. This is acceptable — the home page is single-viewport and the static `001 / 001` is only the initial render value. Do NOT try to "fix" this by adding folio logic to `BaseLayout.astro`. The retained value is harmless and the spec does not require the folio to reset on home page navigation.

The spine dot `style.top` IS effectively reset because the `ProjectSpine.astro` component is re-rendered on each project page navigation (it is not `transition:persist`). The new page's spine renders a fresh dot at `top: 0%`.

### Feature Gate Matrix for New Behaviors

| Behavior | `REDUCED_MOTION` | `COARSE_POINTER` | Rationale |
|---|---|---|---|
| `initFolio()` | **NOT gated** | **NOT gated** | Folio is information, not motion |
| `initSpineDot()` | **NOT gated** | **NOT gated** | Position indicator is information, not motion |

### Side-Effect Cleanup Documentation

| Side Effect | Introduced by | Cleaned up by |
|---|---|---|
| ScrollTrigger `folio-progress` | `initFolio()` | `cleanup()` via `instances[]` |
| ScrollTrigger (spine dot) | `initSpineDot()` | `cleanup()` via `instances[]` |
| `el.textContent` update | `initFolio()` onUpdate | NOT cleaned — intentional (retains last value) |
| `dot.style.top` update | `initSpineDot()` onUpdate | NOT cleaned — spine re-renders on navigation |

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| BR `<span>` with static `001 / 001` | `src/components/frame/Frame.astro` | Extract into `Folio.astro`; do NOT duplicate |
| `instances[]` + `cleanup()` pattern | `src/scripts/scroll.ts` | Push new triggers to existing array |
| `pinnedHeadings[]` + `foggedElements[]` arrays | `src/scripts/scroll.ts` | **Preserve these** — used by `initSectionPin()` and `initFogLifting()` cleanup; do NOT remove or rename |
| `[data-prose-body]` attribute | `src/pages/projects/[...slug].astro` AND `src/pages/writing/[...slug].astro` | Present on BOTH page types — do NOT use as a project-only guard |
| `ProjectSpine.astro` with `aria-hidden` | `src/components/content/ProjectSpine.astro` | Add dot inside existing container |
| `scroll.ts` lifecycle hooks | `src/scripts/scroll.ts` | `initFolio()` and `initSpineDot()` are called from existing `init()` |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/components/frame/Folio.astro` | BR corner DOM element with `data-frame="folio"` |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/components/frame/Frame.astro` | Replace BR `<span>` with `<Folio />` import |
| `src/components/content/ProjectSpine.astro` | Add `data-spine="dot"` element inside existing container |
| `src/scripts/scroll.ts` | Add `initFolio()` and `initSpineDot()` functions; call from `init()` |

### Files to NOT Touch

- `src/styles/global.css` — no CSS changes needed
- `src/layouts/BaseLayout.astro` — no changes needed (scroll.ts is not loaded here)
- `src/scripts/gsap-init.ts` — unrelated
- `src/scripts/paper-tone.ts` — unrelated
- `src/scripts/local-time.ts` — unrelated
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/footnotes.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- Any page file — no page changes needed

### A11y Interaction Checklist

- [ ] Folio `aria-hidden="true"` — decorative per UX-DR13
- [ ] Spine dot covered by outer `aria-hidden="true"` on `ProjectSpine.astro` container — decorative
- [ ] No animation on folio digits — snaps to value (no motion concern)
- [ ] Spine dot position update via `style.top` — not animation, no motion concern
- [ ] No `REDUCED_MOTION` gate needed — both behaviors are information, not motion

### Cross-Browser Edge Cases

- **`document.body.scrollHeight <= window.innerHeight + 1`:** The `+1` handles sub-pixel rounding differences across browsers. Without it, a page that is exactly viewport height might incorrectly trigger the scroll path.
- **`ScrollTrigger.refresh()` after `document.fonts.ready`:** Already in `init()`. Ensures folio and spine dot positions are calculated with correct Newsreader metrics, not fallback font metrics.
- **iOS Safari + `scroll.ts`:** `scroll.ts` gates on `COARSE_POINTER` for damped scroll, but `initFolio()` and `initSpineDot()` are not gated — they run on iOS. The folio will update on mobile scroll. The spine dot will update on mobile scroll (though the spine is hidden on mobile via `hidden md:block` in the project page template — the dot update is a no-op since the element doesn't exist in the DOM on mobile).
- **Essay pages:** `initSpineDot()` guards on `[data-spine="dot"]` not existing — essay pages have no `ProjectSpine.astro`, so the guard fires and the function returns immediately.

### JS Budget Impact

Two new ScrollTrigger instances + minimal DOM update logic adds ~0.2KB gzip. Current budget after Story 5.2: ~47.4KB. After this story: ~47.6KB. Budget ceiling: 60KB. ~12.4KB headroom remains for Story 5.4.

### Previous Story Intelligence (from Story 5.2)

- The `data-frame` attribute pattern is established: `data-frame="local-time"` for LocalTime, `data-frame="folio"` for Folio. Use the same selector pattern.
- The component extraction pattern is established: extract the static span from `Frame.astro` into a dedicated component, add `data-frame` attribute, keep all classes identical.
- `export {}` was added to `local-time.ts` and `paper-tone.ts` to establish ES module scope. `scroll.ts` already imports from `gsap-init.ts` (making it an ES module), so no `export {}` needed.
- Story 5.2 review flagged the BR folio `data-reveal="corner"` discrepancy. Preserve it as-is — do not remove it.

### References

- [FR-2] — Corner labels: BR folio formatted as zero-padded NNN / TTT, scroll-percentage-derived.
- [FR-11] — Project page structure: project spine on left edge with tick marks at each `<h2>` anchor.
- [UX-DR8] — Folio scroll-driven update: debounced to ~60fps, never animates digits, snaps to new value. On single-viewport routes, shows 001 / 001.
- [UX-DR13] — Decorative elements `aria-hidden="true"`: folio and local time labels all receive `aria-hidden="true"`.
- [Architecture: Component & File Organization] — `Folio.astro` listed explicitly in `src/components/frame/`.
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading.
- [Architecture: Feature Gate Matrix] — folio and spine dot not gated on `REDUCED_MOTION` or `COARSE_POINTER`.
- [Story 5.2 Dev Notes] — `data-frame` selector pattern, component extraction pattern, `data-reveal="corner"` discrepancy.
- [Story 5.2 Review Findings] — BR folio `data-reveal="corner"` pre-existing discrepancy; preserve as-is.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Created `src/components/frame/Folio.astro` — BR corner span with `data-frame="folio"`, `data-reveal="corner"`, `aria-hidden="true"`, and static fallback `001 / 001`. Preserves pre-existing `data-reveal="corner"` as documented in Dev Notes.
- Updated `src/components/frame/Frame.astro` — imported `Folio` and replaced the static BR `<span>` with `<Folio />`. Rendered HTML is identical to the original span.
- Updated `src/components/content/ProjectSpine.astro` — added `<div data-spine="dot">` inside the existing `aria-hidden` container, styled with `bg-ink absolute left-[-2px] h-[5px] w-[5px] rounded-full`, initial `style="top: 0%"`.
- Updated `src/scripts/scroll.ts` — added `initFolio()` and `initSpineDot()` functions; both push their ScrollTrigger instances to `instances[]` for automatic cleanup. Called from `init()` after `initFogLifting()`. `initFolio()` uses `[data-prose-body]` scope for h2 counting on long-form pages, falls back to `document.querySelectorAll('h2')` elsewhere, and guards single-viewport pages. `initSpineDot()` guards on `[data-spine="dot"]` absence (correct guard — not `[data-prose-body]`).
- All validation passed: `bun run format`, `bun run lint`, `bun run check` — 0 errors, 0 warnings.

### File List

- `src/components/frame/Folio.astro` (CREATED)
- `src/components/frame/Frame.astro` (MODIFIED)
- `src/components/content/ProjectSpine.astro` (MODIFIED)
- `src/scripts/scroll.ts` (MODIFIED)

### Change Log

- 2026-05-23: Story 5.3 created — scroll-driven folio and project spine indicator.
- 2026-05-23: Story 5.3 validated against checklist — fixed misleading `[data-prose-body]` guard description in Task 4.5 (both page types have this attribute; `[data-spine="dot"]` absence is the correct guard); corrected Task 4.2 to use `self.progress` directly; added edge-case note for folio value retention on home page navigation; added `pinnedHeadings[]`/`foggedElements[]` preservation warning to "What Already Exists" table.
- 2026-05-23: Story 5.3 implemented — created `Folio.astro`, updated `Frame.astro`, `ProjectSpine.astro`, and `scroll.ts`. All ACs satisfied. Validation passed (format, lint, check).

### Review Findings

- [x] [Review][Patch] Single-viewport folio shows `001 / TTT` instead of `001 / 001` [src/scripts/scroll.ts:initFolio]
- [x] [Review][Patch] Stale folio text persists after navigating away from a scroll page [src/scripts/scroll.ts:cleanup]
- [x] [Review][Defer] Spine dot ScrollTrigger fires on mobile scroll for a CSS-hidden element [src/scripts/scroll.ts:initSpineDot] — deferred, pre-existing pattern (dot is hidden via `hidden md:block` on the parent; wasteful but harmless)
