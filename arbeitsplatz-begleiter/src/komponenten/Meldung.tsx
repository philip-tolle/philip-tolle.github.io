import { useUmgebung } from '../umgebung';

/** Feste Stelle für Hinweise. Bleibt stehen, bis man etwas anderes tut – kein Zeitlimit. */
export function Meldung() {
  const { meldung, sprache } = useUmgebung();
  return (
    <div className="meldung-stelle" role="status">
      {meldung && (
        <p className="meldung" lang={meldung.lang} dir={meldung.lang === sprache.code ? sprache.richtung : 'ltr'}>
          {meldung.text}
        </p>
      )}
    </div>
  );
}
