import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initMobileCardRail, initMobileCardRails } from '../src/scripts/mobile-card-rail.ts';

function fixture(reducedMotion = false, count = 3, hash = '') {
  const listeners = {};
  const scrolls = [];
  const frames = [];
  let nextFrameId = 1;
  const cards = Array.from({ length: count }, (_, index) => ({ offsetLeft: index * 200, id: index === 1 ? 'format-trial' : `card-${index}` }));
  const track = {
    scrollLeft: 0,
    querySelectorAll: () => cards,
    addEventListener: (name, listener) => { listeners[name] = listener; },
    contains: element => element === track,
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
  const status = { textContent: `${count} Angebote · wischen` };
  const nodes = {
    '[data-mobile-rail-track]': track,
    '[data-mobile-rail-prev]': prev,
    '[data-mobile-rail-next]': next,
    '[data-mobile-rail-status]': status,
  };
  const root = { querySelector: selector => nodes[selector] };
  globalThis.window = { matchMedia: () => ({ matches: reducedMotion }), location: { hash }, addEventListener: (name, listener) => { listeners[`window:${name}`] = listener; } };
  globalThis.document = { activeElement: null, getElementById: id => cards.find(card => card.id === id) };
  globalThis.requestAnimationFrame = callback => { frames.push(callback); return nextFrameId++; };
  initMobileCardRail(root);
  const flushFrames = () => { while (frames.length) frames.shift()(); };
  return { root, track, prev, next, status, scrolls, listeners, flushFrames };
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

test('empty and single-card rails keep progressive controls hidden', () => {
  for (const count of [0, 1]) {
    const { prev, next, status } = fixture(false, count);
    assert.equal(prev.hidden, true);
    assert.equal(next.hidden, true);
    assert.equal(status.textContent, `${count} Angebote · wischen`);
  }
});

test('arrow keys move cards only when the rail is focused', () => {
  const { track, status, listeners } = fixture();
  let prevented = 0;
  const event = key => ({ key, preventDefault: () => { prevented++; } });
  listeners.keydown(event('ArrowRight'));
  assert.equal(status.textContent, '1 von 3');
  document.activeElement = track;
  listeners.keydown(event('ArrowRight'));
  assert.equal(status.textContent, '2 von 3');
  listeners.keydown(event('ArrowLeft'));
  assert.equal(status.textContent, '1 von 3');
  assert.equal(prevented, 2);
});

test('direct format hash positions its card without activating a link', () => {
  const { status, scrolls } = fixture(false, 3, '#format-trial');
  assert.equal(status.textContent, '2 von 3');
  assert.equal(scrolls.at(-1).left, 200);
});

test('malformed URL hashes do not prevent rail controls from initializing', () => {
  assert.doesNotThrow(() => {
    const { prev, next, status } = fixture(false, 3, '#%');
    assert.equal(prev.hidden, false);
    assert.equal(next.hidden, false);
    assert.equal(status.textContent, '1 von 3');
  });
});

test('all marked rails initialize independently', () => {
  const roots = [{ querySelector: () => null }, { querySelector: () => null }];
  const scope = { querySelectorAll: selector => selector === '[data-mobile-rail]' ? roots : [] };
  // Passing an explicit scope must be safe even if a malformed root lacks a track.
  assert.doesNotThrow(() => initMobileCardRails(scope));
});
