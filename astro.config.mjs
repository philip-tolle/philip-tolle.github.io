// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.next-course.de',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/danke/') && !page.endsWith('/danke'),
    }),
  ],
  redirects: {
    '/consulting/pilotprojekte/': '/consulting/implementierungsprojekte/',
  },
});
