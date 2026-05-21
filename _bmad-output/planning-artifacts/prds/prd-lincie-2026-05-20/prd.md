---
title: lincie
status: final
created: 2026-05-20
updated: 2026-05-21
---

# PRD: lincie

## 0. Document Purpose

This PRD is for LinCie (the builder), the downstream BMad workflow owners (`bmad-create-ux-design`, `bmad-create-architecture`, `bmad-create-epics-and-stories`, `bmad-sprint-planning`), and any future collaborator who joins the project. It is structured Glossary-first so vocabulary is settled, then Vision, Target User, Features (grouped with FRs nested and globally numbered), and the cross-cutting concerns the site actually carries: aesthetic, information architecture, platform, and quality attributes.

This PRD builds on existing inputs and does not duplicate them:

- `PRODUCT.md` — product brief equivalent (users, purpose, brand, anti-references, accessibility target).
- `DESIGN.md` — design system seed (typography pairing, color tokens, component primitives, do's and don'ts).
- `_bmad-output/brainstorming/brainstorming-session-2026-05-20-1305.md` — direction lock, signature move, Tier 1–4 build plan, 13-mode stress test with mitigations.
- `_bmad-output/planning-artifacts/research/technical-typeface-pairing-research-2026-05-20.md` — typeface pair (Newsreader + Commit Mono) committed with drop-in Astro 6 Fonts API patch.

Where this PRD references those documents, it points; it does not restate.

## 1. Vision

A personal site for LinCie, a thinker who builds. Engineering, research, and design are expressions of the same considered voice. The site does not announce, summarize, or sell. It exhibits and reads. The colophon stands in for every conventional contact and CTA surface.

The visual and motion direction is locked: **The Quiet Atelier with a Warm Trace**. A Bauhaus-Swiss frame holds a single concession to warmth (a faint sumi-ink cursor afterglow on devices that have a cursor). The site is utterly still at base; interaction creates one ripple that settles. Animations breathe (opacity, scale, blur, font-weight micro-shifts) rather than translate. The signature long-form move is reverse-scroll: forward = clean reading, backward = footnotes and considered marginalia surface in the margin. The cross-device signatures are the title FLIP-echo on navigation and the page reveal sequence; these fire on every device, every visit.

### 1.1 What the site is at MVP (v1, launch state)

A four-surface site: home, one project page, one essay, and the colophon (with a 404 fallback). The home page is a quiet entry that introduces LinCie and links directly to the single project page and the single essay. There is no project index page, no writing archive page, no top nav. Reaching the work takes one click from home.

### 1.2 What the site becomes (v1.x, steady state)

Once at least three project pages and three essays are live, the project index page and writing archive page are promoted and linked from the home page. The Frame, type, and motion vocabulary stay constant; only the surface count grows.

### 1.3 Success shape

A small high-fit funnel rather than a large indifferent one. The right recruiter or collaborator reaches out unprompted because the site already answered their questions.

## 2. Target User

The site addresses three audiences in a clear priority order. The design is balanced for the **primary** persona; secondary and tertiary are served by side effects, not by primary design choices.

### 2.1 Primary Persona — Recruiters and hiring managers

Scanning quickly, often on a tight time budget, weighing depth of thinking and quality of craft against many other portfolios. Lands via direct link (resume, email, LinkedIn). Decides within seconds whether to keep reading. Often on mobile.

The site is balanced *for* this persona. The design implications:

- The home page must answer "what does LinCie do?" in the first viewport, before any motion. (FR-3 Honest First Paint.)
- The path from home to deeper work is one click. (FR-9.)
- The cross-device signatures (title FLIP-echo on navigation, the page reveal sequence) fire on every device, including `pointer: coarse` mobile. The reverse-scroll footnote reveal and the cursor afterglow are accepted as **collaborator-facing differentiators that mobile recruiters do not see**; this trade-off is named explicitly in §14.1.
- Quiet confidence is the operative voice; nothing pushes, nothing announces.

### 2.2 Secondary Persona — Potential collaborators

Designers, engineers, researchers considering working with LinCie on projects, essays, or research. Lands via referral, social, or by following a project. Reading carefully, looking for taste, rigor, and a compatible working voice. Often on desktop. Returns more than once.

This persona benefits from the long-form behaviors (drop caps, project spine, reverse-scroll footnotes, cursor afterglow, section pin, fog-lifting reveals). These behaviors are not designed *for* this persona at the cost of the recruiter; they are the consequence of building a content surface that rewards re-reading.

### 2.3 Tertiary Persona — Curious visitors

Drawn in from a writing piece, a project, or a link from someone they trust. Not deciding anything; spending time. Reward depth and pacing.

### 2.4 Tertiary builder-as-user — LinCie

A place to publish project pages and essays as they're written, without each new piece requiring design work. (UJ-3.)

### 2.5 Jobs To Be Done

For the primary (recruiter):

- **Form an accurate impression in the first viewport.** Decide whether LinCie is worth a deeper read within seconds.
- **Reach out without friction once decided.** Find an email, copy it, send.

For the secondary (collaborator):

- **Read at depth.** Encounter at least one project or essay end-to-end.
- **Pick up the voice.** Tone, taste, pacing.

For the tertiary (curious visitor):

- **Spend time without being asked anything.** Reward attention with depth.

For LinCie:

- **Publish without redesign work.** New essays drop in as Markdown files; layout, type, and motion stay constant.

### 2.6 Non-Users (v1)

- Job applicants for LinCie's company (no company exists; this is a personal site).
- Anyone looking for a service offering, rate card, or studio. The site is not a studio site.
- Strangers wanting to comment, react, or subscribe. No comments, no reactions, no newsletter in v1.

### 2.7 Key User Journeys

- **UJ-1. Aiya (Primary: recruiter) scans on a phone between meetings — MVP.**
  - **Persona + context:** Aiya is reviewing a shortlist on her phone between two interviews. She has 90 seconds.
  - **Entry state:** opens `lincie.me` from a candidate spreadsheet link. First-time visitor, no auth, mobile (`pointer: coarse`).
  - **Path:** the page paints a clean served frame with a short serif paragraph stating plainly what LinCie does (Honest First Paint, FR-3). Below it, two named links: the project page, and the essay. She taps the project link. The project page renders the title (FLIP-echoed from the home page, FR-19) and opens to the first paragraph; she reads two sections. She taps the colophon link in the footer.
  - **Climax:** she sees a real email address, no contact form, no "Schedule a call" button. She copies it.
  - **Resolution:** she is left with an accurate impression of the maker as considered, edited, and worth a follow-up. She emails when she has time.
  - **Edge case:** on a slow connection, the page paints the metric-matched system serif fallback first; she still reads the description and the two links before Newsreader arrives. The cursor afterglow and the reverse-scroll footnote reveal do not fire on her device; she does not know they exist, and the site is still strong without them.

- **UJ-1b. Aiya scans on a phone between meetings — v1.x steady state.**
  - **Persona + context:** same persona, six months later. Aiya re-visits because a referral re-mentioned the site.
  - **Entry state:** mobile, returning visitor, browser cache may carry Newsreader.
  - **Path:** the home page now shows a list of three named projects and a pointer to the writing archive (post-floor state per §1.2). She taps the strongest-named project. The title FLIP-echoes; she reads two sections, taps INDEX in the corner, returns to the home page (Frame persists, only content cross-fades), taps the next project.
  - **Climax:** she compares two projects in under a minute, sees they share a voice and a level of care, and emails.
  - **Resolution:** higher confidence than the MVP visit; the inventory itself is a signal.

- **UJ-2. Riza (Secondary: collaborator) reads an essay end-to-end.**
  - **Persona + context:** Riza is a designer-engineer who has met LinCie once. Sees an essay link in a DM. Curious, has half an hour.
  - **Entry state:** desktop, no auth, dark-but-warm room (visiting after dinner). The time-of-day paper-tone drift is in its dusk band.
  - **Path:** lands on the essay. The reveal sequence runs once: corner labels settle, the baseline grid is briefly visible, body content arrives at full opacity (already on baseline; no further fade), the essay title materializes last with a font-weight micro-shift. She begins reading. The cursor afterglow follows her in the margin and politely vanishes when she hovers over the body text. The folio in the bottom-right updates fractionally as she scrolls. Halfway through she scrolls up to re-read a paragraph; footnotes she didn't notice the first time fade into the margin column.
  - **Climax:** the reverse-scroll footnote reveal lands. She realizes the site behaves the way the maker thinks — going back, annotating, considered. The "that's cool" moment.
  - **Resolution:** she finishes the essay, finds the colophon italic line, and emails.
  - **Edge case:** if `prefers-reduced-motion: reduce` is set, footnotes are simply visible at all times; the reveal is replaced by an instant paint of the final state.

- **UJ-3. LinCie publishes a new essay.**
  - **Persona + context:** LinCie has finished writing a new essay. Wants to publish without redesign work.
  - **Entry state:** local dev environment, Astro project, content authored as `.md` (or `.mdx`) under a writing route.
  - **Path:** drops the new file into the writing content folder. Footnotes are written inline as part of the essay markup (Markdown with inline footnote refs `[1]`). At least one footnote reference is placed in the first paragraph or first short section, so a curious visitor naturally encounters one on first read (FR-13). Builds locally, previews, commits, pushes. Vercel rebuilds and deploys.
  - **Climax:** the new essay is live with the same typography, frame, cursor, scroll, and reveal behavior as every other page — no per-page design decisions made.
  - **Resolution:** the essay is reachable at its slug. The home page picks up the new piece automatically once the floor of 3 essays is met.
  - **Edge case:** if the essay carries no footnote references at all, the reverse-scroll reveal has nothing to surface and FR-12 is a no-op for that page. This is a soft authoring guideline, not a build-time gate; the site does not refuse to publish.

## 3. Glossary

Downstream artifacts must use these terms exactly. FRs, UJs, and SMs use Glossary terms verbatim. Introducing a synonym anywhere in this PRD is a discipline violation.

- **Frame** — the persistent corner-label scaffold (TL `INDEX`, TR live local time, BL section label, BR folio) plus the asymmetric Swiss/atelier grid. Survives page transitions via Astro View Transitions `transition:persist`.
- **Folio** — the bottom-right page indicator (`001 / 007`) that updates fractionally as the visitor scrolls. Set in monospace.
- **Cursor afterglow** — the faint warm-grey trace that follows the cursor with subtle inertia (lags ~2 frames, drifts ~1px past stop), decays in ~600ms, vanishes inside body text and reappears in margin/whitespace. GSAP-driven. Disabled on `pointer: coarse` and under `prefers-reduced-motion`.
- **Reveal sequence** — the GSAP timeline that runs once on first paint: corner labels settle → baseline grid briefly visible (~3% opacity, ~800ms) → body content fades up → name/title materializes last with a font-weight micro-shift (300 → 400).
- **Reverse-scroll footnote reveal** — scrolling up gently fades footnotes and asides into the margin (or below content on mobile). Forward scroll = clean reading; reverse scroll = annotated. The signature move.
- **Damped scroll** — Lenis-style smooth scroll on desktop only (`lerp` ~0.08). Disabled on `pointer: coarse` and under `prefers-reduced-motion`.
- **Section pin** — a section title that pins for ~30vh additional scroll then releases. ScrollTrigger-driven.
- **Project spine** — the vertical hairline rule down the left edge of a project page, with tiny tick marks at section anchors and a small dot indicating scroll position. The spine is the in-page navigation; no sticky chrome.
- **Title FLIP-echo** — the project title that morphs from the home page (or, post-floor, the project index band) to the project page header via Astro View Transitions API (`transition:name` scoped per project slug). One of two cross-device signatures (fires on every device, every visit).
- **Cross-device signatures** — the title FLIP-echo (FR-19) and the page reveal sequence (FR-18). These fire on every device and on every visit, regardless of pointer type or `prefers-reduced-motion` (under reduced motion they paint to the final state instantly). They are the differentiators recruiters on mobile actually see.
- **Long-form signatures** — the cursor afterglow (FR-16) and the reverse-scroll footnote reveal (FR-12). These fire only on `pointer: fine` desktop sessions with motion enabled. They are collaborator-facing, not recruiter-facing on mobile.
- **Paper-tone drift** — the time-of-day shift of the `--paper-tone` CSS custom property: pre-dawn cool grey-cream → midday warm white-cream → dusk warm cream-amber → night cool warm-grey. Each band must clear WCAG 2.2 AA contrast for body text and corner labels.
- **Optical-size axis** — the `opsz` axis of Newsreader (range 6–72), accessed via `font-optical-sizing: auto`. Display optical at headline sizes; text optical at body; caption optical at label sizes. The Bach Rule: one variable family carries the entire hierarchy.
- **Drop cap** — a 3-line opening capital on long-form content (essays, project pages). Hand-floated pseudo-element computing cap-height from `--baseline` and `--drop-cap-lines`; cap-height = 3 × baseline (84px at 28px line-height). Set in Newsreader display optical at ~600 weight. The CSS `initial-letter` shorthand is explicitly NOT used (Chromium support remains uneven). Not used on the home page, project index, or short pages.
- **Hanging punctuation** — `hanging-punctuation: first` applied to body and headline blocks. Safari-only today; degrades cleanly to mechanical alignment in Chrome and Firefox. Progressive enhancement, not polyfilled.
- **Honest first paint** — the rule that `<title>`, `<meta name="description">`, and the first one or two lines of body content state plainly what LinCie does, so a fast-scanning recruiter is not punished by the slow-burn opening.
- **Colophon** — the book-style footer block listing type used, year, contact mailto, social as monospace links. The only contact surface besides the quiet italic line at the end of essays.
- **Tier 1 / Tier 2 / Tier 3 / Tier 4** — build phases per the brainstorming session. Tier 1 = foundation (typography, frame, baseline grid, content discipline). Tier 2 = signature (damped scroll, cursor afterglow, reveal sequence, hover language, page transitions). Tier 3 = polish (reverse-scroll footnotes, section pin, project spine, paper-tone drift, live local time). Tier 4 = bench (gated by the One-In-One-Out rule).

## 4. Features

### 4.1 Frame & Layout System

**Description:** the persistent visual scaffold that every page renders inside. Asymmetric Swiss/atelier grid with corner labels at the four edges. The Frame survives page transitions; only the content area cross-fades. Strict baseline grid (28px unit at 18px root, 1.555 line-height). Modular type scale ratio 1.25. Realizes UJ-1 and UJ-2 (the empty Frame already feels right before any content paints).

**Functional Requirements:**

#### FR-1: Persistent Frame across pages

The visitor sees the same corner labels, baseline grid, and grid columns on every page. The Frame is rendered in a base layout that wraps every route.

**Consequences (testable):**

- The four corner labels (TL `INDEX`, TR live local time, BL section label, BR folio) are present on every page below 768px the section label and time fold into the colophon (TL and BR remain).
- During Astro View Transitions, the Frame elements use `transition:persist`; only the main content area cross-fades. Verifiable by inspecting the View Transitions DOM and recording a transition.
- The baseline grid is implemented via CSS custom properties (`--baseline: 28px`, `--type-scale-ratio: 1.25`); changing the property updates the entire system.

#### FR-2: Corner labels render with correct content per page

- TL: `INDEX` (link to `/`).
- TR: live local time (e.g. `14:32 LOCAL`), updates once per minute via `setInterval`. Uses the visitor's local time zone, not UTC.
- BL: current section label per route. MVP mapping: home → (blank), project page → `WORK`, essay page → `WRITING`, 404 → `404 — NOT FOUND`. Post-MVP, if a dedicated colophon route is added, it carries `COLOPHON`.
- BR: folio formatted as zero-padded `NNN / TTT`, where `NNN` is the current scroll-percentage-derived page number and `TTT` is the total. On a single-viewport route, `TTT` is `001`; on a route with sections, `TTT` reflects the count of major sections.

**Consequences (testable):**

- TR label updates within 60s of a real-time minute change without a page reload.
- BR folio updates fractionally as the visitor scrolls (debounced to ~60fps); never animates the digits, just snaps to the new value.
- All corner labels render in Commit Mono at ~0.75rem, ~30–40% body-ink contrast.

#### FR-3: Honest first paint

The very first viewport — the painted state before any client-side animation begins — is fully styled, on-brand, and contains enough copy for a fast scanner to know what LinCie does. Body text opacity is at 100% at first paint; the page-reveal sequence (FR-18) decorates already-visible content with frame-settle and font-weight micro-shifts, never with body opacity fades.

Honesty here applies to *content*, not to typeface identity. With `font-display: optional` (FR-4), cold first paint is rendered in the metric-matched Georgia fallback; Newsreader arrives swap-free on warm loads. The recruiter on a cold visit reads a metric-matched first paint; the experience is intentionally non-flashy.

**Consequences (testable):**

- `<title>`, `<meta name="description">`, and the first one or two lines of body content on the home page state plainly that LinCie is a thinker who builds, with a one-clause description of engineering, research, and design.
- At first paint (DOMContentLoaded, before any GSAP timeline), the home page's body element computed `opacity` is `1`.
- Disabling JavaScript still produces a readable, on-brand home page (the home page is not gated behind motion).
- Lighthouse Largest Contentful Paint ≤ 2.5s on a Lighthouse mobile profile (Slow 4G).

**Out of Scope:**

- Visual hero imagery on the home page. Frame + type carry the first impression.

**Feature-specific NFRs:**

- WCAG 2.2 AA contrast for body ink and corner labels at every paper-tone drift band (pre-dawn / midday / dusk / night).

### 4.2 Typography Pipeline

**Description:** the variable serif (Newsreader) and static monospace (Commit Mono) self-hosted via Astro 6 Fonts API + Fontsource provider, with metric-matched Georgia fallback, italic-on-demand loading, and `font-optical-sizing: auto` applied globally so the optical-size axis carries the entire hierarchy. Realizes the Bach Rule.

**Functional Requirements:**

#### FR-4: Self-hosted typography via Astro Fonts API

The site uses Newsreader (variable serif, `wght` 200–800 + `opsz` 6–72 + `ital` 0–1) and Commit Mono (static, weights 400 and 500, latin subset only), both SIL OFL 1.1, both downloaded at build time from Fontsource.

**Consequences (testable):**

- `dist/_astro/fonts/` after `bun run build` contains Newsreader normal latin woff2, Newsreader italic latin woff2, and Commit Mono 400/500 latin woff2 files.
- Newsreader normal latin is preloaded with `<link rel="preload" as="font">`; Newsreader italic and Commit Mono are not preloaded.
- The metric-matched fallback `@font-face` (`size-adjust`, `ascent-override`, `descent-override`) targets Georgia. CLS measured in DevTools is 0 on first paint regardless of network throttling.
- The Newsreader normal latin face uses `font-display: optional` (not `swap`, not `block`). Fallback first paint stays on the metric-matched Georgia stack until the web font has loaded; no FOUT-driven swap mid-paint.
- Newsreader and Commit Mono woff2 files are also pre-staged in `src/assets/fonts/` at Tier 1 (`Newsreader-Variable.woff2` + roman/italic, `CommitMono-{400,500}.woff2`), so a `fontProviders.local()` swap is a 5-minute change if the Fontsource provider regresses on a future Astro upgrade.
- No `IBM Plex Mono` or `Geist Mono` woff2 files are present anywhere in `dist/`.

#### FR-5: Optical-size axis carries the hierarchy

Headlines, body text, and labels resolve their optical via `font-optical-sizing: auto`. No `font-variation-settings: "opsz" X` overrides anywhere in the codebase.

**Consequences (testable):**

- Body text at 1.125rem renders the text optical of Newsreader; display headlines render the display optical without any explicit axis override.

**Out of Scope:**

- Visual hero imagery on the home page. Frame + type carry the first impression.

#### FR-6: Hanging punctuation as progressive enhancement

`hanging-punctuation: first` is applied globally to body and headline blocks.

**Consequences (testable):**

- In Safari, opening quotes hang into the margin on the first line of paragraphs and headlines.
- In Chrome and Firefox, mechanical alignment is used (the rule is unsupported); layout is identical to Safari in every other respect.

### 4.3 Color, Light, and Paper-Tone Drift

**Description:** paper, ink, monospace meta, and hairline tones in OKLCH with chroma 0.005–0.02 toward the warm-yellow paper hue. No accent color. The `--paper-tone` custom property drifts based on the visitor's local time of day. Realizes the Quiet Confidence and No-Accent rules.

**Functional Requirements:**

#### FR-7: OKLCH-based color tokens

All colors are defined in OKLCH via CSS custom properties. Pure greys are forbidden; every neutral carries warm chroma (C ≥ 0.005 toward the paper hue).

**Consequences (testable):**

- The token file lists at minimum `--paper`, `--ink`, `--meta`, `--hairline`, `--paper-tone`.
- Every site-token color in `--paper`, `--ink`, `--meta`, `--hairline` has OKLCH chroma ≥ 0.005 (verifiable by inspecting the token file).
- Embedded media, code blocks, and syntax-highlighted snippets may use untinted neutrals; the chroma rule applies to site UI tokens only.

#### FR-8: Time-of-day paper-tone drift

A small JS snippet reads the visitor's local time on first paint and sets `--paper-tone` to one of four bands: pre-dawn cool grey-cream, midday warm white-cream, dusk warm cream-amber, night cool warm-grey. The band updates if the visitor leaves the tab open across a band boundary.

**Consequences (testable):**

- At each of the four bands, the rendered `--paper` and `--ink` resolved values clear WCAG 2.2 AA contrast (≥ 4.5:1 for body text, ≥ 3:1 for large text and corner labels). Verified at implementation.
- Under `prefers-reduced-motion: reduce`, the band still resolves correctly but does not animate the transition (cuts hard between bands rather than interpolating).

**Out of Scope:**

- Manual light/dark toggle. The site's tone is determined by local time, not user preference. `[ASSUMPTION: this is the right call; if a recruiter prefers dark UI universally, we accept that.]`

### 4.4 Home Page

**Description:** a quiet entry surface that introduces LinCie in one short paragraph, lists the named projects (1 at MVP, scaling to 3–5), and points to writing once the floor of 3 essays is met. Realizes UJ-1.

**Functional Requirements:**

#### FR-9: Home page composition

The home page contains:

- Honest first-paint paragraph (one or two lines, plain, stating what LinCie does).
- A short list of named projects (link to each project page).
- A direct link to the single MVP essay if writing is below the 3-essay floor; otherwise a link to the writing index.
- Footer colophon (see FR-15).
- No drop cap.

**Consequences (testable):**

- Without JS, the home page is fully readable with all links functional.
- The home page renders below 50KB of HTML + CSS (excluding fonts).

### 4.5 Project Index and Project Page

**Description:** an exhibition-style index of 3–5 projects, each a generous 30–40vh band with display serif title, monospace meta, and hover-revealed hero at low opacity. Each project page is a long-form essay with the project spine, real footnotes, and the title FLIP-echo. Realizes UJ-2.

**Functional Requirements:**

#### FR-10: Project index bands

The project index lists projects as 3–5 generous bands (30–40vh each), separated by `ma` gaps (true empty viewport pauses, not fixed margins). Each band shows: serif title at display size on the left, monospace meta below (`YYYY — Discipline, Discipline`). Open whitespace on the right reveals a 30–40% opacity hero image on hover.

**Consequences (testable):**

- The band markup is semantic (`<article>` per project, with `<h2>` title and `<dl>` or `<p>` meta).
- Hovering a band's right whitespace reveals the hero with a ~250ms opacity transition (from 0 to ~0.35).
- The inkstroke underline appears on the title on hover.
- At MVP (1 project), the index is not promoted in primary nav; the home page links directly to the single project page.

#### FR-11: Project page structure

Each project page contains: the project title (FLIP-echoed from the index via `transition:name="project-title-{slug}"`), the project spine on the left edge, a long-form prose body with section headings and inline footnotes, and the colophon. The page opens with a drop cap.

**Consequences (testable):**

- Navigating from the project index to a project page triggers the View Transitions title morph (visible in a slow-motion screen recording).
- The spine renders a hairline rule with tick marks at each `<h2>` anchor, and a small dot indicates scroll position via ScrollTrigger.
- Inline footnotes render as `[1]`, `[2]` and link to the margin column on desktop / a below-content list on mobile. Click jumps to footnote; reverse-jump returns.

#### FR-12: Reverse-scroll footnote reveal

On project pages and essay pages, footnotes and asides are hidden by default. Forward scroll keeps them hidden. Reverse scroll fades them into the margin column. On the first reverse-scroll of the session on each project/essay page, a one-time monospace hint appears near the spine: *"footnotes reveal as you re-read"* — fades in once, fades out, never repeats per session.

**Consequences (testable):**

- A user agent that scrolls forward only never sees footnotes (verifiable by Playwright script).
- Scrolling up reveals footnotes within ~250ms with an opacity transition.
- Under `prefers-reduced-motion: reduce`, footnotes are visible at all times; the reverse-scroll behavior is disabled.
- Under `pointer: coarse` (mobile), the reverse-scroll behavior is disabled and footnotes appear in the below-content list immediately.

### 4.6 Essay (Writing) Page

**Description:** a long-form prose page for essays. Same drop cap, footnotes, reverse-scroll behavior, and colophon as project pages. The italic closing line *"This was made by LinCie. Reach out if it speaks to you."* with a mailto link to `contact@lincie.me` is present at the end of every essay.

**Functional Requirements:**

#### FR-13: Essay page structure

Each essay renders from a content file (Markdown or MDX) under a writing route. The page contains the essay title, optional subtitle, drop cap on the first paragraph, prose body with inline footnotes, and the italic closing line + colophon.

Content discipline: every essay places at least one footnote reference in the first paragraph or the first short section, so a curious visitor naturally encounters a footnote on first read and is rewarded on re-read by the reverse-scroll reveal (FR-12). An essay with zero footnote refs is acceptable but is implicitly opting out of the signature move on that page.

**Consequences (testable):**

- Adding a new content file with valid frontmatter and pushing to main results in a new live essay at its slug after the next Vercel deploy. No design work required.
- The italic closing line includes a mailto link to `contact@lincie.me`.
- The first essay shipped at MVP carries at least one footnote reference in its first paragraph.

### 4.7 404 Page

**Description:** a single centered serif paragraph in voice. No big "404", no humor, no broken-character moment. The corner-frame `BL` slot reads `404 — NOT FOUND` in monospace.

**Functional Requirements:**

#### FR-14: 404 page composition

The 404 page renders for any unmatched route and contains: a single centered serif paragraph reading *"This page seems to have been left out of the index. Try…"* with inline links to the home page, the (single) project, and the (single) essay. The corner-frame BL slot reads `404 — NOT FOUND`.

**Consequences (testable):**

- Visiting any unknown route returns a 404 status (Vercel-served) and renders the 404 page with the corner Frame.
- The page contains exactly the inline links specified, no additional CTAs, no contact form.

### 4.8 Colophon

**Description:** a book-style footer block listing type used, year, the mailto link, and social links. Set in monospace meta. The only contact surface besides the italic closing line on essays. Realizes the Substance over Performance principle.

**Functional Requirements:**

#### FR-15: Colophon composition

The colophon renders at the bottom of every page and contains: typography credits (`Set in Newsreader and Commit Mono, both SIL OFL 1.1.`), the year (`{current year}`), a mailto link to `contact@lincie.me`, and social links as monospace lines (`→ github  ↗ twitter  ↗ are.na` — `[ASSUMPTION: these three handles; confirm exact list and handles before launch]`). No CTA, no newsletter signup, no sticky chrome.

**Consequences (testable):**

- The colophon is rendered in `<footer>` semantics.
- The mailto opens the visitor's mail client to `contact@lincie.me`.
- External social links carry `rel="noopener"` and the `↗` prefix; internal links carry the `→` prefix.
- The OFL 1.1 attribution string for both faces is present.

### 4.9 Cursor System

**Description:** the warm sumi-ink afterglow that follows the cursor with subtle inertia, decays in ~600ms, and politely vanishes inside body text. GSAP-driven. The one warm gesture in an otherwise still site.

**Functional Requirements:**

#### FR-16: Cursor afterglow rendering

A faint warm-grey trace follows the cursor with inertia (lags ~2 frames behind, drifts ~1px past stop) and decays in ~600ms.

**Consequences (testable):**

- The afterglow is rendered via GSAP and a single fixed-position element; no per-frame DOM creation.
- Hovering over body text fades the afterglow opacity to 0 within ~200ms; leaving body text restores it.
- Animation cleanup is implemented: navigating away from a page kills the tweens (no zombie tickers).

#### FR-17: Cursor system disable conditions

The cursor afterglow is disabled when either of the following is true:

- `pointer: coarse` (touchscreens).
- `prefers-reduced-motion: reduce`.

When disabled, no afterglow renders and no cursor-tracking listeners are attached.

**Consequences (testable):**

- On a touchscreen device, no afterglow renders and no cursor-tracking listeners are attached.
- With `prefers-reduced-motion`, the page contains no GSAP cursor ticker.

### 4.10 Reveal & Transition System

**Description:** the GSAP timeline that runs once on first paint, plus the Astro View Transitions configuration for cross-page transitions. Frame elements persist; only content cross-fades.

**Functional Requirements:**

#### FR-18: First-paint reveal sequence

On first paint of any page, a one-shot GSAP timeline runs over already-visible content. Body opacity stays at 100% throughout (per FR-3 Honest First Paint); the reveal decorates rather than gates content visibility.

1. Corner labels and structural Frame elements settle in via opacity 0 → 1 (~300ms).
2. Baseline grid faintly visible (~3% opacity overlay) for ~800ms, then fades to 0.
3. Page title (or name on the home page) materializes with a font-weight micro-shift (300 → 400, ~400ms).

**Consequences (testable):**

- The timeline duration is bounded (≤ 1.5s total).
- Body element `opacity` is `1` at every frame of the timeline; only the corner labels, the baseline-grid overlay, and the title element animate.
- The timeline runs only on first paint of the session for a given page; subsequent navigations within the session use the page-transition pattern (FR-19) instead.
- Under `prefers-reduced-motion: reduce`, the reveal is replaced by an instant paint of the final state.

#### FR-19: Page transitions via Astro View Transitions

Page transitions use Astro 6's View Transitions API. Cross-fade ~600ms with an 8px settle-down on exit and 8px drift-up on enter. The folio number updates fractionally during the transition. Frame elements (corner labels, grid) carry `transition:persist`; only the content area cross-fades. Project titles carry `transition:name="project-title-{slug}"` scoped per project slug.

**Consequences (testable):**

- The same `transition:name` value is never used on two unrelated routes.
- Frame elements do not flicker during a transition (they persist visually).
- The 8px settle/drift is the only translation in the entire page-transition system; there is no slide-in-from-below behavior.

#### FR-20: Section-level fog-lifting reveal

Sections (each `<section>` with a heading on long-form pages) enter the viewport via a blur-out → blur-in transition: 7px filter blur at the start, 0 at rest. Peripheral content stays slightly soft until the visitor's attention reaches it; focal content is sharp. Scroll-driven via GSAP ScrollTrigger. Only one section is blurred at a time (the entering section); previously-entered sections remain sharp.

**Consequences (testable):**

- A section just entering the viewport renders with `filter: blur(7px)` and transitions to `filter: blur(0)` over ~400ms.
- Under `prefers-reduced-motion: reduce`, the blur is skipped; sections render sharp at all times.
- Animation uses the `filter` property only; no scale, no translation, no opacity drop.
- At most one section carries a non-zero blur at any given frame (prevents compositor-layer stacking on lower-end devices).

### 4.11 Hover Language

**Description:** the small set of hover affordances that share one rhythm: inkstroke underline, name weight increase, external link annotation, project caption reveal. No shadows, no glows, no scale-up.

**Functional Requirements:**

#### FR-21: Inkstroke underline on inline links

Inline links display no underline at rest. On hover (and on `:focus-visible`), an underline draws left-to-right over ~250ms. On un-hover, the underline fades.

**Consequences (testable):**

- Inline links have no `text-decoration: underline` at rest in the compiled CSS.
- The animation uses transform (`scaleX`) and `transform-origin: left` rather than animating `width`. (Inferable from a visual inspection; required by the No Layout-Animation rule.)

#### FR-22: Hover affordances per element type

- **External links:** materialize a small monospace `↗ domain.com` annotation on hover.
- **Internal links:** never carry the annotation.
- **Names of people** (marked with `<span class="name">` or `<cite>` in the markup): subtle variable-font weight increase (400 → 500) on hover, transitioned via `font-weight` (registered axis), ~250ms.
- **Project titles in the index:** trigger the inkstroke underline on the title and the hero opacity reveal on the band.

**Consequences (testable):**

- An external link's hover state contains a `::after` pseudo-element or sibling element with `↗ {hostname}`.
- A `<span class="name">` or `<cite>` element's hover state increments computed `font-weight` from 400 to 500 (verifiable in DevTools).
- Focus-visible outlines on all interactive elements meet the 2px paper-cream offset spec from DESIGN.md.

### 4.12 Scroll System

**Description:** damped smooth scroll on desktop, native scroll on mobile, plus folio-update, section-pin, and reverse-scroll footnote behavior. Realizes the Patient Pacing principle.

**Functional Requirements:**

#### FR-23: Damped smooth scroll on desktop

Desktop scroll uses GSAP `ScrollTrigger.normalizeScroll()` with custom easing to produce a damped, Lenis-like feel (`lerp` ~0.08–0.1). No new dependency is introduced; the existing GSAP + ScrollTrigger toolchain handles this. Disabled on `pointer: coarse` and under `prefers-reduced-motion: reduce`.

**Consequences (testable):**

- On desktop, scroll velocity decays gradually rather than tracking the wheel input 1:1.
- On mobile, native inertia is used; no scroll-normalization listeners are attached.
- No `lenis` package appears in `package.json` or `bun.lock`.
- Under `prefers-reduced-motion: reduce`, scroll normalization is disabled; native scroll is used on all devices.

#### FR-24: Section pin

On long-form pages (project pages and essays), section titles pin for ~30vh of additional scroll then release. This keeps section context visible while reading dense paragraphs, so the reader always knows which section they are in without scrolling back up. Implemented via GSAP ScrollTrigger with `pin: true, pinSpacing: false`.

**Consequences (testable):**

- A section title `<h2>` element receives `position: fixed` (or equivalent) for ~30vh of scroll once it reaches the top of the viewport.
- Under `prefers-reduced-motion: reduce`, the pin is disabled and titles scroll normally.
- Only one section title is pinned at a time; the previous pin releases before the next engages.

### 4.13 Live Local Time

**Description:** the TR corner label that updates once per minute with the visitor's local time, e.g. `14:32 LOCAL`.

**Functional Requirements:**

#### FR-25: Live local time rendering

The TR corner label renders the visitor's local time formatted as `HH:MM LOCAL` and updates every minute via a `setInterval`.

**Consequences (testable):**

- The label updates within 60 seconds of a real-time minute change, no page reload required.
- The interval is cleared on page navigation (no zombie intervals) and paused on `document.visibilityState === 'hidden'` (no background ticking).
- Under `prefers-reduced-motion`, the label still updates (it's information, not motion).

## 5. Non-Goals (Explicit)

- **No analytics, no tracking scripts, no third-party JavaScript.** The site is privacy-respectful by absence, not by configuration.
- **No newsletter signup, no email capture form, no comments, no reactions.** Contact is a mailto in the colophon and an italic line on essays.
- **No CMS.** Content is authored as Markdown or MDX in the repo.
- **No light/dark toggle.** Tone is determined by local time of day, not user preference.
- **No internationalization in v1.** English only; latin subset only on both fonts.
- **No social-share Open Graph optimization theater.** A baseline OG image and meta tags only.
- **No project gallery thumbnail grid.** Project index is a list of generous bands, not a tile grid.
- **No "studio" or "agency" framing.** This is a personal site for a thinker who builds.
- **No icon font, no icon library.** Inline glyphs (`↗`, `→`) used sparingly.
- **No cookie consent banner.** No cookies are set in v1.
- **No service worker, no offline mode, no PWA install.**
- **No client-side router beyond Astro View Transitions.** No SPA framework added.
- **No third-party fonts beyond Newsreader and Commit Mono.** Explicit ban on IBM Plex Mono and Geist Mono.
- **No design tokens published as a separate package.** Tokens live in this repo only.
- **No animation library beyond GSAP.** No Framer Motion, no Motion One, no Lottie.
- **No image manipulation library at runtime.** Astro's image pipeline only.

## 6. MVP Scope

### 6.1 In Scope

- Tier 1 — Foundation: typography pipeline, baseline grid, OKLCH color tokens, Frame layout, page templates (home, project, essay, 404), content discipline.
- Tier 2 — Signature: damped smooth scroll, cursor afterglow, reveal sequence, hover language, page transitions via Astro View Transitions.
- Tier 3 — Polish: reverse-scroll footnote reveal, section pin, project spine, paper-tone drift, live local time.
- Content: home page, 1 project page (fully written), 1 essay (drafted), 404 page, colophon.
- Deploy on Vercel at `lincie.me`. Astro static output.

Note: Tier 3 *features* ship in MVP per the list above. Tier 3 *navigation surfaces* (the project index page and the writing archive page) are gated separately — see §6.2 below.

### 6.2 Out of Scope for MVP

- **Project index page promoted in primary navigation.** Reason: brainstorming Fail #10 mitigation. Until 3 project pages are drafted, the home page links directly to the single project. Promoted to v1.x when project count ≥ 3.
- **Writing archive page promoted in primary navigation.** Reason: same as above for essays. Promoted to v1.x when essay count ≥ 3.
- **Tier 4 bench items** (cursor crosshair on hover, section-tinted afterglow, loading mark, sticky `↑ index` after scroll, per-project hidden process notes, display-sized numbers for project entries, strict no-buttons rule). Reason: brainstorming One-In-One-Out rule. Maker-side editorial about why this rule exists lives in the decision log, not here.
- **RSS feed.** Deferred to v1.x if/when essay count ≥ 3.
- **Sitemap.xml automation.** Astro's sitemap integration adds a dependency; defer to v1.x.
- **Per-page OpenGraph image generation pipeline.** A single static OG image at MVP for the home page; per-essay and per-project OG generation in v1.1 (high-priority because UJ-2's primary entry vector is an essay link in a DM, where the OG preview matters).
- **Latin-ext subset.** Add only if a content audit shows a non-latin glyph is needed.

### 6.3 Home page behavior at intermediate content counts

The home page surfaces what exists, never an empty container. Specifically:

- **Project count = 1 (MVP):** home links directly to the single project page.
- **Project count = 2:** home shows two named project links inline; no separate index page.
- **Project count ≥ 3:** home shows the project list and links to the promoted project index page.
- **Essay count = 1 (MVP):** home links directly to the single essay.
- **Essay count = 2:** home shows two named essay links inline; no separate archive page.
- **Essay count ≥ 3:** home shows recent essays and links to the promoted writing archive page.

## 7. Success Metrics

This is a personal site, not a product. Quantitative metrics like signups or revenue do not apply. Success is qualitative and behavioral. Metrics below are directional signals, not causal validators — the site cannot attribute inbound email to a specific FR.

**Primary**

- **SM-1: Signal in inbound email.** Within 90 days post-launch, at least one inbound email from a recruiter or collaborator references something specific from a project page or essay (not a generic "saw your portfolio"). Directional signal for the quality of the content surface.
- **SM-2: Builder monthly publishing.** LinCie publishes at least one new essay or project page per month for the first three months without doing per-page design work. Validates that the content pipeline (FR-13, UJ-3) works without friction. Failure consequence: if publishing stalls, the 90-day no-design-change rule (§14.2) still holds; the maker writes content, not code.

**Secondary**

- **SM-3: Lighthouse on every page.** Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Run pre-deploy per §10 NFR cadence. Validates FR-3, FR-4, FR-7, FR-8, FR-17, FR-23.
- **SM-4: CLS = 0.** Cumulative Layout Shift measured in DevTools is 0 on every page across the four paper-tone bands and across throttled network conditions. Validates FR-4 (metric-matched fallback).

**Counter-metrics (do not optimize)**

- **SM-C1: Time-on-page.** Do not optimize for time-on-page. The site should feel patient, not sticky. A recruiter spending 12 seconds and bouncing is not a failure if they were the wrong fit. Counterbalances any future temptation to add nudges.
- **SM-C2: Total visitor count.** Do not optimize for traffic volume. Reaching the wrong audience is not the goal.

## 8. Open Questions

1. **First project to write.** TBD. Does not block PRD; blocks the first content sprint.
2. **Social handle list for the colophon.** Confirm exact handles for github / twitter / are.na (or substitute platforms). (FR-15.)
3. **Section labels per route exact strings.** MVP mapping is defined in FR-2 (home blank, project `WORK`, essay `WRITING`, 404 `404 — NOT FOUND`). Confirm or adjust.
4. **Corner labels contrast at small text.** §10 NFRs flag that 30–40% body-ink contrast may fail WCAG 4.5:1 for small text at some paper-tone bands. Resolve at architecture phase against actual OKLCH values; may require increasing contrast or documenting a decorative-text exemption.
5. **Voice steering file as a v1.1 deliverable.** Brainstorm Fail #12 mitigation prescribed a one-page voice file with in-voice and out-of-voice examples (e.g. `.kiro/steering/voice.md`). PRD §11 inlines voice rules but does not require a maintained companion artifact. Confirm whether to commit to building this in v1.1 or leave it informal.

## 9. Assumptions Index

Every `[ASSUMPTION]` from the document, surfaced for explicit confirmation:

- §4.3 FR-8: No manual light/dark toggle is the right call. Tone is determined by local time, not user preference.
- §4.8 FR-15: Social link list is `→ github  ↗ twitter  ↗ are.na`. Exact handles confirm before launch.

## 10. Cross-Cutting NFRs

- **Performance.** Lighthouse Performance ≥ 95 on every page across mobile and desktop. CLS = 0. Font budget < 200 KB total for Newsreader + Commit Mono (latin subsets); page total HTML + CSS + fonts on first paint targeted under ~250 KB. Client-side JS budget ≤ 60 KB gzip total (GSAP + site scripts). LCP ≤ 2.5s on Lighthouse mobile profile. INP ≤ 200ms. No render-blocking JS.
- **Performance cadence.** Lighthouse is run pre-deploy (locally or in CI) on every page. Failures block deploy.
- **Accessibility.** WCAG 2.2 AA on every page across the four paper-tone bands. Keyboard navigation works for every interactive element with visible focus states matching the ink-on-paper aesthetic. Semantic HTML first; ARIA only where semantic HTML is insufficient. All animations respect `prefers-reduced-motion`. Corner labels at ~30–40% body-ink contrast must be verified against the 4.5:1 small-text threshold at each paper-tone band; if they fail, either increase contrast or document an exception as decorative text (WCAG 1.4.3 exemption for incidental text). Resolve at architecture phase against actual OKLCH values.
- **Security.** No third-party scripts, no third-party cookies, no inline event handlers, no `eval`, no `dangerouslySetInnerHTML`-equivalent. CSP headers via Vercel allow only same-origin scripts and styles.
- **Privacy.** No analytics, no tracking, no fingerprinting, no cookies set by the site. Vercel logs request IPs at the edge (see §14.4).
- **SEO.** Per-page `<title>` and `<meta name="description">` naming "engineering, research, design" plainly. OpenGraph and Twitter card meta on every page. A single static OG image at MVP; per-page OG for essays in v1.1. `robots.txt` allows everything; no `noindex`.
- **Reliability.** Static deploy; no SSR runtime to fail. Build success on every push to main. A failed build does not deploy (Vercel default).
- **Browser support.** Latest two versions of Chrome, Firefox, Safari, Edge. iOS Safari 16+. Android Chrome latest. No IE, no legacy Edge.
- **Animation performance.** All animations use transform and opacity only (no animating layout properties); `filter` is allowed for the fog-lifting reveal (FR-20) with the one-section-at-a-time constraint. Animation tokens defined once (`--ease-settle`, `--ease-mark`, `--dur-quick`, `--dur-breath`, `--dur-arrive`); every animation pulls from the token set. (Brainstorm Fail #1 mitigation.)
- **Engineering discipline.** Site-token colors use OKLCH only (no `#` hex, no `rgb()` in the token file). Registered CSS properties (`font-weight`, `font-style`, `font-optical-sizing`) are used for registered axes; `font-variation-settings` is reserved for custom axes only. `transition:name` values are unique per route segment + slug (enforced by code review or a custom lint at architecture phase). The GSAP cursor ticker and all `setInterval` instances are paused on `document.visibilityState === 'hidden'` and cleaned up on page navigation.
- **Validation gate.** Every feature change is gated on `bun run format && bun run lint && bun run check` per AGENTS.md. CI runs this triple on every PR.

## 11. Aesthetic and Tone

The full design system lives in `DESIGN.md`. The full brand register lives in `PRODUCT.md`. PRD-relevant constraints:

### 11.1 Central thesis

The site is the work, not a frame around it. Its purpose is to evidence quiet confidence and considered craft through the experience of using it, so that the right opportunities and collaborators self-select. The home page introduces, the project pages exhibit, the writing thinks aloud. Engineering, research, and design are expressions of the same considered voice — not separate hats.

### 11.2 Brand triad

**Quiet, decisive, sharp.** Low words, high signal. Three words: **considered, disciplined, warm.**

### 11.3 Five Design Principles (named, see PRODUCT.md for full definitions)

1. **Quiet Confidence** — state things as facts. No exclamation, no "passionate about", no announcements.
2. **Craft as Proof** — the site itself demonstrates perfectionism. The lived experience of detail replaces any claim of detail.
3. **Substance over Performance** — the work and the writing carry the meaning. No theatrics.
4. **Patient Pacing** — content unfolds at its own speed. Reading and exploring are meditative, not transactional.
5. **Long Half-Life** — choose decisions that age well. Avoid trend-bound aesthetics.

### 11.4 Visual references

- Bauhaus / Swiss atelier discipline.
- Calm tea-room (one element per viewport, deliberate focus, generous empty space, base state utterly still). Explicitly **not** a museum lobby that shows off its own architecture: the frame should not call attention to itself.
- Ozu film grammar (stable frame, content passes through).
- One concession to warmth: a faint warm trace that follows the cursor like a fingerprint of where the visitor has been.

### 11.5 Anti-references (full list — the site must not look or feel like)

- Walls of buzzwords, "passionate about X" copy, exclamation points, hero claims that announce the maker.
- The hero-metric template (big number, small label, supporting stats, gradient accent).
- Glassmorphism, equal-tile card grids, gradient meshes, neumorphism, 3D blobs, neon-on-black.
- The 2014 SaaS portfolio: dense feature cards, oversized CTAs, social-proof rails, primary-color buttons.
- The 2025 cream-paper editorial portfolio with IBM Plex Mono everywhere, sterile and identical to fifty others.
- Wes Anderson twee or themed iconography: decorative crop marks, fake stamps, sectional § marginalia.
- Antiquarian or parchment aesthetics: fake aging, paper grain, deckled edges, period-pastiche typography. Modernist atelier, not academic dust.
- The modern museum lobby that shows off its own architecture.
- Slide-in-from-below hero reveals, scroll-jacking, snap scrolling, parallax theater.
- Sticky navigation chrome, over-prominent CTAs, contact forms with five fields.

### 11.6 Named Design Rules (see DESIGN.md for full text)

This list serves a downstream UX/architecture/dev reader who picks up the PRD as the canonical handoff. Each rule is defined in DESIGN.md.

- **Bach Rule** — one disciplined family carries every typographic voice through the optical-size axis.
- **Optical-Size Rule** — `font-optical-sizing: auto`; never override `opsz` via `font-variation-settings`.
- **Drop Cap Rule** — hand-floated pseudo-element; `initial-letter` is explicitly not used.
- **Hanging Punctuation Rule** — `hanging-punctuation: first` as Safari-only progressive enhancement.
- **Registered-Property Rule** — `font-weight`, `font-style`, `font-stretch`, `font-optical-sizing` for registered axes; `font-variation-settings` reserved for custom axes only.
- **No-Accent Rule** — there is no brand color applied to elements.
- **Tinted Neutral Rule** — every neutral carries warm chroma; pure greys are forbidden.
- **No-Shadow Rule** — box shadows are forbidden everywhere; hierarchy is whitespace, hairline, or type-weight contrast.
- **Honest First Paint Rule** — the first viewport is fully styled, on-brand, and self-explanatory before any animation.
- **Periphery-Soft Rule (Fog Lifting)** — sections enter blurred, focus sharpens (FR-20).
- **One-In-One-Out Rule** — adding a Tier 4 bench item requires removing or hiding an existing feature.
- **No-Buttons Rule** — there are no buttons in the conventional sense. Calls to action are inline links or a quiet text-with-arrow, never with border, background, or padding.

### 11.7 Absolute CSS-level bans

- No `border-left` or `border-right` greater than 1px as a colored stripe.
- No `background-clip: text` with a gradient.
- No `box-shadow` on any element (No-Shadow Rule).
- No animation of layout properties (use `transform` and `opacity`; `filter` allowed for fog-lifting).
- No `IBM Plex Mono` or `Geist Mono` typefaces.

### 11.8 Voice rules for site copy

These rules apply to **site copy** (text rendered on the live site: headlines, body prose, metadata, colophon, 404 text, the italic closing line). They do not apply to internal documents (this PRD, the decision log, architecture docs).

- No exclamation points.
- No "passionate about" phrasing.
- No buzzword lists, no hero claims that announce the maker.
- No em dashes in copy. Commas, colons, semicolons, periods, parentheses.
- State things as facts. Trust the visitor. Headlines do not announce; they are simply present.
- Body text reads like an edited essay, not a pitch deck.
- Metadata is set in monospace and treated as the museum wall label, not the headline.
- Rewrite until things stop trying to impress.

## 12. Information Architecture

```
/
├── (home)
├── /projects/{slug}        → individual project pages (1 at MVP)
├── /writing/{slug}         → individual essays (1 at MVP)
├── /colophon               → optional dedicated colophon page (deferred; colophon lives in the footer at MVP)
└── /404                    → unmatched routes
```

Navigation surfaces:

- **Top-left corner label `INDEX`** — link to `/`.
- **Footer colophon** — links to `contact@lincie.me` and social.
- **Inline contextual links** — within prose, between projects and essays.

No top nav bar, no sidebar, no breadcrumbs, no sticky chrome. The Frame is the navigation; the spine is in-page nav on long pages.

## 13. Platform

- **Build target:** Astro 6 static output (`output: 'static'`).
- **Hosting:** Vercel.
- **Domain:** `lincie.me`.
- **Node runtime requirement:** ≥ 22.12.0 (per `package.json`).
- **Package manager:** Bun, per AGENTS.md.
- **CI:** Vercel build on push. AGENTS.md validation triple (`bun run format && bun run lint && bun run check`) is enforced locally; recommended also as a Vercel build step or pre-commit hook in v1.1.
- **Browsers:** see Cross-Cutting NFRs.

## 14. Open Risks (Tracked, Not in Scope to Solve)

Brought forward from the brainstorming session's stress test and the typeface research's risk register for traceability. Mitigations are baked into FRs, NFRs, and §6.2 above.

### 14.1 Strategic risks

- **Recruiter 12-second bounce risk** (Brainstorm Fail #7) → mitigated by FR-3 Honest first paint and the recruiter-primary design balance (§2.1).
- **Aesthetic-saturation risk** (Brainstorm Fail #8) → mitigated by typeface choice (Newsreader + Commit Mono, not Source Serif 4 + IBM Plex Mono) and the unique reverse-scroll footnote signature (FR-12, collaborator-facing).
- **Empty-shell risk: blog/projects gallery never built because content is hard** (Brainstorm Fail #10) → mitigated by §6.2 navigation promotion gate and §6.3 home-page intermediate-count behavior.
- **Drift risk: Tier 4 bench items creep back in** (Brainstorm Fail #11) → encoded as the One-In-One-Out rule (§6.2 and §11.6).
- **Signature-invisible-to-recruiter cost (accepted, not mitigated).** The reverse-scroll footnote reveal (FR-12) and the cursor afterglow (FR-16) are disabled on `pointer: coarse` and under `prefers-reduced-motion: reduce` by design. The primary persona (recruiter on mobile) does not encounter them. This is an accepted trade-off, not a defect: the signature-grade differentiators that fire for the primary persona are the title FLIP-echo (FR-19) and the page reveal sequence (FR-18), both cross-device. Mobile recruiters see a typography-and-frame portfolio with disciplined typography, an honest first paint, and a one-click path to the work — strong on its own merits. Long-form behaviors are reserved for collaborators on desktop. If the recruiter funnel underperforms qualitatively at the 90-day post-launch mark, revisit.
- **Contact-visibility risk: mailto too quiet** (Brainstorm Fail #9) — Tracked as a v1.1 affordance. If a qualitative review at 90 days suggests inbound is dampened by colophon-only contact, surface a small `Contact` link in the corner labels or as a quiet bottom-most page section that scrolls to the colophon. Trigger is judgement-based, not metric-based.

### 14.4 Privacy disclosure

The site sets no cookies, runs no analytics, and contains no third-party scripts. However, it deploys to Vercel, which logs request IPs and headers at the edge for routing, security, and operational telemetry. "Privacy-respectful by absence" applies to the *site*; it does not extend to the hosting provider. Stronger privacy guarantees (self-hosted edge, geographic egress controls) are not in scope for v1.

### 14.2 Discipline rules (lifted from Brainstorm Fail #11 and Fail #13)

- **Navigation promotion gate.** The project index page is promoted to primary navigation only when ≥ 3 project pages exist. The writing archive page is promoted only when ≥ 3 essays exist. Until then, the home page surfaces what exists directly (see §6.3). The features themselves (Tier 3 polish) are not gated by content count — they ship in MVP per §6.1.
- **One-In-One-Out rule.** Adding a Tier 4 bench item to production requires removing or hiding an existing feature in the same change. Documented in §6.2 and §11.6.
- **No-design-change rule (post-launch).** Once MVP is live and the maker decides the site is "shipped," no design changes for 90 days. Content only. Private timeline commitments live in the decision log.

### 14.3 Typography risks (lifted from typeface research §"Rollback / Escape Hatches")

- **Newsreader trend exposure.** If Newsreader becomes saturated in 2026–2027, swap to Source Serif 4. One-config-block change per the research's escape hatch. Re-evaluation triggered at the 90-day post-launch mark.
- **Commit Mono variable-axis need.** If a future motion idea requires continuous mono weight, Fontsource's static Commit Mono is insufficient. Swap to JetBrains Mono variable. One-config-block change.
- **Fontsource provider regression.** If a future Astro upgrade breaks `fontProviders.fontsource()`, the local woff2 files pre-staged in `src/assets/fonts/` (per FR-4 consequences) make a `fontProviders.local()` swap a 5-minute change.

## 15. Acceptance: how this PRD is "done" enough to advance

The PRD is ready to feed `bmad-create-ux-design`, `bmad-create-architecture`, and `bmad-create-epics-and-stories` when:

- Every assumption in §9 has been confirmed or revised.
- Every open question in §8 has either an answer or an explicit "deferred to architecture/v1.1" decision in the decision log.
- No critical findings remain outstanding from the reviewer pass.
- The recruiter-primary design balance (§2.1) is reflected in all downstream artifacts.
