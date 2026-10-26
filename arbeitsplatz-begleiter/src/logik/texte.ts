import type { Pluraltext, UiSprachdatei, UiTextSchluessel } from '../typen';
import { QUELLSPRACHE } from '../daten/sprachen';

export interface Text {
  text: string;
  /** Sprache, in der der Text wirklich vorliegt (bei Ersatz: Deutsch). */
  lang: string;
}

export type Parameter = Record<string, string | number>;

export type Uebersetzer = (schluessel: UiTextSchluessel, parameter?: Parameter) => Text;

function einsetzen(vorlage: string, parameter: Parameter): string {
  return vorlage.replace(/\{(\w+)\}/g, (ganz, name: string) =>
    name in parameter ? String(parameter[name]) : ganz,
  );
}

function formWaehlen(eintrag: string | Pluraltext, lang: string, parameter: Parameter): string {
  if (typeof eintrag === 'string') return eintrag;
  const anzahl = Number(parameter.anzahl ?? parameter.n ?? 0);
  // Genaue Null zuerst (z. B. Arabisch „لا توجد خطوات“), dann die Pluralregel der Sprache.
  if (anzahl === 0 && eintrag.zero) return eintrag.zero;
  const regel = new Intl.PluralRules(lang).select(anzahl);
  return eintrag[regel] ?? eintrag.other;
}

/**
 * Liefert eine Funktion t(schluessel, parameter) für eine Sprache.
 * Fehlt ein Text, kommt der deutsche Text mit lang="de" – nie ein leerer Platz.
 */
export function uebersetzerFuer(sprache: string, dateien: UiSprachdatei[]): Uebersetzer {
  const eigene = dateien.find((d) => d.sprache === sprache);
  const deutsch = dateien.find((d) => d.sprache === QUELLSPRACHE);
  return (schluessel, parameter = {}) => {
    const eintrag = eigene?.texte[schluessel];
    if (eintrag !== undefined) {
      return { text: einsetzen(formWaehlen(eintrag, sprache, parameter), parameter), lang: sprache };
    }
    const ersatz = deutsch?.texte[schluessel];
    if (ersatz !== undefined) {
      return { text: einsetzen(formWaehlen(ersatz, QUELLSPRACHE, parameter), parameter), lang: QUELLSPRACHE };
    }
    return { text: schluessel, lang: QUELLSPRACHE };
  };
}

/** Mediopunkte entfernen, damit die Stimme „Tischkante“ statt „Tisch Punkt Kante“ sagt. */
export function fuerVorlesen(text: string): string {
  return text.replace(/·/g, '').replace(/\s*\n\s*/g, ' ').trim();
}

/** Text in Zeilen teilen (Leichte Sprache: jeder Satz in eine eigene Zeile). */
export function zeilen(text: string): string[] {
  return text.split('\n').map((z) => z.trim()).filter(Boolean);
}
