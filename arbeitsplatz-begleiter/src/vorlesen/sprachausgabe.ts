import type { Sprache } from '../typen';
import { fuerVorlesen } from '../logik/texte';
import { stimmeWaehlen } from './stimmen';

// Vorlesen mit den Stimmen des Geräts (Web Speech API).
// Ab Phase 7 kommt für Sprachen ohne Gerätestimme ein Weg über den Server dazu;
// die Ansichten rufen weiter nur sprich() und stopp() auf.

export interface Sprechteil {
  /** Kennung des Textes auf dem Bildschirm, damit er beim Vorlesen hervorgehoben wird. */
  id: string;
  text: string;
  sprache: Sprache;
}

export interface Ergebnis {
  /** Wie viele Teile vorgelesen werden. 0 = auf diesem Gerät geht es nicht. */
  gesprochen: number;
  ausgelassen: number;
}

type Hoerer = () => void;

class Sprachausgabe {
  private stimmen: SpeechSynthesisVoice[] = [];
  private hoerer = new Set<Hoerer>();
  private durchgang = 0;
  aktiverTeil: string | null = null;

  constructor() {
    if (!this.unterstuetzt) return;
    const laden = () => {
      const liste = window.speechSynthesis.getVoices();
      if (liste.length && liste.length !== this.stimmen.length) {
        this.stimmen = liste;
        this.melden();
      }
    };
    laden();
    window.speechSynthesis.addEventListener?.('voiceschanged', laden);
    // Manche Browser (Safari) melden das Laden der Stimmen nicht.
    let versuche = 0;
    const takt = window.setInterval(() => {
      laden();
      if (++versuche > 20 || this.stimmen.length) window.clearInterval(takt);
    }, 250);
  }

  get unterstuetzt(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  stimmeFuer(sprache: Sprache): SpeechSynthesisVoice | null {
    if (!this.unterstuetzt || sprache.vorlesen === 'keiner') return null;
    return stimmeWaehlen(this.stimmen, sprache.stimmen);
  }

  hatStimme(sprache: Sprache): boolean {
    return this.stimmeFuer(sprache) !== null;
  }

  /** iOS erlaubt Vorlesen erst nach einer Berührung. Einmal leise „entsperren“. */
  entsperren() {
    if (!this.unterstuetzt) return;
    const leer = new SpeechSynthesisUtterance(' ');
    leer.volume = 0;
    window.speechSynthesis.speak(leer);
  }

  sprich(teile: Sprechteil[], rate: number): Ergebnis {
    this.stopp();
    if (!this.unterstuetzt) return { gesprochen: 0, ausgelassen: teile.length };
    const synth = window.speechSynthesis;
    const durchgang = ++this.durchgang;
    let gesprochen = 0;
    const mitStimme = teile
      .map((teil) => ({ teil, stimme: this.stimmeFuer(teil.sprache) }))
      .filter((x) => x.stimme && x.teil.text.trim());
    mitStimme.forEach(({ teil, stimme }, i) => {
      const u = new SpeechSynthesisUtterance(fuerVorlesen(teil.text));
      u.voice = stimme;
      u.lang = stimme!.lang;
      u.rate = rate;
      u.onstart = () => {
        if (durchgang !== this.durchgang) return;
        this.aktiverTeil = teil.id;
        this.melden();
      };
      const ende = () => {
        if (durchgang !== this.durchgang) return;
        if (i === mitStimme.length - 1) {
          this.aktiverTeil = null;
          this.melden();
        }
      };
      u.onend = ende;
      u.onerror = ende;
      synth.speak(u);
      gesprochen++;
    });
    // Chrome bleibt manchmal im Pausen-Zustand hängen.
    synth.resume();
    return { gesprochen, ausgelassen: teile.length - gesprochen };
  }

  stopp() {
    this.durchgang++;
    if (this.unterstuetzt && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      window.speechSynthesis.cancel();
    }
    if (this.aktiverTeil !== null) {
      this.aktiverTeil = null;
      this.melden();
    }
  }

  abonnieren(hoerer: Hoerer): () => void {
    this.hoerer.add(hoerer);
    return () => this.hoerer.delete(hoerer);
  }

  private melden() {
    this.hoerer.forEach((h) => h());
  }
}

export const sprachausgabe = new Sprachausgabe();
