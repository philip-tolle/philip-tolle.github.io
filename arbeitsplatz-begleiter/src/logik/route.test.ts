import { describe, expect, it } from 'vitest';
import { adresse, routeLesen, type Route } from './route';

describe('routeLesen', () => {
  it('erkennt alle Adressen der Mitarbeiter-Ansicht', () => {
    expect(routeLesen('')).toEqual({ art: 'uebersicht' });
    expect(routeLesen('#/platz/bankett')).toEqual({ art: 'start', platzId: 'bankett' });
    expect(routeLesen('#/platz/bankett/anleitung/bankett-eindecken/3')).toEqual({
      art: 'schritt', platzId: 'bankett', anleitungId: 'bankett-eindecken', position: 3,
    });
    expect(routeLesen('#/platz/bankett/anleitung/bankett-eindecken/fertig/')).toEqual({
      art: 'fertig', platzId: 'bankett', anleitungId: 'bankett-eindecken',
    });
  });

  it('erkennt den Anleiter-Bereich', () => {
    expect(routeLesen('#/anleiter')).toEqual({ art: 'anleiter', teile: [] });
    expect(routeLesen('#/anleiter/anleitungen/3350e16e-5d19-5e0b-a36a-5552dcf8efd4')).toEqual({
      art: 'anleiter', teile: ['anleitungen', '3350e16e-5d19-5e0b-a36a-5552dcf8efd4'],
    });
    expect(adresse({ art: 'anleiter', teile: ['team'] })).toBe('#/anleiter/team');
    expect(routeLesen('#/anleiter/<x>')).toEqual({ art: 'unbekannt' });
  });

  it('versteht die Kurzform #bankett', () => {
    expect(routeLesen('#bankett')).toEqual({ art: 'start', platzId: 'bankett' });
  });

  it('lehnt Unsinn ab', () => {
    expect(routeLesen('#/platz/Bankett!')).toEqual({ art: 'unbekannt' });
    expect(routeLesen('#/platz/bankett/anleitung/x/0')).toEqual({ art: 'unbekannt' });
  });

  it('adresse und routeLesen passen zusammen', () => {
    const routen: Route[] = [
      { art: 'start', platzId: 'housekeeping-etage-2' },
      { art: 'schritt', platzId: 'bankett', anleitungId: 'bankett-eindecken', position: 8 },
      { art: 'fertig', platzId: 'bankett', anleitungId: 'bankett-eindecken' },
    ];
    for (const r of routen) expect(routeLesen(adresse(r))).toEqual(r);
  });
});
