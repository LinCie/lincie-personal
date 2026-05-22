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
