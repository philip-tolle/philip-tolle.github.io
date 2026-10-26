import type { ReactNode } from 'react';

interface Props {
  an: boolean;
  onWechsel: (an: boolean) => void;
  children: ReactNode;
  lang?: string;
}

export function Schalter({ an, onWechsel, children, lang }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      className={`schalter ${an ? 'schalter--an' : ''}`}
      onClick={() => onWechsel(!an)}
      lang={lang}
    >
      <span className="schalter-bahn" aria-hidden="true">
        <span className="schalter-knopf" />
      </span>
      <span className="schalter-text">{children}</span>
    </button>
  );
}
