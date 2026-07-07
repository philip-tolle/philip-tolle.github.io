// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Vorläufige Adresse (GitHub Pages) — beim Domain-Anschluss auf die echte Domain ändern
  site: 'https://philip-tolle.github.io',
  integrations: [sitemap()],
});
