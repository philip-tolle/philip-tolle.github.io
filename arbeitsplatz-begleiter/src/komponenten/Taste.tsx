import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Text } from '../logik/texte';

export type TastenArt = 'neutral' | 'weiter' | 'fertig' | 'hilfe';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  art?: TastenArt;
  symbol: ReactNode;
  text: Text;
}

/** Jede Taste hat ein Symbol UND ein Wort. Farbe nach Bedeutung, nie nach Laune. */
export function Taste({ art = 'neutral', symbol, text, className, ...rest }: Props) {
  return (
    <button type="button" className={`taste taste--${art} ${className ?? ''}`} lang={text.lang} {...rest}>
      <span className="taste-symbol">{symbol}</span>
      <span className="taste-wort">{text.text}</span>
    </button>
  );
}
