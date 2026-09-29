# NextCourse Website

Offizielle Website der NextCourse UG (haftungsbeschränkt) — KI-Beratung, Bildung und
Begleitung für das Gastgewerbe in Mainfranken. Gebaut mit [Astro](https://astro.build).

## Betrieb und Veröffentlichung

- Live-Website: [www.next-course.de](https://www.next-course.de)
- Hosting: IONOS, Webroot `/public/nextcourse`
- GitHub dient als Versionsverwaltung und Sicherung des Quellcodes.
- GitHub Pages ist deaktiviert. Ein Push zu GitHub veröffentlicht die Website **nicht**.
- Ein IONOS-Deployment erfolgt separat und nur nach einer ausdrücklichen Freigabe.

## Entwicklung

Für die Übergabe an einen weiteren KI-Agenten zuerst
[`AGENTS.md`](AGENTS.md) und [`docs/AI-UEBERGABE.md`](docs/AI-UEBERGABE.md) lesen.

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:4321
npm run build      # Statischer Build nach dist/
npm run preview    # Build lokal testen
```

## Struktur

- `src/layouts/Base.astro` — Grundgerüst (Head, Fonts, Ambient-Canvas, Header, Footer)
- `src/components/` — Header (Nav + Mobil-Overlay), Footer
- `src/pages/` — Seiten für Management, Akademie, Operation und die allgemeinen Inhalte
- `src/styles/global.css` — komplettes Design-System (Boutique-Hotel-Ästhetik, Glas, gedämpfte Farben)
- `src/assets/` — Bilder, werden von Astro beim Build optimiert (WebP)

Schriften (Marcellus, Jost, Cormorant Garamond) sind über Fontsource **lokal** eingebunden — kein
Google-Fonts-CDN, DSGVO-konform.

**Hinweis:** Die npm-Skripte rufen Astro plattformunabhängig direkt über Node auf.

## Status und offene Punkte

- [x] Porträt auf „Über“ (weitere Fotos folgen)
- [x] Impressumsdaten (Adresse, HRB, Telefon)
- [x] Datenschutzerklärung (vor Domain-Livegang nochmal gegen Generator/Anwalt prüfen)
- [x] Formular-Backend (FormSubmit — aktiviert und getestet)
- [x] Terminbuchung (Cal.com-Link: https://cal.com/philip-tolle-yxp7ih/erstgesprach)
- [ ] LinkedIn-Link im Footer (URL fehlt noch)
- [x] Produktivbetrieb bei IONOS unter `https://www.next-course.de`
- [x] GitHub Pages und automatisches Pages-Deployment entfernt
