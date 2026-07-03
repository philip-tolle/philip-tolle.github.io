# NextCourse Website

Offizielle Website der NextCourse UG (haftungsbeschränkt) — KI-Beratung, Bildung & Begleitung
für das Gastgewerbe in Mainfranken. Gebaut mit [Astro](https://astro.build), Design-Referenz:
Prototyp V7 (`../nextcourse-website-v7.html`).

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:4321
npm run build      # Statischer Build nach dist/
npm run preview    # Build lokal testen
```

## Struktur

- `src/layouts/Base.astro` — Grundgerüst (Head, Fonts, Ambient-Canvas, Header, Footer)
- `src/components/` — Header (Nav + Mobil-Overlay), Footer
- `src/pages/` — eine Datei pro Seite (Start, Beratung, Kurse, Begleitung, Über, Kontakt, Impressum, Datenschutz)
- `src/styles/global.css` — komplettes Design-System (Boutique-Hotel-Ästhetik, Glas, gedämpfte Farben)
- `src/assets/` — Bilder, werden von Astro beim Build optimiert (WebP)

Schriften (Marcellus, Jost, Cormorant Garamond) sind über Fontsource **lokal** eingebunden — kein
Google-Fonts-CDN, DSGVO-konform.

**Hinweis:** Die npm-Skripte rufen `node node_modules/astro/astro.js` direkt auf statt `astro`,
weil das `&` im lokalen Pfad („Second Brain & Projekte") die von npm generierten `.cmd`-Shims
unter Windows zerbricht. Nach einem Umzug in einen Pfad ohne `&` wäre auch `astro dev` möglich.

## Offene Punkte vor Livegang

- [ ] Echte Fotos (Porträt auf „Über“)
- [ ] Impressumsdaten (Adresse, HRB, Telefon)
- [ ] Datenschutzerklärung (Generator/Anwalt)
- [ ] Formular-Backend (aktuell nur Hinweis mit Mail-Adresse)
- [ ] LinkedIn-Link im Footer
- [ ] Deployment: GitHub-Repo + IONOS Deploy Now
