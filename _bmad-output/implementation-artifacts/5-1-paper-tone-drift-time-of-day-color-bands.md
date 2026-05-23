# Story 5.1: Paper-Tone Drift — Time-of-Day Color Bands

Status: done

## Story

As a visitor,
I want the page background to subtly reflect the time of day,
so that the site feels alive and rewards returning at different hours.

## Acceptance Criteria

1. `src/scripts/paper-tone.ts` is created following the gate+cleanup lifecycle pattern
2. On page load, the script reads the visitor's local time and sets `--paper-tone` on `:root` to one of four OKLCH bands:
   - Pre-dawn (04:00–07:00): cool grey-cream
   - Midday (07:00–16:00): warm white-cream (default — already in `:root` as `oklch(0.97 0.008 80)`)
   - Dusk (16:00–20:00): warm cream-amber
   - Night (20:00–04:00): cool warm-grey
3. At each band, `--ink` on `--paper` clears WCAG 2.2 AA contrast (≥4.5:1 for body text, ≥3:1 for corner labels)
4. If the visitor leaves the tab open across a band boundary, `--paper-tone` updates to the new band within 60 seconds
5. Under `prefers-reduced-motion: reduce`, the band still resolves correctly but transitions cut hard (no interpolation between bands)
6. The script runs on every device (not gated by pointer type — paper-tone is information, not motion)
7. Cleanup on `astro:before-swap` and re-init on `astro:after-swap`
8. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/scripts/paper-tone.ts` with gate+cleanup lifecycle (AC: #1, #6, #7)
  - [x] 1.1: Add file header comment: `// src/scripts/paper-tone.ts` / `// Time-of-day paper-tone drift.` / `// Loaded in BaseLayout (every page).`
  - [x] 1.2: No imports needed — `paper-tone.ts` uses only native browser APIs (`setInterval`, `clearInterval`, `document.documentElement`, `new Date()`). Do NOT import from `gsap-init.ts` or any other module.
  - [x] 1.3: Add Instance Registry section: `const intervals: ReturnType<typeof setInterval>[] = [];` and `let visibilityHandler: (() => void) | null = null;`
  - [x] 1.4: Add Cleanup function that clears all intervals, resets `intervals.length = 0`, removes the `visibilityHandler` listener, and sets `visibilityHandler = null`
  - [x] 1.5: Add Init function (see Dev Notes for full implementation)
  - [x] 1.6: Add Lifecycle hooks: `document.addEventListener('astro:before-swap', cleanup)` and `document.addEventListener('astro:after-swap', init)`
  - [x] 1.7: Add Initial Run: `init();`

- [x] Task 2: Implement band resolution and `--paper-tone` update (AC: #2, #3, #5)
  - [x] 2.1: Define the four OKLCH band values as constants (see Dev Notes for exact values and contrast verification)
  - [x] 2.2: Implement `getBand(hour: number): string` — returns the OKLCH string for the given hour
  - [x] 2.3: Implement `applyBand()` — reads `new Date().getHours()`, calls `getBand()`, sets `document.documentElement.style.setProperty('--paper-tone', band)`
  - [x] 2.4: In `init()`, call `applyBand()` immediately on load
  - [x] 2.5: Set up a `setInterval` that calls `applyBand()` every 60 seconds; push to `intervals[]`
  - [x] 2.6: No gate on `REDUCED_MOTION` or `COARSE_POINTER` — paper-tone is information, not motion. The script always calls `applyBand()` and sets up the interval regardless of accessibility preferences.

- [x] Task 3: Implement visibility-state pause (AC: #4)
  - [x] 3.1: Add a `visibilitychange` listener that clears the interval on `hidden` and re-calls `applyBand()` + restarts the interval on `visible`
  - [x] 3.2: Track the visibility listener reference for cleanup (see Dev Notes for the correct pattern)

- [x] Task 4: Load `paper-tone.ts` in BaseLayout (AC: #1)
  - [x] 4.1: In `src/layouts/BaseLayout.astro`, add `import '../scripts/paper-tone.ts';` inside the existing `<script>` block (alongside `reveal.ts`, `cursor.ts`, and `view-transitions.ts`) — match the `.ts` extension used by all existing imports in that block
  - [x] 4.2: Verify the import is in the existing `<script>` block — do NOT create a second `<script>` block

- [x] Task 5: Run validation gate (AC: #8)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### This Story Creates `paper-tone.ts` — A New Script File

`paper-tone.ts` is a new file in `src/scripts/`. It is loaded in `BaseLayout.astro` (every page), not just on long-form pages. It does NOT use GSAP or ScrollTrigger — it only needs the `REDUCED_MOTION` constant from `gsap-init.ts` (and even that is imported but not used as a gate — see below).

**Important:** Unlike `cursor.ts`, `scroll.ts`, and `footnotes.ts`, `paper-tone.ts` is NOT gated on `REDUCED_MOTION` or `COARSE_POINTER`. Paper-tone drift is information (the site's ambient state), not motion. It runs on every device, under every accessibility preference. The architecture explicitly states: "The script runs on every device (not gated by pointer type — paper-tone is information, not motion)."

However, `REDUCED_MOTION` is still relevant for one thing: under reduced motion, band transitions cut hard (no interpolation). Since this story does not implement interpolation between bands (bands cut hard by design — no CSS transition on `--paper-tone`), the reduced-motion behavior is already correct by default. No special gate needed.

### OKLCH Band Values — Verified for WCAG AA Contrast

The four bands must maintain ≥4.5:1 contrast for `--ink` (`oklch(0.18 0.008 80)`) against `--paper-tone`, and ≥3:1 for `--meta` (`oklch(0.5 0.005 80)`) against `--paper-tone`.

**Contrast verification methodology:** OKLCH contrast is computed via the APCA (Accessible Perceptual Contrast Algorithm) or WCAG 2.1 relative luminance formula. The lightness (L) component in OKLCH is perceptually uniform, making contrast estimation reliable from L values alone for small chroma values.

For `--ink` at `oklch(0.18 0.008 80)` (very dark, ~18% lightness) against a light paper background (~90–97% lightness), the contrast ratio will be well above 4.5:1 across all four bands. The critical check is `--meta` at `oklch(0.5 0.005 80)` (~50% lightness) against the paper bands.

**Recommended band values (implement these exactly):**

```typescript
// Pre-dawn (04:00–07:00): cool grey-cream — slightly cooler hue, lower chroma
const BAND_PREDAWN = "oklch(0.94 0.006 80)";

// Midday (07:00–16:00): warm white-cream — matches the existing :root default
const BAND_MIDDAY = "oklch(0.97 0.008 80)";

// Dusk (16:00–20:00): warm cream-amber — warmer hue shift, slightly lower lightness
const BAND_DUSK = "oklch(0.93 0.012 75)";

// Night (20:00–04:00): cool warm-grey — lower lightness, reduced chroma
const BAND_NIGHT = "oklch(0.91 0.006 80)";
```

**Contrast check for each band against `--meta` (`oklch(0.5 0.005 80)`):**
- Pre-dawn (L=0.94): Δ lightness = 0.44 → contrast well above 3:1 ✅
- Midday (L=0.97): Δ lightness = 0.47 → contrast well above 3:1 ✅
- Dusk (L=0.93): Δ lightness = 0.43 → contrast well above 3:1 ✅
- Night (L=0.91): Δ lightness = 0.41 → contrast well above 3:1 ✅

**Contrast check for each band against `--ink` (`oklch(0.18 0.008 80)`):**
All bands have L ≥ 0.91 against ink at L=0.18 → Δ ≥ 0.73 → contrast well above 4.5:1 ✅

**Implementation note:** The midday band value `oklch(0.97 0.008 80)` exactly matches the existing `:root` default for `--paper-tone` in `global.css`. This means the midday band produces no visual change from the current default — correct behavior.

### Complete `paper-tone.ts` Structure

```typescript
// src/scripts/paper-tone.ts
// Time-of-day paper-tone drift.
// Loaded in BaseLayout (every page).
//
// NOT gated on REDUCED_MOTION or COARSE_POINTER — paper-tone is information,
// not motion. Runs on every device under every accessibility preference.

// ─── Band Definitions ─────────────────────────────────────────────────────────
// Four OKLCH values, one per time-of-day band.
// All bands verified for WCAG 2.2 AA contrast against --ink and --meta.
// Midday matches the :root default in global.css (no visual change at midday).

const BAND_PREDAWN = "oklch(0.94 0.006 80)"; // 04:00–07:00 cool grey-cream
const BAND_MIDDAY  = "oklch(0.97 0.008 80)"; // 07:00–16:00 warm white-cream (default)
const BAND_DUSK    = "oklch(0.93 0.012 75)"; // 16:00–20:00 warm cream-amber
const BAND_NIGHT   = "oklch(0.91 0.006 80)"; // 20:00–04:00 cool warm-grey

// ─── Band Resolution ──────────────────────────────────────────────────────────
function getBand(hour: number): string {
  if (hour >= 4 && hour < 7)  return BAND_PREDAWN;
  if (hour >= 7 && hour < 16) return BAND_MIDDAY;
  if (hour >= 16 && hour < 20) return BAND_DUSK;
  return BAND_NIGHT; // 20:00–04:00
}

// ─── Apply Band ───────────────────────────────────────────────────────────────
function applyBand(): void {
  const hour = new Date().getHours();
  const band = getBand(hour);
  document.documentElement.style.setProperty("--paper-tone", band);
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
  // Apply the correct band immediately on load.
  applyBand();

  // Poll every 60 seconds to catch band boundary crossings.
  // setInterval fires at the interval, not at the exact minute boundary —
  // worst case: up to 60 seconds late. Acceptable for ambient color drift.
  const id = setInterval(applyBand, 60_000);
  intervals.push(id);

  // Pause polling when tab is hidden; re-apply and restart when visible.
  // This prevents background ticking and ensures the band is correct
  // when the visitor returns to the tab after a long absence.
  visibilityHandler = () => {
    if (document.hidden) {
      intervals.forEach((i) => clearInterval(i));
      intervals.length = 0;
    } else {
      // Re-apply immediately in case the band changed while hidden.
      applyBand();
      const newId = setInterval(applyBand, 60_000);
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

### Why `document.documentElement.style.setProperty` (not `document.body`)

The CSS token `--paper-tone` is defined on `:root` in `global.css`. Setting it on `document.documentElement` (which is `<html>`, the same as `:root`) overrides the `:root` declaration via the inline style specificity cascade. Setting it on `document.body` would also work (body inherits from html), but `:root` is the canonical location for CSS custom properties in this project. Use `document.documentElement` for consistency.

### Why `setInterval` (not `setTimeout` chain or `requestAnimationFrame`)

- `setInterval(applyBand, 60_000)` is the simplest correct implementation. It fires approximately every 60 seconds and re-reads the current hour each time.
- A `setTimeout` chain would be more precise (fire at the exact minute boundary) but adds complexity for no user-visible benefit — the drift is ambient and imperceptible at the 60-second scale.
- `requestAnimationFrame` is for per-frame animation, not minute-scale polling. Do NOT use it here.
- The `setInterval` approach is consistent with `local-time.ts` (Story 5.2), which uses the same pattern.

### Visibility State Pause — Why and How

The `visibilitychange` listener prevents background ticking when the tab is hidden. Without it:
- The interval fires every 60 seconds even when the tab is not visible
- On a long absence (e.g., visitor leaves the tab open overnight), the interval fires ~480 times unnecessarily
- The band is already correct when the visitor returns (the interval kept updating), but the CPU cost is wasted

The pattern:
1. On `hidden`: clear all intervals (stop polling)
2. On `visible`: call `applyBand()` immediately (correct the band if it changed while hidden), then restart the interval

**Important:** The `visibilityHandler` reference is stored at module scope so `cleanup()` can remove the listener on navigation. Without this, the listener would accumulate across View Transitions (one new listener per navigation).

**Why store the reference:** `document.removeEventListener` requires the exact same function reference that was passed to `addEventListener`. An anonymous function `() => { ... }` cannot be removed because each call creates a new reference. Storing `visibilityHandler` at module scope is the correct pattern.

**Not the same as `gsap-init.ts`'s `visibilitychange` listener:** `gsap-init.ts` also adds a `visibilitychange` listener (to pause/resume `gsap.globalTimeline`). That listener is a separate, persistent, document-level concern — it is intentionally NOT cleaned up on navigation. `paper-tone.ts`'s listener is different and must be cleaned up. Do NOT consolidate them.

### Loading in BaseLayout — Existing `<script>` Block

`BaseLayout.astro` already has a `<script>` block that imports `reveal.ts`, `cursor.ts`, and `view-transitions.ts`. Add `paper-tone.ts` to the same block, matching the existing `.ts` extension convention:

```astro
<script>
  import "../scripts/reveal.ts";
  import "../scripts/cursor.ts";
  import "../scripts/view-transitions.ts";
  import "../scripts/paper-tone.ts";
</script>
```

Do NOT create a second `<script>` block. Vite bundles all imports in a single `<script>` block together. Note the `.ts` extension — the existing imports all use it; match the pattern exactly.

### No GSAP Dependency — No Imports at All

`paper-tone.ts` has **zero imports**. It uses only native browser APIs:
- `setInterval` / `clearInterval`
- `document.documentElement.style.setProperty`
- `document.addEventListener` / `document.removeEventListener`
- `new Date().getHours()`
- `document.hidden`

This is intentional. GSAP is for animation; paper-tone is a data update. There is no reason to import `gsap-init.ts` — not even for `REDUCED_MOTION`, since paper-tone is not gated on reduced motion. Do NOT add any import statement to this file.

**Budget impact:** `paper-tone.ts` adds ~0.5KB of site script. Current budget: ~46.5KB gzip. After this story: ~47KB. Budget ceiling: 60KB. Comfortable headroom.

### CSS — No Changes Needed

`global.css` already has:
```css
--paper-tone: oklch(0.97 0.008 80); /* default midday band; overridden by JS in Epic 5 */
```

This comment was written in anticipation of this story. The JS sets `--paper-tone` via inline style on `<html>`, which overrides the `:root` declaration. No CSS changes are needed.

**No CSS transition on `--paper-tone`:** The band cuts hard (no interpolation). This is correct per the spec: "Under prefers-reduced-motion: reduce, band cuts hard (no interpolation)." Since there is no interpolation at all (not just under reduced motion), the reduced-motion behavior is already correct by default. Do NOT add a CSS transition to `--paper-tone`.

### Side-Effect Cleanup (Epic 4 Retro Action Item)

Per the Epic 4 retrospective action item: "Add side-effect cleanup documentation to Dev Notes — track inline styles, DOM injections, and growing arrays alongside instance registry."

**Side effects introduced by `paper-tone.ts`:**

| Side Effect | Introduced by | Cleaned up by |
|---|---|---|
| `setInterval` ID in `intervals[]` | `init()` | `cleanup()` via `clearInterval` |
| `visibilitychange` listener | `init()` | `cleanup()` via `removeEventListener` |
| Inline style `--paper-tone` on `<html>` | `applyBand()` | NOT cleaned up — intentional |

**Why the inline style is NOT cleaned up:** The `--paper-tone` inline style on `<html>` is the desired persistent state. Removing it on `astro:before-swap` would cause a flash back to the `:root` default (midday) during the transition, then re-apply the correct band on `astro:after-swap`. This would be a visible flicker. The correct behavior is to leave the inline style in place across navigations — the band is the same regardless of which page is being viewed.

### `getBand` — Hour Boundary Logic

```
hour >= 4  && hour < 7  → PREDAWN   (04:00, 05:00, 06:00)
hour >= 7  && hour < 16 → MIDDAY    (07:00 … 15:00)
hour >= 16 && hour < 20 → DUSK      (16:00, 17:00, 18:00, 19:00)
else                    → NIGHT     (20:00 … 03:00)
```

`new Date().getHours()` returns an integer 0–23 in the visitor's local time zone. No UTC conversion needed — the spec explicitly says "visitor's local time."

**Edge case — midnight:** `hour = 0` → falls through all conditions → returns `BAND_NIGHT`. Correct.
**Edge case — exactly 04:00:** `hour = 4` → `hour >= 4 && hour < 7` → returns `BAND_PREDAWN`. Correct.
**Edge case — exactly 20:00:** `hour = 20` → falls through predawn and midday and dusk → returns `BAND_NIGHT`. Correct.

### Feature Gate Matrix for `paper-tone.ts`

| Gate | Condition | Behavior |
|---|---|---|
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | **NOT gated** — band resolves and updates normally |
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | **NOT gated** — band resolves and updates normally |
| `document.hidden` | Tab not visible | Interval paused; re-applied on `visible` |

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `--paper-tone` CSS custom property | `src/styles/global.css` `:root` | Default midday value; JS overrides via inline style |
| `--paper` referencing `--paper-tone` | `src/styles/global.css` `:root` | `--paper: var(--paper-tone)` — no change needed |
| `<script>` block in BaseLayout | `src/layouts/BaseLayout.astro` | Add `paper-tone.ts` import here; use `.ts` extension |
| `visibilitychange` listener for GSAP | `src/scripts/gsap-init.ts` | Pauses `gsap.globalTimeline` — independent; do NOT consolidate |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/scripts/paper-tone.ts` | Time-of-day band resolution, `--paper-tone` update, interval lifecycle |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/layouts/BaseLayout.astro` | Add `import '../scripts/paper-tone';` to existing `<script>` block |

### Files to NOT Touch

- `src/styles/global.css` — `--paper-tone` default is correct as-is; no CSS changes needed
- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/scroll.ts` — unrelated
- `src/scripts/footnotes.ts` — unrelated
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- Any component file — no component changes needed for this story

### A11y Interaction Checklist

- [ ] Under `prefers-reduced-motion`, paper-tone still resolves and updates — it is information, not motion
- [ ] Under `pointer: coarse`, paper-tone still resolves and updates — it is information, not motion
- [ ] All four bands maintain ≥4.5:1 contrast for `--ink` against `--paper-tone` (verified in Dev Notes)
- [ ] All four bands maintain ≥3:1 contrast for `--meta` against `--paper-tone` (verified in Dev Notes)
- [ ] No animation, no transition, no GSAP — no motion accessibility concern
- [ ] The `visibilitychange` listener is removed on navigation — no zombie listeners

### Cross-Browser Edge Cases

- **Safari + CSS custom properties on `:root`:** `document.documentElement.style.setProperty` works correctly in all modern browsers including Safari. The inline style overrides the `:root` declaration via specificity. No known issues.
- **iOS Safari (mobile):** `new Date().getHours()` returns local time on all platforms. No UTC/timezone issue. `setInterval` works normally on iOS Safari.
- **Firefox + OKLCH:** OKLCH is supported in Firefox 113+ (released May 2023). The project targets "latest 2 versions" — all supported browsers support OKLCH. No fallback needed.
- **Tab open across midnight:** `hour = 23` → NIGHT. At midnight, `hour = 0` → NIGHT. No band change at midnight. Correct.
- **Tab open across 04:00 boundary:** Interval fires within 60 seconds of 04:00. `hour` changes from 3 to 4. `getBand(4)` returns `BAND_PREDAWN`. `--paper-tone` updates. Correct.
- **Multiple tabs:** Each tab runs its own `paper-tone.ts` instance. Each sets `--paper-tone` on its own `document.documentElement`. No cross-tab interference.
- **SSR/static output:** `paper-tone.ts` is a client-side script. It runs after the static HTML is served. The `:root` default (`oklch(0.97 0.008 80)`) is the server-rendered value; the JS overrides it on the client. There is a brief window (before JS executes) where the midday default is shown regardless of time. This is acceptable — the spec acknowledges this as the "honest first paint" behavior.

### Previous Story Intelligence (from Story 4.4 and Epic 4 Retro)

- The `instances[]` + `cleanup()` pattern is established. This story uses `intervals[]` instead (same concept, different type).
- The `visibilityHandler` reference pattern (store → remove in cleanup) is the correct approach for event listeners that need cleanup. This is the same pattern used in `local-time.ts` (Story 5.2).
- **Epic 4 Retro Action Item #2:** "Add side-effect cleanup documentation to Dev Notes." This story's Dev Notes include the side-effect cleanup table above. ✅
- **Epic 4 Retro Action Item #1:** "Introduce `--dur-mark: 250ms` token." This story does not introduce animation, so this token is not relevant here. The token should be introduced in Story 5.4 (hover hero reveal) or as a standalone token pass.
- `REDUCED_MOTION` evaluated once at module load — this story does not import `REDUCED_MOTION`, so the stale-constant issue does not apply.
- `overwrite: true` on `gsap.to()` — not applicable; this story uses no GSAP.
- `document.fonts.ready.then(ScrollTrigger.refresh)` — not applicable; this story uses no ScrollTrigger.

### GSAP Budget Impact

`paper-tone.ts` does not import GSAP. No budget impact from GSAP. Site script adds ~0.5KB gzip.

Current budget: ~46.5KB gzip (from Story 4.4 estimate). After this story: ~47KB. Budget ceiling: 60KB. 13KB headroom remains for Stories 5.2–5.4.

### References

- [FR-8] — Time-of-day paper-tone drift: JS reads visitor's local time and sets `--paper-tone` to one of four bands. All bands clear WCAG 2.2 AA contrast. Under prefers-reduced-motion, band cuts hard (no interpolation).
- [UX-DR9] — Paper-tone band time ranges: Pre-dawn (04:00–07:00), Midday (07:00–16:00), Dusk (16:00–20:00), Night (20:00–04:00).
- [Architecture: CSS Token & Styling Architecture] — `--paper-tone` as CSS custom property; JS updates it; `--paper: var(--paper-tone)` propagates to all consumers.
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading, visibility-state pausing.
- [Architecture: Feature Gate Matrix] — `paper-tone.ts` not gated on `REDUCED_MOTION` or `COARSE_POINTER`.
- [Epic 4 Retro] — Side-effect cleanup documentation action item; `--dur-mark` token action item (not applicable here).
- [global.css] — `--paper-tone: oklch(0.97 0.008 80)` default; `--paper: var(--paper-tone)`.

## Review Findings

- [x] [Review][Patch] Double-interval on rapid visibilitychange — visible-branch of `visibilityHandler` pushes a new interval without checking if `intervals[]` is already populated; rapid or duplicate `visibilitychange` events stack intervals [src/scripts/paper-tone.ts ~line 63]
- [x] [Review][Patch] Interval starts in hidden tab on initial load — module-level `init()` unconditionally starts the interval even if the tab is already hidden at load time (background open, bfcache restore), bypassing the visibility-pause logic [src/scripts/paper-tone.ts ~line 75]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_none_

### Completion Notes List

- Created `src/scripts/paper-tone.ts` with zero imports — native browser APIs only.
- Implemented four OKLCH band constants (PREDAWN, MIDDAY, DUSK, NIGHT) matching Dev Notes exactly.
- `getBand(hour)` covers all 24 hours with correct boundary logic; NIGHT is the default fallback.
- `applyBand()` sets `--paper-tone` on `document.documentElement` (`:root` equivalent).
- `init()` applies band immediately, starts 60s interval, and registers `visibilitychange` listener with stored reference for cleanup.
- `cleanup()` clears all intervals, removes the visibility listener — called on `astro:before-swap`.
- `init()` re-runs on `astro:after-swap` — correct View Transitions lifecycle.
- Inline style on `<html>` intentionally NOT removed in cleanup (avoids flash-to-midday on navigation).
- Added `import '../scripts/paper-tone.ts'` to the existing `<script>` block in `BaseLayout.astro` — no second block created.
- `bun run format`, `bun run lint`, `bun run check` all pass with 0 errors.

### File List

- `src/scripts/paper-tone.ts` — created
- `src/layouts/BaseLayout.astro` — modified (added paper-tone.ts import)

### Change Log

- 2026-05-23: Story 5.1 created — paper-tone drift, time-of-day color bands.
- 2026-05-23: Story 5.1 implemented — `paper-tone.ts` created, loaded in BaseLayout. All ACs satisfied. Validation passes.
