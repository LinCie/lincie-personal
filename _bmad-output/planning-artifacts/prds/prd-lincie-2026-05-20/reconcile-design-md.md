# Reconcile: DESIGN.md vs prd.md

## Coverage summary

The PRD is broadly faithful to DESIGN.md. It points at DESIGN.md for the full design system (PRD §11) and reproduces the load-bearing primitives as FRs (Frame, typography pipeline, OKLCH tokens, paper-tone drift, project spine, project bands, drop cap, footnotes, cursor afterglow, reveal sequence, page transitions, hover language, scroll system, section pin, live local time, colophon, 404). The main shortfall is around DESIGN.md's *absolute bans* and a handful of *named rules* that are referenced informally or omitted: a PRD-only reader could ship something that violates them without ever realizing a rule was being broken.

## Gaps (content in DESIGN.md missing or weakened in prd.md, where the PRD-alone reader would need it)

- **No-Shadow Rule (absolute ban on box-shadow) is missing.** DESIGN.md §4 and "Don't" list state box shadows are forbidden everywhere; hierarchy is whitespace, hairline rule, or type-weight contrast. The PRD never names the rule and §11's anti-reference highlights list (glassmorphism, card grids, gradient meshes, neumorphism, slide-in-from-below, scroll-jacking, parchment textures, IBM Plex Mono, Geist Mono, exclamation points, buzzwords, contact form) does not include shadows. A downstream reader writing FRs from the PRD alone could add hover-lift shadows, focus-ring shadows, or "subtle elevation" without flagging the violation.

- **Periphery-Soft Rule (Fog Lifting) is entirely absent from the PRD.** DESIGN.md §4 specifies sections enter via blur-out → blur-in (~6–8px blur at start, 0 at rest) so peripheral content stays slightly soft until attention reaches it. This is a load-bearing motion pattern (cinematic depth-of-field as information hierarchy). The PRD's Reveal & Transition System (FR-18, FR-19) covers first-paint and page transitions but does not specify section-level blur reveal at all.

- **Two absolute bans from DESIGN.md "Don't" list are not carried into the PRD:** (1) no `border-left`/`border-right` greater than 1px as a colored stripe, and (2) no `background-clip: text` with a gradient. Both are concrete CSS-level prohibitions in DESIGN.md. PRD §11 paraphrases the anti-reference list but omits both. A PRD-only implementer could legitimately reach for either pattern (thick accent stripes for section dividers, gradient title text) without knowing they're forbidden.

- **The DESIGN.md "no buttons" rule is implied but never stated.** DESIGN.md §5 Components: "There are no buttons in the conventional sense. Calls to action are inline links or a quiet line at the end of essays… no border, no background, no padding." The PRD has FR-20/FR-21 (inline links, hover language) and FR-15 (colophon mailto) but never bans buttons. The Non-Goals list (§5) bans contact forms, newsletter signup, etc., but not buttons. A downstream reader could add a "Read the project →" button without realizing it violates the component vocabulary.

- **The Drop Cap Rule's implementation ban on `initial-letter` is dropped.** DESIGN.md §3 explicitly forbids `initial-letter` (Chromium support uneven) and mandates a hand-floated pseudo-element computing cap-height from `--baseline` and `--drop-cap-lines`. The PRD glossary mentions "hand-floated pseudo-element, cap-height = 3 × baseline" but loses the explicit ban and the rationale, plus the heavier weight target (~600) and the registered-property mechanism. A PRD-only reader could implement with `initial-letter` and miss the cross-browser failure mode.

## Contradictions (if any)

- None identified. The PRD is faithful to DESIGN.md where it covers the same ground; the issues above are omissions and weakening, not contradictions.

## Notes

- The PRD does state in §11 that "the full design system lives in DESIGN.md" and points readers there, so by design these gaps are recoverable if downstream artifacts read both documents. The risk is downstream artifacts (UX spec, architecture, epics) that pick up the PRD as the canonical handoff and skip DESIGN.md, since the PRD is structured to look complete on its own (Glossary, FRs, NFRs, MVP scope, IA).
- Several DESIGN.md named rules are *referenced* in PRD glossary or FRs without being *named* (Bach Rule appears once in the optical-size glossary entry; Registered-Property Rule is encoded as an FR-5 consequence without the name; No-Accent Rule is described in FR-7 / §11 without the rule label). This is acceptable for a PRD that points at DESIGN.md, but consider one consolidated "Named Design Rules — see DESIGN.md" cross-reference list in §11 so a PRD-only reader at least knows the inventory exists.
- DESIGN.md's typographic hierarchy ratios (Display 2× body, Title ~1.4× body, etc.) are not in the PRD. This is correctly delegated to DESIGN.md and is not a gap.
- DESIGN.md's animation token names (`--ease-settle`, `--ease-mark`, `--dur-quick`, `--dur-breath`, `--dur-arrive`) appear in PRD §10 NFRs. Good coverage.
