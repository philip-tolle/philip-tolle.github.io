# Arbeitsplatz-Begleiter

Barrierefreie, mehrsprachige Web-App für Tablets am Arbeitsplatz. Sie zeigt eine Aufgabe
Schritt für Schritt in Leichter Sprache und in der Muttersprache der Person, mit Bild und
Vorlesefunktion.

**Eigenständiges Projekt.** Dieser Ordner gehört nicht zur NextCourse-Website. Er hat einen
eigenen Build und wird **nicht** mit der Website bei IONOS veröffentlicht. Eine
Veröffentlichung braucht eine eigene, ausdrückliche Freigabe.

## Stand: Phase 2 – Datenbank, Login, Anleiter-Bereich

**Phase 1 (Mitarbeiter-Ansicht):** Sprachwahl ohne Flaggen (2 Berührungen), Rechts-nach-links,
„Deutsch mitlernen“, Schritt-Ansicht mit Nochmal | Weiter | Hilfe, Vorlesen mit Gerätestimmen,
ungeprüfte Sicherheitsschritte mit deutschem Satz, Fertig- und Hilfe-Bildschirm,
Geräte-Einstellungen hinter PIN (Test-PIN `1234`).

**Phase 2 (dieser Stand):**

- Datenbank in Supabase mit Zugriffsregeln (Row Level Security). Einrichtung:
  [`supabase/EINRICHTUNG.md`](supabase/EINRICHTUNG.md).
- Anleiter-Bereich unter `#/anleiter`: Anmeldung per E-Mail-Code (ohne Passwort), nur für
  eingeladene Personen. Rollen „Anleiter:in“ und „Sprachpate“.
- Anleitungen anlegen und bearbeiten: Angaben, Arbeitsplätze, Zielsprachen, Schritte
  (Satz, Hinweis, Bildwort, Sicherheit), Schritte verschieben, einfügen, löschen,
  Mediopunkt-Taste, Hinweise zu langen Sätzen und Wörtern, Vorschau wie auf dem Tablet.
- „Deutsch freigeben“: Das Tablet zeigt nur freigegebene Fassungen. Änderungen danach
  erreichen das Tablet erst mit der nächsten Freigabe.
- Ändert sich ein deutscher Schritt, werden seine Übersetzungen „veraltet“. Die Tablets
  zeigen bis zur neuen Freigabe die alte Sprachfassung.
- Liste mit Stand je Sprache, z. B. „Deutsch ✓ · Englisch ✓ · Ukrainisch: veraltet“.
- Arbeitsplätze mit Tablet-Adresse, angebotenen Sprachen und Ansprechperson.
- Team: einladen, Rolle ändern, entfernen (mindestens eine Anleiterin bleibt immer).
- Seite „So geht die App mit Daten um“.
- Das Tablet lädt seine Inhalte aus der Datenbank und merkt sich den letzten Stand.
  Fällt die Verbindung aus, laufen Schritt-Ansicht, Vorlesen und Hilfe weiter.
- Ohne `konfiguration.json` läuft die App als Testversion mit Beispieldaten.

Noch nicht enthalten: KI-Funktionen (Phase 3–6), Bildauswahl und Fotos (Phase 3),
Übersetzen und Prüfansicht für Sprachpaten (Phase 4), echte Hilferufe (Phase 6).

## Befehle

```bash
npm install               # einmalig
npm run dev               # Entwicklungs-Server, z. B. http://localhost:5173/#/platz/bankett
npm test                  # Regeln prüfen (Sprachen, Freigaben, Vorlesen, Adressen, Lesbarkeit)
npm run build             # Typprüfung und Build nach dist/
npm run pruefen           # Tablet-Ansicht im Browser prüfen (Testversion, nach dem Build)
npm run sql               # SQL-Dateien aus den App-Daten erzeugen (Sprachliste, Beispieldaten)
npm run pruefen:datenbank # Datenbank, Zugriffsregeln und Funktionen gegen echtes Postgres prüfen
npm run pruefen:anleiter  # Anleiter-Bereich und Tablet mit Datenbank im Browser prüfen
```

Für die beiden Datenbank-Prüfungen müssen die Postgres-Programme installiert sein
(z. B. `/usr/lib/postgresql/16/bin`). Die Prüfungen starten eine eigene, temporäre
Datenbank und ahmen davor das Nötigste von Supabase nach (`tests/hilfen/`).

`npm run pruefen` bedient die App automatisch in allen Testsprachen und prüft u. a.
Tastengrößen (88 × 88 px), Textkontrast 7:1 (axe-core), Rechts-nach-links, Schriften,
Vorlese-Reihenfolge und Handy-Breite. Bildschirmfotos landen in `tests/bildschirmfotos/`.

## Aufbau

- `src/typen.ts` – Datentypen nach dem Datenmodell des Lastenhefts
- `src/daten/` – Sprachliste, Beispieldaten, Oberflächentexte je Sprache, Datenquelle
  (Datenbank, Zwischenspeicher, Testversion)
- `src/Arbeitsplatz.tsx` – das Tablet an einem Arbeitsplatz
- `src/anleiter/` – Anleiter-Bereich (wird nur geladen, wenn ihn jemand öffnet)
- `supabase/` – Datenbank: Migrationen, Einrichtung in einer Datei, Beispieldaten, Anleitung
- `src/logik/` – reine Regeln mit Tests: was freigegeben ist, was angezeigt und vorgelesen wird
- `src/vorlesen/` – Gerätestimmen (Web Speech API), austauschbar gegen einen Server-Dienst
- `src/geraet/` – Geräte-Einstellungen (nur auf dem Gerät gespeichert, keine Nutzungsdaten)
- `src/ansichten/`, `src/komponenten/` – Bildschirme und Bausteine
- `public/bilder/beispiel/` – eigene Test-Piktogramme (SVG)

## Entscheidungen

- **Freigabe als Momentaufnahme**: „Deutsch freigeben“ speichert die Fassung, die das Tablet
  zeigt. Jede Sprache hat ihre eigene freigegebene Fassung mit dem deutschen Bezugstext.
  So kann eine Anleiterin weiterarbeiten, ohne dass Mitarbeitende Halbfertiges sehen.
- **Zugriff nur über Datenbank-Funktionen**: Das Tablet ruft genau eine Funktion auf
  (`platz_inhalte`) und sieht nur Freigegebenes seines Arbeitsplatzes. Der Anleiter-Bereich
  nutzt Funktionen, die Rolle und Eingaben prüfen. Darunter schützen Zugriffsregeln (RLS)
  jede Tabelle, auch gegen direkte Anfragen.
- **Anmeldung per Code statt Link**: Ein Code funktioniert auch, wenn die E-Mail auf dem
  Handy und die App auf dem Laptop offen ist.
- **Konfiguration zur Laufzeit** (`konfiguration.json`): Dieselbe gebaute App läuft als
  Testversion oder mit Datenbank – je nachdem, ob die Datei daneben liegt.

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
