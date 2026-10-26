import { describe, expect, it } from 'vitest';
import { BEISPIEL_INHALTE } from '../daten/datenquelle';
import type { Inhalte } from '../typen';
import { anleitungFuerAnzeige, anleitungenFuerPlatz, personName, verfuegbareSprachen } from './inhalte';

const codes = (inhalte: Inhalte, platz: string) => verfuegbareSprachen(inhalte, platz).map((s) => s.code);

describe('verfuegbareSprachen', () => {
  it('zeigt nur Sprachen mit freigegebener Anleitung am Arbeitsplatz', () => {
    expect(codes(BEISPIEL_INHALTE, 'bankett')).toEqual(['de', 'en', 'uk', 'ar', 'tr']);
  });

  it('blendet eine Sprache aus, wenn ihre Fassung nicht freigegeben ist', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      anleitung_sprachen: BEISPIEL_INHALTE.anleitung_sprachen.map((f) =>
        f.sprache === 'uk' && f.anleitung_id === 'bankett-eindecken' ? { ...f, status: 'in_pruefung' } : f,
      ),
    };
    expect(codes(inhalte, 'bankett')).not.toContain('uk');
    expect(codes(inhalte, 'housekeeping-etage-2')).toContain('uk');
  });

  it('blendet Sprachen aus, die das Gerät nicht anbietet', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      arbeitsplaetze: BEISPIEL_INHALTE.arbeitsplaetze.map((p) =>
        p.id === 'bankett' ? { ...p, angebotene_sprachen: ['de', 'ar'] } : p,
      ),
    };
    expect(codes(inhalte, 'bankett')).toEqual(['de', 'ar']);
  });

  it('kennt keinen unbekannten Arbeitsplatz', () => {
    expect(codes(BEISPIEL_INHALTE, 'gibt-es-nicht')).toEqual([]);
  });
});

describe('anleitungFuerAnzeige', () => {
  it('liefert Schritte in der gewählten Sprache mit Schreibrichtung', () => {
    const a = anleitungFuerAnzeige(BEISPIEL_INHALTE, 'bankett-eindecken', 'ar')!;
    expect(a.titel).toMatchObject({ lang: 'ar', dir: 'rtl' });
    expect(a.schritte).toHaveLength(8);
    expect(a.schritte[0].satz).toEqual({ text: 'اغسل يديك.', lang: 'ar', dir: 'rtl' });
    expect(a.schritte[0].satz_de).toBe('Wasch dir die Hände.');
  });

  it('markiert ungeprüfte Sicherheitsschritte in Fremdsprachen', () => {
    const a = anleitungFuerAnzeige(BEISPIEL_INHALTE, 'bad-putzen', 'uk')!;
    expect(a.schritte.filter((s) => s.sicherheitUngeprueft).map((s) => s.position)).toEqual([1, 4]);
  });

  it('markiert auf Deutsch nichts als ungeprüft', () => {
    const a = anleitungFuerAnzeige(BEISPIEL_INHALTE, 'bad-putzen', 'de')!;
    expect(a.schritte.some((s) => s.sicherheitUngeprueft)).toBe(false);
    expect(a.schritte.filter((s) => s.achtung)).toHaveLength(2);
  });

  it('zeigt einen geprüften Sicherheitsschritt normal an', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      schritt_uebersetzungen: BEISPIEL_INHALTE.schritt_uebersetzungen.map((u) =>
        u.schritt_id === 'bad-1' && u.sprache === 'tr' ? { ...u, status: 'geprueft', geprueft_von: 'Mehmet' } : u,
      ),
    };
    const a = anleitungFuerAnzeige(inhalte, 'bad-putzen', 'tr')!;
    expect(a.schritte[0].sicherheitUngeprueft).toBe(false);
    expect(a.schritte[3].sicherheitUngeprueft).toBe(true);
  });

  it('gilt als ungeprüft, wenn sich der deutsche Schritt nach der Prüfung geändert hat', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      schritte: BEISPIEL_INHALTE.schritte.map((s) => (s.id === 'bad-1' ? { ...s, version: 2 } : s)),
      schritt_uebersetzungen: BEISPIEL_INHALTE.schritt_uebersetzungen.map((u) =>
        u.schritt_id === 'bad-1' ? { ...u, status: 'geprueft' } : u,
      ),
    };
    expect(anleitungFuerAnzeige(inhalte, 'bad-putzen', 'tr')!.schritte[0].sicherheitUngeprueft).toBe(true);
  });

  it('zeigt Deutsch mit lang="de", wenn eine Schritt-Übersetzung fehlt', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      schritt_uebersetzungen: BEISPIEL_INHALTE.schritt_uebersetzungen.filter(
        (u) => !(u.schritt_id === 'bankett-3' && u.sprache === 'ar'),
      ),
    };
    const s = anleitungFuerAnzeige(inhalte, 'bankett-eindecken', 'ar')!.schritte[2];
    expect(s.satz).toEqual({ text: 'Leg die Gabel links neben den Teller.', lang: 'de', dir: 'ltr' });
  });

  it('gibt nichts heraus, was nicht freigegeben ist', () => {
    const inhalte: Inhalte = {
      ...BEISPIEL_INHALTE,
      anleitungen: BEISPIEL_INHALTE.anleitungen.map((a) => ({ ...a, status_de: 'entwurf' as const })),
    };
    expect(anleitungFuerAnzeige(inhalte, 'bankett-eindecken', 'de')).toBeNull();
    expect(anleitungenFuerPlatz(inhalte, 'bankett', 'de')).toEqual([]);
  });
});

describe('personName', () => {
  it('nimmt die Schreibweise der Sprache, sonst den Originalnamen', () => {
    const person = BEISPIEL_INHALTE.anleitungen[0].ansprechperson;
    expect(personName(person, 'uk')).toBe('пані Вебер');
    expect(personName(person, 'ro')).toBe('Frau Weber');
  });
});
