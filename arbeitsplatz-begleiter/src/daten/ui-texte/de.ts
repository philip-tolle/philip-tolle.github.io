import type { UiSprachdatei } from '../../typen';

// Deutsche Grundlage in Leichter Sprache. Alle anderen Sprachdateien
// werden daraus übersetzt.
export const de: UiSprachdatei = {
  sprache: 'de',
  status: 'freigegeben',
  texte: {
    'sprache.taste': 'Sprache',
    'sprache.gruss': 'Hallo! Möchtest du Deutsch? Dann tippe noch einmal.',
    'sprache.nochmalTippen': 'Tippe noch einmal. Dann geht es los.',
    'start.frage': 'Was möchtest du machen?',
    'start.vorstellung':
      'Ich bin ein Computer-Programm.\nIch helfe dir bei der Arbeit.\nWenn du nicht weiter·weißt, hilft dir {person}.',
    'start.schritte': { one: '{anzahl} Schritt', other: '{anzahl} Schritte' },
    'start.mitlernen': 'Deutsch mitlernen',
    'start.leer': 'Hier gibt es noch keine Anleitung.',
    'taste.zurueck': 'Zurück',
    'taste.vorlesen': 'Vorlesen',
    'taste.nochmal': 'Nochmal',
    'taste.weiter': 'Weiter',
    'taste.fertig': 'Fertig',
    'taste.hilfe': 'Hilfe',
    'schritt.von': 'Schritt {n} von {gesamt}',
    'schritt.nummer': 'Schritt {n}',
    'schritt.achtung': 'Achtung',
    'schritt.fragNach': 'Bitte frag nach, wenn du unsicher bist.',
    'schritt.aufDeutsch': 'Auf Deutsch:',
    'fertig.titel': 'Fertig!',
    'fertig.lob': {
      one: 'Du hast den Schritt gemacht. Gut gemacht!',
      other: 'Du hast alle {anzahl} Schritte gemacht. Gut gemacht!',
    },
    'fertig.vonVorne': 'Nochmal von vorne',
    'fertig.uebersicht': 'Zur Übersicht',
    'fertig.alleSchritte': 'Alle Schritte',
    'hilfe.unterwegs': 'Hilfe ist unterwegs.\n{person} kommt gleich.',
    'hilfe.aufDemWeg': '{person} ist jetzt auf dem Weg zu dir.',
    'hilfe.zurueck': 'Zurück zur Aufgabe',
    'vorlesen.keineStimme': 'Dieses Gerät kann diese Sprache nicht vorlesen.',
    'fehler.nichtGefunden': 'Diese Seite gibt es nicht.',
  },
};
