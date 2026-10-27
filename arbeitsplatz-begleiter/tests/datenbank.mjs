// Prüft Datenbank, Zugriffsregeln und Funktionen gegen ein echtes Postgres.
// Aufruf: npm run sql && npm run pruefen:datenbank

import { datenbankStarten } from './hilfen/postgres.mjs';

const ergebnisse = [];
function pruefe(name, ok, info = '') {
  ergebnisse.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'OK    ' : 'FEHLER'} ${name}${info && !ok ? ` – ${info}` : ''}`);
}
async function fehlerVon(versprechen) {
  try {
    await versprechen;
    return null;
  } catch (e) {
    return e.message;
  }
}

const db = await datenbankStarten();
const { klient, als } = db;
const wert = (r) => Object.values(r.rows[0])[0];

try {
  // --- Konten und Einladungen -------------------------------------------------
  await klient.query(`insert into public.einladungen (email, rolle) values ('anna@example.org', 'anleiter')`);
  await klient.query(`insert into public.einladungen (email, rolle, sprachen) values ('mehmet@example.org', 'sprachpate', '{tr}')`);
  const hook = async (email) => wert(await klient.query(`select public.hook_konto_pruefen($1::jsonb)`, [JSON.stringify({ user: { email } })]));
  pruefe('Hook lässt eingeladene Adresse zu (Groß/klein egal)', JSON.stringify(await hook('Anna@Example.org')) === '{}');
  pruefe('Hook lehnt nicht eingeladene Adresse ab', (await hook('fremd@example.org'))?.error?.http_code === 403);

  const anlegen = async (email) =>
    wert(await klient.query(`insert into auth.users (email) values ($1) returning id`, [email]));
  const anna = await anlegen('Anna@Example.org');
  const mehmet = await anlegen('mehmet@example.org');
  const fremd = await anlegen('fremd@example.org');
  pruefe('Eingeladene Person bekommt ihre Rolle beim ersten Anmelden',
    wert(await als(anna, 'select public.mein_profil()'))?.rolle === 'anleiter');
  pruefe('Einladung ist danach erledigt', (await klient.query('select * from public.einladungen')).rowCount === 0);
  pruefe('Sprachpate hat seine Sprachen', JSON.stringify(wert(await als(mehmet, 'select public.mein_profil()'))?.sprachen) === '["tr"]');
  pruefe('Nicht eingeladene Person hat keine Rolle', wert(await als(fremd, 'select public.mein_profil()')) === null);

  // --- Tablet ohne Login ------------------------------------------------------
  const tablet = wert(await als(null, `select public.platz_inhalte('bankett')`));
  pruefe('Tablet: Arbeitsplatz und Ansprechperson', tablet.arbeitsplatz.name === 'Bankett' && tablet.arbeitsplatz.ansprechperson.name_in.uk === 'пані Вебер');
  pruefe('Tablet: freigegebene Fassungen in 5 Sprachen', tablet.fassungen.map((f) => f.sprache).sort().join() === 'ar,de,en,tr,uk');
  const uk = tablet.fassungen.find((f) => f.sprache === 'uk').fassung;
  pruefe('Tablet: Sprachfassung enthält deutschen Bezugstext und Prüfstatus',
    uk.schritte.length === 8 && uk.schritte[0].text === 'Помий руки.' && uk.schritte[0].text_de === 'Wasch dir die Hände.' && uk.schritte[0].status === 'maschinell');
  pruefe('Tablet: 16 aktive Sprachen in der Liste', tablet.sprachen.length === 16);
  pruefe('Tablet: unbekannter Arbeitsplatz liefert nichts', wert(await als(null, `select public.platz_inhalte('gibt-es-nicht')`)) === null);
  pruefe('Ohne Login keine Tabellen lesbar', (await fehlerVon(als(null, 'select * from public.anleitungen')))?.includes('permission denied'));
  pruefe('Ohne Login keine Anleiter-Funktionen', (await fehlerVon(als(null, 'select public.anleitungen_liste()')))?.includes('permission denied'));
  pruefe('Ohne Rolle keine Anleiter-Funktionen', (await fehlerVon(als(fremd, 'select public.anleitungen_liste()')))?.includes('nur Anleiter'));
  pruefe('Ohne Rolle keine Anleitungen lesbar', (await als(fremd, 'select * from public.anleitungen')).rowCount === 0);

  // --- Anleiter:in: Liste, anlegen, freigeben ----------------------------------
  const liste = wert(await als(anna, 'select public.anleitungen_liste()'));
  pruefe('Liste: 2 Anleitungen mit Status je Sprache',
    liste.length === 2 && liste.every((a) => a.sprachen.length === 4 && a.status_de === 'freigegeben' && a.auf_tablet));

  const neu = {
    titel_de: 'Kaffee·maschine reinigen',
    originaltext: 'Brühgruppe entnehmen und unter Wasser spülen.',
    ansprechperson: 'Herr Klein',
    arbeitsplaetze: ['bankett'],
    zielsprachen: ['en', 'tr'],
    schritte: [
      { text_de: 'Mach die Maschine aus.', hinweis_de: 'Der Schalter ist rechts.', bildwort: 'Schalter', achtung: true },
      { text_de: 'Nimm die Brüh·gruppe heraus.', hinweis_de: '', bildwort: 'Kaffee', achtung: false },
    ],
  };
  const neueId = wert(await als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify(neu)], { dauerhaft: true }));
  let geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  pruefe('Neue Anleitung ist ein Entwurf mit 2 Schritten', geladen.status_de === 'entwurf' && geladen.schritte.length === 2 && !geladen.auf_tablet);
  const anzahlAmTablet = async () =>
    wert(await als(null, `select public.platz_inhalte('bankett')`)).fassungen.filter((f) => f.anleitung_id === neueId).length;
  pruefe('Entwurf erscheint nicht auf dem Tablet', (await anzahlAmTablet()) === 0);
  pruefe('Leerer Titel wird abgelehnt',
    (await fehlerVon(als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify({ ...neu, titel_de: ' ' })])))?.includes('Titel'));

  await als(anna, 'select public.anleitung_freigeben($1)', [neueId], { dauerhaft: true });
  pruefe('Nach „Deutsch freigeben“ ist sie auf dem Tablet', (await anzahlAmTablet()) === 1);

  // Bearbeiten nach der Freigabe: Tablet zeigt weiter die freigegebene Fassung.
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  const geaendert = { ...geladen, schritte: geladen.schritte.map((s, i) => (i === 0 ? { ...s, text_de: 'Schalte die Maschine aus.' } : s)) };
  await als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify(geaendert)], { dauerhaft: true });
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  pruefe('Geänderter Schritt bekommt Version 2, Status wird Entwurf', geladen.schritte[0].version === 2 && geladen.status_de === 'entwurf');
  let amTablet = wert(await als(null, `select public.platz_inhalte('bankett')`)).fassungen.find((f) => f.anleitung_id === neueId);
  pruefe('Tablet zeigt bis zur nächsten Freigabe den alten Satz', amTablet.fassung.schritte[0].text === 'Mach die Maschine aus.');
  await als(anna, 'select public.anleitung_freigeben($1)', [neueId], { dauerhaft: true });
  amTablet = wert(await als(null, `select public.platz_inhalte('bankett')`)).fassungen.find((f) => f.anleitung_id === neueId);
  pruefe('Nach erneuter Freigabe zeigt das Tablet den neuen Satz', amTablet.fassung.schritte[0].text === 'Schalte die Maschine aus.');

  // Zurück zum freigegebenen Stand ohne Änderung: bleibt freigegeben.
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  await als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify(geladen)], { dauerhaft: true });
  pruefe('Speichern ohne Änderung lässt die Freigabe stehen',
    wert(await als(anna, 'select public.anleitung_laden($1)', [neueId])).status_de === 'freigegeben');

  // Reihenfolge ändern (Positionen tauschen) ohne Konflikt.
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  await als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify({ ...geladen, schritte: [...geladen.schritte].reverse() })], { dauerhaft: true });
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [neueId]));
  pruefe('Schritte verschieben funktioniert', geladen.schritte[0].text_de === 'Nimm die Brüh·gruppe heraus.' && geladen.schritte[1].version === 2);

  const leer = { ...geladen, schritte: [...geladen.schritte, { text_de: '', hinweis_de: '', bildwort: '', achtung: false }] };
  await als(anna, 'select public.anleitung_speichern($1::jsonb)', [JSON.stringify(leer)], { dauerhaft: true });
  pruefe('Freigabe mit leerem Schritt wird abgelehnt',
    (await fehlerVon(als(anna, 'select public.anleitung_freigeben($1)', [neueId])))?.includes('Schritt 3 hat noch keinen Satz'));

  // --- Veraltet: Deutsche Änderung markiert Übersetzungen ---------------------
  const bad = liste.find((a) => a.titel_de.startsWith('Ein Bad'));
  geladen = wert(await als(anna, 'select public.anleitung_laden($1)', [bad.id]));
  const ersterSchritt = geladen.schritte[0].id;
  await als(anna, 'select public.anleitung_speichern($1::jsonb)', [
    JSON.stringify({ ...geladen, schritte: geladen.schritte.map((s, i) => (i === 0 ? { ...s, text_de: 'Zieh immer Hand·schuhe an.' } : s)) }),
  ], { dauerhaft: true });
  const status = (await klient.query(
    `select schritt_id = $1 as erster, status from public.schritt_uebersetzungen u
     join public.schritte s on s.id = u.schritt_id where s.anleitung_id = $2`, [ersterSchritt, bad.id])).rows;
  pruefe('Übersetzungen des geänderten Schritts sind „veraltet“',
    status.filter((r) => r.erster).every((r) => r.status === 'veraltet') && status.filter((r) => r.erster).length === 4);
  pruefe('Übersetzungen der anderen Schritte bleiben „maschinell“', status.filter((r) => !r.erster).every((r) => r.status === 'maschinell'));
  pruefe('Sprachfassungen der Anleitung sind „veraltet“',
    (await klient.query(`select distinct status from public.anleitung_sprachen where anleitung_id = $1`, [bad.id])).rows.map((r) => r.status).join() === 'veraltet');
  const ukBad = wert(await als(null, `select public.platz_inhalte('housekeeping-etage-2')`)).fassungen.find((f) => f.sprache === 'uk');
  pruefe('Tablet zeigt die alte ukrainische Fassung weiter', ukBad.fassung.schritte[0].text === 'Одягни рукавички.' && ukBad.fassung.schritte[0].text_de === 'Zieh Hand·schuhe an.');

  // --- Sprachpate --------------------------------------------------------------
  pruefe('Sprachpate darf keine Anleiter-Funktionen nutzen', (await fehlerVon(als(mehmet, 'select public.anleitungen_liste()')))?.includes('nur Anleiter'));
  const sprachenSichtbar = (await als(mehmet, 'select distinct sprache from public.schritt_uebersetzungen')).rows.map((r) => r.sprache);
  pruefe('Sprachpate sieht nur Übersetzungen seiner Sprache', sprachenSichtbar.join() === 'tr');
  pruefe('Sprachpate sieht deutsche Schritte als Bezug', (await als(mehmet, 'select * from public.schritte')).rowCount >= 16);
  const geaendertTr = await als(mehmet, `update public.schritt_uebersetzungen set text = 'Eldivenini giy.' where sprache = 'tr' and schritt_id = $1`, [ersterSchritt]);
  const geaendertUk = await als(mehmet, `update public.schritt_uebersetzungen set text = 'x' where sprache = 'uk'`);
  pruefe('Sprachpate kann seine Sprache korrigieren, andere nicht', geaendertTr.rowCount === 1 && geaendertUk.rowCount === 0);
  pruefe('Sprachpate kann die Rückübersetzung nicht ändern',
    (await fehlerVon(als(mehmet, `update public.schritt_uebersetzungen set rueckuebersetzung = 'x' where sprache = 'tr'`)))?.includes('Sprachpaten'));
  pruefe('Sprachpate kann keine Schritte ändern', (await als(mehmet, `update public.schritte set text_de = 'x'`)).rowCount === 0);

  // --- Arbeitsplätze -----------------------------------------------------------
  pruefe('Doppelte Arbeitsplatz-Adresse wird abgelehnt',
    (await fehlerVon(als(anna, 'select public.arbeitsplatz_speichern($1::jsonb, true)', [JSON.stringify({ id: 'bankett', name: 'X' })])))?.includes('gibt es schon'));
  await als(anna, 'select public.arbeitsplatz_speichern($1::jsonb, true)', [JSON.stringify({ id: 'spuelkueche', name: 'Spülküche', angebotene_sprachen: ['de', 'ar'] })], { dauerhaft: true });
  const plaetze = wert(await als(anna, 'select public.arbeitsplaetze_liste()'));
  pruefe('Neuer Arbeitsplatz ist angelegt', plaetze.some((p) => p.id === 'spuelkueche' && p.anleitungen === 0));
  pruefe('Ungültige Adresse wird abgelehnt',
    Boolean(await fehlerVon(als(anna, 'select public.arbeitsplatz_speichern($1::jsonb, true)', [JSON.stringify({ id: 'Spül Küche', name: 'X' })]))));

  // --- Team ----------------------------------------------------------------------
  pruefe('Sprachpate ohne Sprache wird abgelehnt',
    (await fehlerVon(als(anna, `select public.einladen('olena@example.org', 'sprachpate', '{}')`)))?.includes('Sprache'));
  await als(anna, `select public.einladen('Olena@Example.org', 'sprachpate', '{uk}')`, [], { dauerhaft: true });
  const team = wert(await als(anna, 'select public.team_liste()'));
  pruefe('Team-Liste mit Mitgliedern und offener Einladung', team.mitglieder.length === 2 && team.einladungen[0]?.email === 'olena@example.org');
  pruefe('Letzte Anleiterin kann nicht entfernt werden',
    (await fehlerVon(als(anna, 'select public.mitglied_entfernen($1)', [anna])))?.includes('mindestens eine'));
  pruefe('Letzte Anleiterin kann nicht zur Sprachpatin werden',
    (await fehlerVon(als(anna, `select public.mitglied_aendern($1, 'sprachpate', '{de}')`, [anna])))?.includes('mindestens eine'));
  pruefe('Sprachpate kann niemanden einladen',
    (await fehlerVon(als(mehmet, `select public.einladen('x@example.org', 'anleiter', '{}')`)))?.includes('nur Anleiter'));

  // --- Löschen ----------------------------------------------------------------
  await als(anna, 'select public.anleitung_loeschen($1)', [neueId], { dauerhaft: true });
  pruefe('Anleitung löschen entfernt Schritte und Zuordnungen',
    (await klient.query('select count(*)::int as n from public.schritte where anleitung_id = $1', [neueId])).rows[0].n === 0 && (await anzahlAmTablet()) === 0);
} catch (e) {
  pruefe('Unerwarteter Fehler', false, e.stack);
} finally {
  await db.beenden();
}

const fehler = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length - fehler.length} von ${ergebnisse.length} Datenbank-Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
