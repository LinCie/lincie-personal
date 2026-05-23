// src/scripts/reveal.ts
// Page reveal sequence — one-shot GSAP timeline, fires once per session.
//
// Lifecycle: gate → register → clean → re-init → session memory
// Loaded in BaseLayout (every page).

import { gsap, REDUCED_MOTION } from "./gsap-init";

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY = "reveal-played";

// ─── Instance Registry ────────────────────────────────────────────────────────
const instances: gsap.core.Animation[] = [];

// ─── SessionStorage Helpers (try/catch for private browsing) ──────────────────
function hasPlayed(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

function markPlayed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Graceful degradation: reveal may play again on next navigation
  }
}

// ─── Paint Final State ────────────────────────────────────────────────────────
// Used when reveal has already played OR reduced-motion is active.
// Ensures corners are visible and title is at final weight.
function paintFinalState(): void {
  const corners = document.querySelectorAll<HTMLElement>(
    "[data-reveal='corner']",
  );
  corners.forEach((el) => {
    el.style.opacity = "1";
  });
  const title = document.querySelector<HTMLElement>("main h1:not(.sr-only)");
  if (title) title.style.fontWeight = "400";
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Already played this session → paint final state, bail
  if (hasPlayed()) {
    paintFinalState();
    return;
  }

  const corners = document.querySelectorAll<HTMLElement>(
    "[data-reveal='corner']",
  );
  const grid = document.querySelector<HTMLElement>("[data-reveal='grid']");
  const title = document.querySelector<HTMLElement>("main h1:not(.sr-only)");

  // If no corners found, nothing to reveal — bail
  if (corners.length === 0) return;

  // Gate: reduced motion → paint final state, mark played, return
  if (REDUCED_MOTION) {
    paintFinalState();
    markPlayed();
    return;
  }

  // Corners start at opacity 0 via CSS ([data-reveal="corner"] { opacity: 0 })
  // No gsap.set needed — CSS handles the initial hidden state.

  // Build timeline
  const tl = gsap.timeline({
    onComplete: () => {
      markPlayed();
    },
  });

  // Step 1: Corner labels fade in (~300ms)
  tl.to(corners, { opacity: 1, duration: 0.3, ease: "power1.out" });

  // Step 2: Baseline grid flash (~200ms in, hold ~400ms, ~200ms out = ~800ms total)
  if (grid) {
    tl.to(grid, { opacity: 0.03, duration: 0.2, ease: "power1.in" });
    tl.to(grid, { opacity: 0, duration: 0.2, ease: "power1.out" }, "+=0.4");
  }

  // Step 3: Title font-weight 300→400 (~400ms)
  if (title) {
    tl.to(title, { fontWeight: 400, duration: 0.4, ease: "power1.out" });
  }

  instances.push(tl);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
