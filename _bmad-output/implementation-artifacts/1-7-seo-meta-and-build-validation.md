# Story 1.7: SEO Meta & Build Validation

Status: done

## Story

As a visitor arriving from a shared link,
I want correct meta tags and OG image so the link preview looks right,
so that the site makes a good impression before I even click.

## Acceptance Criteria

1. Every page has a unique `<title>` and `<meta name="description">` naming engineering, research, design
2. OpenGraph (`og:title`, `og:description`, `og:image`) and Twitter card meta are present on every page
3. A single static OG image exists at `public/og-image.png`
4. `robots.txt` exists in `public/` and allows everything
5. No render-blocking JavaScript exists
6. `bun run build` succeeds with static output to `dist/`
7. `bun run format && bun run lint && bun run check` passes

## Tasks / Subtasks

- [x] Task 1: Extend `BaseLayout.astro` with OG and Twitter card meta (AC: #1, #2)
  - [x] 1.1: Add `ogImage` prop (optional string, defaults to `/og-image.png`) to the Props interface
  - [x] 1.2: Add `og:type` (`website`), `og:title`, `og:description`, `og:image` meta tags in `<head>`
  - [x] 1.3: Add `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image` meta tags
  - [x] 1.4: Ensure `og:title` and `twitter:title` fall back to the `title` prop when no override is provided
  - [x] 1.5: Ensure `og:description` and `twitter:description` fall back to the `description` prop
  - [x] 1.6: Ensure `og:image` and `twitter:image` use an absolute URL — construct from `Astro.site` or use a hardcoded production origin if `Astro.site` is not set

- [x] Task 2: Create the static OG image (AC: #3)
  - [x] 2.1: Create a 1200×630px PNG at `public/og-image.png`
  - [x] 2.2: The image must be a real file — not a placeholder — so the build succeeds and link previews render

- [x] Task 3: Create `public/robots.txt` (AC: #4)
  - [x] 3.1: Create `public/robots.txt` with `User-agent: *` and `Allow: /`

- [x] Task 4: Verify no render-blocking JS (AC: #5)
  - [x] 4.1: Confirm no `<script>` tags in BaseLayout or any existing page lack `type="module"` or `defer`/`async`
  - [x] 4.2: Astro's `<ClientRouter />` injects its own script — confirm it does not block rendering (it is deferred by default in Astro)
  - [x] 4.3: Document the finding in Completion Notes as: "Task 4: No render-blocking JS found. No `<script>` tags exist in BaseLayout or any page. `<ClientRouter />` injects a deferred script — not render-blocking. No code change needed."

- [x] Task 5: Run build and validation gate (AC: #6, #7)
  - [x] 5.1: Run `bun run build` — confirm static output to `dist/` with no errors
  - [x] 5.2: Run `bun run format`
  - [x] 5.3: Run `bun run lint`
  - [x] 5.4: Run `bun run check`

## Dev Notes

### Scope: One File Modified, Two Files Created

| File | Action | Notes |
|------|--------|-------|
| `src/layouts/BaseLayout.astro` | MODIFY | Add OG + Twitter card meta tags; add `ogImage` prop |
| `public/og-image.png` | CREATE | 1200×630px static PNG — required for AC #3 |
| `public/robots.txt` | CREATE | Allows all crawlers |

No other files are modified. Do NOT touch `global.css`, `typography.css`, content files, or any page.

### BaseLayout — Current State

`BaseLayout.astro` currently has this Props interface and `<head>`:

```astro
interface Props {
  title: string;
  sectionLabel?: string;
  description?: string;
}

const { title, sectionLabel, description } = Astro.props;
```

```html
<head>
  <meta charset="utf-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width" />
  <meta name="generator" content={Astro.generator} />
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <Font cssVariable="--font-newsreader" preload={[{ style: "normal" }]} />
  <Font cssVariable="--font-commit-mono" />
  <ClientRouter />
</head>
```

### BaseLayout — Target State After This Story

**CRITICAL — This is a PARTIAL replacement of `<head>` only.** The full `BaseLayout.astro` file structure (Props interface, frontmatter script, `<body>`, Frame, skip link, `<main>`, `<slot />`) must be preserved exactly. Only the `<head>` block changes. Do NOT rewrite the file from scratch — make surgical edits to the existing file.

The complete target `<head>` block (replace only the `<head>...</head>` section):

```astro
interface Props {
  title: string;
  sectionLabel?: string;
  description?: string;
  ogImage?: string;
}

const { title, sectionLabel, description, ogImage = "/og-image.png" } = Astro.props;

// Construct absolute OG image URL.
// Astro.site is undefined in dev if not set in astro.config.mjs.
// Use a safe fallback so the tag is always present and valid.
const ogImageUrl = new URL(ogImage, Astro.site ?? "https://lincie.me").href;
```

```html
<head>
  <meta charset="utf-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width" />
  <meta name="generator" content={Astro.generator} />
  <title>{title}</title>
  {description && <meta name="description" content={description} />}

  <!-- OpenGraph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  {description && <meta property="og:description" content={description} />}
  <meta property="og:image" content={ogImageUrl} />

  <!-- Twitter card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  {description && <meta name="twitter:description" content={description} />}
  <meta name="twitter:image" content={ogImageUrl} />

  <Font cssVariable="--font-newsreader" preload={[{ style: "normal" }]} />
  <Font cssVariable="--font-commit-mono" />
  <ClientRouter />
</head>
```

**The `<body>` block is unchanged — do not touch it:**

```astro
<body class="bg-paper text-ink">
  <!-- Skip to content: visually hidden until focused -->
  <a href="#main-content" class="skip-to-content">Skip to content</a>

  <!-- Frame: persists across View Transitions -->
  <Frame sectionLabel={sectionLabel} transition:persist />

  <!-- Main content: cross-fades on navigation -->
  <main id="main-content" tabindex="-1" transition:animate="fade">
    <slot />
  </main>
</body>
```

**Key decisions:**
- `ogImage` prop is optional with a default of `/og-image.png` — callers never need to pass it unless they have a page-specific image (no pages do at MVP)
- `new URL(ogImage, Astro.site ?? "https://lincie.me").href` — OG image URLs must be absolute. `Astro.site` is the canonical way to get the production origin in Astro; the fallback `"https://lincie.me"` ensures the tag is always valid even in dev
- `og:type` is `"website"` — correct for all pages at MVP (no article/product types needed)
- Twitter card type is `"summary_large_image"` — correct for a 1200×630 OG image
- OG and Twitter tags are conditional on `description` existing — same pattern as the existing `<meta name="description">` tag. All current pages pass `description`, so this is safe. **Important:** `description` is optional in the Props interface, which means a future page that omits it would silently drop OG tags. This is acceptable at MVP (all current pages provide descriptions), but if you add a new page without a description, either add a description or make the OG tags fall back to a site-level default. Do NOT change `description` to required — that would break the existing Props contract.
- Do NOT add `og:url` — it requires knowing the canonical URL per page, which is not in scope for this story

### Existing Pages — No Changes Needed

All existing pages already pass `title` and `description` to BaseLayout:

| Page | title | description |
|------|-------|-------------|
| `index.astro` | `"LinCie"` | `"LinCie is a thinker who builds — engineering, research, and design as one voice."` |
| `404.astro` | `"404 — Not Found"` | `"This page seems to have been left out of the index."` |

AC #1 is satisfied by the existing `<title>` and `<meta name="description">` tags — no page-level changes needed.

**Note on AC #1 wording:** The AC says descriptions should "name engineering, research, design." The home page description does this explicitly. The 404 description ("This page seems to have been left out of the index.") does not — this is intentional and acceptable. The 404 is a utility page, not a landing page. The AC's intent is that the site's primary pages communicate LinCie's domain; the 404 is exempt by design.

### OG Image — `public/og-image.png`

The architecture specifies "a single static OG image at `public/og-image.png`" (NFR-12, architecture §Project Structure). This is an MVP placeholder — per-page OG image generation is deferred to v1.1.

**Requirements:**
- Dimensions: 1200×630px (standard OG image size, required for `summary_large_image` Twitter card)
- Format: PNG
- Location: `public/og-image.png` (Astro copies `public/` to `dist/` verbatim)
- Content: Must be a real, valid PNG file — not a 0-byte placeholder

**Minimal approach:** Create a simple 1200×630 PNG with a warm paper-tone background and the text "LinCie" in a readable font. The image does not need to be pixel-perfect — it needs to be a valid PNG that renders in link previews.

**If image creation tooling is unavailable:** The project bans new dependencies (`package.json` is frozen — no `canvas`, `sharp`, `jimp`, or similar). Use one of these dependency-free approaches:

1. **Bun built-in:** Write a temporary script `scripts/gen-og.ts` that uses the `Bun.write()` API to write a minimal valid PNG binary. A 1200×630 solid-color PNG can be constructed from raw PNG chunks (IHDR + IDAT + IEND) without any library. Delete the script after running it.
2. **ImageMagick (if available on the system):** `convert -size 1200x630 xc:"#f7f3ee" -font Helvetica -pointsize 72 -fill "#2e2a24" -gravity center -annotate 0 "LinCie" public/og-image.png`
3. **Fallback — copy an existing PNG:** If neither approach works, copy any valid PNG from `src/assets/` and resize it. The image content is secondary to it being a valid PNG file.

The file must exist and be a valid PNG before `bun run build` is called. Delete any temporary generation script after the file is created.

**Do NOT:**
- Leave `public/og-image.png` as a 0-byte file (invalid PNG, link previews will break)
- Reference an external image URL in the `og:image` tag (violates NFR-5: no third-party scripts/resources)
- Use a `.jpg` or `.webp` — the architecture specifies `.png`

### `public/robots.txt`

```
User-agent: *
Allow: /
```

This is the complete file. Two lines. No `Sitemap:` directive (no sitemap at MVP). No `Disallow:` rules. Astro copies `public/` to `dist/` verbatim — `dist/robots.txt` will be served at `https://lincie.me/robots.txt`.

### Render-Blocking JS — Verification Only

Astro's `<ClientRouter />` (View Transitions) injects a small inline script. In Astro 6, this script is not render-blocking — it runs after the DOM is parsed. No `<script>` tags exist in BaseLayout or any current page (Stories 1.1–1.6 added no client-side scripts). This task is a verification pass, not a code change.

**Expected finding:** No render-blocking JS. Document in Completion Notes.

### `Astro.site` — Not Currently Set

`astro.config.mjs` does not currently set `site`. The `new URL(ogImage, Astro.site ?? "https://lincie.me").href` pattern handles this safely:
- In dev: `Astro.site` is `undefined` → fallback `"https://lincie.me"` is used → OG image URL is `"https://lincie.me/og-image.png"`
- In production (Vercel): `Astro.site` is still `undefined` unless set → same fallback applies

This is acceptable for MVP. Adding `site: "https://lincie.me"` to `astro.config.mjs` would be cleaner but is not required by the story's ACs. Do NOT modify `astro.config.mjs` unless the `new URL` approach fails TypeScript type checking — in that case, add `site: "https://lincie.me"` to the config.

### TypeScript — `Astro.site` Type

`Astro.site` is typed as `URL | undefined` in Astro 6. The expression `Astro.site ?? "https://lincie.me"` produces `URL | string`. `new URL(ogImage, URL | string)` is valid — `URL` is an accepted base argument. No type cast needed.

### Accessibility — No New Interactive Elements

This story adds only `<meta>` tags and static files. No new interactive elements, no ARIA changes, no focus state changes. Existing accessibility is unaffected.

### ESLint / Astro Check — Expected Clean Pass

No new JSX, no new components, no new scripts. The only Astro file change is adding `<meta>` tags to `<head>`. ESLint's `jsx-a11y` rules do not apply to `<meta>` tags. `bun run check` should pass with 0 errors.

### What This Story Does NOT Include

- No `og:url` per page (requires canonical URL resolution — deferred)
- No per-page OG image generation (deferred to v1.1 per architecture)
- No sitemap (deferred per architecture)
- No RSS feed (deferred per architecture)
- No `site:` in `astro.config.mjs` (not required by ACs — optional improvement)
- No Twitter/X handle meta (`twitter:site`, `twitter:creator`) — not in spec
- No `<link rel="canonical">` — not in spec for this story
- No changes to page-level files (`index.astro`, `404.astro`)
- No changes to `global.css`, `typography.css`, content files, or scripts

### Previous Story Learnings (from Stories 1.5 and 1.6)

These apply to BaseLayout specifically — preserve all of them when editing the file:

- `ClientRouter` from `'astro:transitions'` — do not change this import
- `transition:persist` on `<Frame>` — do not remove
- `tabindex="-1"` on `<main>` — required for Safari skip-link behavior — do not remove
- `bg-paper text-ink` on `<body>` — do not remove
- `id="main-content"` on `<main>` — required for skip-to-content link — do not remove
- `transition:animate="fade"` on `<main>` — do not remove

### Anti-Patterns to Avoid

- ❌ Do NOT rewrite `BaseLayout.astro` from scratch — make surgical edits only; preserve `<body>` exactly
- ❌ Do NOT set `og:image` to a relative path — OG image URLs must be absolute
- ❌ Do NOT reference an external image CDN for `og:image` — violates NFR-5
- ❌ Do NOT leave `public/og-image.png` as a 0-byte or missing file — invalid PNG breaks link previews
- ❌ Do NOT install new dependencies to generate the OG image — `package.json` is frozen
- ❌ Do NOT add `og:url` — requires per-page canonical URL, not in scope
- ❌ Do NOT modify `astro.config.mjs` unless TypeScript forces it
- ❌ Do NOT add `<script>` tags to BaseLayout in this story
- ❌ Do NOT use `set:html` for any meta content — use template expressions `{title}`
- ❌ Do NOT add `twitter:site` or `twitter:creator` — not in spec
- ❌ Do NOT add `<link rel="canonical">` — not in spec for this story
- ❌ Do NOT change `description` from optional to required in Props — breaks existing contract

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] — `public/og-image.png` location
- [Source: _bmad-output/planning-artifacts/architecture.md#Component & File Organization] — BaseLayout owns meta tags
- [Source: NFR-12: SEO — per-page title and meta description, OG and Twitter card, robots.txt]
- [Source: NFR-5: Security — no third-party scripts]
- [Source: AGENTS.md#Styling rules]
- [Source: AGENTS.md#Accessibility]
- [Source: AGENTS.md#Required validation order]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- OG image created via raw PNG chunk construction (Bun script `scripts/gen-og.ts`, deleted after use) — ImageMagick not available on system. Output: 11,109-byte valid PNG at `public/og-image.png`.
- `Astro.site` is not set in `astro.config.mjs`; `new URL(ogImage, Astro.site ?? "https://lincie.me").href` fallback used — TypeScript check passed with 0 errors.

### Completion Notes List

- Task 1: Added `ogImage` prop (optional, defaults to `/og-image.png`) to `BaseLayout.astro`. Added OG and Twitter card meta tags to `<head>`. Absolute URL constructed via `new URL(ogImage, Astro.site ?? "https://lincie.me").href`. All tags conditional on `description` existing, matching existing pattern. `<body>` block preserved exactly.
- Task 2: Created `public/og-image.png` — 1200×630px, 11,109-byte valid PNG with warm paper-tone background (#f7f3ee). Generated via dependency-free raw PNG binary construction. Temporary script deleted after use.
- Task 3: Created `public/robots.txt` with `User-agent: *` and `Allow: /`.
- Task 4: No render-blocking JS found. No `<script>` tags exist in BaseLayout or any page. `<ClientRouter />` injects a deferred script — not render-blocking. No code change needed.
- Task 5: `bun run build` succeeded — static output to `dist/`, 2 pages built. `bun run format` ran (BaseLayout.astro reformatted by Prettier). `bun run lint` passed (0 errors). `bun run check` passed (0 errors, 0 warnings, 0 hints across 10 files).

### File List

- `src/layouts/BaseLayout.astro` — modified (added `ogImage` prop, OG meta, Twitter card meta)
- `public/og-image.png` — created (1200×630px static PNG)
- `public/robots.txt` — created

### Change Log

- 2026-05-22: Story 1.7 implemented — added OG/Twitter card meta to BaseLayout, created static OG image (1200×630px PNG), created robots.txt. All ACs satisfied. Build and validation gate passed.

## Review Findings

- [x] [Review][Patch] Empty string `ogImage` prop bypasses default and resolves to site root URL [`src/layouts/BaseLayout.astro`] — fixed: coerce empty string to default before `new URL()`.
- [x] [Review][Patch] Missing `og:image:width` and `og:image:height` meta tags [`src/layouts/BaseLayout.astro`] — fixed: added static 1200/630 dimension tags after `og:image`.
- [x] [Review][Patch] Missing `twitter:image:alt` meta tag [`src/layouts/BaseLayout.astro`] — fixed: added `{description && <meta name="twitter:image:alt" content={description} />}` after `twitter:image`.
- [x] [Review][Defer] `Astro.site` not set in `astro.config.mjs` — fallback `"https://lincie.me"` is always active [`astro.config.mjs`] — deferred, pre-existing. Story Dev Notes acknowledge this as acceptable at MVP.
- [x] [Review][Defer] Non-HTTPS or `data:` absolute `ogImage` values bypass base URL resolution [`src/layouts/BaseLayout.astro`] — deferred, pre-existing. No current caller passes non-HTTPS values; future-caller concern.
- [x] [Review][Defer] Missing `og:url` tag [`src/layouts/BaseLayout.astro`] — deferred, pre-existing. Explicitly excluded from scope in Dev Notes (requires per-page canonical URL).
- [x] [Review][Defer] `og:type` hardcoded to `"website"` for all pages [`src/layouts/BaseLayout.astro`] — deferred, pre-existing. Only `website`-type pages exist at MVP; article/blog types deferred to Epic 2.
- [x] [Review][Defer] `robots.txt` missing `Sitemap:` directive [`public/robots.txt`] — deferred, pre-existing. No sitemap at MVP per Dev Notes.
