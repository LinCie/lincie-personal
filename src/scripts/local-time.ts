// src/scripts/local-time.ts
// Live local time in TR corner.
// Loaded in BaseLayout (every page).
//
// NOT gated on REDUCED_MOTION or COARSE_POINTER — local time is information,
// not motion. Runs on every device under every accessibility preference.

// ─── Time Formatting ──────────────────────────────────────────────────────────
function getTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} LOCAL`;
}

// ─── Apply Time ───────────────────────────────────────────────────────────────
function applyTime(): void {
  const el = document.querySelector<HTMLElement>('[data-frame="local-time"]');
  if (!el) return;
  el.textContent = getTimeString();
}

// ─── Instance Registry ────────────────────────────────────────────────────────
// Holds both setTimeout and setInterval IDs — clearInterval cancels both in
// all browsers, and ReturnType<typeof setInterval> covers both in TypeScript.
const timers: ReturnType<typeof setInterval>[] = [];
let visibilityHandler: (() => void) | null = null;

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  timers.forEach((id) => clearInterval(id));
  timers.length = 0;

  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

// ─── Aligned Scheduling ───────────────────────────────────────────────────────
// Fires applyTime at the next wall-clock minute boundary, then every 60s.
// This ensures the display updates within ~1s of the real minute change rather
// than up to 59s after it (the drift that a bare setInterval would cause).
function startAligned(): void {
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  const timeoutId = setTimeout(() => {
    // Remove the timeout ID from the registry — it has fired.
    const idx = timers.indexOf(timeoutId);
    if (idx !== -1) timers.splice(idx, 1);

    applyTime();
    const intervalId = setInterval(applyTime, 60_000);
    timers.push(intervalId);
  }, msUntilNextMinute);

  timers.push(timeoutId);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
  // Apply the correct time immediately on load.
  applyTime();

  // Only start the aligned scheduler if the tab is currently visible.
  if (!document.hidden) {
    startAligned();
  }

  visibilityHandler = () => {
    if (document.hidden) {
      timers.forEach((i) => clearInterval(i));
      timers.length = 0;
    } else {
      // Clear stale timers before restarting — guards against rapid/duplicate events.
      timers.forEach((i) => clearInterval(i));
      timers.length = 0;
      applyTime();
      startAligned();
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

// ─── Lifecycle Hooks ──────────────────────────────────────────────────────────
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:after-swap", init);

// ─── Initial Run ──────────────────────────────────────────────────────────────
init();

export {};
