# Management und Betriebshandbuch – lokale Überarbeitung, 13.9.2026

## Ziel und Stand
Nach der Startseitenrunde wird der nächste Teil des Website-Audits umgesetzt: klare Auswahl innerhalb von Management und verständliche Darstellung des digitalen Betriebshandbuchs. Nur lokal gebaut; keine Veröffentlichung. Die eigentliche Handbuch-Anwendung und der persönliche Demo-Zugangsablauf werden in getrennten Aufgaben bearbeitet.

## Änderungen
- Management benennt die vier Wege und Ergebnisse konkreter: Betriebswissen ordnen, Gästeerlebnis prüfen, digitale Abläufe untersuchen und vereinbarte Verbesserungen einführen.
- Die bestehenden kompakten Bild-/Beschreibungskarten enthalten präzisere Claims und Beschreibungen. Aufbau, Bilder, Kartenwechsel und Effekte bleiben erhalten.
- Die Abgrenzung zu Operation und Academy wird am Ende der Übersicht erklärt und direkt verlinkt. Digital Audit und eine anschließende Umsetzung werden als gesondert zu vereinbarende Schritte beschrieben.
- Die Handbuchseite nennt das Produkt und die Zielgruppe im Titel, in der H1 und im Einstieg. Einführung und Pflege gehören erkennbar zur Leistungsbeschreibung.
- Ein kurzes, ausdrücklich fiktives Beispiel zeigt die Zimmerfreigabe aus Sicht einer neuen Kollegin: Standard finden, Abweichungen klären, Freigabe weitergeben. Eine helle Lesefläche steht neben dem dunklen Demo-Bereich; mobil folgen beide aufeinander.
- Die Demo-Verknüpfung erklärt den geschützten Zugang und führt primär zur vorausgewählten Kontaktanfrage. Ein direkter Link für bestehende Zugänge bleibt erhalten. Keine Zugangsdaten in der Website.
- Zusammenarbeit und häufige Fragen erklären Umfang, fachliche Freigabe, Einführung, spätere Pflege und die Demo-Anfrage.

## Quelldateien
- src/data/service-pages.ts: ausschließlich Management-Daten
- src/data/detail-offers.ts: ausschließlich handbookOffer
- src/components/OfferPage.astro: Handbuch-Beispiel einbinden und Sprunglink benennen
- src/components/HandbookOfferExample.astro: neuer kompakter Beispiel-/Demo-Bereich

Daten der anderen Leistungsübersichten und Detailangebote gegen die Sicherung verglichen und unverändert. Bestehende uncommittete Projektarbeit erhalten.

## Prüfung
- Finaler Astro-Build erfolgreich: 32 Seiten plus 6 Weiterleitungen.
- scripts/check-built-site.py: 38 HTML-Dateien, 1.920 interne Referenzen, keine Fehler.
- Desktop und mobile Ansichten bis 320 Pixel kontrolliert; keine horizontale Überbreite in den geprüften Ansichten. Das neue Alltagsbeispiel nach der ersten Mobilprüfung auf drei kürzere Schritte verdichtet.
- Management-Kartenwechsel, Rückweg zum Bild und Angebotsnavigation geprüft.
- Beispiel-Sprunglink, Pflege-FAQ und Demo-Anfrage geprüft. Im Kontaktformular werden Betriebshandbuch und Demo-Zugang sichtbar übernommen. Keine Nachricht versendet.
- Die geschützte Handbuch-Anwendung wurde in dieser Runde nicht neu geprüft. Physische Touch-Gesten und tatsächliche E-Mail-Zustellung sind nicht Bestandteil dieser Prüfung.
- Viewport-Override nach der Prüfung zurückgesetzt; lokale Vorschau bleibt auf Port 4321 verfügbar.

## Lokale Durchsicht
- http://127.0.0.1:4321/management/
- http://127.0.0.1:4321/management/betriebshandbuch/#demo

Sicherungen und Build-Protokolle: im Arbeitsbereich Website-Projekte unter tmp/management-round-2026-09-13/.

## Nächster gemeinsamer Schritt
Management-Auswahl und Handbuchseite mit dem Nutzer durchsehen. Danach nach Rückmeldung die übrigen Management-Angebote einzeln bearbeiten. Keine automatische Veröffentlichung.
