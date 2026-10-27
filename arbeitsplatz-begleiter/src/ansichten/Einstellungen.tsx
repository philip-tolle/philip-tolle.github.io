import { useEffect, useRef, useState } from 'react';
import { useUmgebung } from '../umgebung';
import { TEST_PIN, type Farben, type Schrift, type Tempo } from '../geraet/einstellungen';
import { verfuegbareSprachen } from '../logik/inhalte';
import { useVorlesen } from '../vorlesen/useVorlesen';
import { Schalter } from '../komponenten/Schalter';
import { SymbolLoeschen, SymbolZurueck } from '../komponenten/Symbole';

// Geräte-Einstellungen für Anleiter:innen, hinter einer 4-stelligen PIN.
// Bewusst auf Deutsch: Mitarbeitende brauchen diesen Bereich nicht.

function Auswahl<T extends string>({
  name,
  wert,
  optionen,
  onWahl,
}: {
  name: string;
  wert: T;
  optionen: [T, string][];
  onWahl: (w: T) => void;
}) {
  return (
    <fieldset className="auswahl">
      <legend>{name}</legend>
      <div className="auswahl-tasten">
        {optionen.map(([w, beschriftung]) => (
          <button key={w} type="button" aria-pressed={wert === w} onClick={() => onWahl(w)}>
            {beschriftung}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Einstellungen({ onSchliessen }: { onSchliessen: () => void }) {
  const u = useUmgebung();
  const { einstellungen: e, aendern, inhalte, platz, sprache } = u;
  const vorlesen = useVorlesen();
  const [pin, setPin] = useState('');
  const [entsperrt, setEntsperrt] = useState(false);
  const [falsch, setFalsch] = useState(false);
  const ueberschrift = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ueberschrift.current?.focus({ preventScroll: true });
  }, [entsperrt]);

  function ziffer(z: string) {
    setFalsch(false);
    const neu = (pin + z).slice(0, 4);
    setPin(neu);
    if (neu.length === 4) {
      if (neu === TEST_PIN) setEntsperrt(true);
      else {
        setFalsch(true);
        setPin('');
      }
    }
  }

  const kopf = (
    <header className="kopf">
      <div className="kopf-start">
        <button type="button" className="taste taste--neutral" onClick={onSchliessen}>
          <span className="taste-symbol">
            <SymbolZurueck />
          </span>
          <span className="taste-wort">Zurück</span>
        </button>
      </div>
      <div className="kopf-mitte">
        <h1 ref={ueberschrift} tabIndex={-1} className="kopf-titel">
          Geräte-Einstellungen
        </h1>
        <p className="kopf-titel-de">Nur für Anleiter:innen</p>
      </div>
      <div className="kopf-ende" />
    </header>
  );

  if (!entsperrt) {
    return (
      <div className="ansicht ansicht--einstellungen" lang="de" dir="ltr">
        {kopf}
        <main className="pin">
          <p id="pin-frage">Bitte die 4-stellige PIN eingeben.</p>
          <div className="pin-punkte" aria-live="polite" aria-label={`${pin.length} von 4 Ziffern`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i < pin.length ? 'pin-punkt pin-punkt--voll' : 'pin-punkt'} />
            ))}
          </div>
          <p className="pin-fehler" role="status">
            {falsch ? 'Die PIN stimmt nicht. Bitte noch einmal.' : ''}
          </p>
          <div className="pin-feld" role="group" aria-labelledby="pin-frage">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((z) => (
              <button key={z} type="button" onClick={() => ziffer(z)}>
                {z}
              </button>
            ))}
            <span />
            <button type="button" onClick={() => ziffer('0')}>
              0
            </button>
            <button type="button" onClick={() => setPin(pin.slice(0, -1))} aria-label="Letzte Ziffer entfernen">
              <SymbolLoeschen />
            </button>
          </div>
        </main>
      </div>
    );
  }

  const sprachen = verfuegbareSprachen(inhalte);

  return (
    <div className="ansicht ansicht--einstellungen" lang="de" dir="ltr">
      {kopf}
      <main className="einstellungen">
        <p className="einstellungen-platz">
          Arbeitsplatz: <strong>{platz.name}</strong> · Sprache am Gerät: <strong>{sprache.name_de}</strong>
        </p>
        <Auswahl<Tempo>
          name="Vorlesetempo"
          wert={e.tempo}
          optionen={[['langsam', 'Langsam'], ['normal', 'Normal'], ['schnell', 'Schnell']]}
          onWahl={(tempo) => aendern({ tempo })}
        />
        <Auswahl<Schrift>
          name="Schriftgröße"
          wert={e.schrift}
          optionen={[['normal', 'Normal'], ['gross', 'Groß'], ['sehr-gross', 'Sehr groß']]}
          onWahl={(schrift) => aendern({ schrift })}
        />
        <Auswahl<Farben>
          name="Farben"
          wert={e.farben}
          optionen={[['automatisch', 'Wie das Gerät'], ['hell', 'Hell'], ['dunkel', 'Dunkel']]}
          onWahl={(farben) => aendern({ farben })}
        />
        <div className="einstellungen-schalter">
          <Schalter an={e.autoVorlesen} onWechsel={(autoVorlesen) => aendern({ autoVorlesen })}>
            „Weiter“ liest den neuen Schritt automatisch vor
          </Schalter>
          <Schalter an={e.kontrast} onWechsel={(kontrast) => aendern({ kontrast })}>
            Hoher Kontrast
          </Schalter>
          <Schalter an={e.mitlernen} onWechsel={(mitlernen) => aendern({ mitlernen })}>
            Deutsch mitlernen
          </Schalter>
        </div>
        <section className="einstellungen-stimmen">
          <h2>Vorlesen auf diesem Gerät</h2>
          <ul>
            {sprachen.map((s) => {
              const stimme = vorlesen.stimmeFuer(s);
              return (
                <li key={s.code}>
                  <span lang={s.code} dir={s.richtung}>
                    {s.name_eigen}
                  </span>{' '}
                  ({s.name_de}): {stimme ? `✓ ${stimme.name}` : '✗ keine Gerätestimme – Text bleibt lesbar'}
                </li>
              );
            })}
          </ul>
          <p className="einstellungen-hinweis">
            Fehlt eine Stimme, kann man sie oft in den Systemeinstellungen des Tablets nachladen (Sprache → Sprachausgabe).
            Vorlesen über einen Server kommt in Phase 7.
          </p>
        </section>
        <div className="einstellungen-unten">
          <button type="button" className="taste taste--neutral" onClick={() => aendern({ sprache: null })}>
            <span className="taste-wort">Sprachwahl beim nächsten Start zeigen</span>
          </button>
        </div>
        <p className="einstellungen-hinweis">
          Name des Arbeitsplatzes, eigene PIN und angebotene Sprachen werden ab Phase 2 im Anleiter-Bereich gepflegt.
        </p>
      </main>
    </div>
  );
}
