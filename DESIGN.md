<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: LinCie
description: Personal site for a thinker who builds. Modernist atelier with one warm trace.
typography:
  display:
    fontFamily: "Newsreader, Georgia, ui-serif, Cambria, 'Times New Roman', serif"
    fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "normal"
    fontFeature: "'kern', 'liga'"
  headline:
    fontFamily: "Newsreader, Georgia, ui-serif, Cambria, 'Times New Roman', serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "Newsreader, Georgia, ui-serif, Cambria, 'Times New Roman', serif"
    fontSize: "1.575rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Newsreader, Georgia, ui-serif, Cambria, 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.555
    letterSpacing: "normal"
    fontFeature: "'kern', 'liga'"
  label:
    fontFamily: "'Commit Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
    fontFeature: "'tnum'"
---

# Design System: LinCie

## 1. Overview

**Creative North Star: "The Quiet Atelier with a Warm Trace"**

A Bauhaus-Swiss atelier discipline holding a single concession to warmth. The frame is the architecture: confident display serif paired with precise monospace metadata, asymmetric grid, corner labels at the edges of the page, museum-catalogue captions on projects. Inside that frame, one warm gesture — a faint sumi-ink afterglow that follows the cursor and politely vanishes when the visitor is reading. Bach for structure; cicadas for accent. The structure leads, the atmosphere never overpowers it.

The site is utterly still at base. Interaction is a single ripple that settles back to stillness. Animations breathe (subtle scale, opacity, blur, font-weight micro-shifts on 1–2s reveals or 8–30s ambient loops); they almost never translate. Reading is treated as the primary act: the cursor afterglow disappears inside body text, scroll velocity is dampened so visitors can't blast through, and reverse-scroll reveals annotations the maker added on re-read. The site behaves the way the maker thinks: edited, considered, willing to go back.

This system explicitly rejects: glassmorphism, equal-tile card grids, gradient meshes, neumorphism, the 2014 SaaS hero template (big metric, small label, gradient accent), the 2025 cream-paper IBM-Plex-Mono editorial trend, Wes Anderson themed iconography, antiquarian or parchment textures, slide-in-from-below reveals, scroll-jacking, snap scrolling, and the modern museum lobby that shows off its own architecture. Modernist atelier, not academic dust. Disciplined, not themed. Real, not aged.

**Key Characteristics:**

- Base state is utterly still; one ripple per interaction, settling back.
- Asymmetric Swiss/atelier grid with corner labels (TL `INDEX`, TR live local time, BL section, BR folio).
- Display serif + monospace metadata pairing; variable font with optical-size axis carries hierarchy.
- Strict baseline grid; modular type scale (≥1.25 ratio).
- Animations breathe (opacity, scale, blur, font-weight). Almost no x/y translation.
- One warm gesture: sumi-ink cursor afterglow with subtle inertia that disappears over body text.
- Reverse-scroll reveals footnotes (forward = clean reading, backward = considered marginalia).
- Time-of-day background drift: pre-dawn cool grey-cream → midday warm white-cream → dusk warm cream-amber → night cool warm-grey.
- Frame persists across page transitions; only content cross-fades.
- Honest first paint protects the slow-burn opening from a fast-scanning recruiter.

## 2. Colors

The palette is paper, ink, and a single muted monospace tone. No accent color exists; warmth is carried by the cursor afterglow and the time-of-day background drift, not by a hue applied to elements. Colors live in OKLCH; chroma stays low (≤0.02) so neutrals tint warm without ever announcing themselves. Dark is never `#000`; light is never `#fff`.

### Primary

The system has no primary accent color in the conventional sense. The "primary" is the paper itself, which drifts subtly across the day.

### Neutral

- **Paper Cream** (`oklch(~97% 0.008 80) — to be resolved during implementation`): the base surface. Drifts via `--paper-tone` custom property based on local time.
- **Ink** (`oklch(~18% 0.008 80) — to be resolved during implementation`): body text and display headlines. Tinted toward the paper hue, never `#000`.
- **Monospace Meta** (`oklch(~50% 0.005 80) — to be resolved during implementation`): captions, corner labels, folio, footnote text. Roughly 30–40% the contrast of body ink — present, never demanding.
- **Hairline** (`oklch(~85% 0.005 80) — to be resolved during implementation`): the project spine and any rare separators. Almost imperceptible.

Values above are anchors, not commitments; exact OKLCH triples land during implementation alongside the typeface pairing. Every step of the time-of-day drift must clear WCAG 2.2 AA contrast for body text and corner labels.

### Named Rules

**The No-Accent Rule.** There is no brand color applied to elements. Warmth lives in the cursor afterglow and the paper-tone drift, never in a button, link, badge, or callout. If a swatch is being added "for emphasis", the answer is type weight or whitespace, not a hue.

**The Tinted Neutral Rule.** Every neutral carries chroma 0.005–0.02 toward the paper hue (warm yellow-orange family). Pure greys are forbidden. A neutral that looks neutral on a white screen is wrong; it should read as "warm grey" against the paper.

**The Honest First Paint Rule.** The first viewport before any animation runs must already be legible, on-brand, and contain enough copy for a fast scanner to know what LinCie does. The slow-burn reveal happens on top of an already-correct page, never as a substitute for one.

## 3. Typography

**Display Font:** Newsreader (variable, `wght` 200–800, `opsz` 6–72, `ital` 0–1; SIL OFL 1.1; Production Type for Google Fonts).
**Body Font:** Newsreader at its text optical size. The same family carries display and body; the optical-size axis handles the entire hierarchy.
**Label/Mono Font:** Commit Mono (static on Fontsource; weights 400 and 500, latin subset; SIL OFL 1.1; Eigil Nikolajsen). Explicitly NOT IBM Plex Mono and explicitly NOT Geist Mono — both are saturated defaults of the 2025–2026 cream-paper editorial portfolio that this site must not look like.

**Character:** A draftsman's pairing, committed to invisibility. Newsreader is purpose-built for continuous on-screen reading: transitional old-style with sturdier strokes and open shapes, sharp at display optical, generous at text optical. Commit Mono's design intent is *anonymous and neutral, quietly useful* — that phrasing is the brief, applied to every metadata moment. No third typeface. No icon font.

Both faces ship SIL OFL 1.1, are self-hosted via Astro's Fonts API with the Fontsource provider, and require no new dependencies. Newsreader normal latin is preloaded; Newsreader italic and Commit Mono load on demand. Newsreader's auto-generated metric-matched fallback targets Georgia (warmer than the default Times match) so any FOUT does not shift layout.

### Hierarchy

- **Display** (Newsreader, regular weight, large clamp size, line-height 1.0–1.05): project titles on index bands, name reveal, essay openers. Set at the display optical size via `font-optical-sizing: auto`; never set at the text optical with `font-size` overrides.
- **Headline** (Newsreader, regular, ~2× body, line-height ~1.15): section openers within long-form pages.
- **Title** (Newsreader, medium 500, ~1.4× body, line-height ~1.3): subheads inside essays and project pages.
- **Body** (Newsreader, regular, 1.125rem, line-height 1.555, max measure 65–75ch): essay and project prose. Set at the text optical for open shapes at small size. The 1.555 line-height resolves to a 28px baseline grid unit at 18px root.
- **Label** (Commit Mono, regular, ~0.75rem, letter-spacing slightly positive, no uppercase by default): corner labels, folio, project meta, footnote text. Tabular figures are inherent to the monospace; the live local time and the folio rely on this.

### Named Rules

**The Optical-Size Rule.** Display optical at headline sizes. Text optical at body sizes. Caption optical at label sizes. Resizing one optical to do another job is forbidden. Use `font-optical-sizing: auto` and let the browser pick the right optical from the rendered `font-size`. Never reach for `font-variation-settings: "opsz" X` on a registered axis.

**The Bach Rule.** A real baseline grid the page can be felt against. Modular type scale ≥1.25 between steps. One disciplined family (Newsreader) carries every typographic voice — heading, body, caption, footnote — through its optical-size axis; the monospace (Commit Mono) sits in its single lane. Multiple voices in harmony, not multiple families competing. Engineering-grade discipline IS the aesthetic.

**The Drop Cap Rule.** Long-form content (essays, project pages) opens with a 3-line drop cap in Newsreader display optical at a heavier weight (~600), set on the baseline grid. Cap-height target = 3 × baseline (84px at 28px line-height). Implemented as a hand-floated pseudo-element computing cap-height from `--baseline` and `--drop-cap-lines` CSS custom properties; `initial-letter` is not used because Chromium support remains uneven. Index pages, the home page, and short pages do not carry a drop cap.

**The Hanging Punctuation Rule.** `hanging-punctuation: first` on body and headline blocks. Visual alignment over mechanical alignment; quotes hang into the margin. Safari ships this property today; Chromium has not. The rule degrades to mechanical alignment in Chrome and Firefox without breaking layout — accepted as progressive enhancement, not polyfilled.

**The Registered-Property Rule.** When a variable axis maps to a registered CSS property, use the property — `font-weight`, `font-style`, `font-stretch`, `font-optical-sizing` — not `font-variation-settings`. Browsers treat `font-variation-settings` as authoritative when both are set, which silently breaks the friendlier CSS. Reserve `font-variation-settings` for custom axes only (none in the chosen pair).

## 4. Elevation

The system is flat by intent. There are no shadows, no glassmorphism, no depth tricks. Hierarchy is carried by typography, whitespace, and the asymmetric grid. Surfaces sit on the paper; the paper sits on nothing. Hover and focus do not lift, glow, or cast shadow.

The one exception to flatness is the cursor afterglow — a soft warm-grey trace that decays in ~600ms, with subtle inertia (lags ~2 frames behind the cursor, drifts ~1px past stop). It politely fades to nothing while hovering body text, returning when the cursor enters whitespace or margin. This is depth-as-presence, not depth-as-elevation.

### Named Rules

**The No-Shadow Rule.** Box shadows are forbidden everywhere. If something needs to read as separate from its surround, use whitespace, a hairline rule (1px on the project spine only), or type-weight contrast.

**The Periphery-Soft Rule (Fog Lifting).** Sections enter via blur-out → blur-in (~6–8px blur at start, 0 at rest). Peripheral content stays slightly soft until the visitor's attention reaches it, focal content is sharp. Cinematic depth-of-field as an information-hierarchy tool — not a literal shadow.

## 5. Components

The system is a small set of composed primitives. There is no card component. There are no tiles. There are no chips. There are no boxes. The primary affordance is text on paper.

### Inline Links

- **Style:** body color, no underline at rest. On hover, an ink-stroke underline draws left-to-right over ~250ms; on un-hover, fades.
- **External links:** materialize a small monospace `↗ domain.com` annotation on hover. Internal links never carry the annotation.
- **Names of people:** subtle variable-font weight increase (400 → 500) on hover, like saying a name when you mean it. The underline still applies.
- **Focus:** same ink-stroke underline appears on `:focus-visible`, plus a 2px paper-cream offset outline on the link's bounding box for keyboard users.

### Buttons

There are no buttons in the conventional sense. Calls to action are inline links or a quiet line at the end of essays (*"This was made by LinCie. Reach out if it speaks to you."* in italic). Where a text-with-arrow affordance is genuinely needed, set it as `→ text` with no border, no background, no padding — just spacing and the inkstroke underline on hover.

### Project Index Bands

- **Layout:** 3–5 projects, each occupying a generous 30–40vh band. Display serif title on the left, monospace meta below (`2024 — Engineering, Research`).
- **Hover:** open whitespace on the right reveals a 30–40% opacity hero image; project title gains the inkstroke underline.
- **Separation:** generous "ma" gaps between bands (a true empty viewport pause, not a 24px margin).

### Project Pages

- **Title echo:** project title FLIP-echoes from the index band into the project page using Astro 5+ View Transitions API (`transition:name` scoped per project slug).
- **Spine:** vertical hairline rule down the left edge with tiny tick marks at section anchors. A small dot travels down the spine to indicate scroll position. The spine IS the in-page navigation; no sticky chrome.
- **Footnotes:** real footnote refs (`[1]`) link to a margin column on desktop, a below-content list on mobile. Click jumps to it; reverse-jump returns. Reverse-scrolling fades footnotes into the margin (the signature move).

### Corner Frame

- **Top-left:** `INDEX` (link home) in monospace.
- **Top-right:** live local time (e.g. `14:32 LOCAL`), updates once per minute.
- **Bottom-left:** current section label, changes by scroll position (`WORK` / `WRITING` / `ABOUT` / `404 — NOT FOUND`).
- **Bottom-right:** folio (`001 / 007`), updates fractionally as the visitor scrolls.
- All in muted monospace at ~30–40% body contrast. Never animating, never bold, just present.
- On viewports below ~768px, drop two of the four (keep TL `INDEX` and BR folio); the other two fold into the footer colophon.

### 404

A single centered serif paragraph: *"This page seems to have been left out of the index. Try…"* with inline links to the main sections. The corner frame reads `404 — NOT FOUND` in the BL section-label slot. No big "404", no humor, no broken-character moment.

### Footer Colophon

Set as a book colophon: type used, year, contact mailto, social as monospace links (`→ github  ↗ twitter  ↗ are.na`). No CTA, no newsletter signup, no sticky chrome. Contact is a mailto link in the colophon and a quiet italic line at the end of essays — nothing else.

### Cursor Afterglow

A faint warm-grey trace that follows the cursor with subtle inertia (lags ~2 frames, drifts ~1px past stop) and decays in ~600ms. Vanishes inside body text and reappears in margin/whitespace. Disabled entirely on `pointer: coarse` and when `prefers-reduced-motion: reduce`. GSAP-driven.

### Page Reveal Sequence

A GSAP timeline that runs once on first paint:

1. Corner labels and structural elements settle in first.
2. Baseline grid faintly visible (~3% opacity) for ~800ms; content settles onto it.
3. Body content fades up.
4. Name materializes last with a font-weight micro-shift (300 → 400), like ink soaking into paper.

Under `prefers-reduced-motion`, the reveal is replaced by an instant paint of the final state — content arrives immediately, no animation. Honest first paint applies either way.

### Page Transitions

Astro View Transitions with cross-fade ~600ms, 8px settle-down on exit and 8px drift-up on enter, folio number updating fractionally during transit. Frame elements use `transition:persist`; only the content area cross-fades. Project title FLIP-echoes via `transition:name` scoped per project slug, never globally.

### Section Pin (Scroll)

Section title pins for ~30vh additional scroll, then releases. Implemented via GSAP ScrollTrigger with `pin: true, pinSpacing: false`. Disabled under `prefers-reduced-motion`.

### Reverse-Scroll Footnote Reveal (Signature)

Scrolling up gently fades footnotes and asides into the margin. Forward scroll = clean reading; reverse scroll = annotated. On the first reverse-scroll of the session on each project page, surface a one-time monospace hint near the spine: *"footnotes reveal as you re-read"* — fades in once, fades out, never repeats. Disabled under `prefers-reduced-motion`; in that mode, footnotes are simply visible at all times.

## 6. Do's and Don'ts

### Do

- **Do** state things as facts. The site speaks the way the maker thinks: low words, high signal.
- **Do** make the empty frame already feel right before any animation lands. If the static page doesn't feel quiet and considered with zero JS, no animation will save it.
- **Do** use OKLCH for all colors with chroma 0.005–0.02 toward the paper hue. Pure greys are forbidden.
- **Do** define animation tokens (`--ease-settle`, `--ease-mark`, `--dur-quick`, `--dur-breath`, `--dur-arrive`) once and source every animation from them. No raw cubic-béziers anywhere except the token file.
- **Do** respect `prefers-reduced-motion` on every animation: cursor afterglow, page reveal, scroll dampening, reverse-scroll footnote reveal, section pin, project spine, time-of-day drift.
- **Do** disable Lenis-style smooth scroll on `pointer: coarse`. Native scroll on mobile, damped on desktop.
- **Do** set `<title>`, `<meta name="description">`, and the first 1–2 lines of body content to state plainly what LinCie does (Honest First Paint Rule).
- **Do** scope Astro View Transitions `transition:name` per route segment + project slug. Two unrelated routes must never share a transition name.
- **Do** preload Newsreader normal latin only, use `font-display: optional`, and let Astro's Fonts API auto-generate the metric-matched Georgia fallback (`size-adjust`, `ascent-override`, `descent-override`) so any FOUT does not shift layout. Italic and Commit Mono load on demand.
- **Do** apply `hanging-punctuation: first` to body and headline blocks.
- **Do** keep body line measure to 65–75ch.
- **Do** present 3–5 projects, each given exhibition-level breath. Not 8–15 lighter ones.
- **Do** apply the One-In-One-Out Rule. Adding a new animated/visual feature requires removing or hiding an existing one.

### Don't

- **Don't** use exclamation points, "passionate about", buzzword lists, or hero claims that announce the maker. (PRODUCT.md anti-reference.)
- **Don't** use em dashes in copy. Commas, colons, semicolons, periods, parentheses; not `--`.
- **Don't** use glassmorphism, gradient meshes, neumorphism, 3D blobs, or neon-on-black. (PRODUCT.md anti-reference.)
- **Don't** use the hero-metric template (big number, small label, supporting stats, gradient accent). (PRODUCT.md anti-reference.)
- **Don't** use equal-tile card grids, dense feature cards, or oversized CTAs. The 2014 SaaS portfolio is forbidden. (PRODUCT.md anti-reference.)
- **Don't** use IBM Plex Mono or Geist Mono as the monospace face. IBM Plex Mono is the trend-saturated default of the 2025 cream-paper editorial portfolio; Geist Mono is its 2025–2026 Vercel-adjacent successor. Both fail the same differentiation filter. Commit Mono is the chosen face. (PRODUCT.md anti-reference.)
- **Don't** use parchment textures, paper grain, deckled edges, fake aging, period-pastiche typography, decorative crop marks, fake stamps, or sectional § marginalia. Modernist atelier, not academic dust. (PRODUCT.md anti-reference.)
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe. (Absolute ban.)
- **Don't** use `background-clip: text` with a gradient. (Absolute ban.)
- **Don't** use box shadows anywhere. Surfaces are flat. (No-Shadow Rule.)
- **Don't** apply a hue to buttons, links, badges, or callouts. There is no accent color. (No-Accent Rule.)
- **Don't** use scroll-jacking, snap scrolling, parallax theater, or sticky navigation chrome.
- **Don't** use slide-in-from-below reveals. Animations breathe; they do not translate. The page reveal uses opacity, blur, and font-weight micro-shifts, not x/y movement (~8px settle/drift on transitions only).
- **Don't** introduce new dependencies. The project ships with Astro, Tailwind CSS, GSAP, ESLint, Prettier, and TypeScript tooling. That is the set.
- **Don't** animate CSS layout properties. Transform and opacity only.
- **Don't** put a contact form on the site. Mailto in the colophon and a quiet italic line at the end of essays — that is the entire contact surface.
- **Don't** add a "Tier 4 bench" idea (cursor crosshair on hover, section-tinted afterglow, loading mark, sticky `↑ index`) without removing or hiding an existing feature in the same change. (One-In-One-Out Rule.)
