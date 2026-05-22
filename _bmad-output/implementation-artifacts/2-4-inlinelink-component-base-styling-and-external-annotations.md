# Story 2.4: InlineLink Component — Base Styling & External Annotations

Status: done

## Story

As a visitor reading content with links,
I want inline links to be visually quiet at rest but clearly interactive on hover/focus,
so that I can identify links without them disrupting my reading flow.

## Acceptance Criteria

1. The `InlineLink` component exists at `src/components/typography/InlineLink.astro`
2. Inline links have no underline at rest (no `text-decoration: underline` in compiled CSS)
3. On hover and `:focus-visible`, an underline is present via CSS `scaleX` from 0 to 1 with `transform-origin: left`
4. External links display a `↗ domain.com` annotation on hover via `::after` pseudo-element or sibling element in Commit Mono
5. Internal links never carry the `↗ domain.com` annotation
6. Name elements (`<span class="name">` or `<cite>`) show font-weight 400→500 on hover instead of underline
7. All links have `:focus-visible` state: 2px paper-cream offset outline (already global via `global.css` — verify it applies correctly)
8. All links have minimum 44×44px tap target on mobile (via padding, not visual size)
9. The underline uses `transform` only — no animating `width` or layout properties
10. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Create `src/components/typography/InlineLink.astro` (AC: #1, #2, #3, #4, #5, #6, #8, #9)
  - [x] 1.1: Define props interface: `href: string`, `external?: boolean` (default `false`), `class?: string`
  - [x] 1.2: Derive `isExternal` from `href` — true if `href` starts with `http://` or `https://` OR if `external` prop is explicitly `true`
  - [x] 1.3: Extract `domain` from `href` for external links using `new URL(href).hostname` — strip `www.` prefix
  - [x] 1.4: Render an `<a>` with `class="inline-link"` (plus any passed `class`), `rel="noopener noreferrer"` on external links (both values required — `noopener` for security, `noreferrer` for NFR-6 privacy + `jsx-a11y/no-target-blank` lint gate), and `target="_blank"` on external links
  - [x] 1.5: For external links, render the `↗ domain.com` annotation as a `<span class="inline-link-annotation" aria-hidden="true">` sibling inside the `<a>` (NOT `::after` — see Dev Notes)
  - [x] 1.6: Add a `<slot />` for link text content
  - [x] 1.7: Add a `<style>` block with the inkstroke underline CSS (see Dev Notes for exact implementation)

- [x] Task 2: Add `.name` and `<cite>` hover weight styles to `src/styles/typography.css` (AC: #6)
  - [x] 2.1: Add CSS for `span.name` and `cite` — `font-weight: 400` at rest, `font-weight: 500` on hover — use `font-weight` (NOT `font-variation-settings: 'wght'`); the architecture explicitly requires registered axes to use their high-level CSS property. `font-weight` IS animatable on variable fonts in all modern browsers. Story 3.5 adds the `transition` declaration; this story sets the base values only.
  - [x] 2.2: Do NOT add underline to `.name` / `cite` on hover — weight shift is the affordance

- [x] Task 3: Verify `:focus-visible` outline applies correctly to `.inline-link` (AC: #7)
  - [x] 3.1: The global `:focus-visible` rule in `global.css` already sets `outline: 2px solid var(--ink); outline-offset: 2px` — confirm this applies to `<a>` elements inside `InlineLink`
  - [x] 3.2: No additional focus CSS needed in the component unless the global rule is overridden

- [x] Task 4: Run validation gate (AC: #10)
  - [x] 4.1: `bun run format`
  - [x] 4.2: `bun run lint`
  - [x] 4.3: `bun run check`

## Dev Notes

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/components/typography/InlineLink.astro` | Inline link with inkstroke underline + external annotation |

### Files to Modify (UPDATE)

| File | Change |
|------|--------|
| `src/styles/typography.css` | Add `.name` / `cite` hover weight styles |

### Files to NOT Touch

- `src/styles/global.css` — `:focus-visible` rule already correct; do not modify
- `src/layouts/BaseLayout.astro` — no changes needed
- `src/pages/index.astro` — existing links use raw `<a>` tags; do NOT refactor them in this story (Story 3.5 owns animation; this story only creates the component)
- `src/pages/projects/[...slug].astro` — do NOT refactor existing links
- `src/pages/writing/[...slug].astro` — do NOT refactor existing links
- Any content `.md` files — do NOT modify

### Scope Boundary — Critical

**This story creates the `InlineLink` component and its base CSS only.** The animation timing (250ms draw on hover) is added in Story 3.5. At this stage:
- The underline pseudo-element exists and is positioned correctly
- `scaleX(0)` at rest, `scaleX(1)` on hover — the transform IS applied in this story (it's structural, not animation)
- The `transition` property on the underline is NOT added in this story — Story 3.5 owns all timing
- The external annotation IS visible on hover (opacity 0 → 1 via CSS) — but the transition timing is Story 3.5

This means the underline will snap (no easing) and the annotation will snap (no easing) after this story. That is correct and expected. Story 3.5 adds the `transition` declarations.

### InlineLink Component — Full Implementation

```astro
---
// src/components/typography/InlineLink.astro
// Inline link with inkstroke underline (base) and external domain annotation.
// Animation timing (transitions) added in Story 3.5.
// Usage:
//   <InlineLink href="/projects/foo">Project</InlineLink>
//   <InlineLink href="https://example.com">External</InlineLink>

interface Props {
  href: string;
  external?: boolean;
  class?: string;
}

const { href, external = false, class: className } = Astro.props;

// Derive external status from href or explicit prop
const isExternal =
  external || href.startsWith("http://") || href.startsWith("https://");

// Extract domain for annotation (external only)
let domain = "";
if (isExternal) {
  try {
    domain = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    domain = "";
  }
}
---

<a
  href={href}
  class:list={["inline-link", className]}
  {...isExternal ? { rel: "noopener noreferrer", target: "_blank" } : {}}
>
  <slot />
  {
    isExternal && domain && (
      <span class="inline-link-annotation" aria-hidden="true">
        ↗ {domain}
      </span>
    )
  }
</a>

<style>
  /* ============================================================
     INLINE LINK — BASE STYLES
     No underline at rest. Inkstroke underline via ::after scaleX.
     Transition timing added in Story 3.5.
     ============================================================ */
  .inline-link {
    position: relative;
    text-decoration: none;
    color: inherit;
    /* Minimum 44×44px tap target on mobile via padding.
       Use rem to avoid scaling with parent font-size. */
    padding-block: 0.75rem;
  }

  /* Inkstroke underline pseudo-element */
  .inline-link::after {
    content: "";
    position: absolute;
    bottom: 0.75rem; /* aligns with bottom of padding-block: 0.75rem on the <a> */
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--ink);
    transform: scaleX(0);
    transform-origin: left;
    /* transition added in Story 3.5 */
  }

  .inline-link:hover::after,
  .inline-link:focus-visible::after {
    transform: scaleX(1);
  }

  /* External annotation — hidden at rest, visible on hover/focus */
  .inline-link-annotation {
    font-family: var(--font-mono);
    font-size: 0.75em;
    color: var(--meta);
    margin-left: 0.25em;
    opacity: 0;
    /* transition added in Story 3.5 */
  }

  .inline-link:hover .inline-link-annotation,
  .inline-link:focus-visible .inline-link-annotation {
    opacity: 1;
  }
</style>
```

### Why `<span>` for Annotation, Not `::after`

The `::after` pseudo-element cannot contain dynamic text (the domain string) in CSS — `content: attr(data-domain)` would require a `data-domain` attribute on the `<a>`, which is awkward. A `<span aria-hidden="true">` is cleaner: the domain text is in the DOM, `aria-hidden` prevents screen readers from announcing it twice (the `href` already conveys the destination), and it can be styled with Tailwind-compatible classes if needed.

### Why `padding-block: 0.75rem` for Tap Target

The 44×44px tap target requirement (UX-DR12) must be met via padding, not visual size. `padding-block: 0.75rem` adds ~12px top and bottom (24px total vertical padding). Combined with the line-height of the surrounding text (~28px), the total tap target height is ~52px — above the 44px minimum. `padding-inline` is intentionally not added to avoid disrupting inline text flow.

**Important:** `padding-block` on an inline element does not affect layout (it overlaps adjacent lines). This is correct behavior for inline links in prose. If the link is in a flex or block context, the padding will behave differently — acceptable for this project's use cases.

### `font-weight` for `.name` / `cite` — Use the Registered Property

The architecture requires using the high-level CSS property for registered variable font axes — `font-weight` for the `wght` axis, NOT `font-variation-settings: 'wght' 400`. This is explicitly stated in the architecture's enforcement guidelines and the typeface research document.

`font-weight` IS animatable on variable fonts in all modern browsers (Chrome 83+, Firefox 72+, Safari 14+). Story 3.5 adds the `transition` declaration; this story sets the base values only.

```css
/* In typography.css — base values only; transition added in Story 3.5 */
span.name,
cite {
  font-weight: 400;
}

span.name:hover,
cite:hover {
  font-weight: 500;
}
```

**Do NOT use `font-variation-settings: 'wght'`** — that is the anti-pattern the architecture explicitly bans for registered axes.

### Scoped `<style>` vs `typography.css`

The `InlineLink` component uses a `<style>` block (Astro scoped styles) for the inkstroke underline and annotation. This is correct because:
- The styles are component-specific and should not leak to other `<a>` elements
- Astro scopes the styles automatically via a data attribute
- `typography.css` is for global typographic rules (drop cap, footnotes, base body) — not component-specific interaction states

The `.name` / `cite` styles go in `typography.css` because they are content-authoring conventions (authors write `<span class="name">` in Markdown), not component-encapsulated.

### Astro Component Structure (Follow Exactly)

`InlineLink.astro` follows the standard Astro component order:
1. Frontmatter (`---` block) — imports and props
2. Template (HTML) — the `<a>` with slot and annotation span
3. `<style>` block — scoped inkstroke CSS

No `<script>` tag — this component is pure CSS at this stage.

### Token References — Never Hardcode

```css
/* ✅ Correct */
background-color: var(--ink);
color: var(--meta);
font-family: var(--font-mono);

/* ❌ Wrong */
background-color: oklch(0.18 0.008 80);
color: oklch(0.5 0.005 80);
```

### Spacing — Baseline Multiples Only

The `bottom: 0.75rem` on the `::after` pseudo-element is an exception — it matches the `padding-block: 0.75rem` on the `<a>` so the underline sits at the bottom of the tap-target padding box, just below the text. This is acceptable for a decorative pseudo-element. All other spacing must use baseline multiples.

### What This Story Does NOT Include

- No `transition` declarations — Story 3.5 owns all animation timing
- No GSAP — this is pure CSS
- No changes to existing page templates or content files
- No refactoring of existing raw `<a>` tags in pages — Story 3.5 will wire up the component where needed
- No `footnotes.ts` or scroll scripts
- No changes to `BaseLayout.astro`, `global.css` (beyond confirming `:focus-visible` works), or any Epic 1 files
- No `ProjectBand` component — that is Story 2.5

### Existing Link Patterns to Be Aware Of (Do NOT Modify)

The following files contain raw `<a>` tags with Tailwind hover classes. These are intentional at this stage and will be refactored in Story 3.5 when animation timing is added. Do not touch them:

- `src/pages/index.astro` — project/essay links with `hover:text-meta transition-colors`
- `src/pages/writing/[...slug].astro` — italic closing line mailto link
- `src/components/content/Colophon.astro` — social links with `↗` prefix already hardcoded

The `InlineLink` component is created here for use in new content and future refactoring. It does not replace existing links in this story.

### ESLint / Astro Check — Expected Issues to Avoid

- `jsx-a11y` will flag `target="_blank"` without `rel="noreferrer"` — use `rel="noopener noreferrer"` (not just `rel="noopener"`) to satisfy both the security requirement and the linter
- `jsx-a11y` may flag `<a>` with no accessible name if `<slot />` is empty — this is a content authoring concern, not a component defect; the linter should not flag it on the component itself
- TypeScript: `new URL(href)` can throw if `href` is a relative path — the `try/catch` in the frontmatter handles this; `isExternal` will be `false` for relative paths so the `new URL()` call is only reached for `http://` / `https://` hrefs
- `astro/no-unused-define-vars-in-style` — the `<style>` block uses `.inline-link` and `.inline-link-annotation` classes; these are applied in the template, so no unused-vars warning expected
- Prettier will sort Tailwind classes if any are used in the template — `class:list` with a string array is fine

### `rel="noopener noreferrer"` — Required on External Links

Use both values on external links:
- `noopener` — prevents the new tab from accessing `window.opener` (security)
- `noreferrer` — prevents the `Referer` header from being sent (NFR-6 privacy) and satisfies `jsx-a11y/no-target-blank` lint rule

Both values are already in the component template and Task 1.4. Do not reduce to `rel="noopener"` alone.

### Project Structure Alignment

```
src/
├── components/
│   └── typography/
│       ├── DropCap.astro          ← EXISTS — use as-is
│       └── InlineLink.astro       ← CREATE HERE (Task 1)
└── styles/
    └── typography.css             ← MODIFY — add .name / cite styles (Task 2)
```

### Previous Story Learnings (from Story 2.3)

- **`astro:page-load` pattern**: If this component ever needs a `<script>`, use `document.addEventListener('astro:page-load', ...)` — NOT bare module execution. `<ClientRouter />` is active; bare scripts only run on initial hard load. This component has no script, but note for future reference.
- **Tap target padding in rem**: Story 2.3 learned that `padding: 0.5em 0.25em` on a small-font element produced a tap target far below 44px. Always use `rem` for tap target padding, not `em`. Applied here: `padding-block: 0.75rem`.
- **`visibility: hidden` vs `display: none`**: When hiding elements that are accessibility tree targets, use `visibility: hidden` + dimension collapse, not `display: none`. Not directly applicable here, but keep in mind.
- **Scoped selectors**: Story 2.3 patched `sup:has([data-footnote-ref])` to be scoped to `.drop-cap` after review found it could bleed to other `<sup>` elements. The `InlineLink` component's `<style>` block is Astro-scoped automatically — no manual scoping needed.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.4`] — acceptance criteria and user story
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.5`] — animation timing deferred to Story 3.5; this story is the base
- [Source: `_bmad-output/planning-artifacts/architecture.md#Component & File Organization`] — `InlineLink.astro` in `src/components/typography/`
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS Token & Styling Architecture`] — token usage, no hardcoded values
- [Source: `_bmad-output/planning-artifacts/architecture.md#CSS & Tailwind Patterns`] — when to use scoped `<style>` vs `typography.css`; pseudo-elements require custom CSS
- [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`] — Astro component structure order
- [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`] — `PascalCase.astro` for components
- [Source: `_bmad-output/planning-artifacts/architecture.md#Anti-Patterns`] — no hardcoded colors, no layout animation
- [Source: `_bmad-output/planning-artifacts/architecture.md#Accessibility Patterns`] — 44×44px tap targets via padding, `:focus-visible` states
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#FR-21`] — inkstroke underline: no underline at rest, scaleX on hover
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#FR-22`] — external annotation, name weight shift
- [Source: FR-21] — inkstroke underline base (animation in Epic 3)
- [Source: FR-22] — hover affordances base (animation in Epic 3)
- [Source: UX-DR12] — 44×44px minimum tap targets via padding
- [Source: UX-DR14] — `:focus-visible` states match hover affordance for keyboard parity
- [Source: NFR-4] — WCAG 2.2 AA, semantic HTML first
- [Source: NFR-6] — privacy: `noreferrer` on external links prevents Referer header
- [Source: `src/styles/global.css`] — `:focus-visible` rule already defined globally; do not duplicate
- [Source: `src/styles/typography.css`] — existing CSS structure; add `.name` / `cite` block after footnote section
- [Source: `_bmad-output/implementation-artifacts/2-3-footnote-rendering-and-bidirectional-navigation.md#Dev Notes`] — tap target padding must be in `rem`, not `em`; `astro:page-load` pattern for scripts

## Review Findings

- [x] [Review][Decision] Inline element display model — resolved: Option A (`display: inline-block`). Applied to `.inline-link`; `bottom: 0.75rem` on `::after` corrected to `bottom: 0`. [InlineLink.astro]
- [x] [Review][Patch] No `sr-only` new-tab disclosure for external links — added `<span class="sr-only">(opens {domain} in new tab)</span>` inside the `<a>` for all external links. [InlineLink.astro]
- [x] [Review][Patch] `javascript:` URI not sanitized — added `safeHref` guard; `javascript:` hrefs replaced with `#`. [InlineLink.astro]
- [x] [Review][Patch] `external={true}` with relative `href` silently misconfigures — `isExternal` now requires `isAbsolute`; relative hrefs can never trigger external behavior regardless of the `external` prop. [InlineLink.astro]
- [x] [Review][Patch] External link with malformed URL loses `↗` annotation silently — annotation now always renders for external links; shows `↗` without domain when extraction fails. [InlineLink.astro]
- [x] [Review][Patch] `cite:hover` and `span.name:hover` globally unscoped — scoped to `.drop-cap span.name` / `.drop-cap cite` in `typography.css`. [typography.css]
- [x] [Review][Patch] `font-size: 0.75em` on `.inline-link-annotation` compounds in small-font contexts — changed to `font-size: 0.75rem`. [InlineLink.astro]
- [x] [Review][Patch] No forced-colors / Windows High Contrast support — added `@media (forced-colors: active)` block restoring `text-decoration: underline` and hiding `::after`. [InlineLink.astro]
- [x] [Review][Defer] `font-weight` hover on `span.name`/`cite` causes horizontal layout shift — heavier weight is wider, causing surrounding text to reflow on hover. Pre-existing design decision (architecture mandates `font-weight` for the `wght` axis); Story 3.5 adds transitions which will smooth the shift on variable fonts. Acceptable as interim state. — deferred, pre-existing design decision

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

Created `src/components/typography/InlineLink.astro` with full props interface (`href`, `external`, `class`), automatic external detection from `http://`/`https://` prefix or explicit prop, domain extraction via `new URL().hostname` with `www.` stripping, `rel="noopener noreferrer"` + `target="_blank"` on external links, `<span class="inline-link-annotation" aria-hidden="true">` for the `↗ domain` annotation, and scoped `<style>` block with inkstroke underline via `::after` `scaleX(0→1)` on hover/focus-visible. No `transition` declarations — deferred to Story 3.5. Added `span.name` / `cite` `font-weight: 400→500` hover styles to `typography.css` using the registered axis high-level property. Confirmed global `:focus-visible` rule in `global.css` applies to `<a>` elements — no component override needed. All validation passed: `bun run format`, `bun run lint`, `bun run check` — 0 errors, 0 warnings.

### File List

- `src/components/typography/InlineLink.astro` — created
- `src/styles/typography.css` — modified (added `span.name` / `cite` hover weight block)
