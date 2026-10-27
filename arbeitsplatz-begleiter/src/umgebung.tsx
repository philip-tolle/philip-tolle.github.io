import { createContext, useContext } from 'react';
import type { Geraeteeinstellungen } from './geraet/einstellungen';
import type { Route } from './logik/route';
import type { Text, Uebersetzer } from './logik/texte';
import type { Arbeitsplatz, Inhalte, Sprache } from './typen';

/** Ein Hilferuf enthält nur Ort und Gerätesprache – keinen Namen. */
export interface Hilferuf {
  arbeitsplatz_id: string;
  anleitung_id: string | null;
  schritt_position: number | null;
  sprache: string;
  erstellt_am: string;
}

export type HilfeZustand =
  | { status: 'aus' }
  | { status: 'offen' | 'unterwegs'; ruf: Hilferuf };

/** Woher die Inhalte kommen. „zwischenspeicher“: Datenbank gerade nicht erreichbar, letzter Stand. */
export interface Datenstand {
  quelle: 'datenbank' | 'zwischenspeicher' | 'beispiel';
  stand?: string;
}

export interface Vorleseauftrag {
  id: string;
  text: string;
  lang: string;
}

export interface Umgebung {
  inhalte: Inhalte;
  datenstand: Datenstand;
  platz: Arbeitsplatz;
  sprache: Sprache;
  t: Uebersetzer;
  einstellungen: Geraeteeinstellungen;
  aendern: (teil: Partial<Geraeteeinstellungen>) => void;
  /** Vorlesen; „langsam“ für die Taste „Nochmal“. Zeigt einen Hinweis, wenn keine Stimme da ist. */
  vorlesen: (teile: Vorleseauftrag[], optionen?: { langsam?: boolean }) => void;
  /** Hinweis an der festen Meldungsstelle, z. B. „Dieses Gerät kann diese Sprache nicht vorlesen.“ */
  meldung: Text | null;
  gehe: (route: Route) => void;
  sprachwahlOeffnen: () => void;
  hilfe: HilfeZustand;
  hilfeRufen: (ort: { anleitungId?: string; position?: number }) => void;
  einstellungenOeffnen: () => void;
}

export const UmgebungKontext = createContext<Umgebung | null>(null);

export function useUmgebung(): Umgebung {
  const u = useContext(UmgebungKontext);
  if (!u) throw new Error('useUmgebung außerhalb des Arbeitsplatzes');
  return u;
}
