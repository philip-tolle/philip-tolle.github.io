// Einfache Lesbarkeits-Kennzahlen für Leichte Sprache (Grundlage für den Vorher-nachher-Vergleich).
// Lange Wörter: ab 13 Buchstaben ohne Mediopunkt.

const LANGES_WORT = 13;
const HOECHSTENS_WOERTER = 10;

export function woerter(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}·]+|[^\p{L}\p{N}·]+$/gu, ''))
    .filter(Boolean);
}

export function saetze(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function langeWoerter(text: string): string[] {
  return woerter(text).filter((w) => !w.includes('·') && w.replace(/[^\p{L}]/gu, '').length >= LANGES_WORT);
}

export interface Lesbarkeit {
  woerter: number;
  laengsterSatz: number;
  langeWoerter: string[];
}

export function lesbarkeit(text: string): Lesbarkeit {
  return {
    woerter: woerter(text).length,
    laengsterSatz: Math.max(0, ...saetze(text).map((s) => woerter(s).length)),
    langeWoerter: [...new Set(langeWoerter(text))],
  };
}

/** Hinweise zu einem Satz in Leichter Sprache. Leer, wenn alles passt. */
export function satzHinweise(text: string): string[] {
  const hinweise: string[] = [];
  for (const satz of saetze(text)) {
    const n = woerter(satz).length;
    if (n > HOECHSTENS_WOERTER) hinweise.push(`Satz mit ${n} Wörtern – in Leichter Sprache höchstens ${HOECHSTENS_WOERTER}.`);
  }
  for (const wort of new Set(langeWoerter(text))) {
    hinweise.push(`„${wort}“ ist lang – mit Mediopunkt trennen?`);
  }
  return hinweise;
}
