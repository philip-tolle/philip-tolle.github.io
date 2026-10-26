import { describe, expect, it } from 'vitest';
import { BEISPIEL_INHALTE } from '../daten/datenquelle';
import { anleitungFuerAnzeige } from './inhalte';
import { leseteileFuerSchritt, zeigeDeutsch } from './schrittText';

const schritt = (anleitung: string, sprache: string, position: number) =>
  anleitungFuerAnzeige(BEISPIEL_INHALTE, anleitung, sprache)!.schritte[position - 1];
const fragNach = { text: 'Якщо є сумнів, будь ласка, запитай.', lang: 'uk' };

describe('zeigeDeutsch', () => {
  it('zeigt Deutsch beim Mitlernen und bei ungeprüfter Sicherheit, nie doppelt auf Deutsch', () => {
    expect(zeigeDeutsch(schritt('bad-putzen', 'uk', 2), false)).toBe(false);
    expect(zeigeDeutsch(schritt('bad-putzen', 'uk', 2), true)).toBe(true);
    expect(zeigeDeutsch(schritt('bad-putzen', 'uk', 1), false)).toBe(true);
    expect(zeigeDeutsch(schritt('bad-putzen', 'de', 1), true)).toBe(false);
  });
});

describe('leseteileFuerSchritt', () => {
  it('liest erst die Muttersprache, dann Deutsch', () => {
    const teile = leseteileFuerSchritt(schritt('bankett-eindecken', 'uk', 1), { mitlernen: true, fragNach });
    expect(teile.map((t) => [t.id, t.lang])).toEqual([
      ['satz', 'uk'],
      ['satz-de', 'de'],
      ['hinweis', 'uk'],
    ]);
  });

  it('liest bei ungeprüfter Sicherheit den deutschen Satz und die Bitte nachzufragen', () => {
    const teile = leseteileFuerSchritt(schritt('bad-putzen', 'uk', 4), { mitlernen: false, fragNach });
    expect(teile.map((t) => t.id)).toEqual(['satz', 'satz-de', 'hinweis', 'frag-nach']);
    expect(teile[1].text).toBe('Nimm immer nur 1 Reiniger.');
  });

  it('„Nochmal“ liest nur den Satz', () => {
    const teile = leseteileFuerSchritt(schritt('bankett-eindecken', 'de', 2), { mitlernen: true, nurSatz: true, fragNach });
    expect(teile.map((t) => t.id)).toEqual(['satz']);
  });
});
