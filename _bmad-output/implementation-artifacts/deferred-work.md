# Deferred Work

## Deferred from: code review of 1-2-typography-pipeline-fonts-fallback-and-optical-sizing (2026-05-22)

- Tailwind 4's `--default-font-family` resolves to `var(--font-sans)` (system sans stack) on `html`. The `body` rule in `typography.css` correctly overrides to `var(--font-serif)` for all page content. Elements outside `body` (browser extensions, Astro dev toolbar) inherit sans. Pre-existing Tailwind 4 behavior, not actionable now.

## Deferred from: code review of 1-3-content-collections-projects-and-writing-schemas (2026-05-22)

- `date` field accepts any string — no format enforcement. Architecture spec chose `z.string()` for dates; a regex like `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` would catch malformed dates at build time. Consider adding when date parsing is introduced in a future story.
- `order` allows negatives, floats, and duplicates. `z.number().int().positive()` would tighten this. Duplicate order values produce non-deterministic sort for tied entries. Enforce at query time or add uniqueness validation when index pages are built.
- `disciplines` allows empty array. `z.array(z.string()).nonempty()` would catch empty arrays at build time. Low risk until a consumer renders `disciplines[0]`.
- `title`/`description` accept empty strings. `z.string().min(1)` would prevent blank meta fields. Low risk until page templates are built.
- `glob("**/*.md")` ingests stray files (README.md, _draft.md, etc.). Consider an ignore pattern or naming convention enforcement when the content directory grows.
- No `slug` override field in schema. File renames silently break URLs. Consider adding `slug: z.string().optional()` when permalink stability becomes a concern.

## Deferred from: code review of 1-4-baselayout-with-frame-and-accessibility-scaffold (2026-05-22)

- `001 / 001` folio is hardcoded in Frame.astro BR corner. Story 5.3 (scroll-driven folio) will replace this with a dynamic value.
- `aria-current` on the INDEX link never updates on View Transition navigation because `transition:persist` keeps the Frame alive. Story 3.4 handles post-swap updates via the `astro:after-swap` event.
- BL and BR spans have no `max-w` or `truncate` guard. A long `sectionLabel` at the md breakpoint (768px) could cause the two bottom corners to collide. Current sectionLabel values (`WORK`, `WRITING`, `404 — NOT FOUND`) are short enough to be safe. Revisit when Story 2.x or 3.4 introduces dynamic labels.
- No `env(safe-area-inset-*)` padding on any corner position. Notched iOS devices (iPhone X+) may clip the INDEX nav link and corner labels behind the device chrome. Not in story scope; address in a polish pass.
- XSS risk if `sectionLabel` is ever rendered via `set:html` instead of `{sectionLabel}`. Astro auto-escapes template expressions, so this is safe as written. Do not change to `set:html` without sanitization.

## Deferred from: code review of 1-6-colophon-and-404-page (2026-05-22)

- Recovery links in `404.astro` point to `/projects/building-lincie` and `/writing/craft-as-proof` — routes that don't exist yet. These are the correct MVP targets per spec (FR-14); the pages are created in Epic 2. Until then, both links will 404. No change needed; revisit when Epic 2 stories are complete.
- HTTP 404 status code in static output mode: Astro generates `dist/404.html`; whether the server responds with HTTP 404 depends on the hosting platform. Vercel handles this automatically by convention. Confirm before launch; add a `vercel.json` routes entry if needed.
- `border-hairline` Tailwind token in `Colophon.astro` requires `@theme inline` in `global.css`. If `inline` is ever removed during a refactor, the border silently disappears. Pre-existing; not introduced by this story.

## Deferred from: code review of 1-7-seo-meta-and-build-validation (2026-05-22)

- `Astro.site` not set in `astro.config.mjs` — the hardcoded fallback `"https://lincie.me"` is always active (not just in dev). Story Dev Notes acknowledge this as acceptable at MVP. Consider adding `site: "https://lincie.me"` to `astro.config.mjs` for correctness.
- Non-HTTPS or `data:` absolute `ogImage` values bypass base URL resolution — `new URL()` ignores the base for absolute inputs. No current caller passes non-HTTPS values; future-caller concern when per-page OG images are introduced in v1.1.
- Missing `og:url` tag — requires per-page canonical URL resolution, explicitly excluded from scope in Dev Notes. Revisit when canonical URL strategy is defined.
- `og:type` hardcoded to `"website"` for all pages — article/blog pages (Epic 2) will need `"article"` type. Revisit when essay/project page templates are built.
- `robots.txt` missing `Sitemap:` directive — no sitemap at MVP. Add when `@astrojs/sitemap` is introduced.

## Deferred from: code review of 2-1-project-page-template-with-drop-cap-and-spine-structure (2026-05-22)

- Spine tick positions are index-distributed, not heading-position-matched — even distribution is correct for this story per dev notes; Story 5.3 replaces with scroll-driven positions.
- `--baseline: 28px` is absolute — drop cap doesn't scale with user font-size preference. Pre-existing token architecture decision; not actionable in this story.
- Drop cap fires on first-letters that are punctuation, numbers, or whitespace — content authoring concern; acceptable for now. Can be addressed with a content convention or CSS workaround in a future story.
- `1fr` third column (margin/footnote column) has no max-width — intentional per architecture; Story 2.3 will define column content and may constrain it.

## Deferred from: code review of 2-2-essay-page-template-with-italic-closing-line (2026-05-22)

- `[&_p]:mb-7` on the prose wrapper applies to every `<p>` inside the div, including paragraphs inside the `<section data-footnotes>` block rendered by remark for `[^1]` syntax. Footnote list items get 28px bottom margin. Pre-existing pattern (same as project page); Story 2.3 owns all footnote styling and will address this.
- Drop cap silently absent if an essay's first rendered element is not a `<p>` (e.g. starts with `<h2>`, blockquote, or list). Content authoring constraint; same pre-existing limitation as project page. Document as a content convention or address with a CSS workaround in a future story.
- `aria-hidden="true"` is hardcoded on the margin `<aside>`. Story 2.3 must remove this attribute when it injects footnote content into the aside, or screen readers will not announce the footnotes. Add a TODO comment in Story 2.3's task list.

## Deferred from: code review of 2-3-footnote-rendering-and-bidirectional-navigation (2026-05-22)

- `opacity: 0` on `#footnote-margin` with no fallback — footnotes are permanently invisible to sighted desktop users until Story 4.4 ships the reverse-scroll reveal. Intentional design decision documented in spec. Story 4.4 owns the reveal animation.
- Desktop→mobile resize leaves footnotes invisible — the DOM-move approach moves `<li>` items at page-load time. A subsequent resize to mobile leaves the margin column hidden and the original `section[data-footnotes]` empty. Accepted as a known limitation of the DOM-move architecture; page reload restores correct state. Revisit if resize support becomes a requirement.
- Footnote vertical alignment is approximate — `padding-top: calc(var(--baseline) * 4)` aligns the container, not individual footnotes. Per-footnote positioning (aligning each footnote next to its reference in the body) deferred to Story 4.4 (GSAP ScrollTrigger).

## Deferred from: code review of 2-4-inlinelink-component-base-styling-and-external-annotations (2026-05-22)

- `font-weight` hover on `span.name`/`cite` causes horizontal layout shift — heavier weight is wider, causing surrounding text to reflow on hover. Pre-existing design decision (architecture mandates `font-weight` for the `wght` axis); Story 3.5 adds transitions which will smooth the shift on variable fonts. Acceptable as interim state.

## Deferred from: code review of 2-5-project-index-bands-structure-and-static-layout (2026-05-22)

- `date.slice(0, 4)` on unvalidated string in `ProjectBand.astro` — schema enforces `z.string()` only; a malformed date would silently truncate the year display. Pre-existing pattern, same issue in `[...slug].astro`. Fix: tighten schema to `z.string().regex(/^\d{4}/)` or validate at render time.
- Empty projects array — `/projects` index renders blank content area with no visitor feedback. Acceptable for now since home page prevents linking to `/projects` when `projects.length < 3`. Fix: add an empty-state message or redirect when `projects.length === 0`.
- `entry.id` as slug may contain path separators if nested content files are added — would produce 404 and invalid `transition:name`. Pre-existing pattern in `index.astro` and `[...slug].astro`. Fix: sanitize `entry.id` or enforce flat content directory structure in schema/docs.
- `order` NaN risk if schema relaxes `order` to optional — `a.data.order - b.data.order` with NaN produces non-deterministic sort. Pre-existing sort pattern. Fix: add `.default(999)` to `order` schema or guard with `?? 999` in sort comparator.

## Deferred from: code review of 3-1-gsap-initialization-and-lifecycle-pattern (2026-05-22)

- Duplicate `visibilitychange` listeners if module re-executes — Vite module deduplication guarantees single execution per session, so this is not a current defect. Revisit if module loading strategy changes in Epic 4/5.
- Unconditional `globalTimeline.resume()` could override intentional external pauses — no competing pause logic exists in current scope. Revisit when Epic 4/5 introduce scroll-damping or section-pin pause logic that may need to pause the timeline independently.
- `gsap.globalTimeline` is typed in `gsap-core.d.ts:209` and stable across GSAP 3.x but is not part of GSAP's advertised public API surface. Verify on any GSAP major version bump.

## Deferred from: code review of 3-5-inkstroke-underline-animation-and-hover-affordances (2026-05-23)

- Hardcoded `250ms` duration literal in multiple transition declarations across `InlineLink.astro` and `ProjectBand.astro`. No CSS custom property exists for this value (falls between `--dur-quick` 150ms and `--dur-breath` 400ms). Spec explicitly documents this as intentional with a future token pass planned to introduce `--dur-mark`. Revisit when the token pass is scheduled.

## Deferred from: code review of 4-2-section-pin-on-long-form-pages (2026-05-23)

- One-shot viewport gate — `window.innerWidth < 768` evaluated once at init; resize/rotation after load leaves pin state stale. Spec explicitly notes "Acceptable for MVP — the site is not designed for live resizing."
- `ScrollTrigger.refresh()` called before `astro:page-load` — footnote DOM move (via `FootnoteReveal.astro`) happens on `astro:page-load`, after `astro:after-swap`. Spec Dev Notes confirm this is safe: footnote move affects the margin column height, not the content column where `<h2>` elements live. No additional refresh needed.

## Deferred from: code review of 4-3-fog-lifting-section-reveal (2026-05-23)

- Layout thrash from `getBoundingClientRect` in forEach loop in `initFogLifting()` — each element triggers a forced layout reflow. Pre-existing pattern in the codebase (section pin does the same). Not introduced by this story; acceptable for MVP content volumes.
- Mutable module-level `foggedElements[]` accumulates across re-inits if `init()` fires without a preceding `cleanup()`. Pre-existing pattern; Astro lifecycle guarantees `astro:before-swap` (cleanup) fires before `astro:after-swap` (init).
- `REDUCED_MOTION` evaluated once at module load — if the user changes their OS reduced-motion preference mid-session, the gate does not re-evaluate. Pre-existing pattern; consistent with rest of codebase.

## Deferred from: code review of 4-4-reverse-scroll-footnote-reveal-with-hint (2026-05-23)

- `showHint()` called every reverse-scroll frame — `sessionStorage` guard makes this functionally correct, but the function is invoked on every `onUpdate` frame where velocity < 0 rather than only on the first. A `let hintShown = false` flag in `init()` scope would eliminate the per-frame call overhead. Minor inefficiency; not a correctness bug.
- Aborted View Transition leaves footnotes hidden — if `astro:before-swap` fires (cleanup runs) but `astro:after-swap` never fires (aborted transition), `init()` never runs and footnotes stay hidden until full reload. Pre-existing pattern across all scripts (`scroll.ts`, `cursor.ts`, etc.); not introduced by this story.

## Deferred from: code review of 5-2-live-local-time-in-tr-corner (2026-05-23)

- BR folio span (`Frame.astro`) has `data-reveal="corner"` — contradicts spec documentation which states the BR folio should NOT have this attribute (always visible, intentional asymmetry). Means folio starts at opacity 0 and is revealed by reveal.ts rather than being always visible. Pre-existing issue, not introduced by story 5.2. Address when Frame.astro is next touched (likely story 5.3 or 5.4).

## Deferred from: code review of 5-3-scroll-driven-folio-and-project-spine-indicator (2026-05-23)

- Spine dot ScrollTrigger fires on mobile scroll for a CSS-hidden element — `initSpineDot()` finds `[data-spine="dot"]` via `querySelector` even when the parent container is `hidden md:block`. The trigger runs on every mobile scroll tick updating a `display:none` element. Harmless but wasteful. Pre-existing pattern (dot is hidden via CSS, not absent from DOM on mobile). Revisit if mobile scroll performance becomes a concern.
