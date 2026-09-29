import support from '../assets/offers/entlastung-dunkel.png';
import communication from '../assets/blog/telefonassistenz.png';
import projects from '../assets/blog/arbeit-im-team.png';
import type { DetailOffer } from './detail-offers';

export const operationImages = {
  documents: { src: support, alt: 'Eine Gastgeberin übergibt Unterlagen an ihre Ansprechpartnerin.' },
  communication: { src: communication, alt: 'Ein Rezeptionsteam betreut Gäste; eine Übersicht zeigt die verschiedenen Kontaktwege.' },
  projects: { src: projects, alt: 'Ein Hotelteam stimmt Aufgaben und Termine an einer gemeinsamen Planungstafel ab.' },
};

export const documentsOffer: DetailOffer = {
  area: 'operation', label: 'Karten & Unterlagen', title: 'Speisekarten, Gästemappen & Vorlagen erstellen | NextCourse',
  heading: 'Ihre Unterlagen.', emphasis: 'Aktuell und einsatzbereit.',
  description: 'Wir erstellen und pflegen Speisekarten, Gästemappen und Vorlagen für Ihr Hotel oder Ihre Gastronomie. Sie liefern die Informationen und geben die Inhalte frei – wir kümmern uns um Text, Gestaltung und die vereinbarten Dateien.',
  image: support, imageAlt: operationImages.documents.alt, caption: 'Ein einheitlicher Auftritt bis zur letzten Seite.',
  action: 'Unterlagen besprechen', topic: 'entlastung', facts: ['Druckfertige & digitale Dateien', 'Im Stil Ihres Hauses', 'Einmalig oder regelmäßig'],
  intro: 'Was fertig werden muss,', introEmphasis: 'geben Sie an uns weiter.',
  introText: 'Ob tägliche Änderung oder ein Material, das neu entstehen soll: Wir stimmen Vorlagen, Formate und Liefertermine auf die Verwendung in Ihrem Haus ab.',
  benefits: [
    { title: 'Speise-, Getränke- und Bankettkarten', text: 'Tages- und Wochenkarten, Menükarten, Tagungs- oder Halbpensionsunterlagen: Wir setzen Ihre freigegebenen Angebote und Änderungen in die passenden Formate um.' },
    { title: 'Gästemappen und Informationen', text: 'Informationen zum Aufenthalt, Leistungen Ihres Hauses und Angebote in der Umgebung: Wir ordnen die Inhalte, formulieren Texte und gestalten eine verständliche Gästemappe.' },
    { title: 'Aufsteller und Präsentationen', text: 'Saisonangebote, Veranstaltungshinweise oder eine Vorstellung Ihres Hauses: Wir erstellen Materialien für Tische, Empfang, Bildschirme und Gespräche.' },
    { title: 'Vorlagen und interne Listen', text: 'Wir gestalten vorhandene Checklisten, Übersichten und Arbeitsunterlagen einheitlich. Die fachlichen Inhalte und Zuständigkeiten legt Ihr Haus fest.' },
  ],
  steps: [
    { title: 'Material und Bedarf klären', text: 'Sie zeigen uns vorhandene Unterlagen und nennen Einsatz, Änderungsrhythmus und Termin. Wir vereinbaren Umfang, Formate und Preis.' },
    { title: 'Erstellen und freigeben', text: 'Wir setzen die Inhalte im Stil Ihres Hauses um. Ihre Ansprechperson prüft Angaben und Entwurf und gibt die Fassung frei.' },
    { title: 'Liefern und aktuell halten', text: 'Sie erhalten die vereinbarten Dateien. Für wiederkehrende Änderungen richten wir auf Wunsch einen festen Ablauf ein.' },
  ],
  questions: [
    ['Können wir unsere bestehenden Vorlagen nutzen?', 'Ja. Wir prüfen Ihre Dateien und stimmen ab, welche sich weiterverwenden lassen und wo eine Anpassung nötig ist.'],
    ['Wer prüft Preise und fachliche Angaben?', 'Ihr Haus prüft und bestätigt Preise, Produktangaben, Allergene und weitere fachliche Inhalte vor der finalen Ausgabe. Wir übernehmen die abgestimmte Umsetzung.'],
    ['Ist auch eine einzelne Gästemappe möglich?', 'Ja. Eine neue Gästemappe oder ein einzelnes Material lässt sich als eigener Auftrag vereinbaren. Ein Monatspaket ist dafür nicht erforderlich.'],
    ['Was kostet die Unterstützung?', 'Einzelaufträge kalkulieren wir nach Umfang. Für laufende Kartenpflege gibt es Monatspakete. Druck, Versand und weitere Fremdkosten werden gesondert abgestimmt.'],
  ],
  contactTitle: 'Welche Unterlagen sollen wir für Sie übernehmen?',
};

export const communicationsOffer: DetailOffer = {
  area: 'operation', label: 'Gästekommunikation & Inhalte', title: 'Social Media & Gästekommunikation fürs Gastgewerbe | NextCourse',
  heading: 'Ihr Haus hat viel zu erzählen.', emphasis: 'Wir machen Inhalte daraus.',
  description: 'Wir planen, texten und gestalten Social-Media-Beiträge, Newsletter und Gästeinformationen für Ihr Hotel oder Restaurant. Aus Ihren Themen und Materialien entsteht eine abgestimmte Kommunikation mit Ihren Gästen.',
  image: communication, imageAlt: operationImages.communication.alt, caption: 'Passende Inhalte. Ein gemeinsamer Plan.',
  action: 'Kommunikation besprechen', topic: 'entlastung', facts: ['Text & Gestaltung', 'Abgestimmte Themenplanung', 'Veröffentlichung nach Freigabe'],
  intro: 'Im Kontakt bleiben.', introEmphasis: 'Mit Inhalten, die zu Ihnen passen.',
  introText: 'Sie kennen Ihr Haus und Ihre Gäste. Wir übernehmen die vereinbarten Schritte von der Themenplanung bis zur Ausarbeitung und Veröffentlichung.',
  benefits: [
    { title: 'Social Media und Redaktionsplanung', text: 'Wir planen Themen, schreiben Beiträge und gestalten Inhalte für Instagram und Facebook. Anzahl, Formate und Veröffentlichungstermine werden vorab vereinbart.' },
    { title: 'Newsletter und saisonale Informationen', text: 'Ein neues Angebot, die nächste Saison oder eine Veranstaltung: Wir bereiten Inhalte für die vereinbarten Kanäle auf. Newsletter und Versandumfang stimmen wir gesondert ab.' },
    { title: 'Antwortvorlagen und Gästefeedback', text: 'Wir formulieren wiederkehrende Antworten und bereiten Reaktionen auf Gästefeedback vor. Ihr Haus entscheidet über Ton, Freigabe und die Fälle, die intern beantwortet werden.' },
    { title: 'Inhalte für Aktionen', text: 'Texte und Gestaltung für eine Saisonaktion oder Kampagne werden aufeinander abgestimmt. Fotos und Videos entstehen aus vorhandenem Material oder einer gesondert vereinbarten Produktion.' },
  ],
  steps: [
    { title: 'Themen und Kanäle festlegen', text: 'Wir klären Zielgruppen, vorhandene Materialien und die Aufgaben, die Sie abgeben möchten. Umfang, Termine und Preis stehen vor dem Start fest.' },
    { title: 'Inhalte vorbereiten', text: 'Sie erhalten den vereinbarten Themenplan sowie Texte und Gestaltungsentwürfe. Eine feste Ansprechperson in Ihrem Haus bündelt Rückmeldungen und Freigaben.' },
    { title: 'Veröffentlichen und abstimmen', text: 'Wir liefern die fertigen Inhalte oder veröffentlichen sie nach Vereinbarung und Freigabe. Bei laufender Betreuung besprechen wir regelmäßig die nächsten Themen.' },
  ],
  questions: [
    ['Wer liefert Bilder und Informationen?', 'Wir beginnen mit Ihren vorhandenen Fotos, Videos und Informationen. Welche Rechte und Freigaben vorliegen, klären wir vor der Nutzung. Neue Aufnahmen können gesondert vereinbart werden.'],
    ['Übernehmen Sie auch die Veröffentlichung?', 'Ja, wenn das zum vereinbarten Umfang gehört und die benötigten Zugänge vorliegen. Inhalte werden mit Ihrem Haus abgestimmt und freigegeben.'],
    ['Sind Newsletter und Gästefeedback im Monatspaket enthalten?', 'Der Content Desk hat einen fest beschriebenen Social-Media-Umfang. Newsletter, Antwortvorlagen und die Betreuung von Gästefeedback vereinbaren wir zusätzlich nach Bedarf.'],
    ['Können wir mit einer einzelnen Aktion beginnen?', 'Ja. Wir können Inhalte für ein konkretes Angebot oder eine Aktion als Einzelauftrag erstellen. Für regelmäßige Kommunikation gibt es Monatspakete.'],
  ],
  contactTitle: 'Welche Kommunikation soll leichter von der Hand gehen?',
};
