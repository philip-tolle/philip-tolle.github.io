import {
  ArrowLeft,
  ArrowRight,
  Check,
  Delete,
  Globe,
  Hand,
  House,
  RotateCcw,
  Settings,
  TriangleAlert,
  Volume2,
  type LucideIcon,
} from 'lucide-react';

// Symbole mit Richtung (Pfeile) bekommen die Klasse „spiegeln“ und werden
// bei Rechts-nach-links-Sprachen gespiegelt. Alle anderen bleiben, wie sie sind.

function symbol(Icon: LucideIcon, spiegeln = false) {
  return function Symbol({ groesse = 36 }: { groesse?: number }) {
    return (
      <Icon
        size={groesse}
        strokeWidth={2.5}
        aria-hidden="true"
        focusable="false"
        className={spiegeln ? 'spiegeln' : undefined}
      />
    );
  };
}

export const SymbolZurueck = symbol(ArrowLeft, true);
export const SymbolWeiter = symbol(ArrowRight, true);
export const SymbolNochmal = symbol(RotateCcw, true);
export const SymbolHilfe = symbol(Hand);
export const SymbolVorlesen = symbol(Volume2);
export const SymbolSprache = symbol(Globe);
export const SymbolFertig = symbol(Check);
export const SymbolAchtung = symbol(TriangleAlert);
export const SymbolUebersicht = symbol(House);
export const SymbolEinstellungen = symbol(Settings);
export const SymbolLoeschen = symbol(Delete, true);
