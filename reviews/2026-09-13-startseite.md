# Startseite – erste lokale Überarbeitung, 13.9.2026

## Ziel und Stand
Auf die Website-Analyse folgt der gemeinsame Seitendurchgang. Diese Runde betrifft ausschließlich die Startseite. Lokal gebaut und im Browser geprüft; nicht veröffentlicht.

## Änderungen
- Der Einstieg nennt die tatsächliche Unterstützung und Zielgruppe: „Wir ordnen Abläufe, schulen Ihr Team und übernehmen laufende Aufgaben. Für Hotels und Gastronomie in Mainfranken.“
- Zwei klar erkennbare Wege führen zu den Leistungen und zum kostenlosen Erstgespräch. Logo, bestehende Interaktionen und Farbsprache bleiben erhalten; die Größenverhältnisse wurden für die zusätzlichen Informationen angepasst.
- Die drei Auswahlmöglichkeiten erklären nun Management, Academy und Operation direkt. Die Bildkarten beschreiben konkrete Aufgaben statt ausschließlich Schlagworte zu zeigen.
- Die Handbuch-Vorschau erklärt den geschützten Zugang. Der Hauptweg führt zu einer vorausgewählten Anfrage; Besucher mit Zugang können weiterhin die geschützte Demo öffnen. Keine Zugangsdaten veröffentlicht.
- Zusammenarbeit wird als Anliegen klären, Umfang vereinbaren und Zusammenarbeiten beschrieben. Seitentitel und Meta-Beschreibung wurden präzisiert.

## Betroffene Quelldateien
- src/components/HomeContent.astro
- src/components/HomeServices.astro
- src/components/HandbookGateway.astro
- src/styles/home.css
- src/pages/index.astro

Die Komponenten und neuen Stile sind auf die Startseite begrenzt. Andere Detailseiten und die geschützte Handbuch-Anwendung wurden nicht verändert.

## Prüfung
- Finaler Astro-Build erfolgreich: 32 Seiten plus 6 Weiterleitungen.
- Bestehende Prüfung: 38 HTML-Dateien und 1.919 interne Referenzen, keine Fehler.
- Desktopansicht mit 1.440 × 900 Pixeln abschließend visuell geprüft: Logo, Text, beide Einstiegsaktionen und persönliche Verknüpfung sichtbar.
- Mobile Ansichten mit 390 und 320 Pixeln geprüft, ohne horizontale Überbreite. Bei 320 × 740 Pixeln ist etwas vertikales Scrollen im Einstieg nötig; die beiden Hauptaktionen sind sichtbar.
- Leistungswechsel mit Maus und Pfeiltasten, Sprung zu Leistungen, Angebotsverknüpfung und sichtbare Themen-/Angebotsübernahme im Kontaktformular geprüft. Keine Formularnachricht gesendet; kein physisches Touchgerät getestet.

## Lokale Vorschau
http://127.0.0.1:4321/

Nach mehrfach beendetem chatgebundenem Vorschauprozess wurde Astro Preview als unsichtbarer, unabhängiger Windows-Prozess gestartet. Der Browser zeigt den gebauten Stand. Nach weiteren Quelländerungen neu bauen; kein automatischer Live-Upload.

Vorher-/Nachher-Sicherungen und Build-Protokolle dieser Runde liegen im Arbeitsbereich Website-Projekte unter tmp/home-round-2026-09-13/.

## Nächster gemeinsamer Schritt
Zuerst Einstieg und Leistungsübersicht der Startseite mit dem Nutzer durchgehen. Die weiteren Analysepunkte und Angebotsseiten bleiben separate Runden.
