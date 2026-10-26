import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' = alle Pfade relativ. So läuft der Build in jedem Unterordner
// und als Test-Seite, ohne Server-Einstellungen.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  test: { include: ['src/**/*.test.ts'] },
});
