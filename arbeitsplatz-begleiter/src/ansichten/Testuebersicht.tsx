import { useEffect, useRef } from 'react';
import type { Inhalte } from '../typen';
import { adresse } from '../logik/route';
import { TEST_PIN } from '../geraet/einstellungen';

/** Einstieg für den Test. Später ersetzt durch die Anmeldung zum Anleiter-Bereich. */
export function Testuebersicht({ inhalte }: { inhalte: Inhalte }) {
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  useEffect(() => ueberschrift.current?.focus({ preventScroll: true }), []);
  return (
    <main className="testuebersicht" lang="de" dir="ltr">
      <h1 ref={ueberschrift} tabIndex={-1}>
        Arbeitsplatz-Begleiter
      </h1>
      <p className="testuebersicht-unter">Testversion · Phase 1: Mitarbeiter-Ansicht mit Beispieldaten</p>
      <h2>Tablet-Ansicht öffnen</h2>
      <ul className="testuebersicht-plaetze">
        {inhalte.arbeitsplaetze.map((p) => (
          <li key={p.id}>
            <a href={adresse({ art: 'start', platzId: p.id })}>{p.name}</a>
            <span>
              Adresse für das Tablet: {adresse({ art: 'start', platzId: p.id })} (kurz: #{p.id})
            </span>
          </li>
        ))}
      </ul>
      <h2>Gut zu wissen</h2>
      <ul>
        <li>Sprachen mit Testdaten: Deutsch, Englisch, Ukrainisch, Arabisch, Türkisch.</li>
        <li>
          Alle Übersetzungen sind „maschinell“ und von keinem Sprachpaten geprüft. Deshalb zeigen die
          Sicherheitsschritte im Bad (Schritt 1 und 4) den deutschen Satz und „Bitte frag nach“.
        </li>
        <li>Geräte-Einstellungen: unten auf der Startseite, Test-PIN {TEST_PIN}.</li>
        <li>Der Hilferuf wird noch nicht gesendet. Auf dem Hilfe-Bildschirm kann man die Antwort der Anleiterin nachspielen.</li>
        <li>Die Bilder sind einfache Test-Piktogramme. Die Auswahl aus ARASAAC kommt in Phase 3.</li>
      </ul>
    </main>
  );
}
