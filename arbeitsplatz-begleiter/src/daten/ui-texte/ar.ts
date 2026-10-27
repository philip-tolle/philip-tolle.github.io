import type { UiSprachdatei } from '../../typen';

// Hinweis für Sprachpaten: Befehlsformen in der üblichen männlichen
// Grundform. Sätze mit {person} ohne Verb, damit sie für Frauen und
// Männer passen (z. B. „{person} عندك بعد قليل“).
export const ar: UiSprachdatei = {
  sprache: 'ar',
  status: 'maschinell',
  texte: {
    'sprache.taste': 'اللغة',
    'sprache.gruss': 'مرحبًا! هل تريد العربية؟ إذن اضغط مرة أخرى.',
    'sprache.nochmalTippen': 'اضغط مرة أخرى، ثم نبدأ.',
    'start.frage': 'ماذا تريد أن تفعل؟',
    'start.vorstellung':
      'أنا برنامج كمبيوتر.\nأنا أساعدك في العمل.\nإذا لم تعرف ماذا تفعل، اطلب المساعدة من {person}.',
    'start.schritte': {
      zero: 'لا توجد خطوات',
      one: 'خطوة واحدة',
      two: 'خطوتان',
      few: '{anzahl} خطوات',
      many: '{anzahl} خطوة',
      other: '{anzahl} خطوة',
    },
    'start.mitlernen': 'تعلَّم الألمانية أيضًا',
    'start.leer': 'لا توجد تعليمات هنا بعد.',
    'taste.zurueck': 'رجوع',
    'taste.vorlesen': 'استمع',
    'taste.nochmal': 'مرة أخرى',
    'taste.weiter': 'التالي',
    'taste.fertig': 'انتهيت',
    'taste.hilfe': 'مساعدة',
    'schritt.von': 'الخطوة {n} من {gesamt}',
    'schritt.nummer': 'الخطوة {n}',
    'schritt.achtung': 'انتبه',
    'schritt.fragNach': 'إذا لم تكن متأكدًا، اسأل من فضلك.',
    'schritt.aufDeutsch': 'بالألمانية:',
    'fertig.titel': 'انتهيت!',
    'fertig.lob': {
      one: 'أنجزت الخطوة. أحسنت!',
      two: 'أنجزت الخطوتين. أحسنت!',
      few: 'أنجزت كل الخطوات، {anzahl} خطوات. أحسنت!',
      many: 'أنجزت كل الخطوات، {anzahl} خطوة. أحسنت!',
      other: 'أنجزت كل الخطوات. أحسنت!',
    },
    'fertig.vonVorne': 'من البداية مرة أخرى',
    'fertig.uebersicht': 'إلى القائمة',
    'fertig.alleSchritte': 'كل الخطوات',
    'hilfe.unterwegs': 'المساعدة في الطريق.\n{person} عندك بعد قليل.',
    'hilfe.aufDemWeg': '{person} الآن في الطريق إليك.',
    'hilfe.zurueck': 'رجوع إلى المهمة',
    'vorlesen.keineStimme': 'هذا الجهاز لا يستطيع قراءة هذه اللغة بصوت عالٍ.',
    'fehler.nichtGefunden': 'هذه الصفحة غير موجودة.',
    'fehler.laden': 'لا يمكن تحميل التعليمات الآن. حاول مرة أخرى بعد قليل.',
  },
};
