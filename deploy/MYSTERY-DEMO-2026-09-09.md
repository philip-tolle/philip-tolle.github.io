# Mystery Check: Kundenvorschau und Booklet-QR

Stand: 9. September 2026. Lokal umgesetzt und geprüft; nicht auf IONOS veröffentlicht.

## Öffentlicher Weg

- Einstieg auf `/management/mystery-check/`: direkter Hero-Link und gestalteter Vorschauabschnitt mit dem echten PDF-Titelblatt.
- Dauerhafte Demo-Adresse und QR-Ziel: `https://www.next-course.de/mystery-check-demo/`.
- Kundenseite: responsive Vorschau mit allen 18 Originalseiten, vier Kapiteleinstiegen, Seitenauswahl, Vor/Zurück, Vergrößerung und PDF-Download. Der fiktive Charakter wird klar ausgewiesen.
- Original-PDF: `/demo/mystery-check/nextcourse-mystery-check-demo.pdf`.
- Kontaktlink: `/kontakt/?thema=mystery-check#contactform`, mit neuer passender Auswahloption.

## Dateien

- `src/components/MysteryDemoPreview.astro`
- `src/pages/mystery-check-demo.astro`
- `src/styles/mystery-demo.css`
- Ergänzungen in `src/pages/management/mystery-check.astro` und `src/pages/kontakt.astro`
- `public/demo/mystery-check/`: ausschließlich die fiktive Kunden-PDF und deren 19 WebP-Vorschaubilder (18 Seiten plus kleines Cover), insgesamt etwa 2,3 MB. Die initiale Ansicht lädt nicht alle Seiten.
- `scripts/create-mystery-demo-assets.py`: reproduzierbare Erzeugung aus der freigegebenen PDF; offline erzeugter QR mit der vorhandenen MIT-Bibliothek `scripts/vendor/qrcodegen.py`.

Die internen Recherche- und Positionierungsunterlagen wurden nicht ins öffentliche Verzeichnis kopiert.

## Booklet-Dateien

Im lokalen Aufgabenordner `output/mystery-check-vorschau/` liegen:

- `NextCourse-Mystery-Check-QR.svg`: Vektor-QR, nominell 42 mm, vier Module Weißraum.
- `NextCourse-Mystery-Check-QR.png`: hochauflösende Rasterfassung ohne Glättung der Module.
- `NextCourse-Mystery-Check-Booklet-Vorschau.pdf`: A5-Vorschlag mit Vektor-QR und anklickbarem Ziel.
- `NextCourse-Mystery-Check-Booklet-Vorschau.png`: gerenderte Ansicht dieser Seite.
- `QR-und-Veroeffentlichung.json`: Zieladresse, Parameter und Abgleich des PDF-Hashs.

Der QR verweist auf die endgültige eigene Domain und nicht auf localhost. Solange die Seite nicht veröffentlicht ist, kann ein Scan die neue Demo nicht öffentlich öffnen. Nach Veröffentlichung vor Druck auf einem echten Smartphone über Mobilfunk prüfen. Den Weißraum um den QR beim Einsetzen nicht beschneiden; die Vorschau verwendet etwa 40 mm Kantenlänge.

## Prüfung

- Astro-Produktionsbuild nach `../tmp/mystery-demo-build-20260909/` erfolgreich.
- Bestehende Linkprüfung: 35 HTML-Dateien, 1.277 interne Verweise, keine Fehler.
- Desktop-Sichtprüfung von Angebotsseite, Vorschauabschnitt und Demo-Seite.
- Responsive Prüfung bei 390 und 768 Pixeln: kein horizontaler Seitenüberlauf.
- Kapiteleinstieg, Seitenauswahl, Vor/Zurück, deaktivierte Grenzen bei Seite 1/18 und Vergrößerung geprüft.
- Vergrößerung lässt sich über Schließen und Escape schließen; mobile Schließen-Schaltfläche sichtbar.
- Kontakt-Vorauswahl „Mystery Check“ geprüft; kein Formular abgesendet.
- Keine Browser-Konsolenfehler auf der Demo-Seite erfasst.
- Öffentliche PDF ist bytegleich mit der erstellten Demo. Booklet-PDF und QR-Seite visuell geprüft; beide PDF-Links zeigen auf dieselbe Demo-Adresse.
- QR wurde mit einer etablierten Offline-Bibliothek erzeugt. Ein optischer Scan auf einem physischen Druck wurde noch nicht durchgeführt.

## Veröffentlichung

Die Hauptwebsite enthält weitere unveröffentlichte Änderungen vom 8. September. Dieser Auftrag hat die Vorschau ergänzt, aber keinen vollständigen Relaunch veröffentlicht. Vor einem IONOS-Upload den abgestimmten Stand frisch bauen und den Umfang des Uploads gezielt festlegen. Die bestehende private Praxis-Hub-Konfiguration und andere geschützte Inhalte nicht aus einem allgemeinen Build übernehmen.

Bei der Freischaltung Demo-Route, alle 18 Seitenbilder, PDF, Einstieg und Kontaktweg über die produktive Domain prüfen. Die QR-Adresse dauerhaft beibehalten; spätere PDF-Fassungen unter derselben Demo-Seite austauschen.
