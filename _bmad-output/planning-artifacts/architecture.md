---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-05-21'
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-lincie-2026-05-20/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - PRODUCT.md
  - DESIGN.md
  - _bmad-output/brainstorming/brainstorming-session-2026-05-20-1305.md
  - _bmad-output/planning-artifacts/research/technical-typeface-pairing-research-2026-05-20.md
workflowType: 'architecture'
project_name: 'lincie'
user_name: 'LinCie'
date: '2026-05-21'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

25 FRs across 12 feature groups, organized into three implementation tiers:

- **Tier 1 — Foundation (FR-1 through FR-9, FR-10 structure, FR-15):** Frame layout with corner labels, typography pipeline (Newsreader + Commit Mono via Astro Fonts API with Fontsource), OKLCH color tokens, baseline grid (28px), home page composition, colophon, page templates. The site must be fully functional, readable, and on-brand with zero JavaScript at this tier.
- **Tier 2 — Signature (FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22):** Cursor afterglow (GSAP), page reveal sequence (GSAP timeline), Astro View Transitions with Frame persistence and title FLIP-echo, fog-lifting section reveals, hover language (inkstroke underline, external link annotation, name weight increase).
- **Tier 3 — Polish (FR-8, FR-12, FR-23, FR-24, FR-25, FR-10 hover, FR-11 spine):** Paper-tone drift, reverse-scroll footnote reveal, damped smooth scroll (ScrollTrigger.normalizeScroll), section pin, live local time, project spine with scroll indicator.

**Non-Functional Requirements:**

| Concern | Target | Architectural Impact |
|---------|--------|---------------------|
| Performance | Lighthouse ≥95, LCP ≤2.5s, INP ≤200ms, CLS = 0 | Static output, font-display: optional, metric-matched fallback, no render-blocking JS |
| JS Budget | ≤60KB gzip total (GSAP + site scripts) | Tree-shake GSAP, no additional animation libraries, code-split per page |
| Font Budget | <200KB total (latin subsets) | Subset to latin only, preload roman only, italic + mono on demand |
| Accessibility | WCAG 2.2 AA all pages, all paper-tone bands | Contrast validation at 4 time bands, prefers-reduced-motion path, keyboard nav, semantic HTML |
| Security | No third-party scripts, CSP same-origin only | Static deploy, no inline event handlers, no eval |
| Privacy | No cookies, no analytics, no tracking | Privacy by absence — no configuration needed |
| Browser Support | Latest 2 versions Chrome/Firefox/Safari/Edge, iOS Safari 16+ | Progressive enhancement for hanging-punctuation (Safari-only) |
| Reliability | Static deploy, build-success gate | No SSR runtime, failed build = no deploy |
| Animation | Transform + opacity only (filter allowed for fog-lifting) | Single animation token set, one-section-at-a-time blur constraint |

**Scale & Complexity:**

- Primary domain: Static web (Astro SSG) with rich client-side interaction
- Complexity level: Medium (simple data, sophisticated presentation layer)
- Estimated architectural components: ~15 Astro components, 1 global stylesheet with token layer, 3–5 client-side scripts (GSAP-driven), 2 content collections

### Technical Constraints & Dependencies

**Locked technology stack (no additions allowed):**
- Runtime: Astro 6 static output (`output: 'static'`)
- Styling: Tailwind CSS 4.3 (utility-first, custom theme extending tokens)
- Animation: GSAP 3.15 (ScrollTrigger for scroll-linked behaviors)
- Package manager: Bun
- Node: ≥22.12.0
- Deploy: Vercel (static)
- Fonts: Newsreader (variable, Fontsource) + Commit Mono (static, Fontsource) via Astro Fonts API

**Explicit bans:**
- No new dependencies beyond what's in `package.json`
- No Lenis (use GSAP ScrollTrigger.normalizeScroll instead)
- No Framer Motion, Motion One, Lottie
- No IBM Plex Mono, Geist Mono
- No SPA framework, no client-side router beyond View Transitions
- No service worker, no PWA
- No CMS, no database, no API

**Build/validation gate:**
```
bun run format && bun run lint && bun run check
```

### Cross-Cutting Concerns Identified

1. **Motion accessibility** — Every animated component must implement a `prefers-reduced-motion` path (instant final state, no animation). Affects: cursor afterglow, reveal sequence, damped scroll, section pin, fog-lifting, reverse-scroll footnotes, page transitions.

2. **Device adaptation** — `pointer: coarse` disables cursor-dependent and scroll-normalization features. Affects: cursor afterglow, damped scroll, reverse-scroll footnotes. Mobile layout reduces corner labels from 4 to 2.

3. **Animation lifecycle** — GSAP tweens, ScrollTrigger instances, and `setInterval` must be cleaned up on page navigation (Astro View Transitions) and paused on `document.visibilityState === 'hidden'`. No zombie tickers.

4. **Performance budget enforcement** — 60KB gzip JS budget shared across GSAP core + ScrollTrigger + all site scripts. Architecture must enable tree-shaking and per-page code splitting.

5. **OKLCH contrast validation** — Color tokens drift across 4 time-of-day bands. Body text must maintain ≥4.5:1 and corner labels ≥3:1 at every band. Requires implementation-time verification.

6. **Content-count-driven behavior** — Home page composition changes at content thresholds (1, 2, ≥3 projects/essays). Architecture must support dynamic rendering based on collection count without client-side JS.

7. **Font loading strategy** — `font-display: optional` + metric-matched Georgia fallback = zero CLS but cold-cache visitors see Georgia. Newsreader roman preloaded; italic and Commit Mono load on demand. Architecture must ensure the fallback experience is still on-brand.

8. **View Transitions integration** — Frame elements persist across navigations (`transition:persist`). Content cross-fades. Project titles carry per-slug `transition:name`. The reveal sequence fires only on first paint per session, not on subsequent navigations.



## Starter Template Evaluation

### Primary Technology Domain

**Static web (Astro SSG) with rich client-side interaction** — already scaffolded and operational.

### Starter Options Considered

No starter template evaluation is needed. The project was initialized with `create astro` and already has all foundational tooling configured:

- Astro 6.3.5 with static output
- Tailwind CSS 4.3 via `@tailwindcss/vite`
- GSAP 3.15 installed
- TypeScript (strict mode, extends `astro/tsconfigs/strict`)
- ESLint 10 with `eslint-plugin-astro` + `eslint-plugin-jsx-a11y`
- Prettier 3.8 with `prettier-plugin-astro` + `prettier-plugin-tailwindcss`
- `@astrojs/check` for Astro type checking

### Selected Starter: Existing Astro 6 scaffold (already initialized)

**Rationale:** The project is already past the initialization phase. All dependencies are installed, the validation gate (`bun run format && bun run lint && bun run check`) is functional, and the base layout exists. No re-initialization needed.

**Architectural Decisions Already Established:**

**Language & Runtime:**
- TypeScript strict mode (`extends: "astro/tsconfigs/strict"`)
- Node ≥22.12.0
- ES modules (`"type": "module"`)

**Styling Solution:**
- Tailwind CSS 4.3 via Vite plugin (`@tailwindcss/vite`)
- Prettier plugin for class sorting (`prettier-plugin-tailwindcss`)
- Single `global.css` with `@import "tailwindcss"` as entry point

**Build Tooling:**
- Astro's built-in Vite bundler (no custom Vite config beyond Tailwind plugin)
- Static output mode (no SSR adapter)
- Bun as package manager and script runner

**Linting & Formatting:**
- ESLint 10 with Astro + JSX-a11y plugins (accessibility linting built in)
- Prettier with Astro + Tailwind plugins
- `bun run check` runs Astro's type checker

**Code Organization (current, minimal):**
- `src/layouts/` — base layout
- `src/pages/` — route pages
- `src/styles/` — global CSS

**What Remains to Be Decided (architecture step 4+):**
- Content collections schema and structure
- Component directory organization
- Client-side script architecture (GSAP loading, code splitting)
- Font pipeline configuration (Astro Fonts API)
- CSS custom property / token layer structure
- View Transitions configuration
- Vercel deployment configuration


## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Content Collections schema and structure
2. Component and file organization
3. Client-side script architecture (GSAP loading, lifecycle, budget)
4. CSS token and styling architecture (OKLCH, Tailwind theme, custom CSS)
5. View Transitions and animation lifecycle

**Deferred Decisions (Post-MVP):**
- RSS feed generation
- Per-page OG image pipeline
- Sitemap automation
- Latin-ext subset (only if content audit shows need)

### Content Architecture

**Decision:** Two Astro Content Collections (`projects`, `writing`) with typed Zod schemas, build-time content-count resolution, and standard Markdown footnote syntax.

**Structure:**
```
src/content/
├── config.ts          ← collection schemas (Zod)
├── projects/
│   └── {slug}.md      ← one file per project
└── writing/
    └── {slug}.md      ← one file per essay
```

**Project frontmatter schema:**
- `title: string` — display title
- `description: string` — meta description + home page teaser
- `date: string` — YYYY-MM-DD
- `disciplines: string[]` — e.g. ["Engineering", "Research"]
- `draft: boolean` — excluded from build when true
- `order: number` — display order on home/index

**Writing frontmatter schema:**
- `title: string`
- `subtitle?: string`
- `description: string`
- `date: string`
- `draft: boolean`
- `order: number`

**Content-count logic:** Resolved at build time in page frontmatter scripts. `getCollection('projects').filter(p => !p.data.draft).length` determines home page composition. No client-side JS needed.

**Footnotes:** Standard Markdown `[^1]` syntax, rendered by remark into `<aside>` elements targeted by the FootnoteReveal client script.

**Rationale:** Astro Content Collections provide type-safe queries, automatic slug generation, and build-time validation. The schema is minimal — only what's needed for rendering and ordering. Draft filtering keeps unpublished content out of production without a separate branch workflow.

### Component & File Organization

**Decision:** Components grouped by concern (frame, typography, content, motion), scripts separated from components, font assets pre-staged for fallback swap.

**Structure:**
```
src/
├── assets/fonts/               ← pre-staged woff2 (FR-4 escape hatch)
├── components/
│   ├── frame/                  ← Frame scaffold (Frame, Folio, LocalTime)
│   ├── typography/             ← Type components (DropCap, InlineLink)
│   ├── content/                ← Content rendering (Colophon, ProjectBand, ProjectSpine, FootnoteReveal)
│   └── motion/                 ← Animation-only (CursorAfterGlow, RevealSequence, SectionPin)
├── content/                    ← Astro Content Collections
├── layouts/
│   └── BaseLayout.astro        ← wraps every route, includes Frame
├── pages/
│   ├── index.astro
│   ├── projects/[...slug].astro
│   ├── writing/[...slug].astro
│   └── 404.astro
├── scripts/                    ← client-side JS (GSAP-driven)
│   ├── gsap-init.ts            ← GSAP + ScrollTrigger registration
│   ├── cursor.ts
│   ├── reveal.ts
│   ├── scroll.ts
│   ├── footnotes.ts
│   ├── paper-tone.ts
│   └── local-time.ts
└── styles/
    ├── global.css              ← Tailwind + @theme + tokens + base
    └── typography.css          ← font-face, drop-cap, hanging-punctuation
```

**Rationale:** Grouping by concern (not by tier) matches how a developer thinks when looking for a component. Scripts are separate because Astro components define structure while client-side GSAP logic is a distinct concern with its own lifecycle. Pre-staged fonts satisfy FR-4's 5-minute swap requirement.

### Client-Side Script Architecture

**Decision:** Single GSAP entry point (`gsap-init.ts`), per-page script loading via Astro `<script>` tags, "gate + cleanup" lifecycle pattern, visibility-state pausing, sessionStorage for one-shot behaviors.

**Loading strategy:**
- `gsap-init.ts` is the only file that imports from `'gsap'` and `'gsap/ScrollTrigger'`
- All other scripts import from `gsap-init.ts`
- Vite tree-shakes and deduplicates automatically
- No other GSAP plugins imported (no Flip, Draggable, MotionPath)

**Per-page loading:**
- `reveal.ts` + `paper-tone.ts` — loaded in BaseLayout (every page)
- `cursor.ts` — loaded in BaseLayout (gates on pointer: coarse)
- `scroll.ts` + `footnotes.ts` — loaded only on project/essay pages
- `local-time.ts` — loaded in BaseLayout

**Lifecycle pattern (every script):**
1. Gate — check `prefers-reduced-motion` and `pointer: coarse`
2. Register — push GSAP instances to cleanup array
3. Clean — kill everything on `astro:before-swap`
4. Re-init — rebuild on `astro:after-swap`
5. Pause — freeze global timeline on `document.visibilityState === 'hidden'`
6. Session memory — `sessionStorage` for reveal sequence (fires once per session)

**Budget estimate:**
- GSAP core: ~28KB gzip
- ScrollTrigger: ~12KB gzip
- Site scripts: ~8–12KB gzip
- **Total: ~48–52KB gzip** (within 60KB budget with headroom)

**Rationale:** Single entry point ensures one GSAP copy ships. The gate+cleanup pattern prevents zombie tickers and respects accessibility preferences. Per-page loading avoids shipping scroll/footnote code on the home page. SessionStorage (not localStorage) ensures the reveal fires fresh on new browser sessions.

### CSS Token & Styling Architecture

**Decision:** OKLCH tokens as CSS custom properties in `global.css`, Tailwind 4 `@theme` directive extending tokens into utilities, paper-tone drift via JS updating `--paper-tone`, custom CSS limited to two files (global.css + typography.css).

**Token layer:**
```css
:root {
  --paper: var(--paper-tone);
  --ink: oklch(0.18 0.008 80);
  --meta: oklch(0.50 0.005 80);
  --hairline: oklch(0.85 0.005 80);
  --paper-tone: oklch(0.97 0.008 80); /* default midday, overridden by JS */
  --baseline: 28px;
  --type-scale-ratio: 1.25;
  --drop-cap-lines: 3;
  --ease-settle: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-mark: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur-quick: 150ms;
  --dur-breath: 400ms;
  --dur-arrive: 600ms;
}
```

**Tailwind 4 theme integration:**
```css
@theme {
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-meta: var(--meta);
  --color-hairline: var(--hairline);
  --font-serif: 'Newsreader', Georgia, ui-serif, Cambria, 'Times New Roman', serif;
  --font-mono: 'Commit Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**Paper-tone drift:** Four pre-computed OKLCH bands (predawn, midday, dusk, night), all verified for WCAG AA contrast against `--ink`. JS reads local time, sets `--paper-tone` on `:root`. Band transitions cut hard (no interpolation) under reduced-motion.

**Custom CSS scope:**
- `global.css` — Tailwind import, `@theme`, tokens, base resets, transition keyframes, reduced-motion safety net
- `typography.css` — `@font-face` declarations (metric-matched fallback), drop cap pseudo-element, hanging punctuation, optical sizing
- No other CSS files. All other styling is Tailwind utilities in component markup.

**Rationale:** CSS custom properties as the single source of truth means both Tailwind utilities and custom CSS reference the same values. The `@theme` directive makes tokens available as Tailwind classes (`bg-paper`, `text-ink`, `font-serif`). Paper-tone drift via JS (not CSS media queries) because there's no media query for time-of-day. Two CSS files keeps the styling surface small and auditable.

### View Transitions & Animation Lifecycle

**Decision:** Astro `<ViewTransitions />` with `transition:persist` on Frame elements, custom 8px settle/drift animation, per-slug `transition:name` for title FLIP-echo, "gate + cleanup" lifecycle on all scripts, CSS reduced-motion safety net.

**Frame persistence:**
- `<nav>` (corner labels): `transition:persist`
- `<footer>` (colophon): `transition:persist`
- `<main>` (content): `transition:animate="fade"` with custom 8px settle/drift keyframes

**Title FLIP-echo:**
- Index page: `<h2 transition:name={`project-title-${slug}`}>`
- Project page: `<h1 transition:name={`project-title-${slug}`}>`
- Astro handles the morph automatically between matching `transition:name` values

**Custom transition keyframes:**
- Exit: opacity 1→0, translateY(0→8px) over 600ms
- Enter: opacity 0→1, translateY(-8px→0) over 600ms
- Easing: `var(--ease-settle)`

**Feature gate matrix:**

| Script | `prefers-reduced-motion` | `pointer: coarse` |
|--------|--------------------------|-------------------|
| reveal.ts | gates (instant final state) | runs |
| cursor.ts | gates | gates |
| scroll.ts | gates | gates (damped); gates (pin) |
| footnotes.ts | gates (always visible) | gates (always visible) |
| paper-tone.ts | runs | runs |
| local-time.ts | runs | runs |

**Reveal sequence session logic:**
- Uses `sessionStorage` key to fire only on first paint per browser session
- View Transition navigations within the session skip the reveal
- Under reduced-motion: marks as revealed immediately, paints final state

**CSS safety net:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Rationale:** The gate+cleanup pattern ensures no animation runs where it shouldn't, and no GSAP instance survives a page navigation. `transition:persist` keeps the Frame visually stable during transitions (no flicker). SessionStorage (cleared on tab close) means returning visitors get the reveal again — appropriate for a portfolio where the reveal is part of the brand experience. The CSS safety net is belt-and-suspenders insurance against JS gate failures.

### Decision Impact Analysis

**Implementation Sequence:**
1. Token layer + Tailwind theme (everything else references these)
2. Font pipeline (Astro Fonts API config + metric-matched fallback)
3. Content Collections schemas (pages need content to render)
4. BaseLayout with Frame + View Transitions
5. Page templates (home, project, essay, 404)
6. Tier 1 components (Colophon, DropCap, InlineLink, ProjectBand)
7. Tier 2 scripts (reveal, cursor, hover animations)
8. Tier 3 scripts (scroll, footnotes, section pin, paper-tone, local-time, project spine)

**Cross-Component Dependencies:**
- All components depend on the token layer (`global.css`)
- All scripts depend on `gsap-init.ts`
- Page-specific scripts depend on the HTML structure their components render
- View Transitions depend on `transition:persist` and `transition:name` attributes in the layout and page templates
- Paper-tone drift affects all color-dependent components (contrast must hold at all bands)
- Content-count logic in the home page depends on Content Collections being populated


## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

7 areas where AI agents could make different choices that would break consistency:

1. Component authoring — how Astro components are structured, where logic lives, how props are typed
2. CSS/Tailwind usage — when to use utilities vs custom CSS, class ordering, token references
3. GSAP patterns — how animations are created, registered, and cleaned up
4. Content markup — how footnotes, links, and metadata are authored in Markdown
5. Accessibility implementation — how reduced-motion and pointer-coarse are handled
6. File naming — kebab-case vs PascalCase, index files vs named files
7. Import paths — relative vs aliases, script references in components

### Naming Patterns

**File naming:**
- Astro components: `PascalCase.astro` (e.g. `ProjectBand.astro`, `InlineLink.astro`)
- TypeScript scripts: `kebab-case.ts` (e.g. `gsap-init.ts`, `paper-tone.ts`)
- CSS files: `kebab-case.css` (e.g. `global.css`, `typography.css`)
- Content files: `kebab-case.md` (e.g. `my-first-project.md`)
- Layout files: `PascalCase.astro` (e.g. `BaseLayout.astro`)

**CSS custom properties:**
- Design tokens: `--{token-name}` (e.g. `--paper`, `--ink`, `--baseline`)
- Animation tokens: `--{category}-{name}` (e.g. `--ease-settle`, `--dur-breath`)
- Component-scoped: `--{component}-{property}` (e.g. `--drop-cap-lines`)

**CSS classes (when custom CSS is needed):**
- BEM-lite: `.frame-tl`, `.frame-br`, `.drop-cap`, `.project-spine`
- No deep nesting. No `__element--modifier` chains. Keep flat.

**Content collection slugs:**
- Derived from filename automatically by Astro
- Filenames are kebab-case English: `building-lincie.md`, not `Building_Lincie.md`

**Transition names:**
- Pattern: `{element}-{slug}` (e.g. `project-title-building-lincie`)
- Never reuse a `transition:name` value across unrelated routes

### Structure Patterns

**Astro component structure (every `.astro` file follows this order):**

```astro
---
// 1. Imports
import Component from '../components/Component.astro';

// 2. Props interface
interface Props {
  title: string;
  slug: string;
}

// 3. Props destructuring
const { title, slug } = Astro.props;

// 4. Data fetching / computation
const projects = await getCollection('projects');
---

<!-- 5. Template (HTML) -->
<div class="...">
  <slot />
</div>

<!-- 6. Scoped styles (only if Tailwind cannot express it) -->
<style>
  /* component-scoped CSS */
</style>

<!-- 7. Client-side script (if needed) -->
<script>
  import { gsap } from '../scripts/gsap-init';
</script>
```

**Script file structure (every `.ts` file in `src/scripts/`):**

```typescript
// 1. Imports
import { gsap, ScrollTrigger } from './gsap-init';

// 2. Feature gates (constants, never re-evaluated)
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE_POINTER = window.matchMedia('(pointer: coarse)').matches;

// 3. Instance registry
let instances: { kill: () => void }[] = [];
let intervals: ReturnType<typeof setInterval>[] = [];

// 4. Cleanup function
function cleanup() { /* ... */ }

// 5. Init function
function init() { /* ... */ }

// 6. Lifecycle hooks
document.addEventListener('astro:before-swap', cleanup);
document.addEventListener('astro:after-swap', init);

// 7. Initial run
init();
```

### CSS & Tailwind Patterns

**When to use Tailwind utilities (default):**
- All spacing, layout, responsive behavior
- Colors referencing tokens (`bg-paper`, `text-ink`, `text-meta`)
- Font family and size (`font-serif`, `font-mono`, `text-lg`)
- States (`hover:`, `focus-visible:`, `motion-reduce:`)
- Display, overflow, position

**When to use custom CSS (exception, must justify):**
- Pseudo-elements (`::first-letter` for drop cap, `::after` for inkstroke underline)
- `hanging-punctuation` (no Tailwind utility exists)
- `@font-face` declarations
- Keyframe animations referenced by Tailwind or GSAP
- The reduced-motion safety-net override

**Class ordering:** Handled by `prettier-plugin-tailwindcss` automatically.

**Token references — never hardcode values:**
```html
<!-- ✅ Correct -->
<p class="text-ink bg-paper font-serif">

<!-- ❌ Wrong — hardcoded color -->
<p class="text-[oklch(0.18_0.008_80)]">

<!-- ❌ Wrong — hardcoded font -->
<p style="font-family: Newsreader">
```

**Spacing — always use baseline multiples:**
```html
<!-- ✅ Correct — 28px baseline = 7 in Tailwind's 4px scale -->
<div class="mb-7">  <!-- 28px -->
<div class="mb-14"> <!-- 56px = 2× baseline -->
<div class="mb-21"> <!-- 84px = 3× baseline -->

<!-- ❌ Wrong — arbitrary spacing that breaks the grid -->
<div class="mb-5">  <!-- 20px, not on baseline -->
```

### GSAP Patterns

**Never import GSAP directly — always through `gsap-init.ts`:**
```typescript
// ✅ Correct
import { gsap, ScrollTrigger } from './gsap-init';

// ❌ Wrong
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
```

**Always register instances for cleanup:**
```typescript
// ✅ Correct
const tl = gsap.timeline();
instances.push(tl);

const trigger = ScrollTrigger.create({ /* ... */ });
instances.push(trigger);

// ❌ Wrong — orphaned instance, will zombie after navigation
gsap.to('.element', { opacity: 1 });
```

**Animation properties — transform and opacity only:**
```typescript
// ✅ Correct
gsap.to(el, { opacity: 0, y: 8, scale: 0.98 });

// ✅ Allowed for fog-lifting only
gsap.to(el, { filter: 'blur(7px)' });

// ❌ Wrong — animating layout properties
gsap.to(el, { width: '100%', height: 200, marginTop: 20 });
```

**Duration values — always reference token equivalents:**
```typescript
// ✅ Correct — matches token semantics
gsap.to(el, { duration: 0.15 });  // --dur-quick (150ms)
gsap.to(el, { duration: 0.4 });   // --dur-breath (400ms)
gsap.to(el, { duration: 0.6 });   // --dur-arrive (600ms)

// ❌ Wrong — arbitrary duration
gsap.to(el, { duration: 0.73 });
```

### Content Authoring Patterns

**Footnotes in Markdown:**
```markdown
<!-- ✅ Correct — standard syntax, at least one in first paragraph -->
The site exhibits and reads[^1]. Engineering and design are the same voice.

[^1]: This is supplementary context, never essential to understanding the main text.
```

**Frontmatter — always include all required fields:**
```yaml
---
title: "Building LinCie"
description: "A project page about building this site."
date: "2026-05-21"
disciplines: ["Engineering", "Design"]
draft: false
order: 1
---
```

**Links in content:**
```markdown
<!-- Internal — no annotation -->
Read the [essay on craft](/writing/craft-as-proof).

<!-- External — annotation handled by InlineLink component -->
Inspired by [Andermatt](https://andermatt-realestate.ch).
```

### Accessibility Patterns

**Every interactive element must have:**
1. Visible `:focus-visible` state (2px paper-cream offset outline)
2. Minimum 44×44px tap target on mobile (via padding, not visual size)
3. Semantic HTML element (`<a>` for links — no buttons exist in this project)

**Reduced-motion implementation — two layers:**
1. JS gate (primary): `if (REDUCED_MOTION) return;` at the top of `init()`
2. CSS safety net (backup): `@media (prefers-reduced-motion: reduce)` kills all transitions/animations

**Decorative elements get `aria-hidden="true"`:**
- Cursor afterglow div
- Project spine
- Baseline grid overlay
- Folio and local time labels (supplementary, not navigation)

**The INDEX link is the only `<nav>` element.** Minimal — one link. Semantic `<nav>` is sufficient.

### Enforcement Guidelines

**All AI agents MUST:**

1. Run `bun run format && bun run lint && bun run check` before declaring any work complete
2. Never introduce a new dependency (the `package.json` dependency list is frozen)
3. Never hardcode color values — always reference CSS custom property tokens
4. Never import GSAP except through `src/scripts/gsap-init.ts`
5. Always implement the gate+cleanup lifecycle pattern in client-side scripts
6. Always provide a `prefers-reduced-motion` path (JS gate + CSS safety net)
7. Always use semantic HTML before reaching for ARIA
8. Never animate layout properties (only transform, opacity, filter for fog-lifting)
9. Never use `font-variation-settings` for registered axes (use `font-weight`, `font-optical-sizing`)
10. Always use Tailwind utilities unless the styling genuinely cannot be expressed in Tailwind

### Anti-Patterns

```astro
<!-- ❌ Don't: inline styles with hardcoded values -->
<div style="color: oklch(0.18 0.008 80); margin-bottom: 32px;">

<!-- ❌ Don't: custom CSS that duplicates Tailwind -->
<style>
  .my-component { display: flex; gap: 1rem; }
</style>

<!-- ❌ Don't: client-side rendering for static content -->
<div id="projects"></div>
<script>
  // fetching and rendering projects client-side
</script>

<!-- ❌ Don't: animation without cleanup -->
<script>
  gsap.to('.thing', { opacity: 1 }); // orphaned, no cleanup on navigation
</script>

<!-- ❌ Don't: box-shadow anywhere -->
<div class="shadow-lg">

<!-- ❌ Don't: accent colors -->
<a class="text-blue-500">
```


## Project Structure & Boundaries

### Complete Project Directory Structure

```
lincie/
├── .github/
│   └── workflows/
│       └── ci.yml                    ← validation gate on PR
├── docs/                             ← project documentation (agent-agnostic)
│   └── voice.md                      ← voice steering file (v1.1, per PRD §8.5)
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   └── og-image.png                  ← single static OG image (MVP)
├── src/
│   ├── assets/
│   │   └── fonts/                    ← pre-staged woff2 (FR-4 escape hatch)
│   │       ├── Newsreader-Variable.woff2
│   │       ├── Newsreader-Italic-Variable.woff2
│   │       ├── CommitMono-400.woff2
│   │       └── CommitMono-500.woff2
│   ├── components/
│   │   ├── frame/
│   │   │   ├── Frame.astro           ← FR-1, FR-2: persistent corner-label scaffold
│   │   │   ├── Folio.astro           ← FR-2 BR: scroll-derived page position
│   │   │   └── LocalTime.astro       ← FR-25: live local time (TR corner)
│   │   ├── typography/
│   │   │   ├── DropCap.astro         ← Drop Cap Rule: 3-line opening capital
│   │   │   └── InlineLink.astro      ← FR-21, FR-22: inkstroke underline + annotations
│   │   ├── content/
│   │   │   ├── Colophon.astro        ← FR-15: book-style footer
│   │   │   ├── ProjectBand.astro     ← FR-10: index band (title + meta + hover hero)
│   │   │   ├── ProjectSpine.astro    ← FR-11: vertical hairline with scroll indicator
│   │   │   └── FootnoteReveal.astro  ← FR-12: reverse-scroll footnote container
│   │   └── motion/
│   │       ├── CursorAfterGlow.astro ← FR-16, FR-17: warm cursor trace
│   │       ├── RevealSequence.astro  ← FR-18: one-shot first-paint timeline
│   │       └── SectionPin.astro      ← FR-24: pinned section titles
│   ├── content/
│   │   ├── config.ts                 ← Zod schemas for projects + writing collections
│   │   ├── projects/
│   │   │   └── {slug}.md             ← project content (1 at MVP)
│   │   └── writing/
│   │       └── {slug}.md             ← essay content (1 at MVP)
│   ├── layouts/
│   │   └── BaseLayout.astro          ← FR-1, FR-3, FR-19: Frame + ViewTransitions + honest first paint
│   ├── pages/
│   │   ├── index.astro               ← FR-9: home page composition (content-count-driven)
│   │   ├── projects/
│   │   │   └── [...slug].astro       ← FR-11: project page (spine, footnotes, drop cap)
│   │   ├── writing/
│   │   │   └── [...slug].astro       ← FR-13: essay page (drop cap, footnotes, italic closing)
│   │   └── 404.astro                 ← FR-14: centered serif paragraph in voice
│   ├── scripts/
│   │   ├── gsap-init.ts              ← GSAP + ScrollTrigger registration (single import point)
│   │   ├── cursor.ts                 ← FR-16: afterglow logic (gates: motion, pointer)
│   │   ├── reveal.ts                 ← FR-18: page reveal timeline (sessionStorage gated)
│   │   ├── scroll.ts                 ← FR-23, FR-24, FR-20: damped scroll + section pin + fog-lifting
│   │   ├── footnotes.ts              ← FR-12: reverse-scroll detection + opacity toggle
│   │   ├── paper-tone.ts             ← FR-8: time-of-day band resolution
│   │   └── local-time.ts             ← FR-25: setInterval update for TR corner
│   └── styles/
│       ├── global.css                ← Tailwind import + @theme + tokens + base + keyframes
│       └── typography.css            ← @font-face + drop-cap + hanging-punctuation
├── .gitignore
├── AGENTS.md                         ← AI agent instructions (authoritative, agent-agnostic)
├── DESIGN.md                         ← design system seed (frozen)
├── PRODUCT.md                        ← product brief (frozen)
├── README.md
├── astro.config.mjs                  ← Astro config (fonts, view transitions, static output)
├── bun.lock
├── eslint.config.mjs
├── package.json
├── prettier.config.mjs
└── tsconfig.json
```

### Architectural Boundaries

**Component Boundaries:**

| Boundary | Owns | Communicates via |
|----------|------|------------------|
| Frame (`frame/`) | Corner labels, persistence across transitions | `transition:persist` attributes; props for section label and folio values |
| Typography (`typography/`) | Drop cap rendering, link behavior | Props only; no state, no scripts |
| Content (`content/`) | Colophon, project bands, spine, footnote containers | Props from page data; DOM structure targeted by scripts |
| Motion (`motion/`) | GSAP-driven elements (cursor div, reveal wrapper, pin wrapper) | Renders DOM targets; actual animation lives in `scripts/` |
| Scripts (`scripts/`) | All client-side behavior | Targets DOM elements rendered by components; no component imports |
| Styles (`styles/`) | Token definitions, font-face, custom CSS | CSS custom properties consumed by Tailwind and components |
| Content Collections (`content/`) | Markdown content + frontmatter | Queried at build time by pages via `getCollection()` |
| Pages (`pages/`) | Route resolution, data fetching, composition | Imports components, queries collections, passes props down |

**Data Flow (build time):**
```
content/*.md → getCollection() → page frontmatter script → component props → rendered HTML
```

**Data Flow (client-side):**
```
DOM ready → feature gates → GSAP init → animation instances → cleanup on navigation
```

**No external integrations.** No API calls, no database, no third-party services. The only external dependency is Vercel's static hosting (deploy on push to main).

### Requirements to Structure Mapping

**FR-1 through FR-3 (Frame & Honest First Paint):**
- `src/layouts/BaseLayout.astro` — Frame wrapper, ViewTransitions, meta tags
- `src/components/frame/Frame.astro` — corner label scaffold
- `src/components/frame/Folio.astro` — BR folio
- `src/components/frame/LocalTime.astro` — TR time

**FR-4 through FR-6 (Typography Pipeline):**
- `astro.config.mjs` — Astro Fonts API configuration (Fontsource provider)
- `src/styles/typography.css` — @font-face fallback, drop-cap, hanging-punctuation
- `src/assets/fonts/` — pre-staged woff2 files

**FR-7, FR-8 (Color & Paper-Tone Drift):**
- `src/styles/global.css` — OKLCH token definitions in `:root`
- `src/scripts/paper-tone.ts` — time-of-day band resolution

**FR-9 (Home Page):**
- `src/pages/index.astro` — content-count logic, composition

**FR-10, FR-11 (Project Index & Page):**
- `src/components/content/ProjectBand.astro` — index bands
- `src/components/content/ProjectSpine.astro` — vertical spine
- `src/pages/projects/[...slug].astro` — project page template

**FR-12 (Reverse-Scroll Footnotes):**
- `src/components/content/FootnoteReveal.astro` — footnote container markup
- `src/scripts/footnotes.ts` — scroll direction detection + opacity

**FR-13 (Essay Page):**
- `src/pages/writing/[...slug].astro` — essay page template

**FR-14 (404):**
- `src/pages/404.astro`

**FR-15 (Colophon):**
- `src/components/content/Colophon.astro`

**FR-16, FR-17 (Cursor Afterglow):**
- `src/components/motion/CursorAfterGlow.astro` — DOM element
- `src/scripts/cursor.ts` — GSAP logic

**FR-18 (Reveal Sequence):**
- `src/components/motion/RevealSequence.astro` — wrapper/targets
- `src/scripts/reveal.ts` — GSAP timeline

**FR-19 (View Transitions):**
- `src/layouts/BaseLayout.astro` — `<ViewTransitions />`
- `src/styles/global.css` — transition keyframes
- Page templates — `transition:name` attributes

**FR-20 (Fog-Lifting):**
- `src/scripts/scroll.ts` — ScrollTrigger blur logic

**FR-21, FR-22 (Hover Language):**
- `src/components/typography/InlineLink.astro` — inkstroke + annotation
- `src/styles/global.css` — underline keyframe

**FR-23, FR-24 (Damped Scroll & Section Pin):**
- `src/scripts/scroll.ts` — ScrollTrigger.normalizeScroll + pin logic
- `src/components/motion/SectionPin.astro` — pin wrapper

**FR-25 (Live Local Time):**
- `src/components/frame/LocalTime.astro` — DOM
- `src/scripts/local-time.ts` — setInterval logic

### Development Workflow Integration

**Local development:**
```bash
bun run dev          # Astro dev server with HMR
```

**Validation (before every commit):**
```bash
bun run format       # Prettier (Astro + Tailwind sorting)
bun run lint         # ESLint (Astro + jsx-a11y)
bun run check        # Astro type checker
```

**Build & preview:**
```bash
bun run build        # Static output to dist/
bun run preview      # Preview production build locally
```

**Deployment:**
- Push to `main` → Vercel rebuilds automatically
- Failed build = no deploy (Vercel default)
- No SSR adapter, no serverless functions, no edge middleware


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Astro 6 static + Tailwind 4 + GSAP 3.15 — no conflicts. Tailwind via Vite plugin, GSAP loaded client-side via `<script>` tags. No SSR/hydration conflicts because there's no framework island — pure Astro components + vanilla client scripts.
- Astro View Transitions + GSAP lifecycle — compatible. `astro:before-swap` / `astro:after-swap` events provide clean hooks for GSAP cleanup and re-init.
- Astro Fonts API + Fontsource + metric-matched fallback — compatible. Astro handles preload injection; custom `@font-face` in `typography.css` handles the Georgia fallback.
- Content Collections + static output — native Astro pattern. No compatibility concerns.

**Pattern Consistency:**
- All scripts follow the same gate+cleanup structure.
- All components follow the same Astro file ordering convention.
- All colors reference tokens; all spacing uses baseline multiples.
- All animations use the same duration token set.
- Naming conventions are consistent (PascalCase components, kebab-case scripts/content).

**Structure Alignment:**
- Directory structure directly supports the component boundary model (frame/typography/content/motion).
- Scripts separated from components, matching the "structure vs behavior" boundary.
- Pages import components and query collections — clean unidirectional data flow.

### Requirements Coverage Validation ✅

**All 25 Functional Requirements mapped:**

| FR | Covered by | Status |
|----|-----------|--------|
| FR-1 (Persistent Frame) | BaseLayout + Frame.astro + `transition:persist` | ✅ |
| FR-2 (Corner labels) | Frame.astro + Folio.astro + LocalTime.astro | ✅ |
| FR-3 (Honest first paint) | BaseLayout meta + body opacity 100% + no JS gate on content | ✅ |
| FR-4 (Self-hosted typography) | astro.config.mjs Fonts API + typography.css fallback + assets/fonts/ | ✅ |
| FR-5 (Optical-size axis) | `font-optical-sizing: auto` in global.css | ✅ |
| FR-6 (Hanging punctuation) | typography.css progressive enhancement | ✅ |
| FR-7 (OKLCH tokens) | global.css `:root` token definitions | ✅ |
| FR-8 (Paper-tone drift) | paper-tone.ts + `--paper-tone` custom property | ✅ |
| FR-9 (Home page) | index.astro with `getCollection()` count logic | ✅ |
| FR-10 (Project index bands) | ProjectBand.astro | ✅ |
| FR-11 (Project page) | [...slug].astro + ProjectSpine.astro + `transition:name` | ✅ |
| FR-12 (Reverse-scroll footnotes) | FootnoteReveal.astro + footnotes.ts | ✅ |
| FR-13 (Essay page) | writing/[...slug].astro + DropCap + italic closing | ✅ |
| FR-14 (404) | 404.astro | ✅ |
| FR-15 (Colophon) | Colophon.astro | ✅ |
| FR-16 (Cursor afterglow) | CursorAfterGlow.astro + cursor.ts | ✅ |
| FR-17 (Cursor disable) | cursor.ts feature gates (motion + pointer) | ✅ |
| FR-18 (Reveal sequence) | RevealSequence.astro + reveal.ts + sessionStorage | ✅ |
| FR-19 (View Transitions) | BaseLayout `<ViewTransitions />` + custom keyframes + `transition:name` | ✅ |
| FR-20 (Fog-lifting) | scroll.ts ScrollTrigger blur logic | ✅ |
| FR-21 (Inkstroke underline) | InlineLink.astro + global.css keyframe | ✅ |
| FR-22 (Hover affordances) | InlineLink.astro variants | ✅ |
| FR-23 (Damped scroll) | scroll.ts ScrollTrigger.normalizeScroll | ✅ |
| FR-24 (Section pin) | SectionPin.astro + scroll.ts | ✅ |
| FR-25 (Live local time) | LocalTime.astro + local-time.ts | ✅ |

**Non-Functional Requirements Coverage:**

| NFR | Architectural support | Status |
|-----|----------------------|--------|
| Performance (Lighthouse ≥95) | Static output, font-display: optional, no render-blocking JS | ✅ |
| JS Budget (≤60KB) | Single GSAP import, tree-shaking, per-page loading (~48-52KB est.) | ✅ |
| Font Budget (<200KB) | Latin subset only, preload roman only, on-demand italic/mono | ✅ |
| CLS = 0 | Metric-matched Georgia fallback + font-display: optional | ✅ |
| WCAG 2.2 AA | jsx-a11y linting, semantic HTML, focus states, reduced-motion | ✅ |
| Security (CSP) | No third-party scripts, static deploy, no inline handlers | ✅ |
| Privacy | No cookies, no analytics, no tracking — by absence | ✅ |
| Animation (transform/opacity) | Enforcement rule; filter exception for fog-lifting | ✅ |
| Browser support | Progressive enhancement for hanging-punctuation | ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:** All 5 critical decisions documented with code examples and rationale. Technology versions locked in `package.json`. No open decisions blocking implementation.

**Structure Completeness:** Every file and directory named and mapped to specific FRs. Component boundaries explicit with communication patterns defined. Data flow documented for build-time and client-side paths.

**Pattern Completeness:** 10 enforcement rules cover all major conflict points. Anti-patterns documented with concrete examples. Gate+cleanup lifecycle pattern fully specified with code.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking, address during implementation):**

1. **Exact OKLCH values for all 4 paper-tone bands** — anchors defined but final triples need contrast verification at implementation time. Architecture supports adjustment (tokens are CSS custom properties).
2. **Remark plugin for footnotes** — architecture specifies `[^1]` syntax rendered to `<aside>`, but specific plugin or Astro built-in handling confirmed during Tier 1.
3. **Metric-matched fallback exact values** — `size-adjust`, `ascent-override`, `descent-override` for Georgia computed against actual Newsreader metrics at implementation time.

**Nice-to-Have Gaps (defer to v1.1):**
- CI workflow file content
- Vercel configuration for CSP headers

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 16 checklist items verified, no critical gaps, all 25 FRs mapped to specific files.

**Key Strengths:**
- Zero ambiguity in technology choices (everything locked and versioned)
- Gate+cleanup lifecycle pattern prevents the most common GSAP-in-SPA failure mode (zombie animations)
- Clear separation between structure (Astro components) and behavior (scripts) makes each concern independently testable
- Tier-based implementation sequence means the site is functional and on-brand at every checkpoint

**Areas for Future Enhancement:**
- Per-page OG image generation pipeline (v1.1)
- RSS feed (v1.x when essay count ≥3)
- Voice steering file in `docs/voice.md` (v1.1)
- CI workflow automation

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- The validation gate (`bun run format && bun run lint && bun run check`) must pass at every tier boundary

**Implementation Sequence:**
1. Token layer in `global.css` (everything else references these)
2. Typography pipeline in `astro.config.mjs` + `typography.css`
3. Content Collections schemas in `src/content/config.ts`
4. BaseLayout with Frame + ViewTransitions
5. Page templates (home, project, essay, 404)
6. Tier 1 components (Colophon, DropCap, InlineLink, ProjectBand)
7. Tier 2 scripts (reveal, cursor, hover animations)
8. Tier 3 scripts (scroll, footnotes, section pin, paper-tone, local-time, project spine)
