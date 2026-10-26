import type {
  Anleitung,
  AnleitungSprache,
  Ansprechperson,
  Arbeitsplatz,
  Schritt,
  SchrittUebersetzung,
} from '../typen';
import { SPRACHEN } from './sprachen';

// Beispieldaten für Phase 1 (noch ohne Datenbank).
//
// Wichtig für den Test: Die Schritt-Übersetzungen haben den Status
// „maschinell“, also von keinem Sprachpaten geprüft. Die Sprachfassungen
// sind trotzdem als „freigegeben“ markiert (freigegeben_von: „Testdaten“),
// damit sie auf dem Tablet erscheinen. Genau dieser Fall – freigegeben, aber
// Sicherheitsschritte ungeprüft – zeigt das Achtung-Symbol mit deutschem Satz.

const HEUTE = '2026-10-26';
const BILDER = 'bilder/beispiel/';

export const FRAU_WEBER: Ansprechperson = {
  name: 'Frau Weber',
  name_in: {
    en: 'Ms Weber',
    uk: 'пані Вебер',
    ar: 'السيدة فيبر',
    tr: 'Weber Hanım',
  },
};

export const ARBEITSPLAETZE: Arbeitsplatz[] = [
  {
    id: 'bankett',
    name: 'Bankett',
    angebotene_sprachen: SPRACHEN.map((s) => s.code),
    ansprechperson: FRAU_WEBER,
  },
  {
    id: 'housekeeping-etage-2',
    name: 'Housekeeping Etage 2',
    angebotene_sprachen: SPRACHEN.map((s) => s.code),
    ansprechperson: FRAU_WEBER,
  },
];

export const ANLEITUNGEN: Anleitung[] = [
  {
    id: 'bankett-eindecken',
    titel_de: 'Einen Platz fürs Bankett eindecken',
    originaltext:
      'Mise en place Bankett – Eindecken eines Gedecks: Vor Arbeitsbeginn Hände gründlich waschen. ' +
      'Speiseteller mittig vor dem Stuhl platzieren, Abstand zur Tischkante ca. eine Daumenbreite. ' +
      'Gabel links neben den Teller, Zinken nach oben. Messer rechts, Schneide zum Teller. ' +
      'Löffel rechts neben dem Messer, Mulde nach oben. Glas oberhalb der Messerspitze eindecken. ' +
      'Vorgefaltete Serviette auf dem Teller platzieren. Abschließend Gedeck auf Symmetrie kontrollieren.',
    ansprechperson: FRAU_WEBER,
    status_de: 'freigegeben',
    arbeitsplaetze: ['bankett'],
    titelbild_url: BILDER + 'bankett-titel.svg',
    erstellt_am: HEUTE,
    geaendert_am: HEUTE,
  },
  {
    id: 'bad-putzen',
    titel_de: 'Ein Bad im Hotel·zimmer putzen',
    originaltext:
      'Reinigung Badezimmer (Gästezimmer): Schutzhandschuhe anlegen. Für ausreichende Belüftung sorgen ' +
      '(Fenster öffnen bzw. Abluftventilator einschalten). Sanitärreiniger auf Waschtisch und Duschbereich ' +
      'aufsprühen, Einwirkzeit 2 Minuten. Reinigungsmittel niemals mischen – Gefahr giftiger Gase. ' +
      'Farbcodierung beachten: gelbes Tuch für Waschtisch, Dusche und Fliesen; rotes Tuch ausschließlich für das WC. ' +
      'Frische Handtücher auslegen (2 Badetücher, 2 Handtücher). Handschuhe ausziehen, Hände waschen.',
    ansprechperson: FRAU_WEBER,
    status_de: 'freigegeben',
    arbeitsplaetze: ['housekeeping-etage-2'],
    titelbild_url: BILDER + 'bad-titel.svg',
    erstellt_am: HEUTE,
    geaendert_am: HEUTE,
  },
];

// Format: Satz | Hinweis | Bild | achtung (wie im Lastenheft)
type SchrittZeile = [text: string, hinweis: string, bildwort: string, bild: string, achtung: boolean];

const SCHRITTE_DE: Record<string, SchrittZeile[]> = {
  'bankett-eindecken': [
    ['Wasch dir die Hände.', 'Mit Seife. Dann gut ab·trocknen.', 'Hände waschen', 'haende-waschen', false],
    ['Stell den Teller in die Mitte vom Platz.', 'Der Teller ist 1 Daumen breit weg von der Tisch·kante.', 'Teller', 'bankett-teller', false],
    ['Leg die Gabel links neben den Teller.', 'Die Zinken zeigen nach oben.', 'Gabel', 'bankett-gabel', false],
    ['Leg das Messer rechts neben den Teller.', 'Die scharfe Seite zeigt zum Teller.', 'Messer', 'bankett-messer', false],
    ['Leg den Löffel rechts neben das Messer.', 'Die Mulde zeigt nach oben.', 'Löffel', 'bankett-loeffel', false],
    ['Stell das Glas über das Messer.', 'Das Glas steht oben rechts vom Teller.', 'Glas', 'bankett-glas', false],
    ['Leg die Serviette auf den Teller.', 'Die Serviette ist schon gefaltet.', 'Serviette', 'bankett-serviette', false],
    ['Schau noch einmal auf den Tisch.', 'Liegt alles gerade? Dann bist du fertig.', 'prüfen', 'bankett-pruefen', false],
  ],
  'bad-putzen': [
    ['Zieh Hand·schuhe an.', 'Reiniger sind scharf für die Haut.', 'Handschuhe', 'handschuhe-anziehen', true],
    ['Mach das Fenster auf oder den Lüfter an.', 'Dann kommt frische Luft ins Bad.', 'Fenster', 'fenster-luefter', false],
    ['Sprüh Bad·reiniger auf Wasch·becken und Dusche.', 'Lass ihn 2 Minuten wirken.', 'Sprühflasche', 'spruehflasche', false],
    ['Nimm immer nur 1 Reiniger.', '2 Reiniger zusammen machen giftige Luft.', 'Achtung', 'nur-ein-reiniger', true],
    ['Putz Wasch·becken und Dusche mit dem gelben Tuch.', 'Gelb ist für Wasch·becken, Dusche und Fliesen.', 'Lappen', 'gelbes-tuch', false],
    ['Putz die Toilette mit dem roten Tuch.', 'Rot ist nur für die Toilette.', 'Toilette', 'rotes-tuch', false],
    ['Leg frische Hand·tücher hin.', '2 große und 2 kleine Hand·tücher.', 'Handtuch', 'handtuecher', false],
    ['Zieh die Hand·schuhe aus und wasch dir die Hände.', 'Mit Seife.', 'Hände waschen', 'handschuhe-ausziehen', false],
  ],
};

const KURZ: Record<string, string> = { 'bankett-eindecken': 'bankett', 'bad-putzen': 'bad' };

export const SCHRITTE: Schritt[] = Object.entries(SCHRITTE_DE).flatMap(([anleitungId, zeilen]) =>
  zeilen.map(([text, hinweis, bildwort, bild, achtung], i) => ({
    id: `${KURZ[anleitungId]}-${i + 1}`,
    anleitung_id: anleitungId,
    position: i + 1,
    text_de: text,
    hinweis_de: hinweis,
    bildwort,
    bild_url: BILDER + bild + '.svg',
    achtung,
    version: 1,
  })),
);

// Maschinelle Übersetzungen mit Rückübersetzung.
// Format: Satz | Hinweis | Rückübersetzung | optional: Grund, warum unsicher
type UebersetzungsZeile = [text: string, hinweis: string, rueck: string, unsicherGrund?: string];
interface Sprachfassung {
  titel: string;
  schritte: Record<string, UebersetzungsZeile[]>;
}

const UEBERSETZUNGEN: Record<string, Record<string, Sprachfassung>> = {
  en: {
    'bankett-eindecken': {
      titel: 'Setting a place for a banquet',
      schritte: {
        bankett: [
          ['Wash your hands.', 'Use soap. Then dry them well.', 'Wasch deine Hände. | Benutze Seife. Dann trockne sie gut ab.'],
          ['Put the plate in the middle of the place setting.', 'The plate is 1 thumb width away from the edge of the table.', 'Stell den Teller in die Mitte vom Gedeck. | Der Teller ist 1 Daumenbreite von der Tischkante weg.'],
          ['Put the fork to the left of the plate.', 'The prongs face up.', 'Leg die Gabel links vom Teller. | Die Zinken zeigen nach oben.'],
          ['Put the knife to the right of the plate.', 'The sharp side faces the plate.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite zeigt zum Teller.'],
          ['Put the spoon to the right of the knife.', 'The round part of the spoon faces up.', 'Leg den Löffel rechts vom Messer. | Der runde Teil vom Löffel zeigt nach oben.'],
          ['Put the glass above the knife.', 'The glass stands at the top right of the plate.', 'Stell das Glas über das Messer. | Das Glas steht oben rechts vom Teller.'],
          ['Put the napkin on the plate.', 'The napkin is already folded.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon gefaltet.'],
          ['Look at the table one more time.', 'Is everything straight? Then you are done.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann bist du fertig.'],
        ],
      },
    },
    'bad-putzen': {
      titel: 'Cleaning a bathroom in a hotel room',
      schritte: {
        bad: [
          ['Put on gloves.', 'Cleaning products are harsh on your skin.', 'Zieh Handschuhe an. | Putzmittel sind aggressiv für deine Haut.'],
          ['Open the window or switch on the fan.', 'Then fresh air comes into the bathroom.', 'Mach das Fenster auf oder schalte den Ventilator ein. | Dann kommt frische Luft ins Bad.'],
          ['Spray bathroom cleaner on the sink and the shower.', 'Leave it on for 2 minutes.', 'Sprüh Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten drauf.'],
          ['Always use only 1 cleaner.', '2 cleaners together make poisonous air.', 'Benutze immer nur 1 Reiniger. | 2 Reiniger zusammen machen giftige Luft.'],
          ['Clean the sink and the shower with the yellow cloth.', 'Yellow is for the sink, the shower and the tiles.', 'Putz das Waschbecken und die Dusche mit dem gelben Tuch. | Gelb ist für das Waschbecken, die Dusche und die Fliesen.'],
          ['Clean the toilet with the red cloth.', 'Red is only for the toilet.', 'Putz die Toilette mit dem roten Tuch. | Rot ist nur für die Toilette.'],
          ['Put out fresh towels.', '2 big towels and 2 small towels.', 'Leg frische Handtücher hin. | 2 große Handtücher und 2 kleine Handtücher.'],
          ['Take off the gloves and wash your hands.', 'Use soap.', 'Zieh die Handschuhe aus und wasch deine Hände. | Benutze Seife.'],
        ],
      },
    },
  },
  uk: {
    'bankett-eindecken': {
      titel: 'Накрити місце на банкеті',
      schritte: {
        bankett: [
          ['Помий руки.', 'З милом. Потім добре витри їх.', 'Wasch die Hände. | Mit Seife. Dann trockne sie gut ab.'],
          ['Постав тарілку посередині місця.', 'Тарілка стоїть на ширину 1 великого пальця від краю стола.', 'Stell den Teller in die Mitte vom Platz. | Der Teller steht 1 Daumenbreite von der Tischkante entfernt.'],
          ['Поклади виделку зліва від тарілки.', 'Зубці дивляться вгору.', 'Leg die Gabel links vom Teller. | Die Zinken schauen nach oben.'],
          ['Поклади ніж справа від тарілки.', 'Гострий бік дивиться на тарілку.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite schaut zum Teller.'],
          ['Поклади ложку справа від ножа.', 'Ложка лежить заглибленням угору.', 'Leg den Löffel rechts vom Messer. | Der Löffel liegt mit der Vertiefung nach oben.'],
          ['Постав келих над ножем.', 'Келих стоїть угорі справа від тарілки.', 'Stell das Stielglas über das Messer. | Das Stielglas steht oben rechts vom Teller.', '„Glas“ ist nicht eindeutig: келих = Glas mit Stiel, склянка = Wasserglas ohne Stiel. Bitte festlegen, welches Glas gemeint ist.'],
          ['Поклади серветку на тарілку.', 'Серветка вже складена.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon gefaltet.'],
          ['Ще раз подивися на стіл.', 'Усе лежить рівно? Тоді все готово.', 'Schau noch einmal auf den Tisch. | Liegt alles gerade? Dann ist alles fertig.'],
        ],
      },
    },
    'bad-putzen': {
      titel: 'Прибрати ванну кімнату в номері готелю',
      schritte: {
        bad: [
          ['Одягни рукавички.', 'Засоби для чищення шкідливі для шкіри.', 'Zieh Handschuhe an. | Putzmittel sind schädlich für die Haut.'],
          ['Відчини вікно або увімкни вентилятор.', 'Тоді у ванну кімнату зайде свіже повітря.', 'Mach das Fenster auf oder schalte den Ventilator ein. | Dann kommt frische Luft ins Bad.'],
          ['Розпили засіб для ванної на умивальник і душ.', 'Нехай засіб діє 2 хвилини.', 'Sprüh das Mittel fürs Bad auf das Waschbecken und die Dusche. | Lass das Mittel 2 Minuten wirken.'],
          ['Завжди бери тільки 1 засіб.', 'Якщо змішати 2 засоби, повітря стає отруйним.', 'Nimm immer nur 1 Mittel. | Wenn man 2 Mittel mischt, wird die Luft giftig.'],
          ['Помий умивальник і душ жовтою ганчіркою.', 'Жовта ганчірка — для умивальника, душу і плитки.', 'Putz Waschbecken und Dusche mit dem gelben Lappen. | Der gelbe Lappen ist für Waschbecken, Dusche und Fliesen.'],
          ['Помий унітаз червоною ганчіркою.', 'Червона ганчірка — тільки для унітаза.', 'Putz die Toilette mit dem roten Lappen. | Der rote Lappen ist nur für die Toilette.'],
          ['Поклади свіжі рушники.', '2 великі і 2 маленькі рушники.', 'Leg frische Handtücher hin. | 2 große und 2 kleine Handtücher.'],
          ['Зніми рукавички і помий руки.', 'З милом.', 'Zieh die Handschuhe aus und wasch die Hände. | Mit Seife.'],
        ],
      },
    },
  },
  ar: {
    'bankett-eindecken': {
      titel: 'تجهيز مكان على طاولة الحفل',
      schritte: {
        bankett: [
          ['اغسل يديك.', 'بالصابون. ثم جفّفهما جيدًا.', 'Wasch deine Hände. | Mit Seife. Dann trockne sie gut ab.'],
          ['ضع الصحن في وسط المكان.', 'بين الصحن وحافة الطاولة مسافة بعرض إبهام واحد.', 'Stell den Teller in die Mitte vom Platz. | Zwischen Teller und Tischkante ist ein Abstand von einer Daumenbreite.', '„1 Daumen breit“ ist als Maß im Arabischen ungewohnt. Bitte prüfen, ob es so verstanden wird.'],
          ['ضع الشوكة على يسار الصحن.', 'أسنان الشوكة إلى الأعلى.', 'Leg die Gabel links vom Teller. | Die Zähne der Gabel nach oben.'],
          ['ضع السكين على يمين الصحن.', 'الجهة الحادة نحو الصحن.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite zum Teller.'],
          ['ضع الملعقة على يمين السكين.', 'الجزء المجوّف من الملعقة إلى الأعلى.', 'Leg den Löffel rechts vom Messer. | Der hohle Teil vom Löffel nach oben.'],
          ['ضع الكأس فوق السكين.', 'الكأس في الأعلى، على يمين الصحن.', 'Stell das Glas auf das Messer. | Das Glas ist oben, rechts vom Teller.', '„über das Messer“: فوق kann auch „auf dem Messer“ heißen. Gemeint ist: oberhalb vom Messer, zur Tischmitte hin.'],
          ['ضع المنديل على الصحن.', 'المنديل مطويّ من قبل.', 'Leg die Serviette auf den Teller. | Die Serviette ist schon vorher gefaltet.'],
          ['انظر إلى الطاولة مرة أخرى.', 'هل كل شيء مستقيم؟ إذن انتهيت.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann bist du fertig.'],
        ],
      },
    },
    'bad-putzen': {
      titel: 'تنظيف الحمّام في غرفة الفندق',
      schritte: {
        bad: [
          ['البس القفازات.', 'مواد التنظيف تؤذي الجلد.', 'Zieh die Handschuhe an. | Putzmittel schaden der Haut.'],
          ['افتح النافذة أو شغّل المروحة.', 'هكذا يدخل هواء نقي إلى الحمّام.', 'Mach das Fenster auf oder schalte den Ventilator ein. | So kommt frische Luft ins Bad.'],
          ['رُشّ منظّف الحمّام على المغسلة والدُّش.', 'اتركه يعمل لمدة 2 دقيقة.', 'Sprüh den Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten lang wirken.'],
          ['استعمل دائمًا منظّفًا واحدًا فقط.', 'إذا خلطتَ منظّفَين، يصبح الهواء سامًّا.', 'Benutze immer nur einen Reiniger. | Wenn du zwei Reiniger mischst, wird die Luft giftig.'],
          ['نظّف المغسلة والدُّش بالقماشة الصفراء.', 'القماشة الصفراء للمغسلة والدُّش والبلاط.', 'Putz Waschbecken und Dusche mit dem gelben Tuch. | Das gelbe Tuch ist für Waschbecken, Dusche und Fliesen.'],
          ['نظّف المرحاض بالقماشة الحمراء.', 'القماشة الحمراء للمرحاض فقط.', 'Putz die Toilette mit dem roten Tuch. | Das rote Tuch ist nur für die Toilette.'],
          ['ضع مناشف نظيفة.', '2 مناشف كبيرة و2 مناشف صغيرة.', 'Leg saubere Handtücher hin. | 2 große Handtücher und 2 kleine Handtücher.'],
          ['اخلع القفازات واغسل يديك.', 'بالصابون.', 'Zieh die Handschuhe aus und wasch deine Hände. | Mit Seife.'],
        ],
      },
    },
  },
  tr: {
    'bankett-eindecken': {
      titel: 'Banket için bir kişilik yer hazırlamak',
      schritte: {
        bankett: [
          ['Ellerini yıka.', 'Sabunla. Sonra iyice kurula.', 'Wasch deine Hände. | Mit Seife. Dann gut abtrocknen.'],
          ['Tabağı yerin ortasına koy.', 'Tabak ile masanın kenarı arasında 1 başparmak boşluk olsun.', 'Stell den Teller in die Mitte vom Platz. | Zwischen Teller und Tischkante soll 1 Daumen Platz sein.'],
          ['Çatalı tabağın soluna koy.', 'Çatalın dişleri yukarı baksın.', 'Leg die Gabel links vom Teller. | Die Zähne der Gabel sollen nach oben schauen.', '„nach oben“ kann „zur Decke“ oder „zum oberen Tischrand“ heißen. Gemeint ist vermutlich: Zinken zur Decke.'],
          ['Bıçağı tabağın sağına koy.', 'Bıçağın keskin tarafı tabağa baksın.', 'Leg das Messer rechts vom Teller. | Die scharfe Seite vom Messer soll zum Teller schauen.'],
          ['Kaşığı bıçağın sağına koy.', 'Kaşığın çukur tarafı yukarı baksın.', 'Leg den Löffel rechts vom Messer. | Die hohle Seite vom Löffel soll nach oben schauen.'],
          ['Bardağı bıçağın üst tarafına koy.', 'Bardak, tabağın sağ üst tarafında durur.', 'Stell das Glas an die obere Seite vom Messer. | Das Glas steht oben rechts vom Teller.'],
          ['Peçeteyi tabağın üstüne koy.', 'Peçete zaten katlanmış.', 'Leg die Serviette oben auf den Teller. | Die Serviette ist schon gefaltet.'],
          ['Masaya bir kez daha bak.', 'Her şey düz mü? O zaman işin bitti.', 'Schau noch einmal auf den Tisch. | Ist alles gerade? Dann ist deine Arbeit fertig.'],
        ],
      },
    },
    'bad-putzen': {
      titel: 'Otel odasında banyoyu temizlemek',
      schritte: {
        bad: [
          ['Eldiven giy.', 'Temizlik malzemeleri cilde zarar verir.', 'Zieh Handschuhe an. | Putzmittel schaden der Haut.'],
          ['Pencereyi aç ya da fanı çalıştır.', 'Böylece banyoya temiz hava girer.', 'Mach das Fenster auf oder schalte den Lüfter ein. | So kommt frische Luft ins Bad.'],
          ['Banyo temizleyicisini lavaboya ve duşa sık.', '2 dakika beklet.', 'Sprüh den Badreiniger auf das Waschbecken und die Dusche. | Lass ihn 2 Minuten stehen.'],
          ['Her zaman sadece 1 temizleyici kullan.', '2 temizleyici karışınca zehirli gaz çıkar.', 'Benutze immer nur 1 Reiniger. | Wenn sich 2 Reiniger mischen, entsteht giftiges Gas.'],
          ['Lavaboyu ve duşu sarı bezle temizle.', 'Sarı bez lavabo, duş ve fayanslar içindir.', 'Putz Waschbecken und Dusche mit dem gelben Tuch. | Das gelbe Tuch ist für Waschbecken, Dusche und Fliesen.'],
          ['Tuvaleti kırmızı bezle temizle.', 'Kırmızı bez sadece tuvalet içindir.', 'Putz die Toilette mit dem roten Tuch. | Das rote Tuch ist nur für die Toilette.'],
          ['Temiz havlu koy.', '2 büyük ve 2 küçük havlu.', 'Leg saubere Handtücher hin. | 2 große und 2 kleine Handtücher.'],
          ['Eldivenleri çıkar ve ellerini yıka.', 'Sabunla.', 'Zieh die Handschuhe aus und wasch deine Hände. | Mit Seife.'],
        ],
      },
    },
  },
};

export const ANLEITUNG_SPRACHEN: AnleitungSprache[] = Object.entries(UEBERSETZUNGEN).flatMap(
  ([sprache, fassungen]) =>
    Object.entries(fassungen).map(([anleitungId, fassung]) => ({
      anleitung_id: anleitungId,
      sprache,
      titel: fassung.titel,
      status: 'freigegeben' as const,
      freigegeben_von: 'Testdaten',
      freigegeben_am: HEUTE,
    })),
);

export const SCHRITT_UEBERSETZUNGEN: SchrittUebersetzung[] = Object.entries(UEBERSETZUNGEN).flatMap(
  ([sprache, fassungen]) =>
    Object.values(fassungen).flatMap((fassung) =>
      Object.entries(fassung.schritte).flatMap(([kurz, zeilen]) =>
        zeilen.map(([text, hinweis, rueck, grund], i) => ({
          schritt_id: `${kurz}-${i + 1}`,
          sprache,
          text,
          hinweis,
          rueckuebersetzung: rueck,
          unsicher: Boolean(grund),
          grund: grund ?? '',
          status: 'maschinell' as const,
          geprueft_von: null,
          geprueft_am: null,
          basiert_auf_version: 1,
        })),
      ),
    ),
);
