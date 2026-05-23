// src/scripts/paper-tone.ts
// Time-of-day paper-tone drift.
// Loaded in BaseLayout (every page).
//
// NOT gated on REDUCED_MOTION or COARSE_POINTER — paper-tone is information,
// not motion. Runs on every device under every accessibility preference.

// ─── Band Definitions ─────────────────────────────────────────────────────────
// Four OKLCH values, one per time-of-day band.
// All bands verified for WCAG 2.2 AA contrast against --ink and --meta.
// Midday matches the :root default in global.css (no visual change at midday).

const BAND_PREDAWN = "oklch(0.94 0.006 80)"; // 04:00–07:00 cool grey-cream
const BAND_MIDDAY = "oklch(0.97 0.008 80)"; // 07:00–16:00 warm white-cream (default)
const BAND_DUSK = "oklch(0.93 0.012 75)"; // 16:00–20:00 warm cream-amber
const BAND_NIGHT = "oklch(0.91 0.006 80)"; // 20:00–04:00 cool warm-grey

// ─── Band Resolution ──────────────────────────────────────────────────────────
function getBand(hour: number): string {
  if (hour >= 4 && hour < 7) return BAND_PREDAWN;
  if (hour >= 7 && hour < 16) return BAND_MIDDAY;
  if (hour >= 16 && hour < 20) return BAND_DUSK;
  return BAND_NIGHT; // 20:00–04:00
}

// ─── Apply Band ───────────────────────────────────────────────────────────────
function applyBand(): void {
  const hour = new Date().getHours();
  const band = getBand(hour);
  document.documentElement.style.setProperty("--paper-tone", band);
}

// ─── Instance Registry ────────────────────────────────────────────────────────
const intervals: ReturnType<typeof setInterval>[] = [];
let visibilityHandler: (() => void) | null = null;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  intervals.forEach((id) => clearInterval(id));
  intervals.length = 0;

  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Apply the correct band immediately on load.
  applyBand();

  // Only start the interval if the tab is currently visible.
  // If the tab is opened in the background (or restored from bfcache while
  // hidden), skip the interval — the visibilitychange handler will start it
  // when the visitor actually switches to the tab.
  if (!document.hidden) {
    const id = setInterval(applyBand, 60_000);
    intervals.push(id);
  }

  // Pause polling when tab is hidden; re-apply and restart when visible.
  // This prevents background ticking and ensures the band is correct
  // when the visitor returns to the tab after a long absence.
  visibilityHandler = () => {
    if (document.hidden) {
      intervals.forEach((i) => clearInterval(i));
      intervals.length = 0;
    } else {
      // Clear any stale intervals before restarting — guards against rapid or
      // duplicate visibilitychange events stacking multiple intervals.
      intervals.forEach((i) => clearInterval(i));
      intervals.length = 0;
      // Re-apply immediately in case the band changed while hidden.
      applyBand();
      const newId = setInterval(applyBand, 60_000);
      intervals.push(newId);
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();
