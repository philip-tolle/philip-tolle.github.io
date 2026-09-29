import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initMobileHomeFinder } from '../src/scripts/mobile-home-finder.ts';

function fixture(reducedMotion = false) {
  const listeners = {};
  const scrolls = [];
  const frames = [];
  let nextFrameId = 1;
  const cards = [0, 200, 400].map(offsetLeft => ({ offsetLeft }));
  const track = {
    scrollLeft: 0,
    querySelectorAll: () => cards,
    addEventListener: (name, listener) => { listeners[name] = listener; },
    scrollTo(options) {
      scrolls.push(options);
      this.scrollLeft = options.left;
      listeners.scroll?.();
    },
  };
  function button() {
    return {
      hidden: true,
      disabled: false,
      addEventListener(name, listener) { this[name] = listener; },
      click() { this.click?.(); },
    };
  }
  const prev = button();
  const next = button();
  const status = { textContent: '3 Angebote · wischen' };
  const nodes = {
    '[data-mobile-service-track]': track,
    '[data-mobile-prev]': prev,
    '[data-mobile-next]': next,
    '[data-mobile-status]': status,
  };
  const root = { querySelector: selector => nodes[selector] };
  globalThis.window = { matchMedia: () => ({ matches: reducedMotion }) };
  globalThis.requestAnimationFrame = callback => { frames.push(callback); return nextFrameId++; };
  initMobileHomeFinder(root);
  const flushFrames = () => { while (frames.length) frames.shift()(); };
  return { track, prev, next, status, scrolls, listeners, flushFrames };
}

test('buttons move between all three cards and update the position', () => {
  const { prev, next, status } = fixture();
  assert.equal(status.textContent, '1 von 3');
  assert.equal(prev.hidden, false);
  assert.equal(next.hidden, false);
  assert.equal(prev.disabled, true);
  next.click();
  assert.equal(status.textContent, '2 von 3');
  next.click();
  assert.equal(status.textContent, '3 von 3');
  assert.equal(next.disabled, true);
  prev.click();
  assert.equal(status.textContent, '2 von 3');
});

test('a swipe updates the nearest card and reduced motion avoids animation', () => {
  const { track, next, status, scrolls, listeners, flushFrames } = fixture(true);
  track.scrollLeft = 385;
  listeners.scroll();
  flushFrames();
  assert.equal(status.textContent, '3 von 3');
  assert.equal(next.disabled, true);
  track.scrollLeft = 0;
  listeners.scroll();
  flushFrames();
  next.click();
  assert.equal(scrolls[0].behavior, 'auto');
});

test('successive swipes update the status in both directions', () => {
  const { track, status, listeners, flushFrames } = fixture();
  track.scrollLeft = 385;
  listeners.scroll();
  flushFrames();
  assert.equal(status.textContent, '3 von 3');
  track.scrollLeft = 0;
  listeners.scroll();
  flushFrames();
  assert.equal(status.textContent, '1 von 3');
});
