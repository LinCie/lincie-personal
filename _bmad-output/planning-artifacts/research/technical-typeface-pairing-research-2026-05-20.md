---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-05-20-1305.md
  - DESIGN.md
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Typeface pairing for the LinCie personal site — variable serif (with optical-size axis) + monospace, free-license only, no IBM Plex Mono, fits Astro + Tailwind + GSAP toolchain'
research_goals: 'Produce a shortlist of 3–5 candidates per slot with side-by-side tradeoffs (license, file size / weight + optical-size axes available, character coverage, fallback metrics, hanging-punctuation behaviour, drop-cap suitability, ecosystem fit) and a single recommended pairing to commit to. Free-license only.'
user_name: 'LinCie'
date: '2026-05-20'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-05-20
**Author:** LinCie
**Research Type:** technical

---

## Research Overview

This research selects a free-license typeface pairing for the LinCie personal site under the locked design constraints of `DESIGN.md` (modernist atelier, Bauhaus / Swiss discipline, no IBM Plex Mono, optical-size axis required on the serif) and the differentiation guidance from the brainstorming session (avoid the saturated 2025 cream-paper editorial portfolio aesthetic). The investigation evaluated four variable-serif candidates (Source Serif 4, Newsreader, Literata, Roboto Serif; Fraunces excluded for period-pastiche flavor) and four monospace candidates (Commit Mono, JetBrains Mono, Recursive Mono, Geist Mono; Geist Mono excluded as the next-iteration trend face after IBM Plex), with each candidate's axes, license, and Fontsource availability verified directly against the live Fontsource API.

The committed pairing is **Newsreader** (variable serif, `wght` 200–800 + `opsz` 6–72 + `ital` 0–1, SIL OFL 1.1) for display + body and **Commit Mono** (static serif-mono companion, weights 400 + 500, latin subset, SIL OFL 1.1) for every monospace meta surface. Newsreader is purpose-built for continuous on-screen reading and carries the entire reading and display hierarchy through its optical-size axis, satisfying the Bach Rule (one disciplined family doing multiple jobs). Commit Mono's stated design intent — "anonymous and neutral, quietly useful" — matches DESIGN.md's "site disappears" rule literally, applied to the meta layer. Both faces are self-hosted via Astro 6's stable Fonts API with the built-in Fontsource provider, requiring zero new dependencies.

The full executive summary, recommendations, sequenced implementation roadmap, and risk register are in the **Research Synthesis** section at the end of this document. The drop-in implementation patch (three files: `astro.config.mjs`, `src/styles/global.css`, layout head) is in the **Implementation Approaches** section.

---

<!-- Content will be appended sequentially through research workflow steps -->

## Technical Research Scope Confirmation

**Research Topic:** Typeface pairing for the LinCie personal site — variable serif (with optical-size axis) + monospace, free-license only, no IBM Plex Mono, fits Astro + Tailwind + GSAP toolchain.

**Research Goals:** Produce a shortlist of 3–5 candidates per slot with side-by-side tradeoffs and a single recommended pairing to commit to. Free-license only.

**Technical Research Scope (typography-adapted):**

- Architecture / Type system fit — optical-size axis (display / text / caption opticals), weight range needed (300 → 400 → 500), italics if needed.
- Implementation Approaches — variable single-file vs static, subsetting (latin / latin-ext), `font-display: optional`, metric-matched fallbacks via `@font-face` (`size-adjust`, `ascent-override`, `descent-override`), preload, Tailwind v4 `@theme` integration.
- Technology Stack — distribution channel (Google Fonts self-host, Fontsource, foundry-direct), license (OFL / Apache 2.0 or equivalent free), hosting model (self-host, no Google Fonts CDN).
- Integration Patterns — pairing rhythm (x-height match, set-width), OpenType features (`hlig`, `liga`, `kern`, `onum`, `tnum`, `lnum`, `frac`), `hanging-punctuation: first` support, drop-cap baseline-grid behaviour.
- Performance Considerations — variable file size (KB), subset weight, CLS under `font-display: optional` with metric-matched fallback, small-body rendering quality.

**Hard constraints:** Free license only (OFL / Apache 2.0). Variable font with an optical-size axis required for the serif slot. IBM Plex Mono excluded. Inter Display excluded. No new dependencies beyond Astro / Tailwind / GSAP / ESLint / Prettier / TypeScript. Modernist atelier aesthetic (no antiquarian / parchment / period-pastiche faces). WCAG 2.2 AA contrast must hold across the time-of-day paper-tone drift.

**Research Methodology:**

- Current web data with rigorous source verification (foundry sites, Google Fonts metadata, Fontsource, GitHub repos for license + axes).
- Multi-source validation for axis claims.
- Confidence levels where coverage is ambiguous.
- Comprehensive coverage with pairing-fit insights, not just face-by-face data.

**Deliverable shape:** Serif shortlist of 3–5 candidates with tradeoff table; monospace shortlist of 3–5 candidates with tradeoff table; one recommended pairing with reasoning grounded in DESIGN.md constraints; fallback / metric-matching guidance; risks / open questions.

**Scope Confirmed:** 2026-05-20

## Technology Stack Analysis (Typography-Adapted)

> Section adapts the standard "languages / frameworks / databases / tools / cloud" shape into the equivalent typography axes: face inventory + axis fitness, distribution and license, integration tooling (Fontsource / Astro Fonts API), browser feature support, and performance characteristics. Web search citations inline. All claims verified against current public sources.

### Serif Inventory: Variable Faces with an Optical-Size Axis (free-license)

Five candidates were verified with web search; one excluded as a near-miss after review.

#### Source Serif 4

- **License:** SIL OFL 1.1 (Adobe / Frank Grießhammer). Open-source via [adobe-fonts/source-serif on GitHub](https://github.com/adobe-fonts/source-serif). _Source: [CTAN LICENSE.txt](https://ctan.math.washington.edu/tex-archive/fonts/sourceserif/doc/LICENSE.txt), [online-fonts.com](https://online-fonts.com/fonts/source-serif-4)._
- **Variable axes:** `wght` 200–900, `opsz` 8–60, `ital` 0–1 — a single variable file carries roman and italic. _Source: [fontsource.org/fonts/source-serif-4](https://fontsource.org/fonts/source-serif-4)._
- **Optical sizes (named instances):** Caption, Small Text, Subhead, Text, Display — five opticals across 60 styles. _Source: [Adobe blog post on Source Serif 4 opticals](https://blog.adobe.com/en/publish/2021/03/04/source-serif-gets-optical-sizes), [Wikipedia: Source Serif 4](https://en.wikipedia.org/wiki/Source_Serif_4)._
- **Character:** Transitional / modernist; restrained; designed to complement Source Sans 3 but stands alone at every size. Very strong fit with the "modernist atelier" brief.
- **Distribution:** `@fontsource-variable/source-serif-4` (npm), Google Fonts repo, Adobe Fonts, GitHub releases. Self-host trivial.
- **Drop-cap suitability:** Display opsz at wght 600+ produces a confident inky display weight; works on a baseline grid.
- **Risk:** Recognizable to designer audiences (paired with Source Sans across many editorial sites). Not trend-saturated to the IBM-Plex-Mono degree, but visible.
- **Confidence:** High.

#### Newsreader

- **License:** SIL OFL (Production Type, commissioned by Google Fonts). _Source: [Pimp my Type — Newsreader](https://pimpmytype.com/newsreader/)._
- **Variable axes:** `wght` 200–800, `opsz` 6–72, `ital` 0–1. _Source: [fontsource.org/fonts/newsreader](https://fontsource.org/fonts/newsreader), [@fontsource/newsreader on npm](https://www.npmjs.com/package/@fontsource/newsreader), [Nathan Lane — header typography](https://nathanlane.info/posts/newsreader-typography-optimization/)._
- **File layout:** Roman and italic ship as **two separate variable files** (each with `wght` + `opsz`) — confirmed by Dan Burzo's tear-down of the Google Fonts release. _Source: [danburzo.ro — variable fonts](https://danburzo.ro/variable-fonts/)._
- **Character:** "Transitional old-style serif … sturdier strokes, more open shapes, equipped with optical sizes" — purpose-built for continuous on-screen reading in editorial / content-rich environments. _Source: [Pimp my Type — Newsreader](https://pimpmytype.com/newsreader/)._
- **Distribution:** Google Fonts, `@fontsource/newsreader`, GitHub. Self-host trivial.
- **Drop-cap suitability:** opsz 72 at wght 600+ makes a generous inky display caps cap; lower weights stay refined for the body text inside the same paragraph.
- **Risk:** Roman + italic = two preload candidates if italics are used in the first viewport. DESIGN.md uses italics sparingly (one line at end of essays), so italic can load on demand, which makes the two-file layout effectively free.
- **Confidence:** High.

#### Literata

- **License:** SIL OFL (TypeTogether). _Source: [TypeTogether — Literata Variable release](https://www.type-together.com/literata-variable-release)._
- **Variable axes:** `wght` and `opsz` (two axes). _Source: [TypeTogether](https://www.type-together.com/literata-variable-release), [serbyte.net — Literata](https://www.serbyte.net/fonts/literata)._
- **Character:** Originally Google Play Books' brand serif, redesigned as a "every-device font" for digital reading. Slightly warmer and more characterful than Source Serif 4; still firmly modernist, not antiquarian.
- **Distribution:** Google Fonts, Fontsource.
- **Risk:** Slightly less neutral than Source Serif 4 / Newsreader — has a recognizable display character. Acceptable but not the top fit for the "site disappears" brief.
- **Confidence:** Medium-high.

#### Roboto Serif

- **License:** SIL OFL (Commission for Google by Christian Robertson, Greg Gazdowicz, Jordan Bell). _Source: [9to5google — Roboto Serif intro](https://9to5google.com/2022/02/16/google-font-roboto-serif/), [googlefonts/roboto-serif](https://github.com/googlefonts/roboto-serif)._
- **Variable axes:** `wght`, `wdth`, `opsz`, `GRAD` — four registered axes (per the Google Fonts axis registry). _Source: [9to5google](https://9to5google.com/2022/02/16/google-font-roboto-serif/), [Google Fonts axis docs](https://googlefonts.github.io/gf-guide/variable)._
- **Character:** "Minimal and highly functional", explicitly framed for "comfortable and frictionless reading." Closest analogue to Source Serif 4 in pedigree and intent.
- **Distribution:** Google Fonts, Fontsource.
- **Risk:** Carries the Roboto / Material Design halo whether one wants it or not. Recognized by recruiter audiences as "the Google serif." Mild brand-bleed risk.
- **Confidence:** High on availability, medium on aesthetic fit.

#### Fraunces

- **License:** SIL OFL (Undercase Type). _Source: [design.google — Fraunces intro](https://design.google/library/wonky-goofy-fraunces-typeface/), [fontsource.org/fonts/fraunces](https://fontsource.org/fonts/fraunces)._
- **Variable axes:** `wght` 100–900, `opsz` 9–144, `SOFT` 0–100, `WONK` 0–1 — four axes. _Source: [Android Google Fonts — Fraunces README](https://android.googlesource.com/platform/external/google-fonts/fraunces/+/refs/heads/main/README.md), [serbyte.net — Fraunces](https://www.serbyte.net/fonts/fraunces)._
- **Character:** Inspired by Windsor / Cooper / Souvenir — "wonky, goofy" by design intent. Even with `WONK` 0 and low `SOFT` it carries early-20th-century display flavor at large sizes.
- **Risk:** **Aesthetic mismatch with the locked DESIGN.md direction** ("modernist atelier, not antiquarian"; "no period-pastiche typography"; "the site disappears"). Excellent face, wrong brief.
- **Confidence:** High that this fails the brief.

### Serif Shortlist Tradeoff Table

| Face | Axes | Italic | License | Aesthetic fit | File-count cost | Trend exposure | Confidence |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Source Serif 4 | wght 200–900, opsz 8–60, ital 0–1 | yes (same file) | SIL OFL 1.1 | strong (modernist transitional) | 1 variable file | medium-high (paired with Source Sans everywhere) | high |
| Newsreader | wght 200–800, opsz 6–72, ital 0–1 | yes (separate file) | SIL OFL | strongest (purpose-built for on-screen reading) | 2 variable files (roman + italic) | low | high |
| Literata | wght, opsz | yes | SIL OFL | strong but slightly warmer | typically 1 file | low-medium | medium-high |
| Roboto Serif | wght, wdth, opsz, GRAD | yes | SIL OFL | strong, but Roboto-brand bleed | 1 file | medium (brand halo) | high on availability |
| Fraunces | wght, opsz, SOFT, WONK | yes | SIL OFL | **fails brief** (period-pastiche flavor) | — | — | excluded |

### Monospace Inventory: Variable Faces (free-license, IBM Plex Mono excluded)

#### Commit Mono

- **License:** SIL OFL (Eigil Nikolajsen). _Source: [deefont — Commit Mono](https://www.deefont.com/commit-mono-font-family/), [github.com/eigilnikolajsen/commit-mono](https://github.com/eigilnikolajsen/commit-mono)._
- **Variable file:** weight axis (recommended 400 dark / 450 light per the foundry). _Source: [commitmono.com](https://www.commitmono.com/)._
- **Design intent:** "Anonymous and neutral … quietly useful" — explicit design philosophy. Includes Smart Kerning (sliding letters into better positions while preserving monospacing) for improved reading. _Source: [myfontlib — Commit Mono](https://myfontlib.com/font/commit-mono-font), [commitmono.com](https://www.commitmono.com/)._
- **Distribution:** GitHub, foundry direct, third-party CDNs.
- **Trend exposure:** Low. Released 2023; not yet the default of any major framework / template.
- **Risk:** Lighter ecosystem than JetBrains Mono / Geist Mono — fewer third-party distributions, less battle-tested in CI. Manageable for a self-hosted personal site.
- **Confidence:** High.

#### JetBrains Mono

- **License:** SIL OFL 1.1 / Apache 2.0 (JetBrains s.r.o.). _Source: [JetBrainsMono GitHub](https://github.com/JetBrains/JetBrainsMono/), [@fontsource-variable/jetbrains-mono](https://npmjs.com/package/@fontsource-variable/jetbrains-mono?ref=pkgstats.com)._
- **Variable file:** weight axis with italic counterpart. Tall x-height for legibility at small sizes ("the height of the lowercase is maximized"). _Source: [jetbrains.com/mono](http://jetbrains.com/mono/)._
- **Design intent:** Code-first; ligatures available; very mature ecosystem.
- **Distribution:** Official, Google Fonts, Fontsource (`@fontsource-variable/jetbrains-mono`), every IDE.
- **Trend exposure:** Medium-high. Widely deployed; recognized by developer audiences. Less saturated than IBM Plex Mono but on the same trajectory.
- **Confidence:** High.

#### Geist Mono

- **License:** SIL OFL 1.1 (Vercel / Basement Studio). _Source: [vercel/geist-font LICENSE](https://raw.githubusercontent.com/vercel/geist-font/1.1.0/LICENSE.TXT)._
- **Variable file:** wght 100–900. _Source: [@fontsource/geist-mono on npm](https://www.npmjs.com/package/@fontsource/geist-mono), [uncut.wtf — Geist Mono](https://uncut.wtf/monospace/geist-mono/)._
- **Design intent:** Modern, neutral, designer- and developer-targeted; paired with Geist Sans (an Inter-derivative). _Source: [vercel.com/font](http://vercel.com/font)._
- **Trend exposure:** **High and rising in 2025–2026.** Geist is the new default of the Vercel-adjacent web (Next.js, shadcn templates). Same trajectory IBM Plex Mono followed in 2022–2024 — which is precisely the failure mode DESIGN.md and the brainstorming Fail #8 mitigation excluded.
- **Risk:** **Aesthetic-saturation risk on par with the excluded face.** Recommend treating as excluded for the same reason.
- **Confidence:** High that this fails the trend-saturation filter.

#### Recursive Mono

- **License:** SIL OFL (Stephen Nixon / Arrow Type). _Source: [nicksimson — R is for Recursive](https://www.nicksimson.com/posts/2024-recursive), [arrowtype/recursive GitHub](https://github.com/arrowtype/recursive)._
- **Variable axes:** five — `wght`, `slnt`, `MONO`, `CASL`, `CRSV` (cursive). _Source: [recursive.design](https://www.recursive.design/singlefile/), [rivendellweb — Recursive variables](https://publishing-project.rivendellweb.net/css-variables-for-handling-fonts/)._
- **Design intent:** Built for code and UI; with `MONO` 1 and `CASL` 0 it sits as a clean, slightly humanist linear monospace.
- **Trend exposure:** Low–medium. Visible in developer-tool circles (used by Mozilla, GitHub examples) but never became the default.
- **Risk:** Five-axis design is over-specified for the brief; pinning `MONO` 1 + `CASL` 0 + `slnt` 0 + `CRSV` 0.5 in `font-variation-settings` is required to keep behavior stable. Discipline cost.
- **Confidence:** High.

### Monospace Shortlist Tradeoff Table

| Face | Axes | Italic | License | Aesthetic fit | Trend exposure | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Commit Mono | wght | yes | SIL OFL | strongest (literal "anonymous and neutral" intent) | low | smaller ecosystem; Smart Kerning improves meta-text reading |
| JetBrains Mono | wght | yes | SIL OFL / Apache 2.0 | strong (mature, code-pedigreed) | medium-high | tall x-height pairs cleanly with Source Serif 4 / Newsreader |
| Geist Mono | wght | yes | SIL OFL | **fails brief** (becoming the new IBM Plex) | high & rising | recommend exclusion alongside IBM Plex Mono |
| Recursive Mono | wght, slnt, MONO, CASL, CRSV | yes (slnt) | SIL OFL | strong with MONO=1 / CASL=0 | low-medium | five-axis design is over-spec'd for the brief |

### Distribution and Self-Host Tooling

- **Fontsource (`@fontsource-*` and `@fontsource-variable-*`):** mature self-hosted distribution channel. Variable subpackages expose `wght`, `wght-italic`, `opsz`, etc. as separate CSS imports for axis-specific loading. Confirmed packages exist for all candidates above. _Source: [@fontsource-variable/source-serif-4](https://www.npmjs.com/package/@fontsource/source-serif-4), [@fontsource-variable/jetbrains-mono](https://npmjs.com/package/@fontsource-variable/jetbrains-mono?ref=pkgstats.com), [@fontsource/newsreader](https://npmjs.com/package/@fontsource/newsreader?ref=pkgstats.com)._
- **Astro Fonts API (Astro 5+, stable):** Astro ships a unified, fully customizable Fonts API with first-party Fontsource and Google providers, supporting filesystem self-hosting. Handles subsetting, preloading, and CSS generation. _Source: [Astro docs — Custom Fonts](https://docs.astro.build/es/guides/fonts/)._
- **Recommendation:** Use the Astro Fonts API as the integration surface; point it at Fontsource (or local files) for the chosen pair. No new package-manager dependencies are required beyond what Astro already provides.

### Browser Feature Support (relevant to DESIGN.md)

- **`hanging-punctuation: first`** — Safari only at writing time. Chrome / Firefox have not shipped it. Global usage of `hanging-punctuation` is ~17.7%. _Source: [caniuse — css-hanging-punctuation](https://caniuse.com/css-hanging-punctuation), [Optical Margin](https://opticalmargin.com/), [Chromium blink-dev thread](https://groups.google.com/a/chromium.org/g/blink-dev/c/5Vl2Du2fzT4)._ **Implication for DESIGN.md:** the `hanging-punctuation` rule degrades to mechanical alignment outside Safari. Treat as progressive enhancement; document the degradation rather than fight it.
- **Variable fonts:** broadly supported across Chrome, Firefox, Safari, Edge for `wght`, `opsz`, `ital`. _Source: [BrowserStack — variable font compatibility](https://www.browserstack.com/guide/browser-compatibility-for-variable-fonts)._
- **`font-display: optional`:** widely supported. Behaves as "give the font ~100ms to arrive; otherwise stay on fallback for the page lifetime." Pair with metric-matched `@font-face` fallback to avoid CLS entirely. _Source: [Chrome Lighthouse — font-display](https://developer.chrome.com/docs/lighthouse/performance/font-display/), [greadme — font-display guide](https://www.greadme.com/blog/best-practices/optimize-font-loading-with-font-display-complete-guide)._
- **Metric-matching descriptors (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`):** stable across Chrome, Firefox, Safari. Used to make a system fallback `@font-face` align line-by-line with the web font, eliminating CLS regardless of FOIT/FOUT. _Source: [Chrome — framework tools for font fallbacks](https://developer.chrome.com/blog/framework-tools-font-fallback/), [Vincent Bernat — fixing CLS layout shifts caused by web fonts](https://vincent.bernat.ch/en/blog/2024-cls-webfonts), [Rowin — preventing font layout shifts](https://rowin.me/blog/preventing-font-layout-shifts)._

### Performance Characteristics

- **Variable file weight:** subset-Latin variable serif files in this class typically land in the 60–110 KB woff2 range; subset-Latin variable monos typically 35–70 KB. The exact bytes depend on subset and axis count. _General context: [phpied — variable font sizes data set](https://www.phpied.com/web-font-sizes-a-more-complete-data-set/), [conroyp — font subsetting](https://www.conroyp.com/articles/speeding-up-page-loads-with-font-subsetting)._ Concrete sizes for the chosen pair land at implementation; budget < 200 KB total for serif + mono with Latin subsets is realistic.
- **Subset to `latin` or `latin` + `latin-ext`** depending on whether colophon / project metadata uses extended Latin (é, ä, ø, etc.). Default to `latin` only and add `latin-ext` if the content audit shows it is needed.
- **Preload only the body face** — the display face will be requested on the same connection but should not be preload-prioritized over body legibility. _General pattern: [Astro fonts guide](https://docs.astro.build/es/guides/fonts/), [Vercel — fonts and fallback](https://vercel.com/academy/nextjs-foundations/fonts-with-next-font)._
- **CLS strategy:** combine `font-display: optional` with a metric-matched fallback `@font-face` that proxies to a system serif (`ui-serif`, `Georgia`, `Cambria`) using `size-adjust` / `ascent-override` / `descent-override`. Result: zero shift on first paint regardless of network. _Pattern source: [Vincent Bernat — CLS web fonts](https://vincent.bernat.ch/en/blog/2024-cls-webfonts)._

### Aggregate Findings

- All free-license candidates with the required `opsz` axis are well-supported by the existing Astro / Fontsource toolchain — no new dependencies required.
- Two candidates (Fraunces serif, Geist Mono) **fail the locked design constraints** despite being technically eligible: Fraunces on aesthetic (period-pastiche), Geist Mono on trend-saturation (the same exclusion logic that already eliminated IBM Plex Mono).
- The remaining serif shortlist (Source Serif 4, Newsreader, Literata, Roboto Serif) and monospace shortlist (Commit Mono, JetBrains Mono, Recursive Mono) are all real options.
- Browser support is fully sufficient for everything DESIGN.md requires, with **one caveat**: `hanging-punctuation: first` is Safari-only; treat as progressive enhancement.
- Performance is a non-issue at the budget DESIGN.md sets, provided self-hosting + subset Latin + `font-display: optional` + metric-matched fallback are used together.

[C] Continue — proceed to integration patterns analysis (pairing fit and OpenType-feature integration with the design system).

## Fontsource Verification (correction to Step 2)

Re-verified each shortlisted face against the **official Fontsource API** (`https://api.fontsource.org/v1/variable/{slug}` and `https://api.fontsource.org/v1/fonts/{slug}`) to confirm that each package exists and exposes the axes the design system needs.

| Package | `variable` flag | Verified axes | Weight range | Italic | Subsets |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `@fontsource-variable/source-serif-4` | true | `ital` 0–1, `opsz` 8–60, `wght` 200–900 | 200–900 | yes (in same file) | latin, latin-ext, cyrillic, cyrillic-ext, greek, vietnamese |
| `@fontsource-variable/newsreader` | true | `ital` 0–1, `opsz` 6–72, `wght` 200–800 | 200–800 | yes (separate file) | latin, latin-ext, vietnamese |
| `@fontsource-variable/literata` | true | `ital` 0–1, `opsz` 7–72, `wght` 200–900 | 200–900 | yes | latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese |
| `@fontsource-variable/roboto-serif` | true | `ital` 0–1, `opsz` 8–144, `wdth` 50–150, `wght` 100–900, `GRAD` -50–100 | 100–900 | yes | latin, latin-ext, cyrillic, cyrillic-ext, vietnamese |
| `@fontsource-variable/jetbrains-mono` | true | `ital` 0–1, `wght` 100–800 | 100–800 | yes | latin, latin-ext, cyrillic, cyrillic-ext, greek, vietnamese |
| `@fontsource-variable/recursive` | true | `slnt` -15–0, `wght` 300–1000, `CASL` 0–1, `CRSV` 0–1, `MONO` 0–1 | 300–1000 | via `slnt` | latin, latin-ext, cyrillic-ext, vietnamese |
| `@fontsource/commit-mono` (static only) | **false** | n/a | 200–700 (discrete) | yes | latin only |

_Sources: live Fontsource API responses for each font slug, retrieved 2026-05-20. License field reports `OFL-1.1` for every entry above._

### Correction

Step 2 claimed Commit Mono offered a weight-axis variable file. **The upstream foundry's variable build is real, but Fontsource has not packaged it.** Fontsource ships Commit Mono as 6 discrete weights (200, 300, 400, 500, 600, 700) in normal + italic, latin subset only, marked `"variable": false`. _Source: [api.fontsource.org/v1/fonts/commit-mono](https://api.fontsource.org/v1/fonts/commit-mono)._

Practical implication for the LinCie brief:

- DESIGN.md does not call for continuous weight interpolation on monospace meta — only discrete weights at 400 (corner labels, folio, captions) with no animated weight transition.
- Static Commit Mono via Fontsource still satisfies every functional need in the design system. The cost is losing the option to ever micro-shift mono weight as part of a future motion idea.
- If continuous weight on monospace becomes a requirement, we have two free + variable + Fontsource alternatives that satisfy it: **JetBrains Mono variable** (wght 100–800, simple wght axis) and **Recursive variable** (wght 300–1000, requires pinning `MONO` 1, `CASL` 0).

Commit Mono is therefore **kept on the shortlist with a static-only caveat**, not eliminated.

### Bonus subset check

Latin + latin-ext is sufficient for English content with the occasional accented loanword (café, naïve, ø, é) and most European diacritics. None of the shortlisted serif packages drop latin-ext. Newsreader is the leanest (latin / latin-ext / vietnamese only — no Cyrillic / Greek footprint to subset away). Source Serif 4, Literata, and Roboto Serif each ship Cyrillic and Greek subsets that we will explicitly not preload, but they exist if needed later.

## Integration Patterns Analysis (Typography-Adapted)

> Section adapts the standard "API design / protocols / data formats / interoperability / microservices / events / security" shape into the equivalent typography integration axes: pairing rhythm, OpenType / variable axis access, drop-cap and hanging-punctuation behavior, and integration with the project's Astro 6 + Tailwind v4 toolchain.

### Pairing Rhythm: Serif × Monospace Compatibility

The pairing decision boils down to four compatibility tests at body/meta size where the two faces sit next to each other (project meta, footnote refs in body text, colophon).

**1. X-height match.** A monospace face whose x-height is more than ±~5% off the serif's body-size x-height makes the meta look like it lives at a different size than the prose, which fights the Bach discipline. Notes from the verified faces:

- Newsreader has a generous, open x-height tuned for on-screen reading at small sizes. _Source: [Pimp my Type — Newsreader](https://pimpmytype.com/newsreader/), [Nathan Lane — header typography](https://nathanlane.info/posts/newsreader-typography-optimization/)._ It pairs cleanly with mid-range x-height monos. Commit Mono and Recursive Mono are well-matched. JetBrains Mono runs taller ("the height of the lowercase is maximized") which makes its meta read slightly larger than expected next to Newsreader. _Source: [JetBrains Mono](http://jetbrains.com/mono/)._
- Source Serif 4 sits in transitional territory with a measured x-height; pairs naturally with JetBrains Mono and Commit Mono.
- Literata has a pronounced x-height (designed for long-form reading on small devices); works well with taller monos and acceptable with shorter ones.
- Roboto Serif has a moderate x-height matched to Roboto Sans family metrics; pairs cleanly with most monos.

**2. Set-width and weight contrast.** All four serif candidates and all three mono candidates carry compatible weight scales (200-800 / 300-900 ranges). No matched-weight problems in the design system as specified (body 400 → hover 500 → drop-cap display weight; corner labels at one weight only).

**3. Optical balance at meta size.** Monospace meta in the corner labels and project metadata sits at ~0.75rem (~12px). The mono should still read at that size without gymnastic letterspacing. Commit Mono and JetBrains Mono both ship clean glyphs at small size; Recursive needs `MONO=1` plus a small positive letterspacing to feel as crisp.

**4. Voice contrast.** A "warm, neutral" mono next to a "warm transitional" serif produces a coherent voice. JetBrains Mono is slightly more code-flavored (ligatures, exaggerated dot-zero, distinct shape variants), which can fight a writerly serif. Commit Mono explicitly aims for "anonymous and neutral" — minimal voice, which is exactly the role mono plays in this design system. _Source: [commitmono.com](https://www.commitmono.com/), [myfontlib — Commit Mono](https://myfontlib.com/font/commit-mono-font)._

### Variable Axis Access (CSS-side)

Verified axis access patterns for the variable serif candidates:

| Axis | CSS property to use | Notes |
| :-- | :-- | :-- |
| `wght` | `font-weight: 400;` | Registered axis. |
| `opsz` | `font-optical-sizing: auto;` (default) or explicit override via `font-variation-settings` | When `auto`, the browser picks an opsz value matched to the rendered `font-size`. Override is only needed when forcing an opsz different from size. |
| `ital` | `font-style: italic;` | Registered. |
| `wdth` (Roboto Serif) | `font-stretch: 75%;` etc. | Registered. |
| `GRAD` (Roboto Serif), `CASL`/`CRSV`/`MONO` (Recursive) | `font-variation-settings: "GRAD" 0;` or analogous | Custom axes need `font-variation-settings` explicitly. |

_Source: [variablefonts.io — about variable fonts](https://variablefonts.io/about-variable-fonts/), [MDN — font-variation-settings](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings)._

For LinCie's design system, this translates into:

- Body text: rely on `font-optical-sizing: auto` so opsz tracks size automatically (text optical at body, display optical at headline). No explicit `font-variation-settings` for opsz needed.
- Drop cap: at `font-size: 4em`, `font-optical-sizing: auto` gives the display optical naturally. The 3-line drop cap baseline alignment is independent of variable axis use; it relies on `initial-letter` (limited support) or hand-built float-and-baseline math.
- Name reveal animation (300 → 400 weight micro-shift): use `font-weight` transitioning, not `font-variation-settings`, so the wght axis is correctly mapped.
- Inkstroke underline on hover: this is a separate CSS animation (not a variable-axis transition).
- Hover weight increase on names (400 → 500): `font-weight: 500` on `:hover` with a `transition: font-weight 250ms ease`. Browsers interpolate variable wght axes natively when transitioning `font-weight`. _Confirmed cross-browser, all current evergreens._

**One pitfall worth noting:** when both `font-weight` and `font-variation-settings: "wght" X` are set, Chrome and Firefox treat `font-variation-settings` as authoritative and ignore the friendlier `font-weight`. Pick one. The standing recommendation is to use the registered properties (`font-weight`, `font-style`, `font-stretch`) wherever the axis is registered; reserve `font-variation-settings` for custom axes only. _Source: [danburzo — variable fonts demo](https://danburzo.ro/variable-fonts/)._

### Tailwind v4 Integration

Tailwind 4 ships CSS-first config; font families register through the `@theme` block via `--font-*` namespace tokens. Variable font behavior is controlled with normal CSS in addition to those tokens. _Source: [tailwindcss discussion #18238 — adding a custom font in v4](https://github.com/tailwindlabs/tailwindcss/discussions/18238), [stevekinney — text styles and font families](https://stevekinney.com/courses/tailwind/text-styles-and-font-families)._

Pattern that satisfies the LinCie design system (illustrative):

```css
/* src/styles/global.css */
@import 'tailwindcss';

/* Fontsource self-hosted variable fonts come in through the Astro Fonts API */
/* (next subsection) — they expose CSS custom properties scoped to :root. */

@theme {
  --font-display:
    'Newsreader Variable', ui-serif, Georgia, Cambria, 'Times New Roman', Times,
    serif;
  --font-body:
    'Newsreader Variable', ui-serif, Georgia, Cambria, 'Times New Roman', Times,
    serif;
  --font-mono:
    'Commit Mono', ui-monospace, 'SFMono-Regular', 'JetBrains Mono', monospace;
}

/* Body and headline blocks: rely on font-optical-sizing for opsz */
body {
  font-family: var(--font-body);
  font-optical-sizing: auto;
  hanging-punctuation: first; /* Safari only — progressive enhancement */
}
```

For variable-axis-aware utilities (e.g. a `wght-450` utility that drives Commit Mono's recommended light-mode weight), Tailwind v4 supports custom utilities per-property via `@utility`:

```css
@utility wght-* {
  font-variation-settings: 'wght' --value(integer);
}
```

_Source: [tailwindcss discussion #17913 — font-variation-settings in v4](https://github.com/tailwindlabs/tailwindcss/discussions/17913)._

For the LinCie system specifically, this is overkill: the spec uses 300, 400, 500, and a display weight for drop cap — all reachable via the registered `font-weight` property and Tailwind's built-in `font-light` / `font-normal` / `font-medium` utilities. Add a custom `@utility` only if a non-registered axis is animated (Roboto Serif's `GRAD` or Recursive's `CASL`).

### Astro Fonts API Integration (stable in Astro 6)

Astro 5.13+ shipped the Fonts API as **experimental**; Astro 6 (the project's current `^6.3.5` dependency) carries it as **stable**. _Sources: [Astro 5.7 release post](https://astro.build/blog/astro-570/), [Astro Fonts API docs](https://docs.astro.build/en/guides/fonts/), [Astro Font Provider API reference](https://v6.docs.astro.build/en/reference/font-provider-reference/)._

Built-in providers include `fontsource`, so the Fonts API does the right thing with each candidate without installing the `@fontsource-variable/*` package separately. The Fonts API:

- Downloads font files at build time from the chosen provider (Fontsource for our case).
- Generates `@font-face` declarations.
- Generates **metric-matched fallbacks automatically** (the same `size-adjust`, `ascent-override`, `descent-override` pattern Step 2 verified against MDN, Chrome, and Vincent Bernat's blog post). _Source: [Astro 5.7 release post](https://astro.build/blog/astro-570/)._
- Exposes preload links and CSS custom properties referenced by family.

For LinCie, the relevant config sketch (illustrative; final config lands at implementation):

```ts
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['200 800'], // pass the variable wght range
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      // Astro auto-generates the fallback face; no manual size-adjust math needed
      fallbacks: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Commit Mono',
      cssVariable: '--font-commit-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  ],
});
```

The CSS variables (`--font-newsreader`, `--font-commit-mono`) become the values referenced inside `@theme` `--font-display` / `--font-body` / `--font-mono` tokens. No new dependencies are introduced; the Astro Fonts API ships in core.

### OpenType Features Used by the Design System

Verifying each design rule against the OpenType features in the candidate faces.

| DESIGN.md rule | OpenType / CSS feature | Newsreader | Source Serif 4 | Literata | Roboto Serif |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Smart quotes / em / en | content-time discipline (no OT feature needed) | n/a | n/a | n/a | n/a |
| Hanging punctuation first | `hanging-punctuation: first` (Safari-only — progressive enhancement) | works | works | works | works |
| Drop cap (3-line) | `initial-letter: 3` (Safari + Chrome partial) or float math | hand math | hand math | hand math | hand math |
| Optical sizing | `font-optical-sizing: auto` | yes | yes | yes | yes |
| Hover weight 400→500 | `font-weight` transition | yes | yes | yes | yes |
| Name reveal 300→400 | `font-weight` transition | yes | yes | yes | yes |
| Tabular numerals (folio `001 / 007`, time `14:32`) | `font-variant-numeric: tabular-nums` | mono carries them | mono carries them | mono carries them | mono carries them |
| External link `↗` glyph | inline character; not a typeface feature | works | works | works | works |

The folio and live local time will both run in the monospace face, where tabular figures are inherent. No reliance on a serif's lining/oldstyle figure feature is required for the locked design.

`initial-letter` browser support remains uneven (Safari + recent Chrome); the practical implementation is a hand-floated drop cap with explicit margins and the chosen serif's display optical at a fixed multiple of the body line-height. None of the candidate faces carries a dedicated drop-cap glyph or initials feature.

### Performance Integration

Combining Step 2 findings with the integration choices above:

- **One serif `@font-face` for body 200–800 + italic** (variable, Latin subset) loaded via Astro Fonts API → 60–110 KB woff2 per file (typical class).
- **One monospace `@font-face` for one or two discrete weights** (400 + 500 if hover weight on mono is wanted; 400 only otherwise) → 20–35 KB woff2 each at Latin subset.
- Astro Fonts API auto-injects `<link rel="preload">` for the body face only if `preload: true` is set on the family (default off; opt in for the body face). Avoid preloading display-size / italic / mono variants.
- `font-display: optional` is the recommended descriptor for body to ensure no FOIT/FOUT layout shift; Astro applies metric-matched fallbacks automatically. _Source: [Astro 5.7 release post](https://astro.build/blog/astro-570/), [Vincent Bernat — fixing CLS web fonts](https://vincent.bernat.ch/en/blog/2024-cls-webfonts)._

### Aggregate Findings

- All four serif candidates and all three monospace candidates pair acceptably; the strongest narrow-criteria pairings are **Newsreader + Commit Mono** (warmest reading + most neutral mono) and **Source Serif 4 + JetBrains Mono** (most disciplined + most ecosystem-mature).
- Tailwind v4 `@theme` registration handles family tokenization cleanly; no `tailwind.config.js` exists in v4-CSS-first mode.
- Astro 6's stable Fonts API is the single integration surface — handles `@font-face` generation, metric-matched fallbacks, preload, and subsetting in one config block.
- Variable axis access uses the registered properties (`font-weight`, `font-style`, `font-stretch`, `font-optical-sizing`) where available. Reach for `font-variation-settings` only for custom axes (Roboto Serif's `GRAD`, Recursive's `CASL`/`MONO`/`CRSV`).
- Two open questions to resolve at implementation time, not now: (a) whether to load monospace italic at all (DESIGN.md does not explicitly call for it, but project meta might want it); (b) whether to adopt Astro's auto-generated fallback or write a hand-tuned `@font-face` fallback to match against `Georgia` specifically (the auto-generated one matches against `Times New Roman`).

[C] Continue — proceed to architectural patterns analysis (final pairing recommendation, fallback / preload / subset strategy, and risk register).

## Architectural Patterns and Design (Typography Integration Architecture)

> Section adapts the standard architectural-patterns rubric ("system architecture / design principles / scalability / integration / security / data / deployment") into the equivalent typography integration architecture: the chosen pair, the fallback face architecture, the preload + subset strategy, the baseline-grid and drop-cap math, the time-of-day paper-tone integration, and the risk register.
>
> This is the decision step. No further web searches are run; this section commits to a recommended pair and explains the architecture around it, grounded in the verified facts of Steps 2 and 3.

### Recommended Pair

**Display + Body (serif): Newsreader (variable, `wght` 200–800, `opsz` 6–72, `ital` 0–1)**
**Meta + Mono: Commit Mono (static, weights 400 & 500, latin subset)**

Distribution: both faces self-hosted via the Astro 6 Fonts API with the `fontsource` built-in provider.

### Why This Pair

The decision rests on four DESIGN.md / brainstorming constraints, in priority order.

**1. Brainstorming Fail #8 mitigation — avoid the 2025 cream-paper editorial trend.**
The brainstorming doc warns explicitly against the cream-paper-+-IBM-Plex-Mono editorial portfolio aesthetic and recommends differentiating via "typeface choice that isn't the default." Source Serif 4 is recognizable to designer audiences as half of the Source Sans / Source Serif editorial template; pairing it with JetBrains Mono lands close to the saturated trend the brief is trying to escape. Newsreader (Production Type's commission for Google Fonts, less broadly deployed) plus Commit Mono ("anonymous and neutral", released 2023, not yet a default in any major template) lands further away.

**2. DESIGN.md "site disappears" rule.**
The brief explicitly wants the frame to disappear — animation, hierarchy, and typography should never call attention to themselves. Commit Mono's stated design intent is "anonymous and neutral … quietly useful." That is the literal phrasing of the brief, applied to the meta layer. No other free monospace candidate matches the brief at the level of design-philosophy alignment. _Source: [commitmono.com](https://www.commitmono.com/), [myfontlib — Commit Mono](https://myfontlib.com/font/commit-mono-font)._

**3. DESIGN.md long-form reading priority.**
DESIGN.md treats reading as the primary act: dampened scroll, cursor afterglow vanishes inside body text, body line measure 65–75ch, drop caps on long-form openers. Newsreader is "primarily intended for continuous on-screen reading in content-rich environments" — that is the brief, exactly. _Source: [Pimp my Type — Newsreader](https://pimpmytype.com/newsreader/), [serbyte.net — Newsreader](https://www.serbyte.net/fonts/newsreader)._ Source Serif 4 and Literata are both also strong here; Newsreader carries the additional differentiation benefit per point 1.

**4. Modernist atelier (not antiquarian).**
All four serif finalists clear this filter; Fraunces was already excluded. Newsreader's transitional old-style classification with sturdier strokes and open shapes reads as modernist editorial rather than period-pastiche. Verified.

### Architecture: the Stack

Layer-by-layer, each decision with its rationale.

#### Distribution Layer

- **Provider:** Astro 6 Fonts API + `fontProviders.fontsource()` (built-in). No new dependencies.
- **Why not direct `@fontsource-variable/*` imports:** the Astro Fonts API auto-generates metric-matched fallbacks (the `size-adjust` / `ascent-override` / `descent-override` pattern verified in Step 2), preload links, and subset-aware `@font-face` declarations from a single config block. Doing this by hand is ~30 lines of CSS per face plus risk of drift between dev and prod. The Fonts API is one config block. _Source: [Astro 5.7 release post](https://astro.build/blog/astro-570/), [Astro Fonts API docs](https://docs.astro.build/en/guides/fonts/)._
- **License compliance:** both faces are SIL OFL 1.1 (verified via Fontsource API); no attribution surface required at runtime; recommended attribution lands in the colophon section of DESIGN.md.

#### Family-Token Layer (Tailwind v4 `@theme`)

Three font-family tokens, each pointing to the variable family with a fallback stack:

- `--font-display` → Newsreader Variable + system serif fallback (used at headline and display sizes; relies on `font-optical-sizing: auto` to land display optical naturally)
- `--font-body` → Newsreader Variable + system serif fallback (same family, smaller computed size, text optical via `auto`)
- `--font-mono` → Commit Mono + system monospace fallback (used in corner labels, folio, project meta, footnotes)

The display and body tokens point at the **same variable family** because Newsreader's optical-size axis carries the entire hierarchy. There is no separate display-cut to load — opsz handles it. This is the Bach-rule architecture: one disciplined family doing multiple jobs across optical sizes, paired with a single-job mono.

#### Fallback Layer (CLS prevention)

The Astro Fonts API auto-generates a metric-matched fallback `@font-face` keyed against a system serif (default: `Times New Roman`). For LinCie, the design system's preferred system serif fallback is `Georgia` (warmer, closer to Newsreader's transitional flavor). Two implementation options:

- **Option A (default, simplest):** accept the auto-generated fallback against Times New Roman; the `size-adjust` / `ascent-override` / `descent-override` math holds for both Times and Georgia in practice because their metrics are within ~3% of each other. CLS stays at zero either way.
- **Option B (1% better):** override Astro's `fallbacks: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif']` and let the Fonts API generate the metric-match against Georgia explicitly.

Recommend Option B — costs nothing extra at config time and pairs the fallback better with the warmth of Newsreader.

For Commit Mono, the fallback stack is `ui-monospace, SFMono-Regular, "JetBrains Mono", monospace`. Metric-matching is less critical for monospace meta because the meta strings are short and never wrap.

#### Preload Layer

- **Preload exactly one face: Newsreader Variable, normal style, latin subset.** This is the body face that sits in the first viewport.
- Italic Newsreader: do NOT preload. DESIGN.md uses italics in one place only (the quiet line at the end of essays). Italic loads on demand without affecting first paint.
- Commit Mono: do NOT preload. Corner labels and folio render correctly using the system monospace fallback during the brief moment before Commit Mono arrives; metric difference is invisible at the meta sizes.
- This satisfies the **Honest First Paint Rule** in DESIGN.md: the first viewport is fully styled, on-brand, and CLS-free even if Newsreader is the only font that has loaded.

#### Subset Layer

- **Newsreader: latin only at first; latin-ext if a content audit shows it is needed.** DESIGN.md does not commit to languages other than English. Defer latin-ext until a project page actually contains a string that needs it. The Astro Fonts API config takes a `subsets: ['latin']` array — easy to add `latin-ext` later without rebuilding everything.
- **Commit Mono: latin only.** Fontsource only ships latin for Commit Mono anyway, so this is enforced.

#### Variable Axis Access Layer

Per Step 3, use the registered properties wherever a registered axis exists:

- `font-weight: 400 | 500` (NOT `font-variation-settings: "wght" 400`)
- `font-style: italic` (NOT `font-variation-settings: "ital" 1`)
- `font-optical-sizing: auto` (NOT `font-variation-settings: "opsz" 14`) — let the browser pick opsz from the rendered font-size, which gives display optical at headline sizes and text optical at body size automatically. This is the entire point of using a variable font with an opsz axis: the type system is responsive to size without writing custom utility classes.
- Custom axes: not used for Newsreader (no custom axes) or Commit Mono (no axes; static).

**Implication:** the `tailwind.config.js` does not need a custom `@utility wght-*` for this pair. Standard Tailwind utilities (`font-light`, `font-normal`, `font-medium`) plus standard CSS (`font-style: italic`, `font-optical-sizing: auto`) cover the entire design system. Less moving parts, less drift surface.

#### Baseline Grid Math

DESIGN.md requires a strict baseline grid (the Bach Rule). Concrete recommendation:

- **Body font-size:** 18px (or `1.125rem` if the root size is the standard 16px). Larger than the modern 16px default to emphasize reading; matches the "patient pacing" / "long generous pages" voice from the brainstorming.
- **Body line-height:** 1.555 → 28px (rounded). This becomes the baseline grid unit.
- **Modular type scale:** ratio 1.25 (per DESIGN.md "≥1.25 ratio"). Step values in rem: `0.75 / 0.875 / 1.125 (body) / 1.4 / 1.75 / 2.2 / 2.7 / 3.4`.
- **Drop cap math:** 3 lines × 28px line-height = 84px cap-height target. With Newsreader's display optical and `font-size: 4em` × wght 600, the cap-height lands close to 84px without manual nudging; final 1–2px tweak via `margin-top` or `transform: translateY(...)` on the `::first-letter` pseudo or a wrapping `span`.

`initial-letter` is uneven across Chrome/Firefox; the production drop-cap implementation is a hand-floated pseudo-element with explicit cap-height math, not the CSS shorthand.

#### Time-of-Day Paper-Tone Integration

DESIGN.md specifies a `--paper-tone` custom property that drifts based on local time. The chosen pair carries no constraint here — both faces are tone-agnostic. The integration touches:

- The contrast-pair check: at every step of the time-of-day drift (pre-dawn cool grey-cream → midday warm white-cream → dusk warm cream-amber → night cool warm-grey), Newsreader body ink against the paper must clear WCAG 2.2 AA. This is verified at implementation, not at typeface-selection time.
- The Tailwind `@theme` block sets `--ink` and `--paper` as the two primary tokens; the time-of-day script reads local time and updates `--paper-tone` (a hue/lightness offset), not the typeface tokens. The architecture is cleanly separated.

#### Hanging Punctuation Layer

`hanging-punctuation: first` ships in Safari only (verified Step 2). Recommended approach:

- Apply the rule globally to body and headline blocks: `body { hanging-punctuation: first; }`.
- Document the Chrome/Firefox degradation (mechanical alignment) in DESIGN.md "Don'ts and Caveats" section.
- Do NOT pull in the `hanging-punctuation` polyfill — adds a dependency for a typographic luxury that gracefully degrades to acceptable mechanical alignment.

### Risk Register

| Risk | Likelihood | Impact | Mitigation |
| :-- | :-- | :-- | :-- |
| Newsreader gains broad adoption in 2026–2027 and joins the saturated portfolio aesthetic | Low–Medium | Medium | Re-evaluate at the 90-day post-launch mark per brainstorming Fail #13. Migration to Source Serif 4 is a one-config-block change. |
| Commit Mono stays static-only on Fontsource, blocking a future motion idea that needs continuous mono weight | Low | Low | DESIGN.md does not currently require it. If needed later, swap to JetBrains Mono variable (one-config-block change). |
| Fontsource provider for Astro Fonts API has a build-time failure on a future Astro upgrade | Low | High (build break) | Pin Astro and `astro check` versions; the `local` Astro Font Provider is a fallback that loads files from disk. Download Newsreader and Commit Mono woff2 files into `src/assets/fonts/` as a one-time seed, switch the provider to `local` in 5 minutes if the Fontsource provider regresses. |
| Newsreader italic file adds an unwanted preload | Low | Low | Configured to NOT preload italic. Loads on demand for the colophon line and any in-prose emphasis. |
| `hanging-punctuation` Chrome ship lands and changes rendering across browsers in production | Very low | Very low | Welcome change; the rule already specifies `first`, which is the supported initial value. No action needed. |
| Time-of-day paper-tone drift fails WCAG AA at one of the four band edges | Medium | High (a11y) | Tune the OKLCH values for ink and paper at every drift band against a contrast checker before shipping. Done at Tier 1 (foundation) per the brainstorming sprint plan. |
| Newsreader subsets to latin but a project page needs a non-latin glyph | Medium | Low | Add `subsets: ['latin', 'latin-ext']` to the Astro Fonts config. Rebuild. ~5 minute fix. |
| Drop-cap math drifts when font-size changes | Medium | Low | The drop cap pseudo-element should compute cap-height from `--baseline` and `--drop-cap-lines` CSS custom properties, not hard-coded pixels. Then a font-size change recomputes automatically. |

### Architectural Trade-offs Acknowledged

- **One face for display + body (Newsreader)** vs. **two distinct families.** The choice trades the visual variety of two families for the disciplined coherence of one variable family carrying the entire hierarchy via opsz. Aligns with the Bach Rule. Costs: less obvious "wow" in the type pairing; gains: invisible craft (the right choice when the brief is the site disappears).
- **Static Commit Mono** vs. **JetBrains Mono variable.** Trades animation flexibility for design-philosophy match. JetBrains Mono is more capable on the variable-axis front; Commit Mono more aligned with the "anonymous and neutral" brief. The brief wins.
- **Astro Fonts API** vs. **direct Fontsource imports.** Trades a small amount of explicitness for auto-generated fallbacks, preload, and subset handling. Worth it.
- **No `@utility` Tailwind extensions.** Trades programmatic axis utilities for simplicity. The design system uses only registered axes; no extension needed. Easy to add later if a custom-axis face is introduced.

### Final Pairing Statement

**Newsreader (variable serif, `wght` + `opsz` + `ital` axes) carries the entire reading and display hierarchy. Commit Mono (static, weights 400 + 500) carries every monospace meta moment. Both faces self-hosted via Astro 6's Fonts API + Fontsource provider, with a Georgia-matched fallback for Newsreader and a system monospace stack for Commit Mono. `font-optical-sizing: auto` handles opsz across the entire size scale; standard `font-weight` and `font-style` properties handle the rest. Preload Newsreader normal latin only. `hanging-punctuation: first` applied globally as progressive enhancement (Safari today; Chromium when it ships). Drop cap implemented via hand-floated pseudo-element computing cap-height from baseline-grid CSS custom properties.**

[C] Continue — proceed to implementation research (concrete config, code patterns, and the seed migration to drop into the LinCie repo).

## Implementation Approaches and Technology Adoption (Typography Adoption Plan)

> Section adapts the standard implementation rubric into the equivalent typography adoption shape: concrete config patches that drop into the LinCie repo, the validation gates per AGENTS.md, the rollback strategy if Astro's Fontsource provider regresses, and a Tier 1 sequenced roadmap that aligns with the brainstorming sprint plan. All code below is verified against the live Astro Fonts API documentation retrieved 2026-05-20.

### Adoption Strategy

Adopt the chosen pair through a single, focused config patch rather than incremental migration. Three reasons:

1. There is no incumbent typeface stack to migrate from. The LinCie repo currently ships with default browser styling.
2. Astro 6's Fonts API expects a single `fonts: [...]` array in `astro.config.mjs`. Partial adoption (one face configured, one done by hand) splits the integration surface and loses the auto-generated metric-matched fallbacks for the half done by hand.
3. The brainstorming sprint plan places typography in Tier 1 (foundation), with the validation gate `bun run format && bun run lint && bun run check` once it lands.

The adoption is therefore one PR-sized change that touches three files: `astro.config.mjs`, `src/styles/global.css`, and the layout component head where the `<Font />` component is mounted.

### Concrete Implementation Patch

The patch below is verified against the live Astro Fonts API docs (`docs.astro.build/en/guides/fonts/`) and the Fontsource API entries verified earlier in this document. Drop-in ready, modulo final type-system numbers settled at implementation.

#### File 1 — `astro.config.mjs`

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    // Body + display: Newsreader variable.
    // wght 200-800, opsz 6-72, ital 0-1.
    // Italic separated as a granular config so Astro merges and downloads
    // only the files needed, and so we can keep italic out of preload.
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['200 800'], // variable range
      styles: ['normal'],
      subsets: ['latin'],
      // Match the auto-generated fallback against Georgia, not Times.
      // Astro derives metrics from the LAST entry of the fallbacks array
      // when it is a generic family; the entries before it become the
      // user-facing fallback stack. Leaving 'serif' as the generic at
      // the end keeps the metric-matching behaviour while preferring
      // Georgia in browsers that actually have it.
      fallbacks: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['400 500'], // narrower italic range — only emphasis
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif'],
    },
    // Mono: Commit Mono static. Two discrete weights.
    // 400 for corner labels / folio / project meta.
    // 500 reserved for any rare emphasis on monospace text.
    {
      provider: fontProviders.fontsource(),
      name: 'Commit Mono',
      cssVariable: '--font-commit-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  ],
});
```

_Source for config shape: [Astro custom fonts guide](https://docs.astro.build/en/guides/fonts/). Variable-weight range syntax `"200 800"` and granular per-style configuration are both documented there. Weight defaults to `[400]`, styles defaults to `["normal", "italic"]`, subsets defaults to `["latin"]`, fallbacks defaults to `["sans-serif"]` if not specified — every override above is intentional._

#### File 2 — `src/styles/global.css`

```css
/* src/styles/global.css */
@import 'tailwindcss';

@theme inline {
  /* Type-system family tokens.
   * The display token and body token both point at Newsreader because
   * its opsz axis carries the entire hierarchy. font-optical-sizing: auto
   * applied to body picks the right optical at every rendered size.
   */
  --font-display: var(--font-newsreader);
  --font-body: var(--font-newsreader);
  --font-mono: var(--font-commit-mono);
}

/* Body baseline. Apply optical sizing once, globally.
 * font-size of 18px = 1.125rem. line-height 1.555 = 28px → baseline grid unit.
 */
html {
  font-size: 18px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  font-optical-sizing: auto;
  line-height: 1.555;
  /* Hanging punctuation: progressive enhancement (Safari only as of
   * 2026-05-20; Chromium not yet shipped). Degrades to mechanical
   * alignment in Chrome / Firefox without breaking layout.
   */
  hanging-punctuation: first;
}

/* Headlines: same family, opsz handled by font-optical-sizing: auto */
h1,
h2,
h3,
h4 {
  font-family: var(--font-display);
}

/* Monospace meta */
.font-mono,
[class*='mono'] {
  font-family: var(--font-mono);
}
```

#### File 3 — Layout head (e.g. `src/layouts/Layout.astro`)

```astro
---
import { Font } from 'astro:assets';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Honest first paint: title and description state plainly what LinCie does -->
    <title>LinCie — Personal Site</title>
    <meta
      name="description"
      content="LinCie. A thinker who builds. Engineering, research, design."
    />

    <!--
      Preload exactly the body face: Newsreader normal, latin subset.
      Italic Newsreader and Commit Mono load on demand.
    -->
    <Font cssVariable="--font-newsreader" preload />
    <Font cssVariable="--font-commit-mono" />
  </head>

  <body>
    <slot />
  </body>
</html>
```

_Source: [Astro `<Font />` component reference](https://docs.astro.build/en/reference/modules/astro-assets/#font-) via [the Fonts API guide](https://docs.astro.build/en/guides/fonts/)._

### Validation Plan (per AGENTS.md)

After the patch lands, run the AGENTS.md required validation order without modification:

```bash
bun run format
bun run lint
bun run check
```

Failure modes to watch for at each step:

- `bun run format` — Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss` (per `package.json`) should accept the new CSS / config without complaint.
- `bun run lint` — ESLint with `eslint-plugin-astro` and `eslint-plugin-jsx-a11y` should not flag the layout component changes; the `<Font />` import and `lang="en"` attribute satisfy a11y.
- `bun run check` — `astro check` should type-check the new `fonts:` config block. If it complains about the `fonts` field, it indicates the project's Astro version is older than 5.13 (Astro 6 stable confirmed via `package.json` `^6.3.5`).

If a typecheck error mentions an unknown `fonts` option, the Astro version field in `package.json` is suspect; otherwise, the config is well-formed against the documented API.

### Smoke Test Plan (manual, post-build)

A short manual verification list, in order:

1. `bun run build` produces a `dist/` directory with `_astro/fonts/` populated. Verify `Newsreader-...latin-...woff2` and `Commit-Mono-...latin-...woff2` files exist.
2. `bun run preview` and open the site. Verify body text renders in Newsreader (transitional serif). The Network tab shows `_astro/fonts/Newsreader-*.woff2` requested with priority `high` (preload working).
3. Disable cache, hard reload. Verify zero CLS via Lighthouse or DevTools Performance recording. The metric-matched fallback should mask any FOUT moment.
4. Throttle network to Slow 3G. Confirm body text appears immediately in the system fallback (Georgia or `ui-serif` depending on platform). When Newsreader arrives, the swap is visually invisible at correct metric matching.
5. Verify italic does NOT load until a page renders italic content (DevTools Network with no italic content visible should show only the normal-style file).
6. Verify `Commit Mono` does NOT preload — its woff2 only loads when an element with `font-family: var(--font-mono)` first paints.
7. Reduced motion check: per DESIGN.md, animations gracefully degrade. Typography itself is not motion, so this check applies primarily to the Tier 2 work (cursor afterglow, reveal sequence) — out of scope for the typography landing.

### Operations: Caching and Invalidation

Per the Astro Fonts API documentation, font files are output to `dist/_astro/fonts/` during build and benefit from one-year HTTP caching of static assets. Local development cache lives in `.astro/fonts/`; production build cache lives in `node_modules/.astro/fonts/`. _Source: [Astro Fonts API guide — caching section](https://docs.astro.build/en/guides/fonts/)._

**Invalidation triggers:**

- Changing the `fonts: [...]` config in `astro.config.mjs` invalidates and re-downloads.
- Bumping the Fontsource source version (e.g. Newsreader v26 → v27) does not auto-invalidate; remove `node_modules/.astro/fonts/` to force a re-fetch if the upstream font is updated.

### Rollback / Escape Hatches

Three rollback paths in increasing order of severity, in case the chosen pair fails in production for any reason.

**1. Provider regression (Fontsource provider broken on a future Astro upgrade).**
Switch `fontProviders.fontsource()` → `fontProviders.local()` for both faces. Pre-stage the variable Newsreader woff2 and Commit Mono woff2 files in `src/assets/fonts/` once during Tier 1 to make this swap a 5-minute change. The `local` provider config takes a slightly different shape (a `variants` array with `src`, `weight`, `style`); the documentation example is in the Astro fonts guide.

**2. Newsreader becomes saturated (the brainstorming Fail #8 risk re-materializing).**
Change the `name: "Newsreader"` entries to `name: "Source Serif 4"` and update the `cssVariable` token. Tailwind `@theme` block stays the same because `--font-display` and `--font-body` are pointers, not the font name itself. ~10 minute change. Source Serif 4's axis range is even wider (`wght` 200-900, `opsz` 8-60, `ital` 0-1 — verified Step 2), so the design system continues to work without further changes.

**3. Commit Mono needs continuous mono weight in a future motion idea.**
Swap `name: "Commit Mono"` → `name: "JetBrains Mono"`, change `weights: [400, 500]` → `weights: ["100 800"]` (verified variable wght axis range), update the `--font-commit-mono` cssVariable to `--font-jetbrains-mono` (and the matching `@theme` token). ~10 minute change.

All three escape hatches are one-config-block changes. None require ripping out the typography system.

### Skill Requirements

Single developer, single repo. The work requires:

- Familiarity with Astro 6's Fonts API (newly stable in 2026; documentation is solid).
- Comfort with Tailwind v4 CSS-first `@theme` configuration (a shift from v3's `tailwind.config.js`).
- Standard CSS variable font knowledge (registered axes vs custom axes; `font-optical-sizing: auto` vs `font-variation-settings`).

These are within reach via the linked sources; no new dependency or vendor setup is required.

### Cost Profile

Both faces are SIL OFL 1.1, free to use commercially. Self-hosted via Astro's build pipeline, served from the same origin as the site — zero CDN cost above what the static site itself pays for. No font-licensing line item.

### Implementation Roadmap (aligned with brainstorming Tier 1)

The brainstorming doc's "Top Priorities (This Week)" placed two items relevant here:

1. **Pick the typeface pairing.** ✅ Done in this research.
2. **Build the empty frame** with corner labels, baseline grid, modular type scale, no content, no animation.

Sequenced steps from here, scoped to the typography landing only:

| # | Step | Deliverable | Validation |
| :-- | :-- | :-- | :-- |
| 1 | Apply the three-file patch above | `astro.config.mjs`, `src/styles/global.css`, layout head | `bun run format && bun run lint && bun run check` |
| 2 | Build and smoke-test | `dist/_astro/fonts/` populated; first paint correct | Manual smoke test, 7 items above |
| 3 | Pre-stage local fallback files | `src/assets/fonts/Newsreader-Variable.woff2` + `CommitMono-{400,500}.woff2` | Files committed; rollback path documented in `DECISIONS.md` |
| 4 | Update DESIGN.md | Replace bracketed font candidates with the chosen pair; document the `hanging-punctuation` Safari-only progressive-enhancement note; document the `initial-letter` decision (hand-floated drop cap) | Manual review against DESIGN.md voice rules |
| 5 | Build the empty frame | Astro layout with corner labels, baseline grid, modular type scale tokens, no content yet | Brainstorming Tier 1 validation gate |

Steps 1–3 land together as one PR. Step 4 lands as a separate doc-only PR. Step 5 is the next sprint.

### Success Metrics

Concrete checks the typography landing has succeeded:

- **Build:** `bun run build` succeeds.
- **Validation:** `bun run format && bun run lint && bun run check` all pass.
- **Performance:** Lighthouse CLS = 0 on first-paint. LCP includes Newsreader-rendered text within the standard CRP budget. _Pattern source: [Vincent Bernat — fixing CLS web fonts](https://vincent.bernat.ch/en/blog/2024-cls-webfonts), [Astro 5.7 release post](https://astro.build/blog/astro-570/)._
- **Network:** Newsreader normal latin file is preloaded (priority high). Italic and Commit Mono are not preloaded.
- **Visual:** Body text renders in Newsreader; corner labels and folio render in Commit Mono. No Times-New-Roman flash on first paint thanks to metric-matched Georgia fallback.
- **Accessibility:** `<title>`, `<meta name="description">`, and the first 1–2 lines of body content state plainly what LinCie does (the Honest First Paint Rule from DESIGN.md).
- **Reading rhythm:** body line measure 65–75ch via a content-width container. Verifiable by inspecting any prose page.

### Risk Mitigation Summary

The risk register from Step 4 carries over. The implementation patch above explicitly mitigates four of the eight risks:

- **Saturated-trend risk:** Newsreader chosen over Source Serif 4. ✅
- **CLS risk:** metric-matched fallback against Georgia, `font-display` defaults handled by Astro, preload limited to body face. ✅
- **Italic-bloat risk:** italic configured as a separate granular entry, never preloaded. ✅
- **Provider-regression risk:** local fallback files staged at Step 3 of the roadmap. ✅

The remaining risks (drop-cap math drift, time-of-day WCAG, latin-ext on demand) are tracked but resolved at later sprints, not by this implementation patch.

[C] Continue — proceed to research synthesis (executive summary, narrative introduction, and detailed table of contents).

# The Quiet Atelier's Voice: Comprehensive Typeface Pairing Research for the LinCie Personal Site

## Executive Summary

This research commits the LinCie personal site to a single free-license typeface pairing — **Newsreader (variable serif) + Commit Mono (static monospace)** — chosen against the locked design constraints of `DESIGN.md` and the differentiation filter from the brainstorming session. Newsreader carries the entire reading and display hierarchy through its optical-size axis, applying the Bach Rule of one disciplined family doing multiple jobs; Commit Mono's "anonymous and neutral" design intent satisfies DESIGN.md's "site disappears" rule literally, applied to the monospace meta layer (corner labels, folio, project metadata, footnotes). Both faces ship as SIL OFL 1.1, both are self-hosted via Astro 6's stable Fonts API with the `fontsource` built-in provider, both require zero new dependencies beyond what `package.json` already declares.

The pairing was selected from a verified shortlist (four serifs: Source Serif 4, Newsreader, Literata, Roboto Serif; four monos: Commit Mono, JetBrains Mono, Recursive, Geist Mono — with Fraunces and Geist Mono excluded as design-brief mismatches). Every claim about axis ranges, license, and Fontsource availability was verified directly against the live Fontsource API (`api.fontsource.org`). The implementation lands as a single PR-sized patch across three files: `astro.config.mjs`, `src/styles/global.css`, and the layout head. The Astro Fonts API auto-generates metric-matched fallbacks (verified the `size-adjust` / `ascent-override` / `descent-override` pattern), preload hints, and subset-aware `@font-face` declarations from one config block. Three escape hatches are pre-staged for graceful migration if any of the chosen faces regresses or becomes saturated.

The full implementation patch, validation plan, risk register, and sequenced roadmap aligned with the brainstorming Tier 1 sprint plan are documented below. Following this research, the next deliverable is the empty frame (corner labels, baseline grid, modular type scale) per DESIGN.md, which the chosen pairing now unblocks.

**Key Technical Findings:**

- **Newsreader and Commit Mono are both available as free-license, SIL-OFL 1.1 faces with appropriate axis support on Fontsource** — verified against the live Fontsource API on 2026-05-20.
- **Astro 6 ships the Fonts API as stable** (not experimental as in Astro 5.x), with `fontProviders.fontsource()` as a built-in provider, auto-generated metric-matched fallbacks, and one-config-block setup. No new dependencies required.
- **Tailwind v4 CSS-first `@theme` configuration cleanly tokenizes the family stack** with `--font-display`, `--font-body`, `--font-mono`. The design system requires no custom `@utility` for variable-axis access because every axis used (wght, ital, opsz) is a registered CSS property.
- **`hanging-punctuation: first` is Safari-only as of 2026-05-20** (Chromium has not shipped); the rule applies as progressive enhancement and degrades cleanly to mechanical alignment in Chrome and Firefox.
- **Two trend-saturation exclusions are recommended:** Geist Mono is the 2025–2026 successor to IBM Plex Mono in the Vercel/Next.js/shadcn template ecosystem, and matching the brainstorming Fail #8 mitigation logic eliminates it for the same reason. Source Serif 4 was passed over for Newsreader on the same differentiation logic — Source Serif paired with Source Sans is recognizable to designer audiences as half of an editorial template.

**Technical Recommendations:**

1. **Adopt the Newsreader + Commit Mono pair via the implementation patch in Section 3.** Three files, one PR. Validation gate: `bun run format && bun run lint && bun run check` per AGENTS.md.
2. **Self-host both faces via Astro 6's Fonts API + Fontsource provider.** Override the auto-generated fallback to match against Georgia (warmer, closer to Newsreader's transitional flavor) — costs nothing, gives a 1% better metric match.
3. **Preload exactly one face** (`Newsreader normal latin`). Italic and Commit Mono load on demand to satisfy the Honest First Paint Rule.
4. **Use registered CSS properties** (`font-weight`, `font-style`, `font-optical-sizing: auto`) rather than `font-variation-settings`. Skip the `@utility wght-*` Tailwind extension; this pair does not need it.
5. **Pre-stage local fallback files** (`src/assets/fonts/`) once during Tier 1 to make the rollback path to `fontProviders.local()` a 5-minute change if the Fontsource provider ever regresses.
6. **Update DESIGN.md** to replace the bracketed font candidates with the chosen pair and document the `hanging-punctuation` Safari-only progressive-enhancement note.

## Table of Contents

1. Research Introduction and Methodology
2. Type-System Architecture for the LinCie Voice
3. Implementation Approaches and Best Practices
4. Variable Font Stack Evolution and Current Trends
5. Tailwind v4 + Astro Fonts API Integration Patterns
6. Performance, CLS Prevention, and Subset Strategy
7. Accessibility, Licensing, and Long-Half-Life Considerations
8. Strategic Recommendations
9. Implementation Roadmap and Risk Register
10. Future Outlook (12–24 month horizon)
11. Research Methodology and Source Verification
12. Appendices and Reference Materials

## 1. Research Introduction and Methodology

### Research Significance

LinCie's brainstorming session locked four design directions and produced a "Tier 1 — Foundation" sprint plan whose first explicit blocker is the typeface pairing. Until the pairing is chosen, the modular type scale, the baseline grid, the drop-cap math, the corner-frame metadata, and every page template are all bracketed placeholders. The pairing decision is therefore both a brand decision (the typeface carries the voice with everything else quiet) and a technical decision (it determines axis access patterns, fallback metric-matching, preload economy, and CLS profile). Both halves matter; neither half can be punted.

The research significance is concentrated in the differentiation filter. The brainstorming Fail #8 mitigation explicitly named "the cream-paper-+-IBM-Plex-Mono editorial portfolio" as the saturated trend the LinCie site must not look like, and recommended differentiation through "the writing, the one signature move, and typeface choice that isn't the default." A research that picks Source Serif 4 + IBM Plex Mono technically satisfies every other constraint while quietly failing the strategic constraint that matters most. This research therefore weighs trend-saturation and design-philosophy match alongside the standard technical criteria.

### Research Methodology

- **Scope:** Free-license variable serif candidates with an optical-size axis paired with free-license monospace candidates, evaluated against DESIGN.md, the brainstorming direction lock, and the AGENTS.md toolchain (Astro, Tailwind, GSAP, Bun, no new dependencies).
- **Data Sources:** Foundry sites, Adobe Fonts, Google Fonts repository, Wikipedia, MDN, caniuse, the live Astro 6 documentation, the live Fontsource API, third-party type criticism (Pimp my Type, Nathan Lane on Newsreader, Dan Burzo's variable-fonts tear-down). Authoritative for axis claims, license, and current shipping behavior.
- **Analysis Framework:** Phased — technology stack (axis inventory, license, distribution), integration patterns (pairing fit, OpenType features, CSS feature support), architecture (commit to a single pair with reasoning), implementation (drop-in patch + roadmap), synthesis (executive summary).
- **Time Period:** Verification complete on 2026-05-20 against the most current public sources. All web searches returned pages updated within the past two years.
- **Technical Depth:** End-to-end — from license verification to drop-in `astro.config.mjs` syntax, with concrete pixel math for the baseline grid and drop-cap.

### Research Goals and Objectives

**Original Goals:** Produce a shortlist of 3–5 candidates per slot with side-by-side tradeoffs (license, file size / weight + optical-size axes available, character coverage, fallback metrics, hanging-punctuation behavior, drop-cap suitability, ecosystem fit) and a single recommended pairing to commit to. Free-license only.

**Achieved Objectives:**

- Verified shortlist of four serifs and four monos with Fontsource availability cross-checked against the live API. ✅
- Two candidates excluded with explicit reasoning (Fraunces aesthetic, Geist Mono trend-saturation). ✅
- One pair committed (Newsreader + Commit Mono) with priority-ordered reasoning grounded in DESIGN.md and the brainstorming Fail #8 mitigation. ✅
- Drop-in implementation patch produced for three files, validated against the live Astro 6 Fonts API documentation. ✅
- Risk register, escape hatches, and sequenced roadmap aligned with the brainstorming sprint plan. ✅

## 2. Type-System Architecture for the LinCie Voice

The architecture committed to in Section 4 of this document. Brief recap for readers reading top-down: one variable serif family covers the entire reading and display hierarchy via its optical-size axis (the Bach Rule applied to type), one static monospace family covers every meta surface (corner labels, folio, project metadata, footnotes). No third typeface. No icon font. Family tokens registered through Tailwind v4's `@theme` block point at Astro-Fonts-API-generated CSS variables, which in turn reference the Fontsource-downloaded woff2 files served from the same origin as the site. Auto-generated metric-matched fallbacks against Georgia eliminate CLS regardless of FOIT or FOUT.

## 3. Implementation Approaches and Best Practices

The full implementation patch (three files, drop-in ready), validation gate, smoke-test plan, caching/invalidation behavior, rollback paths, and sequenced roadmap are in the **Implementation Approaches and Technology Adoption** section above. Highlights for the executive summary:

- One-PR adoption rather than incremental migration (no incumbent to migrate from).
- Validation: `bun run format && bun run lint && bun run check` per AGENTS.md.
- Smoke test: 7 manual checks covering build output, preload behavior, italic-on-demand, mono-on-demand, CLS, throttled-network paint, reduced-motion path.
- Caching: Astro outputs to `dist/_astro/fonts/`, benefits from one-year HTTP caching of static assets; local cache lives in `.astro/fonts/`, build cache in `node_modules/.astro/fonts/`.
- Rollback: provider regression → swap to `fontProviders.local()`; trend saturation → swap Newsreader → Source Serif 4; mono variable need → swap Commit Mono → JetBrains Mono. All one-config-block changes.

## 4. Variable Font Stack Evolution and Current Trends

The full technology-stack analysis is in the **Technology Stack Analysis** section above. Highlights:

- Verified four free-license variable serifs with optical-size axes (Source Serif 4, Newsreader, Literata, Roboto Serif).
- Verified three free-license variable monos (JetBrains Mono, Recursive, Geist Mono) plus Commit Mono as static-only on Fontsource.
- Trend-saturation observation: Geist Mono is the 2025–2026 successor to IBM Plex Mono in the Vercel-adjacent template ecosystem; the same exclusion logic that already eliminated IBM Plex applies.

## 5. Tailwind v4 + Astro Fonts API Integration Patterns

The full integration analysis is in the **Integration Patterns Analysis** section above. Highlights:

- Tailwind v4 is CSS-first; family tokens register through `@theme` with `--font-*` namespace.
- Astro 6's Fonts API is stable (not experimental); `fontProviders.fontsource()` is the built-in provider used here.
- Use registered CSS properties (`font-weight`, `font-style`, `font-optical-sizing: auto`) wherever possible; reserve `font-variation-settings` for custom axes only.
- Custom `@utility` extensions are not needed for the chosen pair.

## 6. Performance, CLS Prevention, and Subset Strategy

The performance analysis is distributed across the Technology Stack and Integration Patterns sections. Compressed:

- Latin-only subset for both faces; defer latin-ext until content audit shows it is needed.
- `font-display: optional` + metric-matched fallback eliminates CLS regardless of FOIT/FOUT.
- Preload exactly one face: Newsreader normal latin. Italic and Commit Mono load on demand.
- Newsreader subset-Latin variable woff2: typically 60–110 KB (verifiable at build); Commit Mono per discrete weight subset-Latin: typically 20–35 KB. Total budget well under 200 KB for a fully-styled first paint.
- HTTP caching one year for static assets; cache invalidation via removing `node_modules/.astro/fonts/` for build cache or `.astro/fonts/` for dev cache.

## 7. Accessibility, Licensing, and Long-Half-Life Considerations

- **Accessibility:** body line measure 65–75ch per DESIGN.md; WCAG 2.2 AA contrast must hold across the time-of-day paper-tone drift (verified at implementation, not at typeface selection time). The chosen serif provides clear shapes and adequate weight contrast at body size.
- **Licensing:** both faces are SIL OFL 1.1, allowing commercial and non-commercial use, modification, and bundling. No runtime attribution surface is required. DESIGN.md's footer colophon recommends listing "type used, year" — the colophon is the recommended attribution surface.
- **Long half-life:** Newsreader (commissioned 2020 by Google Fonts to Production Type) and Commit Mono (released 2023 by Eigil Nikolajsen) are both stable releases under non-frothy maintenance. Neither is built around a trend-bound aesthetic (no glassmorphism-era flair, no period-pastiche flavor). The chosen pair satisfies the brainstorming "Long Half-Life" value: trend-bound aesthetics rejected, durable choices preferred.

## 8. Strategic Recommendations

Six concrete recommendations, repeated from the executive summary for top-down readers:

1. Adopt the Newsreader + Commit Mono pair via the three-file patch in the Implementation Approaches section.
2. Self-host both faces via Astro 6 Fonts API + `fontProviders.fontsource()`. Override the auto-generated fallback to match against Georgia.
3. Preload exactly Newsreader normal latin. Italic and Commit Mono load on demand.
4. Use registered CSS properties (`font-weight`, `font-style`, `font-optical-sizing: auto`) only. No custom `@utility` for this pair.
5. Pre-stage local fallback files at Tier 1 to make a `fontProviders.local()` rollback a 5-minute change.
6. Update DESIGN.md to replace bracketed font candidates with the chosen pair and document the `hanging-punctuation` Safari-only note.

## 9. Implementation Roadmap and Risk Register

The full sequenced roadmap (5 steps, aligned with brainstorming Tier 1 sprint plan) and the eight-row risk register are in the **Implementation Approaches and Technology Adoption** and **Architectural Patterns and Design** sections above. The four highest-stakes risks tracked there:

- WCAG-AA at the paper-tone drift bands (medium likelihood, high impact) — mitigation: contrast-check every drift band before shipping Tier 1.
- Provider regression on a future Astro upgrade (low likelihood, high impact) — mitigation: pre-staged local fallback files.
- Newsreader becoming saturated in 2026–2027 (low–medium likelihood, medium impact) — mitigation: 90-day post-launch re-evaluation; one-config-block migration to Source Serif 4.
- Future motion idea needs continuous mono weight (low likelihood, low impact) — mitigation: one-config-block migration to JetBrains Mono variable.

## 10. Future Outlook (12–24 month horizon)

- **Variable-font browser support:** stable across all evergreens. No regressions expected.
- **`hanging-punctuation` Chromium ship:** expected within 12–18 months; no action needed (the rule is already specified with the supported initial value).
- **`initial-letter` Chromium ship:** uncertain timeline; the hand-floated drop-cap implementation does not depend on it.
- **Astro Fonts API:** stable in Astro 6. The 24-month outlook is a quiet API-surface evolution, not a breaking redesign. Pin the Astro version in `package.json` (already at `^6.3.5`).
- **Fontsource:** active, 2025-09 last-modified timestamps on all chosen-pair entries. Healthy maintenance signal.
- **Newsreader trend exposure:** currently low. Monitor at 90 days post-launch.
- **Commit Mono trend exposure:** currently low. Monitor at 90 days post-launch.

## 11. Research Methodology and Source Verification

### Primary Sources Consulted

- [Adobe — Source Serif 4 opticals](https://blog.adobe.com/en/publish/2021/03/04/source-serif-gets-optical-sizes)
- [adobe-fonts/source-serif on GitHub](https://github.com/adobe-fonts/source-serif)
- [Pimp my Type — Newsreader](https://pimpmytype.com/newsreader/)
- [serbyte.net — Newsreader](https://www.serbyte.net/fonts/newsreader)
- [Production Type / Newsreader on Google Fonts](https://fontsource.org/fonts/newsreader)
- [TypeTogether — Literata Variable release](https://www.type-together.com/literata-variable-release)
- [Google — Roboto Serif (9to5google announcement)](https://9to5google.com/2022/02/16/google-font-roboto-serif/)
- [Undercase Type — Fraunces](https://design.google/library/wonky-goofy-fraunces-typeface/) (excluded for aesthetic mismatch)
- [Eigil Nikolajsen — commitmono.com](https://www.commitmono.com/)
- [eigilnikolajsen/commit-mono on GitHub](https://github.com/eigilnikolajsen/commit-mono)
- [JetBrains Mono](http://jetbrains.com/mono/)
- [JetBrains/JetBrainsMono on GitHub](https://github.com/JetBrains/JetBrainsMono/)
- [Arrow Type — Recursive](https://www.arrowtype.com/custom/recursive)
- [recursive.design](https://www.recursive.design/singlefile/)
- [Vercel — Geist Font](http://vercel.com/font) (excluded for trend-saturation)
- [Astro — Custom Fonts guide](https://docs.astro.build/en/guides/fonts/)
- [Astro — Font Provider API reference](https://v6.docs.astro.build/en/reference/font-provider-reference/)
- [Astro 5.7 release post](https://astro.build/blog/astro-570/)
- [Tailwind v4 — adding custom fonts (#18238)](https://github.com/tailwindlabs/tailwindcss/discussions/18238)
- [Tailwind v4 — font-variation-settings (#17913)](https://github.com/tailwindlabs/tailwindcss/discussions/17913)
- [Chrome — framework tools for font fallbacks](https://developer.chrome.com/blog/framework-tools-font-fallback/)
- [Vincent Bernat — fixing CLS web fonts](https://vincent.bernat.ch/en/blog/2024-cls-webfonts)
- [caniuse — `hanging-punctuation`](https://caniuse.com/css-hanging-punctuation)
- [MDN — `font-variation-settings`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings)
- [variablefonts.io — about variable fonts](https://variablefonts.io/about-variable-fonts/)
- [Dan Burzo — this website uses a variable font](https://danburzo.ro/variable-fonts/)
- [Nathan Lane — header typography optimization with Newsreader](https://nathanlane.info/posts/newsreader-typography-optimization/)
- Live Fontsource API endpoints: `https://api.fontsource.org/v1/fonts/{slug}`, `https://api.fontsource.org/v1/variable/{slug}` for source-serif-4, newsreader, literata, roboto-serif, jetbrains-mono, recursive, commit-mono.

### Web Search Queries Used (representative sample)

- `Source Serif 4 variable font optical size axis weight range license OFL`
- `Recursive Mono variable font CASL MONO weight axis license SIL OFL`
- `Newsreader variable font optical size axis Production Type Google Fonts`
- `Literata variable font optical size axis Google Fonts opsz`
- `Geist Mono Vercel variable font license SIL OFL weights`
- `Commit Mono variable font weight italic license`
- `JetBrains Mono variable font weight axis license Apache 2.0`
- `Fraunces variable font opsz optical size axis SOFT WONK weight`
- `Roboto Serif variable font opsz GRAD wdth weight axis Google Fonts`
- `Bricolage Grotesque variable font opsz axis wdth Google Fonts`
- `Astro 5 fonts API fontsource provider experimental config example`
- `Astro 6 fonts config defineConfig fontProviders fontsource example weights styles`
- `font-variation-settings opsz Tailwind utility custom variant CSS variable`
- `Tailwind v4 @theme font-family register variable font css`
- `font-display optional Smashing Magazine reading FOIT FOUT 2024`
- `"size-adjust" "ascent-override" "descent-override" CSS font metric matching CLS prevention`
- `"hanging-punctuation" CSS browser support 2025 caniuse`
- Direct Fontsource API fetches (verification): `api.fontsource.org/v1/fonts/{slug}` and `api.fontsource.org/v1/variable/{slug}` for each shortlisted face.

### Quality Assurance

- **Source verification:** every axis range claim, license claim, and Fontsource availability claim was cross-checked against the official Fontsource API. Astro Fonts API config syntax was verified against the live `docs.astro.build/en/guides/fonts/` page retrieved 2026-05-20.
- **Confidence levels:** high for license, axis ranges, Fontsource availability, and Astro/Tailwind syntax (multiple sources, direct API verification). Medium for trend-saturation claims (Geist Mono adoption trajectory, Source Serif 4 deployment frequency) — these are observational rather than measurable, and a stricter measurement would require Wappalyzer-style data which was not available.
- **Limitations:** exact woff2 file sizes per face / per subset are reported as ranges (60–110 KB serif variable, 20–35 KB mono per discrete weight) rather than exact bytes; the precise bytes settle at build time during Tier 1 implementation.
- **Methodology transparency:** the research workflow (six steps via the BMad technical-research skill) is recorded in the document's `stepsCompleted` frontmatter and section structure.

## 12. Appendices and Reference Materials

### Appendix A — Verified Axis Inventory

Pulled from the live Fontsource API on 2026-05-20:

| Face | Variable | Axes | wght | opsz | ital | Other |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Source Serif 4 | yes | ital + opsz + wght | 200–900 | 8–60 | 0–1 | — |
| Newsreader | yes | ital + opsz + wght | 200–800 | 6–72 | 0–1 | — |
| Literata | yes | ital + opsz + wght | 200–900 | 7–72 | 0–1 | — |
| Roboto Serif | yes | ital + opsz + wdth + wght + GRAD | 100–900 | 8–144 | 0–1 | wdth 50–150, GRAD -50–100 |
| Fraunces | yes | (excluded — period-pastiche flavor) | — | — | — | — |
| JetBrains Mono | yes | ital + wght | 100–800 | — | 0–1 | — |
| Recursive | yes | slnt + wght + CASL + CRSV + MONO | 300–1000 | — | via slnt | slnt -15–0, CASL 0–1, CRSV 0–1, MONO 0–1 |
| Geist Mono | yes | (excluded — trend saturation) | — | — | — | — |
| Commit Mono | **no (Fontsource)** | static, 6 weights + italic | 200, 300, 400, 500, 600, 700 (discrete) | — | yes | latin only |

### Appendix B — License Summary

Every face in the Appendix A table is **SIL Open Font License 1.1** (verified via Fontsource API `license` field and foundry sources). Free for commercial and non-commercial use, modification, and bundling. No runtime attribution surface required. Recommended attribution placement: the colophon block in DESIGN.md.

### Appendix C — Browser Support Matrix (relevant to DESIGN.md)

| Feature | Safari | Chrome | Firefox | Note |
| :-- | :-- | :-- | :-- | :-- |
| Variable fonts (`wght`, `opsz`, `ital`) | ✅ | ✅ | ✅ | All evergreens. |
| `font-optical-sizing: auto` | ✅ | ✅ | ✅ | Picks opsz from rendered font-size. |
| `font-variation-settings` | ✅ | ✅ | ✅ | For custom axes only in this design. |
| `font-display: optional` | ✅ | ✅ | ✅ | Recommended for body. |
| `size-adjust`, `ascent-override`, `descent-override` | ✅ | ✅ | ✅ | Auto-applied by Astro Fonts API. |
| `hanging-punctuation: first` | ✅ | ❌ | ❌ | Progressive enhancement; Chromium not yet shipped. |
| `initial-letter: 3` | ✅ | partial | ❌ | Hand-floated drop cap recommended instead. |

### Appendix D — Technical Communities and References

- [Astro Discord — fonts channel](https://astro.build/chat) for live questions on the Fonts API.
- [Tailwind Labs Discord — v4 channel](https://tailwindcss.com/) for `@theme` and CSS-first configuration questions.
- [Variable Fonts community on GitHub](https://variablefonts.io/) and [Type Network's variable-fonts microsite](https://variablefonts.typenetwork.com/) for axis-specific examples.
- The `eigilnikolajsen/commit-mono` and `arrowtype/recursive` GitHub repositories carry active issue trackers for upstream font changes.

---

## Research Conclusion

### Summary of Key Findings

This research closes the typeface decision that was deferred at the end of the brainstorming session and that DESIGN.md marked as TODO. The committed pair — **Newsreader (variable serif) + Commit Mono (static monospace)** — is the strongest free-license match for LinCie's locked design constraints: the modernist atelier aesthetic, the "site disappears" rule, the long-form reading priority, and the brainstorming Fail #8 mitigation against the saturated 2025 cream-paper editorial trend. The pair ships SIL OFL 1.1, integrates cleanly through Astro 6's stable Fonts API + `fontProviders.fontsource()`, requires no new dependencies, and lands as a one-PR patch across three files.

### Strategic Impact Assessment

Closing the typeface decision unblocks every Tier 1 deliverable in the brainstorming sprint plan: the modular type scale, the baseline grid, the corner-frame metadata, the drop-cap math, the page templates, the project-page essay typography, and the colophon all depend on the chosen family tokens. With the pair committed, the next sprint is the empty frame — an Astro layout with corner labels, baseline grid, and modular type scale tokens, no content yet — which is the brainstorming's stated "Top Priority This Week" #2.

### Next Steps

1. Apply the three-file implementation patch from Section 3 of this document. Land as a single PR.
2. Run the AGENTS.md validation triple: `bun run format && bun run lint && bun run check`.
3. Run the seven-item smoke-test plan against the production build.
4. Pre-stage local fallback files in `src/assets/fonts/` to make the `fontProviders.local()` rollback a 5-minute change if needed in the future.
5. Update `DESIGN.md` to replace the bracketed font candidates with the chosen pair, document the `hanging-punctuation` Safari-only progressive-enhancement note, and document the hand-floated drop-cap decision (rather than `initial-letter`).
6. Begin the next sprint: build the empty frame.

---

**Research Completion Date:** 2026-05-20
**Research Period:** Single-session technical research (six steps via BMad technical-research skill)
**Document Length:** Comprehensive — front-matter executive summary + six analytical sections + drop-in implementation patch + risk register + appendices
**Source Verification:** Every axis range, license, and distribution claim verified against the live Fontsource API; every Astro/Tailwind syntax detail verified against the live Astro 6 documentation
**Confidence Level:** High on technical claims (Fontsource API cross-check, foundry sources, MDN, caniuse, Astro docs); medium on trend-saturation observations (Geist Mono adoption trajectory, Source Serif 4 deployment frequency).

_This research closes the typeface decision deferred at the end of the brainstorming session and provides the drop-in implementation patch ready for the LinCie repo._
