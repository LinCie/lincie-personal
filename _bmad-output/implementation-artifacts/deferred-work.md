# Deferred Work

## Deferred from: code review of 1-2-typography-pipeline-fonts-fallback-and-optical-sizing (2026-05-22)

- Tailwind 4's `--default-font-family` resolves to `var(--font-sans)` (system sans stack) on `html`. The `body` rule in `typography.css` correctly overrides to `var(--font-serif)` for all page content. Elements outside `body` (browser extensions, Astro dev toolbar) inherit sans. Pre-existing Tailwind 4 behavior, not actionable now.
