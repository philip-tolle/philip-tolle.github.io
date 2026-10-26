import { describe, expect, it } from 'vitest';
import { UI_TEXTE } from '../daten/ui-texte';
import type { UiSprachdatei, UiTextSchluessel } from '../typen';
import { fuerVorlesen, uebersetzerFuer, zeilen } from './texte';

describe('uebersetzerFuer', () => {
  it('setzt Parameter ein', () => {
    const t = uebersetzerFuer('de', UI_TEXTE);
    expect(t('schritt.von', { n: 3, gesamt: 8 })).toEqual({ text: 'Schritt 3 von 8', lang: 'de' });
  });

  it('wählt die Pluralform der Sprache', () => {
    expect(uebersetzerFuer('uk', UI_TEXTE)('start.schritte', { anzahl: 8 }).text).toBe('8 кроків');
    expect(uebersetzerFuer('uk', UI_TEXTE)('start.schritte', { anzahl: 3 }).text).toBe('3 кроки');
    expect(uebersetzerFuer('ar', UI_TEXTE)('start.schritte', { anzahl: 8 }).text).toBe('8 خطوات');
    expect(uebersetzerFuer('ar', UI_TEXTE)('start.schritte', { anzahl: 2 }).text).toBe('خطوتان');
    expect(uebersetzerFuer('tr', UI_TEXTE)('start.schritte', { anzahl: 8 }).text).toBe('8 adım');
    expect(uebersetzerFuer('de', UI_TEXTE)('start.schritte', { anzahl: 1 }).text).toBe('1 Schritt');
  });

  it('nimmt Deutsch mit lang="de", wenn ein Text fehlt', () => {
    const unvollstaendig: UiSprachdatei = { sprache: 'xx', status: 'maschinell', texte: {} as UiSprachdatei['texte'] };
    const t = uebersetzerFuer('xx', [...UI_TEXTE, unvollstaendig]);
    expect(t('taste.hilfe')).toEqual({ text: 'Hilfe', lang: 'de' });
  });

  it('jede Sprachdatei hat alle Schlüssel der deutschen Datei', () => {
    const deutsch = UI_TEXTE.find((d) => d.sprache === 'de')!;
    for (const datei of UI_TEXTE) {
      for (const schluessel of Object.keys(deutsch.texte) as UiTextSchluessel[]) {
        expect(datei.texte[schluessel], `${datei.sprache}: ${schluessel}`).toBeDefined();
      }
    }
  });
});

describe('fuerVorlesen', () => {
  it('entfernt Mediopunkte und Zeilenumbrüche', () => {
    expect(fuerVorlesen('Der Teller ist weg von der Tisch·kante.')).toBe('Der Teller ist weg von der Tischkante.');
    expect(fuerVorlesen('Hilfe ist unterwegs.\nFrau Weber kommt gleich.')).toBe('Hilfe ist unterwegs. Frau Weber kommt gleich.');
  });
});

describe('zeilen', () => {
  it('teilt an Zeilenumbrüchen', () => {
    expect(zeilen('A.\n B. \n\nC.')).toEqual(['A.', 'B.', 'C.']);
  });
});
