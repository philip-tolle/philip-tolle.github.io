import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import '@fontsource/noto-sans-ethiopic/400.css';
import '@fontsource/noto-sans-ethiopic/700.css';
import './stile/app.css';
import { App } from './App';
import { sprachausgabe } from './vorlesen/sprachausgabe';

// iOS gibt die Stimme erst nach der ersten Berührung frei.
window.addEventListener('pointerdown', () => sprachausgabe.entsperren(), { once: true, capture: true });

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
