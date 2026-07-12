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

- [x] Porträt auf „Über“ (weitere Fotos folgen)
- [x] Impressumsdaten (Adresse, HRB, Telefon)
- [x] Datenschutzerklärung (vor Domain-Livegang nochmal gegen Generator/Anwalt prüfen)
- [x] Formular-Backend (FormSubmit — aktiviert und getestet)
- [x] Terminbuchung (Cal.com-Link: https://cal.com/philip-tolle-yxp7ih/erstgesprach)
- [x] LinkedIn-Link im Footer (https://www.linkedin.com/in/philiptolle/, auch als sameAs in den strukturierten Daten)
- [x] Deployment: GitHub Pages (https://philip-tolle.github.io, Auto-Deploy bei Push)
- [ ] Domain anschließen (dann: site-URL in astro.config + robots.txt + Formular-_next ändern)
