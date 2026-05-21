# Product

## Register

brand

## Users

The site addresses three audiences in priority order.

**Primary: recruiters and hiring managers.** Scanning quickly, often on a tight time budget, weighing depth of thinking and quality of craft against many other portfolios. They land via direct link or LinkedIn. They need to understand within seconds what LinCie does and decide whether to keep reading.

**Primary: potential collaborators.** Designers, engineers, and researchers considering working with LinCie on projects, essays, or research. They land via referral, social, or by following a project. They are reading carefully, looking for signs of taste, rigor, and a compatible working voice.

**Secondary: curious visitors.** Drawn in from a writing piece, a project, or a link from someone they trust. They are not deciding anything; they are spending time. They reward depth and pacing.

The job to be done across all three: form an accurate impression of LinCie as a thinker who builds, with enough evidence on the page that no further explanation is needed.

## Product Purpose

A personal site for LinCie, hosting projects, writing, and a colophon. The site is the work, not a frame around it. Its purpose is to evidence quiet confidence and considered craft through the experience of using it, so that the right opportunities and collaborators self-select.

Projects are presented as exhibition pieces (3 to 5 deeply developed entries, not many lighter ones). Writing is treated as first-class content with real essay typography. The home page introduces, the project pages exhibit, the writing thinks aloud.

Success looks like a quiet "that's cool" reaction, a recruiter or collaborator reaching out unprompted because the site already answered their questions, and a small but high-fit funnel rather than a large indifferent one.

## Brand Personality

Quiet, decisive, sharp. Low words, high signal. Three words: **considered, disciplined, warm**.

The site speaks the way the maker thinks: state things as facts, trust the visitor, never push. Headlines do not announce; they are simply present. Body text reads like an edited essay, not a pitch deck. Metadata is set in monospace and treated as the museum wall label, not the headline. The voice never uses exclamation points, never says "passionate about", never lists buzzwords.

The mood is a tea room rather than a museum lobby: one element per viewport, deliberate focus, generous empty space, base state utterly still. One concession to warmth: a faint warm trace that follows the cursor like a fingerprint of where the visitor has been.

The identity is **a thinker who builds**. Engineering, research, and design are expressions of the same considered voice, not separate hats.

## Anti-references

The site must not look or feel like:

- Walls of buzzwords, "passionate about X" copy, exclamation points, hero claims that announce the maker.
- Glassmorphism, equal-tile card grids, gradient meshes, neumorphism, 3D blobs, neon accents, the hero-metric template (big number, small label, supporting stats, gradient accent).
- The 2014 SaaS portfolio: dense feature cards, oversized CTAs, social-proof rails, primary-color buttons.
- The 2025 trend-cycle cream-paper editorial portfolio with IBM Plex Mono everywhere, sterile and identical to fifty others.
- Wes Anderson twee or themed iconography (decorative crop marks, fake stamps, sectional § marginalia).
- Antiquarian or parchment aesthetics: fake aging, paper grain, deckled edges, period-pastiche typography. Modernist atelier, not academic dust.
- The modern museum lobby that shows off its own architecture. The frame should not call attention to itself.
- Slide-in-from-below hero reveals, scroll-jacking, snap scrolling, parallax theater.
- Sticky navigation chrome, over-prominent CTAs, contact forms with five fields.

## Design Principles

1. **Quiet Confidence.** State things as facts. No exclamation, no "passionate about", no announcements. Trust the visitor to read.
2. **Craft as Proof.** The site itself demonstrates perfectionism through pixel-level care, restrained timing, and edited copy. Replaces an "I am detail-oriented" claim with the lived experience of detail.
3. **Substance over Performance.** The work and the writing carry the meaning. No theatrics, no "look at everything I can do." The site behaves like the maker: deliberate, edited, willing to go back and rewrite.
4. **Patient Pacing.** Content unfolds at its own speed. Long generous pages, breathing room between sections, scroll velocity gently dampened. Reading and exploring are meditative, not transactional.
5. **Long Half-Life.** Choose decisions that age well. Avoid trend-bound aesthetics (glassmorphism, gradient meshes, neumorphism, 3D blobs, neon-on-black). The site should still read as considered in five years.

## Accessibility & Inclusion

- Target: **WCAG 2.2 AA**.
- Semantic HTML first; ARIA only where semantic HTML is insufficient.
- Color contrast meets AA for body text (4.5:1) and large text (3:1) at every step of the time-of-day background drift, including pre-dawn, midday, dusk, and night variants.
- Keyboard navigation works for every interactive element, with visible focus states that respect the same ink-on-paper aesthetic as hover states.
- All animation, including the cursor afterglow, page reveal sequence, scroll-driven footnote reveal, project spine, and section pin, respects `prefers-reduced-motion`. The reduced-motion path lets content arrive instantly with full information; nothing essential is gated behind motion.
- Damped smooth scroll (Lenis-style) is disabled on `pointer: coarse` so touchscreens use native inertia.
- Honest first paint: `<title>`, `<meta name="description">`, and the first one or two lines of body content state plainly what LinCie does, so a fast-scanning recruiter is not punished by the slow-burn opening.
- Non-decorative images carry meaningful `alt` text. Project hero images have descriptive alt; the cursor afterglow and time-of-day drift are decorative and excluded from assistive announcements.
