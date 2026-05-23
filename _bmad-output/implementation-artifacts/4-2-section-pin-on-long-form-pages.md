# Story 4.2: Section Pin on Long-Form Pages

Status: done

## Story

As a visitor reading a long section,
I want the section title to stay visible while I read dense paragraphs,
so that I always know which section I'm in without scrolling back up.

## Acceptance Criteria

1. Section pin logic is added to the existing `src/scripts/scroll.ts` (not a new file)
2. When a `<h2>` section title reaches the top of the viewport on a project or essay page, it pins for ~30vh of additional scroll then releases
3. ScrollTrigger is configured with `pin: true, pinSpacing: false`
4. Only one section title is pinned at a time — the previous pin releases before the next engages
5. The script gates on `REDUCED_MOTION` — if true, titles scroll normally (no pin)
6. All ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
7. Re-initializes on `astro:after-swap`
8. A `SectionPin.astro` component exists in `src/components/motion/` as the DOM wrapper that provides the pin target structure
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/motion/SectionPin.astro` (AC: #8)
  - [x] 1.1: Component renders a minimal `<div data-section-pin>` wrapper with a `<slot />`
  - [x] 1.2: No `aria-hidden` — this wraps real heading content, not a decorative element
  - [x] 1.3: No client-side script in the component — all animation logic lives in `scroll.ts`

- [x] Task 2: Add `data-prose-body` to prose wrapper divs in page templates (AC: #2)
  - [x] 2.1: In `src/pages/projects/[...slug].astro`, add `data-prose-body` to the prose `<div>` that wraps `<Content />` (the div with `[&_h2]` Tailwind classes inside `<DropCap>`)
  - [x] 2.2: In `src/pages/writing/[...slug].astro`, add `data-prose-body` to the equivalent prose `<div>`
  - [x] 2.3: Do NOT import or use `SectionPin.astro` in the page templates — `scroll.ts` queries `[data-prose-body] h2` directly (see Dev Notes)

- [x] Task 3: Add section pin logic to `src/scripts/scroll.ts` (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 3.1: Keep the `void gsap` suppression line — `gsap` is still not directly called by section pin (see Dev Notes)
  - [x] 3.2: Add `initSectionPin()` function — gates on `REDUCED_MOTION` and `window.innerWidth < 768` (NOT `COARSE_POINTER`)
  - [x] 3.3: Inside `initSectionPin()`, query `document.querySelector('[data-prose-body]')` then `querySelectorAll('h2')` within it
  - [x] 3.4: For each `<h2>`, create a `ScrollTrigger` with `pin: true, pinSpacing: false, start: 'top top', end: '+=30vh'`
  - [x] 3.5: Push each `ScrollTrigger` instance to `instances[]`
  - [x] 3.6: Refactor `init()` to call damped scroll inline, then call `initSectionPin()`, then call `ScrollTrigger.refresh()` at the very end of `init()` — after both behaviors are registered (see Dev Notes for exact structure)
  - [x] 3.7: Confirm `cleanup()` already kills all instances — no changes needed there

- [x] Task 4: Run validation gate (AC: #9)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### This Story Extends `scroll.ts` — Do NOT Recreate It

`scroll.ts` was created in Story 4.1 with the damped scroll logic. This story adds section pin as a second behavior in the same file. Story 4.3 will add fog-lifting as a third. The file structure was designed for this — add a clearly separated section with a comment header.

After this story, the complete `scroll.ts` structure should be:

```typescript
// ─── Instance Registry ────────────────────────────────────────────────────────
// ─── Cleanup ──────────────────────────────────────────────────────────────────
// ─── Section Pin ──────────────────────────────────────────────────────────────
function initSectionPin(): void { ... }
// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void { ... }
// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
// ─── Initial Run ──────────────────────────────────────────────────────────────
```

### Exact `scroll.ts` Implementation Pattern

The complete updated `init()` and new `initSectionPin()`:

```typescript
// ─── Section Pin ──────────────────────────────────────────────────────────────
function initSectionPin(): void {
  // Gate: no pin under reduced motion (FR-24)
  if (REDUCED_MOTION) return;
  // Gate: no pin on mobile — UX-DR2
  if (window.innerWidth < 768) return;

  const proseBody = document.querySelector('[data-prose-body]');
  if (!proseBody) return; // not a long-form page (e.g. home page — shouldn't happen, but guard anyway)

  const headings = proseBody.querySelectorAll<HTMLElement>('h2');
  headings.forEach((el) => {
    // Apply background so body text scrolling underneath doesn't show through
    el.style.backgroundColor = 'var(--paper)';
    // Ensure pinned heading sits above scrolling body text
    el.style.zIndex = '10';

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=30vh',
      pin: true,
      pinSpacing: false,
    });
    instances.push(trigger);
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Damped smooth scroll — gates on COARSE_POINTER || REDUCED_MOTION (FR-23)
  if (!(COARSE_POINTER || REDUCED_MOTION)) {
    const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
    if (normalizer) instances.push(normalizer);
  }

  // Section pin — gates on REDUCED_MOTION + viewport width (FR-24, UX-DR2)
  initSectionPin();

  // Recalculate all trigger positions after both behaviors are registered.
  // Must be called at the END of init(), after normalizeScroll and all pins
  // are in place. Calling it inside initSectionPin() would miss the normalizer.
  ScrollTrigger.refresh();
}
```

**Keep the `void gsap` suppression line.** `ScrollTrigger.create()` is called via the `ScrollTrigger` import, not `gsap` directly. The `gsap` named import remains unused after this story. Removing the suppression will cause a lint error. Story 4.3 (fog-lifting) will use `gsap.to()` and can remove it then.

### Feature Gate Matrix for Section Pin

| Gate | Condition | Behavior |
|---|---|---|
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | No pin — titles scroll normally |
| `window.innerWidth < 768` | Mobile viewport | No pin — UX-DR2 specifies no section pin on mobile |
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | Pin still runs on desktop touch screens — NOT a gate for section pin |

Section pin is NOT gated on `COARSE_POINTER`. FR-24 only specifies `prefers-reduced-motion` as the disable condition. The mobile exclusion is handled by the viewport width check, which is more precise than pointer type (a desktop with a touchscreen should still get the pin).

### The `SectionPin.astro` Component

Architecture specifies `src/components/motion/SectionPin.astro` for FR-24. Create it as a minimal documented placeholder — it is not used directly in page templates for this story (the `data-prose-body` approach is used instead), but it satisfies the architecture boundary and can be used in future stories:

```astro
---
// src/components/motion/SectionPin.astro
// Architecture placeholder for FR-24 section pin behavior.
// The actual pin targets are <h2> elements queried via [data-prose-body]
// in scroll.ts — this component is available for future use if individual
// heading wrapping becomes necessary.
---

<div data-section-pin>
  <slot />
</div>
```

### How `<h2>` Elements Are Targeted — The Markdown Content Challenge

The `<h2>` elements come from rendered Markdown via `<Content />`, nested inside `<DropCap>` → `<div class="drop-cap">` → the prose `<div>`. You cannot wrap individual Markdown-rendered headings with an Astro component.

**The approach:** Add `data-prose-body` to the prose wrapper `<div>` in both page templates. `scroll.ts` queries `h2` elements within it.

In both `[...slug].astro` files, the prose div currently looks like:

```astro
<div
  class="text-ink font-serif leading-[1.555] [&_h2]:mt-14 [&_h2]:mb-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mb-7"
>
  <Content />
</div>
```

Add `data-prose-body` to it:

```astro
<div
  data-prose-body
  class="text-ink font-serif leading-[1.555] [&_h2]:mt-14 [&_h2]:mb-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mb-7"
>
  <Content />
</div>
```

`scroll.ts` then queries:

```typescript
const proseBody = document.querySelector('[data-prose-body]');
const headings = proseBody.querySelectorAll<HTMLElement>('h2');
```

This is the only change needed in the page templates. Do NOT import `SectionPin.astro` in the page templates.

### Pinned Heading Visual Correctness — `z-index` and `background-color`

When GSAP pins an element with `position: fixed`, body text scrolls underneath it. Without explicit styles, the heading will be transparent and text will show through it — making it unreadable.

Apply these inline styles to each `<h2>` before creating its trigger:

```typescript
el.style.backgroundColor = 'var(--paper)';
el.style.zIndex = '10';
```

This is already included in the implementation pattern above. Do NOT use Tailwind classes for this — the styles need to be applied programmatically by `scroll.ts` only when the pin is active. If the pin is not created (reduced motion, mobile), the heading retains its natural appearance.

**Cleanup:** When `cleanup()` kills the ScrollTrigger instances, GSAP automatically removes the `position: fixed` it applied. However, the inline `backgroundColor` and `zIndex` styles set by the script will persist. This is acceptable — they are visually neutral on a non-pinned heading (same background, no visible z-index effect). If this becomes a concern in a future story, add explicit style cleanup to `cleanup()`.

### `pinSpacing: false` — What It Does and Why

`pinSpacing: false` tells ScrollTrigger NOT to add a spacer div below the pinned element. The title pins in place, content scrolls under it, and when the pin releases the title snaps back to its natural position — the "title floats, then releases" effect specified in FR-24.

**Risk:** `pinSpacing: false` can cause a visual jump on pin release. Test in Safari specifically. If a jump is visible, `pinSpacing: true` is the fallback — the AC specifies `false` but the intent is a smooth reading experience.

### `ScrollTrigger.refresh()` — Placement Is Critical

`ScrollTrigger.refresh()` recalculates all trigger positions. It must be called at the **end of `init()`**, after both `normalizeScroll` and all pin triggers are registered. This is already shown in the implementation pattern above.

Do NOT call it inside `initSectionPin()` — that would miss the normalizer and fire before all pins are created on pages with multiple `<h2>` elements.

### `astro:after-swap` vs `astro:page-load` — Ordering Awareness

`FootnoteReveal.astro` moves footnote `<li>` items into the margin column on `astro:page-load`. `scroll.ts` initializes on `astro:after-swap`. Astro fires `astro:after-swap` **before** `astro:page-load`, so `initSectionPin()` runs before footnotes are moved.

The footnote DOM move changes the height of the margin column (`<aside>`), not the content column where `<h2>` elements live. ScrollTrigger calculates trigger positions based on the `<h2>` elements' positions in the document — these are unaffected by the margin column height change. No additional `ScrollTrigger.refresh()` call after `astro:page-load` is needed.

### `normalizeScroll` + Section Pin Coexistence

Both behaviors share the same ScrollTrigger scroll pipeline. `ScrollTrigger.normalizeScroll()` intercepts native scroll events; `ScrollTrigger.create()` for pins uses the default `window` scroller. No `scroller` option is needed on the pin triggers — the default is correct. The `ScrollTrigger.refresh()` at the end of `init()` ensures both are calibrated together after registration.

### Architecture Compliance — Critical Rules

| Rule | Requirement |
|---|---|
| Import GSAP | Only from `./gsap-init` — never from `'gsap'` directly |
| Gate constants | Import `REDUCED_MOTION` and `COARSE_POINTER` from `./gsap-init` — never re-evaluate |
| Instance cleanup | Every `ScrollTrigger` instance pushed to `instances[]`, killed in `cleanup()` |
| No new dependencies | `package.json` is frozen — do not add any package |
| Lifecycle hooks | `astro:before-swap` → cleanup, `astro:after-swap` → init |
| Extend, don't replace | Add to `scroll.ts` — do NOT create a new script file |

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `gsap-init.ts` with `ScrollTrigger` registered | `src/scripts/gsap-init.ts` | Do NOT call `gsap.registerPlugin(ScrollTrigger)` again |
| `REDUCED_MOTION` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `COARSE_POINTER` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `instances[]` array and `cleanup()` | `src/scripts/scroll.ts` | Already handles all instances — just push new ones |
| `astro:before-swap` / `astro:after-swap` listeners | `src/scripts/scroll.ts` | Already registered — do NOT add duplicate listeners |
| `<script>` tags in project and essay pages | Both `[...slug].astro` files | Already import `scroll.ts` — no changes needed to script tags |
| Global ticker pause on `visibilitychange` | `src/scripts/gsap-init.ts` | Already handled — do NOT add another listener |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/components/motion/SectionPin.astro` | DOM wrapper component (architecture-specified, FR-24) |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/scripts/scroll.ts` | Add `initSectionPin()` function; update `init()` to call it and end with `ScrollTrigger.refresh()`; keep `void gsap` suppression |
| `src/pages/projects/[...slug].astro` | Add `data-prose-body` attribute to prose wrapper div |
| `src/pages/writing/[...slug].astro` | Add `data-prose-body` attribute to prose wrapper div |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- `src/styles/global.css` — no CSS changes needed for section pin
- `src/layouts/BaseLayout.astro` — do NOT add section pin here

### A11y Interaction Checklist

- [ ] Section headings remain in the DOM and accessible to screen readers when pinned (GSAP pin uses `position: fixed` on the element itself — the element is still in the DOM)
- [ ] Pinned `<h2>` elements retain their semantic role during pin (no `aria-hidden` on headings)
- [ ] Under `prefers-reduced-motion`, no pin behavior — headings scroll normally
- [ ] On mobile (<768px), no pin behavior — single column layout is unaffected
- [ ] Keyboard navigation is unaffected — pinned headings are not interactive elements

### Cross-Browser Edge Cases

- **Safari + `pinSpacing: false`**: Can cause visual artifacts on pin release. Test in Safari specifically. Fallback: `pinSpacing: true`.
- **iOS Safari**: `window.innerWidth < 768` gate prevents pin on mobile. Correct — do not use `COARSE_POINTER` as the mobile gate here.
- **Firefox scroll normalization + pin**: `normalizeScroll` and section pin share the same ScrollTrigger pipeline. `ScrollTrigger.refresh()` at the end of `init()` calibrates both together. No additional handling needed.
- **Resize handling**: Pin triggers are created at the viewport width at init time. If the visitor resizes from desktop to mobile, existing triggers remain active. Acceptable for MVP — the site is not designed for live resizing.

### Previous Story Intelligence (from Story 4.1)

- `scroll.ts` was designed to accommodate future stories — the file structure is clean and ready for extension.
- `void gsap` was added as a lint suppression because `gsap` was imported but unused. **Keep it** — `ScrollTrigger.create()` is called via the `ScrollTrigger` import, not `gsap` directly. `gsap` remains unused after this story. Story 4.3 (fog-lifting) will use `gsap.to()` and can remove the suppression then.
- The `normalizer` null check (`if (normalizer) instances.push(normalizer)`) is a defensive pattern. `ScrollTrigger.create()` always returns an instance in browser context, but a null check is still good practice.
- `bun run format && bun run lint && bun run check` passed cleanly in Story 4.1. Expect the same here.
- If any transition is added to the pinned heading (e.g. a fade on pin/unpin), use `--dur-quick` (150ms) or `--dur-breath` (400ms) from the token layer — not a hardcoded value. The `--dur-mark: 250ms` token flagged in the Epic 3 retro does not exist yet.

### GSAP Budget Impact

`ScrollTrigger.create()` is part of the already-imported ScrollTrigger plugin (~12KB gzip, already counted). No additional GSAP code is needed. This story adds ~0.5–1KB of site script.

Current budget: ~44KB gzip (from Epic 3 retro). After Story 4.1: ~44.5KB. After this story: ~45KB. Budget ceiling: 60KB. Comfortable headroom.

### Reduced-Motion Behavior

Under `prefers-reduced-motion: reduce`:
- `REDUCED_MOTION` is `true` → `initSectionPin()` returns immediately
- No `ScrollTrigger` instances are created for section pin
- Headings scroll normally with the page
- The damped scroll normalizer is also not created (its own gate)
- No cleanup needed for section pin (nothing was registered)

### References

- [FR-24] — Section pin: section titles pin for ~30vh of additional scroll then release. `ScrollTrigger pin: true, pinSpacing: false`. Under `prefers-reduced-motion`, disabled. Only one title pinned at a time.
- [UX-DR2] — Mobile layout adaptation: no section pin on mobile (<768px)
- [NFR-2] — JS Budget ≤60KB gzip total
- [NFR-9] — Animation performance: transform and opacity only (pin uses `position: fixed`, not layout animation)
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading, single GSAP entry point
- [Architecture: Feature Gate Matrix] — `scroll.ts` gates on `REDUCED_MOTION` for section pin
- [Architecture: Implementation Patterns] — script file structure, import rules, instance registry
- [Architecture: FR-24 mapping] — `SectionPin.astro` + `scroll.ts`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_none_

### Completion Notes List

- Created `src/components/motion/SectionPin.astro` — minimal `<div data-section-pin><slot /></div>` placeholder per architecture spec (FR-24). No script, no aria-hidden.
- Added `data-prose-body` attribute to the prose wrapper `<div>` in both `src/pages/projects/[...slug].astro` and `src/pages/writing/[...slug].astro`. No other changes to those templates.
- Extended `src/scripts/scroll.ts` with `initSectionPin()`: gates on `REDUCED_MOTION` and `window.innerWidth < 768`; queries `[data-prose-body] h2`; applies `backgroundColor: var(--paper)` and `zIndex: 10` inline before creating each `ScrollTrigger` with `pin: true, pinSpacing: false, start: 'top top', end: '+=30vh'`; pushes each instance to `instances[]`.
- Refactored `init()` to call damped scroll normalizer inline, then `initSectionPin()`, then `ScrollTrigger.refresh()` at the end — ensuring both behaviors are calibrated together.
- `void gsap` suppression line retained — `gsap` remains unused until Story 4.3 (fog-lifting).
- `cleanup()` unchanged — already kills all instances via `instances.forEach(i => i.kill())`.
- `bun run format`, `bun run lint`, `bun run check` all passed with 0 errors, 0 warnings.

### File List

- `src/components/motion/SectionPin.astro` — CREATED
- `src/scripts/scroll.ts` — MODIFIED (added `initSectionPin()`, refactored `init()`)
- `src/pages/projects/[...slug].astro` — MODIFIED (added `data-prose-body` to prose wrapper div)
- `src/pages/writing/[...slug].astro` — MODIFIED (added `data-prose-body` to prose wrapper div)

### Review Findings

- [x] [Review][Decision] COARSE_POINTER not gating section pin on touch tablets — resolved: keep width-only gate, intentional per spec (FR-24 feature gate matrix explicitly states section pin is NOT gated on COARSE_POINTER)
- [x] [Review][Patch] Last h2 on a page stays pinned if scroll depth < 30vh below it — fixed: changed `end: '+=30vh'` to `end: 'bottom bottom'` so the pin always releases at the page bottom [scroll.ts:initSectionPin]
- [x] [Review][Patch] ScrollTrigger.refresh() called before fonts load — pin positions miscalculated — fixed: wrapped `ScrollTrigger.refresh()` in `document.fonts.ready.then(...)` [scroll.ts:init]
- [x] [Review][Patch] Inline backgroundColor and zIndex not cleaned up on cleanup() — fixed: added `pinnedHeadings[]` tracking array; `cleanup()` now clears inline styles before resetting the array [scroll.ts:initSectionPin / cleanup]
- [x] [Review][Defer] One-shot viewport gate — resize after load leaves pin state stale [scroll.ts:initSectionPin] — deferred, pre-existing; spec explicitly notes "Acceptable for MVP — the site is not designed for live resizing"
- [x] [Review][Defer] ScrollTrigger.refresh() called before astro:page-load — footnote DOM move [scroll.ts:init] — deferred, pre-existing; spec Dev Notes explicitly address and confirm safe (footnote move affects margin column, not content column where h2 elements live)

## Change Log

- 2026-05-23: Story 4.2 created — ready for dev.
- 2026-05-23: Story 4.2 implemented — all tasks complete, status → review.
