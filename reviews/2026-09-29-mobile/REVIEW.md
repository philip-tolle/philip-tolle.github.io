# Mobile review — 29 September 2026

Scope: local Astro production build in the isolated `codex/mobile-erlebnis` worktree. No IONOS deployment, GitHub push, live form submission or protected-area login.

## Browser matrix

The Codex in-app Chromium browser was set to 320, 375, 390, 430, 768 and 1366 CSS pixels. Each width was checked on `/`, `/management/`, `/akademie/`, `/operation/`, `/kontakt/`, `/management/betriebshandbuch/`, `/akademie/ki-grundlagen/`, `/operation/karten-unterlagen/`, `/blog/`, `/faq/`, `/ueber/`, `/impressum/` and `/datenschutz/`: 78 route-width combinations in all. DOM measurements of document width and visible headings, paragraphs, links, buttons and images found no horizontal page overflow, clipped right-edge text/control or broken image. The scrollable homepage offer strip was excluded from the general off-screen check because its next card intentionally peeks into view.

At 320 px the first-screen homepage hero retains the region and direct contact path, while the orange primary action is visually dominant. A screenshot inspection of the 320 px Academy overview showed readable short card titles, status labels, summaries and links. At 390 px the home strip displays 3 mobile cards, and Management/Academy/Operation display 4/2/3 direct mobile cards. At 768 and 1366 px the mobile variants are hidden and the original desktop selection/deck remains.

## Interaction and accessibility

- Home strip: forward buttons updated `1 von 3` → `2 von 3` → `3 von 3`, disabled at the end, and the back button returned to `2 von 3`. A simulated horizontal drag moved from the second to third card without opening a link. Browser vertical scrolling over the section left the selected card unchanged. The track is keyboard-focusable; the mobile accessibility tree includes the three offer links and arrows, but not the hidden desktop tabs.
- Desktop home tabs: ArrowDown selected the second tab and showed only its corresponding result.
- Desktop Management deck: the Details control switched the first card to its description and moved focus to its heading. At phone width no desktop decks were visible. Tapping a mobile Academy card opened its offer detail page directly.
- Mobile navigation: menu opened with seven links and closed again. Contact page was viewed, but its form was **not submitted**.
- Without JavaScript: built HTML retains direct mobile offer links; next/previous controls carry `hidden` until the script initializes. This was checked statically, not by running the browser with JavaScript disabled.
- Reduced motion: the controller unit test verifies `auto` rather than `smooth` scrolling when the media query matches. A browser-level reduced-motion emulation was not available.

## Issue found and fixed

The first 320 px inspection showed the home offer grid's content track expanding its column to 493 px while the section was only 305 px wide. `minmax(0,1fr)` on the responsive grid and `min-width:0` on its intro brought the track back within the phone width. A focused regression test guards those CSS rules; the local browser confirmed a 265 px track after rebuilding.

The final independent code review found that keyboard focus on a mobile home card was clipped by its rounded container. An inset focus outline was added; all three mobile links were then reached in sequence with Tab and showed a solid focus indicator. The review also caught a desktop collaboration paragraph losing its centered/muted styling, an ambiguous mobile trial price phrase and a synchronous animation-frame test stub that could not check repeated swipes. Each was corrected with a red-to-green regression check. Desktop computed styles, the explicit mobile `Preis auf Anfrage` wording and successive swipe test were rechecked after rebuilding.

## Remaining real-device check

No physical phone was used. Before publishing, confirm natural finger swipe, vertical finger scroll, tap targets and visual spacing on at least one iOS and one Android device. The browser's simulated drag/scroll is useful evidence but does not substitute for real touch hardware.

## Handoff decisions

- Work was done on a manual Git worktree because the app-native worktree creator targeted the enclosing empty repository, not the nested website repository. The branch is `codex/mobile-erlebnis`; its checkout is `C:/NextCourse Website -Projekte/mobile-erlebnis`.
- The worktree's ignored `node_modules` junction reuses the canonical checkout's installed dependencies, avoiding a network install. Another agent should account for that coupling when updating dependencies.
- The first test package was added in this branch; the prior checkout had no Python test directory. A built-HTML suite plus a Node controller suite cover markup and behavior separately.
- Browser/interaction checks were consolidated at the end of the four implementation tasks. This caught and fixed the 320 px grid-width problem before handoff, but temporary intermediate commits had not been individually browser-verified.
- Headless Chrome automation crashed in the GPU process, so the app browser's viewport override was used for the 78 route-width checks. A true no-JavaScript browser run and reduced-motion browser emulation remain unverified; static HTML/CSS checks and a reduced-motion unit test are the fallback.
- The mobile 30-day price sentence differs slightly from the approved draft to state `Preis auf Anfrage` explicitly while preserving no automatic renewal. Full detail copy, general editorial pages, existing desktop flip decks, hosting, authentication and protected areas were intentionally left unchanged.
