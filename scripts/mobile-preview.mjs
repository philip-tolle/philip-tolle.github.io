import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const siteUrl = 'http://127.0.0.1:4322/';

export function createMobilePreviewServer() {
  return createServer((request, response) => {
    if (request.url !== '/') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Nicht gefunden');
      return;
    }

    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(`<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NextCourse · lokale Handy-Vorschau</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 18px 12px 36px; background: #e8eeeb; color: #122a2f; font: 15px/1.5 system-ui, sans-serif; }
    main { display: grid; justify-items: center; gap: 14px; }
    header { width: min(390px, 100%); }
    h1 { margin: 0; font-size: 18px; }
    p { margin: 3px 0 0; color: #526368; font-size: 13px; }
    iframe { display: block; box-sizing: content-box; width: 390px; max-width: calc(100% - 4px); height: 844px; border: 2px solid #122a2f; border-radius: 18px; background: white; box-shadow: 0 22px 55px #122a2f2b; }
  </style>
</head>
<body>
  <main>
    <header><h1>Handy-Vorschau · 390 px</h1><p>Nur lokal. Links und Wischkarten im Rahmen ausprobieren.</p></header>
    <iframe src="${siteUrl}" width="390" height="844" title="NextCourse in 390 Pixel Breite"></iframe>
  </main>
</body>
</html>`);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createMobilePreviewServer().listen(4323, '127.0.0.1', () => {
    process.stdout.write('Handy-Vorschau: http://127.0.0.1:4323/\n');
  });
}
