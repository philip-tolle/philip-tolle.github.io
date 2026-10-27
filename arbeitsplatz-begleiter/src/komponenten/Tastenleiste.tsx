import type { ReactNode } from 'react';
import { useUmgebung } from '../umgebung';
import { ansprechpersonFuer, personName } from '../logik/inhalte';
import { zeilen } from '../logik/texte';
import { SymbolHilfe } from './Symbole';
import { Taste } from './Taste';

interface Props {
  /** Erste Stelle (z. B. „Nochmal“). Leer lassen, dann bleibt der Platz frei. */
  erste?: ReactNode;
  /** Zweite Stelle (z. B. „Weiter“). */
  zweite?: ReactNode;
  anleitungId?: string;
  position?: number;
}

/**
 * Untere Tastenleiste. Feste Reihenfolge: erste | zweite | Hilfe.
 * „Hilfe“ steht immer an derselben Stelle und hat immer dieselbe Farbe.
 */
export function Tastenleiste({ erste, zweite, anleitungId, position }: Props) {
  const { t, hilfe, hilfeRufen, inhalte, sprache } = useUmgebung();
  const person = personName(
    ansprechpersonFuer(inhalte, hilfe.status === 'aus' ? (anleitungId ?? null) : hilfe.ruf.anleitung_id),
    sprache.code,
  );
  const status =
    hilfe.status === 'unterwegs'
      ? t('hilfe.aufDemWeg', { person })
      : { ...t('hilfe.unterwegs', { person }), text: zeilen(t('hilfe.unterwegs', { person }).text)[0] };
  return (
    <div className="tastenleiste-bereich">
      {hilfe.status !== 'aus' && (
        <button type="button" className="hilfe-status" onClick={() => hilfeRufen({ anleitungId, position })}>
          <SymbolHilfe groesse={28} />
          <span lang={status.lang}>{status.text}</span>
        </button>
      )}
      <div className="tastenleiste">
        <div className="tastenplatz">{erste}</div>
        <div className="tastenplatz">{zweite}</div>
        <div className="tastenplatz">
          <Taste
            art="hilfe"
            symbol={<SymbolHilfe />}
            text={t('taste.hilfe')}
            onClick={() => hilfeRufen({ anleitungId, position })}
          />
        </div>
      </div>
    </div>
  );
}
