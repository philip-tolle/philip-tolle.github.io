# Übergabe an einen weiteren KI-Agenten

Stand: 29. September 2026

## Sofortstart

Öffne ausschließlich diese kanonische Arbeitskopie:

```text
C:\NextCourse Website -Projekte\nextcourse-site
```

Lies danach `AGENTS.md` und `README.md`. Prüfe vor Änderungen:

```powershell
git fetch origin --prune
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

Der konkrete Commit ändert sich mit jeder Weiterentwicklung. Maßgeblich ist deshalb
nicht ein hier eingetragener Hash, sondern dass der neue Arbeitsstand vom aktuellen
`origin/main` ausgeht und `HEAD` vor der Übergabe mit `origin/main` übereinstimmt.

## Betrieb

- Öffentliche Website: `https://www.next-course.de/`
- Hosting: IONOS, bestehender Webroot `/public/nextcourse`
- Quellcode: `https://github.com/philip-tolle/philip-tolle.github.io`
- GitHub Pages: deaktiviert; der frühere Pages-Workflow ist entfernt
- GitHub-Push: aktualisiert nur den Quellcode, nicht die Live-Website
- IONOS-Deployment: separat und nur nach ausdrücklicher Nutzerfreigabe

## Lokale Entwicklung

```powershell
npm install
npm run dev
npm run build
```

Die Website ist eine statische Astro-Anwendung. Der Produktionsbuild liegt in `dist/`.
Falls `npm` in einer verwalteten Codex-Shell nicht im Pfad liegt, kann deren gebündelte
Node-Laufzeit direkt `node_modules/astro/astro.js build` ausführen.

Wichtige Bereiche:

- `src/pages/` – Seiten und Routen
- `src/components/` – gemeinsame und interaktive Komponenten
- `src/styles/` – Gestaltung
- `src/assets/` – von Astro optimierte Quellbilder
- `public/` – unverändert auszuliefernde Dateien, Prompt Studio und Apache-Regeln
- `deploy/` und `docs/` – Betriebs- und Projektdokumentation

## Sicherheits- und Arbeitsgrenzen

- `.local/` enthält private, maschinengebundene oder betriebliche Daten und bleibt
  ausschließlich lokal.
- Zugangspässe, Schlüssel, Kennwörter, private Konfiguration und Releasepakete niemals
  in Git aufnehmen oder in einen öffentlichen Webroot kopieren.
- Ignorierte Ordner nicht mit einer pauschalen Bereinigung löschen. Insbesondere
  `.local/` ist nicht reproduzierbar.
- Die lokale Sicherung vor der GitHub-Synchronisierung liegt außerhalb des Repositories
  unter `C:\NextCourse Website -Projekte\project-snapshots\nextcourse-site-2026-09-29-before-github-sync`.
- Ältere Juli-/August-Branches sind historische Arbeitsstände. Für neue Arbeit gilt
  `origin/main`, solange der Nutzer keinen anderen Branch vorgibt.
- Keine Live-Veröffentlichung, DNS- oder GitHub-Pages-Änderung aus einem allgemeinen
  Entwicklungsauftrag ableiten.

## Letzte Veröffentlichung

Am 08.10.2026 wurde `main` 5acaae9 bei IONOS veröffentlicht (Booklet-Inhalte, gekürzte
Handyversion, dezente Knöpfe, Kontaktblock nur auf der Startseite). Sicherung davor:
`/nextcourse-backup-2026-10-08` außerhalb von `/public`. Prompt Studio, Praxis-Hub und
`.htaccess` blieben unverändert. Beim Entpacken im Webspace Explorer fragt IONOS für jede
vorhandene Datei einzeln nach; der Ja-Knopf wandert mit der Pfadlänge, daher jede Rückfrage
prüfen und danach die Live-Prüfsummen vergleichen.

## Bekannter offener Punkt

Im Footer fehlt weiterhin die endgültige LinkedIn-URL. Sie soll erst ergänzt werden,
wenn der Nutzer die konkrete Adresse vorgibt.

## Empfohlener Startauftrag für einen anderen Agenten

> Arbeite an der bestehenden NextCourse-Website in diesem Repository. Lies zuerst
> AGENTS.md und docs/AI-UEBERGABE.md, gleiche main mit origin/main ab und erhalte das
> vorhandene Design. Teste Änderungen lokal. Ein Git-Push ist erlaubt, wenn ich ihn
> beauftrage; eine Veröffentlichung bei IONOS braucht eine separate ausdrückliche
> Freigabe.
