# Arbeitsanweisungen für KI-Agenten

Diese Datei gilt für das gesamte Repository. Vor Änderungen zuerst `README.md` und
`docs/AI-UEBERGABE.md` lesen.

## Maßgeblicher Stand

- Dieses Repository ist die kanonische Arbeitskopie der NextCourse-Website.
- Maßgeblicher Branch ist `main`; vor neuer Arbeit den Stand mit `origin/main` abgleichen.
- GitHub dient der Versionsverwaltung und Sicherung. GitHub Pages ist deaktiviert.
- Die Live-Website wird separat bei IONOS aus `dist/` veröffentlicht. Ein Git-Push ist
  kein Deployment.

## Arbeitsregeln

- Bestehende Website weiterentwickeln, nicht ungefragt durch eine neue Landingpage oder
  ein anderes Design ersetzen.
- Vor jeder Übergabe mindestens `npm run build` ausführen. Wenn `npm` in einer Codex-
  Shell nicht im Pfad liegt, die dort bereitgestellte Node-Laufzeit direkt mit
  `node_modules/astro/astro.js build` verwenden.
- Keine Live-Veröffentlichung, DNS-Änderung, Formularnachricht oder Änderung an
  Zugangsschutz und Kundenbereichen ohne ausdrückliche Freigabe des Nutzers.
- Kein GitHub-Pages-Workflow und keine automatische Veröffentlichung reaktivieren.
- Keine Zugangsdaten, Kundenpässe, SSH-Schlüssel, `.env`-Dateien, Releasepakete oder
  Inhalte aus `.local/` committen. Ignorierte lokale Daten nicht pauschal löschen.
- `dist/`, `.astro/`, `node_modules/`, `artifacts/`, `tmp/` und `.superpowers/` sind
  erzeugte beziehungsweise lokale Arbeitsdaten und bleiben unversioniert.
- Vor einem Commit den Diff und `git status` prüfen; nur auftragsbezogene Dateien
  aufnehmen. Keine Resets oder großflächigen Aufräumaktionen an Nutzerdateien.

## Veröffentlichung

Ein IONOS-Deployment ist ein eigener Arbeitsschritt und benötigt immer eine neue,
ausdrückliche Freigabe. Dafür frisch bauen, das Paket prüfen und ausschließlich den
Inhalt von `dist/` in den bestehenden Webroot `/public/nextcourse` übertragen.
