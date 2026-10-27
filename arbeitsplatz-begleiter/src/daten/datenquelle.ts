import type { SupabaseClient } from '@supabase/supabase-js';
import type { Fassung, FassungSchritt, Inhalte, Sprache } from '../typen';
import { beispielInhalte } from './beispielfassungen';
import { UI_TEXTE } from './ui-texte';

// Datenquelle der Mitarbeiter-Ansicht.
// Mit Datenbank: freigegebene Fassungen über platz_inhalte(), mit Zwischenspeicher für Ausfälle.
// Ohne Datenbank (Demo, Testseite): Beispieldaten.

export interface Konfiguration {
  supabaseUrl: string;
  supabaseKey: string;
}

let konfiguration: Promise<Konfiguration | null> | null = null;

/**
 * Verbindung zur Datenbank. Entweder beim Bauen gesetzt (VITE_SUPABASE_URL, VITE_SUPABASE_KEY)
 * oder zur Laufzeit aus „konfiguration.json“ neben index.html – dann reicht es, diese Datei
 * auf dem Webspace auszutauschen.
 */
export function konfigurationLaden(): Promise<Konfiguration | null> {
  konfiguration ??= (async () => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;
    if (url && key) return { supabaseUrl: url, supabaseKey: key };
    try {
      const antwort = await fetch('./konfiguration.json', { cache: 'no-store' });
      if (!antwort.ok) return null;
      const k = (await antwort.json()) as Partial<Konfiguration>;
      return k.supabaseUrl && k.supabaseKey ? { supabaseUrl: k.supabaseUrl, supabaseKey: k.supabaseKey } : null;
    } catch {
      return null;
    }
  })();
  return konfiguration;
}

let klient: Promise<SupabaseClient> | null = null;

export function supabaseKlient(k: Konfiguration): Promise<SupabaseClient> {
  klient ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(k.supabaseUrl, k.supabaseKey, {
      auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'arbeitsplatz-begleiter:anmeldung' },
    }),
  );
  return klient;
}

// ---------------------------------------------------------------------------

interface RohSchrittDe {
  id: string;
  position: number;
  text: string;
  hinweis: string;
  bild_url: string | null;
  achtung: boolean;
  version: number;
}

interface RohFassung {
  titel: string;
  titel_de?: string;
  ansprechperson: { name: string; name_in: Record<string, string> };
  titelbild_url: string | null;
  schritte: (RohSchrittDe & Partial<FassungSchritt>)[];
}

interface RohInhalte {
  arbeitsplatz: { id: string; name: string; angebotene_sprachen: string[]; ansprechperson: { name: string; name_in: Record<string, string> } };
  sprachen: Sprache[];
  fassungen: { anleitung_id: string; sprache: string; fassung: RohFassung }[];
}

/** Übersetzt die Antwort von platz_inhalte() in das Format der Ansichten. */
export function inhalteAusDatenbank(roh: RohInhalte): Inhalte {
  if (!roh?.arbeitsplatz || !Array.isArray(roh.sprachen) || !Array.isArray(roh.fassungen)) {
    throw new Error('Unerwartete Antwort der Datenbank');
  }
  const deutsch = new Map(roh.fassungen.filter((f) => f.sprache === 'de').map((f) => [f.anleitung_id, f.fassung]));
  const fassungen: Fassung[] = roh.fassungen.map(({ anleitung_id, sprache, fassung }) => {
    const istDeutsch = sprache === 'de';
    return {
      anleitung_id,
      sprache,
      titel: fassung.titel ?? '',
      titel_de: istDeutsch ? fassung.titel : (fassung.titel_de ?? deutsch.get(anleitung_id)?.titel ?? ''),
      ansprechperson: fassung.ansprechperson ?? { name: '', name_in: {} },
      titelbild_url: fassung.titelbild_url ?? null,
      schritte: (fassung.schritte ?? []).map((s) =>
        istDeutsch
          ? {
              id: s.id,
              position: s.position,
              bild_url: s.bild_url ?? null,
              achtung: Boolean(s.achtung),
              version: s.version,
              text_de: s.text,
              hinweis_de: s.hinweis ?? '',
              text: s.text,
              hinweis: s.hinweis ?? '',
              status: 'freigegeben' as const,
              basiert_auf_version: s.version,
            }
          : {
              id: s.id,
              position: s.position,
              bild_url: s.bild_url ?? null,
              achtung: Boolean(s.achtung),
              version: s.version,
              text_de: s.text_de ?? '',
              hinweis_de: s.hinweis_de ?? '',
              text: s.text ?? null,
              hinweis: s.hinweis ?? null,
              status: s.status ?? null,
              basiert_auf_version: s.basiert_auf_version ?? null,
            },
      ),
    };
  });
  return {
    arbeitsplatz: {
      id: roh.arbeitsplatz.id,
      name: roh.arbeitsplatz.name,
      angebotene_sprachen: roh.arbeitsplatz.angebotene_sprachen ?? [],
      ansprechperson: roh.arbeitsplatz.ansprechperson ?? { name: '', name_in: {} },
    },
    sprachen: roh.sprachen,
    fassungen,
    ui_texte: UI_TEXTE,
  };
}

export type Ladeergebnis =
  | { status: 'da'; inhalte: Inhalte; quelle: 'datenbank' | 'zwischenspeicher' | 'beispiel'; stand?: string }
  | { status: 'unbekannt' }
  | { status: 'fehler' };

const speicherSchluessel = (platzId: string) => `arbeitsplatz-begleiter:platz:${platzId}`;

function zwischenspeichern(platzId: string, roh: RohInhalte) {
  try {
    localStorage.setItem(speicherSchluessel(platzId), JSON.stringify({ stand: new Date().toISOString(), roh }));
  } catch {
    // Kein Speicher: Bei einem Ausfall gibt es dann keinen Ersatz.
  }
}

function ausZwischenspeicher(platzId: string): { stand: string; roh: RohInhalte } | null {
  try {
    const wert = localStorage.getItem(speicherSchluessel(platzId));
    return wert ? JSON.parse(wert) : null;
  } catch {
    return null;
  }
}

/** Lädt die freigegebenen Inhalte eines Arbeitsplatzes. Fällt die Verbindung aus: letzter Stand. */
export async function platzLaden(platzId: string): Promise<Ladeergebnis> {
  const k = await konfigurationLaden();
  if (!k) {
    const inhalte = beispielInhalte(platzId);
    return inhalte ? { status: 'da', inhalte, quelle: 'beispiel' } : { status: 'unbekannt' };
  }
  try {
    const supabase = await supabaseKlient(k);
    const abbruch = new AbortController();
    const zeit = setTimeout(() => abbruch.abort(), 10000);
    const { data, error } = await supabase.rpc('platz_inhalte', { p_platz: platzId }).abortSignal(abbruch.signal);
    clearTimeout(zeit);
    if (error) throw error;
    if (data === null) return { status: 'unbekannt' };
    const inhalte = inhalteAusDatenbank(data as RohInhalte);
    zwischenspeichern(platzId, data as RohInhalte);
    return { status: 'da', inhalte, quelle: 'datenbank' };
  } catch {
    const gespeichert = ausZwischenspeicher(platzId);
    if (gespeichert) {
      try {
        return { status: 'da', inhalte: inhalteAusDatenbank(gespeichert.roh), quelle: 'zwischenspeicher', stand: gespeichert.stand };
      } catch {
        // Kaputter Zwischenspeicher: wie kein Zwischenspeicher.
      }
    }
    return { status: 'fehler' };
  }
}
