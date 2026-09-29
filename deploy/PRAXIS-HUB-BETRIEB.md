# Praxis-Hub betreiben

Der Praxis-Hub liegt öffentlich unter `/prompt-studio/kunden/`, liefert seine Inhalte
aber erst nach einer serverseitig geprüften Freischaltung aus. Das Prompt Studio selbst
bleibt ohne Konto nutzbar und speichert seine Entwürfe weiterhin nur im Browser.

## Einen Kundenzugang erstellen

Für jeden Kunden einen eigenen, neutral bezeichneten Pass anlegen. Beispiel:

```powershell
python scripts/create-praxis-pass.py `
  --label "Pilotkunde Nord" `
  --expires 2026-12-31 `
  --topics zeit,energie,prompts,skills
```

Das Skript erzeugt den technischen Passnamen selbst. Optional kann mit `--pass-id`
eine eindeutige ID aus Kleinbuchstaben, Zahlen und Bindestrichen vorgegeben werden.

Alle lesbaren Zugangsdaten bleiben ausschließlich unter dem ignorierten Ordner
`.local/praxis-passes/`:

- `kits/<pass-id>/pass-kit.html`: druckbare Zugangskarte
- `kits/<pass-id>/qr-zugang.svg`: QR-Code für Print oder digitale Unterlagen
- `kits/<pass-id>/zugang.txt`: vertraulicher Direktlink und manueller Code
- `deploy/praxis-passes.php`: private Serverkonfiguration mit Hashwerten

Der QR-Code enthält einen zufälligen Schlüssel im URL-Fragment. Das Fragment wird beim
Öffnen aus der Browserzeile entfernt und erst danach per POST geprüft. Es erscheint
dadurch nicht im normalen Server-Request oder Referrer. Der manuelle Code ist eine
gleichwertige Alternative und sollte ebenfalls vertraulich behandelt werden.

## Private Konfiguration auf IONOS

Die generierte Datei `praxis-passes.php` gehört **nicht** in `/public/nextcourse`.
Sie wird im Webspace Explorer so abgelegt:

```text
/.nextcourse-private/praxis-passes.php
```

Zusätzlich `deploy/praxis-private.htaccess` als
`/.nextcourse-private/.htaccess` hochladen. Der öffentliche Hub sucht die Konfiguration
standardmäßig an genau diesem Ort. Alternativ kann die Servervariable
`NC_PRAXIS_CONFIG` auf einen anderen absoluten, nicht öffentlichen Dateipfad zeigen.

Nach jedem neu angelegten, gesperrten oder wieder aktivierten Pass die neu erzeugte
`.local/praxis-passes/deploy/praxis-passes.php` kontrolliert an diesen privaten
IONOS-Speicherort übertragen. Die Zugangskarten und lesbaren Schlüssel werden nie
hochgeladen.

## Zugang sperren oder wieder aktivieren

```powershell
python scripts/set-praxis-pass-status.py --pass-id <pass-id> --inactive
python scripts/set-praxis-pass-status.py --pass-id <pass-id> --active
```

Das Statusskript hält die lokale JSON-Datei und die deploybare PHP-Konfiguration
zusammen. Eine Sperre wirkt auf neue Anmeldungen und beim nächsten Seitenaufruf einer
bereits geöffneten Sitzung, sobald die private Konfiguration auf IONOS aktualisiert ist.

## Freigaben und Laufzeiten

Zulässige Themen sind:

- `zeit`: Zeit sparen
- `energie`: Energie sparen
- `prompts`: bessere Prompts
- `skills`: Skills und wiederkehrende Abläufe

Ein Pass kann mehrere Themen enthalten. Das Ablaufdatum wird bei einem reinen Datum bis
23:59:59 Uhr Europe/Berlin gerechnet. Der Hub prüft Aktivstatus, Ablauf und Themen bei
jedem Seitenaufruf. Sitzungen enden standardmäßig nach 60 Minuten Inaktivität oder nach
spätestens 12 Stunden.

## Inhalte pflegen

Die 15 geschützten Alltags-Abkürzungen stehen zentral in
`public/prompt-studio/kunden/tipps.php`. Jeder Eintrag enthält Kategorien,
Zugangs-Themen, Vorher/Nachher, Aufwand, Kosten, Gerät, Einrichtung, Anleitung,
Werkzeuge, eine optionale kopierbare Vorlage und einen Kontrollhinweis. Die Datei
wird serverseitig eingebunden und ist über die `.htaccess` für direkte Webaufrufe
gesperrt. Geschützte Inhalte nicht in öffentliche JSON-, HTML- oder Download-Dateien
auslagern.

Die statische Gestaltungsprüfung liegt unter `reviews/praxis-hub/index.html`; sie ist
nicht Teil des Website-Builds. Vor einer Veröffentlichung zusätzlich die echte
PHP-Ausführung, Anmeldung, Abmeldung, abgelaufene und gesperrte Pässe sowie die
Sicherheitsheader auf IONOS prüfen.
