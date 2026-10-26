import { useCallback, useState } from 'react';

// Einstellungen gelten für das Gerät, nicht für eine Person.
// Gespeichert wird nur, was das Tablet braucht – keine Nutzungsdaten.

export type Tempo = 'langsam' | 'normal' | 'schnell';
export type Schrift = 'normal' | 'gross' | 'sehr-gross';
export type Farben = 'automatisch' | 'hell' | 'dunkel';

export interface Geraeteeinstellungen {
  sprache: string | null;
  mitlernen: boolean;
  autoVorlesen: boolean;
  tempo: Tempo;
  schrift: Schrift;
  kontrast: boolean;
  farben: Farben;
}

export const STANDARD: Geraeteeinstellungen = {
  sprache: null,
  mitlernen: false,
  autoVorlesen: true,
  tempo: 'normal',
  schrift: 'normal',
  kontrast: false,
  farben: 'automatisch',
};

/** Testversion: feste PIN. Ab Phase 7 hat jeder Arbeitsplatz eine eigene PIN (gespeichert als Hash). */
export const TEST_PIN = '1234';

const SCHLUESSEL = 'arbeitsplatz-begleiter:geraet';

const TEMPI: Tempo[] = ['langsam', 'normal', 'schnell'];
const SCHRIFTEN: Schrift[] = ['normal', 'gross', 'sehr-gross'];
const FARBEN: Farben[] = ['automatisch', 'hell', 'dunkel'];

/** Gespeicherten Text prüfen; Unbekanntes oder Kaputtes fällt auf den Standard zurück. */
export function einstellungenAuswerten(roh: string | null): Geraeteeinstellungen {
  if (!roh) return { ...STANDARD };
  let wert: unknown;
  try {
    wert = JSON.parse(roh);
  } catch {
    return { ...STANDARD };
  }
  if (typeof wert !== 'object' || wert === null) return { ...STANDARD };
  const w = wert as Record<string, unknown>;
  const ja = (k: string, standard: boolean) => (typeof w[k] === 'boolean' ? (w[k] as boolean) : standard);
  const aus = <T extends string>(k: string, liste: T[], standard: T) =>
    liste.includes(w[k] as T) ? (w[k] as T) : standard;
  return {
    sprache: typeof w.sprache === 'string' && /^[a-z]{2,3}$/.test(w.sprache) ? w.sprache : null,
    mitlernen: ja('mitlernen', STANDARD.mitlernen),
    autoVorlesen: ja('autoVorlesen', STANDARD.autoVorlesen),
    tempo: aus('tempo', TEMPI, STANDARD.tempo),
    schrift: aus('schrift', SCHRIFTEN, STANDARD.schrift),
    kontrast: ja('kontrast', STANDARD.kontrast),
    farben: aus('farben', FARBEN, STANDARD.farben),
  };
}

function lesen(): Geraeteeinstellungen {
  try {
    return einstellungenAuswerten(window.localStorage.getItem(SCHLUESSEL));
  } catch {
    return { ...STANDARD };
  }
}

function speichern(e: Geraeteeinstellungen) {
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(e));
  } catch {
    // Speicher nicht verfügbar (privates Fenster): Die App läuft trotzdem, nur ohne Erinnerung.
  }
}

export function useGeraeteeinstellungen() {
  const [einstellungen, setzen] = useState<Geraeteeinstellungen>(lesen);
  const aendern = useCallback((teil: Partial<Geraeteeinstellungen>) => {
    setzen((alt) => {
      const neu = { ...alt, ...teil };
      speichern(neu);
      return neu;
    });
  }, []);
  return [einstellungen, aendern] as const;
}

export const TEMPO_RATE: Record<Tempo, number> = { langsam: 0.7, normal: 0.9, schnell: 1.05 };
/** „Nochmal“ liest langsamer vor. */
export const NOCHMAL_FAKTOR = 0.75;
