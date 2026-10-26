// Oberflächen-Prüfung der Mitarbeiter-Ansicht im echten Browser.
// Aufruf: npm run build && npm run pruefen
// Bildschirmfotos landen in tests/bildschirmfotos/ (nicht versioniert).
//
// Die Sprachausgabe wird nachgebaut: So lässt sich prüfen, was in welcher
// Sprache und in welchem Tempo vorgelesen würde – auch ohne Lautsprecher.

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const fotos = join(wurzel, 'tests', 'bildschirmfotos');
mkdirSync(fotos, { recursive: true });
const PORT = 4417;
const BASIS = `http://127.0.0.1:${PORT}/`;

const ergebnisse = [];
function pruefe(name, ok, info = '') {
  ergebnisse.push({ name, ok: Boolean(ok), info });
  console.log(`${ok ? 'OK    ' : 'FEHLER'} ${name}${info ? ` – ${info}` : ''}`);
}

const SPRACH_ATTRAPPE = () => {
  const ohne = JSON.parse(localStorage.getItem('test:ohneStimme') || '[]');
  const stimmen = [
    ['de-DE', 'Test Deutsch'],
    ['en-GB', 'Test English'],
    ['uk-UA', 'Test Українська'],
    ['ar-SA', 'Test العربية'],
    ['tr-TR', 'Test Türkçe'],
  ]
    .filter(([lang]) => !ohne.includes(lang.slice(0, 2)))
    .map(([lang, name]) => ({ lang, name, default: false, localService: true, voiceURI: name }));
  window.__gesprochen = [];
  class Aeusserung {
    constructor(text) {
      Object.assign(this, { text, lang: '', rate: 1, volume: 1, voice: null, onstart: null, onend: null, onerror: null });
    }
  }
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => stimmen,
    speak(u) {
      if (u.text.trim()) window.__gesprochen.push({ text: u.text, lang: u.lang, rate: u.rate });
      setTimeout(() => {
        u.onstart?.();
        setTimeout(() => u.onend?.(), 30);
      }, 0);
    },
    cancel() {},
    resume() {},
    pause() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = Aeusserung;
};

function serverStarten() {
  const server = spawn(join(wurzel, 'node_modules', '.bin', 'vite'), ['preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: wurzel,
    stdio: 'ignore',
  });
  return server;
}

async function warten(url) {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Vorschau-Server startet nicht');
}

async function neueSeite(browser, { breite = 1024, hoehe = 768, dunkel = false, speicher = {} } = {}) {
  const kontext = await browser.newContext({
    viewport: { width: breite, height: hoehe },
    colorScheme: dunkel ? 'dark' : 'light',
    hasTouch: true,
  });
  await kontext.addInitScript((werte) => {
    if (!sessionStorage.getItem('test:vorbereitet')) {
      localStorage.clear();
      for (const [k, v] of Object.entries(werte)) localStorage.setItem(k, v);
      sessionStorage.setItem('test:vorbereitet', '1');
    }
  }, speicher);
  await kontext.addInitScript(SPRACH_ATTRAPPE);
  const seite = await kontext.newPage();
  seite.on('pageerror', (e) => pruefe('Keine Skriptfehler', false, e.message));
  return seite;
}

const geraet = (teil) => ({ 'arbeitsplatz-begleiter:geraet': JSON.stringify({ autoVorlesen: true, ...teil }) });
const gesprochen = (seite) => seite.evaluate(() => window.__gesprochen.slice());
const leeren = (seite) => seite.evaluate(() => (window.__gesprochen.length = 0));

async function axe(seite, name) {
  await seite.addScriptTag({ path: join(wurzel, 'node_modules', 'axe-core', 'axe.min.js') });
  const r = await seite.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const ergebnis = await axe.run(document, { rules: { 'color-contrast-enhanced': { enabled: true } } });
    return ergebnis.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
  pruefe(`Barrierefreiheit (axe, Kontrast 7:1) – ${name}`, r.length === 0, r.join(' ; '));
}

async function tastenMessen(seite, name) {
  const masse = await seite.$$eval('.taste, .kachel, .sprachkachel, .schalter', (els) =>
    els
      .filter((e) => e.offsetParent !== null)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { text: e.textContent.trim().slice(0, 30), b: Math.round(r.width), h: Math.round(r.height) };
      }),
  );
  const zuKlein = masse.filter((m) => m.b < 88 || m.h < 88);
  pruefe(`Tasten mindestens 88 × 88 px – ${name}`, zuKlein.length === 0, zuKlein.map((m) => `${m.text} ${m.b}×${m.h}`).join(', '));
  const abstand = await seite.evaluate(() => {
    const t = [...document.querySelectorAll('.tastenleiste .taste')].map((e) => e.getBoundingClientRect());
    const sortiert = t.sort((a, b) => a.left - b.left);
    return sortiert.slice(1).map((r, i) => Math.round(r.left - sortiert[i].right));
  });
  if (abstand.length) pruefe(`Abstand zwischen Haupttasten ≥ 12 px – ${name}`, abstand.every((a) => a >= 12), abstand.join(', '));
  const quer = await seite.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  pruefe(`Kein seitliches Scrollen – ${name}`, !quer);
}

const server = serverStarten();
let browser;
try {
  await warten(BASIS);
  browser = await chromium.launch();

  // 1. Erster Start: Sprachwahl mit 2 Berührungen
  {
    const s = await neueSeite(browser);
    await s.goto(BASIS + '#/platz/bankett');
    const namen = await s.$$eval('.sprachkachel-name', (els) => els.map((e) => e.textContent));
    pruefe('Sprachwahl zeigt nur Sprachen mit freigegebener Anleitung', JSON.stringify(namen) === JSON.stringify(['Deutsch', 'English', 'Українська', 'العربية', 'Türkçe']), namen.join(', '));
    pruefe('Sprachwahl ohne Flaggen (keine Bilder in den Kacheln)', (await s.$$('.sprachkachel img')).length === 0);
    await tastenMessen(s, 'Sprachwahl');
    await axe(s, 'Sprachwahl');
    await s.screenshot({ path: join(fotos, '01-sprachwahl.png') });
    const kachel = s.locator('.sprachkachel', { hasText: 'Українська' });
    await kachel.tap();
    await s.waitForTimeout(100);
    pruefe('1. Berührung: Kachel ist ausgewählt', (await kachel.getAttribute('aria-pressed')) === 'true');
    const gruss = await gesprochen(s);
    pruefe('1. Berührung: Gruß wird auf Ukrainisch vorgelesen', gruss.some((g) => g.lang === 'uk-UA' && g.text.startsWith('Привіт')), JSON.stringify(gruss));
    await s.screenshot({ path: join(fotos, '02-sprachwahl-gewaehlt.png') });
    await kachel.tap();
    await s.waitForSelector('.kacheln');
    pruefe('2. Berührung: Startseite auf Ukrainisch (lang="uk")', (await s.getAttribute('html', 'lang')) === 'uk');
    const fonts = await s.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
    });
    pruefe('Kyrillisch nutzt Noto Sans', fonts.some((f) => f.includes('Noto Sans')), [...new Set(fonts)].join(', '));
    await tastenMessen(s, 'Startseite');
    await axe(s, 'Startseite Ukrainisch');
    await s.screenshot({ path: join(fotos, '03-start-uk.png'), fullPage: true });
  }

  // 2. Durchlauf Bankett auf Deutsch: Weiter liest vor, Nochmal ohne Zähler, Fertig
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'de' }) });
    await s.goto(BASIS + '#/platz/bankett');
    await s.locator('.kachel').first().tap();
    await s.waitForSelector('.satz');
    pruefe('Kachel öffnet Schritt 1', (await s.textContent('.satz')) === 'Wasch dir die Hände.');
    pruefe('Kopf zeigt „Schritt 1 von 8“', (await s.textContent('.fortschritt-text')) === 'Schritt 1 von 8');
    let g = await gesprochen(s);
    pruefe('Schritt 1 wird beim Öffnen vorgelesen', g[0]?.text === 'Wasch dir die Hände.' && g[0]?.lang === 'de-DE', JSON.stringify(g[0]));
    pruefe('Mediopunkt wird nicht vorgelesen', g.some((x) => x.text === 'Mit Seife. Dann gut abtrocknen.'), JSON.stringify(g));
    await tastenMessen(s, 'Schritt-Ansicht');
    await axe(s, 'Schritt-Ansicht Deutsch');
    await s.screenshot({ path: join(fotos, '04-schritt-de-quer.png') });
    const reihenfolge = await s.$$eval('.tastenleiste .taste', (els) => els.map((e) => e.textContent.trim()));
    pruefe('Feste Reihenfolge Nochmal | Weiter | Hilfe', reihenfolge.join('|') === 'Nochmal|Weiter|Hilfe', reihenfolge.join('|'));

    await leeren(s);
    const normalRate = 0.9; // Tempo „normal“
    for (let i = 0; i < 6; i++) await s.getByRole('button', { name: 'Nochmal' }).tap();
    g = await gesprochen(s);
    pruefe('„Nochmal“ geht beliebig oft (6×)', g.filter((x) => x.text === 'Wasch dir die Hände.').length === 6, `${g.length} Äußerungen`);
    pruefe('„Nochmal“ liest langsamer', g.every((x) => x.rate < normalRate), g.map((x) => x.rate).join(', '));
    pruefe('„Nochmal“ hebt den Satz hervor', await s.locator('.satz.hervorgehoben').count() === 1);
    const speicher = await s.evaluate(() => JSON.stringify(localStorage));
    pruefe('Keine Zähler oder Nutzungsdaten gespeichert', !/nochmal|zaehler|count|dauer/i.test(speicher), speicher);

    for (let i = 2; i <= 8; i++) {
      await leeren(s);
      await s.getByRole('button', { name: 'Weiter' }).tap();
      await s.waitForFunction((n) => document.querySelector('.fortschritt-text')?.textContent === `Schritt ${n} von 8`, i);
      g = await gesprochen(s);
      if (i === 2) pruefe('„Weiter“ liest den neuen Schritt vor', g[0]?.text === 'Stell den Teller in die Mitte vom Platz.', JSON.stringify(g[0]));
    }
    pruefe('Letzter Schritt: „Weiter“ heißt „Fertig“ (grün)', (await s.locator('.taste--fertig').textContent())?.trim() === 'Fertig');
    await s.getByRole('button', { name: 'Fertig' }).tap();
    await s.waitForSelector('.fertig');
    pruefe('Fertig-Bildschirm mit Lob', (await s.textContent('.fertig-lob')) === 'Du hast alle 8 Schritte gemacht. Gut gemacht!');
    pruefe('Fertig-Bildschirm zeigt alle 8 Schritte klein', (await s.locator('.mini-schritt').count()) === 8);
    await tastenMessen(s, 'Fertig');
    await axe(s, 'Fertig');
    await s.screenshot({ path: join(fotos, '05-fertig-de.png'), fullPage: true });
    await s.getByRole('button', { name: 'Nochmal von vorne' }).tap();
    await s.waitForFunction(() => document.querySelector('.fortschritt-text')?.textContent === 'Schritt 1 von 8');
    pruefe('„Nochmal von vorne“ beginnt bei Schritt 1', true);
    await s.getByRole('button', { name: 'Zurück' }).tap();
    await s.waitForSelector('.kacheln');
    pruefe('„Zurück“ in Schritt 1 führt zur Übersicht', true);
  }

  // 3. Arabisch: Rechts nach links
  for (const [breite, hoehe, art] of [
    [1024, 768, 'quer'],
    [768, 1024, 'hoch'],
  ]) {
    const s = await neueSeite(browser, { breite, hoehe, speicher: geraet({ sprache: 'ar' }) });
    await s.goto(BASIS + '#/platz/bankett/anleitung/bankett-eindecken/3');
    await s.waitForSelector('.satz');
    pruefe(`Arabisch (${art}): dir="rtl" und lang="ar"`, (await s.getAttribute('html', 'dir')) === 'rtl' && (await s.getAttribute('html', 'lang')) === 'ar');
    const lage = await s.evaluate(() => {
      const [nochmal, weiter, hilfe] = [...document.querySelectorAll('.tastenleiste .taste')].map((e) => e.getBoundingClientRect().left);
      const pfeil = getComputedStyle(document.querySelector('.taste--weiter .spiegeln')).transform;
      const bild = getComputedStyle(document.querySelector('.bildkarte img')).transform;
      return { nochmal, weiter, hilfe, pfeil, bild };
    });
    pruefe(`Arabisch (${art}): Tastenleiste gespiegelt (Nochmal rechts, Hilfe links)`, lage.nochmal > lage.weiter && lage.weiter > lage.hilfe, JSON.stringify(lage));
    pruefe(`Arabisch (${art}): Pfeil gespiegelt, Bild nicht`, lage.pfeil.startsWith('matrix(-1') && lage.bild === 'none', `${lage.pfeil} / ${lage.bild}`);
    pruefe(`Arabisch (${art}): Ziffern bleiben „3“ und „8“`, (await s.textContent('.fortschritt-text')) === 'الخطوة 3 من 8');
    const fonts = await s.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
    });
    pruefe(`Arabisch (${art}): Noto Sans Arabic geladen`, fonts.includes('Noto Sans Arabic'), [...new Set(fonts)].join(', '));
    await tastenMessen(s, `Arabisch ${art}`);
    if (art === 'quer') await axe(s, 'Schritt-Ansicht Arabisch');
    await s.screenshot({ path: join(fotos, `06-schritt-ar-${art}.png`) });
  }

  // 4. Ungeprüfte Sicherheitsschritte
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'uk' }) });
    await s.goto(BASIS + '#/platz/housekeeping-etage-2/anleitung/bad-putzen/4');
    await s.waitForSelector('.satz');
    pruefe('Ukrainisch, Sicherheitsschritt ungeprüft: Achtung-Symbol', await s.locator('.achtung-marke').isVisible());
    pruefe('… deutscher Satz darunter', (await s.textContent('.satz-de'))?.includes('Nimm immer nur 1 Reiniger.'));
    pruefe('… Bitte um Nachfrage in der gewählten Sprache', (await s.textContent('.frag-nach')) === 'Якщо є сумнів, будь ласка, запитай.');
    await axe(s, 'Sicherheitsschritt Ukrainisch');
    await s.screenshot({ path: join(fotos, '07-sicherheit-uk.png') });
    await s.goto(BASIS + '#/platz/housekeeping-etage-2/anleitung/bad-putzen/2');
    await s.waitForFunction(() => document.querySelector('.fortschritt-text')?.textContent === 'Крок 2 з 8');
    pruefe('Normaler Schritt ohne deutschen Satz und ohne Nachfrage', (await s.locator('.satz-de').count()) === 0 && (await s.locator('.frag-nach').count()) === 0);
  }
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'de' }) });
    await s.goto(BASIS + '#/platz/housekeeping-etage-2/anleitung/bad-putzen/1');
    await s.waitForSelector('.satz');
    pruefe('Deutsch: Sicherheitsschritt mit Achtung, ohne Nachfrage-Hinweis', (await s.locator('.achtung-marke').count()) === 1 && (await s.locator('.frag-nach').count()) === 0);
  }

  // 5. Deutsch mitlernen
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'tr' }) });
    await s.goto(BASIS + '#/platz/bankett');
    await s.waitForSelector('.kacheln');
    await s.getByRole('switch').tap();
    pruefe('Schalter „Deutsch mitlernen“ ist an', (await s.getByRole('switch').getAttribute('aria-checked')) === 'true');
    pruefe('Startseite zeigt den deutschen Titel klein darunter', (await s.textContent('.kachel-de')) === 'Einen Platz fürs Bankett eindecken');
    await s.locator('.kachel').first().tap();
    await s.waitForSelector('.satz-de');
    const g = await gesprochen(s);
    const satz = g.findIndex((x) => x.lang === 'tr-TR' && x.text === 'Ellerini yıka.');
    const de = g.findIndex((x) => x.lang === 'de-DE' && x.text === 'Wasch dir die Hände.');
    pruefe('Mitlernen: erst Türkisch, dann Deutsch vorgelesen', satz >= 0 && de > satz, JSON.stringify(g));
    pruefe('Mitlernen: deutscher Satz mit lang="de"', (await s.getAttribute('.satz-de bdi', 'lang')) === 'de');
    await s.screenshot({ path: join(fotos, '08-mitlernen-tr.png') });
  }

  // 6. Hilfe
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'en' }) });
    await s.goto(BASIS + '#/platz/bankett/anleitung/bankett-eindecken/5');
    await s.waitForSelector('.satz');
    await s.getByRole('button', { name: 'Help', exact: true }).tap();
    await s.waitForSelector('.hilfe-text');
    pruefe('Hilfe: „Help is on the way. Ms Weber is coming soon.“', (await s.textContent('.hilfe-text')) === 'Help is on the way.Ms Weber is coming soon.');
    pruefe('Hilferuf enthält Schritt und Gerätesprache', (await s.textContent('.testkasten'))?.includes('Schritt: 5') && (await s.textContent('.testkasten'))?.includes('Gerätesprache: Englisch'));
    await axe(s, 'Hilfe');
    await s.screenshot({ path: join(fotos, '09-hilfe-en.png') });
    await leeren(s);
    await s.getByRole('button', { name: 'Frau Weber drückt „Bin unterwegs“' }).tap();
    await s.waitForFunction(() => document.querySelector('.hilfe-text')?.textContent === 'Ms Weber is on the way to you now.');
    pruefe('Text ändert sich nach „Bin unterwegs“ und wird vorgelesen', (await gesprochen(s)).some((x) => x.text === 'Ms Weber is on the way to you now.'));
    await s.getByRole('button', { name: 'Back to the task' }).tap();
    await s.waitForSelector('.hilfe-status');
    pruefe('Zurück zur Aufgabe: Status „Hilfe unterwegs“ bleibt sichtbar', (await s.textContent('.hilfe-status'))?.includes('Ms Weber is on the way'));
    pruefe('Zurück zur Aufgabe: gleicher Schritt', (await s.textContent('.fortschritt-text')) === 'Step 5 of 8');
  }

  // 7. Keine Gerätestimme
  {
    const s = await neueSeite(browser, { speicher: { ...geraet({ sprache: 'uk' }), 'test:ohneStimme': '["uk"]' } });
    await s.goto(BASIS + '#/platz/bankett/anleitung/bankett-eindecken/1');
    await s.waitForSelector('.satz');
    await s.getByRole('button', { name: 'Слухати' }).tap();
    await s.waitForSelector('.meldung');
    pruefe('Ohne Stimme: Hinweis in einfacher Sprache, App läuft weiter', (await s.textContent('.meldung')) === 'Цей пристрій не може озвучити цю мову.');
    await s.getByRole('button', { name: 'Далі' }).tap();
    await s.waitForFunction(() => document.querySelector('.fortschritt-text')?.textContent === 'Крок 2 з 8');
    pruefe('Ohne Stimme: Weiter funktioniert', true);
  }

  // 8. Geräte-Einstellungen hinter PIN
  {
    const s = await neueSeite(browser, { speicher: geraet({ sprache: 'de' }) });
    await s.goto(BASIS + '#/platz/bankett');
    await s.getByRole('button', { name: 'Einstellungen' }).tap();
    for (const z of '1239') await s.getByRole('button', { name: z, exact: true }).tap();
    pruefe('Falsche PIN wird abgelehnt', (await s.textContent('.pin-fehler'))?.includes('stimmt nicht'));
    for (const z of '1234') await s.getByRole('button', { name: z, exact: true }).tap();
    await s.waitForSelector('.einstellungen');
    pruefe('Richtige PIN öffnet die Einstellungen', true);
    await s.getByRole('switch', { name: /automatisch vor/ }).tap();
    await s.getByRole('button', { name: 'Sehr groß' }).tap();
    await s.screenshot({ path: join(fotos, '10-einstellungen.png'), fullPage: true });
    await s.getByRole('button', { name: 'Zurück' }).tap();
    await leeren(s);
    await s.locator('.kachel').first().tap();
    await s.waitForSelector('.satz');
    pruefe('Automatisches Vorlesen lässt sich abschalten', (await gesprochen(s)).length === 0);
    const groesse = await s.$eval('.satz', (e) => parseFloat(getComputedStyle(e).fontSize));
    pruefe('Schriftgröße „sehr groß“ wirkt (Satz ≥ 44 px)', groesse >= 44, `${groesse}px`);
    await tastenMessen(s, 'sehr große Schrift');
    await s.screenshot({ path: join(fotos, '11-schritt-sehr-gross.png') });
  }

  // 9. Dunkler Modus, Handy-Breite, Satzgröße
  {
    const s = await neueSeite(browser, { dunkel: true, speicher: geraet({ sprache: 'ar' }) });
    await s.goto(BASIS + '#/platz/housekeeping-etage-2/anleitung/bad-putzen/1');
    await s.waitForSelector('.satz');
    await axe(s, 'Dunkler Modus Arabisch');
    const lage = await s.evaluate(() => ({
      dir: document.querySelector('.satz-de').getAttribute('dir'),
      marke: document.querySelector('.satz-de-marke').getBoundingClientRect().left,
      satz: document.querySelector('.satz-de bdi').getBoundingClientRect().left,
    }));
    pruefe('Arabisch: „بالألمانية:“ steht rechts vom deutschen Satz', lage.dir === 'rtl' && lage.marke > lage.satz, JSON.stringify(lage));
    await s.screenshot({ path: join(fotos, '12-dunkel-ar-sicherheit.png') });
    const groesse = await s.$eval('.satz', (e) => parseFloat(getComputedStyle(e).fontSize));
    pruefe('Satz mindestens 32 px und fett', groesse >= 32 && (await s.$eval('.satz', (e) => getComputedStyle(e).fontWeight)) >= 700, `${groesse}px`);
  }
  {
    const s = await neueSeite(browser, { breite: 390, hoehe: 844, speicher: geraet({ sprache: 'uk' }) });
    await s.goto(BASIS + '#/platz/bankett/anleitung/bankett-eindecken/2');
    await s.waitForSelector('.satz');
    await tastenMessen(s, 'Handy 390 px');
    await s.screenshot({ path: join(fotos, '13-handy-uk.png'), fullPage: true });
  }
  {
    const s = await neueSeite(browser);
    await s.goto(BASIS);
    await s.waitForSelector('.testuebersicht');
    await axe(s, 'Testübersicht');
    await s.goto(BASIS + '#/platz/gibt-es-nicht');
    await s.waitForSelector('.nicht-gefunden');
    pruefe('Unbekannter Arbeitsplatz: freundliche Seite mit Zurück', (await s.textContent('.nicht-gefunden h1')) === 'Diese Seite gibt es nicht.');
  }
} finally {
  await browser?.close();
  server.kill();
}

const fehler = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length - fehler.length} von ${ergebnisse.length} Prüfungen bestanden.`);
console.log(`Bildschirmfotos: ${fotos}`);
process.exit(fehler.length ? 1 : 0);
