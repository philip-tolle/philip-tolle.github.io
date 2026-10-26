import { describe, expect, it } from 'vitest';
import { STANDARD, einstellungenAuswerten } from './einstellungen';

describe('einstellungenAuswerten', () => {
  it('nimmt den Standard bei leerem oder kaputtem Speicher', () => {
    expect(einstellungenAuswerten(null)).toEqual(STANDARD);
    expect(einstellungenAuswerten('{kaputt')).toEqual(STANDARD);
    expect(einstellungenAuswerten('42')).toEqual(STANDARD);
  });

  it('übernimmt gültige Werte und verwirft ungültige', () => {
    const e = einstellungenAuswerten(
      JSON.stringify({ sprache: 'ar', mitlernen: true, tempo: 'rasend', schrift: 'gross', kontrast: 'ja' }),
    );
    expect(e).toEqual({ ...STANDARD, sprache: 'ar', mitlernen: true, schrift: 'gross' });
  });

  it('lässt keine fremden Zeichen als Sprachcode zu', () => {
    expect(einstellungenAuswerten(JSON.stringify({ sprache: '<script>' })).sprache).toBeNull();
  });
});
