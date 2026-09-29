# Startseiten-Entwürfe · 12. September 2026

Nutzerauftrag: Die Bereiche „Frisch aus der Praxis“ und „Was gerade bei uns läuft“ von der Startseite nehmen und drei unterschiedliche, inspirierende Weiterentwicklungen mit stärkerer Marketingwirkung zeigen.

Die aktuelle `src/components/HomeContent.astro` enthält beide Bereiche bereits nicht mehr. Deshalb wurde dort nichts zusätzlich entfernt. Blog und bestehende Angebotsseiten bleiben erreichbar.

Die drei neuen, voneinander getrennten Designstudien liegen unter `src/components/home-concepts/` und verwenden nur das isolierte Stylesheet `src/styles/home-concepts.css`.

Lokale Übersicht: `/entwuerfe/`

1. `/entwuerfe/1/` — Marke mit Strahlkraft: asymmetrischer Einstieg, großes Holzlogo, Dunkelgrün und Orange, Nutzenversprechen vor Unternehmensbeschreibung.
2. `/entwuerfe/2/` — Gastlichkeit als Haltung: großzügiger Magazinlook, Serifenschrift, warme helle Flächen, emotionale Bildgeschichte und persönlicher Kontakt.
3. `/entwuerfe/3/` — Mehr Luft im Alltag: orangefarbener Auftakt, persönlicher Ansprechpartner, interaktive Leistungsauswahl nach Alltagssituation.

Die Auswahl in Variante 3 funktioniert per Tastatur und ist progressiv erweitert: Ohne JavaScript bleiben alle drei Leistungsbeschreibungen sichtbar und über Sprunglinks erreichbar. Die anderen Links führen zu vorhandenen Angebots- und Kontaktseiten. Kein Formularversand.

Die einzige Vorschau-Route ist `src/pages/entwuerfe/[...variant].astro`. `getStaticPaths()` gibt im Produktionsmodus keine Routen aus. Dadurch entstehen weder Entwurfsseiten noch Sitemap-Einträge für den Live-Upload. Alle Entwürfe tragen zusätzlich `noindex, nofollow`.

Das Hotelmotiv in Variante 2 stammt aus dem vorhandenen lokalen Entwurf und ist sichtbar als illustratives Motiv gekennzeichnet. Es ist kein echter Kunden- oder Mitarbeiterbeleg. Der in `src/assets/landing/README.md` dokumentierte Status gilt weiterhin. Logo und Philip-Porträt stammen aus der bestehenden Website.

Es wurde keine Variante als neue Hauptstartseite ausgewählt und keine Veröffentlichung auf IONOS ausgelöst. Für die nächste Runde Empfehlung: Markenbühne aus 1 mit der Besucherführung aus 3 verbinden; endgültige Auswahl nach Nutzerfeedback.
