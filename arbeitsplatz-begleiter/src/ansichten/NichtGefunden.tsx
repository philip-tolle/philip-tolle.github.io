import type { Text } from '../logik/texte';
import { SymbolZurueck } from '../komponenten/Symbole';

/** Freundliche Seite für falsche Adressen. Zurück geht immer. */
export function NichtGefunden({ text, zurueckText, ziel }: { text: Text; zurueckText: Text; ziel: string }) {
  return (
    <main className="nicht-gefunden" lang={text.lang}>
      <h1>{text.text}</h1>
      <a href={ziel} className="taste taste--neutral" lang={zurueckText.lang}>
        <span className="taste-symbol">
          <SymbolZurueck />
        </span>
        <span className="taste-wort">{zurueckText.text}</span>
      </a>
    </main>
  );
}
