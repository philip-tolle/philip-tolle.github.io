import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Api, Profil, SpracheZeile } from './api';

export interface AnleiterUmgebung {
  api: Api;
  profil: Profil;
  sprachen: SpracheZeile[];
  /** Zu einer Seite im Anleiter-Bereich wechseln, z. B. ['anleitungen', id]. erzwingen: ohne Rückfrage. */
  gehe: (teile: string[], erzwingen?: boolean) => void;
  /** Bearbeitungsseiten melden ungespeicherte Änderungen, damit nichts verloren geht. */
  setUngespeichert: (ja: boolean) => void;
}

export const AnleiterKontext = createContext<AnleiterUmgebung | null>(null);

export function useAnleiter(): AnleiterUmgebung {
  const u = useContext(AnleiterKontext);
  if (!u) throw new Error('useAnleiter außerhalb des Anleiter-Bereichs');
  return u;
}

/** Lädt Daten und merkt sich Fehler. neuLaden() holt den aktuellen Stand. */
export function useDaten<T>(laden: () => Promise<T>, abhaengig: unknown[]) {
  const [daten, setDaten] = useState<T | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const holen = useCallback(laden, abhaengig);
  const neuLaden = useCallback(async () => {
    try {
      setDaten(await holen());
      setFehler(null);
    } catch (e) {
      setFehler((e as Error).message);
    }
  }, [holen]);
  useEffect(() => {
    neuLaden();
  }, [neuLaden]);
  return { daten, setDaten, fehler, neuLaden };
}

/** Führt eine Aktion aus und zeigt danach Erfolg oder Fehler. Verhindert Doppelklicks. */
export function useAktion() {
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);
  const ausfuehren = useCallback(async <T,>(aktion: () => Promise<T>, erfolgText?: string): Promise<T | undefined> => {
    setLaeuft(true);
    setFehler(null);
    setErfolg(null);
    try {
      const ergebnis = await aktion();
      if (erfolgText) setErfolg(erfolgText);
      return ergebnis;
    } catch (e) {
      setFehler((e as Error).message);
      return undefined;
    } finally {
      setLaeuft(false);
    }
  }, []);
  return { laeuft, fehler, erfolg, ausfuehren, setFehler, setErfolg };
}

export function Meldungen({ fehler, erfolg }: { fehler?: string | null; erfolg?: string | null }) {
  return (
    <>
      <div role="alert" className="al-meldung-stelle">
        {fehler && <p className="al-meldung al-meldung--fehler">{fehler}</p>}
      </div>
      <div role="status" className="al-meldung-stelle">
        {erfolg && <p className="al-meldung al-meldung--ok">{erfolg}</p>}
      </div>
    </>
  );
}

export function Seitenkopf({ titel, children }: { titel: string; children?: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <div className="al-seitenkopf">
      <h1 ref={ref} tabIndex={-1}>
        {titel}
      </h1>
      {children && <div className="al-seitenkopf-aktionen">{children}</div>}
    </div>
  );
}

/** Rückfrage direkt auf der Seite (keine Browser-Dialoge). */
export function Rueckfrage({
  frage,
  ja,
  nein = 'Abbrechen',
  onJa,
  onNein,
  gefaehrlich,
}: {
  frage: string;
  ja: string;
  nein?: string;
  onJa: () => void;
  onNein: () => void;
  gefaehrlich?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="al-rueckfrage" role="group" aria-label={frage}>
      <p>{frage}</p>
      <div className="al-knopfreihe">
        <button type="button" className={`al-knopf ${gefaehrlich ? 'al-knopf--gefahr' : 'al-knopf--haupt'}`} onClick={onJa}>
          {ja}
        </button>
        <button type="button" ref={ref} className="al-knopf" onClick={onNein}>
          {nein}
        </button>
      </div>
    </div>
  );
}

export function datum(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Text kopieren; wenn der Browser das verbietet, wird der Text markiert. */
export async function kopieren(text: string, feld?: HTMLInputElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    feld?.select();
    return false;
  }
}
