import { describe, expect, it } from 'vitest';
import { langeWoerter, lesbarkeit, satzHinweise, woerter } from './lesbarkeit';

describe('lesbarkeit', () => {
  it('zählt Wörter ohne Satzzeichen', () => {
    expect(woerter('Leg die Gabel links neben den Teller.')).toHaveLength(7);
  });

  it('findet lange Wörter nur ohne Mediopunkt', () => {
    expect(langeWoerter('Die Reinigungsmittel und die Tisch·kanten·reinigung.')).toEqual(['Reinigungsmittel']);
  });

  it('misst Wörter, längsten Satz und lange Wörter', () => {
    expect(lesbarkeit('Schutzhandschuhe anlegen. Für ausreichende Belüftung im Badezimmer sorgen.')).toEqual({
      woerter: 8,
      laengsterSatz: 6,
      langeWoerter: ['Schutzhandschuhe'],
    });
  });

  it('gibt Hinweise bei zu langen Sätzen', () => {
    expect(satzHinweise('Wasch dir die Hände.')).toEqual([]);
    expect(satzHinweise('Wasch dir bitte vor dem Arbeitsbeginn immer gründlich mit viel Seife die Hände.')[0]).toContain('13 Wörtern');
  });
});
