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
