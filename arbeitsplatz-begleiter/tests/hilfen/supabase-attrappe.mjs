// Supabase-Attrappe für Tests: echtes Postgres (mit den echten Funktionen und Zugriffsregeln),
// davor ein kleiner Server, der sich wie Supabase verhält – nur so weit, wie die App es braucht:
//   POST /rest/v1/rpc/<funktion>  wie PostgREST (Rolle und Benutzer aus dem JWT)
//   POST /auth/v1/otp, /auth/v1/verify, /auth/v1/logout, GET /auth/v1/user  wie Supabase Auth
// Der Anmelde-Code ist in Tests immer 123456. Außerdem liefert der Server die gebaute App aus.

import { createHmac, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const pg = require('pg');

export const TEST_CODE = '123456';
const GEHEIMNIS = 'nur-fuer-tests-nicht-geheim-genug-fuer-echte-daten';

const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function jwtErstellen(nutzlast) {
  const kopf = b64({ alg: 'HS256', typ: 'JWT' });
  const inhalt = b64(nutzlast);
  const signatur = createHmac('sha256', GEHEIMNIS).update(`${kopf}.${inhalt}`).digest('base64url');
  return `${kopf}.${inhalt}.${signatur}`;
}
function jwtLesen(token) {
  const [kopf, inhalt, signatur] = (token ?? '').split('.');
  if (!signatur) return null;
  const erwartet = createHmac('sha256', GEHEIMNIS).update(`${kopf}.${inhalt}`).digest('base64url');
  if (erwartet !== signatur) return null;
  const n = JSON.parse(Buffer.from(inhalt, 'base64url').toString());
  return n.exp && n.exp < Date.now() / 1000 ? null : n;
}

export const ANON_KEY = jwtErstellen({ role: 'anon', iss: 'test' });

const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' };

export async function attrappeStarten({ verbindung, port = 4420, dist }) {
  const pool = new pg.Pool(verbindung);
  const basis = `http://127.0.0.1:${port}`;
  // Zum Testen von Ausfällen: attrappe.ausfall = true lässt alle Datenbank-Anfragen scheitern.
  const zustand = { ausfall: false, mails: [] };

  function sitzung(user) {
    const jetzt = Math.floor(Date.now() / 1000);
    const access_token = jwtErstellen({ sub: user.id, email: user.email, role: 'authenticated', aud: 'authenticated', iat: jetzt, exp: jetzt + 3600 });
    return {
      access_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: jetzt + 3600,
      refresh_token: `${user.id}.${randomUUID()}`,
      user: nutzerObjekt(user),
    };
  }
  const nutzerObjekt = (u) => ({
    id: u.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: u.email,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  });

  async function funktionAufrufen(name, argumente, jwt) {
    const info = await pool.query(
      `select p.proargnames as namen, p.proargtypes::regtype[]::text[] as typen, p.prorettype::regtype::text as rueck
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = $1`,
      [name],
    );
    if (!info.rowCount) return { status: 404, body: { code: 'PGRST202', message: `Funktion ${name} gibt es nicht` } };
    const { namen = [], typen = [], rueck } = info.rows[0];
    const werte = [];
    const teile = (namen ?? []).map((n, i) => {
      const typ = typen[i];
      const wert = argumente?.[n];
      werte.push(/json/.test(typ) ? JSON.stringify(wert ?? null) : (wert ?? null));
      return `${n} => $${i + 1}::${typ}`;
    });
    const rolle = jwt?.role === 'authenticated' ? 'authenticated' : 'anon';
    const c = await pool.connect();
    try {
      await c.query('begin');
      await c.query(`set local role ${rolle}`);
      await c.query(`select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)`, [
        JSON.stringify(jwt ?? { role: 'anon' }),
        jwt?.sub ?? '',
      ]);
      const r = await c.query(`select public.${name}(${teile.join(', ')}) as ergebnis`, werte);
      await c.query('commit');
      if (rueck === 'void') return { status: 204 };
      return { status: 200, body: r.rows[0].ergebnis };
    } catch (e) {
      await c.query('rollback').catch(() => {});
      return {
        status: e.code === '42501' ? 403 : 400,
        body: { code: e.code, message: e.message, details: e.detail ?? null, hint: e.hint ?? null },
      };
    } finally {
      c.release();
    }
  }

  async function nutzerZuEmail(email) {
    const r = await pool.query('select id, email from auth.users where lower(email) = lower($1)', [email]);
    return r.rows[0] ?? null;
  }

  const server = createServer(async (anfrage, antwort) => {
    const url = new URL(anfrage.url, basis);
    const senden = (status, body) => {
      antwort.writeHead(status, { 'content-type': 'application/json' });
      antwort.end(body === undefined ? '' : JSON.stringify(body));
    };
    let roh = '';
    for await (const stueck of anfrage) roh += stueck;
    const body = roh ? JSON.parse(roh) : {};
    const bearer = (anfrage.headers.authorization ?? '').replace(/^Bearer /, '');

    try {
      if (url.pathname.startsWith('/rest/v1/rpc/')) {
        if (zustand.ausfall) {
          antwort.destroy();
          return;
        }
        const jwt = jwtLesen(bearer);
        const { status, body: daten } = await funktionAufrufen(url.pathname.split('/').pop(), body, jwt);
        return senden(status, daten);
      }
      if (url.pathname === '/auth/v1/otp') {
        const vorhanden = await nutzerZuEmail(body.email);
        if (!vorhanden) {
          const hook = (await pool.query('select public.hook_konto_pruefen($1::jsonb) as e', [JSON.stringify({ user: { email: body.email } })])).rows[0].e;
          if (hook.error) return senden(hook.error.http_code, { code: hook.error.http_code, msg: hook.error.message });
        }
        zustand.mails.push({ an: body.email, code: TEST_CODE });
        return senden(200, {});
      }
      if (url.pathname === '/auth/v1/verify') {
        if (body.token !== TEST_CODE) return senden(403, { code: 403, error_code: 'otp_expired', msg: 'Token has expired or is invalid' });
        let nutzer = await nutzerZuEmail(body.email);
        if (!nutzer) {
          nutzer = (await pool.query('insert into auth.users (email) values ($1) returning id, email', [body.email])).rows[0];
        }
        return senden(200, sitzung(nutzer));
      }
      if (url.pathname === '/auth/v1/user') {
        const jwt = jwtLesen(bearer);
        if (!jwt?.sub) return senden(401, { code: 401, msg: 'invalid JWT' });
        return senden(200, nutzerObjekt({ id: jwt.sub, email: jwt.email }));
      }
      if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') {
        const id = String(body.refresh_token ?? '').split('.')[0];
        const r = await pool.query('select id, email from auth.users where id::text = $1', [id]);
        return r.rowCount ? senden(200, sitzung(r.rows[0])) : senden(400, { code: 400, msg: 'Invalid Refresh Token' });
      }
      if (url.pathname === '/auth/v1/logout') return senden(204);

      // Gebaute App ausliefern, mit Verbindung zu dieser Attrappe.
      if (url.pathname === '/konfiguration.json') return senden(200, { supabaseUrl: basis, supabaseKey: ANON_KEY });
      const pfad = normalize(join(dist, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
      if (pfad.startsWith(dist) && existsSync(pfad) && statSync(pfad).isFile()) {
        antwort.writeHead(200, { 'content-type': TYPEN[extname(pfad)] ?? 'application/octet-stream' });
        return antwort.end(readFileSync(pfad));
      }
      return senden(404, { message: 'nicht gefunden' });
    } catch (e) {
      return senden(500, { message: e.message });
    }
  });

  await new Promise((fertig) => server.listen(port, '127.0.0.1', fertig));
  return {
    basis,
    zustand,
    pool,
    async beenden() {
      await new Promise((fertig) => server.close(fertig));
      await pool.end();
    },
  };
}
