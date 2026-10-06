// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Frühere Strukturen (Consulting, danach Management/Academy/Operation) führen auf die vier Wege.
// Auf IONOS greifen zuerst die 301-Regeln in public/.htaccess; diese Seiten sind der Rückfall.
const redirects = {
  '/consulting/': '/',
  '/consulting/pilotprojekte/': '/training-projekte/',
  '/consulting/implementierungsprojekte/': '/training-projekte/',
  '/consulting/mystery-check/': '/mystery-check-digital-audit/',
  '/consulting/quick-check/': '/mystery-check-digital-audit/',
  '/consulting/referenzbetrieb/': '/',
  '/management/': '/',
  '/management/betriebshandbuch/': '/betriebshandbuch/',
  '/management/mystery-check/': '/mystery-check-digital-audit/',
  '/management/digital-audit/': '/mystery-check-digital-audit/',
  '/management/quick-check/': '/mystery-check-digital-audit/',
  '/management/implementierungsprojekte/': '/training-projekte/',
  '/management/referenzbetrieb/': '/',
  '/akademie/': '/training-projekte/',
  '/akademie/ki-grundlagen/': '/training-projekte/',
  '/akademie/digitale-zusammenarbeit/': '/training-projekte/',
  '/akademie/flying-academy/': '/training-projekte/',
  '/akademie/aevo/': '/training-projekte/',
  '/akademie/barista/': '/training-projekte/',
  '/akademie/fuehren-mit-ki/': '/training-projekte/',
  '/akademie/foerderung/': '/preise/',
  '/operation/': '/entlastung/',
  '/operation/30-tage-test/': '/entlastung/',
  '/operation/monatspakete/': '/entlastung/',
  '/operation/karten-unterlagen/': '/entlastung/',
  '/operation/gaestekommunikation/': '/entlastung/',
  '/operation/projekte/': '/training-projekte/',
};
const redirectPaths = Object.keys(redirects);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.next-course.de',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !redirectPaths.includes(path) && !path.endsWith('/danke/') && !path.endsWith('/danke');
      },
    }),
  ],
  redirects,
});
