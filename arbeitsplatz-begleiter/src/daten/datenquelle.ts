import type { Inhalte } from '../typen';
import { ANLEITUNG_SPRACHEN, ANLEITUNGEN, ARBEITSPLAETZE, SCHRITT_UEBERSETZUNGEN, SCHRITTE } from './beispieldaten';
import { SPRACHEN } from './sprachen';
import { UI_TEXTE } from './ui-texte';

// Datenquelle der Mitarbeiter-Ansicht. Phase 1: feste Beispieldaten.
// Phase 2 ersetzt nur diese Datei: Dann kommen die freigegebenen Inhalte
// eines Arbeitsplatzes aus der Datenbank. Die Ansichten bleiben gleich.

export const BEISPIEL_INHALTE: Inhalte = {
  sprachen: SPRACHEN,
  arbeitsplaetze: ARBEITSPLAETZE,
  anleitungen: ANLEITUNGEN,
  schritte: SCHRITTE,
  anleitung_sprachen: ANLEITUNG_SPRACHEN,
  schritt_uebersetzungen: SCHRITT_UEBERSETZUNGEN,
  ui_texte: UI_TEXTE,
};

export async function inhalteLaden(): Promise<Inhalte> {
  return BEISPIEL_INHALTE;
}
