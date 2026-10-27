import { useRef, useState } from 'react';
import type { PlatzZeile } from './api';
import { Meldungen, Rueckfrage, Seitenkopf, kopieren, useAktion, useAnleiter, useDaten } from './gemeinsam';
import { adresseAusName } from './status';

type Formular = Omit<PlatzZeile, 'anleitungen'>;

function tabletAdresse(id: string): string {
  return `${window.location.origin}${window.location.pathname}#/platz/${id}`;
}

function PlatzFormular({
  anfang,
  neu,
  onFertig,
  onAbbrechen,
}: {
  anfang: Formular;
  neu: boolean;
  onFertig: () => void;
  onAbbrechen: () => void;
}) {
  const { api, sprachen } = useAnleiter();
  const [f, setF] = useState(anfang);
  const [adresseVonHand, setAdresseVonHand] = useState(false);
  const aktion = useAktion();
  const aktive = sprachen.filter((s) => s.aktiv);
  const praefix = neu ? 'neu' : f.id;

  async function speichern() {
    if (!f.name.trim()) return aktion.setFehler('Bitte einen Namen eingeben.');
    if (!f.ansprechperson.trim()) return aktion.setFehler('Bitte eine Ansprechperson eingeben. Sie erscheint auf dem Tablet bei „Hilfe“.');
    if (!/^[a-z0-9][a-z0-9-]*$/.test(f.id)) return aktion.setFehler('Die Adresse darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.');
    if (!f.angebotene_sprachen.includes('de')) return aktion.setFehler('Deutsch muss angeboten werden.');
    const ok = await aktion.ausfuehren(() => api.arbeitsplatzSpeichern(f, neu).then(() => true));
    if (ok) onFertig();
  }

  return (
    <form className="al-formular al-karte" onSubmit={(e) => (e.preventDefault(), speichern())}>
      <div className="al-feld">
        <label htmlFor={`${praefix}-name`}>Name des Arbeitsplatzes</label>
        <input
          id={`${praefix}-name`}
          value={f.name}
          onChange={(e) =>
            setF({ ...f, name: e.target.value, ...(neu && !adresseVonHand ? { id: adresseAusName(e.target.value) } : {}) })
          }
        />
      </div>
      {neu && (
        <div className="al-feld">
          <label htmlFor={`${praefix}-adresse`}>Adresse für das Tablet (nur Kleinbuchstaben, Zahlen, Bindestrich)</label>
          <input
            id={`${praefix}-adresse`}
            value={f.id}
            onChange={(e) => {
              setAdresseVonHand(true);
              setF({ ...f, id: e.target.value });
            }}
          />
          <p className="al-leise">Wird zu: {tabletAdresse(f.id || '…')}</p>
        </div>
      )}
      <div className="al-feld">
        <label htmlFor={`${praefix}-person`}>Ansprechperson (kommt, wenn jemand „Hilfe“ drückt)</label>
        <input
          id={`${praefix}-person`}
          placeholder="z. B. Frau Weber"
          value={f.ansprechperson}
          onChange={(e) => setF({ ...f, ansprechperson: e.target.value })}
        />
      </div>
      <fieldset className="al-auswahlgruppe">
        <legend>Angebotene Sprachen</legend>
        <p className="al-leise">Auf dem Tablet erscheinen davon nur Sprachen, in denen eine Anleitung freigegeben ist.</p>
        <div className="al-knopfreihe">
          <button type="button" className="al-knopf al-knopf--klein" onClick={() => setF({ ...f, angebotene_sprachen: aktive.map((s) => s.code) })}>
            Alle
          </button>
          <button type="button" className="al-knopf al-knopf--klein" onClick={() => setF({ ...f, angebotene_sprachen: ['de'] })}>
            Nur Deutsch
          </button>
        </div>
        <div className="al-sprachgitter">
          {aktive.map((s) => (
            <label key={s.code} className="al-check">
              <input
                type="checkbox"
                checked={f.angebotene_sprachen.includes(s.code)}
                disabled={s.code === 'de'}
                onChange={() =>
                  setF({
                    ...f,
                    angebotene_sprachen: f.angebotene_sprachen.includes(s.code)
                      ? f.angebotene_sprachen.filter((c) => c !== s.code)
                      : [...f.angebotene_sprachen, s.code],
                  })
                }
              />
              {s.name_de}{' '}
              <span lang={s.code} dir={s.richtung} className="al-leise">
                {s.name_eigen}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Meldungen fehler={aktion.fehler} />
      <div className="al-knopfreihe">
        <button type="submit" className="al-knopf al-knopf--haupt" disabled={aktion.laeuft}>
          {neu ? 'Arbeitsplatz anlegen' : 'Speichern'}
        </button>
        <button type="button" className="al-knopf al-knopf--leise" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function Arbeitsplaetze() {
  const { api, sprachen } = useAnleiter();
  const { daten, fehler, neuLaden } = useDaten(() => api.arbeitsplaetze(), [api]);
  const [bearbeiten, setBearbeiten] = useState<string | null>(null);
  const [loeschen, setLoeschen] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const aktion = useAktion();
  const adressfelder = useRef(new Map<string, HTMLInputElement | null>());

  const fertig = () => {
    setBearbeiten(null);
    neuLaden();
  };

  return (
    <section>
      <Seitenkopf titel="Arbeitsplätze">
        {bearbeiten !== 'neu' && (
          <button type="button" className="al-knopf al-knopf--haupt" onClick={() => setBearbeiten('neu')}>
            + Neuer Arbeitsplatz
          </button>
        )}
      </Seitenkopf>
      <p className="al-leise">Jedes Tablet öffnet die Adresse seines Arbeitsplatzes. Mitarbeitende brauchen kein Konto.</p>
      <Meldungen fehler={fehler ?? aktion.fehler} erfolg={aktion.erfolg} />
      {bearbeiten === 'neu' && (
        <PlatzFormular
          neu
          anfang={{ id: '', name: '', ansprechperson: '', angebotene_sprachen: sprachen.filter((s) => s.aktiv).map((s) => s.code) }}
          onFertig={fertig}
          onAbbrechen={() => setBearbeiten(null)}
        />
      )}
      <ul className="al-liste">
        {daten?.map((p) =>
          bearbeiten === p.id ? (
            <li key={p.id}>
              <PlatzFormular anfang={p} neu={false} onFertig={fertig} onAbbrechen={() => setBearbeiten(null)} />
            </li>
          ) : (
            <li key={p.id} className="al-karte">
              <h2>{p.name}</h2>
              <p className="al-leise">
                Ansprechperson: {p.ansprechperson || '–'} · {p.anleitungen} {p.anleitungen === 1 ? 'Anleitung' : 'Anleitungen'} ·{' '}
                {p.angebotene_sprachen.length} Sprachen angeboten
              </p>
              <div className="al-feld">
                <label htmlFor={`adresse-${p.id}`}>Adresse für das Tablet</label>
                <div className="al-feld-mit-taste">
                  <input
                    id={`adresse-${p.id}`}
                    readOnly
                    value={tabletAdresse(p.id)}
                    ref={(el) => {
                      adressfelder.current.set(p.id, el);
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="al-knopf al-knopf--klein"
                    onClick={async () =>
                      setKopiert((await kopieren(tabletAdresse(p.id), adressfelder.current.get(p.id))) ? p.id : null)
                    }
                  >
                    {kopiert === p.id ? 'Kopiert' : 'Kopieren'}
                  </button>
                </div>
              </div>
              {loeschen === p.id ? (
                <Rueckfrage
                  frage={`„${p.name}“ löschen? Die Anleitungen bleiben erhalten. Tablets mit dieser Adresse zeigen dann nichts mehr.`}
                  ja="Arbeitsplatz löschen"
                  gefaehrlich
                  onJa={async () => {
                    setLoeschen(null);
                    await aktion.ausfuehren(() => api.arbeitsplatzLoeschen(p.id), `„${p.name}“ ist gelöscht.`);
                    neuLaden();
                  }}
                  onNein={() => setLoeschen(null)}
                />
              ) : (
                <div className="al-knopfreihe">
                  <a className="al-knopf" href={`#/platz/${p.id}`}>
                    Tablet-Ansicht öffnen
                  </a>
                  <button type="button" className="al-knopf" onClick={() => setBearbeiten(p.id)}>
                    Bearbeiten
                  </button>
                  <button type="button" className="al-knopf al-knopf--gefahr-leise" onClick={() => setLoeschen(p.id)}>
                    Löschen
                  </button>
                </div>
              )}
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
