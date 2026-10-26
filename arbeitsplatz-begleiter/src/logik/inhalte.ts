import type {
  Anleitung,
  Ansprechperson,
  Inhalte,
  Richtung,
  Schritt,
  SchrittUebersetzung,
  Sprache,
} from '../typen';
import { QUELLSPRACHE } from '../daten/sprachen';

// Regeln für die Mitarbeiter-Ansicht. Reine Funktionen ohne Seiteneffekte,
// damit sie in Phase 2 gleich bleiben, wenn die Daten aus der Datenbank kommen.

export interface AnzeigeText {
  text: string;
  lang: string;
  dir: Richtung;
}

export interface AnzeigeSchritt {
  id: string;
  position: number;
  bild_url: string | null;
  achtung: boolean;
  satz: AnzeigeText;
  hinweis: AnzeigeText;
  satz_de: string;
  hinweis_de: string;
  /** Sicherheitsschritt in einer Fremdsprache, den noch kein Sprachpate geprüft hat. */
  sicherheitUngeprueft: boolean;
}

export interface AnzeigeAnleitung {
  id: string;
  titel: AnzeigeText;
  titel_de: string;
  bild_url: string | null;
  ansprechperson: Ansprechperson;
  schritte: AnzeigeSchritt[];
}

const SICHTBARE_SPRACHSTATUS = new Set(['freigegeben', 'veraltet']);

function richtungVon(code: string, sprachen: Sprache[]): Richtung {
  return sprachen.find((s) => s.code === code)?.richtung ?? 'ltr';
}

function anleitungenAmPlatz(inhalte: Inhalte, platzId: string): Anleitung[] {
  return inhalte.anleitungen.filter(
    (a) => a.status_de === 'freigegeben' && a.arbeitsplaetze.includes(platzId),
  );
}

/** Ist diese Anleitung in dieser Sprache für Mitarbeitende freigegeben? */
export function istFreigegeben(inhalte: Inhalte, anleitung: Anleitung, sprache: string): boolean {
  if (anleitung.status_de !== 'freigegeben') return false;
  if (sprache === QUELLSPRACHE) return true;
  const fassung = inhalte.anleitung_sprachen.find(
    (f) => f.anleitung_id === anleitung.id && f.sprache === sprache,
  );
  return fassung !== undefined && SICHTBARE_SPRACHSTATUS.has(fassung.status);
}

/**
 * Sprachen für die Sprachwahl: vom Arbeitsplatz angeboten, aktiv und mit
 * mindestens einer freigegebenen Anleitung an diesem Arbeitsplatz.
 */
export function verfuegbareSprachen(inhalte: Inhalte, platzId: string): Sprache[] {
  const platz = inhalte.arbeitsplaetze.find((p) => p.id === platzId);
  if (!platz) return [];
  const anleitungen = anleitungenAmPlatz(inhalte, platzId);
  return inhalte.sprachen.filter(
    (s) =>
      s.aktiv &&
      platz.angebotene_sprachen.includes(s.code) &&
      anleitungen.some((a) => istFreigegeben(inhalte, a, s.code)),
  );
}

export function istSicherheitUngeprueft(
  schritt: Schritt,
  sprache: string,
  uebersetzung: SchrittUebersetzung | undefined,
): boolean {
  if (!schritt.achtung || sprache === QUELLSPRACHE) return false;
  if (!uebersetzung) return true;
  return uebersetzung.status !== 'geprueft' || uebersetzung.basiert_auf_version < schritt.version;
}

function schrittFuerAnzeige(inhalte: Inhalte, schritt: Schritt, sprache: string): AnzeigeSchritt {
  const ue =
    sprache === QUELLSPRACHE
      ? undefined
      : inhalte.schritt_uebersetzungen.find((u) => u.schritt_id === schritt.id && u.sprache === sprache);
  // Fehlt eine Übersetzung, steht der deutsche Satz da – richtig ausgezeichnet als Deutsch.
  const textSprache = ue ? sprache : QUELLSPRACHE;
  const dir = richtungVon(textSprache, inhalte.sprachen);
  return {
    id: schritt.id,
    position: schritt.position,
    bild_url: schritt.bild_url,
    achtung: schritt.achtung,
    satz: { text: ue?.text ?? schritt.text_de, lang: textSprache, dir },
    hinweis: { text: ue?.hinweis ?? schritt.hinweis_de, lang: textSprache, dir },
    satz_de: schritt.text_de,
    hinweis_de: schritt.hinweis_de,
    sicherheitUngeprueft: istSicherheitUngeprueft(schritt, sprache, ue),
  };
}

export function anleitungFuerAnzeige(
  inhalte: Inhalte,
  anleitungId: string,
  sprache: string,
): AnzeigeAnleitung | null {
  const anleitung = inhalte.anleitungen.find((a) => a.id === anleitungId);
  if (!anleitung || !istFreigegeben(inhalte, anleitung, sprache)) return null;
  const fassung = inhalte.anleitung_sprachen.find(
    (f) => f.anleitung_id === anleitungId && f.sprache === sprache,
  );
  const titelSprache = sprache === QUELLSPRACHE || !fassung ? QUELLSPRACHE : sprache;
  const schritte = inhalte.schritte
    .filter((s) => s.anleitung_id === anleitungId)
    .sort((a, b) => a.position - b.position)
    .map((s) => schrittFuerAnzeige(inhalte, s, sprache));
  return {
    id: anleitung.id,
    titel: {
      text: titelSprache === QUELLSPRACHE ? anleitung.titel_de : fassung!.titel,
      lang: titelSprache,
      dir: richtungVon(titelSprache, inhalte.sprachen),
    },
    titel_de: anleitung.titel_de,
    bild_url: anleitung.titelbild_url ?? schritte[0]?.bild_url ?? null,
    ansprechperson: anleitung.ansprechperson,
    schritte,
  };
}

/** Alle Anleitungen, die an diesem Arbeitsplatz in dieser Sprache freigegeben sind. */
export function anleitungenFuerPlatz(inhalte: Inhalte, platzId: string, sprache: string): AnzeigeAnleitung[] {
  return anleitungenAmPlatz(inhalte, platzId)
    .map((a) => anleitungFuerAnzeige(inhalte, a.id, sprache))
    .filter((a): a is AnzeigeAnleitung => a !== null);
}

/** Name der Ansprechperson in der Schrift der gewählten Sprache. */
export function personName(person: Ansprechperson, sprache: string): string {
  return person.name_in[sprache] ?? person.name;
}
