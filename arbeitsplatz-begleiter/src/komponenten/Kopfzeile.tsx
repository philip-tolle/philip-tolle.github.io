import { useEffect, useRef } from 'react';
import { useUmgebung } from '../umgebung';
import type { AnzeigeText } from '../logik/inhalte';
import { SymbolSprache, SymbolVorlesen, SymbolZurueck } from './Symbole';
import { Taste } from './Taste';

interface Props {
  titel: AnzeigeText;
  /** Kleiner deutscher Titel darunter (beim Mitlernen). */
  titelDe?: string;
  zurueck?: () => void;
  vorlesen?: () => void;
  fortschritt?: { n: number; gesamt: number };
}

/** Kopfzeile: Zurück | Titel und Fortschritt | Vorlesen | Sprache. Bei RTL gespiegelt. */
export function Kopfzeile({ titel, titelDe, zurueck, vorlesen, fortschritt }: Props) {
  const { t, sprachwahlOeffnen } = useUmgebung();
  const ueberschrift = useRef<HTMLHeadingElement>(null);

  // Beim Wechsel der Ansicht landet der Fokus auf der Überschrift (Tastatur, Screenreader).
  useEffect(() => {
    ueberschrift.current?.focus({ preventScroll: true });
  }, []);

  const von = fortschritt && t('schritt.von', { n: fortschritt.n, gesamt: fortschritt.gesamt });

  return (
    <header className="kopf">
      <div className="kopf-start">
        {zurueck && <Taste symbol={<SymbolZurueck />} text={t('taste.zurueck')} onClick={zurueck} />}
      </div>
      <div className="kopf-mitte">
        <h1 ref={ueberschrift} tabIndex={-1} lang={titel.lang} dir={titel.dir} className="kopf-titel">
          {titel.text}
        </h1>
        {titelDe && (
          <p className="kopf-titel-de" lang="de" dir="ltr">
            {titelDe}
          </p>
        )}
        {fortschritt && von && (
          <div className="fortschritt">
            <p className="fortschritt-text" lang={von.lang}>
              {von.text}
            </p>
            <ol className="punkte" aria-hidden="true">
              {Array.from({ length: fortschritt.gesamt }, (_, i) => (
                <li
                  key={i}
                  className={i + 1 < fortschritt.n ? 'punkt punkt--fertig' : i + 1 === fortschritt.n ? 'punkt punkt--jetzt' : 'punkt'}
                />
              ))}
            </ol>
          </div>
        )}
      </div>
      <div className="kopf-ende">
        {vorlesen && <Taste symbol={<SymbolVorlesen />} text={t('taste.vorlesen')} onClick={vorlesen} />}
        <Taste symbol={<SymbolSprache />} text={t('sprache.taste')} onClick={sprachwahlOeffnen} className="taste--sprache" />
      </div>
    </header>
  );
}
