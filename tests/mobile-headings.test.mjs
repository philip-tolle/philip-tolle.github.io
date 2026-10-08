import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let chromium;
try {
  ({ chromium } = createRequire(process.execPath)('playwright'));
} catch {
  // Playwright is optional in the website project; the bundled Codex runtime includes it.
}

test('mobile layout across page types', {
  skip: !chromium || !existsSync(chromePath),
}, async t => {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(join(root, pathname.replace(/^\//, ''), pathname.endsWith('/') ? 'index.html' : ''));
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(path);
      const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2' }[extname(path)] || 'application/octet-stream';
      response.writeHead(200, { 'content-type': type }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  t.after(async () => {
    await browser.close();
    server.closeAllConnections();
    await new Promise(resolveClose => server.close(resolveClose));
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const base = `http://127.0.0.1:${server.address().port}`;
  await t.test('phone hero has one clear action with offers close below', async () => {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/');
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator('.home-hero');
      assert.match(await hero.locator('h1').textContent(), /Mehr Zeit für das,\s*was zählt\./, 'full sentence stays available while the words are typed');
      const actions = hero.locator('.home-hero__actions a:visible');
      assert.equal(await actions.count(), 1, `only one primary action at ${width}px`);
      assert.match(await actions.first().innerText(), /Angebote entdecken/);
      assert.equal(await actions.first().getAttribute('href'), '#leistungen');
      assert.equal(await hero.locator('.home-hero__foot').isVisible(), false);
      assert.ok((await page.locator('#leistungen').boundingBox()).y < 650, `offers too far down at ${width}px`);
      assert.ok(await page.locator('#heroLogo img').isVisible());
      assert.equal(await page.locator('h1').count(), 1);
      assert.ok(await page.locator('.footer a[href="/kontakt/"]').first().count());
      assert.ok(await page.locator('.footer a[href="/ueber/"]').first().count());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(base + '/');
    assert.match(await page.locator('.home-hero h1').innerText(), /^NextCourse/);
    assert.equal(await page.locator('.home-hero__actions a:visible').count(), 2);
    assert.match(await page.locator('.home-hero__actions .nc-button').innerText(), /Passende Unterstützung finden/);
    assert.ok(await page.locator('.home-hero__foot').isVisible());
  });
  await t.test('contact ending: compact card on home, slim line with topic on area pages', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/');
    const contact = page.locator('.nc-contact');
    await contact.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    assert.ok((await contact.boundingBox()).height < 610, 'home: contact ending too tall');
    assert.ok(await contact.locator('.nc-contact__person img').isVisible());
    assert.match(await contact.locator('.nc-note').innerText(), /Kostenlos und unverbindlich/);
    assert.match(await contact.locator('.nc-contact__person').innerText(), /Philip Tolle/);
    const button = contact.locator('.nc-button');
    assert.equal(await button.getAttribute('href'), '/kontakt/');
    assert.ok((await button.boundingBox()).height >= 44);
    const linePaths = [
      ['/management/', '/kontakt/?thema=management#contactform'],
      ['/akademie/', '/kontakt/?thema=academy#contactform'],
      ['/operation/', '/kontakt/?thema=entlastung#contactform'],
    ];
    for (const [route, expectedHref] of linePaths) {
      await page.goto(base + route);
      assert.equal(await page.locator('.nc-contact').count(), 0, `${route}: portrait block only on the home page`);
      const link = page.locator('.kontakt-zeile a');
      await link.scrollIntoViewIfNeeded();
      assert.equal(await link.getAttribute('href'), expectedHref, `${route}: exact contact topic and form anchor must survive`);
      assert.ok((await link.boundingBox()).height >= 44);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(base + '/');
    assert.ok(await page.locator('.nc-contact__person').isVisible());
  });
  await t.test('important phone headings stay compact', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const cases = [
      ['/', '.home-approach h2', 36],
      ['/management/', '.service-hero h1', 34],
      ['/akademie/', '.service-hero h1', 34],
      ['/operation/', '.service-hero h1', 34],
      ['/operation/', '.service-section-intro h2', 34],
      ['/ueber/', '.detail-hero h1', 34],
      ['/ueber/', '.detail-surface h2', 36],
    ];
    for (const [route, selector, maximum] of cases) {
      await page.goto(base + route);
      const heading = page.locator(selector).first();
      await heading.waitFor({ timeout: 5000 });
      const size = await heading.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
      assert.ok(size <= maximum, `${route} ${selector}: ${size}px exceeds ${maximum}px`);
    }
  });
  await t.test('curved service transition touches the illustration on narrow screens', async () => {
    for (const width of [390, 600]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/operation/');
      const touching = await page.evaluate(() => {
        const visual = document.querySelector('.service-hero__visual').getBoundingClientRect();
        const wave = document.querySelector('.service-hero__wave').getBoundingClientRect();
        return wave.top <= visual.bottom && wave.bottom >= visual.bottom;
      });
      assert.ok(touching, `wave misses illustration at ${width}px`);
    }
  });
  await t.test('footer link groups open on phones and stay static on desktop', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/');
    const groups = page.locator('.footer__mobile-section');
    assert.equal(await groups.count(), 3);
    assert.equal(await groups.evaluateAll(elements => elements.filter(element => element.open).length), 0);
    await groups.first().locator('summary').click();
    assert.ok(await groups.first().evaluate(element => element.open));
    assert.ok(await groups.first().locator('a').first().isVisible());
    await page.setViewportSize({ width: 1280, height: 800 });
    assert.ok(await page.locator('.footer__desktop-section').first().isVisible());
    assert.equal(await groups.first().isVisible(), false);
  });
  await t.test('offer overviews go from image and question straight to swipe cards on phones', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/management/', '/akademie/', '/operation/']) {
      await page.goto(base + route);
      assert.equal(await page.locator('.service-hero__details').isVisible(), false, route);
      assert.equal(await page.locator('.service-section-intro .service-kicker').isVisible(), false, route);
      assert.equal(await page.locator('.service-section-intro>p').filter({ visible: true }).count(), 0, route);
      assert.equal(await page.locator('.service-jumps').isVisible(), false, route);
      if (route === '/management/') assert.equal(await page.locator('.service-start').isVisible(), false);
      const heading = page.locator('.service-section-intro h2');
      const card = page.locator('.service-mobile-card').first();
      assert.ok(await heading.isVisible(), route);
      assert.ok(await card.isVisible(), route);
      const gap = (await card.boundingBox()).y - ((await heading.boundingBox()).y + (await heading.boundingBox()).height);
      assert.ok(gap < 110, `${route}: ${gap}px between question and first card`);
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base + '/management/');
    assert.ok(await page.locator('.service-hero__details').isVisible());
    assert.ok(await page.locator('.service-jumps').isVisible());
    assert.ok(await page.locator('.service-start').isVisible());
  });
});
