import type { AnzeigeSchritt } from './inhalte';
import type { Text } from './texte';

/** Deutscher Satz zusätzlich: beim Mitlernen und bei ungeprüften Sicherheitsschritten. */
export function zeigeDeutsch(schritt: AnzeigeSchritt, mitlernen: boolean): boolean {
  return schritt.satz.lang !== 'de' && (mitlernen || schritt.sicherheitUngeprueft);
}

export interface Leseteil {
  id: 'satz' | 'satz-de' | 'hinweis' | 'frag-nach';
  text: string;
  lang: string;
}

/**
 * Was beim Vorlesen eines Schritts in welcher Reihenfolge gesprochen wird:
 * Satz in der Muttersprache, dann (falls angezeigt) auf Deutsch, dann der Hinweis.
 * „Nochmal“ liest nur den Satz (langsamer).
 */
export function leseteileFuerSchritt(
  schritt: AnzeigeSchritt,
  optionen: { mitlernen: boolean; nurSatz?: boolean; fragNach: Text },
): Leseteil[] {
  const teile: Leseteil[] = [{ id: 'satz', text: schritt.satz.text, lang: schritt.satz.lang }];
  if (zeigeDeutsch(schritt, optionen.mitlernen)) {
    teile.push({ id: 'satz-de', text: schritt.satz_de, lang: 'de' });
  }
  if (optionen.nurSatz) return teile;
  if (schritt.hinweis.text.trim()) {
    teile.push({ id: 'hinweis', text: schritt.hinweis.text, lang: schritt.hinweis.lang });
  }
  if (schritt.sicherheitUngeprueft) {
    teile.push({ id: 'frag-nach', text: optionen.fragNach.text, lang: optionen.fragNach.lang });
  }
  return teile;
}
