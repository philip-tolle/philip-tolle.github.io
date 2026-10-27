import { useRef, useState, type FormEvent } from 'react';
import { Meldungen, Rueckfrage, Seitenkopf, datum, kopieren, useAktion, useAnleiter, useDaten } from './gemeinsam';

type Rolle = 'anleiter' | 'sprachpate';

function SprachAuswahl({ id, gewaehlt, onWahl }: { id: string; gewaehlt: string[]; onWahl: (s: string[]) => void }) {
  const { sprachen } = useAnleiter();
  return (
    <fieldset className="al-auswahlgruppe" id={id}>
      <legend>Sprachen des Sprachpaten</legend>
      <div className="al-sprachgitter">
        {sprachen
          .filter((s) => s.code !== 'de' && s.aktiv)
          .map((s) => (
            <label key={s.code} className="al-check">
              <input
                type="checkbox"
                checked={gewaehlt.includes(s.code)}
                onChange={() => onWahl(gewaehlt.includes(s.code) ? gewaehlt.filter((c) => c !== s.code) : [...gewaehlt, s.code])}
              />
              {s.name_de}{' '}
              <span lang={s.code} dir={s.richtung} className="al-leise">
                {s.name_eigen}
              </span>
            </label>
          ))}
      </div>
    </fieldset>
  );
}

function RollenAuswahl({ name, rolle, onRolle }: { name: string; rolle: Rolle; onRolle: (r: Rolle) => void }) {
  return (
    <fieldset className="al-auswahlgruppe">
      <legend>Rolle</legend>
      <label className="al-check">
        <input type="radio" name={name} checked={rolle === 'anleiter'} onChange={() => onRolle('anleiter')} />
        Anleiter:in – darf alles
      </label>
      <label className="al-check">
        <input type="radio" name={name} checked={rolle === 'sprachpate'} onChange={() => onRolle('sprachpate')} />
        Sprachpate – prüft nur Übersetzungen in den eigenen Sprachen
      </label>
    </fieldset>
  );
}

export function Team() {
  const { api, sprachen } = useAnleiter();
  const { daten, fehler, neuLaden } = useDaten(() => api.team(), [api]);
  const [email, setEmail] = useState('');
  const [rolle, setRolle] = useState<Rolle>('sprachpate');
  const [auswahl, setAuswahl] = useState<string[]>([]);
  const [aendern, setAendern] = useState<{ user: string; rolle: Rolle; sprachen: string[] } | null>(null);
  const [entfernen, setEntfernen] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const aktion = useAktion();
  const adressfeld = useRef<HTMLInputElement>(null);
  const anmeldeAdresse = `${window.location.origin}${window.location.pathname}#/anleiter`;
  const name = (code: string) => sprachen.find((s) => s.code === code)?.name_de ?? code;
  const rollenText = (r: Rolle, s: string[]) => (r === 'anleiter' ? 'Anleiter:in' : `Sprachpate für ${s.map(name).join(', ')}`);

  async function einladen(e: FormEvent) {
    e.preventDefault();
    const ok = await aktion.ausfuehren(
      () => api.einladen(email, rolle, rolle === 'sprachpate' ? auswahl : []).then(() => true),
      `${email.trim()} ist eingeladen. Sag der Person Bescheid: Sie meldet sich unter der Adresse oben mit dieser E-Mail an.`,
    );
    if (ok) {
      setEmail('');
      setAuswahl([]);
      neuLaden();
    }
  }

  return (
    <section>
      <Seitenkopf titel="Team" />
      <p className="al-leise">
        Im Team sind nur Anleiter:innen und Sprachpaten. Mitarbeitende am Tablet brauchen kein Konto.
      </p>
      <div className="al-feld">
        <label htmlFor="anmeldeadresse">Adresse zum Anmelden</label>
        <div className="al-feld-mit-taste">
          <input id="anmeldeadresse" ref={adressfeld} readOnly value={anmeldeAdresse} onFocus={(e) => e.target.select()} />
          <button type="button" className="al-knopf al-knopf--klein" onClick={async () => setKopiert(await kopieren(anmeldeAdresse, adressfeld.current))}>
            {kopiert ? 'Kopiert' : 'Kopieren'}
          </button>
        </div>
      </div>
      <Meldungen fehler={fehler ?? aktion.fehler} erfolg={aktion.erfolg} />

      <h2>Mitglieder</h2>
      <ul className="al-liste">
        {daten?.mitglieder.map((m) => (
          <li key={m.user_id} className="al-karte">
            <h3>
              {m.email} {m.ich && <span className="al-marke-klein">du</span>}
            </h3>
            <p>{rollenText(m.rolle, m.sprachen)}</p>
            {aendern?.user === m.user_id ? (
              <div className="al-formular">
                <RollenAuswahl name={`rolle-${m.user_id}`} rolle={aendern.rolle} onRolle={(r) => setAendern({ ...aendern, rolle: r })} />
                {aendern.rolle === 'sprachpate' && (
                  <SprachAuswahl id={`sprachen-${m.user_id}`} gewaehlt={aendern.sprachen} onWahl={(s) => setAendern({ ...aendern, sprachen: s })} />
                )}
                <div className="al-knopfreihe">
                  <button
                    type="button"
                    className="al-knopf al-knopf--haupt"
                    onClick={async () => {
                      const ok = await aktion.ausfuehren(
                        () => api.mitgliedAendern(m.user_id, aendern.rolle, aendern.sprachen).then(() => true),
                        'Rolle geändert.',
                      );
                      if (ok) {
                        setAendern(null);
                        neuLaden();
                      }
                    }}
                  >
                    Speichern
                  </button>
                  <button type="button" className="al-knopf al-knopf--leise" onClick={() => setAendern(null)}>
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : entfernen === m.user_id ? (
              <Rueckfrage
                frage={`${m.email} aus dem Team entfernen? Die Person kann sich dann nicht mehr anmelden.`}
                ja="Entfernen"
                gefaehrlich
                onJa={async () => {
                  setEntfernen(null);
                  await aktion.ausfuehren(() => api.mitgliedEntfernen(m.user_id), `${m.email} ist nicht mehr im Team.`);
                  neuLaden();
                }}
                onNein={() => setEntfernen(null)}
              />
            ) : (
              <div className="al-knopfreihe">
                <button type="button" className="al-knopf" onClick={() => setAendern({ user: m.user_id, rolle: m.rolle, sprachen: m.sprachen })}>
                  Rolle ändern
                </button>
                <button type="button" className="al-knopf al-knopf--gefahr-leise" onClick={() => setEntfernen(m.user_id)}>
                  Entfernen
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {daten && daten.einladungen.length > 0 && (
        <>
          <h2>Offene Einladungen</h2>
          <ul className="al-liste">
            {daten.einladungen.map((e) => (
              <li key={e.email} className="al-karte">
                <h3>{e.email}</h3>
                <p>
                  {rollenText(e.rolle, e.sprachen)} · eingeladen am {datum(e.eingeladen_am)}
                </p>
                <button
                  type="button"
                  className="al-knopf al-knopf--gefahr-leise"
                  onClick={async () => {
                    await aktion.ausfuehren(() => api.einladungZuruecknehmen(e.email), 'Einladung zurückgenommen.');
                    neuLaden();
                  }}
                >
                  Einladung zurücknehmen
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Jemanden einladen</h2>
      <form className="al-formular al-karte" onSubmit={einladen}>
        <div className="al-feld">
          <label htmlFor="einladen-email">E-Mail-Adresse</label>
          <input id="einladen-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <RollenAuswahl name="einladen-rolle" rolle={rolle} onRolle={setRolle} />
        {rolle === 'sprachpate' && <SprachAuswahl id="einladen-sprachen" gewaehlt={auswahl} onWahl={setAuswahl} />}
        <button type="submit" className="al-knopf al-knopf--haupt" disabled={aktion.laeuft}>
          Einladen
        </button>
        <p className="al-leise">Es wird keine E-Mail verschickt. Die Person meldet sich selbst mit dieser Adresse an.</p>
      </form>
    </section>
  );
}
