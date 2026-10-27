import { describe, expect, it } from 'vitest';
import { adresseAusName, alsText, statusZeilen } from './status';

const namen = { en: 'Englisch', uk: 'Ukrainisch', ar: 'Arabisch', tr: 'Türkisch' };

describe('statusZeilen', () => {
  it('schreibt den Status wie im Lastenheft', () => {
    const text = alsText(
      statusZeilen(
        {
          status_de: 'freigegeben',
          auf_tablet: true,
          zielsprachen: ['en', 'uk', 'ar', 'tr'],
          sprachen: [
            { sprache: 'en', status: 'freigegeben' },
            { sprache: 'uk', status: 'maschinell' },
            { sprache: 'ar', status: 'in_pruefung' },
          ],
        },
        namen,
      ),
    );
    expect(text).toBe('Deutsch ✓ · Englisch ✓ · Ukrainisch: maschinell · Arabisch: in Prüfung · Türkisch: noch nicht übersetzt');
  });

  it('zeigt nicht freigegebene Änderungen an', () => {
    expect(alsText(statusZeilen({ status_de: 'entwurf', auf_tablet: true, zielsprachen: [], sprachen: [] }, namen))).toBe(
      'Deutsch: Änderungen nicht freigegeben',
    );
  });
});

describe('adresseAusName', () => {
  it('macht aus dem Namen eine Adresse', () => {
    expect(adresseAusName('Housekeeping Etage 2')).toBe('housekeeping-etage-2');
    expect(adresseAusName('Spülküche – Früh')).toBe('spuelkueche-frueh');
    expect(adresseAusName('Café Crème')).toBe('cafe-creme');
  });
});
