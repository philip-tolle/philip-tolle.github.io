import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabaseKlient, type Konfiguration } from '../daten/datenquelle';
import type { Route } from '../logik/route';
import { apiFuer, type Profil, type SpracheZeile } from './api';
import { Anmeldung } from './Anmeldung';
import { AnleiterKontext, Rueckfrage, type AnleiterUmgebung } from './gemeinsam';
import { AnleitungBearbeiten } from './AnleitungBearbeiten';
import { AnleitungenListe } from './AnleitungenListe';
import { Arbeitsplaetze } from './Arbeitsplaetze';
import { Datenschutz } from './Datenschutz';
import { Team } from './Team';
import './anleiter.css';

interface Props {
  konfiguration: Konfiguration;
  teile: string[];
  gehe: (r: Route) => void;
}

type Zustand =
  | { art: 'laden' }
  | { art: 'abgemeldet' }
  | { art: 'angemeldet'; session: Session; profil: Profil | null; sprachen: SpracheZeile[] }
  | { art: 'fehler'; text: string };

const NAVIGATION: [string, string][] = [
  ['anleitungen', 'Anleitungen'],
  ['arbeitsplaetze', 'Arbeitsplätze'],
  ['team', 'Team'],
  ['daten', 'Datenschutz'],
];

export default function AnleiterBereich({ konfiguration, teile, gehe }: Props) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [zustand, setZustand] = useState<Zustand>({ art: 'laden' });
  const [ungespeichert, setUngespeichert] = useState(false);
  const [wechselZiel, setWechselZiel] = useState<string[] | null>(null);
  const api = useMemo(() => (supabase ? apiFuer(supabase) : null), [supabase]);

  // Der Anleiter-Bereich ist immer Deutsch und links nach rechts – egal, was das Tablet eingestellt hatte.
  useEffect(() => {
    const html = document.documentElement;
    html.lang = 'de';
    html.dir = 'ltr';
    delete html.dataset.schrift;
    delete html.dataset.kontrast;
  }, []);

  useEffect(() => {
    supabaseKlient(konfiguration).then(setSupabase);
  }, [konfiguration]);

  const sitzungPruefen = useCallback(
    async (session: Session | null) => {
      if (!supabase) return;
      if (!session) {
        setZustand({ art: 'abgemeldet' });
        return;
      }
      try {
        const a = apiFuer(supabase);
        const profil = await a.meinProfil();
        const sprachen = profil ? await a.sprachen() : [];
        setZustand({ art: 'angemeldet', session, profil, sprachen });
      } catch (e) {
        setZustand({ art: 'fehler', text: (e as Error).message });
      }
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => sitzungPruefen(data.session));
    const { data } = supabase.auth.onAuthStateChange((ereignis, session) => {
      // Nicht direkt im Rückruf weiterarbeiten: supabase-js sperrt währenddessen die Anmeldung.
      if (ereignis === 'SIGNED_IN' || ereignis === 'SIGNED_OUT') setTimeout(() => sitzungPruefen(session), 0);
    });
    // Code aus dem Anmelde-Link aus der Adresse entfernen.
    if (window.location.search.includes('code=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    return () => data.subscription.unsubscribe();
  }, [supabase, sitzungPruefen]);

  // Ungespeicherte Änderungen: beim Schließen des Fensters nachfragen.
  useEffect(() => {
    if (!ungespeichert) return;
    const warnen = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warnen);
    return () => window.removeEventListener('beforeunload', warnen);
  }, [ungespeichert]);

  const wechseln = useCallback(
    (ziel: string[], erzwingen = false) => {
      if (erzwingen) setUngespeichert(false);
      if (ungespeichert && !erzwingen) setWechselZiel(ziel);
      else gehe({ art: 'anleiter', teile: ziel });
    },
    [ungespeichert, gehe],
  );

  if (!supabase || zustand.art === 'laden') return <div className="laden" aria-busy="true" />;
  if (zustand.art === 'abgemeldet') return <Anmeldung supabase={supabase} />;
  if (zustand.art === 'fehler') {
    return (
      <main className="al-anmeldung">
        <h1>Anleiter-Bereich</h1>
        <p className="al-meldung al-meldung--fehler" role="alert">
          {zustand.text}
        </p>
        <button type="button" className="al-knopf" onClick={() => supabase.auth.getSession().then(({ data }) => sitzungPruefen(data.session))}>
          Nochmal versuchen
        </button>
      </main>
    );
  }

  const abmelden = () => supabase.auth.signOut();
  const { profil, sprachen, session } = zustand;

  if (!profil) {
    return (
      <main className="al-anmeldung">
        <h1>Noch kein Zugang</h1>
        <p>
          Die Adresse <strong>{session.user.email}</strong> ist nicht eingeladen. Bitte frag eine Anleiterin oder einen
          Anleiter, ob sie dich im Bereich „Team“ einladen.
        </p>
        <button type="button" className="al-knopf" onClick={abmelden}>
          Abmelden
        </button>
      </main>
    );
  }

  if (profil.rolle === 'sprachpate') {
    const namen = profil.sprachen.map((c) => sprachen.find((s) => s.code === c)?.name_de ?? c).join(', ');
    return (
      <main className="al-anmeldung">
        <h1>Hallo!</h1>
        <p>
          Du bist Sprachpate für <strong>{namen}</strong>. Hier prüfst du bald die Übersetzungen in deinen Sprachen.
        </p>
        <p className="al-leise">Die Prüfansicht kommt in der nächsten Ausbaustufe (Phase 4).</p>
        <button type="button" className="al-knopf" onClick={abmelden}>
          Abmelden
        </button>
      </main>
    );
  }

  const umgebung: AnleiterUmgebung = { api: api!, profil, sprachen, gehe: wechseln, setUngespeichert };
  const seite = teile[0] ?? 'anleitungen';

  let inhalt;
  if (seite === 'anleitungen' && teile[1]) inhalt = <AnleitungBearbeiten key={teile[1]} id={teile[1] === 'neu' ? null : teile[1]} />;
  else if (seite === 'arbeitsplaetze') inhalt = <Arbeitsplaetze />;
  else if (seite === 'team') inhalt = <Team />;
  else if (seite === 'daten') inhalt = <Datenschutz />;
  else inhalt = <AnleitungenListe />;

  return (
    <AnleiterKontext.Provider value={umgebung}>
      <div className="al">
        <header className="al-kopf">
          <a className="al-marke" href="#/anleiter" onClick={(e) => (e.preventDefault(), wechseln([]))}>
            Arbeitsplatz-Begleiter
          </a>
          <nav aria-label="Anleiter-Bereich" className="al-nav">
            {NAVIGATION.map(([ziel, name]) => (
              <a
                key={ziel}
                href={`#/anleiter/${ziel}`}
                aria-current={seite === ziel ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  wechseln([ziel]);
                }}
              >
                {name}
              </a>
            ))}
          </nav>
          <div className="al-konto">
            <span>{profil.email}</span>
            <button type="button" className="al-knopf al-knopf--leise" onClick={abmelden}>
              Abmelden
            </button>
          </div>
        </header>
        {wechselZiel && (
          <div className="al-inhalt">
            <Rueckfrage
              frage="Du hast ungespeicherte Änderungen. Wirklich weg von dieser Seite?"
              ja="Änderungen verwerfen"
              nein="Hierbleiben"
              gefaehrlich
              onJa={() => {
                setUngespeichert(false);
                setWechselZiel(null);
                gehe({ art: 'anleiter', teile: wechselZiel });
              }}
              onNein={() => setWechselZiel(null)}
            />
          </div>
        )}
        <main className="al-inhalt">{inhalt}</main>
      </div>
    </AnleiterKontext.Provider>
  );
}
