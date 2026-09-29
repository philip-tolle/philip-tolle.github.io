import type { ImageMetadata } from 'astro';
import managementImage from '../assets/services/management-ablaeufe-dunkel.png';
import academyImage from '../assets/services/academy-team-dunkel.png';
import operationImage from '../assets/services/operation-entlastung-dunkel.png';

export interface HomeSituation {
  id: string;
  short: string;
  guide: string;
  situation: string;
  heading: string;
  emphasis: string;
  description: string;
  mobileSummary: string;
  action: string;
  area: 'Management' | 'Academy' | 'Operation';
  href: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const situations: readonly HomeSituation[] = [
  {
    id: 'leistung-ablaeufe', short: 'Abläufe ordnen', guide: 'Management · Standards & Betriebswissen',
    situation: 'Ständig dieselben Rückfragen?', heading: 'Gute Abläufe.', emphasis: 'Gemeinsame Routine.',
    description: 'Wir prüfen Abläufe und machen Betriebswissen zugänglich – zum Beispiel mit einem digitalen Handbuch für Standards, Zuständigkeiten und Einarbeitung.',
    mobileSummary: 'Betriebswissen und Abläufe für Ihr Team klar und nutzbar machen.',
    action: 'Management kennenlernen', area: 'Management', href: '/management/',
    image: managementImage,
    imageAlt: 'Illustration: Eine Mitarbeiterin ordnet die Abläufe von Rezeption, Service und Housekeeping an einer gemeinsamen Übersicht.',
  },
  {
    id: 'leistung-team', short: 'Team stärken', guide: 'Academy · Weiterbildung im Gastgewerbe',
    situation: 'Neue Aufgaben. Unsicherheit im Team?', heading: 'Wissen, das bleibt.', emphasis: 'Und im Alltag hilft.',
    description: 'In Seminaren und Schulungen bei Ihnen vor Ort übt Ihr Team an Aufgaben aus dem eigenen Haus – verständlich und direkt anwendbar.',
    mobileSummary: 'Praxisnahe Schulungen zu KI und digitaler Zusammenarbeit.',
    action: 'Weiterbildung entdecken', area: 'Academy', href: '/akademie/',
    image: academyImage,
    imageAlt: 'Illustration: Ein Team aus dem Gastgewerbe lernt gemeinsam in einer praxisnahen Schulung.',
  },
  {
    id: 'leistung-entlastung', short: 'Arbeit abgeben', guide: 'Operation · Laufende Aufgaben übernehmen',
    situation: 'Die To-do-Liste bleibt länger als der Tag?', heading: 'Aufgaben abgeben.', emphasis: 'Den Alltag entlasten.',
    description: 'Wir erstellen und pflegen Unterlagen, unterstützen Ihre Kommunikation und koordinieren Projekte. Sie geben vereinbarte Aufgaben ab und behalten den Überblick.',
    mobileSummary: 'Karten, Gästeinhalte und Aktionen im Alltag abgeben.',
    action: 'Unterstützung entdecken', area: 'Operation', href: '/operation/',
    image: operationImage,
    imageAlt: 'Illustration: Eine Mitarbeiterin übergibt Aufgaben und Unterlagen an ihre Ansprechpartnerin im Backoffice.',
  },
];
