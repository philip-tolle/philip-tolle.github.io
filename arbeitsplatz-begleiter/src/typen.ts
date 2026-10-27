// Datentypen. Sie folgen dem Datenmodell aus dem Lastenheft, damit Phase 2
// (Datenbank) dieselben Felder übernehmen kann.

export type Richtung = 'ltr' | 'rtl';

export interface Sprache {
  code: string;
  name_eigen: string;
  name_de: string;
  richtung: Richtung;
  vorlesen: 'geraet' | 'server' | 'keiner';
  qualitaet: 'gut' | 'eingeschraenkt';
  aktiv: boolean;
  /** Sprachkennungen für die Gerätestimmen, beste zuerst (z. B. "de-DE"). */
  stimmen: string[];
}

export interface Ansprechperson {
  /** So wie die Anleiterin den Namen eingibt, z. B. „Frau Weber“. */
  name: string;
  /** Schreibweise in anderen Sprachen und Schriften, z. B. „пані Вебер“. */
  name_in: Record<string, string>;
}

export interface Arbeitsplatz {
  id: string;
  name: string;
  angebotene_sprachen: string[];
  ansprechperson: Ansprechperson;
}

export interface Anleitung {
  id: string;
  titel_de: string;
  originaltext: string;
  ansprechperson: Ansprechperson;
  status_de: 'entwurf' | 'freigegeben';
  arbeitsplaetze: string[];
  /** Bild für die Kachel auf dem Startbildschirm (sonst Bild von Schritt 1). */
  titelbild_url: string | null;
  erstellt_am: string;
  geaendert_am: string;
}

export interface Schritt {
  id: string;
  anleitung_id: string;
  position: number;
  text_de: string;
  hinweis_de: string;
  bildwort: string;
  bild_url: string | null;
  achtung: boolean;
  version: number;
}

export interface AnleitungSprache {
  anleitung_id: string;
  sprache: string;
  titel: string;
  status: 'maschinell' | 'in_pruefung' | 'freigegeben' | 'veraltet';
  freigegeben_von: string | null;
  freigegeben_am: string | null;
}

export interface SchrittUebersetzung {
  schritt_id: string;
  sprache: string;
  text: string;
  hinweis: string;
  rueckuebersetzung: string;
  unsicher: boolean;
  grund: string;
  status: 'maschinell' | 'geprueft' | 'veraltet';
  geprueft_von: string | null;
  geprueft_am: string | null;
  basiert_auf_version: number;
}

/** Pluralformen nach Intl.PluralRules (one, few, many, other …). */
export type Pluraltext = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type UiTextSchluessel =
  | 'sprache.taste'
  | 'sprache.gruss'
  | 'sprache.nochmalTippen'
  | 'start.frage'
  | 'start.vorstellung'
  | 'start.schritte'
  | 'start.mitlernen'
  | 'start.leer'
  | 'taste.zurueck'
  | 'taste.vorlesen'
  | 'taste.nochmal'
  | 'taste.weiter'
  | 'taste.fertig'
  | 'taste.hilfe'
  | 'schritt.von'
  | 'schritt.nummer'
  | 'schritt.achtung'
  | 'schritt.fragNach'
  | 'schritt.aufDeutsch'
  | 'fertig.titel'
  | 'fertig.lob'
  | 'fertig.vonVorne'
  | 'fertig.uebersicht'
  | 'fertig.alleSchritte'
  | 'hilfe.unterwegs'
  | 'hilfe.aufDemWeg'
  | 'hilfe.zurueck'
  | 'vorlesen.keineStimme'
  | 'fehler.nichtGefunden'
  | 'fehler.laden';

export interface UiSprachdatei {
  sprache: string;
  status: 'maschinell' | 'in_pruefung' | 'freigegeben';
  texte: Record<UiTextSchluessel, string | Pluraltext>;
}

/** Gesamter Datenbestand (Beispieldaten, Anleiter-Bereich). */
export interface Datenbestand {
  sprachen: Sprache[];
  arbeitsplaetze: Arbeitsplatz[];
  anleitungen: Anleitung[];
  schritte: Schritt[];
  anleitung_sprachen: AnleitungSprache[];
  schritt_uebersetzungen: SchrittUebersetzung[];
}

/** Ein Schritt in einer freigegebenen Fassung. text = null: keine Übersetzung, Deutsch zeigen. */
export interface FassungSchritt {
  id: string;
  position: number;
  bild_url: string | null;
  achtung: boolean;
  version: number;
  text_de: string;
  hinweis_de: string;
  text: string | null;
  hinweis: string | null;
  status: 'freigegeben' | 'maschinell' | 'geprueft' | 'veraltet' | null;
  basiert_auf_version: number | null;
}

/** Freigegebene Momentaufnahme einer Anleitung in einer Sprache. Genau das zeigt das Tablet. */
export interface Fassung {
  anleitung_id: string;
  sprache: string;
  titel: string;
  titel_de: string;
  ansprechperson: Ansprechperson;
  titelbild_url: string | null;
  schritte: FassungSchritt[];
}

/** Alles, was ein Tablet lesen darf: nur freigegebene Fassungen seines Arbeitsplatzes. */
export interface Inhalte {
  sprachen: Sprache[];
  arbeitsplatz: Arbeitsplatz;
  fassungen: Fassung[];
  ui_texte: UiSprachdatei[];
}
