import { useUmgebung } from '../umgebung';
import type { AnzeigeAnleitung } from '../logik/inhalte';
import { leseteileFuerSchritt } from '../logik/schrittText';
import { sprachausgabe } from '../vorlesen/sprachausgabe';
import { Bild } from '../komponenten/Bild';
import { Kopfzeile } from '../komponenten/Kopfzeile';
import { Meldung } from '../komponenten/Meldung';
import { SymbolFertig, SymbolNochmal, SymbolUebersicht } from '../komponenten/Symbole';
import { Taste } from '../komponenten/Taste';
import { Tastenleiste } from '../komponenten/Tastenleiste';

export function FertigAnsicht({ anleitung }: { anleitung: AnzeigeAnleitung }) {
  const u = useUmgebung();
  const { t, einstellungen, platz, sprache } = u;
  const gesamt = anleitung.schritte.length;
  const titel = t('fertig.titel');
  const lob = t('fertig.lob', { anzahl: gesamt });

  function zuSchritt(position: number) {
    const schritt = anleitung.schritte[position - 1];
    if (einstellungen.autoVorlesen) {
      u.vorlesen(leseteileFuerSchritt(schritt, { mitlernen: einstellungen.mitlernen, fragNach: t('schritt.fragNach') }));
    } else sprachausgabe.stopp();
    u.gehe({ art: 'schritt', platzId: platz.id, anleitungId: anleitung.id, position });
  }

  function zurUebersicht() {
    sprachausgabe.stopp();
    u.gehe({ art: 'start', platzId: platz.id });
  }

  return (
    <div className="ansicht ansicht--fertig">
      <Kopfzeile
        titel={anleitung.titel}
        titelDe={einstellungen.mitlernen && anleitung.titel.lang !== 'de' ? anleitung.titel_de : undefined}
        zurueck={() => {
          sprachausgabe.stopp();
          u.gehe({ art: 'schritt', platzId: platz.id, anleitungId: anleitung.id, position: gesamt });
        }}
        vorlesen={() => u.vorlesen([{ id: 'fertig-titel', ...titel }, { id: 'fertig-lob', ...lob }])}
      />
      <main className="fertig">
        <div className="fertig-symbol" aria-hidden="true">
          <SymbolFertig groesse={72} />
        </div>
        <h2 className="fertig-titel" lang={titel.lang} dir={sprache.richtung}>
          {titel.text}
        </h2>
        <p className="fertig-lob" lang={lob.lang} dir={sprache.richtung}>
          {lob.text}
        </p>
        <Meldung />
        <h3 className="fertig-alle" lang={t('fertig.alleSchritte').lang}>
          {t('fertig.alleSchritte').text}
        </h3>
        <ol className="mini-schritte">
          {anleitung.schritte.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="mini-schritt"
                onClick={() => zuSchritt(s.position)}
                aria-label={`${t('schritt.nummer', { n: s.position }).text}: ${s.satz.text}`}
              >
                <Bild url={s.bild_url} nummer={s.position} klein />
                <span className="mini-nummer" aria-hidden="true">
                  {s.position}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </main>
      <Tastenleiste
        anleitungId={anleitung.id}
        erste={<Taste symbol={<SymbolNochmal />} text={t('fertig.vonVorne')} onClick={() => zuSchritt(1)} />}
        zweite={<Taste symbol={<SymbolUebersicht />} text={t('fertig.uebersicht')} onClick={zurUebersicht} />}
      />
    </div>
  );
}
