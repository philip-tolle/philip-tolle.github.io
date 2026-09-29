# Mobiles Erlebnis der NextCourse-Website

Stand: 29. September 2026 · Entwurf nach den im Gespräch bestätigten Designentscheidungen

## Ziel und Erfolg

Besucherinnen und Besucher aus Hotels und Gastronomie sollen auf dem Smartphone schnell verstehen, welche Unterstützung von NextCourse zu ihrem Anliegen passt, das passende Angebot ohne Rätselraten erreichen und unkompliziert Kontakt aufnehmen können. Der derzeitige Textumfang auf Übersichtsseiten bremst diesen Weg. Die Startseiten-Auswahl soll sich mit einer natürlichen Wischgeste bedienen lassen.

Erfolg bedeutet: Die Startseite und die drei Bereichsübersichten sind auf schmalen Bildschirmen deutlich knapper und besser scanbar; wesentliche Angebotsunterschiede und der nächste Schritt bleiben sichtbar. Ausführliche Informationen bleiben auf den verlinkten Angebotsseiten erreichbar. Wischen ist eine Ergänzung zu sichtbaren Bedienelementen, keine Voraussetzung. Die bestehende Desktop-Gestaltung und die Markenwirkung bleiben erhalten.

## Geltungsbereich und Grenzen

- Im Fokus stehen `/`, `/management/`, `/akademie/`, `/operation/` sowie die gemeinsame Navigation und der Weg zu `/kontakt/`. Die öffentlichen Angebots-Unterseiten werden auf Mobilnutzbarkeit geprüft und bei konkreten Layout- oder Bedienproblemen gezielt korrigiert, aber nicht inhaltlich gekürzt.
- Academy- und Operation-Zusatzabschnitte auf den Bereichsübersichten gehören zur Kürzung. Wichtige Leistungsgrenzen, Statusangaben wie die noch vorbereitete AZAV-Zulassung, Preise und Bedingungen dürfen dabei nicht verloren gehen.
- Blog, FAQ, Über-uns-, Impressums- und Datenschutzseiten erhalten eine grundlegende Prüfung auf Lesbarkeit, Navigation und horizontalen Überlauf; keine pauschale redaktionelle Neufassung. Prompt Studio, geschützte Kundenbereiche, Kursplattform und Demo-Handbuch sind nicht Teil dieses Vorhabens.
- Keine Änderung an Hosting, IONOS, GitHub Pages, Kontaktformular-Ziel, Zugangsschutz oder privaten Daten. Ein Git-Push ist kein Live-Deployment; IONOS-Veröffentlichung benötigt eine eigene ausdrückliche Freigabe.

## Gewählter Ansatz

Die vorhandene Astro-Website wird in ihren bestehenden Komponenten responsiv weiterentwickelt. Es gibt keine zweite, separat zu pflegende Mobil-Website. Ein bloßes Verkleinern oder Einklappen bestehender Texte genügt nicht, weil es den Informationsfluss nicht verbessert. Die visuellen Konstanten — rundes Logo, Dunkelgrün/Warmweiß/Orange, Academy-Blau, Illustrationen und Wellen — bleiben erhalten.

## Inhalt und Seitenfluss

### Startseite

Der bekannte Marken-Einstieg bleibt, aber auf dem Smartphone stehen eine kurze Nutzenbotschaft und ein klarer Hauptweg zur Angebotsauswahl im Vordergrund. Sekundäre Hinweise dürfen den ersten Bildschirm nicht dominieren. Die drei Angebotskarten enthalten jeweils Alltagsthema, eine knappe Nutzenzeile und einen eindeutigen Link zur Bereichsseite. Lange Erläuterungen und Wiederholungen werden auf Mobilgeräten nicht vor der Auswahl gezeigt.

Redaktionelle Leitlinie für die mobilen Übersichten: Hero-Einordnung höchstens zwei kurze Sätze, Abschnitts-Einleitung höchstens ein Satz, Angebotskarte höchstens ein Nutzensatz ohne Aufzählung. Diese Kurzfassungen sollen konkret bleiben und keine Zusage hinzufügen, die die jeweilige Detailseite nicht trägt. Vollständige Informationen sind über einen eindeutig benannten Link erreichbar, nicht nur über eine unsichtbare Geste.

Die weiteren Startseitenabschnitte zum Betriebshandbuch und zur Zusammenarbeit werden auf dem Smartphone auf ihre Kernaussage und je einen nächsten Schritt verdichtet. Der geschützte Demo-Status und der Weg zur Zugangsanfrage bleiben korrekt erkennbar.

### Management, Academy und Operation

Jede Übersicht beginnt mobil mit einer kurzen Aussage zum Bereich und einem primären nächsten Schritt. Vor den Angeboten steht höchstens eine knappe Orientierung. Jede Angebotskarte zeigt ohne zusätzliche Geste die Bezeichnung, den konkreten Nutzen und den Link zur vollständigen Angebotsseite. Wiederholte Langtexte, Listen und die zweite Bild-/Detailseite der bisherigen Deck-Karten entfallen in der mobilen Übersicht. Auf Desktop bleibt die bestehende Kartenführung grundsätzlich erhalten.

Academy-Format und Operation-Zusammenarbeitsformen werden mobil ebenfalls gestrafft, ohne wesentliche Unterschiede oder Bedingungen zu verschweigen. Die Anker- und Direktlinks zu Angeboten bleiben gültig. Die Angebots-Unterseiten behalten vollständige Inhalte, Abläufe, FAQ und Kontaktwege.

## Interaktion und Zugänglichkeit

- Die Startseiten-Angebote erscheinen mobil in einer horizontalen, nativ wischbaren Leiste mit Scroll-Snap. Ein angeschnittener Folgekartenrand, eine Anzeige wie „1 von 3“ und beschriftete Vor-/Zurück-Bedienelemente machen die Funktion sichtbar. Es gibt kein automatisches Weiterlaufen.
- Wischen und Vor-/Zurück-Schaltflächen wechseln die sichtbare Karte; der direkte Kartenlink führt zur zugehörigen Bereichsseite. Vertikales Seitenscrollen bleibt natürlich; eine horizontale Geste löst keine versehentliche Navigation aus. Die Desktop-Auswahl per Maus und Tastatur bleibt erhalten.
- Ohne JavaScript sind alle Angebote und Links erreichbar; native horizontale Bewegung bleibt möglich. Bei reduziertem Bewegungswunsch erfolgen Zustandswechsel ohne erzwungene Animation.
- Auf Bereichsübersichten gibt es mobil keine konkurrierende Wischgeste zwischen Bild und Detailtext. Die kurze Karte ist direkt lesbar; Details liegen auf der verlinkten Unterseite.
- Menü, Fokusreihenfolge, Linkbezeichnungen, Touch-Ziele und Kontrast bleiben auf Smartphone-Größen nachvollziehbar. Verborgene Desktop- bzw. Mobil-Varianten dürfen nicht doppelt in der Tastatur- oder Screenreader-Navigation auftauchen.

## Umsetzungsschnittstellen

`HomeServices.astro` liefert die drei Angebote weiterhin aus einer gemeinsamen Datenquelle an Desktop-Auswahl und mobile Wischansicht. Responsive Styles und die minimale Zustandsanzeige ergänzen die vorhandene Komponente. `ServicePage.astro`, `ServiceHero.astro`, `ServiceJourney.astro`, `ServiceJourneyCard.astro` und `src/data/service-pages.ts` bilden die knappen mobilen Bereichsübersichten ab; Detailseiten erhalten keine gekürzte Datenbasis. `Header.astro`, Kontaktseite und gemeinsame Styles werden nur dort angepasst, wo die mobile Prüfung konkrete Probleme zeigt. Keine neue Produktabhängigkeit ist vorgesehen.

## Prüfung und Abnahme

- Produktionsbuild mit `npm run build` erfolgreich; interne Routen, Anker und Verlinkungen der vier Übersichtsseiten und ihrer Angebotsziele funktionieren.
- Sichtprüfung bei 320, 375, 390 und 430 CSS-Pixeln sowie einer Tablet- und Desktop-Breite: kein unbeabsichtigter horizontaler Seitenüberlauf, keine abgeschnittenen Texte oder Bedienelemente.
- Startseiten-Auswahl per Touch-Simulation/Wischgeste, Tap, Schaltfläche und Tastatur prüfen; Navigation zwischen allen drei Angeboten und korrekte Positionsanzeige bestätigen. Vertikales Scrollen und Links dürfen dabei nicht blockiert werden.
- Bereichsseiten, Menü, Kontaktformular und exemplarische Angebots-Unterseiten mit Tastatur, ohne JavaScript und bei reduzierter Bewegung prüfen. Keine echte Formularnachricht absenden.
- Eine Browser-Emulation ist kein Test auf einem physischen Smartphone; falls kein Gerätetest stattfindet, wird das ausdrücklich als offene Verifikation benannt.
- Änderungen bleiben zunächst lokal. Vor einer etwaigen Veröffentlichung sind ein frischer Build, gemeinsame Sichtprüfung und ausdrückliche IONOS-Freigabe nötig.
