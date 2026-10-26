import { useEffect, useReducer } from 'react';
import { sprachausgabe } from './sprachausgabe';

/** Neu zeichnen, wenn Stimmen geladen sind oder ein anderer Satz gelesen wird. */
export function useVorlesen() {
  const [, neuZeichnen] = useReducer((x: number) => x + 1, 0);
  useEffect(() => sprachausgabe.abonnieren(neuZeichnen), []);
  return sprachausgabe;
}
