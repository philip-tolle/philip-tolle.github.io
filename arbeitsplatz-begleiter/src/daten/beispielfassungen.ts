import type { Datenbestand, Fassung, Inhalte } from '../typen';
import { ANLEITUNG_SPRACHEN, ANLEITUNGEN, ARBEITSPLAETZE, SCHRITT_UEBERSETZUNGEN, SCHRITTE } from './beispieldaten';
import { SPRACHEN } from './sprachen';
import { UI_TEXTE } from './ui-texte';

// Baut aus den Beispieldaten dieselben freigegebenen Fassungen, die die Datenbank
// mit platz_inhalte() liefert. So läuft die Tablet-Ansicht auch ohne Datenbank (Demo).

export const BEISPIEL_BESTAND: Datenbestand = {
  sprachen: SPRACHEN,
  arbeitsplaetze: ARBEITSPLAETZE,
  anleitungen: ANLEITUNGEN,
  schritte: SCHRITTE,
  anleitung_sprachen: ANLEITUNG_SPRACHEN,
  schritt_uebersetzungen: SCHRITT_UEBERSETZUNGEN,
};

export function fassungenBauen(bestand: Datenbestand, platzId: string): Fassung[] {
  const fassungen: Fassung[] = [];
  for (const a of bestand.anleitungen) {
    if (a.status_de !== 'freigegeben' || !a.arbeitsplaetze.includes(platzId)) continue;
    const schritte = bestand.schritte.filter((s) => s.anleitung_id === a.id).sort((x, y) => x.position - y.position);
    fassungen.push({
      anleitung_id: a.id,
      sprache: 'de',
      titel: a.titel_de,
      titel_de: a.titel_de,
      ansprechperson: a.ansprechperson,
      titelbild_url: a.titelbild_url,
      schritte: schritte.map((s) => ({
        id: s.id,
        position: s.position,
        bild_url: s.bild_url,
        achtung: s.achtung,
        version: s.version,
        text_de: s.text_de,
        hinweis_de: s.hinweis_de,
        text: s.text_de,
        hinweis: s.hinweis_de,
        status: 'freigegeben',
        basiert_auf_version: s.version,
      })),
    });
    for (const f of bestand.anleitung_sprachen) {
      if (f.anleitung_id !== a.id || (f.status !== 'freigegeben' && f.status !== 'veraltet')) continue;
      fassungen.push({
        anleitung_id: a.id,
        sprache: f.sprache,
        titel: f.titel,
        titel_de: a.titel_de,
        ansprechperson: a.ansprechperson,
        titelbild_url: a.titelbild_url,
        schritte: schritte.map((s) => {
          const u = bestand.schritt_uebersetzungen.find((x) => x.schritt_id === s.id && x.sprache === f.sprache);
          return {
            id: s.id,
            position: s.position,
            bild_url: s.bild_url,
            achtung: s.achtung,
            version: s.version,
            text_de: s.text_de,
            hinweis_de: s.hinweis_de,
            text: u?.text ?? null,
            hinweis: u?.hinweis ?? null,
            status: u?.status ?? null,
            basiert_auf_version: u?.basiert_auf_version ?? null,
          };
        }),
      });
    }
  }
  return fassungen;
}

export function beispielInhalte(platzId: string, bestand: Datenbestand = BEISPIEL_BESTAND): Inhalte | null {
  const arbeitsplatz = bestand.arbeitsplaetze.find((p) => p.id === platzId);
  if (!arbeitsplatz) return null;
  return {
    sprachen: bestand.sprachen,
    arbeitsplatz,
    fassungen: fassungenBauen(bestand, platzId),
    ui_texte: UI_TEXTE,
  };
}
