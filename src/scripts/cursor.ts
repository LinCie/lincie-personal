// src/scripts/cursor.ts
// Cursor afterglow — GSAP-driven warm trace with inertia and reading-zone awareness.
//
// Lifecycle: gate → register → clean → re-init
// Loaded in BaseLayout (every page).

import { gsap, REDUCED_MOTION, COARSE_POINTER } from "./gsap-init";

// ─── Instance Registry ────────────────────────────────────────────────────────
// Grows on every mousemove. Do NOT implement periodic pruning — rely on
// overwrite: "auto" (GSAP kills conflicting tweens) and cleanup() on navigation.
const instances: gsap.core.Animation[] = [];
let moveListener: ((e: MouseEvent) => void) | null = null;
let enterListener: ((e: MouseEvent) => void) | null = null;
let leaveListener: ((e: MouseEvent) => void) | null = null;
let inReadingZone = false;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  instances.forEach((i) => i.kill());
  instances.length = 0;
  if (moveListener) document.removeEventListener("mousemove", moveListener);
  const main = document.querySelector("main");
  if (main) {
    if (enterListener) main.removeEventListener("mouseenter", enterListener);
    if (leaveListener) main.removeEventListener("mouseleave", leaveListener);
  }
  moveListener = null;
  enterListener = null;
  leaveListener = null;
  inReadingZone = false;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Dual gate: no afterglow on coarse pointer or reduced motion
  if (COARSE_POINTER || REDUCED_MOTION) return;

  const el = document.getElementById("cursor-afterglow");
  if (!el) return;

  const main = document.querySelector<HTMLElement>("main");

  // Center the glow on cursor position (GSAP handles x/y from top-left origin)
  gsap.set(el, { xPercent: -50, yPercent: -50 });

  // Decay timer — fades afterglow after cursor stops
  let decayTween: gsap.core.Tween | null = null;

  // ─── Mouse Move ─────────────────────────────────────────────────────────────
  moveListener = (e: MouseEvent) => {
    // Cancel any pending decay
    if (decayTween) {
      decayTween.kill();
      decayTween = null;
    }

    // Follow cursor with ~2-frame lag inertia (~0.12s at 60fps)
    const moveTween = gsap.to(el, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.12,
      ease: "power2.out", // natural deceleration with ~1px overshoot
      overwrite: "auto",
    });
    instances.push(moveTween);

    // Ensure visible while moving — skip if in reading zone (enter/leave manages opacity there)
    if (!inReadingZone) {
      const opacityTween = gsap.to(el, {
        opacity: 1,
        duration: 0.1,
        overwrite: "auto",
      });
      instances.push(opacityTween);
    }

    // Schedule decay: fade to 0 after ~600ms of no movement
    decayTween = gsap.delayedCall(0.6, () => {
      const fadeTween = gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });
      instances.push(fadeTween);
    });
    instances.push(decayTween);
  };

  // ─── Reading Zone Awareness ──────────────────────────────────────────────────
  // Fade to 0 when cursor enters <main> body text area.
  // mouseenter/mouseleave do NOT bubble — detects <main> boundary only.
  if (main) {
    enterListener = () => {
      inReadingZone = true;
      const fadeTween = gsap.to(el, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.out",
        overwrite: "auto",
      });
      instances.push(fadeTween);
    };
    leaveListener = () => {
      inReadingZone = false;
      const fadeTween = gsap.to(el, {
        opacity: 1,
        duration: 0.2,
        ease: "power1.in",
        overwrite: "auto",
      });
      instances.push(fadeTween);
    };
    main.addEventListener("mouseenter", enterListener);
    main.addEventListener("mouseleave", leaveListener);
  }

  document.addEventListener("mousemove", moveListener);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
