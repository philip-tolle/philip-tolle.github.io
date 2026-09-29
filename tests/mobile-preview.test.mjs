import assert from 'node:assert/strict';
import { test } from 'node:test';

let createMobilePreviewServer;
try {
  ({ createMobilePreviewServer } = await import('../scripts/mobile-preview.mjs'));
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

test('local preview serves the running site inside a 390px phone frame', async t => {
  assert.equal(typeof createMobilePreviewServer, 'function', 'mobile preview server is available');

  const server = createMobilePreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const address = server.address();
  assert.equal(address.address, '127.0.0.1');
  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);

  const html = await response.text();
  assert.match(html, /<iframe[^>]*src="http:\/\/127\.0\.0\.1:4322\/"[^>]*>/);
  assert.match(html, /<iframe[^>]*width="390"[^>]*>/);
});
