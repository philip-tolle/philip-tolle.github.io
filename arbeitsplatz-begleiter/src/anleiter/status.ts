// Status-Texte für den Anleiter-Bereich, z. B. „Deutsch ✓ · Englisch ✓ · Ukrainisch: maschinell“.

export type SprachStatusWert = 'maschinell' | 'in_pruefung' | 'freigegeben' | 'veraltet';

export interface Statuszeile {
  sprache: string;
  text: string;
  art: 'ok' | 'offen' | 'warnung';
}

const TEXT: Record<SprachStatusWert, { text: string; art: Statuszeile['art'] }> = {
  freigegeben: { text: '✓', art: 'ok' },
  maschinell: { text: 'maschinell', art: 'offen' },
  in_pruefung: { text: 'in Prüfung', art: 'offen' },
  veraltet: { text: 'veraltet', art: 'warnung' },
};

export function deutschStatus(a: { status_de: 'entwurf' | 'freigegeben'; auf_tablet: boolean }): Statuszeile {
  if (a.status_de === 'freigegeben') return { sprache: 'Deutsch', text: '✓', art: 'ok' };
  if (a.auf_tablet) return { sprache: 'Deutsch', text: 'Änderungen nicht freigegeben', art: 'warnung' };
  return { sprache: 'Deutsch', text: 'Entwurf', art: 'offen' };
}

export function statusZeilen(
  a: {
    status_de: 'entwurf' | 'freigegeben';
    auf_tablet: boolean;
    zielsprachen: string[];
    sprachen: { sprache: string; status: SprachStatusWert }[];
  },
  namen: Record<string, string>,
): Statuszeile[] {
  const zeilen = [deutschStatus(a)];
  const vorhanden = new Set(a.sprachen.map((s) => s.sprache));
  for (const s of a.sprachen) {
    zeilen.push({ sprache: namen[s.sprache] ?? s.sprache, ...TEXT[s.status] });
  }
  for (const code of a.zielsprachen) {
    if (!vorhanden.has(code)) zeilen.push({ sprache: namen[code] ?? code, text: 'noch nicht übersetzt', art: 'offen' });
  }
  return zeilen;
}

export function alsText(zeilen: Statuszeile[]): string {
  return zeilen.map((z) => (z.text === '✓' ? `${z.sprache} ✓` : `${z.sprache}: ${z.text}`)).join(' · ');
}

/** Adresse für einen neuen Arbeitsplatz aus seinem Namen: „Housekeeping Etage 2“ → „housekeeping-etage-2“. */
export function adresseAusName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}
