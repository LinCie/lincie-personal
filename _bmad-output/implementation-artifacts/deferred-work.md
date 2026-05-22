# Deferred Work

## Deferred from: code review of 1-1-css-token-layer-and-tailwind-theme-integration (2026-05-22)

- `scroll-behavior: auto !important` missing from reduced-motion block — no scroll behavior exists in Story 1.1; actionable in Story 1.4+ when scroll is introduced.
- `0.01ms` duration still fires `animationend`/`transitionend` events — future GSAP sequencing in Epic 3+ may rely on these events and fire prematurely; actionable in Story 3.1.
- GSAP bypasses CSS reduced-motion safety net — GSAP reads duration tokens via `getComputedStyle()` and is unaffected by `!important` CSS overrides; requires explicit `gsap.globalTimeline.timeScale(0)` or `matchMedia` guard; actionable in Story 3.1.
- OKLCH browser floor — no sRGB fallback; accepted as a known constraint (Chrome 111+, Firefox 113+, Safari 15.4+). Document in Story 1.7 (SEO/build validation).
