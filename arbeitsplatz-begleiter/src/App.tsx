import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { BEISPIEL_BESTAND } from './daten/beispielfassungen';
import { konfigurationLaden, platzLaden, type Konfiguration, type Ladeergebnis } from './daten/datenquelle';
import { QUELLSPRACHE, spracheFinden } from './daten/sprachen';
import { UI_TEXTE } from './daten/ui-texte';
import { einstellungenAuswerten } from './geraet/einstellungen';
import { adresse, routeLesen, type Route } from './logik/route';
import { uebersetzerFuer } from './logik/texte';
import { sprachausgabe } from './vorlesen/sprachausgabe';
import { Arbeitsplatz, type PlatzRoute } from './Arbeitsplatz';
import { NichtGefunden } from './ansichten/NichtGefunden';
import { Testuebersicht } from './ansichten/Testuebersicht';
import { SymbolNochmal } from './komponenten/Symbole';
import { Taste } from './komponenten/Taste';

// Der Anleiter-Bereich wird erst geladen, wenn ihn jemand öffnet. Tablets laden ihn nie.
const AnleiterBereich = lazy(() => import('./anleiter/AnleiterBereich'));

function useRoute() {
  const [route, setRoute] = useState<Route>(() => routeLesen(window.location.hash));
  const eigeneNavigation = useRef(false);
  useEffect(() => {
    const geaendert = () => {
      setRoute(routeLesen(window.location.hash));
      // Browser-Zurück: altes Vorlesen beenden. Eigene Tasten haben schon neu gestartet.
      if (!eigeneNavigation.current) sprachausgabe.stopp();
      eigeneNavigation.current = false;
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', geaendert);
    return () => window.removeEventListener('hashchange', geaendert);
  }, []);
  const gehe = useCallback((ziel: Route) => {
    const neu = adresse(ziel);
    if (window.location.hash === neu) return;
    eigeneNavigation.current = true;
    window.location.hash = neu;
  }, []);
  return [route, gehe] as const;
}

/** Texte für Fehlerseiten in der Sprache, die auf dem Gerät gewählt ist. */
function geraeteUebersetzer() {
  let sprache = QUELLSPRACHE;
  try {
    sprache = einstellungenAuswerten(localStorage.getItem('arbeitsplatz-begleiter:geraet')).sprache ?? QUELLSPRACHE;
  } catch {
    // ohne Speicher: Deutsch
  }
  return { t: uebersetzerFuer(sprache, UI_TEXTE), richtung: spracheFinden(sprache)?.richtung ?? 'ltr' };
}

export function App() {
  const [konfiguration, setKonfiguration] = useState<Konfiguration | null | undefined>(undefined);
  const [route, gehe] = useRoute();

  useEffect(() => {
    konfigurationLaden().then(setKonfiguration);
  }, []);

  // Rückkehr aus dem Anmelde-Link (…?code=…): weiter in den Anleiter-Bereich.
  useEffect(() => {
    if (route.art === 'uebersicht' && new URLSearchParams(window.location.search).has('code')) {
      gehe({ art: 'anleiter', teile: [] });
    }
  }, [route, gehe]);

  if (konfiguration === undefined) return null;

  switch (route.art) {
    case 'uebersicht':
      return konfiguration ? <Einstieg /> : <Testuebersicht arbeitsplaetze={BEISPIEL_BESTAND.arbeitsplaetze} />;
    case 'anleiter':
      if (!konfiguration) return <OhneDatenbank />;
      return (
        <Suspense fallback={<div className="laden" aria-busy="true" />}>
          <AnleiterBereich konfiguration={konfiguration} teile={route.teile} gehe={gehe} />
        </Suspense>
      );
    case 'unbekannt': {
      const { t } = geraeteUebersetzer();
      return <NichtGefunden text={t('fehler.nichtGefunden')} zurueckText={t('taste.zurueck')} ziel={adresse({ art: 'uebersicht' })} />;
    }
    default:
      return <PlatzLader key={route.platzId} route={route} gehe={gehe} />;
  }
}

/** Lädt die freigegebenen Inhalte des Arbeitsplatzes und zeigt dann das Tablet. */
function PlatzLader({ route, gehe }: { route: PlatzRoute; gehe: (r: Route) => void }) {
  const [ergebnis, setErgebnis] = useState<Ladeergebnis | null>(null);
  const geladenAm = useRef(0);
  const aufStartseite = useRef(route.art === 'start');
  aufStartseite.current = route.art === 'start';

  const laden = useCallback(() => {
    geladenAm.current = Date.now();
    platzLaden(route.platzId).then((neu) =>
      // Ein Fehler beim Nachladen ersetzt nie Inhalte, die schon da sind.
      setErgebnis((alt) => (neu.status === 'fehler' && alt?.status === 'da' ? alt : neu)),
    );
  }, [route.platzId]);

  useEffect(laden, [laden]);

  // Neue Freigaben kommen auf der Startseite an – nie mitten in einer Anleitung.
  useEffect(() => {
    if (route.art === 'start' && Date.now() - geladenAm.current > 60_000) laden();
  }, [route, laden]);
  useEffect(() => {
    const aufgewacht = () => {
      if (document.visibilityState === 'visible' && aufStartseite.current && Date.now() - geladenAm.current > 60_000) laden();
    };
    document.addEventListener('visibilitychange', aufgewacht);
    return () => document.removeEventListener('visibilitychange', aufgewacht);
  }, [laden]);

  if (!ergebnis) return <div className="laden" aria-busy="true" />;
  if (ergebnis.status !== 'da') {
    const { t, richtung } = geraeteUebersetzer();
    if (ergebnis.status === 'unbekannt') {
      return <NichtGefunden text={t('fehler.nichtGefunden')} zurueckText={t('taste.zurueck')} ziel={adresse({ art: 'uebersicht' })} />;
    }
    const meldung = t('fehler.laden');
    return (
      <main className="nicht-gefunden" dir={richtung}>
        <h1 lang={meldung.lang}>{meldung.text}</h1>
        <Taste symbol={<SymbolNochmal />} text={t('taste.nochmal')} onClick={laden} />
      </main>
    );
  }
  return (
    <Arbeitsplatz
      inhalte={ergebnis.inhalte}
      datenstand={{ quelle: ergebnis.quelle, stand: ergebnis.stand }}
      route={route}
      gehe={gehe}
    />
  );
}

/** Startseite mit Datenbank: Weg zum Anleiter-Bereich. Tablets öffnen direkt ihre Arbeitsplatz-Adresse. */
function Einstieg() {
  return (
    <main className="testuebersicht" lang="de" dir="ltr">
      <h1>Arbeitsplatz-Begleiter</h1>
      <p className="testuebersicht-unter">Anleitungen Schritt für Schritt, in Leichter Sprache und vielen Sprachen.</p>
      <ul className="testuebersicht-plaetze">
        <li>
          <a href={adresse({ art: 'anleiter', teile: [] })}>Zum Anleiter-Bereich</a>
          <span>Anmelden mit deiner E-Mail-Adresse</span>
        </li>
      </ul>
      <p>Tablets am Arbeitsplatz öffnen die Adresse ihres Arbeitsplatzes. Du findest sie im Anleiter-Bereich unter „Arbeitsplätze“.</p>
    </main>
  );
}

function OhneDatenbank() {
  return (
    <main className="testuebersicht" lang="de" dir="ltr">
      <h1>Anleiter-Bereich</h1>
      <p>
        Diese Testversion ist noch nicht mit einer Datenbank verbunden. Der Anleiter-Bereich braucht Supabase. Die
        Einrichtung steht in <code>arbeitsplatz-begleiter/supabase/EINRICHTUNG.md</code>.
      </p>
      <p>
        <a href={adresse({ art: 'uebersicht' })}>Zur Testübersicht</a>
      </p>
    </main>
  );
}
