// Adressen der Mitarbeiter-Ansicht. Das Tablet ruft #/platz/<id> auf.
// Hash-Adressen funktionieren auf jedem Webspace ohne Server-Einstellungen.

export type Route =
  | { art: 'uebersicht' }
  | { art: 'start'; platzId: string }
  | { art: 'schritt'; platzId: string; anleitungId: string; position: number }
  | { art: 'fertig'; platzId: string; anleitungId: string }
  | { art: 'anleiter'; teile: string[] }
  | { art: 'unbekannt' };

const ID = '([a-z0-9][a-z0-9-]*)';

export function routeLesen(hash: string): Route {
  const pfad = decodeURIComponent(hash.replace(/^#/, '')).replace(/\/+$/, '') || '/';
  if (pfad === '/') return { art: 'uebersicht' };
  // Anleiter-Bereich: #/anleiter, #/anleiter/anleitungen/<id>, #/anleiter/team …
  if (pfad === '/anleiter' || pfad.startsWith('/anleiter/')) {
    const teile = pfad.split('/').slice(2).filter(Boolean);
    return teile.every((t) => /^[a-z0-9][a-z0-9-]*$/.test(t)) ? { art: 'anleiter', teile } : { art: 'unbekannt' };
  }
  // Kurzform „#bankett“ für Links, in denen nur ein einfacher Anker erlaubt ist.
  const kurz = pfad.match(new RegExp(`^${ID}$`));
  if (kurz) return { art: 'start', platzId: kurz[1] };
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
    case 'anleiter':
      return ['#/anleiter', ...route.teile].join('/');
    case 'schritt':
      return `#/platz/${route.platzId}/anleitung/${route.anleitungId}/${route.position}`;
    case 'fertig':
      return `#/platz/${route.platzId}/anleitung/${route.anleitungId}/fertig`;
  }
}
