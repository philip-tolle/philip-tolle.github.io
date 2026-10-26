import { useEffect, useState } from 'react';
import { useUmgebung } from '../umgebung';
import type { AnzeigeAnleitung } from '../logik/inhalte';
import { leseteileFuerSchritt, zeigeDeutsch } from '../logik/schrittText';
import { sprachausgabe } from '../vorlesen/sprachausgabe';
import { useVorlesen } from '../vorlesen/useVorlesen';
import { Bild } from '../komponenten/Bild';
import { Kopfzeile } from '../komponenten/Kopfzeile';
import { Meldung } from '../komponenten/Meldung';
import { SymbolAchtung, SymbolFertig, SymbolNochmal, SymbolWeiter } from '../komponenten/Symbole';
import { Taste } from '../komponenten/Taste';
import { Tastenleiste } from '../komponenten/Tastenleiste';

interface Props {
  anleitung: AnzeigeAnleitung;
  position: number;
}

/** Immer nur EIN Schritt. Kein Zeitlimit, kein automatisches Weiterschalten, kein Zähler. */
export function SchrittAnsicht({ anleitung, position }: Props) {
  const u = useUmgebung();
  const { t, einstellungen, platz } = u;
  const vorlesen = useVorlesen();
  const [hervorgehoben, setHervorgehoben] = useState(false);
  const schritt = anleitung.schritte[position - 1];
  const gesamt = anleitung.schritte.length;
  const istLetzter = position === gesamt;
  const fragNach = t('schritt.fragNach');
  const mitDeutsch = zeigeDeutsch(schritt, einstellungen.mitlernen);

  // „Nochmal“-Hervorhebung gilt nur für diesen Schritt.
  useEffect(() => setHervorgehoben(false), [position]);

  const gelesen = (id: string) => (vorlesen.aktiverTeil === id ? ' wird-gelesen' : '');

  function vorlesenAlles() {
    setHervorgehoben(false);
    u.vorlesen(leseteileFuerSchritt(schritt, { mitlernen: einstellungen.mitlernen, fragNach }));
  }

  function nochmal() {
    setHervorgehoben(true);
    u.vorlesen(leseteileFuerSchritt(schritt, { mitlernen: einstellungen.mitlernen, nurSatz: true, fragNach }), {
      langsam: true,
    });
  }

  function weiter() {
    if (istLetzter) {
      if (einstellungen.autoVorlesen) {
        u.vorlesen([
          { id: 'fertig-titel', ...t('fertig.titel') },
          { id: 'fertig-lob', ...t('fertig.lob', { anzahl: gesamt }) },
        ]);
      } else sprachausgabe.stopp();
      u.gehe({ art: 'fertig', platzId: platz.id, anleitungId: anleitung.id });
      return;
    }
    const naechster = anleitung.schritte[position];
    if (einstellungen.autoVorlesen) {
      u.vorlesen(leseteileFuerSchritt(naechster, { mitlernen: einstellungen.mitlernen, fragNach }));
    } else sprachausgabe.stopp();
    u.gehe({ art: 'schritt', platzId: platz.id, anleitungId: anleitung.id, position: position + 1 });
  }

  function zurueck() {
    sprachausgabe.stopp();
    if (position === 1) u.gehe({ art: 'start', platzId: platz.id });
    else u.gehe({ art: 'schritt', platzId: platz.id, anleitungId: anleitung.id, position: position - 1 });
  }

  const ansage = t('schritt.von', { n: position, gesamt });

  return (
    <div className="ansicht ansicht--schritt">
      <Kopfzeile
        titel={anleitung.titel}
        titelDe={einstellungen.mitlernen && anleitung.titel.lang !== 'de' ? anleitung.titel_de : undefined}
        zurueck={zurueck}
        vorlesen={vorlesenAlles}
        fortschritt={{ n: position, gesamt }}
      />
      <main className="schritt" key={schritt.id}>
        <figure className="schritt-bild">
          <Bild url={schritt.bild_url} nummer={position} />
        </figure>
        <div className="schritt-text">
          {schritt.achtung && (
            <p className="achtung-marke" lang={t('schritt.achtung').lang}>
              <SymbolAchtung groesse={32} />
              {t('schritt.achtung').text}
            </p>
          )}
          <p
            className={`satz${gelesen('satz')}${hervorgehoben ? ' hervorgehoben' : ''}`}
            lang={schritt.satz.lang}
            dir={schritt.satz.dir}
          >
            {schritt.satz.text}
          </p>
          {mitDeutsch && (
            // Absatz in Leserichtung der Seite, deutscher Satz als eigener Links-nach-rechts-Teil.
            <p className={`satz-de${gelesen('satz-de')}`} dir={u.sprache.richtung}>
              {schritt.sicherheitUngeprueft && (
                <span className="satz-de-marke" lang={t('schritt.aufDeutsch').lang}>
                  {t('schritt.aufDeutsch').text}{' '}
                </span>
              )}
              <bdi lang="de" dir="ltr">
                {schritt.satz_de}
              </bdi>
            </p>
          )}
          {schritt.hinweis.text && (
            <p className={`hinweis${gelesen('hinweis')}`} lang={schritt.hinweis.lang} dir={schritt.hinweis.dir}>
              {schritt.hinweis.text}
            </p>
          )}
          {schritt.sicherheitUngeprueft && (
            <p className={`frag-nach${gelesen('frag-nach')}`} lang={fragNach.lang}>
              <SymbolAchtung groesse={32} />
              <span>{fragNach.text}</span>
            </p>
          )}
          <Meldung />
        </div>
      </main>
      <p className="nur-sr" aria-live="polite" lang={schritt.satz.lang}>
        {ansage.text}. {schritt.satz.text}
      </p>
      <Tastenleiste
        anleitungId={anleitung.id}
        position={position}
        erste={<Taste symbol={<SymbolNochmal />} text={t('taste.nochmal')} onClick={nochmal} />}
        zweite={
          istLetzter ? (
            <Taste art="fertig" symbol={<SymbolFertig />} text={t('taste.fertig')} onClick={weiter} />
          ) : (
            <Taste art="weiter" symbol={<SymbolWeiter />} text={t('taste.weiter')} onClick={weiter} />
          )
        }
      />
    </div>
  );
}
