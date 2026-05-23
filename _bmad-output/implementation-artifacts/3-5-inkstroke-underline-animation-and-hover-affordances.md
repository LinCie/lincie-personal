# Story 3.5: Inkstroke Underline Animation & Hover Affordances

Status: done

## Story

As a visitor interacting with links,
I want links to reveal a drawing underline on hover and external links to show their domain,
so that I can identify interactive elements through a consistent, quiet hover language.

## Acceptance Criteria

1. The inkstroke underline draws left-to-right over ~250ms on hover using `scaleX(0)` → `scaleX(1)` with `transform-origin: left`
2. On un-hover, the underline fades (opacity or scaleX back to 0) over ~250ms
3. The same underline appears on `:focus-visible` (keyboard parity)
4. External link `↗ domain.com` annotation materializes on hover with ~250ms opacity transition
5. Name elements (`<span class="name">` or `<cite>`) transition font-weight 400→500 over ~250ms on hover
6. Every hover effect uses ~250ms duration (one rhythm)
7. All hover effects use `transform` or `opacity` only — no layout animation (exception: `font-weight` on variable font `wght` axis per architecture decision)
8. All hover effects have matching keyboard-parity states (`:focus-visible` for directly focusable elements; `:focus-within` for container-level effects where the focusable child is nested)
9. ProjectBand `h2::after` is hidden under `@media (forced-colors: active)` — matches InlineLink pattern
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Add transition declarations to InlineLink component (AC: #1, #2, #3, #4, #6, #7)
  - [x] 1.1: Add `transition: transform 250ms var(--ease-mark)` to `.inline-link::after` pseudo-element
  - [x] 1.2: Add `transition: opacity 250ms var(--ease-mark)` to `.inline-link-annotation`
  - [x] 1.3: Verify `:focus-visible::after` already triggers `scaleX(1)` (it does — no new rule needed)
  - [x] 1.4: Verify `:focus-visible .inline-link-annotation` already triggers `opacity: 1` (it does — no new rule needed)

- [x] Task 2: Add name/cite hover affordance to InlineLink component (AC: #5, #6, #8)
  - [x] 2.1: Add `.inline-link-name` class targeting `<span class="name">` and `<cite>` children inside `.inline-link`
  - [x] 2.2: Set `transition: font-weight 250ms var(--ease-mark)` on `.inline-link-name`
  - [x] 2.3: On `.inline-link:hover .inline-link-name` and `.inline-link:focus-visible .inline-link-name`, set `font-weight: 500`
  - [x] 2.4: Verify Newsreader variable font interpolates `wght` axis smoothly (it does — variable font)

- [x] Task 3: Add inkstroke underline to ProjectBand title on hover (AC: #1, #2, #3, #6, #7, #8)
  - [x] 3.1: Add `::after` pseudo-element to the `<h2>` in `ProjectBand.astro` via scoped `<style>` block
  - [x] 3.2: Style: `content: ""`, `position: absolute`, `bottom: 0`, `left: 0`, `width: 100%`, `height: 2px` (thicker for display size), `background: var(--ink)`, `transform: scaleX(0)`, `transform-origin: left`, `transition: transform 250ms var(--ease-mark)`
  - [x] 3.3: On `:global(.group):hover h2::after` and `:global(.group):focus-within h2::after`, set `transform: scaleX(1)` — use `:focus-within` (not `:focus-visible`) because the focusable `<a>` is a child of `<article>`, and `:global()` because `group` is a Tailwind utility that Astro scoping would break
  - [x] 3.4: Add `position: relative` to the `<h2>` class list (Tailwind `relative` utility) for `::after` positioning context
  - [x] 3.5: Add `@media (forced-colors: active) { h2::after { display: none; } }` — matches InlineLink forced-colors pattern to prevent phantom layout element in Windows High Contrast

- [x] Task 4: Run validation gate (AC: #10)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `.inline-link::after` pseudo-element | `InlineLink.astro` `<style>` | Positioned, sized, `scaleX(0)` at rest, `scaleX(1)` on hover/focus-visible. **Only add `transition`.** |
| `.inline-link-annotation` | `InlineLink.astro` `<style>` | `opacity: 0` at rest, `opacity: 1` on hover/focus-visible. **Only add `transition`.** |
| `:focus-visible` outline | `global.css` | 2px solid var(--ink), offset 2px. Already applies to all `<a>` elements. Do NOT duplicate. |
| `group` class on `<article>` | `ProjectBand.astro` | Tailwind group for hover propagation. Already present. |
| `transition:name` on `<h2>` | `ProjectBand.astro` | View Transition morph. Do NOT remove or modify. |
| Forced-colors fallback | `InlineLink.astro` `<style>` | `@media (forced-colors: active)` restores UA underline, hides `::after`. Do NOT touch. |

### Architecture Compliance

- **No new dependencies.** Pure CSS transitions — no GSAP needed for these effects.
- **Animation properties**: `transform` and `opacity` only. `font-weight` is the one exception — architecture mandates it for the `wght` axis on variable fonts (see deferred-work.md note from Story 2.4 review).
- **Duration**: Use `250ms` literal in CSS (no token exists for 250ms — it falls between `--dur-quick` 150ms and `--dur-breath` 400ms). The spec explicitly says "~250ms" for all hover effects. A future token pass may introduce `--dur-mark` for this value.
- **Easing**: Use `var(--ease-mark)` — the "marking" easing for interactive feedback (distinct from `--ease-settle` which is for page-level motion).
- **No GSAP**: These are CSS-only transitions. No script file needed. No changes to `gsap-init.ts` or any script.
- **Reduced-motion**: The existing safety net in `global.css` collapses `transition-duration` to `0.01ms !important`. No additional reduced-motion CSS needed.
- **CSS `transition` vs Astro `transition:name`**: These are completely different systems. The CSS `transition` property (added in this story) animates property changes on hover/focus. The Astro `transition:name` attribute (already on `<h2>`) drives View Transition morphs between pages. They coexist without conflict on the same element.

### InlineLink.astro — Exact Changes

Add `transition` declarations to two existing rules in the `<style>` block:

```css
/* Existing rule — ADD transition */
.inline-link::after {
  /* ...existing properties unchanged... */
  transition: transform 250ms var(--ease-mark);
}

/* Existing rule — ADD transition */
.inline-link-annotation {
  /* ...existing properties unchanged... */
  transition: opacity 250ms var(--ease-mark);
}
```

**That's it for the inkstroke and annotation.** The `:hover::after { transform: scaleX(1) }` and `:hover .inline-link-annotation { opacity: 1 }` rules already exist. Adding `transition` makes them animate instead of snapping.

### Name/Cite Hover Affordance — Implementation

Add a new rule block in `InlineLink.astro`'s `<style>`:

```css
/* Name elements — font-weight transition on hover/focus.
   Targets <span class="name"> or <cite> children inside the link.
   Variable font (Newsreader) interpolates wght axis smoothly. */
.inline-link :global(span.name),
.inline-link :global(cite) {
  transition: font-weight 250ms var(--ease-mark);
}

.inline-link:hover :global(span.name),
.inline-link:hover :global(cite),
.inline-link:focus-visible :global(span.name),
.inline-link:focus-visible :global(cite) {
  font-weight: 500;
}
```

**Why `:global()`**: Astro scoped styles only match elements rendered directly in the component template. `<span class="name">` and `<cite>` come from Markdown content rendered via `<slot />`. The `:global()` modifier tells Astro's scoping to not add the data attribute to those selectors, allowing them to match slotted content.

**Known limitation**: `font-weight` transition causes minor horizontal layout shift (heavier weight = wider glyphs). This is a pre-existing design decision documented in `deferred-work.md`. Variable font interpolation minimizes the shift. Acceptable per architecture.

### ProjectBand.astro — Exact Changes

Add a scoped `<style>` block and `position: relative` to the `<h2>`:

```diff
  <h2
    transition:name={`project-title-${slug}`}
-   class="text-ink font-serif leading-[1.05] font-normal"
+   class="text-ink relative font-serif leading-[1.05] font-normal"
    style="font-size: clamp(2.5rem, 6.5vw, 4.25rem);"
  >
    {title}
  </h2>
```

Add `<style>` block at the end of the component:

```css
<style>
  /* Inkstroke underline on project title — draws on band hover/focus.
     Thicker (2px) than InlineLink (1px) because display-size type needs
     proportionally heavier stroke weight for visual balance. */
  h2::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--ink);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 250ms var(--ease-mark);
  }

  /* group hover/focus propagation from the parent <article class="group"> */
  :global(.group):hover h2::after,
  :global(.group):focus-within h2::after {
    transform: scaleX(1);
  }

  /* Forced-colors (Windows High Contrast): hide custom pseudo-element.
     System handles link styling; prevents phantom layout element. */
  @media (forced-colors: active) {
    h2::after {
      display: none;
    }
  }
</style>
```

**Why `:global(.group)`**: The `group` class is on the parent `<article>`, which is in the same component's template. Astro's scoping adds a `data-astro-cid-*` attribute to selectors — but `.group` is a Tailwind utility class applied at runtime, not a scoped class. The data attribute selector `.group[data-astro-cid-xxx]` would never match the Tailwind-generated class. Using `:global(.group)` prevents Astro from adding the data attribute to that part of the selector. The `h2::after` part IS scoped (Astro adds the data attribute to `h2`), which is correct — it targets only this component's `<h2>`.

**Why `focus-within` instead of `focus-visible`**: The `<a>` is a child of `<article class="group">`. The `<article>` itself is not focusable, so `:focus-visible` on it would never trigger. `:focus-within` on the article detects when any descendant (the `<a>`) has focus. This provides keyboard parity — Tab to the band link reveals the underline. This satisfies AC #8's "keyboard parity" requirement for container-level effects.

**Why 2px height**: Display-size type (clamp 2.5rem–4.25rem) needs proportionally heavier stroke weight. 1px (InlineLink body text) would be invisible at display size.

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/components/typography/InlineLink.astro` | Add `transition` to `::after` and `.inline-link-annotation`; add name/cite hover rules |
| `src/components/content/ProjectBand.astro` | Add `relative` to `<h2>` class; add `<style>` block with `::after` inkstroke |

### Files to Create (NEW)

None.

### Files to NOT Touch

- `src/styles/global.css` — reduced-motion safety net already handles transitions; do not duplicate
- `src/scripts/gsap-init.ts` — no GSAP involved in this story
- `src/scripts/view-transitions.ts` — unrelated; `transition:name` on `<h2>` is an Astro attribute, not managed by this script

### Edge Cases & Defensive Coding

- **No `<span class="name">` or `<cite>` in current content**: The CSS rules exist but match nothing. No error, no visual impact. They activate when content authors use these elements in Markdown/MDX.
- **InlineLink used without slot content**: `::after` still positions correctly (width: 100% of the link's content box). Empty link = zero-width underline = invisible. Correct.
- **ProjectBand title wraps to multiple lines**: `::after` with `width: 100%` and `bottom: 0` draws under the full width at the bottom of the last line. This is correct for display-size titles.
- **View Transition morph + `::after`**: The `transition:name` on `<h2>` morphs the element between pages. The `::after` pseudo-element is part of the element and morphs with it. No conflict.
- **Forced-colors mode**: InlineLink already has a `@media (forced-colors: active)` block that hides `::after` and restores UA underline. The new `transition` property is irrelevant when `::after` is `display: none`. ProjectBand's `::after` should also be hidden in forced-colors — add the same pattern.

### GSAP Budget Impact

Zero. This story adds no JavaScript. Only CSS transitions.

### Reduced-Motion Behavior

Under `prefers-reduced-motion: reduce`:
- The global safety net in `global.css` sets `transition-duration: 0.01ms !important` on all elements and pseudo-elements
- All hover effects snap to final state instantly (no animation)
- No additional CSS needed — the safety net covers `::after`, `.inline-link-annotation`, and name/cite elements

### Cross-Browser Notes

All CSS features used in this story are supported in all target browsers (Chrome 86+, Firefox 85+, Safari 15.4+): `transform: scaleX()`, `font-weight` transition on variable fonts, `:focus-within`, `:focus-visible`.

### Previous Story Intelligence

From Story 3.4 (View Transitions):
- `transition:name` on elements does NOT conflict with CSS `transition` property — they are different systems (Astro View Transitions vs CSS transitions).
- The `data-section-label` pattern and `view-transitions.ts` are unrelated to this story.

From Story 3.3 (Cursor Afterglow):
- `overwrite: "auto"` pattern for GSAP — not applicable here (no GSAP).
- Reading-zone awareness uses `<main>` boundary — InlineLink hover effects inside `<main>` are independent of cursor afterglow.

From Story 2.4 (InlineLink base):
- The component uses Astro scoped `<style>` — all new CSS goes in the same `<style>` block.
- `display: inline-block` is required for the padding-block tap target and `::after` positioning.
- The `javascript:` URI sanitization and forced-colors fallback must not be modified.

From deferred-work.md:
- `font-weight` hover on `span.name`/`cite` causes horizontal layout shift. Accepted as design decision. Variable font interpolation minimizes it.

### Project Structure After This Story

```
src/
├── components/
│   ├── typography/
│   │   └── InlineLink.astro        ← MODIFIED (add transitions + name/cite rules)
│   └── content/
│       └── ProjectBand.astro       ← MODIFIED (add relative + <style> block)
├── scripts/                         ← unchanged (no JS in this story)
├── styles/                          ← unchanged
└── ... (all other dirs unchanged)
```

### References

- [FR-21] — Inkstroke underline on inline links
- [FR-22] — Hover affordances per element type
- [UX-DR14] — Focus-visible states (keyboard parity)
- [NFR-9] — Animation performance (transform + opacity only)
- [Architecture: CSS Token & Styling Architecture] — `--ease-mark` for interactive feedback
- [Architecture: Implementation Patterns] — transform + opacity only, duration token semantics
- [Story 2.4] — InlineLink base implementation, scoped styles, forced-colors fallback
- [Story 2.5] — ProjectBand with `group` class, `transition:name` on title
- [deferred-work.md] — font-weight layout shift accepted as design decision

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

No issues encountered. Implementation matched story spec exactly.

### Completion Notes List

- Task 1: Added `transition: transform 250ms var(--ease-mark)` to `.inline-link::after` and `transition: opacity 250ms var(--ease-mark)` to `.inline-link-annotation` in `InlineLink.astro`. Confirmed existing `:hover`/`:focus-visible` rules already set the target states — transitions make them animate instead of snap.
- Task 2: Added name/cite hover affordance using `:global(span.name)` and `:global(cite)` selectors with `font-weight` transition and `font-weight: 500` on hover/focus-visible. `:global()` required because slot content is not reached by Astro scoping.
- Task 3: Added `relative` Tailwind utility to `<h2>` in `ProjectBand.astro` and a scoped `<style>` block with `h2::after` inkstroke (2px, `scaleX(0)→1` on `:global(.group):hover`/`:focus-within`). Forced-colors `display: none` guard added. `:focus-within` used (not `:focus-visible`) because the focusable `<a>` is a child of `<article>`.
- Task 4: `bun run format && bun run lint && bun run check` — all pass, 0 errors, 0 warnings.

### File List

- `src/components/typography/InlineLink.astro`
- `src/components/content/ProjectBand.astro`

### Change Log

- 2026-05-23: Story created — ready for dev.
- 2026-05-23: Implemented — CSS transitions added to InlineLink (inkstroke, annotation, name/cite); ProjectBand h2 inkstroke added. All ACs satisfied. Validation clean.
- 2026-05-23: Code review passed — 0 patches, 1 deferred (hardcoded 250ms, future token pass planned). Story marked done.

### Review Findings

- [x] [Review][Defer] Hardcoded 250ms duration literal — no `--dur-mark` token exists yet [InlineLink.astro, ProjectBand.astro] — deferred, pre-existing design decision; future token pass planned
