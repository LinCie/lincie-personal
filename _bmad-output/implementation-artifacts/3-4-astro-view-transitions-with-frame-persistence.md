# Story 3.4: Astro View Transitions with Frame Persistence

Status: done

## Story

As a visitor navigating between pages,
I want the Frame to stay stable while content cross-fades smoothly,
So that I never lose my spatial orientation during navigation.

## Acceptance Criteria

1. Frame elements (corner labels) use `transition:persist` and do not flicker during transitions — **already implemented in Story 1.4; verify it still holds**
2. The content area cross-fades with ~600ms duration using custom keyframes: exit = opacity 1→0 + translateY(0→8px), enter = opacity 0→1 + translateY(-8px→0)
3. The easing uses `var(--ease-settle)` (cubic-bezier(0.25, 0.1, 0.25, 1))
4. Project titles carry `transition:name="project-title-{slug}"` and morph between index and detail pages — **already implemented in Stories 2.1 and 2.5; verify it still holds**
5. The same `transition:name` value is never used on two unrelated routes
6. The BL section label updates on route change (via `astro:after-swap`)
7. The `aria-current` attribute on the INDEX link updates on route change (via `astro:after-swap`) — deferred from Story 1.4
8. Under `prefers-reduced-motion`, transitions paint to final state instantly
9. No slide-in-from-below behavior — only the 8px settle/drift
10. BR folio update on route change is **deferred to Story 5.3** (scroll-driven folio) — the folio is currently a static placeholder with no per-page content to update
11. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Add custom View Transition keyframes to `global.css` (AC: #2, #3, #8, #9)
  - [x] 1.1: Define `@keyframes vt-exit` — opacity 1→0, translateY 0→8px, easing `var(--ease-settle)`, duration `var(--dur-arrive)` (600ms)
  - [x] 1.2: Define `@keyframes vt-enter` — opacity 0→1, translateY -8px→0, easing `var(--ease-settle)`, duration `var(--dur-arrive)` (600ms)
  - [x] 1.3: Apply keyframes to `::view-transition-old(main-content)` and `::view-transition-new(main-content)` pseudo-elements
  - [x] 1.4: Verify `@media (prefers-reduced-motion: reduce)` safety net in `global.css` already collapses these durations to 0.01ms (it does — no additional work needed)

- [x] Task 2: Add `transition:name` to `<main>` in `BaseLayout.astro` (AC: #2, #3)
  - [x] 2.1: Add `transition:name="main-content"` to the `<main>` element so the custom keyframes target the correct view-transition layer
  - [x] 2.2: Confirm `transition:animate="fade"` is removed or replaced — the custom keyframes supersede Astro's built-in fade

- [x] Task 3: Create `src/scripts/view-transitions.ts` — post-swap DOM updates (AC: #6, #7)
  - [x] 3.1: On `astro:after-swap`, read the new page's `sectionLabel` from a `data-section-label` attribute on `<body>` (or `<main>`) and update the BL corner span's text content
  - [x] 3.2: On `astro:after-swap`, update `aria-current="page"` on the INDEX `<a>` if the current URL is `/`, remove it otherwise
  - [x] 3.3: Follow the gate+cleanup lifecycle pattern (no GSAP needed — pure DOM updates)
  - [x] 3.4: Add `document.addEventListener("astro:after-swap", update)` and call `update()` on initial load

- [x] Task 4: Expose `sectionLabel` as a `data-` attribute in `BaseLayout.astro` (AC: #6)
  - [x] 4.1: Add `data-section-label={sectionLabel ?? ""}` to `<body>` so `view-transitions.ts` can read it after swap

- [x] Task 5: Load `view-transitions.ts` in `BaseLayout.astro` (AC: #6, #7)
  - [x] 5.1: Add `import "../scripts/view-transitions.ts"` to the existing `<script>` block in `BaseLayout.astro`

- [x] Task 6: Run validation gate (AC: #11)
  - [x] 6.1: `bun run format`
  - [x] 6.2: `bun run lint`
  - [x] 6.3: `bun run check`

## Dev Notes

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `<ClientRouter />` in `<head>` | `BaseLayout.astro` | Astro View Transitions engine — do not touch |
| `transition:persist` on `<Frame />` | `BaseLayout.astro` | Frame stability — do not touch |
| `transition:animate="fade"` on `<main>` | `BaseLayout.astro` | **Replace with `transition:name="main-content"`** — custom keyframes supersede this |
| `transition:name={`project-title-${slug}`}` on `<h2>` | `ProjectBand.astro` | Title FLIP-echo source — do not touch |
| `transition:name={`project-title-${entry.id}`}` on `<h1>` | `projects/[...slug].astro` | Title FLIP-echo target — do not touch |
| `[data-reveal="corner"]` opacity gate | `global.css` | Reveal sequence CSS — do not touch |

### Architecture Compliance

- **No new dependencies.** This story uses only Astro's built-in View Transitions API and vanilla DOM APIs. No GSAP needed.
- **Single GSAP entry point rule still applies** to any future scripts — but `view-transitions.ts` does NOT use GSAP.
- **Gate+cleanup lifecycle pattern** applies even without GSAP: `astro:after-swap` listener for re-init, no `astro:before-swap` needed (DOM updates are idempotent).
- **Animation properties**: The CSS keyframes use `opacity` and `translateY` (transform) only. Correct per architecture.
- **Duration token**: Use `var(--dur-arrive)` (600ms) for the transition duration. Do not hardcode `600ms`.
- **Easing token**: Use `var(--ease-settle)` for the animation timing function. Do not hardcode the cubic-bezier.

### Custom Keyframes — Exact Implementation

Add to `global.css` after the existing `[data-reveal="corner"]` block:

```css
/* ============================================================
   VIEW TRANSITION KEYFRAMES — 8px settle/drift
   Exit: content slides down 8px and fades out.
   Enter: content drifts up from -8px and fades in.
   Easing and duration reference token layer.
   ============================================================ */
@keyframes vt-exit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes vt-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::view-transition-old(main-content) {
  animation: vt-exit var(--dur-arrive) var(--ease-settle) both;
}

::view-transition-new(main-content) {
  animation: vt-enter var(--dur-arrive) var(--ease-settle) both;
}
```

**`both` fill mode** prevents flash of unstyled content at animation boundaries. **`main-content`** matches `transition:name="main-content"` on `<main>` — Astro generates the corresponding pseudo-elements automatically.

**Reduced-motion**: The existing safety net in `global.css` sets `animation-duration: 0.01ms !important` — collapses keyframe duration to near-instant. No additional reduced-motion CSS needed.

### BaseLayout.astro — Exact Diff

```diff
- <main id="main-content" tabindex="-1" transition:animate="fade">
+ <main id="main-content" tabindex="-1" transition:name="main-content">
```

```diff
  <body class="bg-paper text-ink">
+ <body class="bg-paper text-ink" data-section-label={sectionLabel ?? ""}>
```

```diff
  <script>
    import "../scripts/reveal.ts";
    import "../scripts/cursor.ts";
+   import "../scripts/view-transitions.ts";
  </script>
```

**Why remove `transition:animate="fade"`**: Astro's built-in `fade` directive applies its own keyframes. Adding `transition:name` with custom `::view-transition-old/new` CSS overrides the built-in behavior. Keeping both would cause a conflict. The custom keyframes are the spec requirement.

**Why `data-section-label` on `<body>`**: The Frame is `transition:persist` — it survives navigation without re-rendering. Its `sectionLabel` prop is baked in at build time and does NOT update on client-side navigation. The `view-transitions.ts` script reads the new page's `data-section-label` from `<body>` (which IS replaced on navigation) and pushes the value into the persisted Frame's BL span.

### view-transitions.ts — Full Implementation

```typescript
// src/scripts/view-transitions.ts
// Post-swap DOM updates for View Transitions.
// Updates the persisted Frame's BL section label and INDEX aria-current.
//
// No GSAP. No gates. Pure DOM updates — idempotent on every navigation.
// Loaded in BaseLayout (every page).

// ─── Selectors ────────────────────────────────────────────────────────────────
// BL corner span: the third [data-reveal="corner"] element (TL nav, TR span, BL span, BR span)
// Use a stable data attribute rather than nth-child to avoid fragility.
// Frame.astro does not currently have a data attribute on the BL span — add one.
// See "Frame.astro BL span" section below.

function update(): void {
  // Read new page's section label from <body data-section-label>
  const sectionLabel = document.body.dataset.sectionLabel ?? "";

  // Update BL corner span text
  const blSpan = document.querySelector<HTMLElement>("[data-frame='section-label']");
  if (blSpan) blSpan.textContent = sectionLabel;

  // Update aria-current on INDEX link
  const indexLink = document.querySelector<HTMLAnchorElement>("nav[aria-label='Site navigation'] a");
  if (indexLink) {
    if (window.location.pathname === "/") {
      indexLink.setAttribute("aria-current", "page");
    } else {
      indexLink.removeAttribute("aria-current");
    }
  }
}

// ─── Lifecycle Hook ───────────────────────────────────────────────────────────
document.addEventListener("astro:after-swap", update);

// ─── Initial Run ──────────────────────────────────────────────────────────────
update();
```

### Frame.astro — Add `data-frame` Attribute to BL Span

The `view-transitions.ts` script needs a stable selector for the BL corner span. Add `data-frame="section-label"` to the BL span in `Frame.astro`:

```diff
  <!-- BL: Section label — hidden on mobile, aria-hidden (decorative) -->
  <span
    aria-hidden="true"
    data-reveal="corner"
+   data-frame="section-label"
    class="text-meta fixed bottom-7 left-7 z-50 hidden font-mono text-[0.75rem] leading-none tracking-widest uppercase md:block"
  >
    {sectionLabel}
  </span>
```

**Why a `data-frame` attribute**: The BL span has no stable ID or unique selector. Using `nth-child` or class selectors is fragile. A `data-frame="section-label"` attribute is explicit, readable, and matches the existing `data-frame="local-time"` pattern already on the TR span (established in Story 1.4 code review).

### Why No GSAP in This Script

The section label update and `aria-current` toggle are instant DOM mutations — no animation needed. GSAP would add unnecessary complexity and bundle weight. The architecture's gate+cleanup lifecycle pattern applies to GSAP scripts; this script uses only `addEventListener` and DOM APIs.

### Transition:name Uniqueness Constraint

The architecture requires `transition:name` values to be unique per route. Current usage:

| `transition:name` value | Source route | Target route |
|---|---|---|
| `project-title-{slug}` | `/projects` (h2 in ProjectBand) | `/projects/{slug}` (h1) |
| `main-content` | All routes (main element) | All routes (main element) |

`main-content` is used on every route's `<main>` — this is correct. The same element morphs between pages. It is NOT two unrelated routes sharing a name; it is the same logical element on every page.

### Reduced-Motion Behavior

Under `prefers-reduced-motion: reduce`:
- The CSS safety net in `global.css` collapses `animation-duration` to `0.01ms !important`
- Both `vt-exit` and `vt-enter` complete in ~0ms — effectively instant
- No JS gate needed in `view-transitions.ts` (DOM updates are not animated)
- The Frame's `transition:persist` behavior is unaffected by reduced-motion

### Interaction with Other Scripts

No conflicts with `reveal.ts` or `cursor.ts` — all use independent `astro:after-swap` listeners operating on different DOM elements. Registration order (reveal → cursor → view-transitions) is irrelevant since they don't share state.

### CursorAfterGlow Behavior During Transitions

`CursorAfterGlow.astro` is NOT `transition:persist` — it is destroyed and recreated on each navigation. This is expected. `cursor.ts` handles cleanup via `astro:before-swap` and re-init via `astro:after-swap`. No special handling needed in this story.

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/styles/global.css` | Add `@keyframes vt-exit`, `@keyframes vt-enter`, `::view-transition-old/new(main-content)` rules |
| `src/layouts/BaseLayout.astro` | Replace `transition:animate="fade"` with `transition:name="main-content"` on `<main>`; add `data-section-label` to `<body>`; add `view-transitions.ts` import to `<script>` block |
| `src/components/frame/Frame.astro` | Add `data-frame="section-label"` to BL span |

### Files to Create (NEW)

| File | Purpose |
|---|---|
| `src/scripts/view-transitions.ts` | Post-swap DOM updates: BL section label + INDEX aria-current |

### Files to NOT Touch

- `src/scripts/gsap-init.ts` — no changes needed
- `src/scripts/reveal.ts` — no changes needed
- `src/scripts/cursor.ts` — no changes needed
- `src/components/content/ProjectBand.astro` — `transition:name` already correct
- `src/pages/projects/[...slug].astro` — `transition:name` already correct
- `src/styles/typography.css` — no changes needed
- `src/pages/*.astro` — no changes needed (sectionLabel prop already passed correctly)
- `src/content/**` — no changes needed

### Edge Cases & Defensive Coding

- **`[data-frame='section-label']` not found**: `blSpan` is null — `if (blSpan)` guard prevents error. Happens if Frame is not rendered (impossible in current architecture, but safe).
- **`nav[aria-label='Site navigation'] a` not found**: `indexLink` is null — `if (indexLink)` guard prevents error.
- **`document.body.dataset.sectionLabel` undefined**: `?? ""` fallback produces empty string — BL span shows blank (correct for home page).
- **Rapid navigation**: `astro:after-swap` fires once per completed navigation. No debounce needed.
- **Home page**: `sectionLabel` prop is `undefined` in `index.astro` → `BaseLayout` defaults to `""` → `data-section-label=""` → BL span shows blank. Correct per spec (FR-2: home BL is blank).

### GSAP Budget Impact

`view-transitions.ts` adds ~0.3KB gzip (no GSAP, pure DOM). Running total: ~43.5KB (from Story 3.3) + ~0.3KB = ~43.8KB gzip. Well within 60KB budget.

### Project Structure After This Story

```
src/
├── scripts/
│   ├── gsap-init.ts          ← unchanged
│   ├── reveal.ts             ← unchanged
│   ├── cursor.ts             ← unchanged
│   └── view-transitions.ts   ← NEW FILE
├── styles/
│   └── global.css            ← MODIFIED (vt keyframes + pseudo-elements)
├── layouts/
│   └── BaseLayout.astro      ← MODIFIED (transition:name, data-section-label, script import)
└── components/
    └── frame/
        └── Frame.astro       ← MODIFIED (data-frame="section-label" on BL span)
```

### References

- [FR-19] — Page transitions via Astro View Transitions
- [Architecture: View Transitions & Animation Lifecycle] — Frame persistence, custom keyframes, title FLIP-echo
- [Architecture: CSS Token & Styling Architecture] — `--ease-settle`, `--dur-arrive` token usage
- [Story 1.4] — `transition:persist` on Frame, `<ClientRouter />` in head, `data-frame="local-time"` pattern
- [Story 2.1] — `transition:name` on project page `<h1>`
- [Story 2.5] — `transition:name` on `ProjectBand` `<h2>`
- [Deferred Work from Story 1.4] — `aria-current` update on navigation, BL section label update

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Implemented `@keyframes vt-exit` and `@keyframes vt-enter` in `global.css` using `var(--dur-arrive)` and `var(--ease-settle)` tokens with `both` fill mode. No hardcoded values.
- Applied keyframes to `::view-transition-old(main-content)` and `::view-transition-new(main-content)`. Reduced-motion safety net already present — no additional CSS needed.
- Replaced `transition:animate="fade"` with `transition:name="main-content"` on `<main>` in `BaseLayout.astro`. Custom keyframes now own the transition behavior.
- Added `data-section-label={sectionLabel ?? ""}` to `<body>` in `BaseLayout.astro` so the persisted Frame can read the new page's label after swap.
- Created `src/scripts/view-transitions.ts`: pure DOM `update()` function registered on `astro:after-swap` and called on initial load. Updates BL span text and INDEX `aria-current` — no GSAP, no gates.
- Added `data-frame="section-label"` to BL span in `Frame.astro` for stable selector targeting (matches existing `data-frame="local-time"` pattern on TR span).
- Imported `view-transitions.ts` in `BaseLayout.astro` script block.
- All validation passed: `bun run format` (unchanged), `bun run lint` (0 issues), `bun run check` (0 errors, 0 warnings).

### File List

- `src/styles/global.css` — added `@keyframes vt-exit`, `@keyframes vt-enter`, `::view-transition-old/new(main-content)` rules
- `src/layouts/BaseLayout.astro` — replaced `transition:animate="fade"` with `transition:name="main-content"`; added `data-section-label` to `<body>`; added `view-transitions.ts` import
- `src/components/frame/Frame.astro` — added `data-frame="section-label"` to BL span
- `src/scripts/view-transitions.ts` — NEW: post-swap DOM updates for BL section label and INDEX aria-current

### Change Log

- 2026-05-23: Story created — ready for dev.
- 2026-05-23: Quality review applied — added explicit BR folio deferral (AC #10), added CursorAfterGlow transition behavior note, consolidated script interaction sections for token efficiency.
- 2026-05-23: Implemented — all tasks complete, validation passed, status set to review.
