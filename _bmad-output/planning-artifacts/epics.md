---
stepsCompleted: [1, 2, 3, 4]
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-lincie-2026-05-20/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# lincie - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for lincie, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Persistent Frame across pages — The visitor sees the same corner labels, baseline grid, and grid columns on every page. The Frame is rendered in a base layout that wraps every route. Four corner labels (TL INDEX, TR live local time, BL section label, BR folio) present on every page; below 768px the section label and time fold into the colophon (TL and BR remain). Frame elements use `transition:persist` during View Transitions.

FR-2: Corner labels render with correct content per page — TL: INDEX (link to /). TR: live local time (HH:MM LOCAL), updates once per minute. BL: section label per route (home blank, project WORK, essay WRITING, 404 404 — NOT FOUND). BR: folio formatted as zero-padded NNN / TTT, scroll-percentage-derived.

FR-3: Honest first paint — The first viewport is fully styled, on-brand, and contains enough copy for a fast scanner to know what LinCie does. Body text opacity at 100% at first paint. Disabling JavaScript still produces a readable, on-brand home page. LCP ≤ 2.5s on Lighthouse mobile profile.

FR-4: Self-hosted typography via Astro Fonts API — Newsreader (variable serif) and Commit Mono (static, 400/500) self-hosted via Fontsource. Newsreader normal latin preloaded with font-display: optional. Metric-matched Georgia fallback for zero CLS. Pre-staged woff2 in src/assets/fonts/ for 5-minute swap escape hatch.

FR-5: Optical-size axis carries the hierarchy — Headlines, body text, and labels resolve optical via font-optical-sizing: auto. No font-variation-settings opsz overrides anywhere.

FR-6: Hanging punctuation as progressive enhancement — hanging-punctuation: first applied globally to body and headline blocks. Safari-only; degrades cleanly in Chrome/Firefox.

FR-7: OKLCH-based color tokens — All colors defined in OKLCH via CSS custom properties. Pure greys forbidden; every neutral carries warm chroma (C ≥ 0.005). Tokens: --paper, --ink, --meta, --hairline, --paper-tone.

FR-8: Time-of-day paper-tone drift — JS reads visitor's local time and sets --paper-tone to one of four bands (pre-dawn, midday, dusk, night). All bands clear WCAG 2.2 AA contrast. Under prefers-reduced-motion, band cuts hard (no interpolation).

FR-9: Home page composition — Honest first-paint paragraph, short list of named projects, direct link to essay(s), footer colophon. No drop cap. Content-count-driven behavior at thresholds (1, 2, ≥3 projects/essays). Without JS, fully readable with all links functional.

FR-10: Project index bands — Projects listed as generous bands (30–40vh each) with serif title at display size, monospace meta, and hover-revealed hero at 30–40% opacity. Semantic markup (article per project, h2 title). Inkstroke underline on title hover.

FR-11: Project page structure — Project title FLIP-echoed from index via transition:name, project spine on left edge, long-form prose body with section headings and inline footnotes, colophon. Opens with drop cap.

FR-12: Reverse-scroll footnote reveal — Footnotes hidden by default on desktop. Forward scroll keeps hidden; reverse scroll fades them in (~250ms). One-time monospace hint on first reverse-scroll per session. Under prefers-reduced-motion or pointer: coarse, footnotes always visible.

FR-13: Essay page structure — Renders from content file under writing route. Title, optional subtitle, drop cap, prose body with inline footnotes, italic closing line ("This was made by LinCie. Reach out if it speaks to you." with mailto), colophon. At least one footnote in first paragraph.

FR-14: 404 page composition — Single centered serif paragraph in voice with inline links to home, project, and essay. BL corner reads 404 — NOT FOUND. No big "404", no humor.

FR-15: Colophon composition — Typography credits, year, mailto to contact@lincie.me, social links (→ github ↗ twitter ↗ are.na). Rendered in footer semantics. External links carry rel="noopener" and ↗ prefix.

FR-16: Cursor afterglow rendering — Faint warm-grey trace follows cursor with inertia (~2 frame lag, ~1px drift past stop), decays in ~600ms. Single fixed-position element, GSAP-driven. Fades over body text, returns in margin/whitespace. Animation cleanup on navigation.

FR-17: Cursor system disable conditions — Disabled on pointer: coarse and prefers-reduced-motion: reduce. No afterglow renders, no cursor-tracking listeners attached.

FR-18: First-paint reveal sequence — One-shot GSAP timeline: corner labels opacity 0→1 (~300ms) → baseline grid ~3% opacity for ~800ms → title font-weight 300→400 (~400ms). Total ≤1.5s. Body opacity stays 100% throughout. Fires once per session per page. Under prefers-reduced-motion, instant final state.

FR-19: Page transitions via Astro View Transitions — Cross-fade ~600ms with 8px settle-down on exit and 8px drift-up on enter. Frame elements transition:persist. Project titles carry transition:name per slug. No slide-in-from-below.

FR-20: Section-level fog-lifting reveal — Sections enter viewport with 7px filter blur, transition to 0 over ~400ms. Scroll-driven via ScrollTrigger. Only one section blurred at a time. Under prefers-reduced-motion, sections render sharp.

FR-21: Inkstroke underline on inline links — No underline at rest. On hover/focus-visible, underline draws left-to-right over ~250ms using scaleX + transform-origin: left. On un-hover, fades.

FR-22: Hover affordances per element type — External links: ↗ domain.com annotation on hover. Names (span.name or cite): weight 400→500 on hover (~250ms). Project titles: inkstroke underline + hero opacity reveal. Focus-visible outlines meet 2px paper-cream offset spec.

FR-23: Damped smooth scroll on desktop — GSAP ScrollTrigger.normalizeScroll() with lerp ~0.08–0.1. Disabled on pointer: coarse and prefers-reduced-motion. No lenis dependency.

FR-24: Section pin — Section titles pin for ~30vh of additional scroll then release. ScrollTrigger pin: true, pinSpacing: false. Under prefers-reduced-motion, disabled. Only one title pinned at a time.

FR-25: Live local time rendering — TR corner label renders HH:MM LOCAL, updates every minute via setInterval. Interval cleared on navigation, paused on document.visibilityState === 'hidden'. Under prefers-reduced-motion, still updates.

### NonFunctional Requirements

NFR-1: Performance — Lighthouse Performance ≥95 on every page. CLS = 0. LCP ≤ 2.5s. INP ≤ 200ms. No render-blocking JS.

NFR-2: JS Budget — Client-side JS ≤60KB gzip total (GSAP + site scripts). Tree-shake GSAP, code-split per page.

NFR-3: Font Budget — Total font weight <200KB (latin subsets). Preload roman only; italic + mono on demand.

NFR-4: Accessibility — WCAG 2.2 AA on every page across all four paper-tone bands. Keyboard navigation with visible focus states. Semantic HTML first; ARIA only where insufficient. All animations respect prefers-reduced-motion. Skip-to-content link.

NFR-5: Security — No third-party scripts, no cookies, no inline event handlers, no eval. CSP headers via Vercel allow only same-origin.

NFR-6: Privacy — No analytics, no tracking, no fingerprinting, no cookies set by the site.

NFR-7: Browser Support — Latest 2 versions Chrome/Firefox/Safari/Edge, iOS Safari 16+. Progressive enhancement for hanging-punctuation.

NFR-8: Reliability — Static deploy; no SSR runtime. Build success gates deploy. Failed build = no deploy.

NFR-9: Animation Performance — All animations use transform and opacity only (filter allowed for fog-lifting). Animation tokens defined once. One-section-at-a-time blur constraint.

NFR-10: Engineering Discipline — OKLCH only for site-token colors. Registered CSS properties for registered axes. transition:name values unique per route. GSAP ticker and setInterval paused on visibilityState hidden, cleaned on navigation.

NFR-11: Validation Gate — Every feature change gated on bun run format && bun run lint && bun run check.

NFR-12: SEO — Per-page title and meta description. OpenGraph and Twitter card meta. Single static OG image at MVP. robots.txt allows everything.

### Additional Requirements

- Architecture specifies existing Astro 6 scaffold (no starter template needed) — project already initialized with all dependencies
- Single GSAP entry point (gsap-init.ts) — all scripts import from this file, never directly from 'gsap'
- Gate + cleanup lifecycle pattern required for every client-side script (gate → register → clean → re-init → pause → session memory)
- CSS token layer in global.css as single source of truth for all design tokens
- Tailwind 4 @theme directive extending tokens into utilities (bg-paper, text-ink, font-serif, font-mono)
- Two CSS files only: global.css (Tailwind + tokens + base + keyframes) and typography.css (font-face + drop-cap + hanging-punctuation)
- Content Collections with typed Zod schemas for projects and writing collections
- Per-page script loading: reveal + paper-tone + cursor in BaseLayout; scroll + footnotes only on long-form pages
- SessionStorage for reveal sequence (fires once per session, not per navigation)
- View Transitions with transition:persist on Frame elements and custom 8px settle/drift keyframes
- Implementation sequence: tokens → fonts → content collections → BaseLayout → pages → Tier 1 components → Tier 2 scripts → Tier 3 scripts
- Vercel static deployment (push to main triggers rebuild)
- CI validation: bun run format && bun run lint && bun run check on every PR

### UX Design Requirements

UX-DR1: First-viewport contact link on mobile — One inline contact link (mailto) visible in the first viewport on mobile without scrolling. Must have minimum 44×44px tap target while remaining typographically quiet. Not a button — an inline link in the opening paragraph or set at slightly different weight.

UX-DR2: Mobile layout adaptation — Below 768px: single column, two corner labels (TL INDEX + BR folio), TR and BL fold into colophon, compressed spacing (3× baseline between sections), footnotes in below-content list (always visible), no cursor afterglow, no damped scroll, no section pin, no project spine, no fog-lifting.

UX-DR3: Skip-to-content link — Hidden until focused, allows keyboard users to bypass the Frame and jump directly to main content.

UX-DR4: Bidirectional footnote navigation — Footnote references ([1]) are links to footnote text; footnote text links back to the reference. Keyboard-accessible bidirectional jump.

UX-DR5: INDEX as universal escape hatch — The TL INDEX corner label must be visible, tappable, and obviously a link home on every page. On mobile it is the primary recovery mechanism for visitors who land on a project/essay from a shared link.

UX-DR6: One-time reverse-scroll hint — On first reverse-scroll of the session on each project/essay page, a monospace hint ("footnotes reveal as you re-read") fades in near the spine, holds ~2 seconds, fades out. Never repeats per session.

UX-DR7: Cursor afterglow reading-zone awareness — Afterglow fades to opacity 0 within ~200ms when cursor enters body text; returns when cursor enters margin/whitespace. The transition is imperceptible — the visitor feels "the site is quiet when I'm reading."

UX-DR8: Folio scroll-driven update — BR folio updates fractionally as visitor scrolls (debounced to ~60fps). Never animates digits — snaps to new value. On single-viewport routes, shows 001 / 001.

UX-DR9: Paper-tone band time ranges — Pre-dawn (04:00–07:00): cool grey-cream. Midday (07:00–16:00): warm white-cream. Dusk (16:00–20:00): warm cream-amber. Night (20:00–04:00): cool warm-grey.

UX-DR10: Content-count home page scaling — Project count 1: link directly. Count 2: two named links inline. Count ≥3: list + link to promoted index page. Same pattern for essays. Home page never shows empty containers or "coming soon."

UX-DR11: Italic closing line on essays — Every essay ends with "This was made by LinCie. Reach out if it speaks to you." in italic with a mailto link to contact@lincie.me.

UX-DR12: 44×44px minimum tap targets — All interactive elements on mobile must have minimum 44×44px tap target achieved via padding, not visual size increase.

UX-DR13: Decorative elements aria-hidden — Cursor afterglow div, project spine, baseline grid overlay, folio and local time labels all receive aria-hidden="true".

UX-DR14: Focus-visible states — All interactive elements have visible :focus-visible state: 2px paper-cream offset outline + inkstroke underline for links. Matches hover affordance for keyboard parity.

UX-DR15: No loading states — Static HTML renders immediately. Fonts use font-display: optional with metric-matched fallback. GSAP loads asynchronously and decorates already-visible content. No spinner, skeleton, or blank page ever shown.

### FR Coverage Map

FR-1: Epic 1 (Story 1.4) — Persistent Frame across pages
FR-2: Epic 1 (Story 1.4, static) + Epic 5 (Story 5.2, live time) + Epic 5 (Story 5.3, scroll folio) — Corner labels
FR-3: Epic 1 (Story 1.5) — Honest first paint
FR-4: Epic 1 (Story 1.2) — Self-hosted typography
FR-5: Epic 1 (Story 1.2) — Optical-size axis
FR-6: Epic 1 (Story 1.2) — Hanging punctuation
FR-7: Epic 1 (Story 1.1) — OKLCH color tokens
FR-8: Epic 5 (Story 5.1) — Paper-tone drift
FR-9: Epic 1 (Story 1.5) — Home page composition
FR-10: Epic 2 (Story 2.5, structure) + Epic 5 (Story 5.4, hover hero) — Project index bands
FR-11: Epic 2 (Story 2.1, structure) + Epic 5 (Story 5.3, spine scroll) — Project page
FR-12: Epic 2 (Story 2.3, mobile visible) + Epic 4 (Story 4.4, desktop reveal) — Footnote reveal
FR-13: Epic 2 (Story 2.2) — Essay page
FR-14: Epic 1 (Story 1.6) — 404 page
FR-15: Epic 1 (Story 1.6) — Colophon
FR-16: Epic 3 (Story 3.3) — Cursor afterglow
FR-17: Epic 3 (Story 3.3) — Cursor disable conditions
FR-18: Epic 3 (Story 3.2) — Reveal sequence
FR-19: Epic 3 (Story 3.4) — View Transitions
FR-20: Epic 4 (Story 4.3) — Fog-lifting
FR-21: Epic 2 (Story 2.4, base) + Epic 3 (Story 3.5, animation) — Inkstroke underline
FR-22: Epic 2 (Story 2.4, base) + Epic 3 (Story 3.5, animation) — Hover affordances
FR-23: Epic 4 (Story 4.1) — Damped scroll
FR-24: Epic 4 (Story 4.2) — Section pin
FR-25: Epic 5 (Story 5.2) — Live local time

## Epic List

### Epic 1: Foundation — A Readable, On-Brand Static Site
The visitor lands on a fully styled, typographically considered site with the Frame scaffold, correct fonts, OKLCH color tokens, baseline grid, and all four page templates (home, project, essay, 404). The site is complete, readable, and on-brand with zero JavaScript. LinCie can publish content by dropping Markdown files.
**FRs covered:** FR-1, FR-2 (static), FR-3, FR-4, FR-5, FR-6, FR-7, FR-9, FR-14, FR-15

### Epic 2: Content & Long-Form Reading — Project and Essay Pages
The visitor reads a project page or essay with drop caps, inline footnotes, the project spine structure, and proper content rendering. Content Collections are typed and validated. The content pipeline is frictionless for LinCie.
**FRs covered:** FR-10 (structure), FR-11 (structure), FR-12 (mobile visible), FR-13, FR-21 (base), FR-22 (base)

### Epic 3: Signature Motion — Reveal, Cursor, Transitions & Hover Language
The site comes alive with the five signature moments: the page reveal sequence, cursor afterglow, Astro View Transitions with Frame persistence and title FLIP-echo, inkstroke underline animation, and hover affordances. All motion respects prefers-reduced-motion and pointer: coarse gates.
**FRs covered:** FR-16, FR-17, FR-18, FR-19, FR-21 (animation), FR-22 (animation)

### Epic 4: Scroll System & Long-Form Polish — Damped Scroll, Section Pin, Fog-Lifting, Footnote Reveal
The collaborator's deep-reading experience is complete: damped smooth scroll, section titles that pin for context, fog-lifting section reveals, and the signature reverse-scroll footnote reveal with one-time hint.
**FRs covered:** FR-12 (desktop reverse-scroll), FR-20, FR-23, FR-24

### Epic 5: Ambient Life — Paper-Tone Drift, Live Local Time & Final Polish
The site feels alive across visits: paper-tone drifts with time of day, the local time corner label updates live, the folio tracks scroll position, and the project spine dot moves with scroll. All ambient behaviors respect accessibility and lifecycle rules.
**FRs covered:** FR-2 (live TR + scroll-driven BR), FR-8, FR-10 (hover hero), FR-11 (spine scroll), FR-25


## Epic 1: Foundation — A Readable, On-Brand Static Site

The visitor lands on a fully styled, typographically considered site with the Frame scaffold, correct fonts, OKLCH color tokens, baseline grid, and all four page templates (home, project, essay, 404). The site is complete, readable, and on-brand with zero JavaScript. LinCie can publish content by dropping Markdown files.

### Story 1.1: CSS Token Layer & Tailwind Theme Integration

As a visitor,
I want the site to render with a consistent, warm-tinted color palette and strict baseline grid,
So that every page feels cohesive and on-brand from the first pixel.

**Acceptance Criteria:**

**Given** the global.css file exists with Tailwind import
**When** the token layer is implemented
**Then** `:root` defines `--paper`, `--ink`, `--meta`, `--hairline`, `--paper-tone`, `--baseline` (28px), `--type-scale-ratio` (1.25), `--ease-settle`, `--ease-mark`, `--dur-quick` (150ms), `--dur-breath` (400ms), `--dur-arrive` (600ms) as CSS custom properties
**And** all color tokens use OKLCH with chroma ≥ 0.005 toward the warm-yellow paper hue
**And** the `@theme` directive extends tokens into Tailwind utilities (`bg-paper`, `text-ink`, `text-meta`, `border-hairline`, `font-serif`, `font-mono`)
**And** a `@media (prefers-reduced-motion: reduce)` safety net sets `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important` on all elements
**And** no `#hex` or `rgb()` values appear in the token file — OKLCH only
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.2: Typography Pipeline — Fonts, Fallback & Optical Sizing

As a visitor,
I want the site to render in Newsreader (serif) and Commit Mono with zero layout shift,
So that I experience considered typography whether fonts load instantly or not.

**Acceptance Criteria:**

**Given** the Astro Fonts API is configured in astro.config.mjs
**When** the typography pipeline is implemented
**Then** Newsreader variable (normal + italic, latin subset) and Commit Mono (400 + 500, latin subset) are downloaded at build time from Fontsource
**And** Newsreader normal latin is preloaded with `<link rel="preload" as="font">`; italic and Commit Mono are not preloaded
**And** Newsreader normal uses `font-display: optional`
**And** a metric-matched `@font-face` fallback targets Georgia with `size-adjust`, `ascent-override`, `descent-override` in typography.css
**And** `font-optical-sizing: auto` is applied globally — no `font-variation-settings: "opsz"` overrides anywhere in the codebase
**And** `hanging-punctuation: first` is applied to body and headline blocks in typography.css
**And** woff2 files are pre-staged in `src/assets/fonts/` (Newsreader-Variable.woff2, Newsreader-Italic-Variable.woff2, CommitMono-400.woff2, CommitMono-500.woff2)
**And** no `IBM Plex Mono` or `Geist Mono` woff2 files are present anywhere in `dist/`
**And** total font weight is <200KB (latin subsets)
**And** CLS measured in DevTools is 0 on first paint regardless of network throttling
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.3: Content Collections — Projects & Writing Schemas

As LinCie,
I want typed content collections for projects and writing with validated frontmatter,
So that I can publish new content by dropping a Markdown file with confidence that invalid data fails the build.

**Acceptance Criteria:**

**Given** the `src/content/` directory structure exists
**When** Content Collections are configured
**Then** `src/content/config.ts` defines a `projects` collection with Zod schema: `title` (string), `description` (string), `date` (string, YYYY-MM-DD), `disciplines` (string[]), `draft` (boolean), `order` (number)
**And** `src/content/config.ts` defines a `writing` collection with Zod schema: `title` (string), `subtitle` (optional string), `description` (string), `date` (string, YYYY-MM-DD), `draft` (boolean), `order` (number)
**And** at least one sample project file exists in `src/content/projects/` with valid frontmatter
**And** at least one sample essay file exists in `src/content/writing/` with valid frontmatter and at least one footnote reference (`[^1]`) in the first paragraph
**And** a content file with invalid frontmatter causes `bun run build` to fail
**And** draft content (`draft: true`) is excluded from production builds
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.4: BaseLayout with Frame & Accessibility Scaffold

As a visitor,
I want every page to render inside a persistent Frame with corner labels and proper accessibility structure,
So that I always know where I am and can navigate the site with keyboard or screen reader.

**Acceptance Criteria:**

**Given** BaseLayout.astro wraps every route
**When** the Frame and accessibility scaffold are implemented
**Then** the Frame renders four corner labels at fixed viewport positions: TL `INDEX` (link to `/`), TR placeholder for local time (static text at this stage), BL section label per route (home blank, project WORK, essay WRITING, 404 `404 — NOT FOUND`), BR folio (static `001 / 001` at this stage)
**And** corner labels render in Commit Mono at ~0.75rem in `--meta` color
**And** TL `INDEX` is an `<a>` inside a minimal `<nav>` element
**And** non-interactive corner labels have `aria-hidden="true"`
**And** a skip-to-content link is present (hidden until focused via `:focus-visible`, jumps to `<main>`)
**And** below 768px, only TL and BR are visible; TR and BL content folds into the colophon
**And** all interactive elements have visible `:focus-visible` states (2px paper-cream offset outline)
**And** the page renders correctly with JavaScript disabled
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.5: Home Page — Honest First Paint & Content-Count Logic

As a recruiter scanning on mobile,
I want the home page to tell me what LinCie does in the first viewport with a clear path to work and contact,
So that I can form an impression and reach out within seconds.

**Acceptance Criteria:**

**Given** the home page exists at `src/pages/index.astro`
**When** the home page is rendered
**Then** the first viewport contains: a short serif paragraph stating what LinCie does (engineering, research, design), a named project link, a named essay link, and one inline contact link (mailto to `contact@lincie.me`)
**And** the inline contact link has a minimum 44×44px tap target on mobile (via padding, not visual size)
**And** no drop cap is used on the home page
**And** the colophon renders at the bottom
**And** content-count logic resolves at build time via `getCollection()`: 1 project = direct link, 2 = two inline links, ≥3 = list + index link (same pattern for essays)
**And** the home page is fully readable with all links functional without JavaScript
**And** the home page renders below 50KB of HTML + CSS (excluding fonts)
**And** BL corner label is blank on the home page
**And** `<title>` and `<meta name="description">` state plainly that LinCie is a thinker who builds
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.6: Colophon & 404 Page

As a visitor,
I want a book-style colophon on every page and a graceful 404 page in voice,
So that I can always find contact information and never feel lost on a dead link.

**Acceptance Criteria:**

**Given** the Colophon component and 404 page are implemented
**When** the colophon renders on any page
**Then** it contains: typography credits ("Set in Newsreader and Commit Mono, both SIL OFL 1.1."), the current year, a mailto link to `contact@lincie.me`, and social links (`→ github  ↗ twitter  ↗ are.na`)
**And** the colophon is rendered in `<footer>` semantics
**And** external social links carry `rel="noopener"` and the `↗` prefix; internal links carry `→`
**And** the mailto opens the visitor's mail client to `contact@lincie.me`
**And** the colophon renders on every page (home, project, essay, 404)

**Given** a visitor hits an unknown route
**When** the 404 page renders
**Then** it shows a single centered serif paragraph in voice ("This page seems to have been left out of the index. Try…") with inline links to home, the project, and the essay
**And** the BL corner label reads `404 — NOT FOUND`
**And** the Frame renders normally around the 404 content
**And** no big "404" number, no humor, no broken-character moment
**And** `bun run format && bun run lint && bun run check` passes

### Story 1.7: SEO, Meta & Build Validation

As a visitor arriving from a shared link,
I want correct meta tags and OG image so the link preview looks right,
So that the site makes a good impression before I even click.

**Acceptance Criteria:**

**Given** all pages are built
**When** the site is validated
**Then** every page has a unique `<title>` and `<meta name="description">` naming engineering, research, design
**And** OpenGraph (`og:title`, `og:description`, `og:image`) and Twitter card meta are present on every page
**And** a single static OG image exists at `public/og-image.png`
**And** `robots.txt` exists in `public/` and allows everything
**And** no render-blocking JavaScript exists
**And** `bun run build` succeeds with static output to `dist/`
**And** `bun run format && bun run lint && bun run check` passes


## Epic 2: Content & Long-Form Reading — Project and Essay Pages

The visitor reads a project page or essay with drop caps, inline footnotes, the project spine structure, and proper content rendering. Content Collections are typed and validated. The content pipeline is frictionless for LinCie.

### Story 2.1: Project Page Template with Drop Cap & Spine Structure

As a visitor reading a project page,
I want a long-form reading experience with a drop cap, section headings, and the project spine hairline,
So that I can read deeply and understand LinCie's work.

**Acceptance Criteria:**

**Given** a project content file exists with valid frontmatter
**When** the project page renders at `/projects/{slug}`
**Then** the page displays: project title as `<h1>`, long-form prose body with `<h2>` section headings, and the colophon
**And** the first paragraph renders with a 3-line drop cap (hand-floated `::first-letter` pseudo-element, cap-height = 3 × 28px = 84px, Newsreader display optical at ~600 weight)
**And** the `initial-letter` CSS property is NOT used
**And** the drop cap is defined in typography.css using `--baseline` and `--drop-cap-lines` custom properties
**And** the project spine renders as a vertical hairline rule on the left edge with tick marks at each `<h2>` anchor (decorative, `aria-hidden="true"`)
**And** body text renders at 65–75ch measure on desktop
**And** the BL corner label reads `WORK`
**And** the page has a margin column on desktop (≥768px) for footnotes
**And** on mobile (<768px), single column layout with no spine visible
**And** `bun run format && bun run lint && bun run check` passes

### Story 2.2: Essay Page Template with Italic Closing Line

As a visitor reading an essay,
I want a long-form reading experience with drop cap, footnotes, and a warm closing invitation,
So that I can read at depth and reach out if the writing resonates.

**Acceptance Criteria:**

**Given** an essay content file exists with valid frontmatter
**When** the essay page renders at `/writing/{slug}`
**Then** the page displays: essay title as `<h1>`, optional subtitle, drop cap on first paragraph, prose body with `<h2>` section headings, and the colophon
**And** the italic closing line "This was made by LinCie. Reach out if it speaks to you." renders at the end with a mailto link to `contact@lincie.me`
**And** the BL corner label reads `WRITING`
**And** body text renders at 65–75ch measure on desktop
**And** the first essay shipped at MVP carries at least one footnote reference in its first paragraph
**And** adding a new content file with valid frontmatter and pushing to main results in a new live essay at its slug after build
**And** no per-page design decisions are required — the template handles everything
**And** `bun run format && bun run lint && bun run check` passes

### Story 2.3: Footnote Rendering & Bidirectional Navigation

As a visitor reading long-form content,
I want inline footnote references that link to footnote text (and back),
So that I can access supplementary context without losing my place.

**Acceptance Criteria:**

**Given** a content file contains standard Markdown footnote syntax (`[^1]`)
**When** the page renders
**Then** footnote references render as superscript links (`[1]`, `[2]`) in the body text
**And** footnote content renders in `<aside>` elements in the margin column on desktop (≥768px)
**And** on mobile (<768px), footnotes render in a below-content list and are always visible
**And** clicking a footnote reference jumps to the footnote text
**And** each footnote has a back-link that returns to the reference position
**And** footnotes are keyboard-accessible (Tab reaches refs, Enter activates jump)
**And** on desktop, footnotes start at `opacity: 0` (hidden by default — revealed by reverse-scroll in Epic 4)
**And** under `prefers-reduced-motion: reduce`, footnotes are always visible on all devices
**And** footnote content is supplementary — never essential to understanding the main text
**And** `bun run format && bun run lint && bun run check` passes

### Story 2.4: InlineLink Component — Base Styling & External Annotations

As a visitor reading content with links,
I want inline links to be visually quiet at rest but clearly interactive on hover/focus,
So that I can identify links without them disrupting my reading flow.

**Acceptance Criteria:**

**Given** the InlineLink component is implemented
**When** an inline link renders
**Then** it has no underline at rest (no `text-decoration: underline` in compiled CSS)
**And** on hover and `:focus-visible`, an underline is present (via CSS `scaleX` from 0 to 1 with `transform-origin: left`)
**And** external links display a `↗ domain.com` annotation on hover via `::after` pseudo-element or sibling element in Commit Mono
**And** internal links never carry the annotation
**And** name elements (`<span class="name">` or `<cite>`) show font-weight 400→500 on hover instead of underline
**And** all links have `:focus-visible` state: 2px paper-cream offset outline
**And** all links have minimum 44×44px tap target on mobile (via padding, not visual size)
**And** the underline uses `transform` only — no animating `width` or layout properties
**And** `bun run format && bun run lint && bun run check` passes

### Story 2.5: Project Index Bands — Structure & Static Layout

As a visitor browsing projects,
I want to see projects listed as generous exhibition-style bands with title and metadata,
So that I can scan the work at a glance and choose what to read.

**Acceptance Criteria:**

**Given** the ProjectBand component is implemented
**When** project bands render (on home page at MVP, promoted to dedicated index at ≥3 projects)
**Then** each band is an `<article>` with `<h2>` title at display serif size (Newsreader display optical) and monospace meta below (`YYYY — Discipline, Discipline` in Commit Mono, `--meta` color)
**And** each band occupies 30–40vh on desktop, compressed on mobile
**And** bands are separated by generous "ma" gaps (4×–6× baseline on desktop, 3× on mobile)
**And** the right whitespace area is reserved for the hover-revealed hero image (hero interaction added in Epic 5)
**And** the entire band is a link to the project page
**And** project titles carry `transition:name="project-title-{slug}"` for View Transitions (Epic 3)
**And** semantic markup: `<article>` per project, `<h2>` title, meta in `<p>` or `<dl>`
**And** `bun run format && bun run lint && bun run check` passes


## Epic 3: Signature Motion — Reveal, Cursor, Transitions & Hover Language

The site comes alive with the five signature moments: the page reveal sequence, cursor afterglow, Astro View Transitions with Frame persistence and title FLIP-echo, inkstroke underline animation, and hover affordances. All motion respects prefers-reduced-motion and pointer: coarse gates.

### Story 3.1: GSAP Initialization & Lifecycle Pattern

As a developer,
I want a single GSAP entry point with a standardized lifecycle pattern,
So that all animation scripts share one GSAP copy, clean up on navigation, and respect accessibility preferences.

**Acceptance Criteria:**

**Given** `src/scripts/gsap-init.ts` is created
**When** the GSAP initialization module is implemented
**Then** it imports `gsap` and `ScrollTrigger` from the gsap package and registers ScrollTrigger
**And** it re-exports `gsap` and `ScrollTrigger` for use by other scripts
**And** no other file in the project imports directly from `'gsap'` or `'gsap/ScrollTrigger'`
**And** the file exports the gate constants: `REDUCED_MOTION` (from `window.matchMedia('(prefers-reduced-motion: reduce)').matches`) and `COARSE_POINTER` (from `window.matchMedia('(pointer: coarse)').matches`)
**And** a global `document.visibilitychange` listener pauses/resumes the global GSAP timeline on hidden/visible
**And** the total gzipped size of GSAP core + ScrollTrigger is within budget (~40KB gzip)
**And** `bun run format && bun run lint && bun run check` passes

### Story 3.2: Page Reveal Sequence

As a visitor arriving at the site,
I want a subtle one-shot reveal that settles the Frame and title into place,
So that I feel the site is considered and alive without being delayed from reading.

**Acceptance Criteria:**

**Given** `src/scripts/reveal.ts` is implemented following the gate+cleanup lifecycle pattern
**When** a page loads for the first time in a session
**Then** a GSAP timeline runs: corner labels opacity 0→1 (~300ms) → baseline grid overlay at ~3% opacity for ~800ms then fades to 0 → page title font-weight 300→400 (~400ms)
**And** the total timeline duration is ≤1.5s
**And** body element `opacity` remains `1` at every frame — content is never gated behind the reveal
**And** the timeline fires only once per session per page (tracked via `sessionStorage`)
**And** subsequent View Transition navigations within the session skip the reveal
**And** under `prefers-reduced-motion: reduce`, the reveal is skipped and final state is painted instantly
**And** all GSAP instances are pushed to a cleanup array and killed on `astro:before-swap`
**And** the script re-initializes on `astro:after-swap` (checks sessionStorage for new pages)
**And** `bun run format && bun run lint && bun run check` passes

### Story 3.3: Cursor Afterglow

As a desktop visitor,
I want a faint warm trace following my cursor that vanishes when I'm reading,
So that the site acknowledges my presence without interrupting my attention.

**Acceptance Criteria:**

**Given** `src/scripts/cursor.ts` and `src/components/motion/CursorAfterGlow.astro` are implemented
**When** the cursor afterglow is active on a `pointer: fine` device with motion enabled
**Then** a single fixed-position `<div>` element (with `aria-hidden="true"`) follows the cursor with ~2 frame lag and ~1px drift past stop
**And** the afterglow decays in ~600ms (opacity fade)
**And** hovering over body text fades the afterglow to opacity 0 within ~200ms
**And** leaving body text (entering margin/whitespace) restores the afterglow
**And** the afterglow is rendered via GSAP — no per-frame DOM creation
**And** the script gates on `REDUCED_MOTION` — if true, no afterglow renders and no listeners attached
**And** the script gates on `COARSE_POINTER` — if true, no afterglow renders and no listeners attached
**And** all GSAP instances are registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 3.4: Astro View Transitions with Frame Persistence

As a visitor navigating between pages,
I want the Frame to stay stable while content cross-fades smoothly,
So that I never lose my spatial orientation during navigation.

**Acceptance Criteria:**

**Given** Astro View Transitions are configured in BaseLayout via `<ViewTransitions />`
**When** a visitor navigates between pages
**Then** Frame elements (corner labels) use `transition:persist` and do not flicker during transitions
**And** the content area cross-fades with ~600ms duration using custom keyframes: exit = opacity 1→0 + translateY(0→8px), enter = opacity 0→1 + translateY(-8px→0)
**And** the easing uses `var(--ease-settle)` (cubic-bezier(0.25, 0.1, 0.25, 1))
**And** project titles carry `transition:name="project-title-{slug}"` and morph between index and detail pages (title FLIP-echo)
**And** the same `transition:name` value is never used on two unrelated routes
**And** the BL section label and BR folio content update on route change
**And** no slide-in-from-below behavior exists — only the 8px settle/drift
**And** under `prefers-reduced-motion`, transitions paint to final state instantly
**And** `bun run format && bun run lint && bun run check` passes

### Story 3.5: Inkstroke Underline Animation & Hover Affordances

As a visitor interacting with links,
I want links to reveal a drawing underline on hover and external links to show their domain,
So that I can identify interactive elements through a consistent, quiet hover language.

**Acceptance Criteria:**

**Given** the InlineLink component's base styling exists from Epic 2
**When** hover animation timing is added
**Then** the inkstroke underline draws left-to-right over ~250ms on hover using `scaleX(0)` → `scaleX(1)` with `transform-origin: left`
**And** on un-hover, the underline fades (opacity or scaleX back to 0) over ~250ms
**And** the same underline appears on `:focus-visible` (keyboard parity)
**And** external link `↗ domain.com` annotation materializes on hover with ~250ms opacity transition
**And** name elements (`<span class="name">` or `<cite>`) transition font-weight 400→500 over ~250ms on hover
**And** every hover effect uses ~250ms duration (one rhythm)
**And** all hover effects use `transform` or `opacity` only — no layout animation
**And** all hover effects have matching `:focus-visible` states for keyboard users
**And** `bun run format && bun run lint && bun run check` passes


## Epic 4: Scroll System & Long-Form Polish — Damped Scroll, Section Pin, Fog-Lifting, Footnote Reveal

The collaborator's deep-reading experience is complete: damped smooth scroll, section titles that pin for context, fog-lifting section reveals, and the signature reverse-scroll footnote reveal with one-time hint.

### Story 4.1: Damped Smooth Scroll

As a desktop visitor reading long-form content,
I want scroll to feel gently damped and controlled,
So that the reading pace feels patient and considered rather than abrupt.

**Acceptance Criteria:**

**Given** `src/scripts/scroll.ts` is implemented following the gate+cleanup lifecycle pattern
**When** damped scroll is active on a desktop device with motion enabled
**Then** GSAP `ScrollTrigger.normalizeScroll()` is applied with custom easing (lerp ~0.08–0.1)
**And** scroll velocity decays gradually rather than tracking wheel input 1:1
**And** the script gates on `COARSE_POINTER` — if true, native inertia scroll is used (no normalization listeners attached)
**And** the script gates on `REDUCED_MOTION` — if true, native scroll is used on all devices
**And** no `lenis` package appears in `package.json` or `bun.lock`
**And** the ScrollTrigger instance is registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 4.2: Section Pin on Long-Form Pages

As a visitor reading a long section,
I want the section title to stay visible while I read dense paragraphs,
So that I always know which section I'm in without scrolling back up.

**Acceptance Criteria:**

**Given** section pin logic is added to `src/scripts/scroll.ts`
**When** a `<h2>` section title reaches the top of the viewport on a project or essay page
**Then** it pins (receives `position: fixed` or equivalent) for ~30vh of additional scroll then releases
**And** ScrollTrigger is configured with `pin: true, pinSpacing: false`
**And** only one section title is pinned at a time — the previous pin releases before the next engages
**And** the script gates on `REDUCED_MOTION` — if true, titles scroll normally (no pin)
**And** all ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 4.3: Fog-Lifting Section Reveal

As a visitor scrolling through long-form content,
I want sections to sharpen into focus as I reach them,
So that my attention is naturally drawn to the content I'm about to read.

**Acceptance Criteria:**

**Given** fog-lifting logic is added to `src/scripts/scroll.ts`
**When** a `<section>` with a heading enters the viewport on a long-form page
**Then** it renders with `filter: blur(7px)` and transitions to `filter: blur(0)` over ~400ms via ScrollTrigger
**And** only one section carries a non-zero blur at any given frame (prevents compositor-layer stacking on lower-end devices)
**And** previously-entered sections remain sharp — blur never re-applies on forward scroll
**And** the animation uses the `filter` property only — no scale, no translation, no opacity drop
**And** the script gates on `REDUCED_MOTION` — if true, sections render sharp at all times
**And** all ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 4.4: Reverse-Scroll Footnote Reveal with Hint

As a desktop visitor re-reading content,
I want footnotes to appear when I scroll backward,
So that I discover supplementary context as a reward for paying attention.

**Acceptance Criteria:**

**Given** `src/scripts/footnotes.ts` is implemented following the gate+cleanup lifecycle pattern
**When** a visitor scrolls forward on a project or essay page (desktop, motion enabled)
**Then** footnotes in the margin remain at `opacity: 0` (hidden)

**Given** a visitor scrolls backward (reverse scroll detected via ScrollTrigger)
**When** reverse scroll is detected
**Then** footnotes fade to `opacity: 1` over ~250ms

**Given** it is the first reverse-scroll of the session on this page
**When** footnotes reveal for the first time
**Then** a one-time monospace hint ("footnotes reveal as you re-read") fades in near the spine, holds ~2 seconds, fades out, and never repeats on this page (tracked via `sessionStorage`)

**Given** the visitor scrolls forward again after revealing footnotes
**When** forward scroll resumes
**Then** footnotes fade back to `opacity: 0` over ~250ms

**And** the script gates on `COARSE_POINTER` — if true, footnotes are always visible (no reveal behavior)
**And** the script gates on `REDUCED_MOTION` — if true, footnotes are always visible (no reveal behavior)
**And** a user agent that only scrolls forward never sees footnotes on desktop (verifiable by automation)
**And** all GSAP/ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes


## Epic 5: Ambient Life — Paper-Tone Drift, Live Local Time & Final Polish

The site feels alive across visits: paper-tone drifts with time of day, the local time corner label updates live, the folio tracks scroll position, the project spine dot moves with scroll, and project bands reveal hero images on hover. All ambient behaviors respect accessibility and lifecycle rules.

### Story 5.1: Paper-Tone Drift — Time-of-Day Color Bands

As a visitor,
I want the page background to subtly reflect the time of day,
So that the site feels alive and rewards returning at different hours.

**Acceptance Criteria:**

**Given** `src/scripts/paper-tone.ts` is implemented following the gate+cleanup lifecycle pattern
**When** the script runs on page load
**Then** it reads the visitor's local time and sets `--paper-tone` on `:root` to one of four OKLCH bands:
- Pre-dawn (04:00–07:00): cool grey-cream
- Midday (07:00–16:00): warm white-cream (default)
- Dusk (16:00–20:00): warm cream-amber
- Night (20:00–04:00): cool warm-grey
**And** at each band, `--ink` on `--paper` clears WCAG 2.2 AA contrast (≥4.5:1 for body text, ≥3:1 for corner labels)
**And** if the visitor leaves the tab open across a band boundary, `--paper-tone` updates to the new band
**And** under `prefers-reduced-motion: reduce`, the band still resolves correctly but transitions cut hard (no interpolation between bands)
**And** the script runs on every device (not gated by pointer type — paper-tone is information, not motion)
**And** cleanup on `astro:before-swap` and re-init on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 5.2: Live Local Time in TR Corner

As a visitor,
I want the top-right corner to show my local time updating live,
So that the Frame feels ambient and alive without demanding my attention.

**Acceptance Criteria:**

**Given** `src/scripts/local-time.ts` is implemented following the gate+cleanup lifecycle pattern
**When** the local time script runs
**Then** the TR corner label renders the visitor's local time as `HH:MM LOCAL` (24-hour format, visitor's local time zone — not UTC)
**And** the label updates within 60 seconds of a real-time minute change without page reload
**And** the `setInterval` is cleared on `astro:before-swap` (no zombie intervals)
**And** the interval is paused on `document.visibilityState === 'hidden'` and resumed on `visible` (no background ticking)
**And** under `prefers-reduced-motion`, the label still updates (it's information, not motion)
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 5.3: Scroll-Driven Folio & Project Spine Indicator

As a visitor reading a long page,
I want the folio to track my scroll position and the project spine dot to show where I am,
So that I have ambient awareness of my progress without looking away from the content.

**Acceptance Criteria:**

**Given** folio and spine scroll logic are implemented (can be added to `src/scripts/scroll.ts` or a dedicated script)
**When** the visitor scrolls on any page
**Then** the BR folio updates fractionally as a zero-padded `NNN / TTT` value where NNN is scroll-percentage-derived and TTT reflects the count of major `<h2>` sections
**And** the folio updates are debounced to ~60fps
**And** the folio never animates digits — it snaps to the new value
**And** on a single-viewport route (no scroll), the folio shows `001 / 001`

**Given** the visitor is on a project page with the project spine
**When** the visitor scrolls
**Then** a small dot on the spine indicates the current scroll position, moving down the hairline via ScrollTrigger
**And** the spine dot is decorative (`aria-hidden="true"`)

**And** all ScrollTrigger instances are registered for cleanup and killed on `astro:before-swap`
**And** re-initializes on `astro:after-swap`
**And** `bun run format && bun run lint && bun run check` passes

### Story 5.4: Project Band Hover Hero Reveal

As a visitor browsing the project index,
I want a low-opacity hero image to appear when I hover over a project band's whitespace,
So that I get a visual preview of the project without it dominating the typography.

**Acceptance Criteria:**

**Given** the ProjectBand component from Epic 2 has reserved whitespace for the hero
**When** a visitor hovers over a project band's right whitespace area (desktop, `pointer: fine`)
**Then** a hero image fades from opacity 0 to ~0.35 over ~250ms
**And** the inkstroke underline appears on the project title simultaneously
**And** on un-hover, the hero fades back to opacity 0 over ~250ms
**And** the hero image is decorative (`alt=""`, `aria-hidden="true"`)
**And** on `:focus-visible` of the band link, the same hero reveal fires (keyboard parity)
**And** on mobile (`pointer: coarse`), no hover hero is shown (the band is a simple tap target)
**And** the hover uses `opacity` only — no scale, no translation
**And** `bun run format && bun run lint && bun run check` passes

