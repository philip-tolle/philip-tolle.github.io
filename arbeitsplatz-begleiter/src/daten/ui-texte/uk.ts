import type { UiSprachdatei } from '../../typen';

// Hinweis für Sprachpaten: Formen ohne grammatisches Geschlecht gewählt
// (z. B. „Усі кроки зроблено“ statt „Ти зробив/зробила“).
export const uk: UiSprachdatei = {
  sprache: 'uk',
  status: 'maschinell',
  texte: {
    'sprache.taste': 'Мова',
    'sprache.gruss': 'Привіт! Хочеш українську? Тоді торкнися ще раз.',
    'sprache.nochmalTippen': 'Торкнися ще раз. Тоді почнемо.',
    'start.frage': 'Що ти хочеш зробити?',
    'start.vorstellung':
      'Я комп’ютерна програма.\nЯ допомагаю тобі в роботі.\nЯкщо ти не знаєш, що робити далі, тобі допоможе {person}.',
    'start.schritte': {
      one: '{anzahl} крок',
      few: '{anzahl} кроки',
      many: '{anzahl} кроків',
      other: '{anzahl} кроку',
    },
    'start.mitlernen': 'Учити німецьку',
    'start.leer': 'Тут ще немає інструкції.',
    'taste.zurueck': 'Назад',
    'taste.vorlesen': 'Слухати',
    'taste.nochmal': 'Ще раз',
    'taste.weiter': 'Далі',
    'taste.fertig': 'Готово',
    'taste.hilfe': 'Допомога',
    'schritt.von': 'Крок {n} з {gesamt}',
    'schritt.nummer': 'Крок {n}',
    'schritt.achtung': 'Увага',
    'schritt.fragNach': 'Якщо є сумнів, будь ласка, запитай.',
    'schritt.aufDeutsch': 'Німецькою:',
    'fertig.titel': 'Готово!',
    'fertig.lob': {
      one: '{anzahl} крок зроблено. Молодець!',
      few: 'Усі {anzahl} кроки зроблено. Молодець!',
      many: 'Усі {anzahl} кроків зроблено. Молодець!',
      other: 'Усі кроки зроблено. Молодець!',
    },
    'fertig.vonVorne': 'Ще раз спочатку',
    'fertig.uebersicht': 'До списку завдань',
    'fertig.alleSchritte': 'Усі кроки',
    'hilfe.unterwegs': 'Допомога вже йде.\n{person} скоро прийде.',
    'hilfe.aufDemWeg': '{person} вже йде до тебе.',
    'hilfe.zurueck': 'Назад до завдання',
    'vorlesen.keineStimme': 'Цей пристрій не може озвучити цю мову.',
    'fehler.nichtGefunden': 'Цієї сторінки немає.',
    'fehler.laden': 'Зараз не вдається завантажити інструкції. Спробуй ще раз трохи пізніше.',
  },
};
