// src/scripts/gsap-init.ts
// Single GSAP entry point for the lincie project.
//
// RULES (enforced by architecture):
//   - This is the ONLY file that imports from 'gsap' or 'gsap/ScrollTrigger'.
//   - All other scripts import { gsap, ScrollTrigger } from './gsap-init'.
//   - No other GSAP plugins are imported (no Flip, Draggable, MotionPath, etc.).
//   - Vite tree-shakes and deduplicates — one GSAP copy ships regardless of
//     how many scripts import from this file.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once, globally.
// All scripts that use ScrollTrigger rely on this registration.
gsap.registerPlugin(ScrollTrigger);

// ─── Feature Gate Constants ───────────────────────────────────────────────────
// Evaluated once at module load time. These are constants — never re-evaluated.
// Scripts import these and use them as early-exit guards in their init() functions.
//
// REDUCED_MOTION: true → skip all GSAP animation, paint final state instantly.
// COARSE_POINTER: true → disable cursor-dependent and scroll-normalization features.

export const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

export const COARSE_POINTER = window.matchMedia("(pointer: coarse)").matches;

// ─── Global Ticker Lifecycle ──────────────────────────────────────────────────
// Pause the GSAP ticker when the tab is hidden; resume when visible.
// This prevents background animation from consuming CPU/battery and prevents
// zombie tickers from accumulating across navigations.
//
// Note: This listener is intentionally NOT cleaned up on astro:before-swap.
// It is a global, document-level concern that should persist for the lifetime
// of the page session. Individual scripts manage their own instance cleanup.

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    gsap.globalTimeline.pause();
  } else {
    gsap.globalTimeline.resume();
  }
});

// ─── Exports ──────────────────────────────────────────────────────────────────
// Re-export gsap and ScrollTrigger so all other scripts import from here.

export { gsap, ScrollTrigger };
