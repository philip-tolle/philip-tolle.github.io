import { useMemo } from 'react';
import { Meldungen, Seitenkopf, datum, useAnleiter, useDaten } from './gemeinsam';
import { statusZeilen } from './status';

export function AnleitungenListe() {
  const { api, sprachen, gehe } = useAnleiter();
  const { daten, fehler } = useDaten(() => api.anleitungen(), [api]);
  const namen = useMemo(() => Object.fromEntries(sprachen.map((s) => [s.code, s.name_de])), [sprachen]);

  return (
    <section>
      <Seitenkopf titel="Anleitungen">
        <button type="button" className="al-knopf al-knopf--haupt" onClick={() => gehe(['anleitungen', 'neu'])}>
          + Neue Anleitung
        </button>
      </Seitenkopf>
      <Meldungen fehler={fehler} />
      {daten && daten.length === 0 && (
        <p className="al-leer">Noch keine Anleitung. Lege mit „Neue Anleitung“ die erste an.</p>
      )}
      <ul className="al-liste">
        {daten?.map((a) => (
          <li key={a.id} className="al-karte">
            <h2>
              <a
                href={`#/anleiter/anleitungen/${a.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  gehe(['anleitungen', a.id]);
                }}
              >
                {a.titel_de || 'Ohne Titel'}
              </a>
            </h2>
            <p className="al-leise">
              {a.anzahl_schritte} {a.anzahl_schritte === 1 ? 'Schritt' : 'Schritte'} ·{' '}
              {a.arbeitsplaetze.length ? a.arbeitsplaetze.map((p) => p.name).join(', ') : 'keinem Arbeitsplatz zugeordnet'}
              {a.freigegeben_am && ` · freigegeben am ${datum(a.freigegeben_am)}`}
            </p>
            <ul className="al-status" aria-label="Stand je Sprache">
              {statusZeilen(a, namen).map((z) => (
                <li key={z.sprache} className={`al-status-eintrag al-status--${z.art}`}>
                  {z.text === '✓' ? (
                    <>
                      {z.sprache} <span aria-label="freigegeben">✓</span>
                    </>
                  ) : (
                    `${z.sprache}: ${z.text}`
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
