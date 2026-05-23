// src/scripts/view-transitions.ts
// Post-swap DOM updates for View Transitions.
// Updates the persisted Frame's BL section label and INDEX aria-current.
//
// No GSAP. No gates. Pure DOM updates — idempotent on every navigation.
// Loaded in BaseLayout (every page).

// ─── Update Function ──────────────────────────────────────────────────────────

function update(): void {
  // Read new page's section label from <body data-section-label>
  const sectionLabel = document.body.dataset.sectionLabel ?? "";

  // Update BL corner span text
  const blSpan = document.querySelector<HTMLElement>(
    "[data-frame='section-label']",
  );
  if (blSpan) blSpan.textContent = sectionLabel;

  // Update aria-current on INDEX link
  const indexLink = document.querySelector<HTMLAnchorElement>(
    "nav[aria-label='Site navigation'] a",
  );
  if (indexLink) {
    if (window.location.pathname === "/") {
      indexLink.setAttribute("aria-current", "page");
    } else {
      indexLink.removeAttribute("aria-current");
    }
  }
}

// ─── Lifecycle Hook ───────────────────────────────────────────────────────────
document.addEventListener("astro:after-swap", update);

// ─── Initial Run ──────────────────────────────────────────────────────────────
update();
