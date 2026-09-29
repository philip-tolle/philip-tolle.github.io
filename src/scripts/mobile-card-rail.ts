export function initMobileCardRail(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-mobile-rail-track]');
  const cards = [...(track?.querySelectorAll<HTMLElement>('[data-mobile-rail-card]') ?? [])];
  const previous = root.querySelector<HTMLButtonElement>('[data-mobile-rail-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-mobile-rail-next]');
  const status = root.querySelector<HTMLElement>('[data-mobile-rail-status]');
  if (!track || cards.length < 2 || !previous || !next || !status) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let scrollFrame = 0;

  function showPosition(index: number): void {
    active = Math.max(0, Math.min(index, cards.length - 1));
    status!.textContent = `${active + 1} von ${cards.length}`;
    previous!.disabled = active === 0;
    next!.disabled = active === cards.length - 1;
  }

  function nearestCard(): number {
    const left = track!.scrollLeft + cards[0].offsetLeft;
    return cards.reduce((nearest, card, index) =>
      Math.abs(card.offsetLeft - left) < Math.abs(cards[nearest].offsetLeft - left) ? index : nearest, 0);
  }

  function moveTo(index: number, immediate = false): void {
    const target = Math.max(0, Math.min(index, cards.length - 1));
    showPosition(target);
    track!.scrollTo({
      left: cards[target].offsetLeft - cards[0].offsetLeft,
      behavior: immediate || reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  function alignHash(): void {
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (!id) return;
    const index = cards.findIndex(card => card.id === id || card.querySelector?.(`#${CSS.escape(id)}`));
    if (index >= 0) moveTo(index, true);
  }

  previous.hidden = false;
  next.hidden = false;
  showPosition(0);
  previous.addEventListener('click', () => moveTo(active - 1));
  next.addEventListener('click', () => moveTo(active + 1));
  track.addEventListener('keydown', event => {
    if (document.activeElement !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    moveTo(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      showPosition(nearestCard());
    });
  }, { passive: true });
  alignHash();
  window.addEventListener('hashchange', alignHash);
}

export function initMobileCardRails(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('[data-mobile-rail]').forEach(initMobileCardRail);
}
