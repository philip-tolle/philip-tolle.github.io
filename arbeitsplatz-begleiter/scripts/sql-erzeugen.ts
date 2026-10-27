// Erzeugt die SQL-Dateien für Supabase aus den Daten der App, damit es nur eine Quelle gibt:
//   supabase/migrations/20261027090100_sprachen.sql  – Sprachliste
//   supabase/seed.sql                                – Beispieldaten (Bankett, Housekeeping)
//   supabase/einrichtung.sql                         – alle Migrationen in einer Datei zum Einfügen
// Aufruf: npm run sql

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANLEITUNG_SPRACHEN,
  ANLEITUNGEN,
  ARBEITSPLAETZE,
  SCHRITT_UEBERSETZUNGEN,
  SCHRITTE,
} from '../src/daten/beispieldaten';
import { SPRACHEN } from '../src/daten/sprachen';

const ORDNER = join(import.meta.dirname, '..', 'supabase');

/** Feste UUID aus einem Namen, damit die Beispieldaten bei jedem Lauf gleich sind. */
export function feste_uuid(name: string): string {
  const h = createHash('sha1').update(`arbeitsplatz-begleiter:${name}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const q = (s: string | null) => (s === null ? 'null' : `'${s.replace(/'/g, "''")}'`);
const arr = (a: string[]) => `array[${a.map(q).join(', ')}]::text[]`;
const json = (o: unknown) => `${q(JSON.stringify(o))}::jsonb`;

const kopf = (titel: string) => `-- ${titel}\n-- Automatisch erzeugt mit „npm run sql“ aus src/daten/. Nicht von Hand ändern.\n\n`;

const sprachen =
  kopf('Sprachliste (in den Einstellungen erweiterbar)') +
  'insert into public.sprachen (code, name_eigen, name_de, richtung, vorlesen, qualitaet, aktiv, stimmen, reihenfolge) values\n' +
  SPRACHEN.map(
    (s, i) =>
      `  (${q(s.code)}, ${q(s.name_eigen)}, ${q(s.name_de)}, ${q(s.richtung)}, ${q(s.vorlesen)}, ${q(s.qualitaet)}, ${s.aktiv}, ${arr(s.stimmen)}, ${(i + 1) * 10})`,
  ).join(',\n') +
  '\non conflict (code) do nothing;\n';
writeFileSync(join(ORDNER, 'migrations', '20261027090100_sprachen.sql'), sprachen);

const id = (x: string) => feste_uuid(x);
const zeilen: string[] = [kopf('Beispieldaten: Arbeitsplätze „Bankett“ und „Housekeeping Etage 2“, zwei Anleitungen, Übersetzungen (maschinell)')];

zeilen.push('insert into public.arbeitsplaetze (id, name, angebotene_sprachen, ansprechperson, ansprechperson_in) values');
zeilen.push(
  ARBEITSPLAETZE.map(
    (p) => `  (${q(p.id)}, ${q(p.name)}, ${arr(p.angebotene_sprachen)}, ${q(p.ansprechperson.name)}, ${json(p.ansprechperson.name_in)})`,
  ).join(',\n') + '\non conflict (id) do nothing;\n',
);

zeilen.push('insert into public.anleitungen (id, titel_de, originaltext, ansprechperson, ansprechperson_in, zielsprachen, titelbild_url) values');
zeilen.push(
  ANLEITUNGEN.map(
    (a) =>
      `  (${q(id(a.id))}, ${q(a.titel_de)}, ${q(a.originaltext)}, ${q(a.ansprechperson.name)}, ${json(a.ansprechperson.name_in)}, ${arr(['en', 'uk', 'ar', 'tr'])}, ${q(a.titelbild_url)})`,
  ).join(',\n') + '\non conflict (id) do nothing;\n',
);

zeilen.push('insert into public.anleitung_arbeitsplatz (anleitung_id, arbeitsplatz_id) values');
zeilen.push(
  ANLEITUNGEN.flatMap((a) => a.arbeitsplaetze.map((p) => `  (${q(id(a.id))}, ${q(p)})`)).join(',\n') +
    '\non conflict do nothing;\n',
);

zeilen.push('insert into public.schritte (id, anleitung_id, position, text_de, hinweis_de, bildwort, bild_url, achtung) values');
zeilen.push(
  SCHRITTE.map(
    (s) =>
      `  (${q(id(s.id))}, ${q(id(s.anleitung_id))}, ${s.position}, ${q(s.text_de)}, ${q(s.hinweis_de)}, ${q(s.bildwort)}, ${q(s.bild_url)}, ${s.achtung})`,
  ).join(',\n') + '\non conflict (id) do nothing;\n',
);

zeilen.push('insert into public.anleitung_sprachen (anleitung_id, sprache, titel, status) values');
zeilen.push(
  ANLEITUNG_SPRACHEN.map((f) => `  (${q(id(f.anleitung_id))}, ${q(f.sprache)}, ${q(f.titel)}, 'freigegeben')`).join(',\n') +
    '\non conflict do nothing;\n',
);

zeilen.push(
  'insert into public.schritt_uebersetzungen (schritt_id, sprache, text, hinweis, rueckuebersetzung, unsicher, grund, status, basiert_auf_version) values',
);
zeilen.push(
  SCHRITT_UEBERSETZUNGEN.map(
    (u) =>
      `  (${q(id(u.schritt_id))}, ${q(u.sprache)}, ${q(u.text)}, ${q(u.hinweis)}, ${q(u.rueckuebersetzung)}, ${u.unsicher}, ${q(u.grund)}, 'maschinell', 1)`,
  ).join(',\n') + '\non conflict do nothing;\n',
);

const anleitungsIds = ANLEITUNGEN.map((a) => q(id(a.id))).join(', ');
zeilen.push(`-- Deutsch freigeben, dann die Sprachfassungen (Testdaten, von keinem Sprachpaten geprüft).
update public.anleitungen
  set fassung_de = public._fassung_de_bauen(id), status_de = 'freigegeben', freigegeben_am = now()
  where id in (${anleitungsIds}) and fassung_de is null;

update public.anleitung_sprachen
  set fassung = public._sprachfassung_bauen(anleitung_id, sprache), freigegeben_am = now()
  where anleitung_id in (${anleitungsIds}) and fassung is null;
`);
writeFileSync(join(ORDNER, 'seed.sql'), zeilen.join('\n'));

const migrationen = readdirSync(join(ORDNER, 'migrations')).filter((n) => n.endsWith('.sql')).sort();
writeFileSync(
  join(ORDNER, 'einrichtung.sql'),
  kopf('Einrichtung in einem Stück: Supabase → SQL Editor → einfügen → Run') +
    migrationen.map((n) => `-- ===== ${n} =====\n\n${readFileSync(join(ORDNER, 'migrations', n), 'utf8')}`).join('\n'),
);
console.log(`Erzeugt: ${migrationen.length} Migrationen, seed.sql, einrichtung.sql`);
