// Ende-zu-Ende-Prüfung mit Datenbank: Anleiter-Bereich und Tablet gegen ein echtes Postgres
// mit Supabase-Attrappe (tests/hilfen). Aufruf: npm run build && npm run pruefen:anleiter

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attrappeStarten, TEST_CODE } from './hilfen/supabase-attrappe.mjs';
import { datenbankStarten } from './hilfen/postgres.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const fotos = join(wurzel, 'tests', 'bildschirmfotos');
mkdirSync(fotos, { recursive: true });

const ergebnisse = [];
function pruefe(name, ok, info = '') {
  ergebnisse.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'OK    ' : 'FEHLER'} ${name}${info && !ok ? ` – ${info}` : ''}`);
}

async function axe(seite, name) {
  await seite.addScriptTag({ path: join(wurzel, 'node_modules', 'axe-core', 'axe.min.js') });
  const r = await seite.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const e = await axe.run(document);
    return e.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
  pruefe(`Barrierefreiheit (axe) – ${name}`, r.length === 0, r.join(' ; '));
}

const keinSeitlichesScrollen = (seite) => seite.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

const db = await datenbankStarten({ port: 54330 });
await db.klient.query(`insert into public.einladungen (email, rolle) values ('anna@example.org', 'anleiter')`);
await db.klient.query(`insert into public.einladungen (email, rolle, sprachen) values ('mehmet@example.org', 'sprachpate', '{tr}')`);
const attrappe = await attrappeStarten({ verbindung: db.verbindung, port: 4421, dist: join(wurzel, 'dist') });
const BASIS = attrappe.basis + '/';
const browser = await chromium.launch();

async function neueSeite({ breite = 1280, hoehe = 900, geraet } = {}) {
  const kontext = await browser.newContext({ viewport: { width: breite, height: hoehe } });
  if (geraet) {
    await kontext.addInitScript((g) => {
      if (!sessionStorage.getItem('test:vorbereitet')) {
        localStorage.setItem('arbeitsplatz-begleiter:geraet', JSON.stringify(g));
        sessionStorage.setItem('test:vorbereitet', '1');
      }
    }, geraet);
  }
  const seite = await kontext.newPage();
  seite.on('pageerror', (e) => pruefe('Keine Skriptfehler', false, e.message));
  return seite;
}

async function anmelden(seite, email) {
  await seite.goto(BASIS + '#/anleiter');
  await seite.getByLabel('Deine E-Mail-Adresse').fill(email);
  await seite.getByRole('button', { name: 'Code per E-Mail schicken' }).click();
  await seite.getByLabel('Code aus der E-Mail').fill(TEST_CODE);
  await seite.getByRole('button', { name: 'Anmelden', exact: true }).click();
}

try {
  // --- Tablet liest aus der Datenbank -------------------------------------------
  {
    const s = await neueSeite({ breite: 1024, hoehe: 768, geraet: { sprache: 'uk' } });
    await s.goto(BASIS + '#/platz/bankett');
    await s.waitForSelector('.kachel');
    pruefe('Tablet: Titel auf Ukrainisch aus der Datenbank', (await s.textContent('.kachel-titel')) === 'Накрити місце на банкеті');
    pruefe('Tablet: Hinweis „Verbunden“ für Anleiter:innen', (await s.textContent('.fuss'))?.includes('Verbunden'));
    await s.locator('.kachel').first().click();
    await s.waitForSelector('.satz');
    pruefe('Tablet: Schritt 1 aus der Datenbank', (await s.textContent('.satz')) === 'Помий руки.');
    await s.goto(BASIS + '#/platz/housekeeping-etage-2/anleitung/' + (await db.klient.query(`select id from public.anleitungen where titel_de like 'Ein Bad%'`)).rows[0].id + '/4');
    await s.waitForSelector('.frag-nach');
    pruefe('Tablet: ungeprüfter Sicherheitsschritt aus der Datenbank', (await s.textContent('.satz-de bdi')) === 'Nimm immer nur 1 Reiniger.');
  }

  // --- Anmeldung ---------------------------------------------------------------
  const s = await neueSeite();
  await s.goto(BASIS + '#/anleiter');
  await s.getByLabel('Deine E-Mail-Adresse').fill('fremd@example.org');
  await s.getByRole('button', { name: 'Code per E-Mail schicken' }).click();
  await s.waitForSelector('.al-meldung--fehler');
  pruefe('Nicht eingeladene Adresse bekommt keinen Code', (await s.textContent('.al-meldung--fehler'))?.includes('nicht eingeladen'));
  await axe(s, 'Anmeldung');
  await s.getByLabel('Deine E-Mail-Adresse').fill('anna@example.org');
  await s.getByRole('button', { name: 'Code per E-Mail schicken' }).click();
  await s.getByLabel('Code aus der E-Mail').fill('999999');
  await s.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await s.waitForSelector('.al-meldung--fehler');
  pruefe('Falscher Code wird abgelehnt', (await s.textContent('.al-meldung--fehler'))?.includes('stimmt nicht'));
  await s.getByLabel('Code aus der E-Mail').fill(TEST_CODE);
  await s.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await s.waitForSelector('.al-karte');

  // --- Liste ------------------------------------------------------------------------
  const status = await s.locator('.al-karte').first().locator('.al-status').innerText();
  pruefe('Liste: Status je Sprache', status.replace(/\s+/g, ' ').includes('Deutsch ✓') && status.includes('Ukrainisch'), status);
  pruefe('Liste: 2 Anleitungen', (await s.locator('.al-karte').count()) === 2);
  await axe(s, 'Anleitungen-Liste');
  await s.screenshot({ path: join(fotos, '20-anleiter-liste.png'), fullPage: true });

  // --- Neue Anleitung anlegen, Vorschau, freigeben -------------------------------
  await s.getByRole('button', { name: '+ Neue Anleitung' }).click();
  await s.getByLabel('Titel (Deutsch, Leichte Sprache)').fill('Kaffee·maschine reinigen');
  await s.getByLabel(/Anleitungstext/).fill('Brühgruppe entnehmen und unter fließendem Wasser spülen.');
  await s.getByLabel('Bankett').check();
  await s.getByLabel('Türkisch').check();
  const satz1 = s.getByLabel('Satz', { exact: true }).first();
  await satz1.fill('Mach die Maschine aus.');
  await s.getByRole('button', { name: '+ Schritt darunter einfügen' }).first().click();
  const satz2 = s.getByLabel('Satz', { exact: true }).nth(1);
  pruefe('Neuer Schritt bekommt den Fokus', await satz2.evaluate((e) => e === document.activeElement));
  await satz2.fill('Nimm die Brüh');
  await s.getByRole('button', { name: 'Mediopunkt in „Satz“ einfügen' }).nth(1).click();
  await satz2.press('End');
  await satz2.type('gruppe heraus.');
  pruefe('Mediopunkt-Taste fügt · ein', (await satz2.inputValue()) === 'Nimm die Brüh·gruppe heraus.');
  await s.getByLabel('Sicherheit oder Hygiene („Achtung“)').first().check();
  await s.getByLabel('Satz', { exact: true }).nth(1).press('Tab');
  await s.getByRole('button', { name: 'Speichern', exact: true }).click();
  await s.waitForFunction(() => /#\/anleiter\/anleitungen\/[0-9a-f-]{36}$/.test(location.hash));
  await s.waitForSelector('.al-statusband');
  pruefe('Gespeichert: Entwurf, noch nicht auf den Tablets', (await s.textContent('.al-statusband'))?.includes('Entwurf'));
  await axe(s, 'Anleitung bearbeiten');
  await s.screenshot({ path: join(fotos, '21-anleiter-bearbeiten.png'), fullPage: true });

  await s.getByRole('button', { name: 'Vorschau' }).click();
  await s.waitForSelector('.satz');
  pruefe('Vorschau zeigt den Entwurf wie auf dem Tablet', (await s.textContent('.satz')) === 'Mach die Maschine aus.' && (await s.locator('.achtung-marke').count()) === 1);
  await s.screenshot({ path: join(fotos, '22-anleiter-vorschau.png') });
  await s.getByRole('button', { name: 'Zurück zur Bearbeitung' }).click();
  await s.getByRole('button', { name: 'Deutsch freigeben' }).click();
  await s.waitForSelector('.al-meldung--ok');
  pruefe('„Deutsch freigeben“ meldet Erfolg', (await s.textContent('.al-statusband'))?.includes('Freigegeben am'));
  const neueId = (await s.evaluate(() => location.hash)).split('/').pop();

  const tablet = await neueSeite({ breite: 1024, hoehe: 768, geraet: { sprache: 'de' } });
  await tablet.goto(BASIS + '#/platz/bankett');
  await tablet.waitForSelector('.kachel');
  pruefe('Freigegebene Anleitung erscheint auf dem Tablet', (await tablet.locator('.kachel-titel', { hasText: 'Kaffee·maschine reinigen' }).count()) === 1);

  // --- Nach der Freigabe ändern: Tablet behält die freigegebene Fassung ---------------
  await satz1.fill('Schalte die Maschine aus.');
  pruefe('Ungespeicherte Änderung wird angezeigt', (await s.textContent('.al-speicherstand')) === 'Ungespeicherte Änderungen');
  await s.getByRole('link', { name: 'Arbeitsplätze' }).click();
  await s.waitForSelector('.al-rueckfrage');
  pruefe('Wechsel mit ungespeicherten Änderungen fragt nach', true);
  await s.getByRole('button', { name: 'Hierbleiben' }).click();
  await s.getByRole('button', { name: 'Speichern', exact: true }).click();
  await s.waitForFunction(() => document.querySelector('.al-statusband')?.textContent?.startsWith('Geändert'));
  pruefe('Nach Änderung: „Geändert – auf den Tablets ist noch die Fassung vom …“', true);
  await tablet.goto(BASIS + `#/platz/bankett/anleitung/${neueId}/1`);
  await tablet.reload();
  await tablet.waitForSelector('.satz');
  pruefe('Tablet zeigt bis zur Freigabe den alten Satz', (await tablet.textContent('.satz')) === 'Mach die Maschine aus.');
  await s.getByRole('button', { name: 'Deutsch freigeben' }).click();
  await s.waitForSelector('.al-meldung--ok');
  await tablet.reload();
  await tablet.waitForSelector('.satz');
  pruefe('Nach erneuter Freigabe zeigt das Tablet den neuen Satz', (await tablet.textContent('.satz')) === 'Schalte die Maschine aus.');

  // --- Schritte verschieben ------------------------------------------------------
  await s.getByRole('button', { name: 'Runter (Schritt 1)' }).click();
  pruefe('Verschieben: Reihenfolge getauscht', (await s.getByLabel('Satz', { exact: true }).first().inputValue()) === 'Nimm die Brüh·gruppe heraus.');
  pruefe('Verschieben: Fokus bleibt beim verschobenen Schritt', await s.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Hoch (Schritt 2)'));
  await s.getByRole('button', { name: 'Speichern', exact: true }).click();
  await s.waitForFunction(() => document.querySelector('.al-speicherstand')?.textContent === 'Alles gespeichert');

  // --- Veraltet bei Änderung einer übersetzten Anleitung --------------------------------
  await s.getByRole('link', { name: 'Anleitungen' }).click();
  await s.getByRole('link', { name: 'Ein Bad im Hotel·zimmer putzen' }).click();
  await s.waitForSelector('#titel');
  await s.getByLabel('Satz', { exact: true }).first().fill('Zieh immer Hand·schuhe an.');
  await s.getByRole('button', { name: 'Speichern', exact: true }).click();
  await s.waitForFunction(() => document.querySelector('.al-speicherstand')?.textContent === 'Alles gespeichert');
  const sprachstatus = await s.locator('.al-abschnitt .al-status').innerText();
  pruefe('Geänderter deutscher Schritt: Übersetzungen „veraltet“', sprachstatus.includes('Englisch: veraltet') && sprachstatus.includes('Arabisch: veraltet'), sprachstatus);

  // --- Arbeitsplätze -------------------------------------------------------------------
  await s.getByRole('link', { name: 'Arbeitsplätze' }).click();
  await s.getByRole('button', { name: '+ Neuer Arbeitsplatz' }).click();
  await s.getByLabel('Name des Arbeitsplatzes').fill('Spülküche');
  pruefe('Adresse wird aus dem Namen gebildet', (await s.getByLabel(/Adresse für das Tablet \(nur/).inputValue()) === 'spuelkueche');
  await s.getByRole('button', { name: 'Arbeitsplatz anlegen' }).click();
  await s.waitForSelector('.al-meldung--fehler');
  pruefe('Ohne Ansprechperson wird nicht angelegt', (await s.textContent('.al-meldung--fehler'))?.includes('Ansprechperson'));
  await s.getByLabel(/Ansprechperson \(kommt/).fill('Herr Klein');
  await s.getByRole('button', { name: 'Arbeitsplatz anlegen' }).click();
  await s.waitForSelector('#adresse-spuelkueche');
  pruefe('Neuer Arbeitsplatz mit Tablet-Adresse', (await s.inputValue('#adresse-spuelkueche')).endsWith('#/platz/spuelkueche'));
  await axe(s, 'Arbeitsplätze');
  await s.screenshot({ path: join(fotos, '23-anleiter-arbeitsplaetze.png'), fullPage: true });

  // --- Team ------------------------------------------------------------------------------
  await s.getByRole('link', { name: 'Team' }).click();
  await s.getByLabel('E-Mail-Adresse').fill('olena@example.org');
  await s.getByLabel('Ukrainisch').check();
  await s.getByRole('button', { name: 'Einladen' }).click();
  await s.waitForSelector('text=Offene Einladungen');
  pruefe('Einladung erscheint als offen', (await s.locator('.al-karte', { hasText: 'olena@example.org' }).innerText()).includes('Sprachpate für Ukrainisch'));
  await s.locator('.al-karte', { hasText: 'anna@example.org' }).getByRole('button', { name: 'Entfernen' }).click();
  await s.getByRole('button', { name: 'Entfernen', exact: true }).first().click();
  await s.waitForSelector('.al-meldung--fehler');
  pruefe('Letzte Anleiterin kann sich nicht entfernen', (await s.textContent('.al-meldung--fehler'))?.includes('mindestens eine'));
  await axe(s, 'Team');

  await s.getByRole('link', { name: 'Datenschutz' }).click();
  await s.waitForSelector('text=So geht die App mit Daten um');
  await axe(s, 'Datenschutz');

  // --- Handy-Breite -------------------------------------------------------------------------
  await s.setViewportSize({ width: 390, height: 844 });
  await s.getByRole('link', { name: 'Anleitungen' }).click();
  await s.waitForSelector('.al-karte');
  pruefe('Handy: Liste ohne seitliches Scrollen', await keinSeitlichesScrollen(s));
  await s.screenshot({ path: join(fotos, '24-anleiter-handy-liste.png'), fullPage: true });
  await s.getByRole('link', { name: 'Kaffee·maschine reinigen' }).click();
  await s.waitForSelector('#titel');
  pruefe('Handy: Bearbeiten ohne seitliches Scrollen', await keinSeitlichesScrollen(s));
  await s.screenshot({ path: join(fotos, '25-anleiter-handy-bearbeiten.png'), fullPage: true });

  // --- Sprachpate ---------------------------------------------------------------------------
  {
    const sp = await neueSeite({ breite: 390, hoehe: 844 });
    await anmelden(sp, 'mehmet@example.org');
    await sp.waitForSelector('text=Du bist Sprachpate für');
    pruefe('Sprachpate sieht seine Sprache', (await sp.textContent('main'))?.includes('Türkisch'));
  }

  // --- Abmelden -------------------------------------------------------------------------------
  await s.setViewportSize({ width: 1280, height: 900 });
  await s.getByRole('button', { name: 'Abmelden' }).click();
  await s.waitForSelector('#anmeldung-email');
  pruefe('Abmelden führt zur Anmeldung', true);

  // --- Ausfall der Datenbank ---------------------------------------------------------------
  attrappe.zustand.ausfall = true;
  await tablet.goto(BASIS + '#/platz/bankett');
  await tablet.reload();
  await tablet.waitForSelector('.kachel');
  pruefe('Ausfall: Tablet zeigt den letzten Stand weiter', (await tablet.textContent('.fuss'))?.includes('Keine Verbindung'));
  await tablet.locator('.kachel').first().click();
  await tablet.waitForSelector('.satz');
  pruefe('Ausfall: Schritt-Ansicht funktioniert', (await tablet.locator('.satz').count()) === 1);
  {
    const neu = await neueSeite({ breite: 1024, hoehe: 768, geraet: { sprache: 'ar' } });
    await neu.goto(BASIS + '#/platz/bankett');
    await neu.waitForSelector('.nicht-gefunden');
    pruefe('Ausfall ohne letzten Stand: Hinweis in der Gerätesprache', (await neu.textContent('h1')) === 'لا يمكن تحميل التعليمات الآن. حاول مرة أخرى بعد قليل.');
    attrappe.zustand.ausfall = false;
    await neu.getByRole('button', { name: 'مرة أخرى' }).click();
    await neu.waitForSelector('.kachel');
    pruefe('„Nochmal“ lädt, sobald die Verbindung wieder da ist', true);
  }
} catch (e) {
  pruefe('Unerwarteter Fehler', false, e.stack);
} finally {
  await browser.close();
  await attrappe.beenden();
  await db.beenden();
}

const fehler = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length - fehler.length} von ${ergebnisse.length} Prüfungen mit Datenbank bestanden.`);
process.exit(fehler.length ? 1 : 0);
