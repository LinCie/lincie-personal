// src/scripts/scroll.ts
// Scroll behaviors — damped scroll, section pin, fog-lifting.
// Loaded only on long-form pages (project + essay).

import {
  gsap,
  ScrollTrigger,
  REDUCED_MOTION,
  COARSE_POINTER,
} from "./gsap-init";

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// Tracks h2 elements that had inline styles applied by initSectionPin().
// Cleared in cleanup() so styles don't persist on reused DOM nodes.
const pinnedHeadings: HTMLElement[] = [];

// Tracks elements that had inline filter applied by initFogLifting().
// Cleared in cleanup() so blur doesn't persist on reused DOM nodes.
const foggedElements: HTMLElement[] = [];

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;

  // Remove inline styles set by initSectionPin() so they don't persist
  // on DOM nodes reused across View Transitions (transition:persist).
  pinnedHeadings.forEach((el) => {
    el.style.backgroundColor = "";
    el.style.zIndex = "";
  });
  pinnedHeadings.length = 0;

  // Remove inline filter styles set by initFogLifting()
  foggedElements.forEach((el) => {
    el.style.filter = "";
  });
  foggedElements.length = 0;
}

// ─── Section Pin ──────────────────────────────────────────────────────────────
function initSectionPin(): void {
  // Gate: no pin under reduced motion (FR-24)
  if (REDUCED_MOTION) return;
  // Gate: no pin on mobile — UX-DR2
  if (window.innerWidth < 768) return;

  const proseBody = document.querySelector("[data-prose-body]");
  if (!proseBody) return; // not a long-form page — guard anyway

  const headings = proseBody.querySelectorAll<HTMLElement>("h2");
  headings.forEach((el) => {
    // Apply background so body text scrolling underneath doesn't show through
    el.style.backgroundColor = "var(--paper)";
    // Ensure pinned heading sits above scrolling body text
    el.style.zIndex = "10";
    // Track for cleanup so styles are removed on navigation
    pinnedHeadings.push(el);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      // Clamp to page bottom so the last h2 always releases — if there is
      // less than 30vh of scroll depth below the heading, +=30vh would never
      // be reached and the heading would stay pinned past the Colophon.
      end: "bottom bottom",
      pin: true,
      pinSpacing: false,
    });
    instances.push(trigger);
  });
}

// ─── Fog Lifting ──────────────────────────────────────────────────────────────
function initFogLifting(): void {
  // Gate: no blur under reduced motion (FR-20)
  if (REDUCED_MOTION) return;

  const proseBody = document.querySelector("[data-prose-body]");
  if (!proseBody) return; // not a long-form page — guard anyway

  const elements = proseBody.querySelectorAll<HTMLElement>(":scope > *");
  elements.forEach((el) => {
    // Only blur elements that are below the fold at init time.
    // Elements already in the viewport should not start blurred.
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) return;

    // Apply initial blur inline — removed in cleanup()
    el.style.filter = "blur(7px)";
    foggedElements.push(el);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const tween = gsap.to(el, {
          filter: "blur(0px)",
          duration: 0.4,
          ease: "none",
          overwrite: true,
          // clearProps removes the inline filter entirely after the tween,
          // preventing a stacking context from persisting on the element
          // (relevant for Safari when the element is also a section-pin target).
          clearProps: "filter",
        });
        instances.push(tween);
      },
    });
    instances.push(trigger);
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Damped smooth scroll — gates on COARSE_POINTER || REDUCED_MOTION (FR-23)
  if (!(COARSE_POINTER || REDUCED_MOTION)) {
    const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
    if (normalizer) instances.push(normalizer);
  }

  // Section pin — gates on REDUCED_MOTION + viewport width (FR-24, UX-DR2)
  initSectionPin();

  // Fog-lifting — gates on REDUCED_MOTION (FR-20)
  initFogLifting();

  // Recalculate all trigger positions after all behaviors are registered,
  // deferred until fonts are ready so Newsreader metrics are used for layout
  // calculations rather than the fallback font (prevents FOUT-shifted offsets).
  void document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
