import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fehlertext } from './api';
import { Meldungen } from './gemeinsam';

/**
 * Anmeldung ohne Passwort: E-Mail eingeben, Code aus der E-Mail eintippen
 * (oder auf den Link in der E-Mail tippen). Nur eingeladene Adressen bekommen Zugang.
 */
export function Anmeldung({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [schritt, setSchritt] = useState<'email' | 'code'>('email');
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  const codeFeld = useRef<HTMLInputElement>(null);

  useEffect(() => ueberschrift.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    if (schritt === 'code') codeFeld.current?.focus();
  }, [schritt]);

  async function codeAnfordern(e?: FormEvent) {
    e?.preventDefault();
    setLaeuft(true);
    setFehler(null);
    setErfolg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname, shouldCreateUser: true },
    });
    setLaeuft(false);
    if (error) {
      setFehler(
        /rate limit|security purposes/i.test(error.message)
          ? 'Bitte warte kurz und fordere dann einen neuen Code an.'
          : fehlertext(error),
      );
      return;
    }
    setSchritt('code');
    setErfolg(`Wir haben eine E-Mail an ${email.trim()} geschickt.`);
  }

  async function anmelden(e: FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setFehler(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setLaeuft(false);
    if (error) {
      setFehler(/expired|invalid/i.test(error.message) ? 'Der Code stimmt nicht oder ist abgelaufen.' : fehlertext(error));
    }
  }

  return (
    <main className="al-anmeldung">
      <h1 ref={ueberschrift} tabIndex={-1}>
        Anleiter-Bereich
      </h1>
      <p className="al-leise">Arbeitsplatz-Begleiter · Anmelden ohne Passwort</p>
      {schritt === 'email' ? (
        <form onSubmit={codeAnfordern} className="al-formular">
          <label className="al-feld">
            <span>Deine E-Mail-Adresse</span>
            <input
              type="email"
              name="email"
              id="anmeldung-email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" className="al-knopf al-knopf--haupt" disabled={laeuft}>
            Code per E-Mail schicken
          </button>
        </form>
      ) : (
        <form onSubmit={anmelden} className="al-formular">
          <p>Gib den Code aus der E-Mail ein. Oder tippe in der E-Mail auf den Link.</p>
          <label className="al-feld">
            <span>Code aus der E-Mail</span>
            <input
              ref={codeFeld}
              id="anmeldung-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <div className="al-knopfreihe">
            <button type="submit" className="al-knopf al-knopf--haupt" disabled={laeuft}>
              Anmelden
            </button>
            <button type="button" className="al-knopf" onClick={() => codeAnfordern()} disabled={laeuft}>
              Neuen Code schicken
            </button>
            <button type="button" className="al-knopf al-knopf--leise" onClick={() => setSchritt('email')}>
              Andere E-Mail-Adresse
            </button>
          </div>
        </form>
      )}
      <Meldungen fehler={fehler} erfolg={erfolg} />
      <p className="al-leise">
        Nur eingeladene Personen bekommen Zugang. Mitarbeitende am Tablet brauchen kein Konto.
      </p>
    </main>
  );
}
