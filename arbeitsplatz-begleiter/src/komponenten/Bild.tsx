import { useState } from 'react';

interface Props {
  url: string | null;
  nummer: number;
  klein?: boolean;
}

/** Bild ist für alle Sprachen gleich und wird nie gespiegelt. Ohne Bild: Kreis mit Schrittnummer. */
export function Bild({ url, nummer, klein }: Props) {
  const [fehler, setFehler] = useState(false);
  return (
    <div className={`bildkarte ${klein ? 'bildkarte--klein' : ''}`} dir="ltr">
      {url && !fehler ? (
        <img src={url} alt="" draggable={false} onError={() => setFehler(true)} />
      ) : (
        <span className="nummernkreis" aria-hidden="true">
          {nummer}
        </span>
      )}
    </div>
  );
}
