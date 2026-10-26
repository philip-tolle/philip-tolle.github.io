// Adressen der Mitarbeiter-Ansicht. Das Tablet ruft #/platz/<id> auf.
// Hash-Adressen funktionieren auf jedem Webspace ohne Server-Einstellungen.

export type Route =
  | { art: 'uebersicht' }
  | { art: 'start'; platzId: string }
  | { art: 'schritt'; platzId: string; anleitungId: string; position: number }
  | { art: 'fertig'; platzId: string; anleitungId: string }
  | { art: 'unbekannt' };

const ID = '([a-z0-9][a-z0-9-]*)';

export function routeLesen(hash: string): Route {
  const pfad = decodeURIComponent(hash.replace(/^#/, '')).replace(/\/+$/, '') || '/';
  if (pfad === '/') return { art: 'uebersicht' };
  let m = pfad.match(new RegExp(`^/platz/${ID}$`));
  if (m) return { art: 'start', platzId: m[1] };
  m = pfad.match(new RegExp(`^/platz/${ID}/anleitung/${ID}/fertig$`));
  if (m) return { art: 'fertig', platzId: m[1], anleitungId: m[2] };
  m = pfad.match(new RegExp(`^/platz/${ID}/anleitung/${ID}/([1-9][0-9]*)$`));
  if (m) return { art: 'schritt', platzId: m[1], anleitungId: m[2], position: Number(m[3]) };
  return { art: 'unbekannt' };
}

export function adresse(route: Route): string {
  switch (route.art) {
    case 'uebersicht':
    case 'unbekannt':
      return '#/';
    case 'start':
      return `#/platz/${route.platzId}`;
    case 'schritt':
      return `#/platz/${route.platzId}/anleitung/${route.anleitungId}/${route.position}`;
    case 'fertig':
      return `#/platz/${route.platzId}/anleitung/${route.anleitungId}/fertig`;
  }
}
