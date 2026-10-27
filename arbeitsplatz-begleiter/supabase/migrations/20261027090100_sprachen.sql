-- Sprachliste (in den Einstellungen erweiterbar)
-- Automatisch erzeugt mit „npm run sql“ aus src/daten/. Nicht von Hand ändern.

insert into public.sprachen (code, name_eigen, name_de, richtung, vorlesen, qualitaet, aktiv, stimmen, reihenfolge) values
  ('de', 'Deutsch', 'Deutsch', 'ltr', 'geraet', 'gut', true, array['de-DE', 'de-AT', 'de-CH', 'de']::text[], 10),
  ('en', 'English', 'Englisch', 'ltr', 'geraet', 'gut', true, array['en-GB', 'en-US', 'en']::text[], 20),
  ('uk', 'Українська', 'Ukrainisch', 'ltr', 'geraet', 'gut', true, array['uk-UA', 'uk']::text[], 30),
  ('ru', 'Русский', 'Russisch', 'ltr', 'geraet', 'gut', true, array['ru-RU', 'ru']::text[], 40),
  ('ar', 'العربية', 'Arabisch', 'rtl', 'geraet', 'gut', true, array['ar-SY', 'ar-SA', 'ar-EG', 'ar']::text[], 50),
  ('tr', 'Türkçe', 'Türkisch', 'ltr', 'geraet', 'gut', true, array['tr-TR', 'tr']::text[], 60),
  ('ro', 'Română', 'Rumänisch', 'ltr', 'geraet', 'gut', true, array['ro-RO', 'ro']::text[], 70),
  ('pl', 'Polski', 'Polnisch', 'ltr', 'geraet', 'gut', true, array['pl-PL', 'pl']::text[], 80),
  ('bg', 'Български', 'Bulgarisch', 'ltr', 'geraet', 'gut', true, array['bg-BG', 'bg']::text[], 90),
  ('hr', 'Hrvatski', 'Kroatisch', 'ltr', 'geraet', 'gut', true, array['hr-HR', 'hr']::text[], 100),
  ('es', 'Español', 'Spanisch', 'ltr', 'geraet', 'gut', true, array['es-ES', 'es']::text[], 110),
  ('it', 'Italiano', 'Italienisch', 'ltr', 'geraet', 'gut', true, array['it-IT', 'it']::text[], 120),
  ('vi', 'Tiếng Việt', 'Vietnamesisch', 'ltr', 'geraet', 'gut', true, array['vi-VN', 'vi']::text[], 130),
  ('fa', 'فارسی', 'Farsi', 'rtl', 'geraet', 'gut', true, array['fa-IR', 'fa']::text[], 140),
  ('prs', 'دری', 'Dari', 'rtl', 'server', 'eingeschraenkt', true, array['fa-AF', 'prs']::text[], 150),
  ('ti', 'ትግርኛ', 'Tigrinya', 'ltr', 'keiner', 'eingeschraenkt', true, array['ti-ER', 'ti-ET', 'ti']::text[], 160)
on conflict (code) do nothing;
