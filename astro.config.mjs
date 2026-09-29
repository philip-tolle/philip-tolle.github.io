// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.next-course.de',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/consulting/') && !page.endsWith('/danke/') && !page.endsWith('/danke'),
    }),
  ],
  redirects: {
    '/consulting/': '/management/',
    '/consulting/pilotprojekte/': '/management/implementierungsprojekte/',
    '/consulting/implementierungsprojekte/': '/management/implementierungsprojekte/',
    '/consulting/mystery-check/': '/management/mystery-check/',
    '/consulting/quick-check/': '/management/quick-check/',
    '/consulting/referenzbetrieb/': '/management/referenzbetrieb/',
  },
});
