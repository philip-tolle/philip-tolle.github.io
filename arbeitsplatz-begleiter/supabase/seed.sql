-- Beispieldaten: Arbeitsplätze „Bankett“ und „Housekeeping Etage 2“, zwei Anleitungen, Übersetzungen (maschinell)
-- Automatisch erzeugt mit „npm run sql“ aus src/daten/. Nicht von Hand ändern.


insert into public.arbeitsplaetze (id, name, angebotene_sprachen, ansprechperson, ansprechperson_in) values
  ('bankett', 'Bankett', array['de', 'en', 'uk', 'ru', 'ar', 'tr', 'ro', 'pl', 'bg', 'hr', 'es', 'it', 'vi', 'fa', 'prs', 'ti']::text[], 'Frau Weber', '{"en":"Ms Weber","uk":"пані Вебер","ar":"السيدة فيبر","tr":"Weber Hanım"}'::jsonb),
  ('housekeeping-etage-2', 'Housekeeping Etage 2', array['de', 'en', 'uk', 'ru', 'ar', 'tr', 'ro', 'pl', 'bg', 'hr', 'es', 'it', 'vi', 'fa', 'prs', 'ti']::text[], 'Frau Weber', '{"en":"Ms Weber","uk":"пані Вебер","ar":"السيدة فيبر","tr":"Weber Hanım"}'::jsonb)
on conflict (id) do nothing;

insert into public.anleitungen (id, titel_de, originaltext, ansprechperson, ansprechperson_in, zielsprachen, titelbild_url) values
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'Einen Platz fürs Bankett eindecken', 'Mise en place Bankett – Eindecken eines Gedecks: Vor Arbeitsbeginn Hände gründlich waschen. Speiseteller mittig vor dem Stuhl platzieren, Abstand zur Tischkante ca. eine Daumenbreite. Gabel links neben den Teller, Zinken nach oben. Messer rechts, Schneide zum Teller. Löffel rechts neben dem Messer, Mulde nach oben. Glas oberhalb der Messerspitze eindecken. Vorgefaltete Serviette auf dem Teller platzieren. Abschließend Gedeck auf Symmetrie kontrollieren.', 'Frau Weber', '{"en":"Ms Weber","uk":"пані Вебер","ar":"السيدة فيبر","tr":"Weber Hanım"}'::jsonb, array['en', 'uk', 'ar', 'tr']::text[], 'bilder/beispiel/bankett-titel.svg'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'Ein Bad im Hotel·zimmer putzen', 'Reinigung Badezimmer (Gästezimmer): Schutzhandschuhe anlegen. Für ausreichende Belüftung sorgen (Fenster öffnen bzw. Abluftventilator einschalten). Sanitärreiniger auf Waschtisch und Duschbereich aufsprühen, Einwirkzeit 2 Minuten. Reinigungsmittel niemals mischen – Gefahr giftiger Gase. Farbcodierung beachten: gelbes Tuch für Waschtisch, Dusche und Fliesen; rotes Tuch ausschließlich für das WC. Frische Handtücher auslegen (2 Badetücher, 2 Handtücher). Handschuhe ausziehen, Hände waschen.', 'Frau Weber', '{"en":"Ms Weber","uk":"пані Вебер","ar":"السيدة فيبر","tr":"Weber Hanım"}'::jsonb, array['en', 'uk', 'ar', 'tr']::text[], 'bilder/beispiel/bad-titel.svg')
on conflict (id) do nothing;

insert into public.anleitung_arbeitsplatz (anleitung_id, arbeitsplatz_id) values
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'bankett'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'housekeeping-etage-2')
on conflict do nothing;

insert into public.schritte (id, anleitung_id, position, text_de, hinweis_de, bildwort, bild_url, achtung) values
  ('e84428d9-ff46-5370-a82b-2bf3bff9a3ff', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 1, 'Wasch dir die Hände.', 'Mit Seife. Dann gut ab·trocknen.', 'Hände waschen', 'bilder/beispiel/haende-waschen.svg', false),
  ('433bb810-3c71-59fb-b742-8b68898b6ed7', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 2, 'Stell den Teller in die Mitte vom Platz.', 'Der Teller ist 1 Daumen breit weg von der Tisch·kante.', 'Teller', 'bilder/beispiel/bankett-teller.svg', false),
  ('af977a5e-7fd8-58d6-864b-585debc3b1a6', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 3, 'Leg die Gabel links neben den Teller.', 'Die Zinken zeigen nach oben.', 'Gabel', 'bilder/beispiel/bankett-gabel.svg', false),
  ('979bb1fd-85f8-5190-969c-ab3cab1b8a54', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 4, 'Leg das Messer rechts neben den Teller.', 'Die scharfe Seite zeigt zum Teller.', 'Messer', 'bilder/beispiel/bankett-messer.svg', false),
  ('aeadc9f1-0c6e-5090-b3cf-27a30700992b', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 5, 'Leg den Löffel rechts neben das Messer.', 'Die Mulde zeigt nach oben.', 'Löffel', 'bilder/beispiel/bankett-loeffel.svg', false),
  ('f142369e-7b1e-5f8f-ae37-e8b40f7c9e29', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 6, 'Stell das Glas über das Messer.', 'Das Glas steht oben rechts vom Teller.', 'Glas', 'bilder/beispiel/bankett-glas.svg', false),
  ('3b8bc98a-16e4-5210-830a-8ecf72e6c6f3', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 7, 'Leg die Serviette auf den Teller.', 'Die Serviette ist schon gefaltet.', 'Serviette', 'bilder/beispiel/bankett-serviette.svg', false),
  ('341de0a1-43c1-5154-9b08-5dde5a142f40', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 8, 'Schau noch einmal auf den Tisch.', 'Liegt alles gerade? Dann bist du fertig.', 'prüfen', 'bilder/beispiel/bankett-pruefen.svg', false),
  ('bd477cda-c1ca-55f3-b69d-4ef84cefd40e', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 1, 'Zieh Hand·schuhe an.', 'Reiniger sind scharf für die Haut.', 'Handschuhe', 'bilder/beispiel/handschuhe-anziehen.svg', true),
  ('df0145c1-8c10-52af-9d37-642681c8c1a2', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 2, 'Mach das Fenster auf oder den Lüfter an.', 'Dann kommt frische Luft ins Bad.', 'Fenster', 'bilder/beispiel/fenster-luefter.svg', false),
  ('dc9e31ec-24d6-5769-933b-cc41c6621843', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 3, 'Sprüh Bad·reiniger auf Wasch·becken und Dusche.', 'Lass ihn 2 Minuten wirken.', 'Sprühflasche', 'bilder/beispiel/spruehflasche.svg', false),
  ('87f8c011-00a1-5f91-a37a-1cabe150ef76', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 4, 'Nimm immer nur 1 Reiniger.', '2 Reiniger zusammen machen giftige Luft.', 'Achtung', 'bilder/beispiel/nur-ein-reiniger.svg', true),
  ('3319c823-1700-5604-b1c3-3c37091b1d6c', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 5, 'Putz Wasch·becken und Dusche mit dem gelben Tuch.', 'Gelb ist für Wasch·becken, Dusche und Fliesen.', 'Lappen', 'bilder/beispiel/gelbes-tuch.svg', false),
  ('ff3f56aa-3622-5b12-8488-7f403ccf4abf', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 6, 'Putz die Toilette mit dem roten Tuch.', 'Rot ist nur für die Toilette.', 'Toilette', 'bilder/beispiel/rotes-tuch.svg', false),
  ('ad7bfa05-5d9e-5d9c-9fc2-4d757382be6e', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 7, 'Leg frische Hand·tücher hin.', '2 große und 2 kleine Hand·tücher.', 'Handtuch', 'bilder/beispiel/handtuecher.svg', false),
  ('1c873048-1530-5ab6-9460-4a0bb9368142', 'baed9abd-d110-5b85-8c8c-04f97dc7e995', 8, 'Zieh die Hand·schuhe aus und wasch dir die Hände.', 'Mit Seife.', 'Hände waschen', 'bilder/beispiel/handschuhe-ausziehen.svg', false)
on conflict (id) do nothing;

insert into public.anleitung_sprachen (anleitung_id, sprache, titel, status) values
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'en', 'Setting a place for a banquet', 'freigegeben'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'en', 'Cleaning a bathroom in a hotel room', 'freigegeben'),
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'uk', 'Накрити місце на банкеті', 'freigegeben'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'uk', 'Прибрати ванну кімнату в номері готелю', 'freigegeben'),
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'ar', 'تجهيز مكان على طاولة الحفل', 'freigegeben'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'ar', 'تنظيف الحمّام في غرفة الفندق', 'freigegeben'),
  ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'tr', 'Banket için bir kişilik yer hazırlamak', 'freigegeben'),
  ('baed9abd-d110-5b85-8c8c-04f97dc7e995', 'tr', 'Otel odasında banyoyu temizlemek', 'freigegeben')
on conflict do nothing;

insert into public.schritt_uebersetzungen (schritt_id, sprache, text, hinweis, rueckuebersetzung, unsicher, grund, status, basiert_auf_version) values
  ('e84428d9-ff46-5370-a82b-2bf3bff9a3ff', 'en', 'Wash your hands.', 'Use soap. Then dry them well.', 'Wasch deine Hände. | Benutze Seife. Dann trockne sie gut ab.', false, '', 'maschinell', 1),
  ('433bb810-3c71-59fb-b742-8b68898b6ed7', 'en', 'Put the plate in the middle of the place setting.', 'The plate is 1 thumb width away from the edge of the table.', 'Stell den Teller in die Mitte vom Gedeck. | Der Teller ist 1 Daumenbreite von der Tischkante weg.', false, '', 'maschinell', 1),
  ('af977a5e-7fd8-58d6-864b-585debc3b1a6', 'en', 'Put the fork to the left of the plate.', 'The prongs face up.', 'Leg die Gabel links vom Teller. | Die Zinken zeigen nach oben.', false, '', 'maschinell', 1),
  ('979bb1fd-85f8-5190-969c-ab3cab1b8a54', 'en', 'Put the knife to the right of the plate.', 'The sharp side faces the plate.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite zeigt zum Teller.', false, '', 'maschinell', 1),
  ('aeadc9f1-0c6e-5090-b3cf-27a30700992b', 'en', 'Put the spoon to the right of the knife.', 'The round part of the spoon faces up.', 'Leg den Löffel rechts vom Messer. | Der runde Teil vom Löffel zeigt nach oben.', false, '', 'maschinell', 1),
  ('f142369e-7b1e-5f8f-ae37-e8b40f7c9e29', 'en', 'Put the glass above the knife.', 'The glass stands at the top right of the plate.', 'Stell das Glas über das Messer. | Das Glas steht oben rechts vom Teller.', false, '', 'maschinell', 1),
  ('3b8bc98a-16e4-5210-830a-8ecf72e6c6f3', 'en', 'Put the napkin on the plate.', 'The napkin is already folded.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon gefaltet.', false, '', 'maschinell', 1),
  ('341de0a1-43c1-5154-9b08-5dde5a142f40', 'en', 'Look at the table one more time.', 'Is everything straight? Then you are done.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann bist du fertig.', false, '', 'maschinell', 1),
  ('bd477cda-c1ca-55f3-b69d-4ef84cefd40e', 'en', 'Put on gloves.', 'Cleaning products are harsh on your skin.', 'Zieh Handschuhe an. | Putzmittel sind aggressiv für deine Haut.', false, '', 'maschinell', 1),
  ('df0145c1-8c10-52af-9d37-642681c8c1a2', 'en', 'Open the window or switch on the fan.', 'Then fresh air comes into the bathroom.', 'Mach das Fenster auf oder schalte den Ventilator ein. | Dann kommt frische Luft ins Bad.', false, '', 'maschinell', 1),
  ('dc9e31ec-24d6-5769-933b-cc41c6621843', 'en', 'Spray bathroom cleaner on the sink and the shower.', 'Leave it on for 2 minutes.', 'Sprüh Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten drauf.', false, '', 'maschinell', 1),
  ('87f8c011-00a1-5f91-a37a-1cabe150ef76', 'en', 'Always use only 1 cleaner.', '2 cleaners together make poisonous air.', 'Benutze immer nur 1 Reiniger. | 2 Reiniger zusammen machen giftige Luft.', false, '', 'maschinell', 1),
  ('3319c823-1700-5604-b1c3-3c37091b1d6c', 'en', 'Clean the sink and the shower with the yellow cloth.', 'Yellow is for the sink, the shower and the tiles.', 'Putz das Waschbecken und die Dusche mit dem gelben Tuch. | Gelb ist für das Waschbecken, die Dusche und die Fliesen.', false, '', 'maschinell', 1),
  ('ff3f56aa-3622-5b12-8488-7f403ccf4abf', 'en', 'Clean the toilet with the red cloth.', 'Red is only for the toilet.', 'Putz die Toilette mit dem roten Tuch. | Rot ist nur für die Toilette.', false, '', 'maschinell', 1),
  ('ad7bfa05-5d9e-5d9c-9fc2-4d757382be6e', 'en', 'Put out fresh towels.', '2 big towels and 2 small towels.', 'Leg frische Handtücher hin. | 2 große Handtücher und 2 kleine Handtücher.', false, '', 'maschinell', 1),
  ('1c873048-1530-5ab6-9460-4a0bb9368142', 'en', 'Take off the gloves and wash your hands.', 'Use soap.', 'Zieh die Handschuhe aus und wasch deine Hände. | Benutze Seife.', false, '', 'maschinell', 1),
  ('e84428d9-ff46-5370-a82b-2bf3bff9a3ff', 'uk', 'Помий руки.', 'З милом. Потім добре витри їх.', 'Wasch die Hände. | Mit Seife. Dann trockne sie gut ab.', false, '', 'maschinell', 1),
  ('433bb810-3c71-59fb-b742-8b68898b6ed7', 'uk', 'Постав тарілку посередині місця.', 'Тарілка стоїть на ширину 1 великого пальця від краю стола.', 'Stell den Teller in die Mitte vom Platz. | Der Teller steht 1 Daumenbreite von der Tischkante entfernt.', false, '', 'maschinell', 1),
  ('af977a5e-7fd8-58d6-864b-585debc3b1a6', 'uk', 'Поклади виделку зліва від тарілки.', 'Зубці дивляться вгору.', 'Leg die Gabel links vom Teller. | Die Zinken schauen nach oben.', false, '', 'maschinell', 1),
  ('979bb1fd-85f8-5190-969c-ab3cab1b8a54', 'uk', 'Поклади ніж справа від тарілки.', 'Гострий бік дивиться на тарілку.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite schaut zum Teller.', false, '', 'maschinell', 1),
  ('aeadc9f1-0c6e-5090-b3cf-27a30700992b', 'uk', 'Поклади ложку справа від ножа.', 'Ложка лежить заглибленням угору.', 'Leg den Löffel rechts vom Messer. | Der Löffel liegt mit der Vertiefung nach oben.', false, '', 'maschinell', 1),
  ('f142369e-7b1e-5f8f-ae37-e8b40f7c9e29', 'uk', 'Постав келих над ножем.', 'Келих стоїть угорі справа від тарілки.', 'Stell das Stielglas über das Messer. | Das Stielglas steht oben rechts vom Teller.', true, '„Glas“ ist nicht eindeutig: келих = Glas mit Stiel, склянка = Wasserglas ohne Stiel. Bitte festlegen, welches Glas gemeint ist.', 'maschinell', 1),
  ('3b8bc98a-16e4-5210-830a-8ecf72e6c6f3', 'uk', 'Поклади серветку на тарілку.', 'Серветка вже складена.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon gefaltet.', false, '', 'maschinell', 1),
  ('341de0a1-43c1-5154-9b08-5dde5a142f40', 'uk', 'Ще раз подивися на стіл.', 'Усе лежить рівно? Тоді все готово.', 'Schau noch einmal auf den Tisch. | Liegt alles gerade? Dann ist alles fertig.', false, '', 'maschinell', 1),
  ('bd477cda-c1ca-55f3-b69d-4ef84cefd40e', 'uk', 'Одягни рукавички.', 'Засоби для чищення шкідливі для шкіри.', 'Zieh Handschuhe an. | Putzmittel sind schädlich für die Haut.', false, '', 'maschinell', 1),
  ('df0145c1-8c10-52af-9d37-642681c8c1a2', 'uk', 'Відчини вікно або увімкни вентилятор.', 'Тоді у ванну кімнату зайде свіже повітря.', 'Mach das Fenster auf oder schalte den Ventilator ein. | Dann kommt frische Luft ins Bad.', false, '', 'maschinell', 1),
  ('dc9e31ec-24d6-5769-933b-cc41c6621843', 'uk', 'Розпили засіб для ванної на умивальник і душ.', 'Нехай засіб діє 2 хвилини.', 'Sprüh das Mittel fürs Bad auf das Waschbecken und die Dusche. | Lass das Mittel 2 Minuten wirken.', false, '', 'maschinell', 1),
  ('87f8c011-00a1-5f91-a37a-1cabe150ef76', 'uk', 'Завжди бери тільки 1 засіб.', 'Якщо змішати 2 засоби, повітря стає отруйним.', 'Nimm immer nur 1 Mittel. | Wenn man 2 Mittel mischt, wird die Luft giftig.', false, '', 'maschinell', 1),
  ('3319c823-1700-5604-b1c3-3c37091b1d6c', 'uk', 'Помий умивальник і душ жовтою ганчіркою.', 'Жовта ганчірка — для умивальника, душу і плитки.', 'Putz Waschbecken und Dusche mit dem gelben Lappen. | Der gelbe Lappen ist für Waschbecken, Dusche und Fliesen.', false, '', 'maschinell', 1),
  ('ff3f56aa-3622-5b12-8488-7f403ccf4abf', 'uk', 'Помий унітаз червоною ганчіркою.', 'Червона ганчірка — тільки для унітаза.', 'Putz die Toilette mit dem roten Lappen. | Der rote Lappen ist nur für die Toilette.', false, '', 'maschinell', 1),
  ('ad7bfa05-5d9e-5d9c-9fc2-4d757382be6e', 'uk', 'Поклади свіжі рушники.', '2 великі і 2 маленькі рушники.', 'Leg frische Handtücher hin. | 2 große und 2 kleine Handtücher.', false, '', 'maschinell', 1),
  ('1c873048-1530-5ab6-9460-4a0bb9368142', 'uk', 'Зніми рукавички і помий руки.', 'З милом.', 'Zieh die Handschuhe aus und wasch die Hände. | Mit Seife.', false, '', 'maschinell', 1),
  ('e84428d9-ff46-5370-a82b-2bf3bff9a3ff', 'ar', 'اغسل يديك.', 'بالصابون. ثم جفّفهما جيدًا.', 'Wasch deine Hände. | Mit Seife. Dann trockne sie gut ab.', false, '', 'maschinell', 1),
  ('433bb810-3c71-59fb-b742-8b68898b6ed7', 'ar', 'ضع الصحن في وسط المكان.', 'بين الصحن وحافة الطاولة مسافة بعرض إبهام واحد.', 'Stell den Teller in die Mitte vom Platz. | Zwischen Teller und Tischkante ist ein Abstand von einer Daumenbreite.', true, '„1 Daumen breit“ ist als Maß im Arabischen ungewohnt. Bitte prüfen, ob es so verstanden wird.', 'maschinell', 1),
  ('af977a5e-7fd8-58d6-864b-585debc3b1a6', 'ar', 'ضع الشوكة على يسار الصحن.', 'أسنان الشوكة إلى الأعلى.', 'Leg die Gabel links vom Teller. | Die Zähne der Gabel nach oben.', false, '', 'maschinell', 1),
  ('979bb1fd-85f8-5190-969c-ab3cab1b8a54', 'ar', 'ضع السكين على يمين الصحن.', 'الجهة الحادة نحو الصحن.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite zum Teller.', false, '', 'maschinell', 1),
  ('aeadc9f1-0c6e-5090-b3cf-27a30700992b', 'ar', 'ضع الملعقة على يمين السكين.', 'الجزء المجوّف من الملعقة إلى الأعلى.', 'Leg den Löffel rechts vom Messer. | Der hohle Teil vom Löffel nach oben.', false, '', 'maschinell', 1),
  ('f142369e-7b1e-5f8f-ae37-e8b40f7c9e29', 'ar', 'ضع الكأس فوق السكين.', 'الكأس في الأعلى، على يمين الصحن.', 'Stell das Glas auf das Messer. | Das Glas ist oben, rechts vom Teller.', true, '„über das Messer“: فوق kann auch „auf dem Messer“ heißen. Gemeint ist: oberhalb vom Messer, zur Tischmitte hin.', 'maschinell', 1),
  ('3b8bc98a-16e4-5210-830a-8ecf72e6c6f3', 'ar', 'ضع المنديل على الصحن.', 'المنديل مطويّ من قبل.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon vorher gefaltet.', false, '', 'maschinell', 1),
  ('341de0a1-43c1-5154-9b08-5dde5a142f40', 'ar', 'انظر إلى الطاولة مرة أخرى.', 'هل كل شيء مستقيم؟ إذن انتهيت.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann bist du fertig.', false, '', 'maschinell', 1),
  ('bd477cda-c1ca-55f3-b69d-4ef84cefd40e', 'ar', 'البس القفازات.', 'مواد التنظيف تؤذي الجلد.', 'Zieh die Handschuhe an. | Putzmittel schaden der Haut.', false, '', 'maschinell', 1),
  ('df0145c1-8c10-52af-9d37-642681c8c1a2', 'ar', 'افتح النافذة أو شغّل المروحة.', 'هكذا يدخل هواء نقي إلى الحمّام.', 'Mach das Fenster auf oder schalte den Ventilator ein. | So kommt frische Luft ins Bad.', false, '', 'maschinell', 1),
  ('dc9e31ec-24d6-5769-933b-cc41c6621843', 'ar', 'رُشّ منظّف الحمّام على المغسلة والدُّش.', 'اتركه يعمل لمدة 2 دقيقة.', 'Sprüh den Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten lang wirken.', false, '', 'maschinell', 1),
  ('87f8c011-00a1-5f91-a37a-1cabe150ef76', 'ar', 'استعمل دائمًا منظّفًا واحدًا فقط.', 'إذا خلطتَ منظّفَين، يصبح الهواء سامًّا.', 'Benutze immer nur einen Reiniger. | Wenn du zwei Reiniger mischst, wird die Luft giftig.', false, '', 'maschinell', 1),
  ('3319c823-1700-5604-b1c3-3c37091b1d6c', 'ar', 'نظّف المغسلة والدُّش بالقماشة الصفراء.', 'القماشة الصفراء للمغسلة والدُّش والبلاط.', 'Putz Waschbecken und Dusche mit dem gelben Tuch. | Das gelbe Tuch ist für Waschbecken, Dusche und Fliesen.', false, '', 'maschinell', 1),
  ('ff3f56aa-3622-5b12-8488-7f403ccf4abf', 'ar', 'نظّف المرحاض بالقماشة الحمراء.', 'القماشة الحمراء للمرحاض فقط.', 'Putz die Toilette mit dem roten Tuch. | Das rote Tuch ist nur für die Toilette.', false, '', 'maschinell', 1),
  ('ad7bfa05-5d9e-5d9c-9fc2-4d757382be6e', 'ar', 'ضع مناشف نظيفة.', '2 مناشف كبيرة و2 مناشف صغيرة.', 'Leg saubere Handtücher hin. | 2 große Handtücher und 2 kleine Handtücher.', false, '', 'maschinell', 1),
  ('1c873048-1530-5ab6-9460-4a0bb9368142', 'ar', 'اخلع القفازات واغسل يديك.', 'بالصابون.', 'Zieh die Handschuhe aus und wasch deine Hände. | Mit Seife.', false, '', 'maschinell', 1),
  ('e84428d9-ff46-5370-a82b-2bf3bff9a3ff', 'tr', 'Ellerini yıka.', 'Sabunla. Sonra iyice kurula.', 'Wasch deine Hände. | Mit Seife. Dann gut abtrocknen.', false, '', 'maschinell', 1),
  ('433bb810-3c71-59fb-b742-8b68898b6ed7', 'tr', 'Tabağı yerin ortasına koy.', 'Tabak ile masanın kenarı arasında 1 başparmak boşluk olsun.', 'Stell den Teller in die Mitte vom Platz. | Zwischen Teller und Tischkante soll 1 Daumen Platz sein.', false, '', 'maschinell', 1),
  ('af977a5e-7fd8-58d6-864b-585debc3b1a6', 'tr', 'Çatalı tabağın soluna koy.', 'Çatalın dişleri yukarı baksın.', 'Leg die Gabel links vom Teller. | Die Zähne der Gabel sollen nach oben schauen.', true, '„nach oben“ kann „zur Decke“ oder „zum oberen Tischrand“ heißen. Gemeint ist vermutlich: Zinken zur Decke.', 'maschinell', 1),
  ('979bb1fd-85f8-5190-969c-ab3cab1b8a54', 'tr', 'Bıçağı tabağın sağına koy.', 'Bıçağın keskin tarafı tabağa baksın.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite vom Messer soll zum Teller schauen.', false, '', 'maschinell', 1),
  ('aeadc9f1-0c6e-5090-b3cf-27a30700992b', 'tr', 'Kaşığı bıçağın sağına koy.', 'Kaşığın çukur tarafı yukarı baksın.', 'Leg den Löffel rechts vom Messer. | Die hohle Seite vom Löffel soll nach oben schauen.', false, '', 'maschinell', 1),
  ('f142369e-7b1e-5f8f-ae37-e8b40f7c9e29', 'tr', 'Bardağı bıçağın üst tarafına koy.', 'Bardak, tabağın sağ üst tarafında durur.', 'Stell das Glas an die obere Seite vom Messer. | Das Glas steht oben rechts vom Teller.', false, '', 'maschinell', 1),
  ('3b8bc98a-16e4-5210-830a-8ecf72e6c6f3', 'tr', 'Peçeteyi tabağın üstüne koy.', 'Peçete zaten katlanmış.', 'Leg die Serviette oben auf den Teller. | Die Serviette ist schon gefaltet.', false, '', 'maschinell', 1),
  ('341de0a1-43c1-5154-9b08-5dde5a142f40', 'tr', 'Masaya bir kez daha bak.', 'Her şey düz mü? O zaman işin bitti.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann ist deine Arbeit fertig.', false, '', 'maschinell', 1),
  ('bd477cda-c1ca-55f3-b69d-4ef84cefd40e', 'tr', 'Eldiven giy.', 'Temizlik malzemeleri cilde zarar verir.', 'Zieh Handschuhe an. | Putzmittel schaden der Haut.', false, '', 'maschinell', 1),
  ('df0145c1-8c10-52af-9d37-642681c8c1a2', 'tr', 'Pencereyi aç ya da fanı çalıştır.', 'Böylece banyoya temiz hava girer.', 'Mach das Fenster auf oder schalte den Lüfter ein. | So kommt frische Luft ins Bad.', false, '', 'maschinell', 1),
  ('dc9e31ec-24d6-5769-933b-cc41c6621843', 'tr', 'Banyo temizleyicisini lavaboya ve duşa sık.', '2 dakika beklet.', 'Sprüh den Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten stehen.', false, '', 'maschinell', 1),
  ('87f8c011-00a1-5f91-a37a-1cabe150ef76', 'tr', 'Her zaman sadece 1 temizleyici kullan.', '2 temizleyici karışınca zehirli gaz çıkar.', 'Benutze immer nur 1 Reiniger. | Wenn sich 2 Reiniger mischen, entsteht giftiges Gas.', false, '', 'maschinell', 1),
  ('3319c823-1700-5604-b1c3-3c37091b1d6c', 'tr', 'Lavaboyu ve duşu sarı bezle temizle.', 'Sarı bez lavabo, duş ve fayanslar içindir.', 'Putz Waschbecken und Dusche mit dem gelben Tuch. | Das gelbe Tuch ist für Waschbecken, Dusche und Fliesen.', false, '', 'maschinell', 1),
  ('ff3f56aa-3622-5b12-8488-7f403ccf4abf', 'tr', 'Tuvaleti kırmızı bezle temizle.', 'Kırmızı bez sadece tuvalet içindir.', 'Putz die Toilette mit dem roten Tuch. | Das rote Tuch ist nur für die Toilette.', false, '', 'maschinell', 1),
  ('ad7bfa05-5d9e-5d9c-9fc2-4d757382be6e', 'tr', 'Temiz havlu koy.', '2 büyük ve 2 küçük havlu.', 'Leg saubere Handtücher hin. | 2 große und 2 kleine Handtücher.', false, '', 'maschinell', 1),
  ('1c873048-1530-5ab6-9460-4a0bb9368142', 'tr', 'Eldivenleri çıkar ve ellerini yıka.', 'Sabunla.', 'Zieh die Handschuhe aus und wasch deine Hände. | Mit Seife.', false, '', 'maschinell', 1)
on conflict do nothing;

-- Deutsch freigeben, dann die Sprachfassungen (Testdaten, von keinem Sprachpaten geprüft).
update public.anleitungen
  set fassung_de = public._fassung_de_bauen(id), status_de = 'freigegeben', freigegeben_am = now()
  where id in ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'baed9abd-d110-5b85-8c8c-04f97dc7e995') and fassung_de is null;

update public.anleitung_sprachen
  set fassung = public._sprachfassung_bauen(anleitung_id, sprache), freigegeben_am = now()
  where anleitung_id in ('3350e16e-5d19-5e0b-a36a-5552dcf8efd4', 'baed9abd-d110-5b85-8c8c-04f97dc7e995') and fassung is null;
