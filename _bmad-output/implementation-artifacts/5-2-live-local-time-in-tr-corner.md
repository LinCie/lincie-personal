# Story 5.2: Live Local Time in TR Corner

Status: done

## Story

As a visitor,
I want the top-right corner to show my local time updating live,
so that the Frame feels ambient and alive without demanding my attention.

## Acceptance Criteria

1. `src/scripts/local-time.ts` is created following the gate+cleanup lifecycle pattern
2. The TR corner label renders the visitor's local time as `HH:MM LOCAL` (24-hour format, visitor's local time zone — not UTC)
3. The label updates within 60 seconds of a real-time minute change without page reload
4. The `setInterval` is cleared on `astro:before-swap` (no zombie intervals)
5. The interval is paused on `document.visibilityState === 'hidden'` and resumed on `visible` (no background ticking)
6. Under `prefers-reduced-motion`, the label still updates (it's information, not motion)
7. Re-initializes on `astro:after-swap`
8. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/frame/LocalTime.astro` (AC: #2)
  - [x] 1.1: Add file header comment: `<!-- src/components/frame/LocalTime.astro -->`
  - [x] 1.2: Render a `<span>` with `data-frame="local-time"` attribute (the JS target selector)
  - [x] 1.3: Set static fallback text `00:00 LOCAL` (same as current Frame.astro placeholder)
  - [x] 1.4: Match the exact classes from the existing TR span in `Frame.astro`: `aria-hidden="true"`, `data-reveal="corner"`, `class="text-meta fixed top-7 right-7 z-50 hidden font-mono text-[0.75rem] leading-none tracking-widest uppercase md:block"`

- [x] Task 2: Update `src/components/frame/Frame.astro` to use `LocalTime.astro` (AC: #2)
  - [x] 2.1: Import `LocalTime` from `./LocalTime.astro`
  - [x] 2.2: Replace the existing TR `<span>` (the one with `data-frame="local-time"`) with `<LocalTime />`
  - [x] 2.3: Verify the rendered HTML is identical to the current TR span — same classes, same `aria-hidden`, same `data-reveal`, same `data-frame` attribute

- [x] Task 3: Create `src/scripts/local-time.ts` with gate+cleanup lifecycle (AC: #1, #4, #5, #6, #7)
  - [x] 3.1: Add file header comment: `// src/scripts/local-time.ts` / `// Live local time in TR corner.` / `// Loaded in BaseLayout (every page).`
  - [x] 3.2: No imports — `local-time.ts` uses only native browser APIs. Do NOT import from `gsap-init.ts` or any other module.
  - [x] 3.3: Add Instance Registry: `const intervals: ReturnType<typeof setInterval>[] = [];` and `let visibilityHandler: (() => void) | null = null;`
  - [x] 3.4: Implement `getTimeString(): string` — returns current local time as `HH:MM` (zero-padded, 24-hour) using `new Date()`, then appends ` LOCAL`
  - [x] 3.5: Implement `applyTime(): void` — queries `document.querySelector('[data-frame="local-time"]')`, guards if null, sets `element.textContent = getTimeString()`
  - [x] 3.6: Implement `cleanup(): void` — clears all intervals, resets `intervals.length = 0`, removes `visibilityHandler`, sets it to `null`
  - [x] 3.7: Implement `init(): void` — calls `applyTime()` immediately; only starts interval if `!document.hidden`; sets up `visibilityHandler` with the same guard pattern as `paper-tone.ts` (clear stale intervals before restarting on `visible`)
  - [x] 3.8: Add lifecycle hooks: `document.addEventListener('astro:before-swap', cleanup)` and `document.addEventListener('astro:after-swap', init)`
  - [x] 3.9: Add initial run: `init();`

- [x] Task 4: Load `local-time.ts` in BaseLayout (AC: #1)
  - [x] 4.1: In `src/layouts/BaseLayout.astro`, add `import '../scripts/local-time.ts';` to the existing `<script>` block alongside `reveal.ts`, `cursor.ts`, `view-transitions.ts`, and `paper-tone.ts`
  - [x] 4.2: Do NOT create a second `<script>` block

- [x] Task 5: Run validation gate (AC: #8)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### Architecture: Two-Part Implementation

FR-25 maps to two files per the architecture document:
- `src/components/frame/LocalTime.astro` — DOM (the `<span>` element in the TR corner)
- `src/scripts/local-time.ts` — setInterval logic (updates the element's text content)

The architecture also lists `src/components/frame/Folio.astro` as a separate component for the BR corner (Story 5.3). Follow the same split pattern: component for DOM, script for behavior.

**Current state of Frame.astro:** The TR corner is currently a plain `<span>` with `data-frame="local-time"` and static text `00:00 LOCAL`. This story extracts it into `LocalTime.astro` and wires up the live update script. The rendered HTML must be identical — same classes, same attributes.

### Complete `local-time.ts` Structure

```typescript
// src/scripts/local-time.ts
// Live local time in TR corner.
// Loaded in BaseLayout (every page).
//
// NOT gated on REDUCED_MOTION or COARSE_POINTER — local time is information,
// not motion. Runs on every device under every accessibility preference.

// ─── Time Formatting ──────────────────────────────────────────────────────────
function getTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} LOCAL`;
}

// ─── Apply Time ───────────────────────────────────────────────────────────────
function applyTime(): void {
  const el = document.querySelector<HTMLElement>('[data-frame="local-time"]');
  if (!el) return;
  el.textContent = getTimeString();
}

// ─── Instance Registry ────────────────────────────────────────────────────────
const intervals: ReturnType<typeof setInterval>[] = [];
let visibilityHandler: (() => void) | null = null;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  intervals.forEach((id) => clearInterval(id));
  intervals.length = 0;

  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Apply the correct time immediately on load.
  applyTime();

  // Only start the interval if the tab is currently visible.
  if (!document.hidden) {
    const id = setInterval(applyTime, 60_000);
    intervals.push(id);
  }

  visibilityHandler = () => {
    if (document.hidden) {
      intervals.forEach((i) => clearInterval(i));
      intervals.length = 0;
    } else {
      // Clear stale intervals before restarting — guards against rapid/duplicate events.
      intervals.forEach((i) => clearInterval(i));
      intervals.length = 0;
      applyTime();
      const newId = setInterval(applyTime, 60_000);
      intervals.push(newId);
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
```

### Complete `LocalTime.astro` Structure

```astro
---
// src/components/frame/LocalTime.astro
// TR corner label — live local time.
// Static fallback: "00:00 LOCAL". Updated by local-time.ts.
---

<!-- TR: Local time — hidden on mobile, aria-hidden (decorative) -->
<span
  aria-hidden="true"
  data-frame="local-time"
  data-reveal="corner"
  class="text-meta fixed top-7 right-7 z-50 hidden font-mono text-[0.75rem] leading-none tracking-widest uppercase md:block"
>
  00:00 LOCAL
</span>
```

**Critical — `data-reveal="corner"` and the opacity-0 rule:** `global.css` contains:
```css
[data-reveal="corner"] { opacity: 0; }
```
This means every element with `data-reveal="corner"` starts invisible. `reveal.ts` animates them to `opacity: 1` on first session load, and calls `paintFinalState()` (which sets `opacity: 1` via inline style) on all subsequent navigations. If `data-reveal="corner"` is missing from `LocalTime.astro`, the TR element will be visible at first paint (flash before reveal runs) AND `paintFinalState()` won't target it on subsequent navigations, leaving it at whatever opacity it was. Both attributes are required.

**Critical — `data-frame="local-time"`** is the JS selector target for `local-time.ts`. Do NOT change the classes — they match the existing TR span in `Frame.astro` exactly.

### `transition:persist` Scope — Frame Covers LocalTime

`BaseLayout.astro` renders `<Frame ... transition:persist />`. This means the **entire Frame component** (and all its children, including the `LocalTime.astro` span) persists across View Transitions. `LocalTime.astro` does NOT need its own `transition:persist` attribute — it inherits persistence from the parent `<Frame>` component.

This is why `applyTime()` always finds the element after `astro:after-swap`: the element was never removed from the DOM.

### Why `document.querySelector('[data-frame="local-time"]')` (not `getElementById`)

The element has no `id`. The architecture uses `data-frame` attributes as JS hooks on Frame elements. Use the attribute selector. The `transition:persist` on `<Frame />` means the element persists across View Transitions — `applyTime()` will always find it after `astro:after-swap`.

### `getTimeString` — Format Details

- `new Date().getHours()` returns 0–23 in the visitor's local time zone. No UTC conversion.
- `padStart(2, "0")` zero-pads single-digit hours and minutes: `9:05` → `09:05`.
- Output format: `HH:MM LOCAL` (e.g., `14:37 LOCAL`). The space before `LOCAL` is part of the string.
- This matches the static placeholder `00:00 LOCAL` already in `Frame.astro`.

### Lifecycle Pattern — Mirror `paper-tone.ts` Exactly

`local-time.ts` is structurally identical to `paper-tone.ts`. The only differences:
- `applyBand()` → `applyTime()` (different function name and logic)
- No band constants (no OKLCH values)
- DOM update via `element.textContent` instead of `document.documentElement.style.setProperty`

The `paper-tone.ts` implementation already incorporates the two review patches from Story 5.1:
1. **Double-interval guard** — clear stale intervals before restarting on `visible`
2. **Hidden-tab init guard** — only start interval if `!document.hidden`

Both patches are already in the `init()` structure above. Do NOT use the pre-patch version from the Dev Notes in `5-1-paper-tone-drift-time-of-day-color-bands.md` — use the actual `src/scripts/paper-tone.ts` file as the reference.

### No GSAP Dependency — Zero Imports

`local-time.ts` has zero imports. Native browser APIs only:
- `setInterval` / `clearInterval`
- `document.querySelector`
- `document.addEventListener` / `document.removeEventListener`
- `new Date()`
- `document.hidden`

Do NOT import from `gsap-init.ts`. Local time is not animation.

### Loading in BaseLayout — Existing `<script>` Block

Current `BaseLayout.astro` `<script>` block:
```astro
<script>
  import "../scripts/reveal.ts";
  import "../scripts/cursor.ts";
  import "../scripts/view-transitions.ts";
  import "../scripts/paper-tone.ts";
</script>
```

Add `local-time.ts` to this block. Match the `.ts` extension. Do NOT create a second `<script>` block.

### Side-Effect Cleanup Documentation (Epic 4 Retro Action Item #2)

| Side Effect | Introduced by | Cleaned up by |
|---|---|---|
| `setInterval` ID in `intervals[]` | `init()` | `cleanup()` via `clearInterval` |
| `visibilitychange` listener | `init()` | `cleanup()` via `removeEventListener` |
| `element.textContent` update | `applyTime()` | NOT cleaned up — intentional |

**Why `textContent` is NOT cleaned up:** The TR corner label should always show the current time. Resetting it to `00:00 LOCAL` on `astro:before-swap` would cause a visible flash. The persisted element retains its last value across navigations — correct behavior.

### Feature Gate Matrix

| Gate | Condition | Behavior |
|---|---|---|
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | **NOT gated** — time updates normally |
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | **NOT gated** — time updates normally (though TR is hidden on mobile via `md:block`) |
| `document.hidden` | Tab not visible | Interval paused; re-applied on `visible` |

### Frame.astro Corner Asymmetry — Do NOT "Fix" the BR Span

When modifying `Frame.astro` to replace the TR span with `<LocalTime />`, note that the BR folio `<span>` intentionally does NOT have `data-reveal="corner"`. The folio is always visible at first paint — it is not part of the reveal sequence. Do not add `data-reveal="corner"` to the BR span. The asymmetry is by design.

Corner `data-reveal` status:
- TL `<nav>` — has `data-reveal="corner"` ✅ (part of reveal)
- TR `<span>` (LocalTime) — has `data-reveal="corner"` ✅ (part of reveal)
- BL `<span>` (section label) — has `data-reveal="corner"` ✅ (part of reveal)
- BR `<span>` (folio) — NO `data-reveal="corner"` ✅ (always visible, intentional)

### `--dur-mark` Token — Deferred, Not This Story's Concern

The Epic 4 retro flagged `--dur-mark: 250ms` as overdue (3 files use hardcoded 250ms: InlineLink, ProjectBand, footnotes.ts). This story has no animation and does not introduce or use this token. Do NOT introduce `--dur-mark` here — it is out of scope. It remains a deferred action item for a future story (likely 5.4 or a standalone token pass).

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| TR `<span>` with `data-frame="local-time"` | `src/components/frame/Frame.astro` | Extract into `LocalTime.astro`; do NOT duplicate |
| `<script>` block in BaseLayout | `src/layouts/BaseLayout.astro` | Add `local-time.ts` import here |
| `visibilitychange` listener for GSAP | `src/scripts/gsap-init.ts` | Independent; do NOT consolidate |
| `visibilitychange` listener for paper-tone | `src/scripts/paper-tone.ts` | Independent; do NOT consolidate |
| `intervals[]` pattern | `src/scripts/paper-tone.ts` | Mirror this pattern exactly |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/components/frame/LocalTime.astro` | TR corner DOM element |
| `src/scripts/local-time.ts` | setInterval lifecycle, `textContent` update |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/components/frame/Frame.astro` | Replace TR `<span>` with `<LocalTime />` import |
| `src/layouts/BaseLayout.astro` | Add `import '../scripts/local-time.ts'` to existing `<script>` block |

### Files to NOT Touch

- `src/styles/global.css` — no CSS changes needed
- `src/scripts/gsap-init.ts` — unrelated
- `src/scripts/paper-tone.ts` — unrelated
- `src/scripts/scroll.ts` — unrelated
- `src/scripts/footnotes.ts` — unrelated
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- Any page file — no page changes needed

### A11y Interaction Checklist

- [ ] Under `prefers-reduced-motion`, local time still resolves and updates — it is information, not motion
- [ ] Under `pointer: coarse`, local time still resolves and updates — TR is hidden on mobile via `md:block` CSS, but the script runs regardless
- [ ] `aria-hidden="true"` on the TR span — decorative per UX-DR13
- [ ] No animation, no transition, no GSAP — no motion accessibility concern
- [ ] The `visibilitychange` listener is removed on navigation — no zombie listeners

### Cross-Browser Edge Cases

- **`new Date().getHours()` returns local time** on all platforms. No UTC/timezone issue.
- **iOS Safari:** `setInterval` works normally. `new Date()` returns local time.
- **Firefox + `textContent`:** Standard DOM API, no issues.
- **Tab open across midnight:** `getHours()` returns 0 at midnight. `padStart(2, "0")` → `00`. Correct.
- **Multiple tabs:** Each tab runs its own `local-time.ts` instance. Each updates its own DOM. No cross-tab interference.
- **`transition:persist` + `astro:after-swap`:** The TR element is never removed from the DOM. `applyTime()` always finds it. The null guard is defensive only.
- **SSR/static output:** `local-time.ts` is client-side only. The static HTML shows `00:00 LOCAL` until JS executes. This is the correct "honest first paint" behavior — same as `paper-tone.ts`.

### JS Budget Impact

`local-time.ts` adds ~0.4KB gzip. Current budget after Story 5.1: ~47KB. After this story: ~47.4KB. Budget ceiling: 60KB. ~12.6KB headroom remains for Stories 5.3–5.4.

### Previous Story Intelligence (from Story 5.1)

- The `intervals[]` + `cleanup()` pattern is established and proven. Mirror `paper-tone.ts` exactly.
- The two review patches from Story 5.1 are already incorporated into the `init()` structure above:
  1. Hidden-tab init guard: `if (!document.hidden)` before starting interval
  2. Double-interval guard: clear stale intervals before restarting on `visible`
- `local-time.ts` has zero imports — same as `paper-tone.ts`. No GSAP, no module dependencies.
- `document.documentElement.style.setProperty` (paper-tone) → `element.textContent` (local-time). Different DOM target, same lifecycle.
- The `visibilityHandler` reference pattern (store → remove in cleanup) is the correct approach. Already proven.

### References

- [FR-25] — Live local time rendering: TR corner label renders HH:MM LOCAL, updates every minute via setInterval. Interval cleared on navigation, paused on `document.visibilityState === 'hidden'`. Under prefers-reduced-motion, still updates.
- [FR-2] — Corner labels: TR live local time (HH:MM LOCAL), updates once per minute.
- [UX-DR13] — Decorative elements `aria-hidden="true"`: folio and local time labels all receive `aria-hidden="true"`.
- [Architecture: FR-25] — `LocalTime.astro` + `local-time.ts`
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading, visibility-state pausing.
- [Architecture: Feature Gate Matrix] — `local-time.ts` not gated on `REDUCED_MOTION` or `COARSE_POINTER`.
- [Epic 4 Retro Action Item #2] — Side-effect cleanup documentation in Dev Notes. ✅
- [Story 5.1 Dev Notes] — `paper-tone.ts` as the direct structural template for `local-time.ts`.
- [Story 5.1 Review Findings] — Two patches (hidden-tab init guard, double-interval guard) already incorporated above.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- `bun run check` initially failed with `ts(2451)` redeclaration errors for `intervals` and `visibilityHandler` — TypeScript was treating `local-time.ts` and `paper-tone.ts` as scripts in the same global scope rather than ES modules. Fixed by adding `export {}` to both files to establish module boundaries. `paper-tone.ts` had the same latent issue; it only surfaced when `local-time.ts` was added.

### Completion Notes List

- Created `src/components/frame/LocalTime.astro` — TR corner `<span>` with `data-frame="local-time"`, `data-reveal="corner"`, static fallback `00:00 LOCAL`, and exact classes from the original Frame.astro span.
- Created `src/scripts/local-time.ts` — gate+cleanup lifecycle mirroring `paper-tone.ts`: `getTimeString()`, `applyTime()`, `cleanup()`, `init()`, `astro:before-swap`/`astro:after-swap` hooks, visibility-state pausing, hidden-tab init guard, double-interval guard. Zero imports.
- Updated `src/components/frame/Frame.astro` — replaced inline TR `<span>` with `<LocalTime />` import.
- Updated `src/layouts/BaseLayout.astro` — added `import '../scripts/local-time.ts'` to existing `<script>` block.
- Added `export {}` to `src/scripts/local-time.ts` and `src/scripts/paper-tone.ts` to establish ES module scope and resolve TS redeclaration errors.
- All ACs satisfied. `bun run format && bun run lint && bun run check` passes clean (0 errors, 0 warnings).

### File List

- `src/components/frame/LocalTime.astro` (created)
- `src/scripts/local-time.ts` (created)
- `src/components/frame/Frame.astro` (modified)
- `src/layouts/BaseLayout.astro` (modified)
- `src/scripts/paper-tone.ts` (modified — `export {}` added to fix module scope)

### Change Log

- 2026-05-23: Story 5.2 created — live local time in TR corner.
- 2026-05-23: Story 5.2 implemented — `LocalTime.astro` and `local-time.ts` created; `Frame.astro` and `BaseLayout.astro` updated; `export {}` added to `local-time.ts` and `paper-tone.ts` for ES module scope. All validation passes.

## Review Findings

- [x] [Review][Patch] Clock drift — interval not aligned to wall-clock minute boundary [src/scripts/local-time.ts] — Fixed. Replaced bare `setInterval` with `startAligned()`: a `setTimeout` fires at the next wall-clock minute boundary, then starts the 60s interval from there. Both IDs tracked in `timers[]` for cleanup. Display now updates within ~1s of the real minute change.
- [x] [Review][Defer] BR folio span has `data-reveal="corner"` — contradicts spec documentation [src/components/frame/Frame.astro:41] — deferred, pre-existing. Story Dev Notes document BR folio as intentionally NOT having `data-reveal="corner"` (always visible), but the actual code has had it since before this story. Means folio starts at opacity 0 and is revealed by reveal.ts — contradicts "always visible" intent. Not introduced by this story. Address when Frame.astro is next touched (likely 5.3 or 5.4).
