# Supabase einrichten – Schritt für Schritt

Diese Anleitung ist für Menschen ohne Programmierkenntnisse. Du brauchst etwa 30 Minuten.
Die Namen der Menüs bei Supabase ändern sich manchmal leicht – such dann nach dem
ähnlichsten Eintrag.

## 1. Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein Konto anlegen und anmelden.
2. **New project** wählen.
   - Name: z. B. `arbeitsplatz-begleiter`
   - **Region: Central EU (Frankfurt)** – damit die Daten in der EU liegen.
   - Datenbank-Passwort: das vorgeschlagene starke Passwort übernehmen und in deinem
     Passwort-Manager speichern. Du brauchst es für die App nicht, aber für Notfälle.
3. Warten, bis das Projekt bereit ist (1–2 Minuten).
4. Für den Datenschutz: In den Organisations-Einstellungen von Supabase den
   Auftragsverarbeitungsvertrag (DPA) abschließen.

## 2. Datenbank anlegen

1. Links **SQL Editor** öffnen → **New query**.
2. Die Datei [`einrichtung.sql`](einrichtung.sql) öffnen, den ganzen Inhalt kopieren,
   einfügen und **Run** drücken. Es muss „Success“ erscheinen. Diese Datei nur **einmal**
   ausführen – beim zweiten Mal meldet Supabase, dass es die Tabellen schon gibt.
3. Beispieldaten (Bankett, Housekeeping, zwei Anleitungen mit Übersetzungen) – optional,
   aber gut zum Testen: Neue Abfrage, Inhalt von [`seed.sql`](seed.sql) einfügen, **Run**.
4. **Dich selbst als erste Anleiterin eintragen.** Neue Abfrage, deine E-Mail-Adresse
   in Kleinbuchstaben einsetzen, **Run**:

   ```sql
   insert into public.einladungen (email, rolle) values ('deine.adresse@beispiel.de', 'anleiter');
   ```

   Alle weiteren Personen lädst du später in der App unter „Team“ ein.

## 3. Anmeldung per E-Mail-Code

1. **Authentication → Sign In / Providers → Email**: eingeschaltet lassen.
2. **Authentication → Emails → Templates**: In den Vorlagen **Magic Link** und
   **Confirm signup** den Text ersetzen, damit ein Code in der E-Mail steht:

   ```html
   <h2>Anmelden beim Arbeitsplatz-Begleiter</h2>
   <p>Dein Code: <strong>{{ .Token }}</strong></p>
   <p>Oder tippe hier: <a href="{{ .ConfirmationURL }}">Anmelden</a></p>
   ```

   Der Code ist 1 Stunde gültig. Einen neuen Code gibt es frühestens nach 60 Sekunden.
3. **Authentication → URL Configuration**:
   - **Site URL**: die Adresse, unter der die App läuft, z. B.
     `https://begleiter.next-course.de/`
   - **Redirect URLs**: dieselbe Adresse noch einmal eintragen.

## 4. E-Mails über das eigene Postfach verschicken (wichtig)

Ohne eigenen E-Mail-Versand schickt Supabase nur sehr wenige E-Mails und nur an
Mitglieder des Supabase-Teams. Für Anleiter:innen und Sprachpaten braucht es deshalb
einen eigenen Versand, z. B. über ein IONOS-Postfach:

**Authentication → Emails → SMTP Settings** → eigenen SMTP einschalten:

- Host: `smtp.ionos.de`, Port: `465` (oder `587`)
- Benutzername und Passwort: ein IONOS-Postfach, z. B. `begleiter@next-course.de`
- Absender: dieselbe Adresse, Name: „Arbeitsplatz-Begleiter“

## 5. Nur eingeladene Personen zulassen (empfohlen)

Ohne diesen Schritt kann sich jede Person ein Konto anlegen – sie sieht aber nichts,
weil sie keine Rolle hat. Mit diesem Schritt wird sie schon bei der Anmeldung abgewiesen.

**Authentication → Hooks → Before User Created** → **Postgres** →
Schema `public`, Funktion `hook_konto_pruefen` → speichern.

## 6. App mit der Datenbank verbinden

1. **Project Settings → API Keys**: Die **Project URL** und den **Publishable key**
   (beginnt mit `sb_publishable_`) kopieren. Ältere Projekte zeigen stattdessen den
   „anon public“-Schlüssel – der geht auch.
   Den **Secret key / service_role** niemals verwenden oder weitergeben.
2. Eine Datei `konfiguration.json` anlegen (Vorlage:
   [`konfiguration.beispiel.json`](konfiguration.beispiel.json)):

   ```json
   {
     "supabaseUrl": "https://DEIN-PROJEKT.supabase.co",
     "supabaseKey": "sb_publishable_…"
   }
   ```

3. Diese Datei neben `index.html` in den Ordner der App auf dem Webspace legen.
   Ohne diese Datei läuft die App als Testversion mit Beispieldaten.

## 7. Ausprobieren

1. Die App-Adresse öffnen → **Zum Anleiter-Bereich** → E-Mail eingeben → Code aus der
   E-Mail eintippen.
2. Unter **Arbeitsplätze** steht die Adresse für jedes Tablet.
3. Auf dem Tablet diese Adresse öffnen und als Lesezeichen auf den Startbildschirm legen.

## Was wo liegt

- `migrations/` – die Datenbank in Einzelschritten (für Entwickler und die Supabase-CLI)
- `einrichtung.sql` – alle Migrationen in einer Datei (zum Einfügen im SQL Editor)
- `seed.sql` – Beispieldaten
- Erzeugt werden `einrichtung.sql`, `seed.sql` und die Sprachliste mit `npm run sql`.

## Stand der Einrichtung (27.10.2026)

- Supabase-Projekt „arbeitsplatz-begleiter“ in Frankfurt (eu-central-1), kostenloser Tarif.
- Grundlage Teil 1 und 2 über den Supabase-Connector eingespielt (Migrationen
  `grundlage_1_tabellen`, `grundlage_2_regeln_und_funktionen`). Der Rest – Funktionen zum
  Löschen, Rechte, Sprachliste und Beispieldaten – per SQL Editor, weil Supabase dafür eine
  Bestätigung verlangt, die über den Connector nicht ankam. Zusammen entspricht das genau
  `einrichtung.sql` und `seed.sql` (lokal geprüft).
- Erste Anleiterin ist eingeladen.
- Die Verbindungsdatei `konfiguration.json` liegt nur lokal (nicht in Git) und kommt beim
  Veröffentlichen neben `index.html`.
- Noch offen: E-Mail-Vorlage mit Code, Adresse der App (Site URL), eigener E-Mail-Versand,
  optional der Hook für „nur Eingeladene“.

