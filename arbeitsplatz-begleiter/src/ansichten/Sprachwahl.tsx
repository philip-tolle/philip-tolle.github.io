import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { uebersetzerFuer } from '../logik/texte';
import type { Sprache, UiSprachdatei } from '../typen';
import { sprachausgabe } from '../vorlesen/sprachausgabe';
import { SymbolZurueck } from '../komponenten/Symbole';
import { Taste } from '../komponenten/Taste';

interface Props {
  sprachen: Sprache[];
  uiTexte: UiSprachdatei[];
  rate: number;
  aktuelle: Sprache | null;
  onWahl: (code: string) => void;
  /** Fehlt beim ersten Start: Dann muss erst eine Sprache gewählt werden. */
  onZurueck?: () => void;
}

/**
 * Sprachwahl ohne Flaggen. 1. Berührung: Gruß in der Sprache wird vorgelesen.
 * 2. Berührung auf dieselbe Sprache: bestätigt. So reichen 2 Berührungen.
 */
export function Sprachwahl({ sprachen, uiTexte, rate, aktuelle, onWahl, onZurueck }: Props) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  const tAktuell = uebersetzerFuer(aktuelle?.code ?? 'de', uiTexte);

  useEffect(() => {
    ueberschrift.current?.focus({ preventScroll: true });
  }, []);

  function tippen(sprache: Sprache) {
    if (gewaehlt === sprache.code) {
      sprachausgabe.stopp();
      onWahl(sprache.code);
      return;
    }
    setGewaehlt(sprache.code);
    const gruss = uebersetzerFuer(sprache.code, uiTexte)('sprache.gruss');
    sprachausgabe.sprich([{ id: 'gruss', text: gruss.text, sprache }], rate);
  }

  return (
    <div className="ansicht ansicht--sprachwahl">
      <header className="kopf">
        <div className="kopf-start">
          {onZurueck && <Taste symbol={<SymbolZurueck />} text={tAktuell('taste.zurueck')} onClick={onZurueck} />}
        </div>
        <div className="kopf-mitte">
          <h1 ref={ueberschrift} tabIndex={-1} className="kopf-titel sprachwahl-titel">
            <Globe size={40} strokeWidth={2.5} aria-hidden="true" />
            {sprachen.map((s, i) => (
              <span key={s.code}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <bdi lang={s.code} dir={s.richtung}>
                  {uebersetzerFuer(s.code, uiTexte)('sprache.taste').text}
                </bdi>
              </span>
            ))}
          </h1>
        </div>
        <div className="kopf-ende" />
      </header>
      <main className="sprachwahl">
        <ul className="sprachkacheln">
          {sprachen.map((s) => {
            const istGewaehlt = gewaehlt === s.code;
            const t = uebersetzerFuer(s.code, uiTexte);
            return (
              <li key={s.code}>
                <button
                  type="button"
                  className={`sprachkachel ${aktuelle?.code === s.code ? 'sprachkachel--aktuell' : ''}`}
                  aria-pressed={istGewaehlt}
                  onClick={() => tippen(s)}
                >
                  <span className="sprachkachel-name" lang={s.code} dir={s.richtung}>
                    {s.name_eigen}
                  </span>
                  {s.code !== 'de' && (
                    <span className="sprachkachel-de" lang="de">
                      {s.name_de}
                    </span>
                  )}
                  {istGewaehlt && (
                    <span className="sprachkachel-ok" lang={s.code} dir={s.richtung}>
                      <Check size={32} strokeWidth={3} aria-hidden="true" />
                      {t('sprache.nochmalTippen').text}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
