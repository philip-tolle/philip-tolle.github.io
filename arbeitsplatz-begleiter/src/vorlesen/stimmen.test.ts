import { describe, expect, it } from 'vitest';
import { stimmeWaehlen } from './stimmen';

const stimme = (lang: string, name = lang, standard = false) => ({ lang, name, default: standard });

describe('stimmeWaehlen', () => {
  it('nimmt den genauen Treffer in Wunsch-Reihenfolge', () => {
    const liste = [stimme('en-US'), stimme('en-GB')];
    expect(stimmeWaehlen(liste, ['en-GB', 'en-US'])?.lang).toBe('en-GB');
  });

  it('versteht Android-Schreibweise mit Unterstrich', () => {
    expect(stimmeWaehlen([stimme('uk_UA')], ['uk-UA'])?.lang).toBe('uk_UA');
  });

  it('nimmt eine andere Variante derselben Sprache', () => {
    expect(stimmeWaehlen([stimme('de-DE'), stimme('ar-001')], ['ar-SY', 'ar-SA'])?.lang).toBe('ar-001');
  });

  it('bevorzugt die Standardstimme bei mehreren Treffern', () => {
    const liste = [stimme('tr-TR', 'A'), stimme('tr-TR', 'B', true)];
    expect(stimmeWaehlen(liste, ['tr-TR'])?.name).toBe('B');
  });

  it('gibt null zurück, wenn es keine Stimme gibt', () => {
    expect(stimmeWaehlen([stimme('de-DE')], ['ti-ER', 'ti'])).toBeNull();
  });
});
