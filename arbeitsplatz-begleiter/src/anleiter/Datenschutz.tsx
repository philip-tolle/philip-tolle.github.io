import { Seitenkopf } from './gemeinsam';

/** „So geht die App mit Daten um“ – kurz und ehrlich. */
export function Datenschutz() {
  return (
    <section className="al-text">
      <Seitenkopf titel="So geht die App mit Daten um" />
      <h2>Mitarbeitende am Tablet</h2>
      <ul>
        <li>Mitarbeitende haben kein Konto und melden sich nicht an.</li>
        <li>
          Das Tablet merkt sich nur seine Einstellungen (Sprache, Schriftgröße, Vorlesen). Die Sprachwahl gehört zum Gerät,
          nicht zu einer Person.
        </li>
        <li>
          Es wird nicht gespeichert, wer welche Anleitung wie oft oder wie lange benutzt, wie oft jemand „Nochmal“ drückt oder
          was gefragt wird. Es gibt keine Leistungskontrolle.
        </li>
        <li>Ein Hilferuf enthält nur Arbeitsplatz, Anleitung, Schritt und Gerätesprache – keinen Namen.</li>
        <li>Das Tablet bekommt nur freigegebene Anleitungen seines Arbeitsplatzes.</li>
      </ul>
      <h2>Team im Anleiter-Bereich</h2>
      <ul>
        <li>Gespeichert werden E-Mail-Adresse, Rolle und bei Sprachpaten die Sprachen.</li>
        <li>Die Anmeldung läuft ohne Passwort über einen Code per E-Mail.</li>
        <li>Gespeichert wird, wer eine Anleitung freigegeben hat und wann.</li>
      </ul>
      <h2>Speicherort</h2>
      <ul>
        <li>Die Daten liegen in einer Supabase-Datenbank. Empfohlen ist die Region Frankfurt (EU).</li>
        <li>Schriften und Bilder werden von der App selbst geladen, nicht von Google oder anderen Diensten.</li>
      </ul>
      <h2>Später (nächste Ausbaustufen)</h2>
      <ul>
        <li>
          KI: An die KI gehen nur Anleitungstexte, Glossar und Fragen – nie Namen oder andere Daten von Mitarbeitenden. Fragen
          und Gespräche werden nach der Antwort verworfen.
        </li>
        <li>
          Spracheingabe: Der Browser Chrome schickt gesprochene Sprache zur Erkennung an Server von Google. Darauf weisen wir
          an dieser Stelle hin, sobald die Spracheingabe kommt.
        </li>
      </ul>
    </section>
  );
}
