# Sitewide Mobile Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public main-site page mobile-first in its opening flow, with images close to headings and native swipe selection for suitable peer cards.

**Architecture:** Keep one Astro site and its desktop presentation. A small shared, progressively enhanced rail controller replaces the homepage-only controller and is reused by service and editorial card groups. Shared hero components change mobile DOM/CSS order; exceptional demo and personal pages receive targeted adjustments. A route matrix and browser checks cover pages that do not need new markup.

**Tech Stack:** Astro 5, TypeScript, CSS, Python `unittest` over built HTML, Node `node:test`, existing Codex browser viewport checks. No new product dependency.

**Spec:** `docs/superpowers/specs/2026-09-29-mobile-sitewide-design.md`

## Global Constraints

- Scope: all visitor-facing public Astro pages, including blog, FAQ, contact, legal, thank-you, demo and 404; exclude `/entwuerfe/`, redirect-only `/consulting/`, `/prompt-studio/`, protected customer areas, course platform and handbook.
- Preserve desktop design, brand palette, actual terms/prices/funding statements, working links/anchors, form target and access controls.
- Use existing relevant images. No decorative image is required on legal or functional text pages.
- A rail requires at least two peer choices. No autoplay, gesture-triggered navigation or blocked vertical scrolling; all links must work without JavaScript.
- No GitHub Pages workflow. Do not push or publish at IONOS as part of this plan; IONOS needs fresh explicit approval.
- Start in the existing clean `C:/NextCourse Website -Projekte/mobile-erlebnis` worktree after checking its Git baseline. Before handoff run `npm run build`, `node --test tests/*.test.mjs`, `python -m unittest discover -s tests`, and `python scripts/check-built-site.py dist`.

## Review Focus

1. A direct `#format-*` link on a service page must expose the correct horizontally positioned card, not leave it clipped in the rail (Task 3 test and browser check).
2. With JavaScript disabled, every mobile card and destination remains available while enhancement buttons stay hidden (Tasks 1, 3 and 5 tests).
3. A long blog title at 320 px must wrap without pushing its cover behind an unrelated text/action block or causing horizontal overflow (Task 4 test and browser check).
4. Price, trial duration, AZAV status and funding qualifications must remain visible and unchanged when card layout changes (Tasks 3 and 5 built-HTML tests).
5. A horizontal swipe must not trigger a card link or prevent vertical page scrolling; first/last buttons, focus and reduced motion remain correct (Task 1 unit tests and Task 6 browser checks).

---

## Card-group decisions for the route audit

| Mobile rail | Keep vertical |
| --- | --- |
| Home's three area cards; Management/Academy/Operation offer cards; Operation's three collaboration formats | Home collaboration steps; service process line on desktop only; detail-page process steps and benefit rows |
| Blog-index article cards; Flying Academy's two topic cards; Operation's package choices | Blog article body and contents; About values; funding explanations with eligibility conditions |
| FAQ's three related destinations; 404's three recovery destinations | FAQ answers, form fields, legal text, demo takeaways and report reader |

Every other card-like group found in the built route audit must be classified by the same peer-choice rule and noted in the review report before changing it.

### Task 1: Shared progressive mobile rail

**Files:**
- Create: `src/scripts/mobile-card-rail.ts`
- Create: `src/components/MobileRailControls.astro`
- Create: `src/styles/mobile-card-rail.css`
- Delete after migration: `src/scripts/mobile-home-finder.ts`
- Modify: `src/components/HomeServices.astro`, `src/layouts/Base.astro`
- Replace/extend: `tests/mobile-home-finder.test.mjs`, `tests/test_mobile_website.py`

**Interfaces:** A root with `data-mobile-rail` contains one `[data-mobile-rail-track]` and its `[data-mobile-rail-card]` children; `MobileRailControls.astro` accepts `count: number` and `noun: string` and emits `[data-mobile-rail-status]`, `[data-mobile-rail-prev]` and `[data-mobile-rail-next]` with hidden buttons until initialized. Export `initMobileCardRail(root: HTMLElement): void` and `initMobileCardRails(scope: ParentNode = document): void`. The controller changes scroll position and status only, never link activation.

- [ ] **Step 1: Write failing controller tests.** In `tests/mobile-home-finder.test.mjs`, exercise 0/1/3-card fixtures: three cards report `1 von 3` → `2 von 3` → `3 von 3`, bound buttons disable correctly, two successive simulated swipes update both directions, a one-card group has no active controls, reduced motion uses `behavior: 'auto'`, and ArrowLeft/ArrowRight work only while the track has focus. Keep the existing home behavior assertions.
- [ ] **Step 2: Run `node --test tests/mobile-home-finder.test.mjs`; expect failure on the missing generic export/selectors.**
- [ ] **Step 3: Implement the generic controller, controls component and shared CSS.** Use native `overflow-x:auto`, `scroll-snap-type:x mandatory`, roughly 80–85% card width, visible next-card edge, 44 px controls, a focus outline inside clipped cards, and passive scroll observation. Hide controls when there is fewer than two cards. Import the CSS once in `Base.astro` and initialize only marked roots.
- [ ] **Step 4: Migrate `HomeServices.astro` to the generic data attributes and controls without changing desktop tabs or the three destinations.** In `tests/test_mobile_website.py`, assert the built home HTML still has `/management/`, `/akademie/`, `/operation/` in order and the no-JS buttons carry `hidden`.
- [ ] **Step 5: Run `npm run build`, both focused test files and `python scripts/check-built-site.py dist`; expect zero failures. Review diff and commit only Task 1 files with `feat: share mobile card rail`.**

### Task 2: Quiet mobile homepage opening

**Files:**
- Modify: `src/components/HomeContent.astro`, `src/styles/home.css`
- Test: `tests/test_mobile_website.py`

**Interfaces:** The desktop hero keeps its existing copy and links. The mobile hero retains the promise `Mehr Zeit für das, was zählt.`, uses the benefit line `Abläufe ordnen. Team stärken. Arbeit abgeben.` and the primary `#leistungen` action in the first screen, then exposes the contact and portrait paths below. Existing logo click animation and reduced-motion handling remain.

- [ ] **Step 1: Add a failing built-HTML test** that finds `data-mobile-hero-summary` with exact text `Abläufe ordnen. Team stärken. Arbeit abgeben.`, verifies `#leistungen`, `/kontakt/` and `/ueber/` links remain, and confirms the desktop lead `Wir ordnen Abläufe, schulen Ihr Team und übernehmen laufende Aufgaben.` is still present.
- [ ] **Step 2: Run the focused Python test after a build; expect failure because the mobile hero summary/layout marker does not exist.**
- [ ] **Step 3: Add the mobile short copy and reorder/space the existing elements with a `max-width:599px` rule.** Keep the logo recognizable but smaller, remove the 100svh mobile minimum, and place secondary paths below the primary opening. Do not hide the contact or portrait link from keyboard users.
- [ ] **Step 4: Rebuild and rerun the focused test; inspect at 320, 390 and desktop widths.** At 390 × 844, one benefit line and primary action fit the first screen, and the offers begin by the first vertical scroll. Commit Task 2 files with `feat: simplify mobile homepage opening`.

### Task 3: Image-first service overviews and swipe offers

**Files:**
- Modify: `src/components/ServiceHero.astro`, `src/components/ServiceJourney.astro`, `src/components/ServiceJourneyCard.astro`, `src/components/OperationFormats.astro`, `src/styles/service-pages.css`
- Test: `tests/test_mobile_website.py`, `tests/mobile-home-finder.test.mjs`

**Interfaces:** For `/management/`, `/akademie/`, `/operation/`, mobile DOM order is kicker + `h1`, then existing hero image, then short lead/actions; desktop remains two-column. The `ServiceJourney` offer cards and `OperationFormats` choice cards use Task 1 rail attributes and controls. `#format-*` IDs and aliases still resolve to the correct card, and card links keep their current destinations.

- [ ] **Step 1: Add failing built-HTML tests** for hero order (`h1` before image before `data-mobile-hero`), offer counts 4/2/3, direct destinations matching desktop, status and conditions (`Preis auf Anfrage`, no automatic renewal, AZAV in preparation), and preserved `format-*` anchors.
- [ ] **Step 2: Add a failing controller test** for opening a page with `location.hash='#format-...'`: the matching card is selected/scrolled without activating its link.
- [ ] **Step 3: Run focused Node/Python tests; expect failures on ordering, rail markers and hash handling.**
- [ ] **Step 4: Split hero intro/details around its visual in the source, retaining desktop grid placement. Convert the existing mobile service cards and Operation formats to horizontal rails; desktop deck/scroll-line stays unchanged.** Use Task 1 controls and hash alignment for direct links and back navigation.
- [ ] **Step 5: Rebuild, run focused tests and built-site check. Inspect 320/390/768/1366 px and direct `#format-*` navigation.** At 390 × 844 the title image starts in the first screen. Commit Task 3 files with `feat: lead service pages with imagery and swipe offers`.

### Task 4: Image-first detail, article and demo openings

**Files:**
- Modify: `src/layouts/DetailLayout.astro`, `src/styles/detail-pages.css`, `src/pages/ueber.astro`, `src/pages/kontakt.astro`, `src/pages/blog/[...id].astro`, `src/pages/digital-audit-demo.astro`, `src/pages/mystery-check-demo.astro`, `src/styles/mystery-demo.css`
- Test: `tests/test_mobile_website.py`

**Interfaces:** Where `DetailLayout` receives `image`, mobile order is `h1` → figure → lead/actions/facts; without an image, `h1` → primary text/action/content. Use the existing Philip image near the About and Contact entrances without duplicating interactive profile functionality. The two custom demo pages place their existing report cover directly after the heading; their report readers and download links do not change.

- [ ] **Step 1: Add failing built-HTML tests** for `/akademie/ki-grundlagen/`, `/blog/fachkraeftemangel-ki-entlastung/`, About, Contact, Impressum, both demos and 404: images appear after headings when meaningful, while text-only pages have no forced placeholder. Assert `/kontakt/?thema=...` offer links, the `formsubmit.co` form action and both `/demo/.../*.pdf` paths remain.
- [ ] **Step 2: Run focused Python tests after build; expect failures on current copy-before-image order and late About/Contact imagery.**
- [ ] **Step 3: Refactor shared detail hero markup/CSS for mobile order while keeping desktop grid. Place About's existing portrait in the entry and avoid a second decorative portrait; add Contact's small portrait/identity near the top but keep form access immediate. Reorder the two custom demo covers with CSS/markup only; preserve reader JS.**
- [ ] **Step 4: Rebuild, run focused tests and built-site check. Inspect a short title, the longest article title at 320 px, About, Contact, legal, both demos and desktop.** Verify no horizontal overflow and no accidental form submission. Commit Task 4 files with `feat: bring page imagery next to mobile headings`.

### Task 5: Peer-card rails on remaining public routes

**Files:**
- Modify: `src/pages/blog/index.astro`, `src/pages/akademie/flying-academy.astro`, `src/pages/operation/monatspakete.astro`, `src/pages/faq.astro`, `src/pages/404.astro`, `src/styles/detail-pages.css`
- Test: `tests/test_mobile_website.py`

**Interfaces:** Add Task 1 rail markers/controls only to the peer-choice groups in the card-group decision table. Keep funding explanations, About values, process steps, FAQ answers, form fields and report-reader content vertical. Article/package prices and conditions remain fully readable within their cards, not abbreviated away.

- [ ] **Step 1: Add failing built-HTML tests** for the 3 current blog articles, 2 Flying Academy topics, 3 Operation packages, 3 FAQ destinations and 3 recovery destinations: every card has its original href, each rail has hidden no-JS controls, and `ab 890 €`, `ab 1.490 €`, `ab 2.690 €` plus the setup-fee wording remain in the HTML. Assert funding and FAQ answer groups lack rail markers.
- [ ] **Step 2: Run focused Python tests after build; expect missing rail markers/controls.**
- [ ] **Step 3: Add the mobile rails and controls, retaining each page's desktop grid.** Where a card contains a nested link, keep the card itself an article rather than a wrapping anchor; no invalid nested interactive elements. Use the common 80–85% width and visible next edge.
- [ ] **Step 4: Rebuild and rerun focused tests and built-site check. Inspect first/middle/last cards, package comparisons, FAQ and 404 at 320/390/1366 px.** Commit Task 5 files with `feat: swipe peer choices across public pages`.

### Task 6: Whole-site mobile audit and handoff

**Files:**
- Create: `reviews/2026-09-29-mobile-sitewide/REVIEW.md`
- Modify only if a concrete audit failure is found: responsible source/test file from Tasks 1–5

**Interfaces:** Review report lists every visitor-facing generated route, width checked, hero/first-content result, card-group decision, issues/fixes and any device-level limitations. It distinguishes historical drafts/redirects and protected apps from the approved scope.

- [ ] **Step 1: Run baseline release commands** `npm run build`, `node --test tests/*.test.mjs`, `python -m unittest discover -s tests`, `python scripts/check-built-site.py dist`; record exact counts/results.
- [ ] **Step 2: Inspect all generated public Astro routes at 320, 375, 390, 430, 768 and 1366 CSS px.** Check first-screen hierarchy, actual image load, document overflow, clipping, focus, menu/footer, and no dead-end links. Add a failing regression test before fixing any discovered source bug, then rerun its focused check.
- [ ] **Step 3: Exercise one instance of every rail class** by swipe/drag, arrows and keyboard, including vertical scroll over the rail and direct anchored service links. Test reduced motion and no-JS fallback if the browser supports them; otherwise document the narrower static/unit verification honestly. Do not send a real contact form.
- [ ] **Step 4: Complete `REVIEW.md`** with route matrix, screenshots or observations, open physical iOS/Android device check, and explicit statement that no IONOS publication occurred.
- [ ] **Step 5: Re-run the four release commands after the last fix, inspect `git diff` and `git status`, and commit the review plus any final tested corrections.** Present the local preview to the user and request separate permission before any GitHub push or IONOS deployment.
