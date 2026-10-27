import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Bild } from '../komponenten/Bild';
import { satzHinweise } from '../logik/lesbarkeit';
import type { AnleitungEingabe, AnleitungVoll, PlatzZeile, SchrittEntwurf } from './api';
import { Meldungen, Rueckfrage, Seitenkopf, datum, useAktion, useAnleiter } from './gemeinsam';
import { statusZeilen } from './status';
import { Vorschau } from './Vorschau';

interface SchrittZustand extends SchrittEntwurf {
  /** Fester Schlüssel für React, auch für neue Schritte ohne id. */
  schluessel: string;
}

interface Entwurf {
  titel_de: string;
  originaltext: string;
  ansprechperson: string;
  zielsprachen: string[];
  arbeitsplaetze: string[];
  schritte: SchrittZustand[];
}

let zaehler = 0;
const neuerSchluessel = () => `neu-${++zaehler}`;
const leererSchritt = (): SchrittZustand => ({
  schluessel: neuerSchluessel(),
  text_de: '',
  hinweis_de: '',
  bildwort: '',
  bild_url: null,
  achtung: false,
});

function entwurfAus(a: AnleitungVoll | null): Entwurf {
  if (!a) {
    return { titel_de: '', originaltext: '', ansprechperson: '', zielsprachen: [], arbeitsplaetze: [], schritte: [leererSchritt()] };
  }
  return {
    titel_de: a.titel_de,
    originaltext: a.originaltext,
    ansprechperson: a.ansprechperson,
    zielsprachen: a.zielsprachen,
    arbeitsplaetze: a.arbeitsplaetze,
    schritte: a.schritte.map((s) => ({ ...s, schluessel: s.id ?? neuerSchluessel() })),
  };
}

function eingabeAus(e: Entwurf, id: string | null): AnleitungEingabe {
  return {
    ...(id ? { id } : {}),
    titel_de: e.titel_de,
    originaltext: e.originaltext,
    ansprechperson: e.ansprechperson,
    zielsprachen: e.zielsprachen,
    arbeitsplaetze: e.arbeitsplaetze,
    schritte: e.schritte.map((s) => ({
      ...(s.id ? { id: s.id } : {}),
      text_de: s.text_de,
      hinweis_de: s.hinweis_de,
      bildwort: s.bildwort,
      bild_url: s.bild_url,
      achtung: s.achtung,
    })),
  };
}

/** Eingabefeld mit Taste für den Mediopunkt (·), der auf Tastaturen schwer zu finden ist. */
function MediopunktFeld({
  id,
  beschriftung,
  wert,
  onWert,
  mehrzeilig,
}: {
  id: string;
  beschriftung: string;
  wert: string;
  onWert: (w: string) => void;
  mehrzeilig?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  function einfuegen() {
    const feld = ref.current;
    const start = feld?.selectionStart ?? wert.length;
    const ende = feld?.selectionEnd ?? wert.length;
    onWert(wert.slice(0, start) + '·' + wert.slice(ende));
    requestAnimationFrame(() => {
      feld?.focus();
      feld?.setSelectionRange(start + 1, start + 1);
    });
  }
  const aendern = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => onWert(e.target.value);
  return (
    <div className="al-feld">
      <label htmlFor={id}>{beschriftung}</label>
      <div className="al-feld-mit-taste">
        {mehrzeilig ? (
          <textarea ref={ref} id={id} rows={2} value={wert} onChange={aendern} />
        ) : (
          <input ref={ref} id={id} value={wert} onChange={aendern} />
        )}
        <button type="button" className="al-knopf al-knopf--klein al-knopf--punkt" onClick={einfuegen} aria-label={`Mediopunkt in „${beschriftung}“ einfügen`}>
          ·
        </button>
      </div>
    </div>
  );
}

export function AnleitungBearbeiten({ id: anfangsId }: { id: string | null }) {
  const { api, sprachen, gehe, setUngespeichert } = useAnleiter();
  const [id] = useState(anfangsId);
  const [geladen, setGeladen] = useState<AnleitungVoll | null>(null);
  const [entwurf, setEntwurf] = useState<Entwurf | null>(anfangsId ? null : entwurfAus(null));
  const [plaetze, setPlaetze] = useState<PlatzZeile[]>([]);
  const [ladefehler, setLadefehler] = useState<string | null>(null);
  const [vorschau, setVorschau] = useState(false);
  const [frage, setFrage] = useState<'verwerfen' | 'zurueckziehen' | 'loeschen' | null>(null);
  const aktion = useAktion();
  const knoepfe = useRef(new Map<string, HTMLButtonElement | null>());

  useEffect(() => {
    api.arbeitsplaetze().then(setPlaetze, (e: Error) => setLadefehler(e.message));
    if (anfangsId) {
      api.anleitung(anfangsId).then(
        (a) => {
          setGeladen(a);
          setEntwurf(entwurfAus(a));
        },
        (e: Error) => setLadefehler(e.message),
      );
    }
  }, [api, anfangsId]);

  const gespeichertJson = useMemo(() => JSON.stringify(eingabeAus(entwurfAus(geladen), id)), [geladen, id]);
  const ungespeichert = entwurf !== null && JSON.stringify(eingabeAus(entwurf, id)) !== gespeichertJson;

  useEffect(() => {
    setUngespeichert(ungespeichert);
  }, [ungespeichert, setUngespeichert]);
  useEffect(() => () => setUngespeichert(false), [setUngespeichert]);

  const fremdsprachen = sprachen.filter((s) => s.code !== 'de' && s.aktiv);
  const namen = useMemo(() => Object.fromEntries(sprachen.map((s) => [s.code, s.name_de])), [sprachen]);

  if (ladefehler) return <Meldungen fehler={ladefehler} />;
  if (!entwurf) return <div className="laden" aria-busy="true" />;

  if (vorschau) {
    return (
      <Vorschau
        titel={entwurf.titel_de}
        ansprechperson={entwurf.ansprechperson || plaetze.find((p) => entwurf.arbeitsplaetze.includes(p.id))?.ansprechperson || ''}
        schritte={entwurf.schritte}
        onZurueck={() => setVorschau(false)}
      />
    );
  }

  const aendern = (teil: Partial<Entwurf>) => setEntwurf({ ...entwurf, ...teil });
  const schrittAendern = (i: number, teil: Partial<SchrittZustand>) =>
    aendern({ schritte: entwurf.schritte.map((s, j) => (j === i ? { ...s, ...teil } : s)) });
  const umschalten = (liste: string[], wert: string) =>
    liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];

  function einfuegen(an: number) {
    const neu = leererSchritt();
    const schritte = [...entwurf!.schritte];
    schritte.splice(an, 0, neu);
    aendern({ schritte });
    requestAnimationFrame(() => document.getElementById(`satz-${neu.schluessel}`)?.focus());
  }

  function verschieben(i: number, richtung: -1 | 1) {
    const schritte = [...entwurf!.schritte];
    const [s] = schritte.splice(i, 1);
    schritte.splice(i + richtung, 0, s);
    aendern({ schritte });
    // Fokus bleibt auf einer Taste des verschobenen Schritts (Tastatur, Schalter).
    // Ganz oben ist „Hoch“ gesperrt, ganz unten „Runter“ – dann die andere Taste.
    const neu = i + richtung;
    const amRand = neu === 0 || neu === schritte.length - 1;
    const gleicheRichtung = richtung === -1 ? 'hoch' : 'runter';
    const ziel = amRand ? (neu === 0 ? 'runter' : 'hoch') : gleicheRichtung;
    requestAnimationFrame(() => knoepfe.current.get(`${s.schluessel}-${ziel}`)?.focus());
  }

  async function speichern() {
    const neueId = await aktion.ausfuehren(() => api.anleitungSpeichern(eingabeAus(entwurf!, id)));
    if (!neueId) return;
    if (!id) {
      gehe(['anleitungen', neueId], true);
      return;
    }
    const a = await aktion.ausfuehren(() => api.anleitung(neueId), 'Gespeichert.');
    if (a) {
      setGeladen(a);
      setEntwurf(entwurfAus(a));
    }
  }

  async function freigeben() {
    const a = await aktion.ausfuehren(
      () => api.anleitungFreigeben(id!),
      'Deutsch ist freigegeben. Die Tablets zeigen die neue Fassung, sobald sie ihre Startseite öffnen.',
    );
    if (a) {
      setGeladen(a);
      setEntwurf(entwurfAus(a));
    }
  }

  async function zurueckziehen() {
    setFrage(null);
    const a = await aktion.ausfuehren(() => api.anleitungZurueckziehen(id!), 'Die Anleitung ist nicht mehr auf den Tablets.');
    if (a) {
      setGeladen(a);
      setEntwurf(entwurfAus(a));
    }
  }

  async function loeschen() {
    setFrage(null);
    const ok = await aktion.ausfuehren(() => api.anleitungLoeschen(id!).then(() => true));
    if (ok) gehe(['anleitungen'], true);
  }

  const status = !id
    ? { art: 'offen', text: 'Neue Anleitung – noch nicht gespeichert.' }
    : geladen?.status_de === 'freigegeben'
      ? { art: 'ok', text: `Freigegeben am ${datum(geladen.freigegeben_am)} – so steht es auf den Tablets.` }
      : geladen?.auf_tablet
        ? { art: 'warnung', text: `Geändert – auf den Tablets ist noch die Fassung vom ${datum(geladen.freigegeben_am)}.` }
        : { art: 'offen', text: 'Entwurf – noch nicht auf den Tablets.' };

  return (
    <section className="al-bearbeiten">
      <Seitenkopf titel={id ? entwurf.titel_de || 'Anleitung bearbeiten' : 'Neue Anleitung'}>
        <button type="button" className="al-knopf al-knopf--leise" onClick={() => gehe(['anleitungen'])}>
          ← Alle Anleitungen
        </button>
      </Seitenkopf>
      <p className={`al-statusband al-status--${status.art}`}>{status.text}</p>

      <fieldset className="al-abschnitt">
        <legend>Angaben</legend>
        <div className="al-feld">
          <label htmlFor="titel">Titel (Deutsch, Leichte Sprache)</label>
          <input id="titel" value={entwurf.titel_de} onChange={(e) => aendern({ titel_de: e.target.value })} />
        </div>
        <div className="al-feld">
          <label htmlFor="originaltext">Anleitungstext (Original, Fachsprache erlaubt, auch in einer anderen Sprache)</label>
          <textarea
            id="originaltext"
            rows={4}
            value={entwurf.originaltext}
            onChange={(e) => aendern({ originaltext: e.target.value })}
          />
          <p className="al-leise">Ab Phase 3 macht die KI daraus einen Vorschlag in Leichter Sprache.</p>
        </div>
        <div className="al-feld">
          <label htmlFor="ansprechperson">Ansprechperson (leer = Ansprechperson des Arbeitsplatzes)</label>
          <input
            id="ansprechperson"
            value={entwurf.ansprechperson}
            placeholder="z. B. Frau Weber"
            onChange={(e) => aendern({ ansprechperson: e.target.value })}
          />
        </div>
        <fieldset className="al-auswahlgruppe">
          <legend>Arbeitsplätze</legend>
          {plaetze.length === 0 && <p className="al-leise">Noch keine Arbeitsplätze. Lege sie unter „Arbeitsplätze“ an.</p>}
          {plaetze.map((p) => (
            <label key={p.id} className="al-check">
              <input
                type="checkbox"
                checked={entwurf.arbeitsplaetze.includes(p.id)}
                onChange={() => aendern({ arbeitsplaetze: umschalten(entwurf.arbeitsplaetze, p.id) })}
              />
              {p.name}
            </label>
          ))}
        </fieldset>
        <fieldset className="al-auswahlgruppe">
          <legend>Zielsprachen</legend>
          <div className="al-sprachgitter">
            {fremdsprachen.map((s) => (
              <label key={s.code} className="al-check">
                <input
                  type="checkbox"
                  checked={entwurf.zielsprachen.includes(s.code)}
                  onChange={() => aendern({ zielsprachen: umschalten(entwurf.zielsprachen, s.code) })}
                />
                {s.name_de}{' '}
                <span lang={s.code} dir={s.richtung} className="al-leise">
                  {s.name_eigen}
                </span>
                {s.qualitaet === 'eingeschraenkt' && <span className="al-marke-klein">Sprachpate Pflicht</span>}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <section className="al-abschnitt" aria-labelledby="schritte-titel">
        <h2 id="schritte-titel">Schritte in Leichter Sprache</h2>
        <p className="al-leise">
          Ein Schritt = eine Handlung. Kurze Sätze (höchstens 10 Wörter), „du“, aktiv. Lange Wörter mit Mediopunkt trennen,
          z. B. Tisch·kante.
        </p>
        {entwurf.schritte.length > 12 && (
          <p className="al-meldung al-meldung--warnung">Mehr als 12 Schritte. Lieber in zwei Anleitungen teilen?</p>
        )}
        <ol className="al-schritte">
          {entwurf.schritte.map((s, i) => {
            const hinweise = [...satzHinweise(s.text_de), ...satzHinweise(s.hinweis_de)];
            const letzter = i === entwurf.schritte.length - 1;
            return (
              <li key={s.schluessel} className={`al-schritt ${s.achtung ? 'al-schritt--achtung' : ''}`}>
                <div className="al-schritt-kopf">
                  <h3>
                    Schritt {i + 1}
                    {s.achtung && <span className="al-achtung">⚠ Sicherheit</span>}
                  </h3>
                  <div className="al-knopfreihe">
                    <button
                      type="button"
                      className="al-knopf al-knopf--klein"
                      disabled={i === 0}
                      ref={(el) => {
                        knoepfe.current.set(`${s.schluessel}-hoch`, el);
                      }}
                      onClick={() => verschieben(i, -1)}
                      aria-label={`Hoch (Schritt ${i + 1})`}
                    >
                      <span aria-hidden="true">↑</span> Hoch
                    </button>
                    <button
                      type="button"
                      className="al-knopf al-knopf--klein"
                      disabled={letzter}
                      ref={(el) => {
                        knoepfe.current.set(`${s.schluessel}-runter`, el);
                      }}
                      onClick={() => verschieben(i, 1)}
                      aria-label={`Runter (Schritt ${i + 1})`}
                    >
                      <span aria-hidden="true">↓</span> Runter
                    </button>
                    <button
                      type="button"
                      className="al-knopf al-knopf--klein al-knopf--gefahr-leise"
                      onClick={() => aendern({ schritte: entwurf.schritte.filter((_, j) => j !== i) })}
                      aria-label={`Löschen (Schritt ${i + 1})`}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
                <div className="al-schritt-inhalt">
                  <div className="al-schritt-bild">
                    <Bild url={s.bild_url} nummer={i + 1} klein />
                  </div>
                  <div className="al-schritt-felder">
                    <MediopunktFeld
                      id={`satz-${s.schluessel}`}
                      beschriftung="Satz"
                      mehrzeilig
                      wert={s.text_de}
                      onWert={(text_de) => schrittAendern(i, { text_de })}
                    />
                    <MediopunktFeld
                      id={`hinweis-${s.schluessel}`}
                      beschriftung="Hinweis (kurz, darf leer sein)"
                      wert={s.hinweis_de}
                      onWert={(hinweis_de) => schrittAendern(i, { hinweis_de })}
                    />
                    {hinweise.length > 0 && (
                      <ul className="al-lesbar">
                        {hinweise.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    )}
                    <div className="al-reihe">
                      <div className="al-feld">
                        <label htmlFor={`bildwort-${s.schluessel}`}>Bildwort (für die Bildsuche)</label>
                        <input
                          id={`bildwort-${s.schluessel}`}
                          value={s.bildwort}
                          onChange={(e) => schrittAendern(i, { bildwort: e.target.value })}
                        />
                      </div>
                      <label className="al-check al-check--gross">
                        <input type="checkbox" checked={s.achtung} onChange={(e) => schrittAendern(i, { achtung: e.target.checked })} />
                        Sicherheit oder Hygiene („Achtung“)
                      </label>
                    </div>
                  </div>
                </div>
                <button type="button" className="al-knopf al-knopf--leise" onClick={() => einfuegen(i + 1)}>
                  + Schritt darunter einfügen
                </button>
              </li>
            );
          })}
        </ol>
        {entwurf.schritte.length === 0 && (
          <button type="button" className="al-knopf" onClick={() => einfuegen(0)}>
            + Schritt hinzufügen
          </button>
        )}
        <p className="al-leise">Bilder auswählen (Piktogramme oder eigenes Foto) kommt in Phase 3. Ohne Bild zeigt das Tablet die Schrittnummer.</p>
      </section>

      {id && geladen && (
        <section className="al-abschnitt" aria-labelledby="sprachen-titel">
          <h2 id="sprachen-titel">Sprachen</h2>
          <ul className="al-status">
            {statusZeilen(geladen, namen).map((z) => (
              <li key={z.sprache} className={`al-status-eintrag al-status--${z.art}`}>
                {z.text === '✓' ? `${z.sprache} ✓` : `${z.sprache}: ${z.text}`}
              </li>
            ))}
          </ul>
          <p className="al-leise">
            Übersetzen und Prüfen kommt in Phase 4. Ändert sich ein deutscher Schritt, werden seine Übersetzungen „veraltet“.
            Bis zur neuen Freigabe zeigen die Tablets die alte Fassung.
          </p>
          {frage === null && (
            <div className="al-knopfreihe">
              {geladen.auf_tablet && (
                <button type="button" className="al-knopf" onClick={() => setFrage('zurueckziehen')}>
                  Von den Tablets nehmen
                </button>
              )}
              <button type="button" className="al-knopf al-knopf--gefahr-leise" onClick={() => setFrage('loeschen')}>
                Anleitung löschen
              </button>
            </div>
          )}
          {frage === 'zurueckziehen' && (
            <Rueckfrage
              frage="Die Anleitung verschwindet von allen Tablets. Der Entwurf bleibt erhalten."
              ja="Von den Tablets nehmen"
              onJa={zurueckziehen}
              onNein={() => setFrage(null)}
            />
          )}
          {frage === 'loeschen' && (
            <Rueckfrage
              frage="Anleitung mit allen Schritten und Übersetzungen löschen? Das lässt sich nicht rückgängig machen."
              ja="Endgültig löschen"
              gefaehrlich
              onJa={loeschen}
              onNein={() => setFrage(null)}
            />
          )}
        </section>
      )}

      <div className="al-aktionsleiste">
        <Meldungen fehler={aktion.fehler} erfolg={aktion.erfolg} />
        {frage === 'verwerfen' && (
          <Rueckfrage
            frage="Alle Änderungen seit dem letzten Speichern verwerfen?"
            ja="Verwerfen"
            gefaehrlich
            onJa={() => {
              setFrage(null);
              setEntwurf(entwurfAus(geladen));
            }}
            onNein={() => setFrage(null)}
          />
        )}
        <div className="al-knopfreihe">
          <span className="al-speicherstand" role="status">
            {ungespeichert ? 'Ungespeicherte Änderungen' : id ? 'Alles gespeichert' : ''}
          </span>
          <button type="button" className="al-knopf al-knopf--haupt" onClick={speichern} disabled={aktion.laeuft || !ungespeichert}>
            Speichern
          </button>
          <button type="button" className="al-knopf" onClick={() => setVorschau(true)}>
            Vorschau
          </button>
          {id && (
            <button
              type="button"
              className="al-knopf"
              onClick={freigeben}
              disabled={aktion.laeuft || ungespeichert || geladen?.status_de === 'freigegeben'}
              aria-describedby="freigabe-hinweis"
            >
              Deutsch freigeben
            </button>
          )}
          {ungespeichert && id && (
            <button type="button" className="al-knopf al-knopf--leise" onClick={() => setFrage('verwerfen')}>
              Änderungen verwerfen
            </button>
          )}
        </div>
        {id && (
          <p id="freigabe-hinweis" className="al-leise">
            {ungespeichert
              ? 'Zum Freigeben erst speichern.'
              : geladen?.status_de === 'freigegeben'
                ? 'Diese Fassung ist schon freigegeben.'
                : 'Die freigegebene deutsche Fassung ist die Grundlage für alle Sprachen.'}
          </p>
        )}
      </div>
    </section>
  );
}
