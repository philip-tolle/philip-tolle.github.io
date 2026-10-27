import { useEffect, useRef } from 'react';
import { useUmgebung } from '../umgebung';
import { ansprechpersonFuer, personName } from '../logik/inhalte';
import { zeilen } from '../logik/texte';
import { Kopfzeile } from '../komponenten/Kopfzeile';
import { Meldung } from '../komponenten/Meldung';
import { SymbolHilfe, SymbolZurueck } from '../komponenten/Symbole';
import { Taste } from '../komponenten/Taste';

interface Props {
  onZurueck: () => void;
  /** Nur Testversion: spielt nach, was die Anleiterin später im Anleiter-Bereich drückt. */
  test: { unterwegs: () => void; erledigt: () => void };
}

export function HilfeAnsicht({ onZurueck, test }: Props) {
  const u = useUmgebung();
  const { t, hilfe, platz, sprache, inhalte, einstellungen } = u;
  const ruf = hilfe.status === 'aus' ? null : hilfe.ruf;
  const ansprechperson = ansprechpersonFuer(inhalte, ruf?.anleitung_id ?? null);
  const person = personName(ansprechperson, sprache.code);
  const text = hilfe.status === 'unterwegs' ? t('hilfe.aufDemWeg', { person }) : t('hilfe.unterwegs', { person });
  const ersterStatus = useRef(hilfe.status);

  // Ändert sich der Status (Anleiterin drückt „Bin unterwegs“), wird der neue Text vorgelesen.
  useEffect(() => {
    if (hilfe.status === ersterStatus.current) return;
    ersterStatus.current = hilfe.status;
    if (hilfe.status !== 'aus' && einstellungen.autoVorlesen) u.vorlesen([{ id: 'hilfe', ...text }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hilfe.status]);

  const anleitung = ruf?.anleitung_id ? inhalte.fassungen.find((f) => f.anleitung_id === ruf.anleitung_id) : undefined;

  return (
    <div className="ansicht ansicht--hilfe">
      <Kopfzeile
        titel={{ ...t('taste.hilfe'), dir: sprache.richtung }}
        zurueck={onZurueck}
        vorlesen={() => u.vorlesen([{ id: 'hilfe', ...text }])}
      />
      <main className="hilfe">
        <div className="hilfe-symbol" aria-hidden="true">
          <SymbolHilfe groesse={88} />
        </div>
        <div className="hilfe-text" lang={text.lang} dir={sprache.richtung} aria-live="polite">
          {zeilen(text.text).map((z) => (
            <p key={z}>{z}</p>
          ))}
        </div>
        <Meldung />
        <Taste symbol={<SymbolZurueck />} text={t('hilfe.zurueck')} onClick={onZurueck} className="hilfe-zurueck" />

        {ruf && (
          <section className="testkasten" lang="de" dir="ltr" aria-label="Nur für den Test">
            <h2>Nur für den Test</h2>
            <p>
              Der Hilferuf wird noch nicht gesendet. Ab Phase 6 erscheint er im Anleiter-Bereich. Er enthält nur:
            </p>
            <ul>
              <li>Arbeitsplatz: {platz.name}</li>
              <li>Anleitung: {anleitung?.titel_de ?? '–'}</li>
              <li>Schritt: {ruf.schritt_position ?? '–'}</li>
              <li>Gerätesprache: {sprache.name_de}</li>
            </ul>
            <div className="testkasten-tasten">
              <button type="button" onClick={test.unterwegs} disabled={hilfe.status === 'unterwegs'}>
                {ansprechperson.name} drückt „Bin unterwegs“
              </button>
              <button type="button" onClick={test.erledigt}>
                {ansprechperson.name} drückt „Erledigt“
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
