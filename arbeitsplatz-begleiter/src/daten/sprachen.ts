import type { Sprache } from '../typen';

// Startliste der Sprachen. Reihenfolge = Reihenfolge in der Sprachwahl.
// Farsi und Dari sind getrennt: andere Wörter, andere Stimmen, und Dari
// braucht eine Prüfung durch Sprachpaten.
export const SPRACHEN: Sprache[] = [
  { code: 'de', name_eigen: 'Deutsch', name_de: 'Deutsch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['de-DE', 'de-AT', 'de-CH', 'de'] },
  { code: 'en', name_eigen: 'English', name_de: 'Englisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['en-GB', 'en-US', 'en'] },
  { code: 'uk', name_eigen: 'Українська', name_de: 'Ukrainisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['uk-UA', 'uk'] },
  { code: 'ru', name_eigen: 'Русский', name_de: 'Russisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['ru-RU', 'ru'] },
  { code: 'ar', name_eigen: 'العربية', name_de: 'Arabisch', richtung: 'rtl', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['ar-SY', 'ar-SA', 'ar-EG', 'ar'] },
  { code: 'tr', name_eigen: 'Türkçe', name_de: 'Türkisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['tr-TR', 'tr'] },
  { code: 'ro', name_eigen: 'Română', name_de: 'Rumänisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['ro-RO', 'ro'] },
  { code: 'pl', name_eigen: 'Polski', name_de: 'Polnisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['pl-PL', 'pl'] },
  { code: 'bg', name_eigen: 'Български', name_de: 'Bulgarisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['bg-BG', 'bg'] },
  { code: 'hr', name_eigen: 'Hrvatski', name_de: 'Kroatisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['hr-HR', 'hr'] },
  { code: 'es', name_eigen: 'Español', name_de: 'Spanisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['es-ES', 'es'] },
  { code: 'it', name_eigen: 'Italiano', name_de: 'Italienisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['it-IT', 'it'] },
  { code: 'vi', name_eigen: 'Tiếng Việt', name_de: 'Vietnamesisch', richtung: 'ltr', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['vi-VN', 'vi'] },
  { code: 'fa', name_eigen: 'فارسی', name_de: 'Farsi', richtung: 'rtl', vorlesen: 'geraet', qualitaet: 'gut', aktiv: true, stimmen: ['fa-IR', 'fa'] },
  { code: 'prs', name_eigen: 'دری', name_de: 'Dari', richtung: 'rtl', vorlesen: 'server', qualitaet: 'eingeschraenkt', aktiv: true, stimmen: ['fa-AF', 'prs'] },
  { code: 'ti', name_eigen: 'ትግርኛ', name_de: 'Tigrinya', richtung: 'ltr', vorlesen: 'keiner', qualitaet: 'eingeschraenkt', aktiv: true, stimmen: ['ti-ER', 'ti-ET', 'ti'] },
];

export const QUELLSPRACHE = 'de';

export function spracheFinden(code: string, sprachen: Sprache[] = SPRACHEN): Sprache | undefined {
  return sprachen.find((s) => s.code === code);
}
