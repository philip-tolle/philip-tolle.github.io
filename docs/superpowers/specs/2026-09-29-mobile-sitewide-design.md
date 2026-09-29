# Mobile Gestaltung der gesamten öffentlichen Hauptwebsite

Stand: 29. September 2026 · Entwurf zur Freigabe vor der Umsetzung

## Ziel

Auf dem Smartphone sollen Besucherinnen und Besucher schnell sehen, worum es auf einer Seite geht, das zugehörige Bild ohne langen Textvorspann erreichen und passende Angebote durch natürliches Wischen erkunden können. Die Startseite soll spürbar ruhiger beginnen. Die vorhandene NextCourse-Gestaltung bleibt erkennbar; die Desktop-Ansicht wird nicht neu gestaltet.

Erfolg bedeutet nicht, jede Seite in einen Slider umzuwandeln. Jede öffentliche Seite erhält eine mobile Prüfung und eine passende Behandlung ihres Inhalts: Auswahlkarten werden wischbar, zusammenhängende Texte und Abläufe bleiben gut lesbar untereinander.

## Geltungsbereich

- Alle aktuell für Besucher vorgesehenen öffentlichen Astro-Seiten der Hauptwebsite: Startseite; Management, Academy und Operation; Angebots- und Demoseiten; Blogübersicht und Artikel; Über NextCourse; FAQ; Kontakt und Danke; Impressum, Datenschutz und 404. Gemeinsame Navigation und Footer gehören zur Prüfung jeder Route.
- Die bestehenden `/consulting/`-Adressen bleiben Weiterleitungen zu Management. Historische `/entwuerfe/`-Vergleichsseiten sind keine aktuelle Besucherführung und werden nicht umgestaltet.
- Das eigenständige Prompt Studio unter `/prompt-studio/`, sein geschützter Kundenbereich, die separate Kursplattform und das Demo-Handbuch gehören nach ausdrücklicher Nutzerentscheidung nicht zu dieser Runde.
- Bestehende Inhalte und Aussagen zu Preisen, Laufzeiten, Förderstatus und Zugangsschutz bleiben korrekt. Rechtstexte werden nicht redaktionell gekürzt. Keine Änderung an Formularziel, Authentifizierung, DNS oder Hosting.

## Gewählter Ansatz

Die bestehenden Astro-Komponenten erhalten eine gemeinsame mobile Layoutlogik, keine zweite Website. Das ist gezielter als ein einheitlicher Slider für alle Inhalte und risikoärmer als ein vollständiger visueller Neustart. Dunkelgrün, Warmweiß, Orange, Academy-Blau, Holzlogo, Illustrationen und Wellen bleiben erhalten. Bilder werden aus vorhandenen, thematisch passenden Assets verwendet; rechtliche oder rein funktionale Seiten erhalten keine dekorativen Pflichtbilder.

## Seitenfluss nach Seitentyp

### Startseite

Der mobile Einstieg zeigt das Logo in einer kompakteren Größe, die Kernbotschaft und einen eindeutigen Hauptweg zur Angebotsauswahl. Im ersten Bildschirm stehen höchstens eine kurze Nutzenzeile und eine primäre Aktion; der zweite Aktionsweg und der Porträtverweis bleiben danach erreichbar. Der Abschnitt mit Management, Academy und Operation beginnt spätestens nach dem ersten vertikalen Scroll. Wiederholte Einleitungen werden mobil nicht vor der Auswahl gezeigt. Die drei bestehenden Angebotskarten bleiben bildgeführt und direkt verlinkt.

### Bereichsübersichten

Auf `/management/`, `/akademie/` und `/operation/` folgen auf kleinen Bildschirmen Bereichskennung und Überschrift unmittelbar das vorhandene Titelmotiv. Kurzbeschreibung, Kontaktaktion und weitere Orientierung stehen danach. Es liegt kein langer Text- oder Buttonblock zwischen Überschrift und Motiv. Bei 390 × 844 CSS-Pixeln beginnt das Bild ohne Scrollen im ersten Bildschirm; bei längeren Überschriften bleibt der Abstand zur Bildoberkante dennoch kurz.

Die gleichrangigen Angebotskarten der Bereiche werden mobil horizontal wischbar. Jede Karte zeigt Bild, Angebotsname, eine kurze konkrete Nutzenzeile, gegebenenfalls einen wichtigen Status und einen direkten Link zur vollständigen Unterseite. Auf Desktop bleibt die bestehende Angebotsführung erhalten. Academy- und Operation-Zusatzformate werden nach demselben Auswahlprinzip behandelt, sofern sie mehrere gleichrangige Optionen darstellen.

### Angebots- und weitere Bildseiten

Die gemeinsame Detailseiten-Vorlage setzt auf Mobilgeräten bei vorhandenem Hero-Bild die Reihenfolge Überschrift → Bild → Kurztext und Aktionen. Das betrifft auch Blogartikel und bildgestützte Demo- bzw. Angebotsseiten. Lange Titel dürfen umbrechen, ohne das Bild durch Metadaten, Breadcrumbs oder Aktionsblöcke unnötig nach unten zu drängen. Die ausführlichen Leistungs-, Ablauf- und FAQ-Informationen bleiben vollständig auf den Unterseiten.

Die Über-Seite zeigt das vorhandene persönliche Bild nahe beim Einstieg statt erst nach einem langen Vorspann. Auf der Kontaktseite sollen Person und Kontaktmöglichkeit früh erkennbar sein, ohne dass das Formular hinter einer Bilderstrecke verschwindet.

### Lese-, Formular- und Sonderseiten

Die Blogübersicht bietet wischbare Artikelkarten; der Artikel selbst bleibt eine vertikale Leseseite mit leicht erreichbarem Inhaltsverzeichnis. FAQ-Antworten, Prozessschritte, Kontaktformular, Datenschutz und Impressum bleiben untereinander. Bei Seiten ohne sinnvolles Titelbild folgt der eigentliche Inhalt unmittelbar auf die Überschrift. Danke- und 404-Seite führen ohne Umwege zu ihrem nächsten sinnvollen Schritt.

## Regel für wischbare Karten

Jede vorhandene Kartengruppe wird nach derselben Regel geprüft und ihre Entscheidung im Umsetzungsplan festgehalten: Eine mobile Gruppe wird wischbar, wenn mindestens zwei gleichrangige Angebote, Artikel oder weiterführende Ziele zur Auswahl stehen. Abhängige Prozessschritte, Fließtext, Antworten und Formulare werden nicht horizontal versteckt. Die aktive Karte nutzt ungefähr 80–85 % der verfügbaren Breite; der Rand der nächsten Karte bleibt sichtbar. Eine Positionsanzeige sowie beschriftete Vor-/Zurück-Schaltflächen ergänzen die natürliche horizontale Wischbewegung. Es gibt weder Autoplay noch eine Wischgeste, die eine Navigation auslöst.

Die Technik nutzt natives horizontales Scrollen mit Scroll-Snap. Vertikales Seitenscrollen bleibt ungehindert. Alle Kartenlinks funktionieren ohne JavaScript; Schaltflächen und Positionsanzeige sind eine progressive Ergänzung. Tastaturfokus, Pfeiltasten, Screenreader-Bezeichnungen, mindestens 44 × 44 Pixel große Bedienelemente und reduzierte Bewegung werden berücksichtigt. Verborgene Desktop-Varianten dürfen nicht gleichzeitig im mobilen Fokuspfad auftauchen.

## Umsetzungsschnittstellen

- `HomeContent.astro`, `HomeServices.astro` und `home.css`: kompakter mobiler Einstieg und die bestehende Startseiten-Kartenleiste.
- `ServiceHero.astro`, `ServicePage.astro`, `ServiceJourney.astro`, `ServiceJourneyCard.astro` und `service-pages.css`: gemeinsame Bildreihenfolge und wischbare Bereichsangebote.
- `DetailLayout.astro`, `detail-pages.css` und betroffene Seitendateien: frühe Bilder oder unmittelbarer Inhalt auf Detail-, Blog-, Über-, Kontakt- und Sonderseiten.
- Ein kleiner gemeinsam nutzbarer Kartenleisten-Controller bündelt Positionsanzeige, Pfeile und Tastaturverhalten für die geeigneten Kartengruppen. Es wird keine zusätzliche Produktabhängigkeit eingeführt.

Die genaue Zuordnung jeder gerenderten Astro-Route zu einem Seitentyp wird im Umsetzungsplan festgehalten; nicht jede Route braucht eigenes Markup.

## Prüfung und Abnahme

- Alle öffentlichen Astro-Routen werden nach dem Build bei 320, 375, 390, 430, 768 und einer Desktop-Breite geprüft: kein unbeabsichtigter Seitenüberlauf, kein abgeschnittener Text, keine defekten Bilder oder verdeckten Aktionen.
- Bildseiten: Überschrift und Bild sind mobil benachbart; bei 390 × 844 beginnt das Hero-Bild im ersten Bildschirm. Textseiten: Überschrift und primärer Inhalt sind ohne unnötigen Vorspann erreichbar.
- Jede wischbare Kartengruppe wird auf erste, mittlere und letzte Karte, Pfeilgrenzen, Positionsanzeige, direkte Links, Tastaturbedienung, vertikales Seitenscrollen, fehlendes JavaScript und reduzierte Bewegung geprüft.
- Kontaktformular wird auf Lesbarkeit, Feldbedienung und Validierung geprüft, aber nicht real abgesendet. Rechtstexte und wichtige Konditionen werden auf unveränderte Vollständigkeit kontrolliert.
- Ein Browser mit simuliertem Viewport ersetzt keinen echten Gerätetest. Natürliches Wischen und Abstände sollten vor Veröffentlichung zusätzlich auf mindestens einem iOS- und einem Android-Gerät angesehen werden; falls das nicht geschieht, wird es offen als ungeprüft benannt.
- Vor jeder Übergabe laufen mindestens Produktionsbuild und vorhandene Tests. Zunächst entsteht eine lokale Vorschau. GitHub-Push und IONOS-Veröffentlichung sind eigene Schritte; für IONOS ist eine neue ausdrückliche Freigabe erforderlich.
