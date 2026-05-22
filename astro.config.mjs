// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  fonts: [
    // Newsreader normal — variable range, preloaded (roman only)
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['200 800'], // string range for variable font
      styles: ['normal'],
      subsets: ['latin'],
      // Georgia-first fallback: Astro generates metric-matched @font-face
      fallbacks: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif'],
      display: 'optional',
    },
    // Newsreader italic — SEPARATE entry so it is never preloaded.
    // Only downloads when italic content is rendered.
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['400 500'], // narrower italic range
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif'],
      display: 'optional',
    },
    // Commit Mono — static font, discrete integer weights (NOT a range string)
    {
      provider: fontProviders.fontsource(),
      name: 'Commit Mono',
      cssVariable: '--font-commit-mono',
      weights: [400, 500], // integers for static font
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
