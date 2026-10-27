import { describe, expect, it } from 'vitest';
import { BEISPIEL_BESTAND, beispielInhalte } from '../daten/beispielfassungen';
import { inhalteAusDatenbank } from '../daten/datenquelle';
import type { Datenbestand, Inhalte } from '../typen';
import {
  anleitungFuerAnzeige,
  anleitungenFuerPlatz,
  ansprechpersonFuer,
  personName,
  verfuegbareSprachen,
} from './inhalte';

const bankett = beispielInhalte('bankett')!;
const bad = beispielInhalte('housekeeping-etage-2')!;
const codes = (inhalte: Inhalte) => verfuegbareSprachen(inhalte).map((s) => s.code);

/** Beispieldaten verändern und die Fassungen neu bauen, wie es die Datenbank täte. */
function mit(aenderung: Partial<Datenbestand>, platz = 'bankett') {
  return beispielInhalte(platz, { ...BEISPIEL_BESTAND, ...aenderung })!;
}

describe('verfuegbareSprachen', () => {
  it('zeigt nur Sprachen mit freigegebener Fassung am Arbeitsplatz', () => {
    expect(codes(bankett)).toEqual(['de', 'en', 'uk', 'ar', 'tr']);
  });

  it('blendet eine Sprache aus, die noch in Prüfung ist', () => {
    const inhalte = mit({
      anleitung_sprachen: BEISPIEL_BESTAND.anleitung_sprachen.map((f) =>
        f.sprache === 'uk' && f.anleitung_id === 'bankett-eindecken' ? { ...f, status: 'in_pruefung' } : f,
      ),
    });
    expect(codes(inhalte)).not.toContain('uk');
    expect(codes(bad)).toContain('uk');
  });

  it('blendet Sprachen aus, die das Gerät nicht anbietet', () => {
    const inhalte: Inhalte = { ...bankett, arbeitsplatz: { ...bankett.arbeitsplatz, angebotene_sprachen: ['de', 'ar'] } };
    expect(codes(inhalte)).toEqual(['de', 'ar']);
  });

  it('kennt keinen unbekannten Arbeitsplatz', () => {
    expect(beispielInhalte('gibt-es-nicht')).toBeNull();
  });
});

describe('anleitungFuerAnzeige', () => {
  it('liefert Schritte in der gewählten Sprache mit Schreibrichtung', () => {
    const a = anleitungFuerAnzeige(bankett, 'bankett-eindecken', 'ar')!;
    expect(a.titel).toMatchObject({ lang: 'ar', dir: 'rtl' });
    expect(a.schritte).toHaveLength(8);
    expect(a.schritte[0].satz).toEqual({ text: 'اغسل يديك.', lang: 'ar', dir: 'rtl' });
    expect(a.schritte[0].satz_de).toBe('Wasch dir die Hände.');
  });

  it('markiert ungeprüfte Sicherheitsschritte in Fremdsprachen', () => {
    const a = anleitungFuerAnzeige(bad, 'bad-putzen', 'uk')!;
    expect(a.schritte.filter((s) => s.sicherheitUngeprueft).map((s) => s.position)).toEqual([1, 4]);
  });

  it('markiert auf Deutsch nichts als ungeprüft', () => {
    const a = anleitungFuerAnzeige(bad, 'bad-putzen', 'de')!;
    expect(a.schritte.some((s) => s.sicherheitUngeprueft)).toBe(false);
    expect(a.schritte.filter((s) => s.achtung)).toHaveLength(2);
  });

  it('zeigt einen geprüften Sicherheitsschritt normal an', () => {
    const inhalte = mit(
      {
        schritt_uebersetzungen: BEISPIEL_BESTAND.schritt_uebersetzungen.map((u) =>
          u.schritt_id === 'bad-1' && u.sprache === 'tr' ? { ...u, status: 'geprueft', geprueft_von: 'Mehmet' } : u,
        ),
      },
      'housekeeping-etage-2',
    );
    const a = anleitungFuerAnzeige(inhalte, 'bad-putzen', 'tr')!;
    expect(a.schritte[0].sicherheitUngeprueft).toBe(false);
    expect(a.schritte[3].sicherheitUngeprueft).toBe(true);
  });

  it('gilt als ungeprüft, wenn sich der deutsche Schritt nach der Prüfung geändert hat', () => {
    const inhalte = mit(
      {
        schritte: BEISPIEL_BESTAND.schritte.map((s) => (s.id === 'bad-1' ? { ...s, version: 2 } : s)),
        schritt_uebersetzungen: BEISPIEL_BESTAND.schritt_uebersetzungen.map((u) =>
          u.schritt_id === 'bad-1' ? { ...u, status: 'geprueft' } : u,
        ),
      },
      'housekeeping-etage-2',
    );
    expect(anleitungFuerAnzeige(inhalte, 'bad-putzen', 'tr')!.schritte[0].sicherheitUngeprueft).toBe(true);
  });

  it('zeigt Deutsch mit lang="de", wenn eine Schritt-Übersetzung fehlt', () => {
    const inhalte = mit({
      schritt_uebersetzungen: BEISPIEL_BESTAND.schritt_uebersetzungen.filter(
        (u) => !(u.schritt_id === 'bankett-3' && u.sprache === 'ar'),
      ),
    });
    const s = anleitungFuerAnzeige(inhalte, 'bankett-eindecken', 'ar')!.schritte[2];
    expect(s.satz).toEqual({ text: 'Leg die Gabel links neben den Teller.', lang: 'de', dir: 'ltr' });
  });

  it('gibt nichts heraus, was nicht freigegeben ist', () => {
    const inhalte = mit({ anleitungen: BEISPIEL_BESTAND.anleitungen.map((a) => ({ ...a, status_de: 'entwurf' as const })) });
    expect(anleitungFuerAnzeige(inhalte, 'bankett-eindecken', 'de')).toBeNull();
    expect(anleitungenFuerPlatz(inhalte, 'de')).toEqual([]);
    expect(codes(inhalte)).toEqual([]);
  });
});

describe('personName und ansprechpersonFuer', () => {
  it('nimmt die Schreibweise der Sprache, sonst den Originalnamen', () => {
    expect(personName(bankett.arbeitsplatz.ansprechperson, 'uk')).toBe('пані Вебер');
    expect(personName(bankett.arbeitsplatz.ansprechperson, 'ro')).toBe('Frau Weber');
  });

  it('nimmt die Ansprechperson der Anleitung, sonst die des Arbeitsplatzes', () => {
    const inhalte: Inhalte = {
      ...bankett,
      fassungen: bankett.fassungen.map((f) => ({ ...f, ansprechperson: { name: 'Herr Klein', name_in: {} } })),
    };
    expect(ansprechpersonFuer(inhalte, 'bankett-eindecken').name).toBe('Herr Klein');
    expect(ansprechpersonFuer(inhalte, null).name).toBe('Frau Weber');
  });
});

describe('inhalteAusDatenbank', () => {
  it('liest die Antwort von platz_inhalte()', () => {
    const inhalte = inhalteAusDatenbank({
      arbeitsplatz: { id: 'bankett', name: 'Bankett', angebotene_sprachen: ['de', 'uk'], ansprechperson: { name: 'Frau Weber', name_in: {} } },
      sprachen: BEISPIEL_BESTAND.sprachen,
      fassungen: [
        {
          anleitung_id: 'a1',
          sprache: 'de',
          fassung: {
            titel: 'Tisch decken',
            ansprechperson: { name: 'Frau Weber', name_in: {} },
            titelbild_url: null,
            schritte: [{ id: 's1', position: 1, text: 'Leg die Gabel hin.', hinweis: '', bild_url: null, achtung: true, version: 2 }],
          },
        },
        {
          anleitung_id: 'a1',
          sprache: 'uk',
          fassung: {
            titel: 'Накрити стіл',
            titel_de: 'Tisch decken',
            ansprechperson: { name: 'Frau Weber', name_in: {} },
            titelbild_url: null,
            schritte: [
              { id: 's1', position: 1, text: 'Поклади виделку.', hinweis: '', bild_url: null, achtung: true, version: 1,
                text_de: 'Leg die Gabel hin!', hinweis_de: '', status: 'geprueft', basiert_auf_version: 1 },
            ],
          },
        },
      ],
    });
    expect(codes(inhalte)).toEqual(['de', 'uk']);
    const uk = anleitungFuerAnzeige(inhalte, 'a1', 'uk')!;
    expect(uk.titel_de).toBe('Tisch decken');
    expect(uk.schritte[0].satz_de).toBe('Leg die Gabel hin!');
    expect(uk.schritte[0].sicherheitUngeprueft).toBe(false);
    expect(anleitungFuerAnzeige(inhalte, 'a1', 'de')!.schritte[0].satz.text).toBe('Leg die Gabel hin.');
  });

  it('lehnt eine kaputte Antwort ab', () => {
    expect(() => inhalteAusDatenbank({} as never)).toThrow();
  });
});
