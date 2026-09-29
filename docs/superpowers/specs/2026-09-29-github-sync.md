# GitHub-Synchronisierung und Abschaltung von GitHub Pages

## Ziel

Der derzeit maßgebliche lokale Stand der NextCourse-Website soll sicher und
nachvollziehbar in das bestehende öffentliche GitHub-Repository übernommen
werden. GitHub soll künftig als Versionsquelle dienen, während die Livewebsite
weiterhin ausschließlich bei IONOS betrieben wird.

## Verbindliche Anforderungen

- Die aktuelle IONOS-Livewebsite und ihr Webroot bleiben unverändert.
- Vor Git-Änderungen wird eine lokale, wiederherstellbare Sicherung des
  derzeitigen Checkouts einschließlich Git-Metadaten und nicht versionierter
  Projektdateien erstellt; generierte Abhängigkeiten dürfen ausgelassen werden.
- Private Zugangsdaten, Kundenpässe, lokale Releases, temporäre Dateien und
  vergleichbare lokale Betriebsartefakte dürfen nicht in das öffentliche
  Repository gelangen.
- Der aktuelle Arbeitsstand wird auf einem neuen Branch gesichert und mit dem
  aktuellen Remote-`main` nachvollziehbar zusammengeführt.
- Der veröffentlichbare Quellstand muss erfolgreich mit dem vorhandenen
  Astro-Build und der internen Referenzprüfung geprüft werden.
- Der aktualisierte Code wird nach erfolgreicher Prüfung auf GitHub
  veröffentlicht und in `main` übernommen.
- GitHub Pages wird im Repository deaktiviert; der alte Pages-Workflow wird aus
  dem Quellstand entfernt, damit ein Push keine irreführende zweite
  Veröffentlichung auslöst.
- Nach Abschluss wird erneut geprüft, dass GitHub Pages deaktiviert ist, GitHub
  den erwarteten Commit enthält und `https://www.next-course.de/` weiterhin von
  IONOS erreichbar ist.

## Nicht im Umfang

- Keine gestalterischen oder inhaltlichen Website-Änderungen.
- Kein Deployment zu IONOS.
- Keine Änderung an Kursplattform, Prompt-Studio-Zugängen oder Handbuchserver,
  außer dass bereits zur Website gehörende öffentliche Dateien korrekt
  versioniert werden.
