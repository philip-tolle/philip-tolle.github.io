import { operationImages } from './operation-services';
import type { ImageMetadata } from 'astro';
import managementImage from '../assets/services/heroes/management-titel.png';
import academyImage from '../assets/services/heroes/academy-titel.png';
import operationImage from '../assets/services/heroes/operation-titel.png';
import handbook from '../assets/offers/betriebshandbuch-dunkel.png';
import audit from '../assets/offers/digital-audit-dunkel.png';
import mystery from '../assets/offers/mystery-check-dunkel.png';
import support from '../assets/offers/entlastung-dunkel.png';
import implementation from '../assets/offers/umsetzung-dunkel.png';
import training from '../assets/offers/inhouse-schulung.png';
import seminar from '../assets/services/academy-team-orange.png';

const offerImages = {
  implementation: { src: implementation, alt: 'Ein Team erprobt mit einer Begleiterin neue Serviceabläufe im eigenen Betrieb.' },
  handbook: { src: handbook, alt: 'Eine Mitarbeiterin führt Hausstandards und Arbeitsanweisungen in einem digitalen Betriebshandbuch zusammen.' },
  audit: { src: audit, alt: 'Eine Mitarbeiterin untersucht doppelte Informationswege und verbindet Arbeitsschritte zu einem klaren Ablauf.' },
  mystery: { src: mystery, alt: 'Der Gästeweg von der Online-Suche über den Aufenthalt bis zum Feedback wird gemeinsam betrachtet.' },
  support: { src: support, alt: 'Eine Gastgeberin übergibt Unterlagen und Aufgaben an ihre Ansprechpartnerin im Backoffice.' },
  training: { src: training, alt: 'Ein Serviceteam übt gemeinsam mit einer Trainerin direkt im eigenen Betrieb.' },
  seminar: { src: seminar, alt: 'Ein Team aus dem Gastgewerbe erarbeitet mit einer Trainerin neue Kenntnisse für den Arbeitsalltag.' },
};

export interface JourneyStep {
  id: string; label: string; title: string; emphasis: string; situation: string;
  image: { src: ImageMetadata; alt: string }; description: string; points: string[];
  href?: string; action?: string; listLabel?: string; note?: string; status?: string;
  aliases?: string[];
  offers?: { title: string; description: string; href: string; action: string }[];
}
export interface ServicePageContent {
  id: 'management' | 'academy' | 'operation'; area: string; topic: string; title: string; description: string;
  image: ImageMetadata; imageAlt: string;
  hero: { heading: string; emphasis: string; description: string; action: string };
  journey: { kicker: string; heading: string; emphasis: string; intro: string; steps: JourneyStep[]; links?: { label: string; href: string }[] };
  related?: { intro: string; links: { label: string; href: string }[] };
  contactTitle: string;
}

export const management: ServicePageContent = {
  id: 'management', area: 'Management', topic: 'management', title: 'Management für Hotels & Gastronomie | NextCourse',
  description: 'Weniger Rückfragen, klare Abläufe und Wissen, das im Haus bleibt. Digitales Betriebshandbuch, Mystery Check und Digital Audit für Hotels und Gastronomie in Mainfranken.',
  image: managementImage, imageAlt: 'Eine Mitarbeiterin ordnet die Abläufe von Rezeption, Service und Housekeeping an einer gemeinsamen Übersicht.',
  hero: { heading: 'Ein Betrieb, der auf', emphasis: 'klaren Abläufen steht.', description: 'Wir prüfen Abläufe und Gästeerlebnisse, halten Betriebswissen fest und führen Verbesserungen mit Ihrem Team ein. Sie erhalten klare Standards, konkrete Prioritäten oder einen erprobten neuen Ablauf.', action: 'Über Ihren Betrieb sprechen' },
  journey: {
    kicker: 'Weniger Rückfragen. Mehr Klarheit.', heading: 'Was soll in Ihrem Haus', emphasis: 'leichter laufen?',
    intro: 'Wissen zugänglich machen, den Service aus Gästesicht prüfen oder digitale Abläufe ordnen: Wählen Sie nach Ihrem Anliegen. Steht das Ziel schon fest, begleiten wir die Umsetzung.',
    steps: [
      {
        id: 'handbuch', label: 'Betriebshandbuch', image: offerImages.handbook,
        aliases: ['management-wissen'], situation: '„Wie machen wir das bei uns?“',
        title: 'Hausstandards und Anleitungen.', emphasis: 'An einem gemeinsamen Ort.',
        description: 'Wenn Wissen an einzelnen Menschen hängt: Wir ordnen Ihre Unterlagen und beschreiben die vereinbarten Aufgaben mit Ihrem Team. Das Ergebnis ist ein digitales Handbuch für Standards, Einarbeitung und Übergaben.',
        points: ['Hausstandards und Arbeitsanweisungen festhalten', 'Einarbeitung und Übergaben erleichtern', 'Zuständigkeiten für alle verständlich machen'],
        href: '/management/betriebshandbuch/', action: 'Betriebshandbuch entdecken', note: 'Einführung gemeinsam mit Ihrem Team.'
      },
      {
        id: 'mystery', label: 'Mystery Check', image: offerImages.mystery,
        aliases: ['management-gast'], situation: 'Wie fühlt sich Ihr Haus für einen Gast an?',
        title: 'Ihr Haus aus Gästesicht.', emphasis: 'Mit konkreten nächsten Schritten.',
        description: 'Wenn Sie wissen möchten, wie Gäste Ihren Betrieb erleben: Wir betrachten die vereinbarten Kontaktpunkte und halten Beobachtungen fest. Sie erhalten eine Auswertung mit Stärken, Reibungspunkten und priorisierten Maßnahmen.',
        points: ['Den Weg Ihrer Gäste nachvollziehen', 'Konkrete Beobachtungen statt Vermutungen', 'Ansatzpunkte für den Service priorisieren'],
        href: '/management/mystery-check/', action: 'Mystery Check kennenlernen'
      },
      {
        id: 'audit', label: 'Digital Audit', image: offerImages.audit,
        aliases: ['management-ablaeufe'], situation: 'Viele Systeme. Trotzdem doppelte Arbeit?',
        title: 'Abläufe und Systeme geprüft.', emphasis: 'Die nächsten Schritte geordnet.',
        description: 'Wenn Informationen doppelt erfasst werden oder Übergaben stocken: Wir prüfen das Zusammenspiel Ihrer Arbeitsmittel und Abläufe. Sie erhalten Befunde und geordnete Maßnahmen; eine anschließende Umsetzung vereinbaren wir separat.',
        points: ['Digitale Arbeitsmittel und Abläufe prüfen', 'Doppelte Arbeit und Medienbrüche erkennen', 'Maßnahmen nach Nutzen und Aufwand ordnen'],
        href: '/management/digital-audit/', action: 'Digital Audit entdecken'
      },
      {
        id: 'umsetzung', label: 'Umsetzungsprojekte', image: offerImages.implementation,
        situation: 'Sie wissen, was sich ändern soll?', title: 'Ein neuer Ablauf.', emphasis: 'Mit Ihrem Team eingeführt.',
        description: 'Wenn das Ziel feststeht: Wir richten einen neuen Ablauf oder eine digitale Lösung ein und erproben ihn mit Ihrem Team. Dazu können eine klare Schichtübergabe, ein verlässlicher Zimmerstatus oder ein geordneter Anfrageweg gehören.',
        points: ['Ziel, Umfang und Festpreis vorab vereinbaren', 'Lösung einrichten und mit Ihrem Team erproben', 'Einweisung und Zuständigkeiten festhalten'],
        href: '/management/implementierungsprojekte/', action: 'Umsetzung kennenlernen', note: 'Für laufende Unterlagen, Kommunikation und organisatorische Aufgaben ist Operation der passende Bereich.'
      },
    ],
  },
  related: { intro: 'Sie möchten bestehende Aufgaben abgeben oder Mitarbeitende schulen? Dafür gibt es Operation und Academy.', links: [{ label: 'Team schulen mit Academy', href: '/akademie/' }, { label: 'Unterlagen & Kommunikation abgeben', href: '/operation/' }] },
  contactTitle: 'Wo braucht Ihr Betrieb mehr Klarheit?',
};

export const academy: ServicePageContent = {
  id: 'academy', area: 'Academy', topic: 'academy', title: 'Weiterbildung für Hotel & Gastronomie | NextCourse Academy',
  description: 'KI verstehen und digitale Zusammenarbeit im Team verbessern. Praxisnahe Weiterbildung für Hotels und Gastronomie in Mainfranken – auch bei Ihnen im Betrieb.',
  image: academyImage, imageAlt: 'Eine Trainerin vermittelt einem Team aus dem Gastgewerbe Wissen für den Arbeitsalltag.',
  hero: { heading: 'Weiterbildung,', emphasis: 'die im Alltag ankommt.', description: 'KI sinnvoll einsetzen und digitale Veränderungen gemeinsam angehen: Ihr Team lernt mit Beispielen aus Hotel und Gastronomie. In Mainfranken und auf Wunsch direkt in Ihrem Haus.', action: 'Schulung besprechen' },
  journey: {
    kicker: 'Die Themen', heading: 'Was soll Ihr Team', emphasis: 'sicherer können?',
    intro: 'Wählen Sie zuerst das Lernziel. Auf den Karten finden Sie die Inhalte; Termin und Rahmen stimmen wir anschließend mit Ihnen ab.',
    links: [{ label: 'Schulung im eigenen Haus', href: '#format-flying' }],
    steps: [
      {
        id: 'ki', label: 'KI im Geschäftsalltag', image: offerImages.seminar,
        aliases: ['format-seminare', 'academy-einstieg'], status: '1 Tag · Termin auf Anfrage',
        situation: 'Sie möchten wissen, wobei KI Ihrem Haus helfen kann.',
        title: 'KI verstehen.', emphasis: 'Sinnvoll ausprobieren.',
        description: 'Für Gastgeber, Führungskräfte und Teams ohne KI-Vorkenntnisse. Sie üben an typischen Aufgaben, prüfen Ergebnisse und wählen Anwendungen für Ihr Haus aus.',
        points: ['Texte entwerfen und Informationen ordnen', 'Grenzen erkennen und Ergebnisse prüfen', 'Anwendungsfälle, Vorlagen und Teilnahmenachweis'],
        href: '/akademie/ki-grundlagen/', action: 'KI-Seminar kennenlernen',
        note: 'Ein Tag, auch als Schulung für Ihr Team im eigenen Betrieb. Preis auf Anfrage.'
      },
      {
        id: 'zusammenarbeit', label: 'Digitale Zusammenarbeit', image: offerImages.training,
        status: 'Inhalte nach Absprache', situation: 'Ein neues Werkzeug allein verändert noch keine Routine.',
        title: 'Veränderung erklären.', emphasis: 'Das Team mitnehmen.',
        description: 'Für Führungskräfte und Teams, die digitale Arbeitsweisen gemeinsam einführen. An typischen Übergaben und Rückfragen üben wir, Veränderungen verständlich zu besprechen und klare Absprachen zu treffen.',
        points: ['Aufgaben und Informationswege gemeinsam klären', 'Fragen und Bedenken im Team aufgreifen', 'Einen überschaubaren nächsten Schritt vereinbaren'],
        href: '/akademie/digitale-zusammenarbeit/', action: 'Schulung zur digitalen Zusammenarbeit kennenlernen',
        note: 'Thema: digitaler Wandel und Mitarbeiterzufriedenheit. Lernziel, Dauer und Gruppengröße stimmen wir vorab ab.'
      },
    ],
  },
  contactTitle: 'Was soll Ihr Team morgen sicherer können?',
};

export const operation: ServicePageContent = {
  id: 'operation', area: 'Operation', topic: 'entlastung', title: 'Karten, Kommunikation & Aktionen fürs Gastgewerbe | NextCourse',
  description: 'Wir erstellen Karten und Unterlagen, betreuen Gästekommunikation und organisieren Aktionen. Unterstützung für Hotels und Gastronomie in Mainfranken.',
  image: operationImage, imageAlt: 'Eine Mitarbeiterin übergibt Aufgaben an ihre Ansprechpartnerin im Backoffice.',
  hero: { heading: 'Aufgaben abgeben.', emphasis: 'Mehr Zeit für Ihr Haus.', description: 'Wir erstellen Ihre Karten und Unterlagen, kümmern uns um Inhalte für Ihre Gäste und organisieren Aktionen. Für Hotels und Gastronomie in Mainfranken – mit einer festen Ansprechperson und klar vereinbarten Aufgaben.', action: 'Aufgaben besprechen' },
  journey: {
    kicker: 'Diese Aufgaben übernehmen wir.', heading: 'Was möchten Sie', emphasis: 'in gute Hände geben?',
    intro: 'Die Wochenkarte muss fertig werden, der nächste Beitrag fehlt oder eine Saisonaktion wartet auf Umsetzung? Hier finden Sie die passende Unterstützung für Ihr Anliegen.',
    steps: [
      {
        id: 'unterlagen', label: 'Karten & Unterlagen', image: operationImages.documents,
        aliases: ['operation-backoffice'], situation: 'Schon wieder dieselben Unterlagen?',
        title: 'Aktuell und einsatzbereit.', emphasis: 'Im Stil Ihres Hauses.',
        description: 'Wir erstellen und aktualisieren Speisekarten, Gästemappen und Vorlagen aus Ihren Informationen. Sie erhalten die vereinbarten Dateien für Druck und digitale Nutzung.',
        listLabel: 'Das können Sie abgeben', points: ['Tages-, Wochen- und Bankettkarten', 'Gästemappen, Aufsteller und Präsentationen', 'Vorlagen, Checklisten und interne Listen'],
        href: '/operation/karten-unterlagen/', action: 'Leistungen für Karten und Unterlagen ansehen', note: 'Einzelne Materialien oder laufende Pflege – nach Ihrem Bedarf.'
      },
      {
        id: 'kommunikation', label: 'Gästekommunikation & Inhalte', image: operationImages.communication,
        aliases: ['operation-kommunikation'], situation: 'Viel zu erzählen. Wenig Zeit dafür.',
        title: 'Ihr Haus bleibt sichtbar.', emphasis: 'Ihre Gäste gut informiert.',
        description: 'Wir planen, texten und gestalten Inhalte für Ihre Gäste: von Social-Media-Beiträgen bis zum Newsletter. Themen, Ton und Veröffentlichungen stimmen wir mit Ihrem Haus ab.',
        listLabel: 'Das können Sie abgeben', points: ['Social Media und Redaktionsplanung', 'Newsletter und saisonale Gästeinformationen', 'Antwortvorlagen und abgestimmte Reaktionen auf Gästefeedback'],
        href: '/operation/gaestekommunikation/', action: 'Leistungen für Gästekommunikation ansehen', note: 'Auf Basis Ihrer Materialien und mit Ihrer Freigabe.'
      },
      {
        id: 'aktionen', label: 'Aktionen & Veranstaltungen', image: operationImages.projects,
        aliases: ['operation-projekte', 'format-projekt'], situation: 'Eine gute Idee. Aber niemand hat Zeit dafür.',
        title: 'Von der Idee', emphasis: 'zur organisierten Aktion.',
        description: 'Wir planen Saisonaktionen, Gastgeschenke und Veranstaltungen und koordinieren die vereinbarten Aufgaben. Sie behalten den Überblick über Termine, Budget und Entscheidungen.',
        listLabel: 'Zum Beispiel', points: ['Saisonaktionen und Kampagnen vorbereiten', 'Gastgeschenke auswählen und organisieren', 'Sommer- und Mitarbeiterfeste planen'],
        href: '/operation/projekte/', action: 'Leistungen für Aktionen und Veranstaltungen ansehen', note: 'Ziel, Umfang und Festpreis vor dem Start. Vor-Ort-Begleitung nach Vereinbarung.'
      },
    ],
  },
  related: { intro: 'Sie möchten einen Ablauf neu aufbauen oder Ihr Team schulen? Management und Academy ergänzen die laufende Unterstützung.', links: [{ label: 'Abläufe verbessern', href: '/management/' }, { label: 'Team weiterbilden', href: '/akademie/' }] },
  contactTitle: 'Welche Aufgabe würden Sie gern abgeben?',
};
