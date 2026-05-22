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
