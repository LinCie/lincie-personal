# Story 2.3: Footnote Rendering & Bidirectional Navigation

Status: done

## Story

As a visitor reading long-form content,
I want inline footnote references that link to footnote text (and back),
so that I can access supplementary context without losing my place.

## Acceptance Criteria

1. Footnote references render as superscript links (`[1]`, `[2]`) in the body text
2. Footnote content renders in `<aside>` elements in the margin column on desktop (≥768px)
3. On mobile (<768px), footnotes render in a below-content list and are always visible
4. Clicking a footnote reference jumps to the footnote text
5. Each footnote has a back-link that returns to the reference position
6. Footnotes are keyboard-accessible (Tab reaches refs, Enter activates jump)
7. On desktop, footnotes start at `opacity: 0` (hidden by default — revealed by reverse-scroll in Epic 4)
8. Under `prefers-reduced-motion: reduce`, footnotes are always visible on all devices
9. Footnote content is supplementary — never essential to understanding the main text (authoring guideline, not a build gate)
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/content/FootnoteReveal.astro` — the footnote container component (AC: #2, #3, #7, #8)
  - [x] 1.1: Accept no props — the component reads footnote data from the DOM via a `<script>` tag
  - [x] 1.2: Render an `<aside aria-label="Footnotes">` (no `aria-hidden` — this is real content) with `class="hidden md:block"` for desktop-only visibility
  - [x] 1.3: Inside the aside, render a `<div id="footnote-margin">` that will be populated by the client script
  - [x] 1.4: Add a `<script>` tag that moves footnote `<li>` items from the remark-generated `<section data-footnotes>` into the margin column on desktop (see Dev Notes for exact DOM manipulation)
  - [x] 1.5: On mobile, the `<section data-footnotes>` remains in the content column and is always visible — no DOM manipulation on mobile

- [x] Task 2: Style the footnote superscript references (AC: #1, #4, #6)
  - [x] 2.1: Add CSS to `src/styles/typography.css` targeting `[data-footnote-ref]` — style as superscript with `font-mono text-meta` equivalent values
  - [x] 2.2: The `<sup>` wrapper is rendered by remark — do NOT add a custom `<sup>` wrapper; style the existing one
  - [x] 2.3: The `<a>` inside `<sup>` must have a minimum 44×44px tap target on mobile — use padding to achieve this without changing visual size
  - [x] 2.4: Remove the default browser underline from footnote ref links at rest (they are already visually distinct as superscripts)

- [x] Task 3: Style the footnote content in the margin column (AC: #2, #5, #7, #8)
  - [x] 3.1: Add CSS to `src/styles/typography.css` for `#footnote-margin` — `font-mono text-meta text-[0.75rem]` equivalent, `opacity: 0` on desktop (hidden by default for Epic 4 reveal)
  - [x] 3.2: Under `@media (prefers-reduced-motion: reduce)`, set `#footnote-margin { opacity: 1 !important }` — footnotes always visible
  - [x] 3.3: Style the back-link (`[data-footnote-backref]`) — same mono/meta styling, no underline at rest
  - [x] 3.4: Each footnote item in the margin should be positioned to align vertically with its reference in the body text (see Dev Notes for the positioning approach)

- [x] Task 4: Style the mobile footnote list (AC: #3, #8)
  - [x] 4.1: Add CSS to `src/styles/typography.css` targeting `section[data-footnotes]` — visible on mobile, hidden on desktop (after DOM move)
  - [x] 4.2: Style the `<ol>` inside `section[data-footnotes]` — `font-mono text-meta text-[0.75rem]` equivalent, `mt-14` spacing from prose
  - [x] 4.3: The `<h2 class="sr-only">` inside `section[data-footnotes]` is already screen-reader-only — do NOT remove it

- [x] Task 5: Update both page templates to include `FootnoteReveal` (AC: #2, #3)
  - [x] 5.1: In `src/pages/projects/[...slug].astro` — import `FootnoteReveal`, replace the empty `<aside aria-hidden="true">` placeholder with `<FootnoteReveal />`
  - [x] 5.2: In `src/pages/writing/[...slug].astro` — import `FootnoteReveal`, replace the empty `<aside aria-hidden="true">` placeholder with `<FootnoteReveal />`
  - [x] 5.3: Remove the `aria-hidden="true"` from the aside — `FootnoteReveal` renders its own `<aside aria-label="Footnotes">` without `aria-hidden`

- [x] Task 6: Run validation gate (AC: #10)
  - [x] 6.1: `bun run format`
  - [x] 6.2: `bun run lint`
  - [x] 6.3: `bun run check`

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/components/content/FootnoteReveal.astro` | Footnote container + DOM-move script |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/styles/typography.css` | Add footnote ref, margin, and mobile list styles |
| `src/pages/projects/[...slug].astro` | Replace aside placeholder with `<FootnoteReveal />` |
| `src/pages/writing/[...slug].astro` | Replace aside placeholder with `<FootnoteReveal />` |

### Files to NOT Touch

- `src/styles/global.css` — tokens already defined; no changes needed
- `src/layouts/BaseLayout.astro` — no changes needed
- `src/components/typography/DropCap.astro` — use as-is
- `src/components/content/Colophon.astro` — use as-is
- `src/components/content/ProjectSpine.astro` — use as-is
- `src/content/writing/craft-as-proof.md` — already has footnote; do not modify
- `src/content/projects/building-lincie.md` — no footnotes; do not modify

### Remark-Generated Footnote HTML — Exact Structure

Astro's built-in remark processor (via `remark-gfm`) renders `[^1]` syntax into this exact HTML. **Read this carefully — the DOM manipulation script must target these exact selectors.**

**Footnote reference (in body text):**
```html
<sup>
  <a
    href="#user-content-fn-1"
    id="user-content-fnref-1"
    data-footnote-ref=""
    aria-describedby="footnote-label"
  >1</a>
</sup>
```

**Footnote section (at end of `<Content />`), inside the prose wrapper div:**
```html
<section data-footnotes="" class="footnotes">
  <h2 class="sr-only" id="footnote-label">Footnotes</h2>
  <ol>
    <li id="user-content-fn-1">
      <p>
        Footnote text here.
        <a
          href="#user-content-fnref-1"
          data-footnote-backref=""
          aria-label="Back to reference 1"
          class="data-footnote-backref"
        >↩</a>
      </p>
    </li>
  </ol>
</section>
```

**Critical observations:**
- The `<section data-footnotes>` is rendered **inside** the `<Content />` output, which is inside the `<DropCap>` wrapper div. It is NOT a sibling of the prose — it is a descendant.
- The `[&_p]:mb-7` variant on the prose wrapper **does** apply to `<p>` inside `<section data-footnotes>` — this is the pre-existing deferred issue from Story 2.2. Do not fix it in this story; it will be addressed when footnote styling is finalized.
- The `<h2 class="sr-only" id="footnote-label">` must remain in the DOM for the `aria-describedby="footnote-label"` on footnote refs to work. **Never remove this element.**
- The back-link `↩` already has `aria-label="Back to reference 1"` — no additional ARIA needed.
- IDs use the `user-content-` prefix (e.g. `user-content-fn-1`, `user-content-fnref-1`) — this is remark's default namespace to avoid ID collisions.

### DOM Manipulation Strategy — Moving Footnotes to Margin

The `FootnoteReveal.astro` component uses a client-side script to move footnote `<li>` items from the remark-generated `<section data-footnotes>` into the margin `<aside>` on desktop.

**Why client-side DOM manipulation (not Astro server-side):**
- The footnote HTML is generated by remark inside `<Content />` at build time. There is no server-side API to intercept or restructure it before rendering.
- The margin column is a sibling of the content column in the grid — it cannot receive content from inside `<Content />` via Astro slots.
- Client-side DOM manipulation is the correct and only approach here.

**Script logic (implement in `FootnoteReveal.astro` `<script>` tag):**

```typescript
// CRITICAL: Wrap in astro:page-load — NOT bare module execution.
// <ClientRouter /> is active; bare scripts only run on the initial hard load.
// astro:page-load fires on both hard load AND after every View Transition.
document.addEventListener('astro:page-load', () => {
  // Only run on desktop (margin column is hidden on mobile)
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  if (!isDesktop) return;

  // Find the remark-generated footnote section
  const footnoteSection = document.querySelector('section[data-footnotes]');
  if (!footnoteSection) return; // No footnotes on this page — exit cleanly

  // Find the margin container
  const marginContainer = document.getElementById('footnote-margin');
  if (!marginContainer) return;

  // Move (not clone) footnote <li> items to avoid duplicate IDs.
  // <main> is fully replaced on each transition, so #footnote-margin is
  // always fresh — no cleanup of previous items needed.
  const footnoteItems = Array.from(footnoteSection.querySelectorAll('li'));
  footnoteItems.forEach((li) => {
    marginContainer.appendChild(li); // moves the node, does not clone
  });

  // Hide the now-empty section on desktop via CSS class
  footnoteSection.classList.add('footnotes-moved');
});
```

**Why move, not clone:** `cloneNode(true)` would create duplicate IDs (`user-content-fn-1` appearing twice), breaking the bidirectional anchor navigation. Moving the `<li>` nodes preserves their IDs and keeps them unique. The `aria-describedby="footnote-label"` on refs still resolves because the `<h2 id="footnote-label">` stays in the (now empty) `section[data-footnotes]`.

### FootnoteReveal Component — Full Implementation

```astro
---
// src/components/content/FootnoteReveal.astro
// Renders the margin column footnote container.
// A client script moves footnote <li> items from the remark-generated
// <section data-footnotes> into this aside on desktop.
// On mobile, the original <section data-footnotes> remains visible in the content column.
---

<aside aria-label="Footnotes" class="hidden md:block">
  <div id="footnote-margin">
    <!-- Populated by the script below on desktop -->
  </div>
</aside>

<script>
  // CRITICAL: Must use astro:page-load, NOT bare module execution.
  // <ClientRouter /> is active in BaseLayout — bare scripts only run on the
  // initial hard load. astro:page-load fires on both hard load AND after every
  // View Transition completes, so the DOM manipulation re-runs on each navigation.
  // <main> is fully replaced on each transition, so #footnote-margin is always
  // fresh — no cleanup of previous items is needed.
  document.addEventListener('astro:page-load', () => {
    // Only run on desktop — mobile shows footnotes inline in the content column
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return;

    const footnoteSection = document.querySelector('section[data-footnotes]');
    const marginContainer = document.getElementById('footnote-margin');

    // No footnotes on this page (e.g. building-lincie.md) — exit cleanly
    if (!footnoteSection || !marginContainer) return;

    // Move (not clone) footnote <li> items to avoid duplicate IDs.
    // Moving preserves the original href/id values so bidirectional
    // anchor navigation continues to work after the DOM move.
    const items = Array.from(footnoteSection.querySelectorAll('li'));
    items.forEach((li) => marginContainer.appendChild(li));

    // Hide the now-empty section on desktop via CSS class
    footnoteSection.classList.add('footnotes-moved');
  });
</script>
```

**Why `astro:page-load` and not bare script execution:**
`<ClientRouter />` is active in `BaseLayout.astro`. With View Transitions enabled, navigating between pages does not re-execute component `<script>` tags — only the initial hard load runs them. `astro:page-load` is Astro's event that fires on both the initial load and after every View Transition completes. Without this wrapper, the footnote DOM move would silently fail on any soft navigation.

**Why no cleanup is needed between navigations:**
`<main>` carries `transition:animate="fade"` in `BaseLayout.astro`. On each View Transition, Astro fully replaces the `<main>` content with the new page's HTML. This means `#footnote-margin` is always a fresh empty container when `astro:page-load` fires — no stale items from a previous page.

### Page Template Updates — Exact Changes

**`src/pages/projects/[...slug].astro`** — replace the aside placeholder:

```astro
<!-- BEFORE (Story 2.1 placeholder): -->
<aside class="hidden md:block" aria-hidden="true">
  <!-- Populated by Story 2.3 (FootnoteReveal) -->
</aside>

<!-- AFTER (Story 2.3): -->
<FootnoteReveal />
```

Also add the import at the top of the frontmatter:
```astro
import FootnoteReveal from "../../components/content/FootnoteReveal.astro";
```

**`src/pages/writing/[...slug].astro`** — same change:
```astro
<!-- BEFORE: -->
<aside class="hidden md:block" aria-hidden="true">
  <!-- Populated by Story 2.3 (FootnoteReveal) -->
</aside>

<!-- AFTER: -->
<FootnoteReveal />
```

Import:
```astro
import FootnoteReveal from "../../components/content/FootnoteReveal.astro";
```

### CSS — `typography.css` Additions

Add these blocks to `src/styles/typography.css` after the existing `.drop-cap` section:

```css
/* ============================================================
   FOOTNOTE REFERENCES (in body text)
   Remark renders [^1] as <sup><a data-footnote-ref>1</a></sup>.
   Style the <sup> and <a> — do NOT add a custom wrapper.
   ============================================================ */
sup:has([data-footnote-ref]) {
  font-family: var(--font-mono);
  font-size: 0.65em;
  line-height: 1;
  vertical-align: super;
}

[data-footnote-ref] {
  color: var(--meta);
  text-decoration: none;
  /* Minimum 44×44px tap target on mobile via padding */
  padding: 0.5em 0.25em;
}

[data-footnote-ref]:hover,
[data-footnote-ref]:focus-visible {
  color: var(--ink);
}

/* ============================================================
   FOOTNOTE MARGIN COLUMN (desktop)
   #footnote-margin is populated by FootnoteReveal.astro script.
   opacity: 0 by default — revealed by reverse-scroll in Story 4.4.
   Under prefers-reduced-motion, always visible.
   ============================================================ */
#footnote-margin {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--meta);
  line-height: 1.4;
  opacity: 0;
  padding-top: calc(var(--baseline) * 4); /* align roughly with prose start */
}

@media (prefers-reduced-motion: reduce) {
  #footnote-margin {
    opacity: 1 !important;
  }
}

#footnote-margin li {
  margin-bottom: var(--baseline);
  list-style: none;
  padding-left: 0;
}

/* No li::before counter label — the footnote number is conveyed by the
   back-link's aria-label ("Back to reference 1") and the visual superscript
   in the body text. Adding a redundant counter would duplicate information.
   Story 4.4 may add a subtle number label if needed for visual clarity. */

[data-footnote-backref] {
  color: var(--meta);
  text-decoration: none;
  margin-left: 0.25em;
}

[data-footnote-backref]:hover,
[data-footnote-backref]:focus-visible {
  color: var(--ink);
}

/* ============================================================
   FOOTNOTE SECTION — MOBILE (below content)
   section[data-footnotes] stays in the content column on mobile.
   On desktop, it is hidden after FootnoteReveal moves its <li> items.
   ============================================================ */
section[data-footnotes] {
  margin-top: calc(var(--baseline) * 2); /* 56px = 2× baseline */
  padding-top: calc(var(--baseline));
  border-top: 1px solid var(--hairline);
}

section[data-footnotes] ol {
  padding-left: 0;
  list-style: none;
}

section[data-footnotes] li {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--meta);
  line-height: 1.4;
  margin-bottom: var(--baseline);
  padding-left: 1.5em;
  position: relative;
}

section[data-footnotes] li::before {
  content: counter(list-item) ".";
  position: absolute;
  left: 0;
  color: var(--meta);
}
```

**Note on `counter(list-item)` for mobile list:** The `<ol>` provides the counter context, rendering "1." before each item. Do NOT use `content: attr(id)` — that would render the raw `user-content-fn-1` string.

**Note on `sup:has([data-footnote-ref])`:** The `:has()` pseudo-class is supported in all modern browsers (Chrome 105+, Firefox 121+, Safari 15.4+). This is within the project's browser support target (latest 2 versions). If `:has()` is unavailable, the fallback is that `<sup>` uses browser default styling — acceptable degradation.

**Note on `#footnote-margin` vertical alignment:** The `padding-top: calc(var(--baseline) * 4)` is a rough approximation to align with the prose start. Precise per-footnote vertical positioning (aligning each footnote next to its reference in the body) is deferred to Story 4.4, which will use GSAP to position each item dynamically.

### Bidirectional Navigation — Already Provided by Remark

The bidirectional navigation (AC #4, #5) is **already implemented by remark's output**:

- Footnote ref `<a href="#user-content-fn-1">` → jumps to `<li id="user-content-fn-1">` in the footnote section
- Back-link `<a href="#user-content-fnref-1">` → jumps back to `<a id="user-content-fnref-1">` in the body

After the DOM move, the `<li>` items are in `#footnote-margin` (desktop) or `section[data-footnotes]` (mobile). The `href` targets (`#user-content-fn-1`) still resolve correctly because the IDs move with the elements.

**No custom navigation logic is needed.** The browser's native anchor navigation handles everything. This story's job is to style and position the existing remark output, not to reimplement footnote navigation.

### Keyboard Accessibility — Already Provided

AC #6 (keyboard-accessible) is satisfied by the existing remark output:
- Footnote refs are `<a>` elements — Tab-reachable, Enter-activatable
- Back-links are `<a>` elements — Tab-reachable, Enter-activatable
- The `aria-describedby="footnote-label"` on refs announces "Footnotes" to screen readers when focused

No additional ARIA or `tabindex` manipulation is needed.

### Desktop Opacity: 0 — Interaction with Epic 4

AC #7 requires `opacity: 0` on desktop footnotes. This is the initial state for Story 4.4 (Reverse-Scroll Footnote Reveal), which will animate `opacity: 0 → 1` via GSAP ScrollTrigger on reverse scroll.

**Do NOT add any transition or animation to `#footnote-margin` in this story.** Story 4.4 owns the reveal animation. This story only sets the initial `opacity: 0` state.

**The `opacity: 0` applies to `#footnote-margin` (the container), not to individual `<li>` items.** Story 4.4 will animate the container.

### Astro Component Structure (Follow Exactly)

`FootnoteReveal.astro` follows the standard Astro component order:
1. Frontmatter (`---` block) — imports and props (none needed here)
2. Template (HTML) — the `<aside>` and `<div id="footnote-margin">`
3. `<script>` tag — the DOM manipulation script

No `<style>` block — all CSS goes in `typography.css`.

### Token References — Never Hardcode

```css
/* ✅ Correct */
color: var(--meta);
font-family: var(--font-mono);
margin-bottom: var(--baseline);

/* ❌ Wrong */
color: oklch(0.5 0.005 80);
font-family: 'Commit Mono', monospace;
margin-bottom: 28px;
```

### Spacing — Baseline Multiples Only

```css
/* ✅ Correct */
margin-top: calc(var(--baseline) * 2);  /* 56px = 2× baseline */
padding-top: var(--baseline);           /* 28px = 1× baseline */

/* ❌ Wrong */
margin-top: 40px;
padding-top: 20px;
```

### What This Story Does NOT Include

- No GSAP animation — `opacity: 0` is the initial state; Story 4.4 owns the reveal
- No `footnotes.ts` script — that is Story 4.4
- No scroll direction detection — that is Story 4.4
- No one-time hint ("footnotes reveal as you re-read") — that is Story 4.4
- No `InlineLink` component — that is Story 2.4
- No project spine scroll indicator — that is Story 5.3
- No changes to `BaseLayout.astro`, `global.css`, or any Epic 1 files

### Project Structure Alignment

```
src/
├── components/
│   └── content/
│       ├── Colophon.astro          ← EXISTS — use as-is
│       ├── FootnoteReveal.astro    ← CREATE HERE (Task 1)
│       └── ProjectSpine.astro      ← EXISTS — use as-is
├── pages/
│   ├── projects/
│   │   └── [...slug].astro         ← MODIFY — replace aside placeholder (Task 5)
│   └── writing/
│       └── [...slug].astro         ← MODIFY — replace aside placeholder (Task 5)
└── styles/
    └── typography.css              ← MODIFY — add footnote CSS (Tasks 2, 3, 4)
```

### Deferred Work to Be Aware Of

From `deferred-work.md`:
- `[&_p]:mb-7` on the prose wrapper applies to `<p>` inside `<section data-footnotes>`. This is pre-existing from Story 2.2. Do not fix in this story — Story 2.3 owns footnote styling but the `[&_p]:mb-7` variant is on the prose wrapper, not the footnote section. The footnote `<p>` will have 28px bottom margin from the prose wrapper. This is acceptable.
- `aria-hidden="true"` was hardcoded on the aside in Stories 2.1 and 2.2. This story removes it by replacing the aside with `<FootnoteReveal />` which renders `<aside aria-label="Footnotes">` without `aria-hidden`.

### Accessibility Requirements

- `<aside aria-label="Footnotes">` — semantic landmark with label; screen readers announce "Footnotes" when entering
- **Empty aside on pages with no footnotes:** `building-lincie.md` has no footnotes. The script exits cleanly when `footnoteSection` is null, leaving `#footnote-margin` empty. An `<aside aria-label="Footnotes">` with no content is still announced by screen readers as an empty landmark. This is acceptable at this story's scope — Story 4.4 may address it by conditionally rendering the aside only when footnotes exist. For now, the empty landmark is harmless.
- The `<h2 class="sr-only" id="footnote-label">` inside `section[data-footnotes]` must remain — it is the `aria-describedby` target for footnote refs
- After DOM move, the `<h2 id="footnote-label">` stays in the (now empty) `section[data-footnotes]` — the `aria-describedby` on refs still resolves correctly
- Back-links already have `aria-label="Back to reference 1"` from remark — no additional ARIA needed
- `opacity: 0` on `#footnote-margin` does NOT hide content from screen readers — screen readers read opacity-0 content. This is intentional: footnotes are accessible to screen readers even when visually hidden. Under `prefers-reduced-motion`, `opacity: 1` ensures sighted users with motion preferences also see them.

### ESLint / Astro Check — Expected Issues to Avoid

- `jsx-a11y` will NOT flag `<aside aria-label="Footnotes">` — it has an accessible name
- TypeScript: the `<script>` tag in `FootnoteReveal.astro` is vanilla JS (no TypeScript needed for DOM manipulation); Astro processes it as a client script
- `astro/no-unused-define-vars-in-style` — do not add `<style>` blocks; all CSS goes in `typography.css`
- `document.addEventListener('astro:page-load', ...)` is the correct pattern for View Transitions — ESLint will not flag it; it is standard DOM event listener syntax
- `typescript-eslint` may warn about `document.querySelector` return type being `Element | null` — the null checks (`if (!footnoteSection || !marginContainer) return`) satisfy this

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.3`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — `FootnoteReveal.astro` in `src/components/content/`
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture`] — token usage, baseline multiples
- [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`] — Astro component structure order
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns`] — when to use custom CSS vs Tailwind
- [Source: `_bmad-output/planning-artifacts/architecture.md#Accessibility Patterns`] — `aria-hidden` on decorative elements, semantic HTML first
- [Source: `_bmad-output/planning-artifacts/architecture.md#Anti-Patterns`] — no inline styles, no hardcoded colors
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`] — FootnoteReveal component spec
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Defining Interaction`] — reverse-scroll footnote reveal as the signature interaction
- [Source: FR-12] — footnote reveal: mobile always visible, desktop hidden by default, reverse-scroll reveals
- [Source: UX-DR2] — mobile: footnotes in below-content list, always visible
- [Source: UX-DR4] — bidirectional footnote navigation
- [Source: NFR-4] — WCAG 2.2 AA, semantic HTML first
- [Source: `src/pages/projects/[...slug].astro`] — aside placeholder to replace
- [Source: `src/pages/writing/[...slug].astro`] — aside placeholder to replace
- [Source: `src/styles/typography.css`] — existing CSS structure; add footnote blocks after `.drop-cap` section
- [Source: `_bmad-output/implementation-artifacts/2-1-project-page-template-with-drop-cap-and-spine-structure.md`] — aside placeholder pattern, deferred note about Story 2.3
- [Source: `_bmad-output/implementation-artifacts/2-2-essay-page-template-with-italic-closing-line.md`] — aside placeholder pattern, deferred note about `aria-hidden` removal
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`] — `[&_p]:mb-7` on footnote paragraphs (pre-existing, do not fix), `aria-hidden` removal requirement
- [Source: built HTML at `dist/writing/craft-as-proof/index.html`] — exact remark-generated footnote HTML structure (verified at story creation time)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Created `src/components/content/FootnoteReveal.astro` — renders `<aside aria-label="Footnotes">` with `#footnote-margin` container; client script listens on `astro:page-load` to move remark-generated `<li>` items from `section[data-footnotes]` into the margin column on desktop (≥768px). Exits cleanly on pages with no footnotes.
- Added footnote CSS to `src/styles/typography.css`: superscript ref styling (`sup:has([data-footnote-ref])`, `[data-footnote-ref]`), margin column (`#footnote-margin` at `opacity: 0` for Epic 4 reveal, `opacity: 1 !important` under `prefers-reduced-motion`), back-link (`[data-footnote-backref]`), mobile list (`section[data-footnotes]`), and desktop hide rule (`.footnotes-moved`).
- Updated `src/pages/projects/[...slug].astro` — imported `FootnoteReveal`, replaced `<aside aria-hidden="true">` placeholder with `<FootnoteReveal />`.
- Updated `src/pages/writing/[...slug].astro` — same change.
- All validation passed: `bun run format` (0 changes), `bun run lint` (0 errors), `bun run check` (0 errors, 0 warnings).

### File List

- `src/components/content/FootnoteReveal.astro` (created)
- `src/styles/typography.css` (modified)
- `src/pages/projects/[...slug].astro` (modified)
- `src/pages/writing/[...slug].astro` (modified)

### Review Findings

- [x] [Review][Decision] Empty aside landmark on footnote-free pages — deferred to Story 4.4. Keep as-is at this scope.
- [x] [Review][Decision] Desktop→mobile resize leaves footnotes invisible — accepted as known limitation. Page reload restores correct state. Deferred.
- [x] [Review][Patch] `aria-describedby` target hidden by `display: none` — after the script adds `footnotes-moved`, `section[data-footnotes]` got `display: none`, removing `<h2 id="footnote-label">` from the accessibility tree and breaking `aria-describedby` on footnote refs. Fixed: replaced `display: none` with `visibility: hidden` + `height: 0; overflow: hidden; margin: 0; padding: 0; border: none` — keeps the element in the a11y tree while collapsing it visually. [`src/styles/typography.css`]
- [x] [Review][Patch] Tap target padding is relative to `<sup>` font-size — `padding: 0.5em 0.25em` on `[data-footnote-ref]` resolved to ~23px tap height (well below 44px) because `<sup>` is `font-size: 0.65em`. Fixed: changed to `padding: 1.2rem 0.5rem` (rem-based, independent of `<sup>` font-size). [`src/styles/typography.css`]
- [x] [Review][Patch] `counter(list-item)` breaks in Safari with `list-style: none` — `list-style: none` on `<ol>` resets the implicit list counter in Safari, causing `counter(list-item)` to render "0." for all items. Fixed: added `counter-reset: list-item` on `section[data-footnotes] ol` and `counter-increment: list-item` on `section[data-footnotes] li`. [`src/styles/typography.css`]
- [x] [Review][Patch] `sup:has([data-footnote-ref])` not scoped to prose — selector targeted any `<sup>` in the document, risking style bleed onto non-footnote superscripts. Fixed: scoped to `.drop-cap sup:has([data-footnote-ref])`. [`src/styles/typography.css`]
- [x] [Review][Defer] `opacity: 0` on `#footnote-margin` with no fallback — footnotes are permanently invisible to sighted desktop users until Story 4.4 ships the reverse-scroll reveal. Intentional design decision documented in spec. Deferred to Story 4.4. [`src/styles/typography.css`] — deferred, pre-existing
- [x] [Review][Defer] Desktop→mobile resize leaves footnotes invisible — see decision item above. If accepted as known limitation, this is a pre-existing architectural constraint of the DOM-move approach. Deferred. — deferred, pre-existing
- [x] [Review][Defer] Footnote vertical alignment is approximate — `padding-top: calc(var(--baseline) * 4)` aligns the container, not individual footnotes. Per-footnote positioning deferred to Story 4.4 (GSAP). [`src/styles/typography.css`] — deferred, pre-existing

## Change Log

- 2026-05-22: Story implemented — created `FootnoteReveal.astro`, added footnote CSS to `typography.css`, updated both page templates to replace aside placeholders. All ACs satisfied. Validation passed. Status → review.
