export function initMobileHomeFinder(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-mobile-service-track]');
  const cards = [...(track?.querySelectorAll<HTMLElement>('[data-mobile-service-card]') ?? [])];
  const previous = root.querySelector<HTMLButtonElement>('[data-mobile-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-mobile-next]');
  const status = root.querySelector<HTMLElement>('[data-mobile-status]');
  if (!track || !cards.length || !previous || !next || !status) return;

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

  function moveTo(index: number): void {
    const target = Math.max(0, Math.min(index, cards.length - 1));
    showPosition(target);
    track!.scrollTo({
      left: cards[target].offsetLeft - cards[0].offsetLeft,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  previous.hidden = false;
  next.hidden = false;
  showPosition(0);
  previous.addEventListener('click', () => moveTo(active - 1));
  next.addEventListener('click', () => moveTo(active + 1));
  track.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      showPosition(nearestCard());
    });
  });
}
