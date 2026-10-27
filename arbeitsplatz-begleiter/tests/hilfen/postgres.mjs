// Startet eine frische, temporäre Postgres-Datenbank mit Supabase-Nachbau, Einrichtung und Beispieldaten.
// Braucht die Postgres-Programme (z. B. /usr/lib/postgresql/16/bin) und läuft als Benutzer „postgres“.

import { execFileSync } from 'node:child_process';
import { chownSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pg = require('pg');
const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function binOrdner() {
  for (const v of ['17', '16', '15']) {
    const o = `/usr/lib/postgresql/${v}/bin`;
    if (existsSync(join(o, 'initdb'))) return o;
  }
  throw new Error('Postgres-Programme nicht gefunden');
}

function alsPostgres(befehl, args) {
  const istRoot = process.getuid?.() === 0;
  return istRoot
    ? execFileSync('runuser', ['-u', 'postgres', '--', befehl, ...args], { stdio: 'pipe' })
    : execFileSync(befehl, args, { stdio: 'pipe' });
}

export async function datenbankStarten({ port = 54329, beispieldaten = true } = {}) {
  const bin = binOrdner();
  const ordner = mkdtempSync(join(tmpdir(), 'begleiter-pg-'));
  if (process.getuid?.() === 0) {
    const uid = Number(execFileSync('id', ['-u', 'postgres']).toString());
    const gid = Number(execFileSync('id', ['-g', 'postgres']).toString());
    chownSync(ordner, uid, gid);
  }
  alsPostgres(join(bin, 'initdb'), ['-D', join(ordner, 'daten'), '-A', 'trust', '-U', 'postgres', '-E', 'UTF8', '--locale=C.UTF-8']);
  alsPostgres(join(bin, 'pg_ctl'), ['-D', join(ordner, 'daten'), '-o', `-p ${port} -k ${ordner} -c listen_addresses=127.0.0.1`, '-l', join(ordner, 'log'), '-w', 'start']);

  const verbindung = { host: '127.0.0.1', port, user: 'postgres', database: 'postgres' };
  const klient = new pg.Client(verbindung);
  await klient.connect();
  await klient.query(readFileSync(join(wurzel, 'tests', 'datenbank', 'supabase-nachbau.sql'), 'utf8'));
  await klient.query(readFileSync(join(wurzel, 'supabase', 'einrichtung.sql'), 'utf8'));
  if (beispieldaten) await klient.query(readFileSync(join(wurzel, 'supabase', 'seed.sql'), 'utf8'));

  async function beenden() {
    await klient.end().catch(() => {});
    try {
      alsPostgres(join(bin, 'pg_ctl'), ['-D', join(ordner, 'daten'), '-m', 'immediate', 'stop']);
    } catch {}
    rmSync(ordner, { recursive: true, force: true });
  }

  /**
   * Führt SQL so aus, wie Supabase es für eine Anfrage tut: als Rolle anon oder authenticated,
   * mit der Benutzer-ID im JWT. Alles in einer Transaktion, die danach zurückgerollt wird
   * (dauerhaft: dauerhaft = true).
   */
  async function als(benutzer, sql, parameter = [], { dauerhaft = false } = {}) {
    const c = new pg.Client(verbindung);
    await c.connect();
    try {
      await c.query('begin');
      await c.query(`set local role ${benutzer ? 'authenticated' : 'anon'}`);
      const claims = benutzer ? { sub: benutzer, role: 'authenticated' } : { role: 'anon' };
      await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
      const r = await c.query(sql, parameter);
      await c.query(dauerhaft ? 'commit' : 'rollback');
      return r;
    } catch (e) {
      await c.query('rollback').catch(() => {});
      throw e;
    } finally {
      await c.end();
    }
  }

  return { klient, verbindung, als, beenden };
}
