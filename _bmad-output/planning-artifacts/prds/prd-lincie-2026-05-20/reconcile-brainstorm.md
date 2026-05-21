# Reconcile: brainstorming-session vs prd.md

## Coverage summary

The PRD lands the locked direction ("The Quiet Atelier with a warm trace"), the signature move (reverse-scroll footnote reveal as FR-12), the Tier 1/2/3 build plan (§6.1), and most Tier 4 bench items (§6.2). Three of the four highest-stakes mitigations (#1 animation tokens, #7b honest first paint, #11 one-in-one-out) are encoded in NFRs/§6.2/§14. The notable shortfall is on Fail #13 — explicitly punted out of the PRD ("addressed privately… not baked into the PRD") despite being flagged as a top-stakes protection — plus a handful of specific mitigations that are weaker or missing in the PRD than in the brainstorm.

## Gaps (content in brainstorm missing or weakened in prd.md)

- **Fail #13 hard-stop on iteration is excluded from the PRD.** Brainstorm marks this as one of the four highest-stakes mitigations and proposes a concrete floor: *"Tier 1 + Tier 2 ships in N weeks. Tier 3 ships when 2 essays + 2 project pages are live. After that, no design changes for 90 days; only content."* (brainstorm §"Drift Failures" → Fail #13; reinforced under "Highest-Stakes Mitigations to Adopt First"). PRD §14 acknowledges the risk but says it is *"addressed privately (N = 1 week for Tier 1 + Tier 2; not baked into the PRD)."* Downstream sprint planning has nothing to anchor scope freezes or the 2-essays-+-2-projects gate. Recommend lifting at least the Tier 3 promotion gate and the 90-day no-design-change rule into §6 or a new §14 risk row.

- **Fail #9 contact-visibility mitigation is dropped.** Brainstorm prescribes a fallback if the colophon mailto is too quiet: *"Add a small `Contact` link to the corner labels or as the bottom-most page section that scrolls quietly to the colophon. Quiet, but present."* (brainstorm Fail #9). PRD FR-15 ships only the colophon mailto + the italic essay closer, and §12 explicitly disallows any extra nav surface. There is no encoded fallback if SM-1 ("inbound email referencing specific work") underperforms. Recommend documenting the fallback as a deferred/v1.1 affordance in §14 risks rather than letting it disappear.

- **Fail #6 `font-display: optional` directive is missing from FR-4.** Brainstorm is explicit: *"Use `font-display: optional` for body (not `swap`)"* alongside the preload and metric-matching steps (brainstorm Fail #6). PRD FR-4 covers the metric-matched Georgia fallback, preload of Newsreader normal, and CLS = 0, but never specifies `font-display`. Architecture/dev will guess between `swap` (Astro Fonts default) and `optional`; the brainstorm's explicit choice should not be lost. Recommend amending FR-4 consequences to require `font-display: optional` on the body face.

- **Fail #5(b) "footnote in the first paragraph" content rule is absent.** Brainstorm pairs the one-time monospace hint with a second device: *"Place a footnote reference in the first paragraph of each essay so a curious visitor naturally wants to find it on re-read"* (brainstorm Fail #5). PRD FR-12 captures only the hint (a). FR-13 and §11 say nothing about footnote placement discipline. The signature move's discoverability halves without (b). Recommend adding to FR-13 (essay structure) or §11 (voice rules) as a content-template requirement.

- **Fail #12 voice steering artifact is not required by the PRD.** Brainstorm specifies *"One-page style guide in `.kiro/steering/voice.md` (or equivalent). In-voice and out-of-voice phrasing examples."* (brainstorm Fail #12). PRD §11 inlines a short list of voice rules but never asks for the comparative in-voice/out-of-voice examples or a maintained steering file. Without it, voice drift over time has no review surface. Recommend either adding a §11 directive to maintain a voice file or referencing a future `voice.md` as a v1.1 deliverable.

- **Tier 4 bench item H5 (strict no-buttons rule) is omitted from §6.2.** Brainstorm's bench explicitly carries *"H5 buttons don't exist (soft rule: default to inline links, allow plain text-with-arrow when truly necessary)"*. PRD §6.2 lists the other six bench items but drops H5. Minor, but the One-In-One-Out ledger needs the full bench to function. Recommend adding H5 to the §6.2 bench list.

## Contradictions (if any)

- None outright. The brainstorm's Tier 1 typeface candidates included IBM Plex Mono; the PRD bans it. This is not a contradiction — the typography research doc supersedes the brainstorm's candidate list with Newsreader + Commit Mono, and the PRD correctly follows the research doc.

## Notes

- Analogy A5 ("Fog Lifting" — sections enter via blur-out → blur-in, periphery soft / focus sharp) is not encoded in FR-18's reveal sequence or anywhere else. Likely intended for DESIGN.md, but worth confirming because it is a motion-grammar decision a downstream UX/architecture reader could miss.
- Analogy A2 ("the site disappears / anti-museum") and Value #2 ("Craft as Proof") are not named in the PRD. They are voice-level, so DESIGN.md is the right home; flag here only so they aren't lost in the chain.
- The "Top Priorities (This Week)" entries are mostly absorbed: typeface (already locked via the research doc), empty frame (FR-1, FR-2), one project page first (§6.1 MVP), and Tier 2 in one focused pass with shared easing tokens (§10 NFR + Fail #1 mitigation). No gap.
- Tier 4 bench items are otherwise preserved in §6.2 with the correct One-In-One-Out framing — only H5 is missing per the gap above.
