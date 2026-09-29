# Mobile Website Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing NextCourse website shorter, clearer and naturally swipeable on smartphones while preserving the desktop experience and full offer details.

**Architecture:** Keep one Astro website and its existing page structure. Render a mobile-only native scroll-snap offer strip beside the existing desktop tab interface, then give the three service overviews concise mobile copy and directly readable mobile cards. Use the current shared components and content model; do not introduce a new runtime dependency.

**Tech Stack:** Astro 5, TypeScript, CSS, Python standard-library `unittest`/`html.parser`, existing Astro build and `scripts/check-built-site.py`.

**Spec:** `docs/superpowers/specs/2026-09-29-mobile-erlebnis-design.md`

## Global Constraints

- Preserve the round logo, waves, images and existing NextCourse colors; preserve desktop interactions and full offer-detail content.
- Mobile overview copy: hero at most two short sentences, section intro at most one sentence, card at most one benefit sentence without a list.
- No change to hosting, IONOS, GitHub Pages, form target, protected areas or private data. No new product dependency or automatic deployment.
- All three offers stay reachable without JavaScript. Swipe supplements visible controls; reduced-motion users get no forced animation.
- Verify 320, 375, 390 and 430 CSS-pixel phone widths plus tablet and desktop; never submit the real contact form during tests.
- Use the repository's bundled Node/Python runtimes when `npm` or `python` is absent from `PATH`.

## Review Focus

1. A mostly vertical finger gesture over the home strip scrolls the page rather than trapping it (Task 1 touch test).
2. A quick or partial horizontal swipe settles on one card and updates the displayed position without opening its link (Task 1 touch test).
3. With JavaScript disabled, all offer links remain accessible and inactive controls do not mislead visitors (Tasks 1 and 3 no-JS tests).
4. Hidden desktop/mobile variants do not create duplicate keyboard stops or duplicate IDs; desktop arrow-key tabs still work (Tasks 1 and 3 accessibility tests).
5. Long German labels, status/price conditions and the contact path remain legible at 320 px without horizontal page overflow (Task 4 viewport and content checks).

## File Map

- `src/data/home-services.ts` — one typed source for the three homepage offers, including mobile summaries and existing illustrations.
- `src/components/HomeServices.astro`, `src/scripts/mobile-home-finder.ts`, `src/styles/home.css` — desktop tabs, mobile scroll-snap cards and their position controls.
- `src/components/HomeContent.astro`, `src/components/HandbookGateway.astro`, `src/styles/marketing.css` — shorter mobile-only home copy and shared copy-visibility classes; desktop copy stays as-is.
- `src/data/service-pages.ts`, `src/components/ServicePage.astro`, `ServiceHero.astro`, `ServiceJourney.astro`, `ServiceJourneyCard.astro`, `src/styles/service-pages.css` — short mobile area introductions and directly readable cards; desktop deck remains.
- `src/components/AcademyFormat.astro`, `src/components/OperationFormats.astro` — concise mobile supplemental sections without lost conditions.
- `tests/test_mobile_website.py` — built-HTML regression tests; `reviews/2026-09-29-mobile/REVIEW.md` — manual viewport and interaction evidence.

---

### Task 1: Homepage offer strip and navigation

**Files:** Create `src/data/home-services.ts`, `src/scripts/mobile-home-finder.ts`, `tests/__init__.py`, `tests/test_mobile_website.py`; modify `src/components/HomeServices.astro:1-119`, `src/styles/home.css:81-168`.

**Interfaces:** Export `situations: readonly HomeSituation[]` from `home-services.ts`, where each item has `id`, `short`, `guide`, `situation`, `mobileSummary`, `heading`, `emphasis`, `description`, `action`, `area`, `href`, `image`, `imageAlt`. Export `initMobileHomeFinder(root: HTMLElement): void`; the component uses `data-mobile-finder`, `data-mobile-service-track`, `data-mobile-service-card`, `data-mobile-prev`, `data-mobile-next`, `data-mobile-status`.

- [ ] **Step 1: Write failing built-HTML test** `MobileHomeTests.test_three_linked_cards_and_controls`: parse `dist/index.html` with `html.parser`; assert exactly three `data-mobile-service-card` elements, their link targets in order are `/management/`, `/akademie/`, `/operation/`, and prev/next/status elements exist. Assert all IDs on the page are unique.
- [ ] **Step 2: Run the red test.** Run `npm run build` on the unchanged site, then `python -m unittest tests.test_mobile_website.MobileHomeTests.test_three_linked_cards_and_controls -v`; expect failure because mobile cards are absent.
- [ ] **Step 3: Extract the data.** Move current offer data and images to `home-services.ts` and set mobile summaries in order to `Betriebswissen und Abläufe für Ihr Team klar und nutzbar machen.`, `Praxisnahe Schulungen zu KI und digitaler Zusammenarbeit.`, `Karten, Gästeinhalte und Aktionen im Alltag abgeben.` Keep existing desktop fields and content.
- [ ] **Step 4: Render and style the strip.** Add mobile cards from the same data, with native horizontal overflow and `scroll-snap-type: x mandatory` at `max-width: 599px`; a following card must peek into view. CSS `display:none` removes the inactive variant from layout and accessibility tree. Give cards unique IDs and direct links. Without JS, label the strip `3 Angebote · wischen` and hide prev/next buttons.
- [ ] **Step 5: Wire the controls.** `initMobileHomeFinder` finds the nearest card on scroll, updates status to `n von 3` and disabled button state, and scrolls to a card on button click. Honor `prefers-reduced-motion`; preserve existing desktop tab behavior.
- [ ] **Step 6: Run green and interaction checks.** Run `npm run build`, the targeted unittest from Step 2 and `python scripts/check-built-site.py dist`; expect all pass. In a browser, test swipe, partial swipe, vertical drag, tap, buttons, keyboard focus, desktop arrow-key tabs, no-JS fallback and reduced motion; expect all three links reachable, accurate counter, no accidental navigation or duplicate focus stops.
- [ ] **Step 7: Commit only Task 1 files.** Message: `feat: mobile Angebotsauswahl wischbar machen`.

### Task 2: Shorter home overview copy

**Files:** Modify `src/components/HomeContent.astro:20-55`, `src/components/HandbookGateway.astro:31-67`, `src/styles/home.css`, `src/styles/marketing.css`; extend `tests/test_mobile_website.py`.

**Interfaces:** Mobile-only copy uses `.mobile-overview-copy` and `data-mobile-copy`; desktop counterparts use `.desktop-overview-copy`. Define both display rules in `marketing.css`; the two variants are mutually exclusive at `max-width: 599px`, without duplicate IDs or links.

- [ ] **Step 1: Write failing test** `MobileHomeTests.test_concise_home_copy`: built HTML must contain mobile copy markers for handbook and collaboration; each marked copy block has no more than two sentences, the existing concise hero lead remains, and the demo-request link still targets `/kontakt/?thema=betriebshandbuch&angebot=Demo-Zugang#contactform`.
- [ ] **Step 2: Run `npm run build` and `python -m unittest tests.test_mobile_website.MobileHomeTests.test_concise_home_copy -v`; expect missing mobile copy markers.**
- [ ] **Step 3: Add mobile copy variants.** Keep the short hero benefit and region. Use mobile handbook copy `Hauswissen an einem Ort – für Standards, Einarbeitung und Übergaben.` and `Die geschützte Demo zeigt das am fiktiven Hotel Residenzhof; fragen Sie Ihren Zugang an.` Use collaboration intro `Wir klären Ihr Anliegen, vereinbaren den Umfang und begleiten die Umsetzung.` Set mobile collaboration steps to `Wir hören zu und ordnen Ihr Anliegen.`, `Leistung, Preis und nächste Schritte stehen vorab fest.`, `Wir setzen um und stimmen uns persönlich mit Ihnen ab.` Preserve desktop text and links.
- [ ] **Step 4: Apply responsive copy visibility.** Add `.mobile-overview-copy` and `.desktop-overview-copy` rules in `marketing.css` at 599 px, and reduce secondary hero text prominence in `home.css` without hiding region or contact access.
- [ ] **Step 5: Run `npm run build`, the targeted unittest from Step 2 and `python scripts/check-built-site.py dist`; visually compare 320/390 px and desktop.** Expect all checks pass, one clear primary CTA in the first phone screen, readable demo status and no duplicate visible copy.
- [ ] **Step 6: Commit only Task 2 files.** Message: `content: mobile Startseite verdichten`.

### Task 3: Readable service overview cards

**Files:** Modify `src/data/service-pages.ts:24-158`, `src/components/ServicePage.astro:1-24`, `src/components/ServiceHero.astro:5-81`, `src/components/ServiceJourney.astro:11-29`, `src/components/ServiceJourneyCard.astro:10-47`, `src/styles/service-pages.css:42-160`; extend `tests/test_mobile_website.py`.

**Interfaces:** Add required `mobileSummary: string` to `JourneyStep`, `mobileDescription: string` to each `hero`, and `mobileIntro: string` to each `journey`. Pass `mobileDescription` through `ServicePage` to `ServiceHero`. Mark rendered short texts with `data-mobile-hero` and `data-mobile-journey-intro`; the mobile card has `data-mobile-service-summary` and one direct offer link. The desktop deck keeps its current interface.

- [ ] **Step 1: Write failing test** `MobileServiceTests.test_mobile_summaries_and_destinations`: built Management/Academy/Operation pages expose respectively 4/2/3 mobile summary cards, each with one nonempty benefit sentence and the same destination as its existing desktop offer. Check each page contains mobile hero and journey copy markers; all IDs unique.
- [ ] **Step 2: Run `npm run build` and `python -m unittest tests.test_mobile_website.MobileServiceTests.test_mobile_summaries_and_destinations -v`; expect missing mobile summary cards.**
- [ ] **Step 3: Add the nine summaries in `service-pages.ts`.** Management (Handbuch/Mystery/Audit/Umsetzung): `Hausstandards und Anleitungen an einem gemeinsamen Ort.`, `Ihr Haus aus Gästesicht betrachten und nächste Schritte erkennen.`, `Doppelte Arbeit erkennen und digitale Abläufe gezielt verbessern.`, `Neue Abläufe mit Ihrem Team einführen und erproben.` Academy (KI/Zusammenarbeit): `KI an typischen Aufgaben aus Ihrem Betrieb sicher ausprobieren.`, `Digitale Veränderungen verständlich besprechen und gemeinsam umsetzen.` Operation (Unterlagen/Kommunikation/Aktionen): `Karten und Gästematerialien aktuell und passend zu Ihrem Haus halten.`, `Gästeinhalte für Ihr Haus planen, texten und gestalten.`, `Saisonaktionen und Veranstaltungen verlässlich organisieren lassen.` Retain current status and links.
- [ ] **Step 4: Add short introductions in `service-pages.ts` and render them.** Management hero/intro: `Wir machen Betriebswissen zugänglich, prüfen Abläufe und begleiten konkrete Verbesserungen.` / `Wählen Sie den Bereich, der Ihrem Betrieb gerade am meisten hilft.` Academy: `Praxisnahe Schulungen zu KI und digitaler Zusammenarbeit – auf Wunsch in Ihrem Haus.` / `Wählen Sie das Lernziel, das Ihr Team im Alltag braucht.` Operation: `Wir übernehmen Karten, Gästeinhalte und Aktionen – mit klar vereinbarten Aufgaben.` / `Wählen Sie die Aufgabe, die Sie abgeben möchten.` Preserve desktop copy.
- [ ] **Step 5: Render and style mobile cards.** Show image/title/summary/CTA while CSS hides desktop flip decks at `max-width: 599px`; do not copy long descriptions or points into mobile cards. Keep existing `format-*` anchors on enclosing articles.
- [ ] **Step 6: Run `npm run build`, the targeted unittest from Step 2 and `python scripts/check-built-site.py dist`; expect all pass.** In browser test 320/390 px, desktop deck click/swipe/keyboard, no-JS mobile links and desktop/mobile focus order; expect no mobile flip gesture or hidden duplicate focus stops.
- [ ] **Step 7: Commit only Task 3 files.** Message: `feat: mobile Leistungsuebersichten vereinfachen`.

### Task 4: Supplemental sections and end-to-end mobile review

**Files:** Modify `src/components/AcademyFormat.astro:4-42`, `src/components/OperationFormats.astro:5-28`; extend `tests/test_mobile_website.py`; create `reviews/2026-09-29-mobile/REVIEW.md`. Inspect `Header.astro`, `kontakt.astro`, offer-detail layouts and general pages; change them only for a demonstrated defect with a focused regression check.

**Interfaces:** Supplemental mobile copy uses `.mobile-overview-copy`/`.desktop-overview-copy` from Task 2. Existing anchors, hrefs, conditions and detail-page content are unchanged.

- [ ] **Step 1: Write failing test** `MobileServiceTests.test_supplemental_mobile_copy`: built Academy/Operation overviews have mobile-copy markers; Academy still states `AZAV-Zulassung ist noch in Vorbereitung`, and Operation still conveys fixed monthly scope, agreed fixed price and no automatic renewal of the 30-day test.
- [ ] **Step 2: Run `npm run build` and `python -m unittest tests.test_mobile_website.MobileServiceTests.test_supplemental_mobile_copy -v`; expect missing mobile-copy markers.**
- [ ] **Step 3: Shorten Academy mobile copy.** Use format intro `Wir schulen Ihr Team zu einem vereinbarten Lernziel direkt in Ihrem Haus.` Keep its concise three steps, Academy AZAV status, IDs and links; preserve desktop copy.
- [ ] **Step 4: Shorten Operation mobile copy.** Use format intro `Wir vereinbaren Aufgabe, Umfang und Termine vor dem Start.` Cards (month/single/30-day): `Laufende Kartenpflege und Social Media mit festen Leistungen, Abgabezeiten und Ansprechperson.`, `Ein Material oder eine Aktion mit Ergebnis, Termin und Festpreis vor dem Start.`, `Ein 30-Tage-Einstiegspaket auf Anfrage und ohne automatische Verlängerung.` Keep IDs, links, full desktop/detail copy and all unique conditions.
- [ ] **Step 5: Run `npm run build`, `python -m unittest tests.test_mobile_website -v` and `python scripts/check-built-site.py dist`; expect all pass.** Verify 320/375/390/430 px, tablet and desktop for `/`, all three area pages, `/kontakt/`, one offer detail per area, `/blog/`, `/faq/`, `/ueber/`, `/impressum/`, `/datenschutz/`. Record overflow, clipping, focus, menu, links, no-JS and reduced-motion findings in `REVIEW.md`; do not submit the form. If a defect appears, add a failing focused check and fix it in its owning component before claiming completion. State explicitly whether a physical-phone test occurred.
- [ ] **Step 6: Commit Task 4 changes and review evidence.** Message: `content: mobile Zusatzbereiche kuerzen und pruefen`.

## Final acceptance

Run the complete mobile unittest suite, production build, built-site checker and `git diff --check`; inspect `git status` and review the branch diff against the spec. No GitHub push or IONOS deployment is part of this plan without separate authorization and reachable remote access.
