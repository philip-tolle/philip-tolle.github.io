import { useMemo, useState } from 'react';
import { Arbeitsplatz, type PlatzRoute } from '../Arbeitsplatz';
import { SPRACHEN } from '../daten/sprachen';
import { UI_TEXTE } from '../daten/ui-texte';
import type { Route } from '../logik/route';
import type { Inhalte } from '../typen';
import type { SchrittEntwurf } from './api';

interface Props {
  titel: string;
  ansprechperson: string;
  schritte: SchrittEntwurf[];
  onZurueck: () => void;
}

/** Zeigt den aktuellen Entwurf genau so, wie ihn das Tablet zeigen würde – auch ungespeichert. */
export function Vorschau({ titel, ansprechperson, schritte, onZurueck }: Props) {
  const [route, setRoute] = useState<PlatzRoute>({ art: 'schritt', platzId: 'vorschau', anleitungId: 'vorschau', position: 1 });
  const inhalte = useMemo<Inhalte>(() => {
    const person = { name: ansprechperson.trim() || 'Ansprechperson', name_in: {} };
    return {
      sprachen: SPRACHEN,
      arbeitsplatz: { id: 'vorschau', name: 'Vorschau', angebotene_sprachen: ['de'], ansprechperson: person },
      fassungen: [
        {
          anleitung_id: 'vorschau',
          sprache: 'de',
          titel: titel || 'Ohne Titel',
          titel_de: titel || 'Ohne Titel',
          ansprechperson: person,
          titelbild_url: null,
          schritte: schritte.map((s, i) => ({
            id: s.id ?? `neu-${i}`,
            position: i + 1,
            bild_url: s.bild_url,
            achtung: s.achtung,
            version: 1,
            text_de: s.text_de,
            hinweis_de: s.hinweis_de,
            text: s.text_de,
            hinweis: s.hinweis_de,
            status: 'freigegeben' as const,
            basiert_auf_version: 1,
          })),
        },
      ],
      ui_texte: UI_TEXTE,
    };
  }, [titel, ansprechperson, schritte]);

  const gehe = (r: Route) => {
    if (r.art === 'start' || r.art === 'schritt' || r.art === 'fertig') setRoute(r);
  };

  return (
    <div className="al-vorschau">
      <div className="al-vorschau-leiste" lang="de" dir="ltr">
        <strong>Vorschau</strong>
        <span>So sieht der Entwurf auf dem Tablet aus (Deutsch).</span>
        <button type="button" className="al-knopf al-knopf--haupt" onClick={onZurueck}>
          Zurück zur Bearbeitung
        </button>
      </div>
      {schritte.length === 0 ? (
        <p className="al-leer">Noch keine Schritte.</p>
      ) : (
        <Arbeitsplatz inhalte={inhalte} datenstand={{ quelle: 'beispiel' }} route={route} gehe={gehe} festeSprache="de" />
      )}
    </div>
  );
}
