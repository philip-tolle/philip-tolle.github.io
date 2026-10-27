import type { Ansprechperson, Fassung, FassungSchritt, Inhalte, Richtung, Sprache } from '../typen';
import { QUELLSPRACHE } from '../daten/sprachen';

// Regeln für die Mitarbeiter-Ansicht. Reine Funktionen ohne Seiteneffekte.
// Grundlage sind freigegebene Fassungen (Momentaufnahmen) – Entwürfe kommen hier nie an.

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

function richtungVon(code: string, sprachen: Sprache[]): Richtung {
  return sprachen.find((s) => s.code === code)?.richtung ?? 'ltr';
}

/**
 * Sprachen für die Sprachwahl: aktiv, vom Arbeitsplatz angeboten und mit
 * mindestens einer freigegebenen Fassung.
 */
export function verfuegbareSprachen(inhalte: Inhalte): Sprache[] {
  return inhalte.sprachen.filter(
    (s) =>
      s.aktiv &&
      inhalte.arbeitsplatz.angebotene_sprachen.includes(s.code) &&
      inhalte.fassungen.some((f) => f.sprache === s.code),
  );
}

export function istSicherheitUngeprueft(schritt: FassungSchritt, sprache: string): boolean {
  if (!schritt.achtung || sprache === QUELLSPRACHE) return false;
  if (schritt.text === null) return true;
  return schritt.status !== 'geprueft' || (schritt.basiert_auf_version ?? 0) < schritt.version;
}

function schrittFuerAnzeige(schritt: FassungSchritt, sprache: string, sprachen: Sprache[]): AnzeigeSchritt {
  // Fehlt eine Übersetzung, steht der deutsche Satz da – richtig ausgezeichnet als Deutsch.
  const uebersetzt = sprache !== QUELLSPRACHE && schritt.text !== null;
  const textSprache = uebersetzt ? sprache : QUELLSPRACHE;
  const dir = richtungVon(textSprache, sprachen);
  return {
    id: schritt.id,
    position: schritt.position,
    bild_url: schritt.bild_url,
    achtung: schritt.achtung,
    satz: { text: uebersetzt ? schritt.text! : schritt.text_de, lang: textSprache, dir },
    hinweis: { text: uebersetzt ? (schritt.hinweis ?? '') : schritt.hinweis_de, lang: textSprache, dir },
    satz_de: schritt.text_de,
    hinweis_de: schritt.hinweis_de,
    sicherheitUngeprueft: istSicherheitUngeprueft(schritt, sprache),
  };
}

function fassungFuerAnzeige(fassung: Fassung, sprachen: Sprache[]): AnzeigeAnleitung {
  const titelSprache = fassung.titel.trim() ? fassung.sprache : QUELLSPRACHE;
  return {
    id: fassung.anleitung_id,
    titel: {
      text: titelSprache === fassung.sprache ? fassung.titel : fassung.titel_de,
      lang: titelSprache,
      dir: richtungVon(titelSprache, sprachen),
    },
    titel_de: fassung.titel_de,
    bild_url: fassung.titelbild_url ?? fassung.schritte[0]?.bild_url ?? null,
    ansprechperson: fassung.ansprechperson,
    schritte: [...fassung.schritte]
      .sort((a, b) => a.position - b.position)
      .map((s) => schrittFuerAnzeige(s, fassung.sprache, sprachen)),
  };
}

export function anleitungFuerAnzeige(inhalte: Inhalte, anleitungId: string, sprache: string): AnzeigeAnleitung | null {
  const fassung = inhalte.fassungen.find((f) => f.anleitung_id === anleitungId && f.sprache === sprache);
  return fassung ? fassungFuerAnzeige(fassung, inhalte.sprachen) : null;
}

/** Alle Anleitungen, die an diesem Arbeitsplatz in dieser Sprache freigegeben sind. */
export function anleitungenFuerPlatz(inhalte: Inhalte, sprache: string): AnzeigeAnleitung[] {
  return inhalte.fassungen
    .filter((f) => f.sprache === sprache)
    .sort((a, b) => a.titel_de.localeCompare(b.titel_de, 'de'))
    .map((f) => fassungFuerAnzeige(f, inhalte.sprachen));
}

/** Name der Ansprechperson in der Schrift der gewählten Sprache. */
export function personName(person: Ansprechperson, sprache: string): string {
  return person.name_in[sprache] ?? person.name;
}

/** Wer bei einem Hilferuf kommt: Ansprechperson der Anleitung, sonst die des Arbeitsplatzes. */
export function ansprechpersonFuer(inhalte: Inhalte, anleitungId: string | null): Ansprechperson {
  const fassung = anleitungId ? inhalte.fassungen.find((f) => f.anleitung_id === anleitungId) : undefined;
  return fassung && fassung.ansprechperson.name.trim() ? fassung.ansprechperson : inhalte.arbeitsplatz.ansprechperson;
}
