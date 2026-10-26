import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { inhalteLaden } from './daten/datenquelle';
import { QUELLSPRACHE, spracheFinden } from './daten/sprachen';
import { NOCHMAL_FAKTOR, TEMPO_RATE, useGeraeteeinstellungen } from './geraet/einstellungen';
import { anleitungFuerAnzeige, verfuegbareSprachen } from './logik/inhalte';
import { adresse, routeLesen, type Route } from './logik/route';
import { uebersetzerFuer, type Text } from './logik/texte';
import type { Inhalte } from './typen';
import { UmgebungKontext, type HilfeZustand, type Umgebung, type Vorleseauftrag } from './umgebung';
import { sprachausgabe } from './vorlesen/sprachausgabe';
import { Einstellungen } from './ansichten/Einstellungen';
import { FertigAnsicht } from './ansichten/FertigAnsicht';
import { HilfeAnsicht } from './ansichten/HilfeAnsicht';
import { NichtGefunden } from './ansichten/NichtGefunden';
import { SchrittAnsicht } from './ansichten/SchrittAnsicht';
import { Sprachwahl } from './ansichten/Sprachwahl';
import { Startseite } from './ansichten/Startseite';
import { Testuebersicht } from './ansichten/Testuebersicht';

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

export function App() {
  const [inhalte, setInhalte] = useState<Inhalte | null>(null);
  const [route, gehe] = useRoute();

  useEffect(() => {
    inhalteLaden().then(setInhalte);
  }, []);

  if (!inhalte) return null;
  if (route.art === 'uebersicht') return <Testuebersicht inhalte={inhalte} />;
  const t = uebersetzerFuer(QUELLSPRACHE, inhalte.ui_texte);
  const platz = route.art !== 'unbekannt' ? inhalte.arbeitsplaetze.find((p) => p.id === route.platzId) : undefined;
  if (route.art === 'unbekannt' || !platz) {
    return <NichtGefunden text={t('fehler.nichtGefunden')} zurueckText={t('taste.zurueck')} ziel={adresse({ art: 'uebersicht' })} />;
  }
  return <Arbeitsplatz inhalte={inhalte} platzId={platz.id} route={route} gehe={gehe} />;
}

interface ArbeitsplatzProps {
  inhalte: Inhalte;
  platzId: string;
  route: Exclude<Route, { art: 'uebersicht' } | { art: 'unbekannt' }>;
  gehe: (r: Route) => void;
}

/** Das Tablet an einem Arbeitsplatz. */
function Arbeitsplatz({ inhalte, platzId, route, gehe }: ArbeitsplatzProps) {
  const [einstellungen, aendern] = useGeraeteeinstellungen();
  const [sprachwahlOffen, setSprachwahlOffen] = useState(false);
  const [einstellungenOffen, setEinstellungenOffen] = useState(false);
  const [hilfeAnsicht, setHilfeAnsicht] = useState(false);
  const [hilfe, setHilfe] = useState<HilfeZustand>({ status: 'aus' });
  const [meldung, setMeldung] = useState<Text | null>(null);

  const platz = inhalte.arbeitsplaetze.find((p) => p.id === platzId)!;
  const sprachen = useMemo(() => verfuegbareSprachen(inhalte, platzId), [inhalte, platzId]);
  const sprache = sprachen.find((s) => s.code === einstellungen.sprache) ?? null;
  const ersterStart = sprache === null;
  const anzeigeSprache = sprache ?? spracheFinden(QUELLSPRACHE, inhalte.sprachen)!;
  const t = useMemo(() => uebersetzerFuer(anzeigeSprache.code, inhalte.ui_texte), [anzeigeSprache.code, inhalte.ui_texte]);
  const rate = TEMPO_RATE[einstellungen.tempo];

  // Sprache, Schreibrichtung und Darstellung gelten für die ganze Seite.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = anzeigeSprache.code;
    html.dir = anzeigeSprache.richtung;
    html.dataset.schrift = einstellungen.schrift;
    html.dataset.kontrast = einstellungen.kontrast ? 'hoch' : 'normal';
    if (einstellungen.farben === 'automatisch') delete html.dataset.theme;
    else html.dataset.theme = einstellungen.farben === 'hell' ? 'light' : 'dark';
  }, [anzeigeSprache, einstellungen.schrift, einstellungen.kontrast, einstellungen.farben]);

  // Neue Ansicht: alte Hinweise weg.
  useEffect(() => setMeldung(null), [route, sprachwahlOffen, hilfeAnsicht]);

  const vorlesen = useCallback(
    (teile: Vorleseauftrag[], optionen?: { langsam?: boolean }) => {
      const auftraege = teile.map((teil) => ({
        id: teil.id,
        text: teil.text,
        sprache: spracheFinden(teil.lang, inhalte.sprachen) ?? anzeigeSprache,
      }));
      const ergebnis = sprachausgabe.sprich(auftraege, rate * (optionen?.langsam ? NOCHMAL_FAKTOR : 1));
      // Hinweis nur, wenn die gewählte Sprache selbst nicht vorgelesen werden kann.
      const eigeneFehlt = auftraege.some((a) => a.sprache.code === anzeigeSprache.code && !sprachausgabe.hatStimme(a.sprache));
      setMeldung(ergebnis.gesprochen === 0 || eigeneFehlt ? t('vorlesen.keineStimme') : null);
    },
    [inhalte.sprachen, anzeigeSprache, rate, t],
  );

  const hilfeRufen = useCallback(
    (ort: { anleitungId?: string; position?: number }) => {
      setHilfe((alt) =>
        alt.status !== 'aus'
          ? alt
          : {
              status: 'offen',
              ruf: {
                arbeitsplatz_id: platzId,
                anleitung_id: ort.anleitungId ?? null,
                schritt_position: ort.position ?? null,
                sprache: anzeigeSprache.code,
                erstellt_am: new Date().toISOString(),
              },
            },
      );
      setHilfeAnsicht(true);
    },
    [platzId, anzeigeSprache.code],
  );

  const umgebung: Umgebung = {
    inhalte,
    platz,
    sprache: anzeigeSprache,
    t,
    einstellungen,
    aendern,
    vorlesen,
    meldung,
    gehe,
    sprachwahlOeffnen: () => {
      sprachausgabe.stopp();
      setSprachwahlOffen(true);
    },
    hilfe,
    hilfeRufen,
    einstellungenOeffnen: () => {
      sprachausgabe.stopp();
      setEinstellungenOffen(true);
    },
  };

  // Hilfe-Text sofort vorlesen, wenn der Hilfe-Bildschirm aufgeht.
  const hilfeOffenVorher = useRef(false);
  useEffect(() => {
    if (hilfeAnsicht && !hilfeOffenVorher.current && einstellungen.autoVorlesen && hilfe.status !== 'aus') {
      const person = platz.ansprechperson.name_in[anzeigeSprache.code] ?? platz.ansprechperson.name;
      const text = hilfe.status === 'unterwegs' ? t('hilfe.aufDemWeg', { person }) : t('hilfe.unterwegs', { person });
      vorlesen([{ id: 'hilfe', ...text }]);
    }
    hilfeOffenVorher.current = hilfeAnsicht;
  }, [hilfeAnsicht, hilfe.status, einstellungen.autoVorlesen, platz, anzeigeSprache.code, t, vorlesen]);

  // Escape schließt Sprachwahl, Hilfe-Bildschirm und Einstellungen (Tastatur, Schalter).
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (einstellungenOffen) setEinstellungenOffen(false);
      else if (sprachwahlOffen && !ersterStart) setSprachwahlOffen(false);
      else if (hilfeAnsicht) setHilfeAnsicht(false);
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [einstellungenOffen, sprachwahlOffen, ersterStart, hilfeAnsicht]);

  let inhalt: React.ReactNode;
  if (ersterStart || sprachwahlOffen) {
    inhalt = (
      <Sprachwahl
        sprachen={sprachen}
        uiTexte={inhalte.ui_texte}
        rate={rate}
        aktuelle={sprache}
        onWahl={(code) => {
          aendern({ sprache: code, ...(code === QUELLSPRACHE ? { mitlernen: false } : {}) });
          setSprachwahlOffen(false);
        }}
        onZurueck={ersterStart ? undefined : () => setSprachwahlOffen(false)}
      />
    );
  } else if (einstellungenOffen) {
    inhalt = <Einstellungen onSchliessen={() => setEinstellungenOffen(false)} />;
  } else if (hilfeAnsicht) {
    inhalt = (
      <HilfeAnsicht
        onZurueck={() => {
          sprachausgabe.stopp();
          setHilfeAnsicht(false);
        }}
        test={{
          unterwegs: () => setHilfe((alt) => (alt.status === 'aus' ? alt : { ...alt, status: 'unterwegs' })),
          erledigt: () => {
            setHilfe({ status: 'aus' });
            setHilfeAnsicht(false);
          },
        }}
      />
    );
  } else if (route.art === 'start') {
    inhalt = <Startseite />;
  } else {
    const anleitung = anleitungFuerAnzeige(inhalte, route.anleitungId, anzeigeSprache.code);
    const passt =
      anleitung &&
      inhalte.anleitungen.find((a) => a.id === anleitung.id)?.arbeitsplaetze.includes(platzId) &&
      (route.art === 'fertig' || route.position <= anleitung.schritte.length);
    if (!anleitung || !passt) {
      inhalt = (
        <NichtGefunden
          text={t('fehler.nichtGefunden')}
          zurueckText={t('taste.zurueck')}
          ziel={adresse({ art: 'start', platzId })}
        />
      );
    } else if (route.art === 'fertig') {
      inhalt = <FertigAnsicht anleitung={anleitung} />;
    } else {
      inhalt = <SchrittAnsicht anleitung={anleitung} position={route.position} />;
    }
  }

  return <UmgebungKontext.Provider value={umgebung}>{inhalt}</UmgebungKontext.Provider>;
}
