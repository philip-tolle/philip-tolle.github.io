import type { DetailOffer } from './detail-offers';
import training from '../assets/offers/inhouse-schulung.png';

// Existing Academy topic, now described on its own detail page.
export const digitalTeamOffer: DetailOffer = {
  area: 'academy', label: 'Digitale Zusammenarbeit',
  title: 'Digitale Zusammenarbeit im Gastgewerbe | NextCourse Academy',
  description: 'Digitalen Wandel im Hotel- und Gastronomieteam verständlich machen. Eine Schulung zu Zusammenarbeit, Kommunikation und gemeinsamen Arbeitsweisen – auf Anfrage.',
  heading: 'Digitalen Wandel verstehen.', emphasis: 'Gemeinsam weiterkommen.',
  image: training, imageAlt: 'Ein Team aus dem Gastgewerbe bespricht mit einer Trainerin gemeinsame Arbeitsweisen.',
  caption: 'Neue Arbeitsweisen. Gemeinsam eingeübt.', action: 'Teamschulung besprechen', topic: 'academy',
  facts: ['Für Führungskräfte & Teams', 'Inhalte und Dauer nach Absprache', 'Preis auf Anfrage'],
  intro: 'Neue Werkzeuge.', introEmphasis: 'Klare Zusammenarbeit.',
  introText: 'Das Thema „Digitaler Wandel & Mitarbeiterzufriedenheit“ setzt bei den Menschen an: Was verändert sich an ihrer Arbeit, welche Fragen entstehen und welche Vereinbarungen helfen im Alltag?',
  benefits: [
    { title: 'Veränderungen verständlich machen', text: 'Wir üben, den Zweck einer neuen Arbeitsweise zu erklären: Welche Aufgabe soll leichter werden und was bedeutet das für die Beteiligten?' },
    { title: 'Fragen im Team aufgreifen', text: 'An Beispielen aus Ihrem Alltag besprechen wir Unsicherheiten, Erwartungen und Rückmeldungen. So werden offene Fragen sichtbar und können geklärt werden.' },
    { title: 'Gemeinsame Arbeitsweisen festhalten', text: 'Wer gibt welche Information weiter? Wo ist sie zu finden? Das Team formuliert klare Absprachen und wählt einen nächsten Schritt zum Erproben.' },
  ],
  steps: [
    { title: 'Die Situation klären', text: 'Welche Veränderung steht an, wen betrifft sie und wo fehlen noch Sicherheit oder gemeinsame Absprachen?' },
    { title: 'Mit dem Team üben', text: 'Wir arbeiten mit passenden Beispielen, besprechen Informationswege und üben verständliche Kommunikation.' },
    { title: 'Den nächsten Schritt wählen', text: 'Das Team hält fest, was es ausprobieren möchte, wer beteiligt ist und wann die Erfahrungen gemeinsam besprochen werden.' },
  ],
  questions: [
    ['Für wen ist die Schulung gedacht?', 'Für Gastgeber, Führungskräfte und Mitarbeitende, die neue digitale Arbeitsweisen gemeinsam einführen oder bestehende Zusammenarbeit verbessern möchten. Die Zusammensetzung der Gruppe stimmen wir auf Ihr Lernziel ab.'],
    ['Geht es um ein bestimmtes Programm?', 'Im Mittelpunkt stehen Verständnis, Kommunikation und gemeinsame Arbeitsweisen. Wenn Sie bereits ein Werkzeug nutzen, können passende Situationen daraus einfließen. Eine technische Einrichtung oder Software-Einführung wird gesondert vereinbart.'],
    ['Können wir im eigenen Betrieb lernen?', 'Ja. Über die Flying Academy kann Ihr Team gemeinsam in Ihrem Haus lernen. Wir klären Raum, Technik, Gruppengröße und Dauer vorab.'],
    ['Wie erfahren wir Termin und Preis?', 'Nennen Sie uns Ihr Thema, die ungefähre Gruppengröße und Ihren zeitlichen Rahmen. Sie erhalten ein Angebot mit abgestimmten Inhalten und Konditionen, bevor Sie buchen.'],
  ],
  contactTitle: 'Welche Veränderung beschäftigt Ihr Team?',
};
