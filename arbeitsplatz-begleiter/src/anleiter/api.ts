import type { SupabaseClient } from '@supabase/supabase-js';
import type { SprachStatusWert } from './status';

// Alle Zugriffe des Anleiter-Bereichs laufen über Datenbank-Funktionen (supabase/migrations).
// Die Funktionen prüfen Rolle und Eingaben; hier wird nur aufgerufen und übersetzt.

export interface Profil {
  user_id: string;
  email: string;
  name: string;
  rolle: 'anleiter' | 'sprachpate';
  sprachen: string[];
}

export interface SpracheZeile {
  code: string;
  name_eigen: string;
  name_de: string;
  richtung: 'ltr' | 'rtl';
  qualitaet: 'gut' | 'eingeschraenkt';
  aktiv: boolean;
}

export interface SprachStatus {
  sprache: string;
  status: SprachStatusWert;
  auf_tablet: boolean;
  freigegeben_am?: string | null;
}

export interface AnleitungKurz {
  id: string;
  titel_de: string;
  status_de: 'entwurf' | 'freigegeben';
  auf_tablet: boolean;
  freigegeben_am: string | null;
  geaendert_am: string;
  anzahl_schritte: number;
  zielsprachen: string[];
  arbeitsplaetze: { id: string; name: string }[];
  sprachen: SprachStatus[];
}

export interface SchrittEntwurf {
  id?: string;
  text_de: string;
  hinweis_de: string;
  bildwort: string;
  bild_url: string | null;
  achtung: boolean;
  version?: number;
}

export interface AnleitungVoll {
  id: string;
  titel_de: string;
  originaltext: string;
  ansprechperson: string;
  zielsprachen: string[];
  titelbild_url: string | null;
  status_de: 'entwurf' | 'freigegeben';
  auf_tablet: boolean;
  freigegeben_am: string | null;
  geaendert_am: string;
  arbeitsplaetze: string[];
  schritte: SchrittEntwurf[];
  sprachen: SprachStatus[];
}

export interface AnleitungEingabe {
  id?: string;
  titel_de: string;
  originaltext: string;
  ansprechperson: string;
  zielsprachen: string[];
  arbeitsplaetze: string[];
  schritte: SchrittEntwurf[];
}

export interface PlatzZeile {
  id: string;
  name: string;
  angebotene_sprachen: string[];
  ansprechperson: string;
  anleitungen: number;
}

export interface Team {
  mitglieder: { user_id: string; email: string; name: string; rolle: 'anleiter' | 'sprachpate'; sprachen: string[]; ich: boolean }[];
  einladungen: { email: string; rolle: 'anleiter' | 'sprachpate'; sprachen: string[]; eingeladen_am: string }[];
}

/** Fehlermeldung in verständlichem Deutsch. */
export function fehlertext(fehler: { message?: string; code?: string } | null | undefined): string {
  const text = fehler?.message ?? '';
  if (/failed to fetch|networkerror|load failed/i.test(text)) {
    return 'Keine Verbindung zur Datenbank. Bitte prüfe das Internet und versuch es noch einmal.';
  }
  if (fehler?.code === '42501' && /permission denied/i.test(text)) return 'Dafür fehlt dir die Berechtigung.';
  return text || 'Das hat nicht geklappt. Bitte versuch es noch einmal.';
}

export function apiFuer(supabase: SupabaseClient) {
  async function rufe<T>(funktion: string, argumente?: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(funktion, argumente);
    if (error) throw new Error(fehlertext(error));
    return data as T;
  }
  return {
    meinProfil: () => rufe<Profil | null>('mein_profil'),
    sprachen: () => rufe<SpracheZeile[]>('sprachen_liste'),
    anleitungen: () => rufe<AnleitungKurz[]>('anleitungen_liste'),
    anleitung: (id: string) => rufe<AnleitungVoll>('anleitung_laden', { p_id: id }),
    anleitungSpeichern: (a: AnleitungEingabe) => rufe<string>('anleitung_speichern', { p_anleitung: a }),
    anleitungFreigeben: (id: string) => rufe<AnleitungVoll>('anleitung_freigeben', { p_id: id }),
    anleitungZurueckziehen: (id: string) => rufe<AnleitungVoll>('anleitung_zurueckziehen', { p_id: id }),
    anleitungLoeschen: (id: string) => rufe<void>('anleitung_loeschen', { p_id: id }),
    arbeitsplaetze: () => rufe<PlatzZeile[]>('arbeitsplaetze_liste'),
    arbeitsplatzSpeichern: (p: Omit<PlatzZeile, 'anleitungen'>, neu: boolean) =>
      rufe<void>('arbeitsplatz_speichern', { p_platz: p, p_neu: neu }),
    arbeitsplatzLoeschen: (id: string) => rufe<void>('arbeitsplatz_loeschen', { p_id: id }),
    team: () => rufe<Team>('team_liste'),
    einladen: (email: string, rolle: string, sprachen: string[]) =>
      rufe<void>('einladen', { p_email: email, p_rolle: rolle, p_sprachen: sprachen }),
    einladungZuruecknehmen: (email: string) => rufe<void>('einladung_zuruecknehmen', { p_email: email }),
    mitgliedAendern: (user: string, rolle: string, sprachen: string[]) =>
      rufe<void>('mitglied_aendern', { p_user: user, p_rolle: rolle, p_sprachen: sprachen }),
    mitgliedEntfernen: (user: string) => rufe<void>('mitglied_entfernen', { p_user: user }),
  };
}

export type Api = ReturnType<typeof apiFuer>;
