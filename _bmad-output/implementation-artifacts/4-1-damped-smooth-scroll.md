# Story 4.1: Damped Smooth Scroll

Status: done

## Story

As a desktop visitor reading long-form content,
I want scroll to feel gently damped and controlled,
so that the reading pace feels patient and considered rather than abrupt.

## Acceptance Criteria

1. `src/scripts/scroll.ts` is created following the gate+cleanup lifecycle pattern established in `cursor.ts` and `reveal.ts`
2. `ScrollTrigger.normalizeScroll()` is applied with custom easing (lerp ~0.08–0.1)
3. Scroll velocity decays gradually rather than tracking wheel input 1:1
4. The script gates on `COARSE_POINTER` — if true, native inertia scroll is used (no normalization listeners attached)
5. The script gates on `REDUCED_MOTION` — if true, native scroll is used on all devices
6. No `lenis` package appears in `package.json` or `bun.lock`
7. The `ScrollTrigger.normalizeScroll()` instance is registered for cleanup and killed on `astro:before-swap`
8. The script re-initializes on `astro:after-swap`
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/scripts/scroll.ts` with damped scroll (AC: #1, #2, #3, #4, #5, #7, #8)
  - [x] 1.1: Import `{ gsap, ScrollTrigger, REDUCED_MOTION, COARSE_POINTER }` from `./gsap-init`
  - [x] 1.2: Declare `instances` array typed as `{ kill: () => void }[]`
  - [x] 1.3: Implement `cleanup()` — kills all instances, empties array
  - [x] 1.4: Implement `init()` — dual gate on `COARSE_POINTER || REDUCED_MOTION`, then call `ScrollTrigger.normalizeScroll({ momentum: 0.09 })` and push the returned instance to `instances`
  - [x] 1.5: Register `document.addEventListener('astro:before-swap', cleanup)` and `document.addEventListener('astro:after-swap', init)`
  - [x] 1.6: Call `init()` at module end (initial run)

- [x] Task 2: Load `scroll.ts` only on long-form pages (AC: #1)
  - [x] 2.1: Add `<script>` tag importing `../../scripts/scroll` to `src/pages/projects/[...slug].astro`
  - [x] 2.2: Add `<script>` tag importing `../../scripts/scroll` to `src/pages/writing/[...slug].astro`
  - [x] 2.3: Do NOT add to `BaseLayout.astro` or `index.astro` — damped scroll is for long-form pages only

- [x] Task 3: Verify no lenis dependency (AC: #6)
  - [x] 3.1: Confirm `lenis` does not appear in `package.json` or `bun.lock`

- [x] Task 4: Run validation gate (AC: #9)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### This Story Creates `scroll.ts` — Stories 4.2 and 4.3 Will Extend It

`scroll.ts` is the home for all scroll-related behaviors. This story creates the file with damped scroll only. Stories 4.2 (section pin) and 4.3 (fog-lifting) will add their logic to the same file. Design the file structure to accommodate future additions cleanly — use clearly separated sections with comments.

### Exact Implementation Pattern

Follow the exact structure from `cursor.ts` and `reveal.ts`. Every script in `src/scripts/` follows this order:

```typescript
// src/scripts/scroll.ts
// Scroll behaviors — damped scroll, section pin, fog-lifting.
// Loaded only on long-form pages (project + essay).

import { gsap, ScrollTrigger, REDUCED_MOTION, COARSE_POINTER } from './gsap-init';

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Dual gate: no damped scroll on coarse pointer or reduced motion
  if (COARSE_POINTER || REDUCED_MOTION) return;

  // Damped smooth scroll via ScrollTrigger.normalizeScroll()
  // momentum ~0.09 = lerp ~0.08–0.1 per architecture spec (FR-23)
  const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
  instances.push(normalizer);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:after-swap', init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
```

### `ScrollTrigger.normalizeScroll()` API

`ScrollTrigger.normalizeScroll(config)` returns an object with a `.kill()` method. Push it directly to `instances`:

```typescript
const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
instances.push(normalizer);
```

The `momentum` value controls the lerp factor. `0.09` is the midpoint of the `0.08–0.1` range specified in FR-23. This is NOT a GSAP tween — it is a normalizer instance. It does not go in a GSAP timeline.

**Do NOT use `gsap.to()` or any tween for the scroll normalization.** `normalizeScroll` is a ScrollTrigger utility, not an animation.

### Where to Load `scroll.ts`

Per architecture: `scroll.ts` and `footnotes.ts` are loaded **only on project and essay pages**, not in BaseLayout.

```astro
<!-- In src/pages/projects/[...slug].astro -->
<script>
  import '../../scripts/scroll';
</script>

<!-- In src/pages/writing/[...slug].astro -->
<script>
  import '../../scripts/scroll';
</script>
```

Do NOT add to `BaseLayout.astro` or `src/pages/index.astro`. The home page uses native scroll.

### Architecture Compliance — Critical Rules

| Rule | Requirement |
|---|---|
| Import GSAP | Only from `./gsap-init` — never from `'gsap'` directly |
| Gate constants | Import `REDUCED_MOTION` and `COARSE_POINTER` from `./gsap-init` — never re-evaluate |
| Instance cleanup | Every instance pushed to `instances[]`, killed in `cleanup()` |
| No lenis | `ScrollTrigger.normalizeScroll()` is the architecture-mandated approach (FR-23 explicitly bans lenis) |
| No new dependencies | `package.json` is frozen — do not add any package |
| Lifecycle hooks | `astro:before-swap` → cleanup, `astro:after-swap` → init |

### Feature Gate Matrix (from architecture)

| Gate | Condition | Behavior |
|---|---|---|
| `COARSE_POINTER` | `pointer: coarse` (mobile/touch) | Native inertia scroll — no normalization |
| `REDUCED_MOTION` | `prefers-reduced-motion: reduce` | Native scroll on all devices |

Both gates use the same early return: `if (COARSE_POINTER || REDUCED_MOTION) return;`

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `gsap-init.ts` with `ScrollTrigger` registered | `src/scripts/gsap-init.ts` | ScrollTrigger is already registered globally — do NOT call `gsap.registerPlugin(ScrollTrigger)` again in `scroll.ts` |
| `REDUCED_MOTION` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| `COARSE_POINTER` constant | `src/scripts/gsap-init.ts` | Import, do not re-declare |
| Global ticker pause on `visibilitychange` | `src/scripts/gsap-init.ts` | Already handled — do NOT add another `visibilitychange` listener in `scroll.ts` |
| `astro:before-swap` / `astro:after-swap` pattern | `cursor.ts`, `reveal.ts` | Established pattern — follow exactly |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/scripts/scroll.ts` | Damped scroll (this story) + section pin (4.2) + fog-lifting (4.3) |

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/pages/projects/[...slug].astro` | Add `<script>` importing `scroll.ts` |
| `src/pages/writing/[...slug].astro` | Add `<script>` importing `scroll.ts` |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/cursor.ts` — unrelated
- `src/scripts/reveal.ts` — unrelated
- `src/scripts/view-transitions.ts` — unrelated
- `src/styles/global.css` — no CSS changes needed for damped scroll
- `src/layouts/BaseLayout.astro` — do NOT add scroll script here

### Edge Cases & Defensive Coding

- **`ScrollTrigger.normalizeScroll()` returns `null` in some environments**: Wrap in a null check if TypeScript complains, but in practice it always returns an instance in browser context.
- **Multiple navigations**: `cleanup()` kills the normalizer before `init()` creates a new one on `astro:after-swap`. This is correct — no double-normalization.
- **Home page**: No `scroll.ts` loaded there. Native scroll on home page is intentional.
- **404 page**: No `scroll.ts` loaded. Native scroll. Correct.

### Previous Story Intelligence

From Story 3.5 (Inkstroke):
- No GSAP was needed for CSS-only effects. This story IS GSAP — use `ScrollTrigger.normalizeScroll()`.
- The `bun run format && bun run lint && bun run check` gate passed cleanly. Expect the same here.

From Story 3.3 (Cursor Afterglow):
- The `instances` array pattern with `.kill()` is the correct cleanup approach.
- `COARSE_POINTER` gate prevents the feature from running on touch devices.
- The `astro:before-swap` / `astro:after-swap` lifecycle is the established pattern.

From Story 3.1 (GSAP Init):
- `ScrollTrigger` is already registered in `gsap-init.ts`. Do NOT register it again.
- All scripts import from `./gsap-init`, never from `'gsap'` directly.

### GSAP Budget Impact

`ScrollTrigger.normalizeScroll()` is part of the already-imported ScrollTrigger plugin (~12KB gzip, already counted in the budget). No additional GSAP code is needed. This story adds ~0.5KB of site script.

### Reduced-Motion Behavior

Under `prefers-reduced-motion: reduce`:
- `REDUCED_MOTION` is `true` → `init()` returns immediately
- Native browser scroll is used
- No ScrollTrigger normalizer is created
- No cleanup needed (nothing was registered)

### References

- [FR-23] — Damped smooth scroll on desktop: `ScrollTrigger.normalizeScroll()` with lerp ~0.08–0.1. Disabled on `pointer: coarse` and `prefers-reduced-motion`. No lenis dependency.
- [NFR-2] — JS Budget ≤60KB gzip total
- [NFR-9] — Animation performance: transform + opacity only (scroll normalization does not animate properties)
- [UX-DR2] — Mobile layout adaptation: no damped scroll on `pointer: coarse`
- [Architecture: Client-Side Script Architecture] — gate+cleanup lifecycle, per-page loading, single GSAP entry point
- [Architecture: Feature Gate Matrix] — `scroll.ts` gates on both `REDUCED_MOTION` and `COARSE_POINTER`
- [Architecture: Implementation Patterns] — script file structure, import rules, instance registry

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. Implementation was straightforward following the established pattern.

### Completion Notes List

- Created `src/scripts/scroll.ts` following the exact gate+cleanup lifecycle pattern from `cursor.ts` and `reveal.ts`.
- `ScrollTrigger.normalizeScroll({ momentum: 0.09 })` provides lerp ~0.08–0.1 per FR-23.
- Dual gate on `COARSE_POINTER || REDUCED_MOTION` — native scroll used on touch/reduced-motion devices.
- `gsap` import retained with `void gsap` to suppress unused-import lint warning; it will be used by stories 4.2 and 4.3 when they extend this file.
- Null check on `normalizer` added as defensive coding per Dev Notes edge case guidance.
- `<script>` tags added to both `projects/[...slug].astro` and `writing/[...slug].astro` only — not BaseLayout or index.
- Confirmed `lenis` absent from `package.json` and `bun.lock`.
- `bun run format && bun run lint && bun run check` all passed with 0 errors, 0 warnings.

### File List

- `src/scripts/scroll.ts` (created)
- `src/pages/projects/[...slug].astro` (modified — added scroll script import)
- `src/pages/writing/[...slug].astro` (modified — added scroll script import)

## Change Log

- 2026-05-23: Story 4.1 implemented — created `scroll.ts` with damped smooth scroll via `ScrollTrigger.normalizeScroll()`, loaded on project and essay pages only. All ACs satisfied, validation gate passed.
