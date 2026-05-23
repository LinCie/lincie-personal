// src/scripts/scroll.ts
// Scroll behaviors — damped scroll, section pin, fog-lifting.
// Loaded only on long-form pages (project + essay).

import {
  gsap,
  ScrollTrigger,
  REDUCED_MOTION,
  COARSE_POINTER,
} from "./gsap-init";

// Suppress unused-import warning — gsap is used by future stories (4.2, 4.3)
// that will extend this file with timelines and ScrollTrigger instances.
void gsap;

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: { kill: () => void }[] = [];

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
}

// ─── Damped Smooth Scroll ─────────────────────────────────────────────────────
function init(): void {
  // Dual gate: no damped scroll on coarse pointer or reduced motion
  if (COARSE_POINTER || REDUCED_MOTION) return;

  // Damped smooth scroll via ScrollTrigger.normalizeScroll()
  // momentum ~0.09 = lerp ~0.08–0.1 per architecture spec (FR-23)
  const normalizer = ScrollTrigger.normalizeScroll({ momentum: 0.09 });
  if (normalizer) instances.push(normalizer);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
