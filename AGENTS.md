# AGENTS.md

## Authority and scope

This file is the authoritative instruction set for AI agents working in this repository. Follow it before applying general defaults or assumptions. If a user request conflicts with this file, ask for clarification unless the user explicitly overrides these instructions.

Project: `lincie`  
Package manager: Bun  
Runtime requirement from `package.json`: Node.js `>=22.12.0`  
Framework: Astro  
Styling: Tailwind CSS  
Animation: Tailwind CSS animations for simple motion; GSAP for complex animation.

## Package manager rules

Use Bun for all package and script operations.

Do not use `npm`, `pnpm`, or `yarn` commands unless the user explicitly asks for them or there is a documented repository-specific reason.

Use the scripts defined in `package.json`; do not invent alternate commands unless there is a specific, justified reason.

## Available package scripts

```bash
bun run dev
bun run build
bun run preview
bun run astro
bun run format
bun run lint
bun run check
```

Script purposes:

- `bun run dev`: start the Astro development server.
- `bun run build`: create a production Astro build.
- `bun run preview`: preview the production build locally.
- `bun run astro`: run the Astro CLI directly.
- `bun run format`: format source files with Prettier.
- `bun run lint`: lint source files with ESLint.
- `bun run check`: run Astro type and project checks.

## Required validation order

Before declaring work complete, run these commands in this exact order:

```bash
bun run format
bun run lint
bun run check
```

Do not skip, reorder, or substitute these commands. If any command fails, fix the underlying issue and rerun the sequence from the failed command onward. Report any remaining failure exactly, including the command that failed and the relevant error output.

## Styling rules

Use Tailwind CSS for styling by default.

Only write custom CSS when Tailwind cannot cleanly express the requirement. Before adding custom CSS, verify that the same result cannot be achieved clearly with Tailwind utility classes, component-level class composition, or Tailwind-supported patterns.

When custom CSS is necessary:

- Keep it minimal and local to the relevant component or page.
- Avoid global CSS unless the styling is genuinely global.
- Do not duplicate Tailwind utilities in custom CSS.
- Document why custom CSS was needed when the reason is not obvious.

Prefer readable Tailwind class organization. Keep class strings maintainable, and rely on the configured Prettier Tailwind sorting.

## Animation rules

Use Tailwind CSS animation utilities for basic animation, including simple transitions, fades, transforms, hover states, focus states, loading indicators, and small UI feedback.

Use GSAP only for complex animation, including timelines, sequenced choreography, scroll-linked animation, advanced easing, staggered motion, physics-like effects, or interactions that would be difficult to maintain with Tailwind alone.

When using GSAP:

- Scope animations to the relevant component or page.
- Clean up animations, timelines, ScrollTriggers, and event listeners when components unmount or are replaced.
- Avoid animating layout-heavy properties when transform or opacity can achieve the effect.
- Respect reduced-motion preferences when animation is non-essential.

## Astro conventions

Prefer Astro components and Astro-native patterns unless client-side interactivity is required.

Use client-side JavaScript only when necessary. Keep islands small, explicit, and justified. Avoid turning static UI into client-rendered UI without a clear need.

Keep content, layout, and interactive behavior separated where practical.

## TypeScript and code quality

Write TypeScript-compatible code. Avoid `any` unless there is a clear reason and no safer local type is practical.

Prefer explicit, simple data structures over clever abstractions. Keep functions small, named clearly, and easy to test or inspect.

Do not introduce new dependencies unless the user explicitly approves them or the repository already depends on them. This project already includes GSAP, Astro, Tailwind CSS, ESLint, Prettier, and TypeScript tooling.

## Accessibility

Preserve semantic HTML. Interactive elements must be keyboard accessible and have appropriate labels, focus states, and ARIA attributes only when semantic HTML is insufficient.

Do not remove accessibility attributes or lint-related accessibility fixes without replacing them with an equivalent or better solution.

## File and change discipline

Make the smallest coherent change that satisfies the request.

Do not modify unrelated files. Do not perform broad rewrites unless the user requested them or they are required to fix validation failures.

Do not edit generated output, build artifacts, dependency folders, lockfile content, or configuration files unless the task specifically requires it.

## Completion criteria

A task is complete only when:

1. The requested behavior or content has been implemented.
2. Bun was used for package and script commands.
3. Styling follows the Tailwind-first rule.
4. Animation follows the Tailwind-basic / GSAP-complex rule.
5. The required validation commands have been run in order:
   - `bun run format`
   - `bun run lint`
   - `bun run check`
6. Any failures are either fixed or reported with precise details.
