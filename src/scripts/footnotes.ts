// src/scripts/footnotes.ts
// Reverse-scroll footnote reveal with one-time hint.
// Loaded only on long-form pages (project + essay).

import {
  gsap,
  ScrollTrigger,
  REDUCED_MOTION,
  COARSE_POINTER,
} from "./gsap-init";

// ─── Constants ────────────────────────────────────────────────────────────────
// HINT_KEY is computed at call time (inside showHint), not at module load.
// Module-level evaluation would capture the initial pathname and become stale
// after Astro View Transitions change the URL without reloading the module.

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
  // Kill any in-progress opacity tweens on the margin element directly.
  // These are not tracked in instances[] (see Init) — killTweensOf handles them.
  gsap.killTweensOf(document.getElementById("footnote-margin"));
  // Remove any hint element left over from an interrupted animation.
  // The hint is identified by data-footnote-hint so cleanup() can find it
  // without holding a module-level reference to the DOM node.
  document.querySelector("[data-footnote-hint]")?.remove();
}

// ─── Hint ─────────────────────────────────────────────────────────────────────
function showHint(): void {
  // Compute key at call time — pathname is correct after View Transitions.
  const hintKey = `footnote-hint-shown-${window.location.pathname}`;
  if (sessionStorage.getItem(hintKey)) return;

  // Inject hint element — positioned near the spine (left edge of viewport)
  const hint = document.createElement("div");
  hint.setAttribute("aria-hidden", "true");
  hint.dataset.footnoteHint = "true"; // selector used by cleanup() to remove on navigation
  hint.style.cssText = [
    "position: fixed",
    "left: 1.5rem",
    "bottom: 3rem",
    "font-family: var(--font-mono)",
    "font-size: 0.65rem",
    "color: var(--meta)",
    "letter-spacing: 0.05em",
    "opacity: 0",
    "pointer-events: none",
    "z-index: 10",
  ].join(";");
  hint.textContent = "footnotes reveal as you re-read";
  document.body.appendChild(hint);

  // Mark as shown before animating — prevents double-fire on rapid scroll
  sessionStorage.setItem(hintKey, "1");

  const tl = gsap.timeline({
    onComplete: () => {
      hint.remove();
    },
  });
  tl.to(hint, { opacity: 1, duration: 0.25, ease: "none" })
    .to(hint, { opacity: 1, duration: 2 })
    .to(hint, { opacity: 0, duration: 0.25, ease: "none" });

  instances.push(tl);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  const marginEl = document.getElementById("footnote-margin");
  if (!marginEl) return; // not a long-form page, or no footnotes on this page

  // Gate: under reduced motion or coarse pointer, footnotes are always visible
  if (REDUCED_MOTION || COARSE_POINTER) {
    marginEl.style.opacity = "1";
    return;
  }

  // Scroll-direction detection via ScrollTrigger onUpdate velocity
  const trigger = ScrollTrigger.create({
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const velocity = self.getVelocity();

      if (velocity < 0) {
        // Reverse scroll — reveal footnotes
        showHint();
        // overwrite: true kills any in-progress tween on marginEl before starting.
        // Tweens are NOT pushed to instances[] — they are ephemeral and managed
        // via gsap.killTweensOf(marginEl) in cleanup() to avoid unbounded array growth.
        gsap.to(marginEl, {
          opacity: 1,
          duration: 0.25,
          ease: "none",
          overwrite: true,
        });
      } else if (velocity > 0) {
        // Forward scroll — hide footnotes
        gsap.to(marginEl, {
          opacity: 0,
          duration: 0.25,
          ease: "none",
          overwrite: true,
        });
      }
    },
  });
  instances.push(trigger);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
