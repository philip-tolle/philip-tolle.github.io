// Die vier Wege aus dem Booklet. Grundlage für Navigation, Startseite, Footer und 404.
export interface Weg {
  id: 'handbuch' | 'entlastung' | 'checks' | 'training';
  nr: string;
  title: string;
  nav: string;
  href: string;
  topic: string;
  claim: string;
  emphasis: string;
  checks: string[];
}

export const wege: Weg[] = [
  {
    id: 'handbuch', nr: '01', title: 'Digitales Betriebshandbuch', nav: 'Betriebshandbuch', href: '/betriebshandbuch/', topic: 'betriebshandbuch',
    claim: 'Wissen, das im Haus bleibt.', emphasis: 'Auch wenn Menschen gehen.',
    checks: [
      'Im Team tauchen dieselben Fragen immer wieder auf.',
      'Einarbeitung bindet über Wochen erfahrene Mitarbeitende.',
      'Wissen steckt in wenigen Köpfen und eine Betriebsübergabe oder ein Verkauf steht an.',
    ],
  },
  {
    id: 'entlastung', nr: '02', title: 'Entlastung im Alltag', nav: 'Entlastung', href: '/entlastung/', topic: 'entlastung',
    claim: 'Karten, Aushänge, Beiträge.', emphasis: 'Zuverlässig fertig, ohne zusätzliche Stelle.',
    checks: [
      'Karten, Aushänge und Aktualisierungen binden viel Führungszeit.',
      'Gästeinformationen und der Onlineauftritt warten auf Aktualisierung.',
      'Für eine Stelle zu wenig, zum Liegenlassen zu viel.',
    ],
  },
  {
    id: 'checks', nr: '03', title: 'Mystery Check und Digital Audit', nav: 'Checks', href: '/mystery-check-digital-audit/', topic: 'checks',
    claim: 'Noch nicht bereit für ein Projekt?', emphasis: 'Beginnen Sie mit einem ehrlichen Blick.',
    checks: [
      'Etwas läuft nicht rund, aber die Ursache ist unklar.',
      'Weniger Anfragen und Bewerbungen trotz guter Bewertungen.',
      'Daten werden in mehreren Systemen doppelt gepflegt.',
    ],
  },
  {
    id: 'training', nr: '04', title: 'Training und Projekte', nav: 'Training & Projekte', href: '/training-projekte/', topic: 'training',
    claim: 'Lösungen für Ihr Team.', emphasis: 'Wir kommen und trainieren.',
    checks: [
      'Neue Mitarbeitende und Aushilfen brauchen schnell Orientierung.',
      'Für Schulungen außerhalb der Pflichtunterweisungen fehlt die Zeit.',
      'Eine Idee wartet seit Monaten auf Umsetzung.',
    ],
  },
];

export const kontakt = {
  telefon: '+49 151 20220983',
  telefonHref: 'tel:+4915120220983',
  email: 'tolle@nextcourse-academy.de',
  termin: 'https://cal.com/philip-tolle-yxp7ih/erstgesprach',
};
