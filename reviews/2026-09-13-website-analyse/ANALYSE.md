# NextCourse – Website-Analyse und Arbeitsplan

**Prüfstand: 13. September 2026 · www.next-course.de · lokal dokumentiert**

Die Website besitzt inzwischen eine erkennbare eigene Gestaltung und eine brauchbare technische Grundlage. Ihre größte Schwäche ist die Orientierung: Neue Besucher müssen sich teilweise durch Claims, Auswahlkarten und weitere Erklärungen arbeiten, bevor sie eine Leistung konkret vergleichen können. Für die nächste Runde würde ich deshalb zuerst die Aussage und die Besucherwege schärfen. Die bestehende Bildsprache, das Holzlogo und die ruhigen Effekte können dabei erhalten bleiben.

Für die Auffindbarkeit fehlt kein einzelner „SEO-Schalter“. Entscheidend sind klar zugeordnete Leistungen, nachvollziehbare Erfahrung, öffentlich zugängliche Beispiele und eine verlässliche Messgrundlage. Einige technische Ergänzungen unterstützen das, ersetzen diese Arbeit aber nicht.

Diese Analyse enthält **Empfehlungen, keine bereits umgesetzten Änderungen**. Website-Dateien, Preise, Zugangsschutz und Live-Veröffentlichung wurden für diese Prüfung nicht verändert.

## 1. Was geprüft wurde – und was die Ergebnisse aussagen

Untersucht wurden die lokale Quelle und die erzeugten HTML-Dateien der Hauptwebsite, ergänzt durch öffentliche HTTP-Abfragen, Suchstichproben und Browserprüfungen der aktuellen Website. Die alten Screenshots aus der Unterhaltung dienen als Entwicklungskontext, nicht als Beleg für heute noch bestehende Fehler.

| Prüfumfang | Ergebnis beziehungsweise Grenze |
|---|---|
| Seitenbestand | 38 HTML-Dateien: 32 Inhalts-/Systemseiten und 6 alte Weiterleitungsseiten |
| Sitemap | 30 URLs; Danke- und Fehlerseite sind ausgenommen |
| Technische Seitendaten | Titel, Beschreibung, H1, Canonical, Robots, strukturierte Daten, lokale Verweise und Bildattribute geprüft |
| Öffentliche Auslieferung | 14 gezielte HTTP-Abfragen, einschließlich Weiterleitungen, Sitemap, Fehlerseite und geschützter Demo |
| Gestaltung und Bedienung | Repräsentative Desktopansichten und mobile Prüfung mit 390 × 844 Pixeln; Hauptbereiche, Handbuch, Über, Kontakt und Blogartikel |
| Suchmaschinen | Öffentliche Suchstichproben, keine vollständige Google-Indexauswertung und keine belastbare Rankingmessung |
| Nicht abgedeckt | Search Console, Bing Webmaster Tools, Unternehmensprofil-Verwaltung, Besucherstatistik, echte Anfragezahlen, Felddaten zur Ladeleistung, vollständige Barrierefreiheitsprüfung und ein physischer Handytest |

Ein leeres Ergebnis bei einer `site:next-course.de`-Suchstichprobe beweist **nicht**, dass Google keine Seiten indexiert hat. Ebenso beweist ein vorhandener Suchtreffer keine gute Sichtbarkeit für relevante Kundenfragen. Nach dem gerade erfolgten Relaunch wäre eine Aussage über dessen langfristigen Sucherfolg verfrüht.

Die Prüfung umfasst die Marketingwebsite. Kursplattform, Prompt Studio, Praxis-Hub und die geschützte Handbuchanwendung sind eigenständige Anwendungen; ihr vollständiger Funktionsumfang wurde hier nicht untersucht.

## 2. Was bereits gut funktioniert

**Die Marke ist wiedererkennbar.** Dunkelgrün, Orange, warmes Weiß, Serifenschrift und die Illustrationen ergeben einen zusammenhängenden Auftritt. Die unterschiedlichen Bereichsfarben helfen bei der Orientierung. Das persönliche Porträt verhindert, dass der gesamte Auftritt nur aus abstrakten Dienstleistungsbildern besteht.

**Die Texte versprechen überwiegend konkrete Entlastung.** Rückfragen, Übergaben, Unterlagen und Einarbeitung sind nachvollziehbare Situationen. Die zurückgenommene KI-Sprache passt zur gewünschten Positionierung im Gastgewerbe. Die Beispiele werden als fiktiv bezeichnet; das ist überzeugender als unbelegte Erfolgsgeschichten.

**Die zuletzt gewünschten Gestaltungskorrekturen sind vorhanden.** Die Kontaktblöcke sind in der geprüften Desktopansicht gleich groß. Das Profil besitzt wieder eine Rückseite. Angebotskarten lassen sich öffnen und zum Bild zurückschalten. Vorteile, Beispiele und Abläufe auf den Detailseiten sind inzwischen farblich stärker getrennt und kompakter. Die früheren sehr großen, nahezu gleichfarbigen Abschnitte sind deshalb nicht mehr der richtige Ausgangspunkt für die Bewertung.

**Die technische Basis ist ordentlich.** Alle 32 Inhalts-/Systemseiten besitzen einen eigenen Titel, eine eigene Beschreibung, genau eine H1 und einen Canonical. Die lokale Zielprüfung fand keine fehlenden internen Dateien. Bildattribute sind vorhanden; dekorative Bilder verwenden teilweise bewusst leere Alternativtexte. Responsive WebP-Bilder, festgelegte Bildmaße und lokal eingebundene Schriften sind gute Voraussetzungen.

## 3. Die wichtigsten Befunde nach Priorität

P1 bedeutet: vor zusätzlicher Bewerbung beziehungsweise beim nächsten gemeinsamen Durchgang zuerst klären. P2 verbessert Verständnis, Auffindbarkeit und Abschlusswahrscheinlichkeit. P3 ist anschließende Verfeinerung. Die Priorität ist eine fachliche Einschätzung, kein gemessener Umsatzverlust.

| Priorität | Befund | Bedeutung | Empfohlener nächster Schritt |
|---|---|---|---|
| P1 | „Demo öffnen“ führt beim Handbuch zu HTTP 401 / Anmeldung | Ein versprochener Einblick endet für neue Besucher ohne Zugang | Geschützten Zugang direkt am Link erklären und einen klaren Weg zur Demo-Anfrage anbieten |
| P1 | Drei vorbereitete Kursseiten stehen indexierbar in der Sitemap, sind aber nicht intern erreichbar | Sichtbarer Angebotsstand und veröffentlichter Seitenbestand passen nicht vollständig zusammen | Öffentlichkeitsstatus festlegen; vorerst nicht angebotene Seiten entsprechend aus der Suchveröffentlichung nehmen oder bewusst einordnen |
| P1 | Der Startbereich benennt die tatsächliche Arbeit zu spät | Neue Besucher verstehen die Marke eher als das Angebot | Einen sichtbaren, konkreten Erklärungssatz und einen eindeutigen nächsten Schritt ergänzen |
| P1 | Zustellung des Kontaktformulars nicht bis zum Postfach nachgewiesen | Der wichtigste Abschlussweg ist noch nicht vollständig geprüft | Später eine ausdrücklich abgestimmte Testanfrage einschließlich Empfang und Bestätigung durchführen |
| P2 | Management-, Operation- und teilweise Academy-Angebote überschneiden sich sprachlich | Die Auswahl benötigt zu viel Vorwissen | Eine einfache Zuordnung nach Anliegen, Ergebnis und Art der Zusammenarbeit erarbeiten |
| P2 | Auf allen Inhaltsseiten dasselbe ältere Vorschaubild | Geteilte Angebote und Artikel zeigen nicht ihren eigenen Inhalt | Aktuelle Vorschauen pro Angebot/Artikel; Artikeltyp und Bilddaten passend ausgeben |
| P2 | Erfahrung und Beispiele sind noch nicht ausreichend als Text erschlossen | Menschen und Suchsysteme erhalten weniger greifbare Belege | Berufsstationen konkretisieren, Gründungsgeschichte lesbar zusammenfassen, Demo-Ergebnisse in HTML erläutern |
| P2 | Mobile Seiten bleiben trotz kompakterer Karten lang | Der Weg zur relevanten Information kann sich ziehen | Wiederholungen abbauen, Inhaltsverzeichnis anfangs einklappen und direkte Kontaktwege früher anbieten |
| P2 | Sucherfolg ist bisher nicht mit Kontodaten belegt | Maßnahmen lassen sich schwer beurteilen | Search Console und Unternehmensprofil prüfen, Ausgangswerte dokumentieren |
| P3 | Breite CSS-Einbindung und laufende Hintergrundanimation | Mögliches Leistungs-/Wartungspotenzial | Erst messen; danach ungenutzte Gestaltung und unnötige Animationsarbeit gezielt reduzieren |

### Der Handbuchzugang ist kein Serverfehler

Die geschützte Demo ist ausdrücklich gewollt. Der öffentliche Abruf von [handbuch.next-course.de](https://handbuch.next-course.de/) lieferte eine Anmeldung mit Status 401. Auf Startseite und Angebotsdetail steht dagegen „Demo öffnen“; daneben wird nur der neue Tab erklärt. Das Problem ist die Erwartung vor dem Klick, nicht der Schutz selbst.

Eine passende Richtung wäre: **„Geschützte Demo ansehen – Zugang im Erstgespräch“** mit einem direkten Kontaktweg. Alternativ kann eine gesonderte, öffentlich freigegebene Vorschau die Anwendung zeigen. Zugangsdaten gehören nicht in die Website; das Entfernen der Anmeldung ist keine Voraussetzung für die Verbesserung.

## 4. Verständnis und Besucherführung

### Startseite: zuerst die Arbeit erklären

Das große Logo und „Mehr Zeit für das, was zählt“ transportieren Persönlichkeit und Nutzen. Für einen Erstbesucher bleibt jedoch offen, ob NextCourse Beratung, Software, Weiterbildung oder operative Unterstützung verkauft. „Für Hotels und Gastronomie in Mainfranken“ klärt die Zielgruppe, aber noch nicht die konkrete Leistung.

Ein möglicher Ergänzungssatz, als **Textvorschlag**:

> Wir helfen Hotels und Gastronomiebetrieben in Mainfranken, Abläufe zu ordnen, Mitarbeitende weiterzubilden und wiederkehrende Aufgaben abzugeben.

Der bestehende Claim kann darüber stehen. Darunter sollte eine Hauptaktion zum Gespräch oder zur passenden Leistung führen. Die drei Markenbereiche können bleiben, erhalten aber sofort verständliche Erklärungen. Die technisch vorhandene beschreibende H1-Ergänzung allein hilft dem sehenden Besucher nicht, wenn er sie nicht wahrnimmt.

Die Auswahl „Abläufe ordnen / Team stärken / Arbeit abgeben“ ist bereits ein guter Einstieg. Sie sollte als verständliche Orientierung stärker wirken als die englischen Bereichsnamen.

### Angebote: klare Unterschiede statt zusätzlicher Auswahlstufen

| Anliegen eines Betriebs | Passender Bereich | Verständliche Beschreibung |
|---|---|---|
| „Wir brauchen verlässliche Abläufe und zugängliches Wissen.“ | Management | Abläufe prüfen, Standards entwickeln und Veränderungen einführen |
| „Unser Team soll eine Aufgabe sicherer beherrschen.“ | Academy | Menschen schulen und die Anwendung im eigenen Betrieb üben |
| „Diese wiederkehrenden Aufgaben müssen zuverlässig erledigt werden.“ | Operation | Vereinbarte Arbeiten übernehmen und Ergebnisse liefern |

Besonders erklärungsbedürftig sind **Management-Umsetzungsprojekte gegenüber Operation-Projekten**, **Digital Audit gegenüber KI-Quick-Check** sowie **Seminarthema gegenüber Flying-Academy-Format**. Beispiel: Ein Digital Audit betrachtet das Zusammenspiel von Arbeitsabläufen und Systemen; ein KI-Quick-Check die bereits genutzten KI-Werkzeuge und die damit verbundenen offenen Fragen. Diese Unterschiede sind wertvoller als ein weiterer allgemeiner Nutzenclaim.

Die drehbaren Angebotskarten sind inzwischen eine bewusste Gestaltung. Sie müssen nicht entfallen. Auf der Vorderseite sollte aber neben Leistungstitel und Claim bereits **ein konkretes Ergebnis** stehen. Dann ist ein Vergleich möglich, ohne jede Karte zu öffnen. Die Rückseite erklärt Umfang und Eignung; „Zum Angebot“ bleibt eine klar getrennte Handlung. Die Inhalte sind im erzeugten HTML vorhanden – die Karten sind deshalb nicht pauschal „für Google unsichtbar“.

## 5. Gestaltung, Größen und mobile Nutzung

Die nächste Runde sollte die Informationshierarchie verbessern, nicht sämtliche Elemente verkleinern. Kleine Schrift spart zwar Platz, kann die Seite aber anstrengender machen. Der längere Eindruck entsteht heute vor allem durch wiederholte Einstiege, Claims, Leistungen, Abläufe, Fragen und Kontaktabschlüsse.

Für die bestehenden Farben würde ich eine klare Funktion beibehalten: Dunkelgrün für Einstieg und Belege, Weiß für längere Erklärungen, Orange für Angebot und Handlung, Salbeigrün als ruhige Lesefläche. Nicht jeder Abschnitt braucht gleichzeitig Wellen, Schatten, Animation und eine eigene Karte. Auf längeren Textseiten darf der Hintergrund ruhiger sein als auf der Startseite.

Die Illustrationen passen zusammen und erklären die Branche. Allerdings verwendet Operation für mehrere unterschiedliche Angebote sehr ähnliche Motive. Eine zusätzliche Abbildung des Ergebnisses – etwa einer strukturierten Gästemappe oder einer bearbeiteten Wochenplanung – würde die Unterschiede stärker zeigen. Solche Beispiele müssen als Muster gekennzeichnet bleiben, solange sie keine freigegebene Kundenarbeit darstellen.

Bei 390 × 844 Pixeln wurde auf den geprüften Seiten kein seitlicher Überlauf festgestellt. Als Orientierung wurden folgende Dokumenthöhen beobachtet, jeweils einschließlich der gemeinsamen Seitenbestandteile:

| Seite | Ungefähre mobile Gesamthöhe |
|---|---:|
| Startseite | 6.360 px |
| Management | 5.730 px |
| Betriebshandbuch | 6.560 px |
| Operation | 5.050 px |
| Academy | 5.200 px |
| Kontakt | 3.690 px |
| Über | 5.650 px |
| Geprüfter Blogartikel | 6.470 px |

Das sind **keine Ladezeiten und keine Qualitätsnoten**. Höhe allein ist kein Fehler. Sie zeigt aber, wo kürzere Entscheidungswege helfen könnten. Geöffnete Karten verändern die Länge zusätzlich.

Drei konkrete Verbesserungen: Das mobile Blog-Inhaltsverzeichnis sollte zunächst geschlossen sein und der Sprung „Zum Artikel“ direkt zum Text führen. Telefon und Terminwahl sollten auf Kontakt bereits vor dem langen Formular erreichbar sein. Die linke Scrolllinie der Angebotskarten sollte mobil möglichst wenig Lesebreite beanspruchen. Die Rückkehr vom Text zum Bild funktioniert in der geprüften Bedienung; ein echter Wischtest auf einem physischen Telefon steht noch aus.

## 6. Durchgang durch die einzelnen Seitenbereiche

| Seite/Bereich | Bewertung und konkrete nächste Verbesserung |
|---|---|
| **Startseite** | Eigenständig und sympathisch. Die angebotene Arbeit früher benennen; Entscheidung zwischen den drei Bereichen erleichtern; geschützten Demo-Zugang erklären. |
| **Management** | Handbuch, Gästeerlebnis und digitale Abläufe ergeben einen nachvollziehbaren Bereich. Bei jeder Karte Eignung und Ergebnis schon vorne erkennbar machen. Umsetzung gegen Operation abgrenzen. |
| **Digitales Betriebshandbuch** | Stärkstes greifbares Kernangebot. Ein Beispiel „So findet eine neue Kollegin den Standard zur Zimmerfreigabe“ würde Inhalt, Anwendung und Nutzen verbinden. Einrichtung, spätere Pflege und Zuständigkeiten kompakt zusammenführen. Demo-Weg klären. |
| **Mystery Check** | Gästeweg und priorisierte Maßnahmen sind gut beschrieben; Musterbericht ist ein sinnvoller Beleg. Pilotpreis 950 € braucht eine eindeutige Preisbasis und klare Einordnung möglicher Zusatzaufwendungen. Umfang der Demo von individuellem Auftragsumfang unterscheiden. |
| **Digital Audit** | Konkrete Alltagssituationen statt abstrakter Digitalisierung sind gelungen. Ein vollständiges Beispiel von Beobachtung über Ursache zur Maßnahme ergänzen. Klar sagen, was im Audit enthalten ist und wann eine separate Umsetzung beginnt. |
| **Management-Umsetzungsprojekte** | Festgelegter Umfang und Übergabe sind verständlich. Zwei bis drei tatsächlich angebotene Vorhaben würden mehr Orientierung geben; Abgrenzung zu Operation-Projekten sichtbar machen. |
| **KI-Quick-Check** | Sinnvolle Bestandsaufnahme, aber tiefer in der Seitenstruktur. Als Spezialfall zum passenden Angebot verlinken; keine zusätzliche vierte Hauptkategorie daraus machen. |
| **Zeitpotenziale / Referenzbetrieb** | Offene Annahmen und Planungsbeispiel sind gut. Die historische URL „referenzbetrieb“ darf nicht den Eindruck eines belegten Kundenresultats erzeugen. Sichtbare Kennzeichnung als Planungsbeispiel erhalten. Eine URL-Änderung ist nicht vorrangig. |
| **Operation** | „Arbeit abgeben“ ist verständlich. Früher konkrete Arbeitsergebnisse nennen, die NextCourse übernimmt. Der Bereich sollte nicht wie eine unspezifische Mischung aus Assistenz, Marketing und Eventagentur wirken. |
| **30-Tage-Test** | Umfang und Abschluss ohne automatische Verlängerung machen den Einstieg greifbar. „Preis auf Anfrage“ entspricht der Vorgabe und bleibt richtig. Die enthaltenen Aufgaben sollten klar zum späteren Leistungspaket führen. |
| **Monatspakete** | Preise, Einrichtung und Laufzeit sind vorhanden. Monatspreis, einmalige Einrichtung, Mindestlaufzeit und enthaltenes Arbeitspensum nebeneinander vergleichen lassen. Die „ab“-Bedingungen verständlich machen. |
| **Operation-Projekte & Events** | Gute Anlässe wie Saisonaktion oder Gästemappe. Mit konkreten Endergebnissen und Übergabe erklären; Prozess-/Systemeinführung dem Management zuordnen. |
| **Academy** | Heller Einstieg und eigener Mittelbereich unterscheiden Weiterbildung gut. Inhalt, Lernformat und Verfügbarkeit getrennt erläutern: Was lerne ich, wo und in welchem Rahmen? |
| **KI-Grundlagen** | Praxisbezug, Einstieg ohne Vorwissen und dokumentierte Teilnahme sind verständlich. An einem Beispiel zeigen, was Teilnehmende anschließend selbst können. Keine pauschale Garantie einer rechtlichen Absicherung ableiten. |
| **Flying Academy** | „Wir kommen zu Ihnen“ ist ein gutes Unterscheidungsmerkmal. Eignung für ein Team, Abstimmung der Inhalte und organisatorischen Ablauf konkreter machen; kein Konkurrenzangebot zum gleichen Seminarthema suggerieren. |
| **Förderung** | Vorbereitungsstand wird eingeordnet. Gegenwärtig verfügbare und erst geplante Fördermöglichkeiten weiterhin sauber auseinanderhalten; keine AZAV-Verfügbarkeit versprechen, die noch nicht besteht. |
| **AEVO, Barista, Führen mit KI** | Vorbereitete Seiten sind indexierbar und in der Sitemap, im internen Linkgraph aber nicht erreichbar. Veröffentlichung bewusst entscheiden. Bei Barista klingt die Meta-Beschreibung bereits wie ein verfügbares Angebot; gegebenenfalls an den Vorbereitungsstand angleichen. |
| **Über** | Persönliches Porträt und Branchenerfahrung tragen Vertrauen. Die Bildrückseite enthält vor allem Abschlüsse, aber keine nachvollziehbare Folge beruflicher Stationen. Einige echte Rollen/Stationen mit Zeitraum ergänzen. Audio-Geschichte zusätzlich als lesbaren Text anbieten. |
| **Kontakt** | Die beiden Blöcke sind auf Desktop gleich groß; dies muss nicht erneut korrigiert werden. Mobil Direktkontakt früher zeigen. Empfang der Formularnachricht einschließlich Dankeseite einmal vollständig testen. |
| **Blogübersicht** | Die neuen Bilder passen zum Auftritt. Drei Beiträge sind übersichtlich; eine zusätzliche Filteroberfläche wäre derzeit unnötig. Pro Beitrag eine konkrete Leserfrage und den erwarteten Nutzen verdeutlichen. |
| **Artikel: Entlastung im Team** | Verständlicher Einstieg. Eine direkt nutzbare Wochenbeobachtung oder ein Vorher-/Nachher-Beispiel macht aus allgemeinen Hinweisen eine eigenständige Arbeitshilfe. |
| **Artikel: Telefonassistenz** | Gute Orientierung an Abläufen. Eine Aufgabenmatrix „automatisierbar / Übergabe an Mitarbeitende / Ausnahmefall“ und ein Beispielgespräch würden die Entscheidung erleichtern. KI nur dort in Titel und Text hervorheben, wo dies der tatsächliche Inhalt ist. |
| **Artikel: KI-Kompetenz** | Quellenverweise und vorsichtige Aussagen sind positiv. Ein konkretes Lernbeispiel und ein kurzer Check für Verantwortliche schaffen mehr praktischen Wert. Regelungsbezogene Aussagen bei späterer Überarbeitung erneut anhand der Primärquellen prüfen. |
| **Mystery-/Audit-Demo** | Sichtbarer Arbeitsnachweis mit klar fiktivem Betrieb. Berichtseiten werden als Bilder gezeigt; ein exemplarischer Befund, seine Bedeutung und die empfohlene Maßnahme sollten zusätzlich im normalen Seitentext stehen. |
| **FAQ** | Die Antworten erklären die drei Bereiche teilweise klarer als die Einstiege. Diese Formulierungen früher im Besucherweg nutzen; FAQ als Vertiefung behalten. |
| **Impressum, Datenschutz, Danke, 404** | Technisch vorhanden und entsprechend eingebunden. Danke/404 sind von der Indexierung ausgenommen. Keine vollständige rechtliche Inhaltsprüfung Bestandteil dieses Audits. |

## 7. SEO: technische Auffindbarkeit und passende Suchabsichten

### Technischer Befund

Die Stichproben zu HTTP → HTTPS, zur bevorzugten www-Adresse und einer alten Consulting-URL ergaben permanente Weiterleitungen. Eine absichtlich nicht vorhandene URL antwortete mit echtem 404. Die Hauptseite, Robots-Datei und Sitemap waren öffentlich erreichbar. Es wurde keine allgemeine Indexierungssperre der Hauptwebsite festgestellt.

Die Adresse `/management/index.html` antwortet zusätzlich mit 200, verweist aber per Canonical auf `/management/`. Eine direkte Weiterleitung wäre sauberer; dies ist eine nachrangige Bereinigung, kein Beleg für eine Suchmaschinenstrafe.

Die drei vorbereiteten Kursseiten sind die auffälligste Inkonsistenz. „Nicht im Menü“ bedeutet nicht „nicht veröffentlicht“, wenn Dateien und Sitemap öffentlich bereitliegen. Noindex und Sitemap-Ausschluss können bei bewusst zurückgestellten Seiten sinnvoll sein. Sie ersetzen keinen Zugangsschutz, falls Inhalte tatsächlich privat sein sollen.

### Suchabsichten den vorhandenen Seiten zuordnen

Die folgenden Formulierungen sind **inhaltliche Arbeitshypothesen, keine ermittelten Suchvolumina**. Bestehende URLs haben Vorrang vor vielen neuen, ähnlichen Orts- und Keywordseiten.

| Suchanliegen | Geeignete Seite | Was die Seite dazu konkret beantworten sollte |
|---|---|---|
| Unterstützung für Hotel/Gastronomie in Würzburg oder Mainfranken | Startseite, Management, Über, Kontakt | Wer unterstützt welche Betriebe, wobei und in welcher Region? |
| Digitales Betriebshandbuch / Hotelstandards / Einarbeitung | Betriebshandbuch | Inhalt, Einführung, Pflege, Anwendung und Beispiel |
| Mystery Check für Hotel oder Restaurant | Mystery Check | Besuchsszenario, Auswertung, Grenzen, Preisrahmen und Ergebnis |
| Digitale Abläufe im Hotel verbessern | Digital Audit | Untersuchte Abläufe, Vorgehen, Bericht und anschließende Umsetzung |
| Backoffice oder laufende Unterlagen auslagern | Operation, Monatspakete | Aufgaben, Lieferumfang, Abstimmung, Preis und Laufzeit |
| Inhouse-Schulung für Hotel-/Gastronomieteams | Flying Academy | Zielgruppe, Lernziele, betriebliche Abstimmung und Format |
| KI-Grundlagen für Gastgeber | KI-Grundlagen | Können nach der Schulung, Voraussetzungen und praktisches Beispiel |
| Mitarbeitende entlasten / Telefonassistenz / KI-Kompetenz | Jeweiliger Blogartikel | Eine konkrete Frage vollständig beantworten und sinnvoll zum Angebot weiterführen |

„Hotelberatung“ kann auch betriebswirtschaftliche Sanierung, Finanzierung oder Verkaufsberatung meinen. Diese Suchbegriffe sollten deshalb nur so weit verwendet werden, wie sie die tatsächliche Leistung treffen. Eine große Reichweite mit falschen Erwartungen wäre kein Fortschritt.

### Vorschauen und strukturierte Daten

Alle 32 Inhalts-/Systemseiten verwenden aktuell dasselbe `/og.jpg`. Es trägt noch den früheren Claim „Menschliche Kompetenz. Digitale Kraft.“ Auch die Blogartikel geben `og:type=website` aus. Das neue warme Artikelbild erscheint auf der Seite, wird aber nicht als individuelles Social-Vorschaubild ausgegeben. Hier lohnt eine gezielte Aktualisierung für Teilen, Wiedererkennung und eindeutige Zuordnung.

Organization-Daten sind bereits vorhanden, einschließlich Adresse, Kontakt und Gründer. Das Personenprofil von Philip Tolle steht jedoch zugleich als `sameAs` der Organisation; das sollte der Person zugeordnet werden. Ein eigenes Logo, feste Kennungen und konsistente Verbindungen zwischen Organisation, Autor und Seiten würden die Angaben präzisieren. [Google: Organization-Daten](https://developers.google.com/search/docs/appearance/structured-data/organization)

Die drei Artikel besitzen bereits Article-Daten und Datumsangaben. Ergänzbar sind das tatsächliche Artikelbild, eine Autorenseite und die eindeutige Verbindung zum Herausgeber. Breadcrumbs können die Seitenhierarchie zusätzlich beschreiben. Solche Angaben müssen zum sichtbaren Inhalt passen; sie garantieren keine besondere Suchdarstellung. [Google: Article-Daten](https://developers.google.com/search/docs/appearance/structured-data/article)

### Regionale Sichtbarkeit und Vertrauen außerhalb der Website

Die öffentliche Mitgliederseite der Wirtschaftsjunioren Würzburg nennt **Philip Tolle / NextCourse**. Das ist ein nachvollziehbarer externer Bezug zwischen Person, Unternehmen und Region. Daraus lässt sich weder eine Empfehlung des Verbands noch ein Ranking ableiten. [Mitgliederseite der Wirtschaftsjunioren Würzburg](https://www.wj-wuerzburg.de/ueber-uns/mitglieder/)

Als nächster Schritt sind Name, Website, Angebot, Kontaktdaten und gegebenenfalls Unternehmensprofil konsistent zu prüfen. Ob ein Google-Unternehmensprofil vorhanden, verifiziert und richtig eingerichtet ist, wurde hier nicht nachgewiesen. Echte Empfehlungen und sachlich passende Branchenverbindungen können helfen; austauschbare Verzeichniseinträge und erfundene Erwähnungen sind kein Ersatz. Google nennt für lokale Ergebnisse insbesondere Relevanz, Entfernung und Bekanntheit. [Google: lokale Platzierung](https://support.google.com/business/answer/7091)

Eine kleine Anbieterstichprobe zeigt außerdem, wie wichtig die Angebotskonkretisierung ist: Der [Digital-Check der HOGA München](https://www.hoga-muenchen.de/leistungen/digital-check/?L=0) erläutert Vorgehen und Ergebnis, während [Bräu Innovation](https://braeu-innovation.de/) Branchenerfahrung hervorhebt. Das sind Vergleichsimpulse für Darstellung und Vertrauen, keine ermittelte Rangfolge der direkten Wettbewerber.

## 8. GEO: in KI-Antworten verständlich und belegbar werden

Für NextCourse verstehe ich GEO als die Arbeit daran, dass Such- und Antwortsysteme **das Unternehmen, die Leistungen und belastbare Aussagen dazu korrekt erkennen und gegebenenfalls zitieren können**. Eine Nennung in ChatGPT oder einer Google-KI-Antwort kann nicht garantiert werden.

Die Robots-Datei erlaubt bereits OAI-SearchBot sowie weitere Suchcrawler. GPTBot ist gesperrt. Diese Unterscheidung ist sinnvoll: OpenAI beschreibt Suchzugriff und mögliche Trainingsnutzung getrennt. Eine Trainingsfreigabe ist nicht nötig, um den bereits erlaubten Suchzugriff zu erhalten. [OpenAI: Publisher-FAQ](https://help.openai.com/en/articles/12627856)

Google betont für seine KI-Suche weiterhin die üblichen SEO-Grundlagen und eigenständige, hilfreiche Inhalte. Eine `llms.txt`, besondere KI-Schreibweisen oder ein spezielles Schema sind dafür nicht erforderlich. Deshalb steht eine solche Datei nicht auf der vorrangigen Aufgabenliste. [Google: Optimierung für generative KI-Suche](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Der praktisch größte Gewinn liegt bei NextCourse in vier Punkten:

1. **Eindeutige Leistungsbeschreibungen.** Je Angebot klar sagen: für wen, bei welchem Problem, welche Arbeit, welches Ergebnis und welcher nächste Schritt. Keine künstliche Keywordhäufung.
2. **Eigene Erfahrung sichtbar machen.** Philip Tolles berufliche Stationen und die Verbindung zu den angebotenen Leistungen erklären. Nur bestätigte Rollen, Abschlüsse und Erfahrungen verwenden.
3. **Arbeitsbelege lesbar anbieten.** Bei Musterberichten einen vollständigen Gedankengang auch als HTML zeigen. Die derzeitigen Berichtsseiten sind überwiegend Bilder mit kurzen Zusammenfassungen. Die PDFs bleiben als Downloads sinnvoll; ihre Suchauswertung wurde nicht vollständig untersucht.
4. **Wiedererkennbare Unternehmensdaten.** Personenprofil, Organisation, regionale Angaben und externe Profile korrekt miteinander verbinden. Gleichnamige andere Angebote machen diese Zuordnung besonders nützlich.

Ein späteres Beispiel könnte erklären, wie eine unklare Zimmerfreigabe zu Rückfragen führt, welche Information an welcher Stelle fehlt und wie ein vereinbarter Standard aussehen kann. Es muss als Muster gekennzeichnet sein, solange es nicht aus einer freigegebenen Kundenarbeit stammt. Solche nachvollziehbaren Inhalte dienen zuerst dem Leser und eignen sich gleichzeitig besser als Beleg als ein allgemeines Versprechen von Zeitersparnis.

Die Audio-Gründungsgeschichte ist dafür ebenfalls ein guter Ausgangspunkt. Eine kurze, echte Zusammenfassung oder ein Transkript erschließt sie Menschen, die nicht hören können oder gerade keinen Ton nutzen möchten. Der Inhalt sollte aus der Aufnahme übernommen und nicht aus der Überschrift erfunden werden.

## 9. Leistung, Bedienbarkeit und Messung

Die Homepage wurde in einer öffentlichen Stichprobe komprimiert mit rund 8,3 kB HTML übertragen; der erzeugte Quelltext umfasst rund 25,5 kB. Das ist keine Messung der vollständigen Seite. Bilder, CSS, Schriften und Skripte kommen hinzu.

Je nach geprüfter Seite werden ungefähr 93–115 kB unkomprimiertes CSS referenziert. Ein gemeinsames Stylesheet enthält auch ältere Gestaltungsregeln. Das rechtfertigt eine spätere Prüfung auf ungenutzte Regeln, aber noch kein pauschales Löschen. Die Anzahl importierter Font-Regeln ist ebenfalls nicht gleich der Zahl tatsächlich heruntergeladener Schriftdateien.

Die Wellenanimation läuft über wiederkehrende Zeichenoperationen; reduzierte Bewegung wird bereits berücksichtigt. Auf schwächeren Geräten könnte eine ruhigere oder pausierende Variante Energie und Rechenarbeit sparen. **Ein messbarer Lade- oder Reaktionsfehler ist damit noch nicht nachgewiesen.** Für eine Entscheidung fehlen Core-Web-Vitals-Felddaten und eine kontrollierte Leistungsmessung.

Die geprüften Karten und das Mobilmenü lassen sich bedienen. Fokuszustände und alternative Darstellung ohne JavaScript sind im Quelltext berücksichtigt. Nicht geprüft wurden eine vollständige Screenreader-Nutzung, sämtliche Kontrastkombinationen, alle Vergrößerungsstufen und echte Touch-Gesten. Das ist ein gezielter nächster Qualitätsschritt, keine Aussage, dass die Website bereits vollständig barrierefrei sei.

Für die anschließende Wirkungskontrolle sollte eine kleine Ausgangsmessung genügen:

| Bereich | Sinnvolle Messgröße | Wofür sie dient |
|---|---|---|
| Indexierung | Gewünschte URLs indexiert, ausgeschlossene URLs, Sitemap-Verarbeitung | Veröffentlichten Bestand mit Suchbestand abgleichen |
| Suchnachfrage | Impressionen und Klicks je Seite und Suchanliegen; Marke getrennt von allgemeinen Fragen | Erkennen, welche Angebote tatsächlich gefunden werden |
| Kontakt | Abgesendete und empfangene Anfragen, Terminabschlüsse | Erfolg statt bloßer Buttonklicks beurteilen |
| Besucherwege | Angebot → Details, Demo-Anfrage, Kontakt | Unnötige Umwege erkennen |
| KI-Verweise | Erkennbare Zugriffe aus Antwortsystemen und verfügbare Suchberichte | Beobachten, ohne daraus eine vollständige Zitationsquote abzuleiten |
| Mobile Qualität | Feld-/Labormessung wichtiger Seitentypen und reale Bedienung | Engpässe vor gezielter Optimierung identifizieren |

Die vorhandenen Konten und verfügbaren Berichte sollten zuerst geprüft werden. Für spätere Änderungen jeweils Datum und betroffene Seiten festhalten; nach wenigen Stunden lässt sich kein sinnvoller SEO-Vergleich ziehen. Die wichtigen Zahlen sind qualifizierte Anfragen und passende Suchzugriffe, nicht eine frei vergebene „GEO-Punktzahl“.

## 10. Reihenfolge für unseren gemeinsamen Durchgang

| Schritt | Gemeinsam bearbeiten | Woran wir die Verbesserung erkennen |
|---|---|---|
| **1. Startseite und Leistungsversprechen** | Konkreter Erklärungssatz, Rolle der drei Bereiche, Hauptaktion, Demo-Zugang | Ein neuer Besucher kann Angebot, Zielgruppe und nächsten Schritt in eigenen Worten wiedergeben |
| **2. Management und Betriebshandbuch** | Klare Vorderseiten, sinnvolle Rückseiten, Ergebnisbeispiel, geschützte Demo | Die Leistungen lassen sich vergleichen; der Weg zur Demo ist verständlich |
| **3. Weitere Management-Angebote** | Mystery Check, Audit, Umsetzung und Quick-Check voneinander abgrenzen | Für ein konkretes Anliegen ergibt sich ein passender Einstieg |
| **4. Operation** | Test, Pakete und Einzelprojekte vergleichen; Leistung, Preisbasis und Laufzeit gemeinsam zeigen | Ein Interessent versteht Umfang und Art der Bindung vor der Anfrage |
| **5. Academy** | Themen und Formate trennen; öffentlichen Vorbereitungsstand bereinigen | Nur bewusst veröffentlichte Angebote erscheinen in Navigation und Suchbestand |
| **6. Über und Kontakt** | Echte Stationen, lesbare Geschichte, mobile Direktwege, abgestimmter Zustelltest | Vertrauen wird konkreter und eine Anfrage kommt nachweislich an |
| **7. Blog und Beispiele** | Zuerst einen Artikel als Muster vertiefen; mobiles Inhaltsverzeichnis; Demo-Beispiel in HTML | Der Artikel bietet eine unmittelbar nutzbare Hilfe und einen passenden Anschluss |
| **8. Gemeinsamer Technikabschluss** | Vorschauen, strukturierte Daten, Metadaten, Suchkonten, Leistung und abschließende Bedienprüfung | Gewünschte Seiten, Suchsignale und Besucherwege sind konsistent überprüft |

Die technischen Punkte aus Schritt 8 können während der jeweiligen Seitenrunde lokal vorbereitet werden. Eine neue Veröffentlichung folgt erst auf den gewünschten gemeinsamen Durchgang. Preise werden dabei nicht neu festgelegt; insbesondere bleibt der 30-Tage-Test bei „Preis auf Anfrage“.

## 11. Belege und Ansatzpunkte im Projekt

Die vollständige Seitenliste steht im [Seiteninventar](<seiteninventar.csv>). Rohbefunde sind in [inventory.json](<inventory.json>), die öffentlichen Statusprüfungen in [http-checks.json](<http-checks.json>) und Ressourcenangaben in [resource-checks.json](<resource-checks.json>). Die extrahierten Seitentexte stehen in [page-texts.txt](<page-texts.txt>).

| Gegenstand | Lokaler Ansatzpunkt für die spätere Umsetzung |
|---|---|
| Allgemeine Metadaten und Organisation | [Base.astro](<../../src/layouts/Base.astro>) |
| Startseite | [HomeContent.astro](<../../src/components/HomeContent.astro>) |
| Öffentlicher Handbuch-Einstieg | [HandbookGateway.astro](<../../src/components/HandbookGateway.astro>) und [OfferPage.astro](<../../src/components/OfferPage.astro>) |
| Angebotstexte | [detail-offers.ts](<../../src/data/detail-offers.ts>) und [service-pages.ts](<../../src/data/service-pages.ts>) |
| Vorder-/Rückseiten | [ServiceJourneyCard.astro](<../../src/components/ServiceJourneyCard.astro>) |
| Beruflicher Hintergrund | [ProfileCard.astro](<../../src/components/ProfileCard.astro>) und [ueber.astro](<../../src/pages/ueber.astro>) |
| Kontakt | [kontakt.astro](<../../src/pages/kontakt.astro>) |

Die Rohprüfung führt fehlende H1/Beschreibungen auch für die sechs Weiterleitungsdateien auf. Diese sind keine normalen Inhaltsseiten und werden hier ausdrücklich nicht als entsprechende SEO-Fehler gewertet. Die Wortzahlen im Inventar sind Näherungen aus dem Seiteninhalt und kein Maß für redaktionelle Qualität.
