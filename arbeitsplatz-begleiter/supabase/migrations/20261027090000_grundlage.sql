-- Arbeitsplatz-Begleiter – Datenbank, Phase 2
--
-- Grundsätze:
-- * Das Tablet (ohne Login) liest nur über die Funktion platz_inhalte() –
--   und dort nur freigegebene Fassungen seines Arbeitsplatzes.
-- * Anleiter:innen dürfen alles, Sprachpaten nur Übersetzungen ihrer Sprachen.
-- * Freigegebene Fassungen sind Momentaufnahmen. Änderungen an einem Entwurf
--   erreichen das Tablet erst mit der nächsten Freigabe.
-- * Keine Daten über Mitarbeitende: keine Konten, keine Nutzungsdaten.

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.sprachen (
  code text primary key check (code ~ '^[a-z]{2,3}$'),
  name_eigen text not null,
  name_de text not null,
  richtung text not null default 'ltr' check (richtung in ('ltr', 'rtl')),
  vorlesen text not null default 'geraet' check (vorlesen in ('geraet', 'server', 'keiner')),
  qualitaet text not null default 'gut' check (qualitaet in ('gut', 'eingeschraenkt')),
  aktiv boolean not null default true,
  stimmen text[] not null default '{}',
  reihenfolge int not null default 100
);

create table public.arbeitsplaetze (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  name text not null check (length(trim(name)) > 0),
  pin_hash text,
  angebotene_sprachen text[] not null default '{}',
  ansprechperson text not null default '',
  ansprechperson_in jsonb not null default '{}'::jsonb,
  erstellt_am timestamptz not null default now(),
  geaendert_am timestamptz not null default now()
);

create table public.anleitungen (
  id uuid primary key default gen_random_uuid(),
  titel_de text not null default '',
  originaltext text not null default '',
  ansprechperson text not null default '',
  ansprechperson_in jsonb not null default '{}'::jsonb,
  zielsprachen text[] not null default '{}',
  titelbild_url text,
  status_de text not null default 'entwurf' check (status_de in ('entwurf', 'freigegeben')),
  -- Freigegebene deutsche Fassung. Genau das sieht das Tablet.
  fassung_de jsonb,
  freigegeben_von uuid references auth.users on delete set null,
  freigegeben_am timestamptz,
  erstellt_von uuid references auth.users on delete set null default auth.uid(),
  erstellt_am timestamptz not null default now(),
  geaendert_am timestamptz not null default now()
);

create table public.anleitung_arbeitsplatz (
  anleitung_id uuid not null references public.anleitungen on delete cascade,
  arbeitsplatz_id text not null references public.arbeitsplaetze on delete cascade on update cascade,
  primary key (anleitung_id, arbeitsplatz_id)
);

create table public.schritte (
  id uuid primary key default gen_random_uuid(),
  anleitung_id uuid not null references public.anleitungen on delete cascade,
  position int not null check (position > 0),
  text_de text not null default '',
  hinweis_de text not null default '',
  bildwort text not null default '',
  bild_url text,
  achtung boolean not null default false,
  -- Steigt bei jeder inhaltlichen Änderung. Übersetzungen mit kleinerer Version sind veraltet.
  version int not null default 1,
  unique (anleitung_id, position) deferrable initially deferred
);

create table public.anleitung_sprachen (
  anleitung_id uuid not null references public.anleitungen on delete cascade,
  sprache text not null references public.sprachen on update cascade,
  titel text not null default '',
  status text not null default 'maschinell'
    check (status in ('maschinell', 'in_pruefung', 'freigegeben', 'veraltet')),
  -- Freigegebene Fassung dieser Sprache (vollständig, mit deutschem Bezugstext).
  fassung jsonb,
  freigegeben_von uuid references auth.users on delete set null,
  freigegeben_am timestamptz,
  primary key (anleitung_id, sprache)
);

create table public.schritt_uebersetzungen (
  schritt_id uuid not null references public.schritte on delete cascade,
  sprache text not null references public.sprachen on update cascade,
  text text not null default '',
  hinweis text not null default '',
  rueckuebersetzung text not null default '',
  unsicher boolean not null default false,
  grund text not null default '',
  status text not null default 'maschinell' check (status in ('maschinell', 'geprueft', 'veraltet')),
  geprueft_von uuid references auth.users on delete set null,
  geprueft_am timestamptz,
  basiert_auf_version int not null default 1,
  primary key (schritt_id, sprache)
);

-- Team: nur Anleiter:innen und Sprachpaten. Mitarbeitende haben kein Konto.
create table public.profile (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text not null default '',
  rolle text not null check (rolle in ('anleiter', 'sprachpate')),
  sprachen text[] not null default '{}',
  erstellt_am timestamptz not null default now()
);

create table public.einladungen (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  rolle text not null check (rolle in ('anleiter', 'sprachpate')),
  sprachen text[] not null default '{}',
  eingeladen_von uuid references auth.users on delete set null,
  eingeladen_am timestamptz not null default now()
);

create index schritte_anleitung on public.schritte (anleitung_id);
create index anleitung_arbeitsplatz_platz on public.anleitung_arbeitsplatz (arbeitsplatz_id);
create index uebersetzungen_sprache on public.schritt_uebersetzungen (sprache);

-- ---------------------------------------------------------------------------
-- Rollen-Prüfung
-- ---------------------------------------------------------------------------

create function public.ist_anleiter() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profile where user_id = auth.uid() and rolle = 'anleiter');
$$;

create function public.meine_sprachen() returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select sprachen from public.profile where user_id = auth.uid() and rolle = 'sprachpate'),
    '{}'::text[]);
$$;

create function public._nur_anleiter() returns void
language plpgsql stable set search_path = '' as $$
begin
  if not public.ist_anleiter() then
    raise exception 'Das dürfen nur Anleiter:innen.' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Zugriffsregeln (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.sprachen enable row level security;
alter table public.arbeitsplaetze enable row level security;
alter table public.anleitungen enable row level security;
alter table public.anleitung_arbeitsplatz enable row level security;
alter table public.schritte enable row level security;
alter table public.anleitung_sprachen enable row level security;
alter table public.schritt_uebersetzungen enable row level security;
alter table public.profile enable row level security;
alter table public.einladungen enable row level security;

create policy "Team liest Sprachen" on public.sprachen for select to authenticated using (true);
create policy "Anleiter pflegen Sprachen" on public.sprachen for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Team liest Arbeitsplätze" on public.arbeitsplaetze for select to authenticated using (true);
create policy "Anleiter pflegen Arbeitsplätze" on public.arbeitsplaetze for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Anleiter und zuständige Sprachpaten lesen Anleitungen" on public.anleitungen for select to authenticated
  using (public.ist_anleiter() or exists (
    select 1 from public.anleitung_sprachen s
    where s.anleitung_id = anleitungen.id and s.sprache = any (public.meine_sprachen())));
create policy "Anleiter pflegen Anleitungen" on public.anleitungen for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Anleiter pflegen Zuordnungen" on public.anleitung_arbeitsplatz for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Anleiter und zuständige Sprachpaten lesen Schritte" on public.schritte for select to authenticated
  using (public.ist_anleiter() or exists (
    select 1 from public.anleitung_sprachen s
    where s.anleitung_id = schritte.anleitung_id and s.sprache = any (public.meine_sprachen())));
create policy "Anleiter pflegen Schritte" on public.schritte for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Lesen nach Sprache" on public.anleitung_sprachen for select to authenticated
  using (public.ist_anleiter() or sprache = any (public.meine_sprachen()));
create policy "Anleiter pflegen Sprachfassungen" on public.anleitung_sprachen for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

create policy "Lesen nach Sprache" on public.schritt_uebersetzungen for select to authenticated
  using (public.ist_anleiter() or sprache = any (public.meine_sprachen()));
create policy "Bearbeiten nach Sprache" on public.schritt_uebersetzungen for update to authenticated
  using (public.ist_anleiter() or sprache = any (public.meine_sprachen()))
  with check (public.ist_anleiter() or sprache = any (public.meine_sprachen()));
create policy "Anleiter legen Übersetzungen an" on public.schritt_uebersetzungen for insert to authenticated
  with check (public.ist_anleiter());
create policy "Anleiter löschen Übersetzungen" on public.schritt_uebersetzungen for delete to authenticated
  using (public.ist_anleiter());

create policy "Eigenes Profil und Anleiter lesen" on public.profile for select to authenticated
  using (user_id = auth.uid() or public.ist_anleiter());
create policy "Anleiter ändern Profile" on public.profile for update to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());
create policy "Anleiter entfernen Profile" on public.profile for delete to authenticated
  using (public.ist_anleiter());

create policy "Anleiter verwalten Einladungen" on public.einladungen for all to authenticated
  using (public.ist_anleiter()) with check (public.ist_anleiter());

-- Sprachpaten dürfen an einer Übersetzung nur Text, Hinweis und Prüfstatus ändern.
create function public._uebersetzung_schuetzen() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Nur Zugriffe über die Programmierschnittstelle prüfen; interne Abläufe (Trigger) dürfen alles.
  if current_user in ('authenticated', 'anon') and not public.ist_anleiter() then
    if new.schritt_id is distinct from old.schritt_id
      or new.sprache is distinct from old.sprache
      or new.rueckuebersetzung is distinct from old.rueckuebersetzung
      or new.basiert_auf_version is distinct from old.basiert_auf_version
      or new.status = 'veraltet' and old.status <> 'veraltet' then
      raise exception 'Sprachpaten können nur Text, Hinweis und Prüfung ändern.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger uebersetzung_schuetzen before update on public.schritt_uebersetzungen
  for each row execute function public._uebersetzung_schuetzen();

-- ---------------------------------------------------------------------------
-- Versionen: Ändert sich ein deutscher Schritt, werden seine Übersetzungen „veraltet“.
-- ---------------------------------------------------------------------------

create function public._schritt_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (new.text_de, new.hinweis_de, new.achtung) is distinct from (old.text_de, old.hinweis_de, old.achtung) then
    new.version := old.version + 1;
  else
    new.version := old.version;
  end if;
  return new;
end;
$$;

create trigger schritt_version before update on public.schritte
  for each row execute function public._schritt_version();

create function public._uebersetzungen_veralten() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_anleitung uuid := coalesce(new.anleitung_id, old.anleitung_id);
begin
  if tg_op = 'UPDATE' then
    if new.version = old.version then
      return new;
    end if;
    update public.schritt_uebersetzungen
      set status = 'veraltet'
      where schritt_id = new.id and basiert_auf_version < new.version and status <> 'veraltet';
  end if;
  -- Neuer, geänderter oder gelöschter Schritt: Die ganze Sprachfassung muss neu geprüft werden.
  update public.anleitung_sprachen set status = 'veraltet'
    where anleitung_id = v_anleitung and status <> 'veraltet';
  return coalesce(new, old);
end;
$$;

create trigger uebersetzungen_veralten after insert or update or delete on public.schritte
  for each row execute function public._uebersetzungen_veralten();

-- ---------------------------------------------------------------------------
-- Freigegebene Fassungen (Momentaufnahmen)
-- ---------------------------------------------------------------------------

create function public._fassung_de_bauen(p_id uuid) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'titel', a.titel_de,
    'ansprechperson', jsonb_build_object('name', a.ansprechperson, 'name_in', a.ansprechperson_in),
    'titelbild_url', a.titelbild_url,
    'schritte', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'position', s.position, 'text', s.text_de, 'hinweis', s.hinweis_de,
        'bildwort', s.bildwort, 'bild_url', s.bild_url, 'achtung', s.achtung, 'version', s.version)
        order by s.position)
      from public.schritte s where s.anleitung_id = a.id), '[]'::jsonb))
  from public.anleitungen a where a.id = p_id;
$$;

-- Sprachfassung = freigegebene deutsche Fassung + Übersetzungen. Vollständig in sich,
-- damit das Tablet bei einer neuen deutschen Fassung die alte Übersetzung weiter zeigen kann.
create function public._sprachfassung_bauen(p_id uuid, p_sprache text) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'titel', ls.titel,
    'titel_de', a.fassung_de ->> 'titel',
    'ansprechperson', a.fassung_de -> 'ansprechperson',
    'titelbild_url', a.fassung_de -> 'titelbild_url',
    'schritte', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', st ->> 'id', 'position', (st ->> 'position')::int,
        'bild_url', st -> 'bild_url', 'achtung', st -> 'achtung', 'version', st -> 'version',
        'text_de', st ->> 'text', 'hinweis_de', st ->> 'hinweis',
        'text', u.text, 'hinweis', u.hinweis, 'status', u.status,
        'basiert_auf_version', u.basiert_auf_version)
        order by (st ->> 'position')::int)
      from jsonb_array_elements(a.fassung_de -> 'schritte') st
      left join public.schritt_uebersetzungen u
        on u.schritt_id = (st ->> 'id')::uuid and u.sprache = p_sprache), '[]'::jsonb))
  from public.anleitungen a
  join public.anleitung_sprachen ls on ls.anleitung_id = a.id and ls.sprache = p_sprache
  where a.id = p_id and a.fassung_de is not null;
$$;

-- ---------------------------------------------------------------------------
-- Tablet (ohne Login): nur freigegebene Inhalte eines Arbeitsplatzes
-- ---------------------------------------------------------------------------

create function public.platz_inhalte(p_platz text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'arbeitsplatz', jsonb_build_object(
      'id', p.id, 'name', p.name, 'angebotene_sprachen', to_jsonb(p.angebotene_sprachen),
      'ansprechperson', jsonb_build_object('name', p.ansprechperson, 'name_in', p.ansprechperson_in)),
    'sprachen', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'code', s.code, 'name_eigen', s.name_eigen, 'name_de', s.name_de, 'richtung', s.richtung,
        'vorlesen', s.vorlesen, 'qualitaet', s.qualitaet, 'aktiv', s.aktiv, 'stimmen', to_jsonb(s.stimmen))
        order by s.reihenfolge, s.code), '[]'::jsonb)
      from public.sprachen s where s.aktiv),
    'fassungen', (
      select coalesce(jsonb_agg(f.fassung), '[]'::jsonb) from (
        select jsonb_build_object('anleitung_id', a.id, 'sprache', 'de', 'fassung', a.fassung_de) as fassung
        from public.anleitungen a
        join public.anleitung_arbeitsplatz ap on ap.anleitung_id = a.id and ap.arbeitsplatz_id = p.id
        where a.fassung_de is not null
        union all
        select jsonb_build_object('anleitung_id', a.id, 'sprache', ls.sprache, 'fassung', ls.fassung)
        from public.anleitungen a
        join public.anleitung_arbeitsplatz ap on ap.anleitung_id = a.id and ap.arbeitsplatz_id = p.id
        join public.anleitung_sprachen ls on ls.anleitung_id = a.id and ls.fassung is not null
        where a.fassung_de is not null
      ) f))
  from public.arbeitsplaetze p where p.id = p_platz;
$$;

-- ---------------------------------------------------------------------------
-- Konten: Nur eingeladene E-Mail-Adressen bekommen eine Rolle.
-- ---------------------------------------------------------------------------

create function public._konto_anlegen() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_einladung public.einladungen;
begin
  select * into v_einladung from public.einladungen where email = lower(new.email);
  if found then
    insert into public.profile (user_id, email, rolle, sprachen)
      values (new.id, lower(new.email), v_einladung.rolle, v_einladung.sprachen)
      on conflict (user_id) do nothing;
    delete from public.einladungen where email = v_einladung.email;
  end if;
  return new;
end;
$$;

create trigger konto_anlegen after insert on auth.users
  for each row execute function public._konto_anlegen();

-- Optionaler Auth-Hook „Before User Created“: lehnt nicht eingeladene Adressen ab.
create function public.hook_konto_pruefen(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.einladungen where email = lower(event -> 'user' ->> 'email')) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'Diese E-Mail-Adresse ist nicht eingeladen. Bitte frag deine Anleiterin oder deinen Anleiter.'));
end;
$$;

create function public.mein_profil() returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('user_id', user_id, 'email', email, 'name', name, 'rolle', rolle, 'sprachen', to_jsonb(sprachen))
  from public.profile where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Anleiter-Bereich: Anleitungen
-- ---------------------------------------------------------------------------

create function public.sprachen_liste() returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(s) order by s.reihenfolge, s.code), '[]'::jsonb) from public.sprachen s;
$$;

create function public.anleitungen_liste() returns jsonb
language plpgsql stable set search_path = '' as $$
begin
  perform public._nur_anleiter();
  return (
    select coalesce(jsonb_agg(x order by x ->> 'titel_de'), '[]'::jsonb) from (
      select jsonb_build_object(
        'id', a.id,
        'titel_de', a.titel_de,
        'status_de', a.status_de,
        'auf_tablet', a.fassung_de is not null,
        'freigegeben_am', a.freigegeben_am,
        'geaendert_am', a.geaendert_am,
        'anzahl_schritte', (select count(*) from public.schritte s where s.anleitung_id = a.id),
        'zielsprachen', to_jsonb(a.zielsprachen),
        'arbeitsplaetze', (
          select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name) order by p.name), '[]'::jsonb)
          from public.anleitung_arbeitsplatz ap join public.arbeitsplaetze p on p.id = ap.arbeitsplatz_id
          where ap.anleitung_id = a.id),
        'sprachen', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'sprache', ls.sprache, 'status', ls.status, 'auf_tablet', ls.fassung is not null)
            order by s.reihenfolge), '[]'::jsonb)
          from public.anleitung_sprachen ls join public.sprachen s on s.code = ls.sprache
          where ls.anleitung_id = a.id)) as x
      from public.anleitungen a) t);
end;
$$;

create function public.anleitung_laden(p_id uuid) returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  v jsonb;
begin
  perform public._nur_anleiter();
  select jsonb_build_object(
    'id', a.id,
    'titel_de', a.titel_de,
    'originaltext', a.originaltext,
    'ansprechperson', a.ansprechperson,
    'zielsprachen', to_jsonb(a.zielsprachen),
    'titelbild_url', a.titelbild_url,
    'status_de', a.status_de,
    'auf_tablet', a.fassung_de is not null,
    'freigegeben_am', a.freigegeben_am,
    'geaendert_am', a.geaendert_am,
    'arbeitsplaetze', (
      select coalesce(jsonb_agg(ap.arbeitsplatz_id order by ap.arbeitsplatz_id), '[]'::jsonb)
      from public.anleitung_arbeitsplatz ap where ap.anleitung_id = a.id),
    'schritte', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', s.id, 'position', s.position, 'text_de', s.text_de, 'hinweis_de', s.hinweis_de,
        'bildwort', s.bildwort, 'bild_url', s.bild_url, 'achtung', s.achtung, 'version', s.version)
        order by s.position), '[]'::jsonb)
      from public.schritte s where s.anleitung_id = a.id),
    'sprachen', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'sprache', ls.sprache, 'status', ls.status, 'auf_tablet', ls.fassung is not null,
        'freigegeben_am', ls.freigegeben_am) order by s.reihenfolge), '[]'::jsonb)
      from public.anleitung_sprachen ls join public.sprachen s on s.code = ls.sprache
      where ls.anleitung_id = a.id))
  into v
  from public.anleitungen a where a.id = p_id;
  if v is null then
    raise exception 'Diese Anleitung gibt es nicht.' using errcode = 'P0002';
  end if;
  return v;
end;
$$;

-- Speichert Angaben, Arbeitsplätze und alle Schritte in einem Zug.
-- Reihenfolge der Schritte = Reihenfolge im Feld „schritte“.
create function public.anleitung_speichern(p_anleitung jsonb) returns uuid
language plpgsql set search_path = '' as $$
declare
  v_id uuid := nullif(p_anleitung ->> 'id', '')::uuid;
  v_schritt jsonb;
  v_pos int;
  v_ids uuid[];
  v_plaetze text[];
begin
  perform public._nur_anleiter();
  if length(trim(coalesce(p_anleitung ->> 'titel_de', ''))) = 0 then
    raise exception 'Bitte einen Titel eingeben.' using errcode = '22023';
  end if;

  if v_id is null then
    insert into public.anleitungen (titel_de, originaltext, ansprechperson, zielsprachen)
    values (
      trim(p_anleitung ->> 'titel_de'),
      coalesce(p_anleitung ->> 'originaltext', ''),
      trim(coalesce(p_anleitung ->> 'ansprechperson', '')),
      coalesce(array(select jsonb_array_elements_text(p_anleitung -> 'zielsprachen')), '{}'))
    returning id into v_id;
  else
    update public.anleitungen set
      titel_de = trim(p_anleitung ->> 'titel_de'),
      originaltext = coalesce(p_anleitung ->> 'originaltext', ''),
      ansprechperson = trim(coalesce(p_anleitung ->> 'ansprechperson', '')),
      zielsprachen = coalesce(array(select jsonb_array_elements_text(p_anleitung -> 'zielsprachen')), '{}')
    where id = v_id;
    if not found then
      raise exception 'Diese Anleitung gibt es nicht.' using errcode = 'P0002';
    end if;
  end if;

  v_plaetze := coalesce(array(select jsonb_array_elements_text(p_anleitung -> 'arbeitsplaetze')), '{}');
  delete from public.anleitung_arbeitsplatz where anleitung_id = v_id and arbeitsplatz_id <> all (v_plaetze);
  insert into public.anleitung_arbeitsplatz (anleitung_id, arbeitsplatz_id)
    select v_id, unnest(v_plaetze) on conflict do nothing;

  v_ids := coalesce(array(
    select (s ->> 'id')::uuid from jsonb_array_elements(p_anleitung -> 'schritte') s
    where nullif(s ->> 'id', '') is not null), '{}');
  delete from public.schritte where anleitung_id = v_id and id <> all (v_ids);

  v_pos := 0;
  for v_schritt in select * from jsonb_array_elements(coalesce(p_anleitung -> 'schritte', '[]'::jsonb)) loop
    v_pos := v_pos + 1;
    if nullif(v_schritt ->> 'id', '') is null then
      insert into public.schritte (anleitung_id, position, text_de, hinweis_de, bildwort, bild_url, achtung)
      values (v_id, v_pos, trim(coalesce(v_schritt ->> 'text_de', '')), trim(coalesce(v_schritt ->> 'hinweis_de', '')),
        trim(coalesce(v_schritt ->> 'bildwort', '')), nullif(v_schritt ->> 'bild_url', ''),
        coalesce((v_schritt ->> 'achtung')::boolean, false));
    else
      update public.schritte set
        position = v_pos,
        text_de = trim(coalesce(v_schritt ->> 'text_de', '')),
        hinweis_de = trim(coalesce(v_schritt ->> 'hinweis_de', '')),
        bildwort = trim(coalesce(v_schritt ->> 'bildwort', '')),
        bild_url = nullif(v_schritt ->> 'bild_url', ''),
        achtung = coalesce((v_schritt ->> 'achtung')::boolean, false)
      where id = (v_schritt ->> 'id')::uuid and anleitung_id = v_id;
      if not found then
        raise exception 'Ein Schritt gehört nicht zu dieser Anleitung.' using errcode = 'P0002';
      end if;
    end if;
  end loop;

  -- Gleicht der Entwurf der freigegebenen Fassung, bleibt er freigegeben.
  update public.anleitungen set
    status_de = case when fassung_de is not null and fassung_de = public._fassung_de_bauen(v_id)
                     then 'freigegeben' else 'entwurf' end,
    geaendert_am = now()
  where id = v_id;
  return v_id;
end;
$$;

create function public.anleitung_freigeben(p_id uuid) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_leer int;
begin
  perform public._nur_anleiter();
  if not exists (select 1 from public.anleitungen where id = p_id) then
    raise exception 'Diese Anleitung gibt es nicht.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.anleitungen where id = p_id and length(trim(titel_de)) = 0) then
    raise exception 'Bitte zuerst einen Titel eingeben.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.schritte where anleitung_id = p_id) then
    raise exception 'Die Anleitung braucht mindestens 1 Schritt.' using errcode = '22023';
  end if;
  select min(position) into v_leer from public.schritte where anleitung_id = p_id and length(trim(text_de)) = 0;
  if v_leer is not null then
    raise exception 'Schritt % hat noch keinen Satz.', v_leer using errcode = '22023';
  end if;
  update public.anleitungen set
    fassung_de = public._fassung_de_bauen(p_id),
    status_de = 'freigegeben',
    freigegeben_von = auth.uid(),
    freigegeben_am = now()
  where id = p_id;
  return public.anleitung_laden(p_id);
end;
$$;

create function public.anleitung_zurueckziehen(p_id uuid) returns jsonb
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  update public.anleitungen set fassung_de = null, status_de = 'entwurf' where id = p_id;
  return public.anleitung_laden(p_id);
end;
$$;

create function public.anleitung_loeschen(p_id uuid) returns void
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  delete from public.anleitungen where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Anleiter-Bereich: Arbeitsplätze
-- ---------------------------------------------------------------------------

create function public.arbeitsplaetze_liste() returns jsonb
language plpgsql stable set search_path = '' as $$
begin
  perform public._nur_anleiter();
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.name, 'angebotene_sprachen', to_jsonb(p.angebotene_sprachen),
      'ansprechperson', p.ansprechperson,
      'anleitungen', (select count(*) from public.anleitung_arbeitsplatz ap where ap.arbeitsplatz_id = p.id))
      order by p.name), '[]'::jsonb)
    from public.arbeitsplaetze p);
end;
$$;

create function public.arbeitsplatz_speichern(p_platz jsonb, p_neu boolean) returns void
language plpgsql set search_path = '' as $$
declare
  v_sprachen text[] := coalesce(array(select jsonb_array_elements_text(p_platz -> 'angebotene_sprachen')), '{}');
begin
  perform public._nur_anleiter();
  if p_neu then
    if exists (select 1 from public.arbeitsplaetze where id = p_platz ->> 'id') then
      raise exception 'Diese Adresse gibt es schon. Bitte einen anderen Namen wählen.' using errcode = '23505';
    end if;
    insert into public.arbeitsplaetze (id, name, angebotene_sprachen, ansprechperson)
    values (p_platz ->> 'id', trim(p_platz ->> 'name'), v_sprachen, trim(coalesce(p_platz ->> 'ansprechperson', '')));
  else
    update public.arbeitsplaetze set
      name = trim(p_platz ->> 'name'),
      angebotene_sprachen = v_sprachen,
      ansprechperson = trim(coalesce(p_platz ->> 'ansprechperson', '')),
      ansprechperson_in = case when ansprechperson = trim(coalesce(p_platz ->> 'ansprechperson', ''))
                               then ansprechperson_in else '{}'::jsonb end,
      geaendert_am = now()
    where id = p_platz ->> 'id';
    if not found then
      raise exception 'Diesen Arbeitsplatz gibt es nicht.' using errcode = 'P0002';
    end if;
  end if;
end;
$$;

create function public.arbeitsplatz_loeschen(p_id text) returns void
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  delete from public.arbeitsplaetze where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Anleiter-Bereich: Team
-- ---------------------------------------------------------------------------

create function public.team_liste() returns jsonb
language plpgsql stable set search_path = '' as $$
begin
  perform public._nur_anleiter();
  return jsonb_build_object(
    'mitglieder', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', p.user_id, 'email', p.email, 'name', p.name, 'rolle', p.rolle,
        'sprachen', to_jsonb(p.sprachen), 'ich', p.user_id = auth.uid()) order by p.email), '[]'::jsonb)
      from public.profile p),
    'einladungen', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'email', e.email, 'rolle', e.rolle, 'sprachen', to_jsonb(e.sprachen), 'eingeladen_am', e.eingeladen_am)
        order by e.eingeladen_am), '[]'::jsonb)
      from public.einladungen e));
end;
$$;

create function public.einladen(p_email text, p_rolle text, p_sprachen text[]) returns void
language plpgsql set search_path = '' as $$
declare
  v_email text := lower(trim(p_email));
begin
  perform public._nur_anleiter();
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Bitte eine gültige E-Mail-Adresse eingeben.' using errcode = '22023';
  end if;
  if p_rolle = 'sprachpate' and coalesce(array_length(p_sprachen, 1), 0) = 0 then
    raise exception 'Bitte mindestens eine Sprache für den Sprachpaten wählen.' using errcode = '22023';
  end if;
  if exists (select 1 from public.profile where email = v_email) then
    raise exception 'Diese Person ist schon im Team.' using errcode = '23505';
  end if;
  insert into public.einladungen (email, rolle, sprachen, eingeladen_von)
  values (v_email, p_rolle, case when p_rolle = 'sprachpate' then p_sprachen else '{}' end, auth.uid())
  on conflict (email) do update set rolle = excluded.rolle, sprachen = excluded.sprachen,
    eingeladen_von = excluded.eingeladen_von, eingeladen_am = now();
end;
$$;

create function public.einladung_zuruecknehmen(p_email text) returns void
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  delete from public.einladungen where email = lower(trim(p_email));
end;
$$;

create function public._letzte_anleitung_pruefen(p_user uuid) returns void
language plpgsql stable set search_path = '' as $$
begin
  if exists (select 1 from public.profile where user_id = p_user and rolle = 'anleiter')
    and (select count(*) from public.profile where rolle = 'anleiter') <= 1 then
    raise exception 'Es muss mindestens eine Anleiterin oder ein Anleiter im Team bleiben.' using errcode = '22023';
  end if;
end;
$$;

create function public.mitglied_aendern(p_user uuid, p_rolle text, p_sprachen text[]) returns void
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  if p_rolle <> 'anleiter' then
    perform public._letzte_anleitung_pruefen(p_user);
  end if;
  if p_rolle = 'sprachpate' and coalesce(array_length(p_sprachen, 1), 0) = 0 then
    raise exception 'Bitte mindestens eine Sprache für den Sprachpaten wählen.' using errcode = '22023';
  end if;
  update public.profile set rolle = p_rolle,
    sprachen = case when p_rolle = 'sprachpate' then p_sprachen else '{}' end
  where user_id = p_user;
end;
$$;

create function public.mitglied_entfernen(p_user uuid) returns void
language plpgsql set search_path = '' as $$
begin
  perform public._nur_anleiter();
  perform public._letzte_anleitung_pruefen(p_user);
  delete from public.profile where user_id = p_user;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rechte: Tabellen nur über RLS, Funktionen nur gezielt freigeben
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.platz_inhalte(text) to anon, authenticated;
grant execute on function
  public.ist_anleiter(), public.meine_sprachen(), public._nur_anleiter(), public.mein_profil(),
  public.sprachen_liste(), public.anleitungen_liste(), public.anleitung_laden(uuid),
  public.anleitung_speichern(jsonb), public.anleitung_freigeben(uuid), public.anleitung_zurueckziehen(uuid),
  public.anleitung_loeschen(uuid), public.arbeitsplaetze_liste(), public.arbeitsplatz_speichern(jsonb, boolean),
  public.arbeitsplatz_loeschen(text), public.team_liste(), public.einladen(text, text, text[]),
  public.einladung_zuruecknehmen(text), public.mitglied_aendern(uuid, text, text[]),
  public.mitglied_entfernen(uuid), public._letzte_anleitung_pruefen(uuid),
  public._fassung_de_bauen(uuid), public._sprachfassung_bauen(uuid, text)
  to authenticated;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_konto_pruefen(jsonb) to supabase_auth_admin;
