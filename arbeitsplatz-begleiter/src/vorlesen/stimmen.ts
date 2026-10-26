// Auswahl einer Gerätestimme. Getrennt von der Sprachausgabe, damit es ohne Browser testbar ist.

export interface StimmeInfo {
  lang: string;
  name: string;
  default: boolean;
}

function norm(tag: string): string {
  return tag.replace(/_/g, '-').toLowerCase();
}

/**
 * Wählt die beste Stimme: zuerst genaue Treffer in der Wunsch-Reihenfolge
 * (z. B. „uk-UA“), dann irgendeine Stimme derselben Sprache („uk-…“).
 */
export function stimmeWaehlen<T extends StimmeInfo>(stimmen: T[], wunsch: string[]): T | null {
  const besteVon = (liste: T[]) => liste.find((s) => s.default) ?? liste[0] ?? null;
  for (const w of wunsch) {
    const treffer = stimmen.filter((s) => norm(s.lang) === norm(w));
    if (treffer.length) return besteVon(treffer);
  }
  const grundsprachen = new Set(wunsch.map((w) => norm(w).split('-')[0]));
  return besteVon(stimmen.filter((s) => grundsprachen.has(norm(s.lang).split('-')[0])));
}
