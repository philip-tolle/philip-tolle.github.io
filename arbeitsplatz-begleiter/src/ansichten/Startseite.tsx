import { useMemo } from 'react';
import { useUmgebung } from '../umgebung';
import { anleitungenFuerPlatz, personName } from '../logik/inhalte';
import { zeilen } from '../logik/texte';
import { Bild } from '../komponenten/Bild';
import { Kopfzeile } from '../komponenten/Kopfzeile';
import { Meldung } from '../komponenten/Meldung';
import { Schalter } from '../komponenten/Schalter';
import { SymbolEinstellungen } from '../komponenten/Symbole';
import { Tastenleiste } from '../komponenten/Tastenleiste';
import { leseteileFuerSchritt } from '../logik/schrittText';

export function Startseite() {
  const u = useUmgebung();
  const { inhalte, platz, sprache, t, einstellungen } = u;
  const anleitungen = useMemo(
    () => anleitungenFuerPlatz(inhalte, platz.id, sprache.code),
    [inhalte, platz.id, sprache.code],
  );
  const frage = t('start.frage');
  const vorstellung = t('start.vorstellung', { person: personName(platz.ansprechperson, sprache.code) });
  const mitlernenMoeglich = sprache.code !== 'de';

  function vorlesen() {
    u.vorlesen([
      { id: 'frage', ...frage },
      { id: 'vorstellung', ...vorstellung },
    ]);
  }

  function oeffnen(anleitungId: string) {
    const anleitung = anleitungen.find((a) => a.id === anleitungId)!;
    const erster = anleitung.schritte[0];
    if (erster && einstellungen.autoVorlesen) {
      u.vorlesen(leseteileFuerSchritt(erster, { mitlernen: einstellungen.mitlernen, fragNach: t('schritt.fragNach') }));
    }
    u.gehe({ art: 'schritt', platzId: platz.id, anleitungId, position: 1 });
  }

  return (
    <div className="ansicht ansicht--start">
      <Kopfzeile titel={{ ...frage, dir: sprache.richtung }} vorlesen={vorlesen} />
      <main className="start">
        <Meldung />
        {anleitungen.length === 0 ? (
          <p className="start-leer" lang={t('start.leer').lang}>
            {t('start.leer').text}
          </p>
        ) : (
          <ul className="kacheln">
            {anleitungen.map((a) => {
              const anzahl = t('start.schritte', { anzahl: a.schritte.length });
              return (
                <li key={a.id}>
                  <button type="button" className="kachel" onClick={() => oeffnen(a.id)}>
                    <Bild url={a.bild_url} nummer={1} />
                    <span className="kachel-titel" lang={a.titel.lang} dir={a.titel.dir}>
                      {a.titel.text}
                    </span>
                    {einstellungen.mitlernen && a.titel.lang !== 'de' && (
                      <span className="kachel-de" lang="de" dir="ltr">
                        {a.titel_de}
                      </span>
                    )}
                    <span className="kachel-info" lang={anzahl.lang}>
                      {anzahl.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <section className="vorstellung" lang={vorstellung.lang}>
          {zeilen(vorstellung.text).map((z) => (
            <p key={z}>{z}</p>
          ))}
        </section>
        {mitlernenMoeglich && (
          <div className="mitlernen">
            <Schalter an={einstellungen.mitlernen} onWechsel={(an) => u.aendern({ mitlernen: an })}>
              <span lang={t('start.mitlernen').lang}>{t('start.mitlernen').text}</span>
              <span className="schalter-de" lang="de">
                Deutsch mitlernen
              </span>
            </Schalter>
          </div>
        )}
      </main>
      <Tastenleiste />
      <footer className="fuss" lang="de" dir="ltr">
        <span>Arbeitsplatz: {platz.name}</span>
        <button type="button" className="fuss-taste" onClick={u.einstellungenOeffnen}>
          <SymbolEinstellungen groesse={22} /> Einstellungen
        </button>
        <span>Testversion · Bilder: eigene Test-Piktogramme</span>
      </footer>
    </div>
  );
}
