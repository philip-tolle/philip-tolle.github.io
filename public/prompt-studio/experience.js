(() => {
  'use strict';

  const MAIN_SITE_URL = 'https://www.next-course.de/';
  const HUB_URL = './kunden/';

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.6 8.5-7 8.5 7"></path><path d="M5.8 9.2v10.3h12.4V9.2M9.5 19.5v-6h5v6"></path></svg>',
    hub: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 10V7.6a4.5 4.5 0 0 1 9 0V10"></path><rect x="4.5" y="10" width="15" height="10.5" rx="2.2"></rect><path d="M12 14v2.8"></path></svg>',
    library: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v16H7A2.5 2.5 0 0 0 4.5 21.5z"></path><path d="M4.5 5.5v16M8.5 7h7"></path></svg>',
    prompt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v12H9l-4 3z"></path><path d="M8.5 8.5h7M8.5 12.5h4.5"></path></svg>',
    skill: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.2"></circle><circle cx="18" cy="6" r="2.2"></circle><circle cx="12" cy="18" r="2.2"></circle><path d="m8 7 3 8.7M16 7l-3 8.7M8.2 6h7.6"></path></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 19 6v5.3c0 4.1-2.6 7.7-7 9.2-4.4-1.5-7-5.1-7-9.2V6z"></path><path d="m9 12 2 2 4-4"></path></svg>',
  };

  const routeMarkup = ({ href, action, modifier, icon, eyebrow, title, copy }) => {
    const tag = href ? 'a' : 'button';
    const destination = href ? ` href="${href}"` : ` type="button" data-ps-action="${action}"`;

    return `
      <${tag} class="ps-route ps-route--${modifier}"${destination}>
        <span class="ps-route__icon">${icons[icon]}</span>
        <span class="ps-route__copy">
          <small>${eyebrow}</small>
          <strong>${title}</strong>
          <span>${copy}</span>
        </span>
        <span class="ps-route__arrow">${icons.arrow}</span>
      </${tag}>
    `;
  };

  const addTopLinks = () => {
    const topbar = document.querySelector('.topbar');
    const actions = topbar?.querySelector('.topbar-actions');
    if (!topbar || !actions || topbar.querySelector('[data-ps-top-links]')) return;

    const nav = document.createElement('nav');
    nav.className = 'ps-top-links';
    nav.dataset.psTopLinks = '';
    nav.setAttribute('aria-label', 'NextCourse Bereiche');
    nav.innerHTML = `
      <a class="ps-top-link ps-top-link--site" href="${MAIN_SITE_URL}" aria-label="Zur NextCourse Website">
        ${icons.home}
        <span class="ps-top-link__text">Zur Website</span>
      </a>
      <a class="ps-top-link ps-top-link--hub" href="${HUB_URL}" aria-label="Praxis-Hub öffnen">
        ${icons.hub}
        <span class="ps-top-link__text">Praxis-Hub</span>
      </a>
    `;
    topbar.insertBefore(nav, actions);
  };

  const addSidebarLinks = () => {
    const sidebar = document.querySelector('.sidebar');
    const spacer = sidebar?.querySelector('.sidebar-spacer');
    if (!sidebar || !spacer || sidebar.querySelector('[data-ps-sidebar-links]')) return;

    sidebar.classList.add('ps-sidebar-enhanced');

    const more = document.createElement('div');
    more.className = 'ps-sidebar-more';
    more.dataset.psSidebarLinks = '';
    more.innerHTML = `
      <div class="sidebar-section-label">Mehr entdecken</div>
      <nav class="ps-sidebar-nav" aria-label="Weitere NextCourse Angebote">
        <a href="${HUB_URL}">
          <span class="ps-sidebar-nav__icon">${icons.hub}</span>
          <span>Praxis-Hub</span>
        </a>
        <a href="${MAIN_SITE_URL}">
          <span class="ps-sidebar-nav__icon">${icons.home}</span>
          <span>Zur NextCourse Website</span>
          <span class="ps-sidebar-nav__arrow">${icons.arrow}</span>
        </a>
      </nav>
    `;
    sidebar.classList.add('ps-sidebar-enhanced');
    sidebar.insertBefore(more, spacer);
  };

  const openExistingAction = (selector) => {
    const existingAction = document.querySelector(selector);
    if (existingAction instanceof HTMLButtonElement) {
      existingAction.click();
      return;
    }

    const fallback = document.querySelector('.topbar-actions .primary-button');
    if (fallback instanceof HTMLButtonElement) fallback.click();
  };

  const addLaunchpad = () => {
    const dashboard = document.querySelector('.dashboard-page');
    const heading = dashboard?.querySelector('.dashboard-heading');
    const hero = dashboard?.querySelector('.dashboard-hero-row');
    if (!dashboard || !heading || !hero) return;

    const title = heading.querySelector('h1');
    const intro = heading.querySelector('h1 + p');
    if (title && title.textContent !== 'Was möchtest du heute schneller erledigen?') {
      title.textContent = 'Was möchtest du heute schneller erledigen?';
    }
    if (intro && intro.textContent !== 'Wähle deinen nächsten Schritt. Das Studio führt dich von der Aufgabe zu einem direkt nutzbaren Prompt.') {
      intro.textContent = 'Wähle deinen nächsten Schritt. Das Studio führt dich von der Aufgabe zu einem direkt nutzbaren Prompt.';
    }

    const libraryButton = heading.querySelector('.secondary-button');
    if (libraryButton && !libraryButton.dataset.psLibraryLabel) {
      const textNode = Array.from(libraryButton.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = 'Vorlagen öffnen ';
      libraryButton.dataset.psLibraryLabel = '';
    }

    if (!dashboard.querySelector('[data-ps-launchpad]')) {
      const launchpad = document.createElement('section');
      launchpad.className = 'ps-launchpad';
      launchpad.dataset.psLaunchpad = '';
      launchpad.setAttribute('aria-labelledby', 'ps-launchpad-title');
      launchpad.innerHTML = `
        <div class="ps-launchpad__intro">
          <span class="ps-launchpad__eyebrow">In 3 Minuten startklar</span>
          <h2 id="ps-launchpad-title">Wähle deinen schnellsten Weg.</h2>
          <p>Du brauchst kein Prompt-Wissen. Starte mit dem, was du heute erledigen möchtest.</p>
          <div class="ps-launchpad__trust">
            <span>${icons.shield} Lokal gespeichert</span>
            <span>Ohne Konto</span>
            <span>Jederzeit exportierbar</span>
          </div>
        </div>
        <div class="ps-launchpad__routes">
          ${routeMarkup({
            href: '#/library',
            modifier: 'primary',
            icon: 'library',
            eyebrow: 'Bewährter Einstieg',
            title: 'Mit einer Vorlage starten',
            copy: 'Vorlage auswählen, anpassen und direkt verwenden.',
          })}
          ${routeMarkup({
            action: 'prompt',
            modifier: 'prompt',
            icon: 'prompt',
            eyebrow: 'Einmalige Aufgabe',
            title: 'Eine Aufgabe erledigen',
            copy: 'E-Mail, Text oder Entscheidung als Prompt vorbereiten.',
          })}
          ${routeMarkup({
            action: 'skill',
            modifier: 'skill',
            icon: 'skill',
            eyebrow: 'Wiederkehrender Ablauf',
            title: 'Einen Ablauf vereinfachen',
            copy: 'Wiederkehrende Arbeit als Skill klar ordnen.',
          })}
          ${routeMarkup({
            href: HUB_URL,
            modifier: 'hub',
            icon: 'hub',
            eyebrow: 'Tipps, Tricks & Hacks',
            title: 'Praxis-Hub öffnen',
            copy: '15 kleine Abkürzungen für weniger Tippen, Suchen und Merken.',
          })}
        </div>
      `;

      launchpad.querySelector('[data-ps-action="prompt"]')?.addEventListener('click', () => {
        openExistingAction('.quick-action.prompt-action');
      });
      launchpad.querySelector('[data-ps-action="skill"]')?.addEventListener('click', () => {
        openExistingAction('.quick-action.skill-action');
      });

      hero.insertAdjacentElement('beforebegin', launchpad);
    }

    if (libraryButton instanceof HTMLElement) libraryButton.hidden = true;

    const toolsSection = dashboard.querySelector('.quick-actions-grid')?.closest('.dashboard-section');
    if (toolsSection && !toolsSection.dataset.psToolsCopy) {
      const sectionTitle = toolsSection.querySelector('.section-title-row h2');
      const sectionCopy = toolsSection.querySelector('.section-title-row p');
      if (sectionTitle) sectionTitle.textContent = 'Prompt oder Skill – was passt?';
      if (sectionCopy) sectionCopy.textContent = 'Prompt für eine Aufgabe, Skill für einen wiederkehrenden Ablauf.';
      toolsSection.dataset.psToolsCopy = '';
    }
  };

  let enhancementScheduled = false;
  const enhance = () => {
    enhancementScheduled = false;
    addTopLinks();
    addSidebarLinks();
    addLaunchpad();
  };

  const scheduleEnhancement = () => {
    if (enhancementScheduled) return;
    enhancementScheduled = true;
    window.requestAnimationFrame(enhance);
  };

  const root = document.getElementById('root');
  if (root) {
    new MutationObserver(scheduleEnhancement).observe(root, { childList: true, subtree: true });
  }

  window.addEventListener('hashchange', scheduleEnhancement);
  scheduleEnhancement();
})();
