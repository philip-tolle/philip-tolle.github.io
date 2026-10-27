import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QUELLSPRACHE, spracheFinden } from './daten/sprachen';
import { NOCHMAL_FAKTOR, TEMPO_RATE, useGeraeteeinstellungen } from './geraet/einstellungen';
import { anleitungFuerAnzeige, ansprechpersonFuer, personName, verfuegbareSprachen } from './logik/inhalte';
import { adresse, type Route } from './logik/route';
import { uebersetzerFuer, type Text } from './logik/texte';
import type { Inhalte } from './typen';
import { UmgebungKontext, type Datenstand, type HilfeZustand, type Umgebung, type Vorleseauftrag } from './umgebung';
import { sprachausgabe } from './vorlesen/sprachausgabe';
import { Einstellungen } from './ansichten/Einstellungen';
import { FertigAnsicht } from './ansichten/FertigAnsicht';
import { HilfeAnsicht } from './ansichten/HilfeAnsicht';
import { NichtGefunden } from './ansichten/NichtGefunden';
import { SchrittAnsicht } from './ansichten/SchrittAnsicht';
import { Sprachwahl } from './ansichten/Sprachwahl';
import { Startseite } from './ansichten/Startseite';

export type PlatzRoute = Extract<Route, { art: 'start' | 'schritt' | 'fertig' }>;

interface ArbeitsplatzProps {
  inhalte: Inhalte;
  datenstand: Datenstand;
  route: PlatzRoute;
  gehe: (r: Route) => void;
  /** Vorschau im Anleiter-Bereich: immer diese Sprache, keine Sprachwahl beim Start. */
  festeSprache?: string;
}

/** Das Tablet an einem Arbeitsplatz. Kennt nur die freigegebenen Inhalte dieses Arbeitsplatzes. */
export function Arbeitsplatz({ inhalte, datenstand, route, gehe, festeSprache }: ArbeitsplatzProps) {
  const [einstellungen, aendern] = useGeraeteeinstellungen();
  const [sprachwahlOffen, setSprachwahlOffen] = useState(false);
  const [einstellungenOffen, setEinstellungenOffen] = useState(false);
  const [hilfeAnsicht, setHilfeAnsicht] = useState(false);
  const [hilfe, setHilfe] = useState<HilfeZustand>({ status: 'aus' });
  const [meldung, setMeldung] = useState<Text | null>(null);

  const platz = inhalte.arbeitsplatz;
  const platzId = platz.id;
  const sprachen = useMemo(() => verfuegbareSprachen(inhalte), [inhalte]);
  const sprache = sprachen.find((s) => s.code === (festeSprache ?? einstellungen.sprache)) ?? null;
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
    // Nur ein selbst gesetztes Farbschema wieder entfernen – ein vom Browser oder
    // einer umgebenden Seite gesetztes bleibt bei „Wie das Gerät“ erhalten.
    if (einstellungen.farben !== 'automatisch') {
      html.dataset.theme = einstellungen.farben === 'hell' ? 'light' : 'dark';
      html.dataset.themeVonApp = 'ja';
    } else if (html.dataset.themeVonApp) {
      delete html.dataset.theme;
      delete html.dataset.themeVonApp;
    }
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
    datenstand,
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
      const person = personName(
        ansprechpersonFuer(inhalte, hilfe.ruf.anleitung_id),
        anzeigeSprache.code,
      );
      const text = hilfe.status === 'unterwegs' ? t('hilfe.aufDemWeg', { person }) : t('hilfe.unterwegs', { person });
      vorlesen([{ id: 'hilfe', ...text }]);
    }
    hilfeOffenVorher.current = hilfeAnsicht;
  }, [hilfeAnsicht, hilfe, einstellungen.autoVorlesen, inhalte, anzeigeSprache.code, t, vorlesen]);

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

  let inhalt: ReactNode;
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
    const passt = anleitung && (route.art === 'fertig' || route.position <= anleitung.schritte.length);
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
