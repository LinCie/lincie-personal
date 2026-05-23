# Story 5.4: Project Band Hover Hero Reveal

Status: done

## Story

As a visitor browsing the project index,
I want a low-opacity hero image to appear when I hover over a project band's whitespace,
so that I get a visual preview of the project without it dominating the typography.

## Acceptance Criteria

1. When a visitor hovers over a project band on desktop (`pointer: fine`), a hero image fades from `opacity: 0` to `~0.35` over `~250ms`
2. The inkstroke underline appears on the project title simultaneously with the hero reveal (already wired via `.group:hover h2::after` — no new CSS needed)
3. On un-hover, the hero fades back to `opacity: 0` over `~250ms`
4. The hero image is decorative (`alt=""`, `aria-hidden="true"`)
5. On `:focus-visible` of the band link, the same hero reveal fires (keyboard parity — already wired via `.group:focus-within h2::after` — extend to hero)
6. On mobile (`pointer: coarse`), no hover hero is shown — the band is a simple tap target
7. The hover uses `opacity` only — no scale, no translation
8. The `heroImage` prop is optional — if absent, the right column remains an empty placeholder (no broken image, no layout shift)
9. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Add `heroImage` prop to `ProjectBand.astro` and render the hero `<img>` (AC: #1, #3, #4, #6, #7, #8)
  - [x] 1.1: Add `heroImage?: string` to the `Props` interface (it is already declared but not destructured — destructure it now)
  - [x] 1.2: Destructure `heroImage` from `Astro.props`
  - [x] 1.3: In the right column `<div class="hidden md:block" aria-hidden="true">`, conditionally render an `<img>` when `heroImage` is defined:
    - `src={heroImage}`, `alt=""`, `aria-hidden="true"`
    - Classes: `w-full h-full object-cover opacity-0` (no Tailwind transition classes — transition is handled in the `<style>` block alongside the other hover rules, see Task 2)
    - `h-full` works because the parent `<div>` stretches to fill the grid row height (`min-h-[30vh]` on the `<a>` container) — do NOT add an explicit height to the `<div>`
  - [x] 1.4: Verify: when `heroImage` is undefined, the right column renders as an empty `<div>` with no `<img>` — no broken image, no layout shift

- [x] Task 2: Wire hero opacity to band hover/focus via CSS (AC: #1, #2, #3, #5, #6, #7)
  - [x] 2.1: In the `<style>` block of `ProjectBand.astro`, add rules for the hero `<img>` — following the exact same pattern as the existing `h2::after` rules:
    ```css
    /* Hero image — starts hidden, fades in on band hover/focus */
    img {
      opacity: 0;
      transition: opacity 250ms var(--ease-mark);
    }

    /* Hero image reveal — opacity only, same timing as inkstroke underline */
    :global(.group):hover img,
    :global(.group):focus-within img {
      opacity: 0.35;
    }
    ```
  - [x] 2.2: Do NOT add Tailwind transition classes (`transition-opacity`, `duration-[...]`, `ease-[...]`) to the `<img>` element — the transition is fully handled in the `<style>` block. This matches the established pattern in `ProjectBand.astro` and `InlineLink.astro` where all hover transitions live in scoped CSS.
  - [x] 2.3: Add a `forced-colors` rule inside the existing `@media (forced-colors: active)` block to hide the hero image in Windows High Contrast mode:
    ```css
    @media (forced-colors: active) {
      h2::after {
        display: none;
      }
      img {
        display: none;
      }
    }
    ```
  - [x] 2.4: Confirm `pointer: coarse` exclusion: the `<img>` is inside `<div class="hidden md:block">` — on mobile the entire right column is `display: none`, so the hover rule is a no-op on mobile. No additional CSS gate needed.

- [x] Task 3: Add `heroImage` to the projects content schema (AC: #8)
  - [x] 3.1: Open `src/content.config.ts` (this file already exists — do NOT create a new file, do NOT use `src/content/config.ts`)
  - [x] 3.2: Add `heroImage: z.string().optional()` to the `projects` schema's `z.object({...})` — after `order: z.number()`
  - [x] 3.3: Leave the `writing` collection schema untouched
  - [x] 3.4: Verify the existing `building-lincie.md` project file does NOT need a `heroImage` field — the prop is optional and the component handles its absence gracefully

- [x] Task 4: Pass `heroImage` from the project index page to `ProjectBand` (AC: #1, #8)
  - [x] 4.1: In `src/pages/projects/index.astro`, add `heroImage={entry.data.heroImage}` to the `<ProjectBand>` call
  - [x] 4.2: Verify the home page (`src/pages/index.astro`) does NOT use `ProjectBand` — it uses inline `<a>` links for the 1-project and 2-project cases. No change needed there.

- [x] Task 5: Run validation gate (AC: #9)
  - [x] 5.1: `bun run format`
  - [x] 5.2: `bun run lint`
  - [x] 5.3: `bun run check`

## Dev Notes

### Architecture: Pure CSS Approach — No New Script

This story is implemented entirely in CSS + Astro markup. No new TypeScript script is needed. The hover/focus wiring already exists in `ProjectBand.astro`'s `<style>` block via the `.group` pattern — the hero opacity transition is a direct extension of the same mechanism.

**Why CSS, not GSAP?**
The AC specifies `opacity` only, `~250ms`, no sequencing, no scroll-linking. This is exactly the Tailwind-basic / CSS-transition threshold. GSAP is reserved for complex animation (timelines, scroll-linked, staggered). A CSS `transition` on `opacity` is the correct tool.

**Why not Tailwind `group-hover`?**
Tailwind's `group-hover:` utility would work for the hover case, but the existing `ProjectBand.astro` style block already uses `:global(.group):hover` and `:global(.group):focus-within` for the inkstroke underline. Extending the same pattern keeps the hover/focus logic in one place and avoids mixing Tailwind group utilities with the existing scoped CSS approach.

### Current State of `ProjectBand.astro` — What Already Exists

```astro
interface Props {
  title: string;
  slug: string;
  date: string;
  disciplines: string[];
  // heroImage reserved for Story 5.4 — intentionally omitted from destructuring in this story
  heroImage?: string;
}

const { title, slug, date, disciplines } = Astro.props;
```

The `heroImage` prop is already declared in the interface but intentionally NOT destructured. Story 5.4 completes this by destructuring it and rendering the `<img>`.

The right column placeholder:
```astro
<!-- Right: hero placeholder (Epic 5 injects image here) -->
<div class="hidden md:block" aria-hidden="true"></div>
```

This is the target. Add the conditional `<img>` inside this `<div>`.

The existing `<style>` block already has:
```css
:global(.group):hover h2::after,
:global(.group):focus-within h2::after {
  transform: scaleX(1);
}
```

Extend this pattern for the hero `<img>`.

### Content Schema — `src/content.config.ts` Already Exists (Astro 5 Content Layer API)

The repo uses **Astro 5's Content Layer API**. The config file is at `src/content.config.ts` (NOT `src/content/config.ts`). It already exists and must be **updated**, not created.

Current file uses:
- `import { defineCollection } from "astro:content"` 
- `import { glob } from "astro/loaders"` — Astro 5 loader API
- `import { z } from "astro/zod"` — NOT `from "astro:content"`

**Do NOT use the Astro 4 pattern** (`import { defineCollection, z } from 'astro:content'` with no loader). That will break the build.

The only change needed is adding `heroImage: z.string().optional()` to the `projects` schema:

```typescript
// src/content.config.ts — UPDATE only the projects schema
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    disciplines: z.array(z.string()),
    draft: z.boolean().default(false),
    order: z.number(),
    heroImage: z.string().optional(), // ← ADD THIS LINE
  }),
});
```

Leave the `writing` collection and all imports exactly as they are.

### Hero Image — Where to Put It

Hero images should live in `public/` for direct URL reference (e.g. `public/heroes/building-lincie.jpg`). The `heroImage` field in frontmatter is a URL string like `"/heroes/building-lincie.jpg"`.

**Do NOT use Astro's `image()` schema helper** — that requires `src/assets/` and the `<Image>` component. The architecture specifies no image pipeline at MVP. A plain `<img src={heroImage}>` with a `public/` path is correct.

**The existing `building-lincie.md` has no `heroImage` field** — this is fine. The prop is optional and the component renders an empty placeholder when absent. No sample hero image needs to be added for the story to pass validation.

### CSS Implementation Detail — `<img>` Inside `aria-hidden` Container

The right column `<div aria-hidden="true">` already exists. The `<img>` inside it inherits the `aria-hidden` from the parent, but the AC also requires `aria-hidden="true"` on the `<img>` itself for belt-and-suspenders. Add both `alt=""` and `aria-hidden="true"` on the `<img>`.

### Complete `ProjectBand.astro` Hero Section

After this story, the right column should look like:

```astro
<!-- Right: hero image — fades in on band hover/focus (Story 5.4) -->
<div class="hidden md:block" aria-hidden="true">
  {heroImage && (
    <img
      src={heroImage}
      alt=""
      aria-hidden="true"
      class="h-full w-full object-cover"
    />
  )}
</div>
```

And the `<style>` block additions (extend the existing block — do not replace it):

```css
/* Hero image — starts hidden, fades in on band hover/focus */
img {
  opacity: 0;
  transition: opacity 250ms var(--ease-mark);
}

/* Hero image reveal — opacity only, same timing as inkstroke underline */
:global(.group):hover img,
:global(.group):focus-within img {
  opacity: 0.35;
}
```

And the existing `forced-colors` block becomes:

```css
@media (forced-colors: active) {
  h2::after {
    display: none;
  }
  img {
    display: none;
  }
}
```

### Feature Gate Matrix

| Behavior | `REDUCED_MOTION` | `COARSE_POINTER` | Rationale |
|---|---|---|---|
| Hero opacity reveal | **NOT gated by JS** | **Gated by CSS** (`hidden md:block` hides right column on mobile) | Pure CSS transition; `prefers-reduced-motion` CSS safety net in `global.css` kills `transition-duration` to `0.01ms` — the image still appears but instantly |
| Inkstroke underline | **NOT gated by JS** | **Gated by CSS** (same `hidden md:block` pattern) | Pre-existing behavior from Story 3.5 |

**Note on `prefers-reduced-motion`:** The global CSS safety net in `global.css` sets `transition-duration: 0.01ms !important` under `prefers-reduced-motion: reduce`. This means the hero image will still appear on hover under reduced-motion — it just appears instantly rather than fading. This is correct behavior: the image is information (a preview), not motion for its own sake.

### Files to Create (NEW)

None. All files already exist.

### Files to Modify (UPDATE)

| File | Change |
|---|---|
| `src/content.config.ts` | Add `heroImage: z.string().optional()` to the `projects` schema |
| `src/components/content/ProjectBand.astro` | Destructure `heroImage`, render conditional `<img>`, add CSS hover/transition/forced-colors rules |
| `src/pages/projects/index.astro` | Pass `heroImage={entry.data.heroImage}` to `<ProjectBand>` |

### Files to NOT Touch

- `src/scripts/scroll.ts` — no scroll behavior needed
- `src/scripts/gsap-init.ts` — no GSAP needed
- `src/layouts/BaseLayout.astro` — no layout changes
- `src/pages/index.astro` — home page uses inline links, not `ProjectBand`
- `src/pages/projects/[...slug].astro` — project detail page, not the index
- Any essay page — unrelated
- `src/styles/global.css` — no new tokens needed
- `src/styles/typography.css` — unrelated

### What Already Exists — Do NOT Recreate

| Already Done | Where | Notes |
|---|---|---|
| `.group` hover/focus pattern | `ProjectBand.astro` `<style>` | Extend, do not replace |
| `heroImage?: string` in Props interface | `ProjectBand.astro` | Already declared; just destructure |
| Right column `<div class="hidden md:block">` | `ProjectBand.astro` | Target for `<img>` injection |
| `transition:name` on `<h2>` | `ProjectBand.astro` | Do NOT touch — View Transitions FLIP-echo |
| `--ease-mark` CSS custom property | `global.css` | Use in `transition: opacity 250ms var(--ease-mark)` in scoped CSS |
| `@media (forced-colors: active)` block | `ProjectBand.astro` `<style>` | Extend with `img { display: none; }` — do not create a second block |
| `src/content.config.ts` | `src/content.config.ts` | Astro 5 Content Layer API — update, do not recreate |

### A11y Interaction Checklist

- [ ] `alt=""` on hero `<img>` — decorative image, empty alt per WCAG 1.1.1
- [ ] `aria-hidden="true"` on hero `<img>` — belt-and-suspenders with parent container
- [ ] `:focus-within` on `.group` already covers keyboard parity — no additional work needed
- [ ] Hero reveal fires on `:focus-visible` of the `<a>` inside the `<article class="group">` — `:focus-within` on the article propagates correctly
- [ ] No `REDUCED_MOTION` JS gate needed — CSS safety net handles it (instant transition, not suppressed)

### JS Budget Impact

Zero. This story adds no JavaScript. Current budget after Story 5.3: ~47.6KB gzip. After this story: ~47.6KB. Budget ceiling: 60KB. ~12.4KB headroom remains.

### Previous Story Intelligence (from Story 5.3)

- The `.group` + `:global(.group):hover` pattern is established and working. Extend it — do not replace it.
- `--ease-mark` is the correct easing token for hover affordances (established in Story 3.5).
- `250ms` is the hover timing rhythm across the site (inkstroke underline, external link annotation, name weight). Use `transition: opacity 250ms var(--ease-mark)` in scoped CSS to match.
- The `hidden md:block` pattern on the right column already gates mobile — no JS gate needed.

### Cross-Browser Edge Cases

- **`object-cover` on `<img>` with `h-full`:** The `<img>` needs `h-full w-full` to fill the right column. The right column `<div>` stretches to fill the grid row height (`min-h-[30vh]` on the `<a>` container) — `h-full` on the `<img>` fills that height correctly.
- **Safari `transition` on `opacity`:** No known issues. `opacity` transitions are universally supported.
- **Scoped CSS `img` selector:** Astro scopes the `img` rule to this component's shadow DOM via a `data-astro-cid-*` attribute. It will not affect `<img>` elements in other components.

### References

- [FR-10] — Project index bands: hover-revealed hero at 30–40% opacity.
- [FR-22] — Hover affordances: project titles inkstroke underline + hero opacity reveal.
- [UX-DR2] — Mobile layout: no hover hero on `pointer: coarse`.
- [UX-DR13] — Decorative elements `aria-hidden="true"`.
- [Architecture: CSS & Tailwind Patterns] — `opacity` only for hover, `transform` for underline.
- [Architecture: Animation Rules] — Tailwind CSS for simple transitions; GSAP for complex animation.
- [Architecture: Anti-Patterns] — No `box-shadow`, no layout animation.
- [Story 2.5 Dev Notes] — Right column reserved for hero; `transition:name` on `<h2>` must be preserved.
- [Story 3.5 Dev Notes] — `--ease-mark` and `250ms` as the hover timing rhythm.
- [Story 5.3 Dev Notes] — `.group` pattern, `hidden md:block` mobile gate.

## Review Findings

- [x] [Review][Patch] No URL validation on `heroImage` — a content author writing `heroes/foo.jpg` (missing leading slash) gets a silent 404 with no visible fallback since `alt=""` [src/content.config.ts — schema comment or src/components/content/ProjectBand.astro]
- [x] [Review][Defer] No `loading="lazy"` on hero `<img>` [src/components/content/ProjectBand.astro] — deferred, pre-existing gap; no hero images exist yet, revisit when first image is added
- [x] [Review][Defer] No `object-position` specified — default center crop may not suit all hero images [src/components/content/ProjectBand.astro] — deferred, design decision for when real images are added
- [x] [Review][Defer] Broad `img` selector in scoped CSS — a future second `<img>` in this component would unexpectedly get `opacity: 0` and the hover reveal [src/components/content/ProjectBand.astro] — deferred, pre-existing pattern; component is simple enough to be acceptable now
- [x] [Review][Defer] No `decoding="async"` on hero `<img>` — minor performance omission [src/components/content/ProjectBand.astro] — deferred, pre-existing gap

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

_None._

### Completion Notes List

- Destructured `heroImage` from `Astro.props` in `ProjectBand.astro` (prop was already declared in the interface).
- Added conditional `<img src={heroImage} alt="" aria-hidden="true" class="h-full w-full object-cover">` inside the right column `<div class="hidden md:block">`. When `heroImage` is undefined, the column renders as an empty `<div>` — no broken image, no layout shift.
- Extended the `<style>` block with: `img { opacity: 0; transition: opacity 250ms var(--ease-mark); }` and `:global(.group):hover img, :global(.group):focus-within img { opacity: 0.35; }` — following the exact same pattern as the existing `h2::after` hover rules.
- Extended the existing `@media (forced-colors: active)` block with `img { display: none; }` — no second block created.
- No Tailwind transition utilities on the `<img>` — transition lives entirely in scoped CSS, matching the established codebase pattern.
- Added `heroImage: z.string().optional()` to the `projects` schema in `src/content.config.ts` after `order: z.number()`. Writing collection left untouched.
- Added `heroImage={entry.data.heroImage}` to the `<ProjectBand>` call in `src/pages/projects/index.astro`.
- Zero JavaScript added. JS budget unchanged at ~47.6KB gzip.
- `bun run format && bun run lint && bun run check` all pass (0 errors, 0 warnings).

### File List

- `src/components/content/ProjectBand.astro`
- `src/content.config.ts`
- `src/pages/projects/index.astro`

### Change Log

- 2026-05-23: Story 5.4 created — project band hover hero reveal.
- 2026-05-23: Story 5.4 validated against checklist — fixed wrong content config file path (`src/content/config.ts` → `src/content.config.ts`, Astro 5 Content Layer API); corrected `<img>` transition approach from Tailwind utilities to scoped CSS `transition:` property (matching established codebase pattern); added `forced-colors` rule for hero `<img>`; clarified `h-full` grid row height behavior; updated Files to Create/Modify tables accordingly.
- 2026-05-23: Story 5.4 implemented — all tasks complete, validation passes, status set to review.
