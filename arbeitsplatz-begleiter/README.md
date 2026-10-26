# Arbeitsplatz-Begleiter

Barrierefreie, mehrsprachige Web-App für Tablets am Arbeitsplatz. Sie zeigt eine Aufgabe
Schritt für Schritt in Leichter Sprache und in der Muttersprache der Person, mit Bild und
Vorlesefunktion.

**Eigenständiges Projekt.** Dieser Ordner gehört nicht zur NextCourse-Website. Er hat einen
eigenen Build und wird **nicht** mit der Website bei IONOS veröffentlicht. Eine
Veröffentlichung braucht eine eigene, ausdrückliche Freigabe.

## Stand: Phase 1 – Mitarbeiter-Ansicht mit Beispieldaten

Fertig:

- Sprachwahl ohne Flaggen: 1. Berührung liest einen Gruß vor, 2. Berührung bestätigt.
  Es erscheinen nur Sprachen mit freigegebener Anleitung an diesem Arbeitsplatz.
- Rechts-nach-links für Arabisch (ganze Ansicht gespiegelt, Pfeile gespiegelt, Bilder und
  Zahlen nicht).
- „Deutsch mitlernen“: deutscher Satz klein darunter, Vorlesen erst Muttersprache, dann Deutsch.
- Schritt-Ansicht mit Nochmal | Weiter | Hilfe, Fortschrittspunkten, Vorlesen mit Gerätestimmen.
- Ungeprüfte Sicherheitsschritte: Achtung-Symbol, deutscher Satz, „Bitte frag nach …“.
- Fertig-Bildschirm, Hilfe-Bildschirm (Hilferuf wird noch nicht gesendet, Antwort der
  Anleiterin lässt sich im Testkasten nachspielen).
- Geräte-Einstellungen hinter PIN (Test-PIN `1234`): Vorlesetempo, Schriftgröße, Farben,
  automatisches Vorlesen, hoher Kontrast.
- Beispieldaten: 2 Arbeitsplätze, 2 Anleitungen, Übersetzungen und Oberflächentexte in
  Englisch, Ukrainisch, Arabisch und Türkisch mit Rückübersetzung (Status „maschinell“).

Noch nicht enthalten (folgende Phasen): Datenbank und Login, KI-Funktionen, Anleiter-Bereich,
ARASAAC-Piktogramme, echte Hilferufe, Gesprächshilfe, Vorlesen über den Server.

## Befehle

```bash
npm install        # einmalig
npm run dev        # Entwicklungs-Server, z. B. http://localhost:5173/#/platz/bankett
npm test           # Regeln prüfen (Sprachen, Freigaben, Vorlesen, Adressen)
npm run build      # Typprüfung und Build nach dist/
npm run pruefen    # Oberflächen-Prüfung im Browser (nach dem Build)
```

`npm run pruefen` bedient die App automatisch in allen Testsprachen und prüft u. a.
Tastengrößen (88 × 88 px), Textkontrast 7:1 (axe-core), Rechts-nach-links, Schriften,
Vorlese-Reihenfolge und Handy-Breite. Bildschirmfotos landen in `tests/bildschirmfotos/`.

## Aufbau

- `src/typen.ts` – Datentypen nach dem Datenmodell des Lastenhefts
- `src/daten/` – Sprachliste, Beispieldaten, Oberflächentexte je Sprache, Datenquelle
  (Phase 2 tauscht nur `datenquelle.ts` gegen die Datenbank)
- `src/logik/` – reine Regeln mit Tests: was freigegeben ist, was angezeigt und vorgelesen wird
- `src/vorlesen/` – Gerätestimmen (Web Speech API), austauschbar gegen einen Server-Dienst
- `src/geraet/` – Geräte-Einstellungen (nur auf dem Gerät gespeichert, keine Nutzungsdaten)
- `src/ansichten/`, `src/komponenten/` – Bildschirme und Bausteine
- `public/bilder/beispiel/` – eigene Test-Piktogramme (SVG)

## Entscheidungen

- **Adressen mit `#`** (`…/#/platz/bankett`): funktionieren auf jedem Webspace ohne
  Server-Einstellungen.
- **Schriften lokal eingebunden** (Atkinson Hyperlegible Next, Noto Sans, Noto Sans Arabic,
  Noto Sans Ethiopic über Fontsource): dieselben Google-Schriften, aber ohne Verbindung zu
  Google-Servern (DSGVO), wie auf der NextCourse-Website.
- **Farsi und Dari getrennt**: andere Wörter und Stimmen; Dari hat Qualität „eingeschränkt“
  und braucht eine Prüfung durch Sprachpaten.
- **Testdaten-Freigabe**: Die Sprachfassungen sind als „freigegeben (Testdaten)“ markiert,
  damit sie erscheinen. Die einzelnen Schritt-Übersetzungen sind „maschinell“, deshalb
  greifen die Regeln für ungeprüfte Sicherheitsschritte.
- **Arabisch**: Befehlsformen in der üblichen männlichen Grundform; Sätze mit dem Namen der
  Ansprechperson ohne Verb, damit sie für jede Person passen. Sprachpate soll prüfen.
- **Ukrainisch**: Formen ohne grammatisches Geschlecht („Усі кроки зроблено“).
- **Unsichere Stellen** in den Beispielübersetzungen (Daumenbreite, „über das Messer“,
  „nach oben“, Glasart) sind mit Grund markiert – Testmaterial für die Prüfansicht in Phase 4.
- **Bilder**: ARASAAC ist aus der Entwicklungsumgebung nicht erreichbar, daher eigene
  Test-Piktogramme. Achtung: ARASAAC steht unter CC BY-NC-SA (nicht kommerziell). Vor einem
  kommerziellen Einsatz die Nutzungsbedingungen klären.
