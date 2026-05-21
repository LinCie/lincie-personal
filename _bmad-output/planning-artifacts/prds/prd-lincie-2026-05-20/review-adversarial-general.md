---
title: Adversarial Review — PRD lincie 2026-05-20
status: review
created: 2026-05-20
reviewer: skeptical-collaborator
---

# Adversarial Review: PRD lincie

This review is hostile by design. It is written for the maker who is also the PM, designer, and dev, and who is therefore the only person in the room who will catch his own taste leaking into the contract document. The PRD is well-written and well-structured. That is part of the problem: it is *too* well-written, in a way that is doing rhetorical work that should be done by engineering specificity.

## Verdict

The PRD reads like a manifesto with FRs bolted on. The aesthetic vocabulary is doing identity work that the FRs are not, the user journeys are written for a hallucinated ideal reader rather than a hostile one, and at least four internal contradictions need resolving before UX/architecture/epics can take a clean handoff. Tier 3 in MVP scope vs the Tier 3 promotion gate is the loudest one. The "Honest first paint" rule and `font-display: optional` cannot both be true. The signature move is invisible to the primary persona on the primary device. Fix the contradictions and tighten the testable FRs; the rest is style polish for v1.1.

---

## Findings

### Internal contradictions (the document fights itself)

- **[critical]** Tier 3 is in MVP scope and gated against MVP simultaneously (§6.1 vs §14.2) — §6.1 In Scope lists Tier 3 polish (reverse-scroll footnotes, section pin, project spine, paper-tone drift, live local time) as MVP. §14.2 says Tier 3 ships only when ≥ 2 essays and ≥ 2 project pages are live. MVP has 1 essay and 1 project. Either Tier 3 is not in MVP, or the promotion gate is theatre. Pick one. *Fix:* downgrade Tier 3 to "feature-flagged in MVP, content-gated activation," or move Tier 3 out of MVP entirely. State the choice explicitly so UX/architecture knows whether to design the activation gate or skip it.

- **[critical]** "Honest first paint" contradicts `font-display: optional` (FR-3 vs FR-4) — FR-3 says LCP "includes Newsreader-rendered text within the standard CRP budget." FR-4 says Newsreader normal latin uses `font-display: optional`, which by spec causes the browser to use the fallback if the font is not in the cache by ~100ms. On a cold visit, the first paint *will* be metric-matched Georgia, not Newsreader. So FR-3's LCP claim is false on first visits, which is exactly when recruiters land. *Fix:* state honestly that first paint is on Georgia for cold loads and that Newsreader arrives swap-free on warm loads. Move the "Newsreader at LCP" claim to a warm-cache assertion or drop it.

- **[critical]** UJ-1 contradicts MVP scope — Aiya "taps the strongest-named project" from "a list of three named projects." MVP has one project, and §6.1 says the home page links directly to the single project (no list). Either the UJ is for the post-MVP site, or it is for the MVP and the home page does have a list. The PRD ships with the wrong UJ for what the maker is actually building. *Fix:* write the UJ for the actual MVP (1 project, 1 essay, list-of-one is just a link). Add a separate v1.1 journey for the 3+ project state. Right now downstream UX will design for the wrong inventory.

- **[high]** UJ-3 edge case directly contradicts FR-13 — UJ-3 says "if footnotes are missing, the reverse-scroll reveal has nothing to reveal — that's acceptable." FR-13 says "every essay places at least one footnote reference in the first paragraph or the first short section." Pick one. The FR-13 rule is stronger and is also content discipline rather than something the build can enforce. *Fix:* either keep FR-13 as a soft authoring guideline (and admit it isn't testable at build time), or enforce it and remove the UJ-3 edge case.

- **[high]** "First paint fully styled before any animation" contradicts the reveal sequence (FR-3 vs FR-18) — FR-3 Honest First Paint says the first viewport is "fully styled, on-brand, and contains enough copy for a fast scanner to know what LinCie does" before any animation runs. FR-18 says step 3 of the reveal is "body content fades up." If body content fades up, it isn't visible at first paint. The two FRs use "first paint" to mean different things and the contract is broken at the seam. *Fix:* define "first paint" as "the painted state before any client-side animation begins, with body opacity at 100%." Move the body fade-up out of the reveal sequence, or replace it with a font-weight micro-shift on already-visible text.

- **[high]** Section labels for IA are inconsistent (Glossary vs §12 vs UJ text) — §3 Glossary calls the BL slot "section label." FR-2 enumerates section labels as `WORK` on project pages, `WRITING` on essay pages, `ABOUT` on a colophon scroll position, blank on home. §12 IA shows no `/about` route — the colophon is the footer at MVP. So the BL `ABOUT` label fires when, on what scroll position, on which route? *Fix:* list the exact route → BL label mapping for MVP only. Drop `ABOUT` until a colophon route exists.

### Taste-language substituting for engineering

- **[high]** "Modernist atelier with a warm trace," "Bach Rule," "Quiet Confidence," "calm tea-room not museum lobby," "Ozu film grammar" — these phrases are doing heavy lifting in §1, §11, and the Glossary. They are unfalsifiable. The FRs already specify the behaviors that constitute the aesthetic; the prose around them is rhetorical decoration that downstream UX/architecture cannot test against. A skeptical UX designer reads "modernist atelier, not academic dust" and asks: what test fails the design? There is none. *Fix:* the named rules in §11.6 are good (they have referenced definitions in DESIGN.md). The mood-language in §1 and §11.4 is for the maker, not the UX agent. Keep §1's first paragraph; cut the mood references from sections that downstream artifacts will treat as constraints. Or: make every aesthetic phrase point to a specific FR.

- **[high]** The brand identity is defined mostly by negation — §11.5 anti-references is long and specific; §11.7 CSS bans is long and specific; §5 Non-Goals is long and specific. The positive identity is the brand triad "considered, disciplined, warm" plus five named principles. A hostile recruiter reads the site and asks "what is this?" and the answer is mostly "not those other things." This is the maker articulating preference under the heading of identity. *Fix:* explore. Add 2-3 sentences in §1 that state, positively, what the site *is* without negation, without anti-references, without "not the museum lobby." If you can't, the identity is genuinely defined by absence and downstream UX will struggle to find a positive design target.

- **[medium]** "The visitor leaves feeling settled without knowing why" (§1) — taste claim with no test, no metric, no proxy. It is also slightly self-congratulatory: the maker is asserting an emotional outcome on the visitor's behalf. *Fix:* drop, or replace with an observable proxy. SM-1 already covers the actionable form of this.

- **[medium]** "Three to five projects are presented with exhibition-level breath" (§1) vs MVP of 1 project — the vision is post-MVP and the PRD does not separate vision from MVP delivery. The maker has written a vision statement that will not be true on launch day. *Fix:* split §1 into "v1 (launch)" and "v1.x (steady state)" or annotate the vision as forward-looking. The current text invites a recruiter at launch to wonder where the other two-to-four projects are.

### What looks rigorous but isn't

- **[high]** FR-5, FR-7 are codebase-style policies, not functional requirements — "A grep of the codebase for `font-variation-settings` returns no matches" and "the compiled CSS contains no `#` hex colors." These are lint rules. They do not describe user-facing behavior. They cannot fail in a way the visitor notices. *Fix:* move them to §10 NFRs as "engineering discipline" or to a separate `code-discipline.md`. FRs should describe what the site does or does not do for the visitor, not what the source looks like.

- **[high]** FR-19 "the same `transition:name` value is never used on two unrelated routes" is not testable — proving absence of a class of mistake across the codebase requires a custom lint or a manual audit. The PRD asserts this as a consequence without specifying who/how/when. *Fix:* either write the lint and reference it, or admit this is a developer convention.

- **[high]** SM-1 is unfalsifiable in practice — "at least one inbound email from a recruiter or collaborator references something specific from a project page or essay" within 90 days. n = 1 over 90 days. Any inbound email that mentions a project name passes. There is no way to know whether the FR-3, FR-11, FR-13 chain is *causing* the email or whether the email would have arrived anyway. The metric does not validate the FRs it claims to validate. *Fix:* either accept that this is a personal site with no real success metric and say so, or define a more discriminating signal (e.g., outbound resume contained URL, response cited X). Better: drop the FR-validation claim from the metric; let SM-1 stand as a directional signal only.

- **[high]** §14.1 contact-visibility mitigation trigger is unfalsifiable — "if SM-1 underperforms at the 90-day mark, surface a small Contact link." If zero relevant emails arrive at 90 days, the cause could be (a) site too quiet, (b) audience too small, (c) audience is the wrong one, (d) recruiters are emailing without referencing specifics. The mitigation triggers on (a) but cannot distinguish from (b)(c)(d). *Fix:* either set a more specific trigger or accept that the mitigation is judgement-based and remove the metric framing.

- **[medium]** SM-3 (Lighthouse ≥ 95 on every page) has no cadence, no owner, no automation — the site has no analytics by policy (§5). Who runs Lighthouse, when, on what hardware? CI? Local dev? Manual once a quarter? Without specifying, the metric is decorative. *Fix:* add a CI step or a documented manual cadence (pre-deploy, or weekly).

- **[medium]** SM-2 "Builder weekly publishing — at least one new essay or project page per month for the first three months" — the failure mode is unclear. If LinCie publishes nothing in month 2, what happens? Tier 4 deferred? Site reframed? The metric has no consequence. *Fix:* specify the consequence or downgrade to a personal commitment that does not belong in the PRD.

- **[medium]** Cross-cutting NFRs are wishes without budgets — "Performance ≥ 95," "CLS = 0," "no render-blocking JS," "page total under ~250 KB." But §4 specifies five-plus client-side subsystems (cursor afterglow ticker, paper-tone drift, live local time setInterval, GSAP reveal, View Transitions, ScrollTrigger pins, fog-lifting blur, reverse-scroll footnote tracking, possibly Lenis). A solo perfectionist will under-estimate cumulative JS cost. There is no JS budget in KB or in INP. *Fix:* set a JS budget (e.g., ≤ 60 KB gzip total client JS for MVP), an INP budget (≤ 200ms), a font budget already set; and verify each subsystem against the budget in architecture.

- **[medium]** "WCAG 2.2 AA contrast at every paper-tone band" (NFR Accessibility, FR-8) contradicts FR-2 corner labels at "30–40% body-ink contrast" — corner labels are 0.75rem monospace, which is small text (must hit ≥ 4.5:1, not 3:1). 30-40% body-ink against paper is unlikely to clear 4.5:1, especially in the dusk and night bands. Either the labels fail AA or they aren't 30-40% body-ink contrast. The PRD asserts both. *Fix:* compute the four bands' actual contrast ratios at the 30-40% body-ink target and either revise the contrast spec, exempt corner labels with a documented decision, or change the AA assertion to "AA where applicable, with a documented exception for the corner labels at AA-large or AAA-decorative."

### Unstated assumptions that could blow the project up

- **[critical]** The signature move is invisible to the primary persona on the primary device — UJ-1 Aiya is a recruiter on mobile (`pointer: coarse`). FR-12 says reverse-scroll footnote reveal is disabled on `pointer: coarse` (footnotes appear in below-content list immediately). FR-17 says cursor afterglow is disabled on `pointer: coarse`. So the two features the PRD names as the differentiators (the "warm trace" and the "signature move") are both invisible to the primary persona on the primary device. The site that recruiters actually see is a quiet typography-and-frame portfolio without the signature. The PRD does not address this honestly. *Fix:* either accept that mobile recruiters see a different site (and articulate what that site is and why it's still strong), or design a mobile-class equivalent of the signature move. Don't pretend the signature exists for everyone.

- **[high]** The signature move is also invisible to forward-only scrollers — FR-12 reveals footnotes only on reverse scroll. The one-time monospace hint *"footnotes reveal as you re-read"* fires on the first reverse-scroll. A recruiter who scrolls forward only and bounces never triggers the hint and never knows the feature exists. The "patient pacing" thesis assumes re-reading; recruiters do not re-read. *Fix:* this is a real design choice. Either accept the cost (the signature is for the second-time visitor, not the first) and state it, or seed footnotes inline with subtle marginalia visible on first read.

- **[high]** "Recruiters and collaborators" as a unified primary persona is wrong — recruiters skim, decide in seconds, do not re-read. Collaborators read, take time, return. UJ-1 and UJ-2 describe opposing reading patterns. The site is currently optimized for collaborators (slow burn, signature on second read, drop caps, pinned sections, fog-lifting blur). The recruiter pattern is sustained only by FR-3 Honest First Paint, which is one FR against many. *Fix:* declare which persona the design is *primarily* for. The current PRD calls both primary and the resulting design favors collaborators. Be honest about that, or rebalance toward the recruiter.

- **[high]** Lenis dependency is unresolved and blocks Tier 2 (§8 Q2) — AGENTS.md prohibits new dependencies without explicit approval. FR-23 says "Lenis is loaded as a peer of GSAP (already in the dependency set; no new dependency)" but Lenis is not currently in `package.json` (verifiable). The escape hatch is `ScrollTrigger.normalizeScroll` but that doesn't give the same `lerp` curve. This is a Tier 2 blocker. *Fix:* resolve before architecture phase. Decide: Lenis (and add to deps with explicit approval), or `ScrollTrigger.normalizeScroll` (and accept the different feel), or no smooth scroll at all (native everywhere).

- **[high]** Privacy claim oversells — "no IP logging beyond what Vercel does at the edge" (§10). Vercel logs IPs by default for analytics, edge logs, and security. Saying "privacy-respectful by absence" while running on a platform that logs IPs is a hedge the PRD does not surface clearly. *Fix:* state directly: "Vercel logs request IPs; the site itself sets no cookies and runs no analytics. If stronger privacy is required, evaluate self-hosting."

- **[high]** `contact@lincie.me` email is aspirational — the PRD references this address in FR-13, FR-15, and the colophon, but does not specify mail provider, MX setup, or who manages the inbox. Launching with a dead mailto is a launch blocker. *Fix:* confirm the address routes to a real inbox before MVP. Add to §8 Open Questions if not.

- **[medium]** Per-page monthly publishing assumes IA scales, but IA gates on 3-essay and 3-project floors — SM-2 requires monthly publishing. Until 3 essays exist, the home page links directly to the single essay (FR-9). What does the home page do at 2 essays? Pick one to feature? Link both? Render a tiny list that isn't the writing index? The PRD does not say. *Fix:* specify the home-page state at 2 of 3 in the floor (essay count = 0, 1, 2, ≥ 3). Same for projects.

- **[medium]** The setInterval in FR-25 (live local time) and the cursor ticker in FR-16 are unbounded — over a multi-hour session, no cleanup, no visibility check. `document.hidden` is not referenced. *Fix:* clear interval on `visibilitychange: hidden`, restart on visible. Same for the cursor ticker.

- **[medium]** Per-page OG image deferred to v1.1 hurts UJ-2 (essay link in DM) — Riza receives an essay link in a DM. The OG preview is the static fallback, not the essay. The shareability of essays is the primary virality vector for a writing-led site. *Fix:* generate a per-page OG at build for essays at MVP. Astro can do this without runtime services.

- **[medium]** `prefers-reduced-data: reduce` honoring (FR-17) is flagged "optional courtesy" — Safari does not implement this media query at all. Chromium dropped it years ago. The flag exists almost nowhere in production. Honoring it is theatre. *Fix:* drop. Or commit fully and accept it never fires.

### Authoring/maker voice leaking into PM voice

- **[high]** §6.2 note for PM: *"these items are emotionally load-bearing for an obsessive perfectionist. Revisit only when adding a Tier 4 idea earns a removal of an existing feature."* — this is the maker speaking to the maker as if writing self-instructions. It is also disclosing perfectionism as a constraint that needs managing in the PRD. Good content for a journal; not content for a contract document downstream agents will read. *Fix:* move to the decision log. Keep the One-In-One-Out rule itself; drop the editorial about why it exists.

- **[medium]** §11.4 visual references read as the maker's mood board, not engineering constraints — "Calm tea-room (one element per viewport, deliberate focus, generous empty space, base state utterly still). Explicitly **not** a museum lobby that shows off its own architecture." UX agents cannot test "tea-room vs museum lobby." *Fix:* convert to operational rules ("max one display-size element per viewport," "no sticky chrome that calls attention to itself"). The named rules in §11.6 do this; §11.4 does not.

- **[medium]** PRD body uses em dashes throughout while §11.8 voice rules ban them in copy — distinguish PRD-prose vs site-copy if both rules are intentional. The PRD body's voice does match what site copy will read like, so the maker's discipline has not yet leaked into the artifacts that downstream UX will treat as voice exemplars. *Fix:* either revise the PRD prose to demonstrate the voice rule, or annotate "voice rules apply to site copy, not internal documents." The current state lets a downstream tech-writer copy PRD voice into site copy and break the rule.

- **[medium]** "This was made by LinCie. Reach out if it speaks to you." (FR-13, §11) — this is the maker's voice asserting that the visitor *should* be moved. It is exactly the kind of self-announcement the brand register §11.2 forbids. The phrase reads as quietly confident only to a reader who is already invested. To a recruiter who scanned for 90 seconds, it reads as a plea. *Fix:* explore. Write three alternatives that do not assume the visitor was moved. Pick whichever reads least like a plea to a stranger. Or drop entirely; the colophon mailto already does this work.

### Other

- **[medium]** "Pure greys are forbidden" (FR-7, §11.6 Tinted Neutral Rule) has no exit valve — what if a chart, a code block, a syntax-highlighted snippet, or an inserted screenshot needs a true grey for legibility or accuracy? The rule is dogmatic. *Fix:* add a documented exception list or weaken to "site UI tokens carry warm chroma; embedded media and code blocks may use untinted neutrals."

- **[medium]** Section pin (FR-24) is unmotivated — pinning a section title for ~30vh of additional scroll has user value how? The PRD describes the mechanic without naming the reading benefit. The brainstorm liked it; that is not a reason. *Fix:* either motivate (e.g., "keeps section context visible while reading dense paragraphs") or cut to Tier 4.

- **[medium]** Fog-lifting blur (FR-20) is granted a `filter` carve-out from the "transform/opacity only" NFR without a perf budget — `filter: blur` triggers a separate compositor pass and on lower-end devices can cost 2-3ms per layer per frame. Multiple blurred sections in viewport at once is unbounded. *Fix:* limit to one section blurred at a time (the entering section), or set a measured budget (e.g., "blur layer must not push INP above 200ms on a Pixel 5a").

- **[low]** §0 says "PRD does not duplicate" §11 then duplicates DESIGN.md content — the named rules and the anti-references are repeated, not pointed to. *Fix:* either point or duplicate; pick one and apply consistently.

- **[low]** Title still reads *"Working title — confirm"* — this is a draft signal sitting at the top of a document about to feed three downstream BMad workflows. Confirm the title or remove the placeholder. *Fix:* trivial.

- **[low]** §2.1 lists two "Primary" personas and one "Secondary" — convention is one primary. The framing dilutes the design target (see High finding above). *Fix:* one primary, one secondary, one tertiary. Already three implied; rank them.

---

## Summary table

| Severity | Count |
|----------|-------|
| Critical | 4     |
| High     | 13    |
| Medium   | 14    |
| Low      | 3     |

The critical and high findings are blockers for clean handoff to UX and architecture. Most of the medium findings are PRD hygiene that can be cleaned in a single pass. The low findings are cosmetic.

## What the maker should do next

1. Resolve the four critical contradictions before anything else.
2. Decide the persona priority (recruiter vs collaborator) and rebalance the design accordingly, or accept the current bias and document it.
3. Resolve the Lenis question.
4. Cut taste-language from sections downstream agents will treat as constraints; keep it in §1 vision and §11.4 mood references where it belongs.
5. Move "emotionally load-bearing" perfectionist editorial out of the PRD into the decision log.
6. Add a JS budget and an INP budget to §10 NFRs.
7. Confirm `contact@lincie.me` routes to a real inbox.

The PRD is closer to ready than it reads in this review. The findings concentrate at the seams between vision and FR, and between aesthetic vocabulary and engineering specificity. Tighten those seams and the document will carry weight.
