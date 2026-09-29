"""Regression checks against Astro's rendered HTML."""

import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PageProbe(HTMLParser):
    def __init__(self, page: Path):
        super().__init__()
        self.ids = []
        self.markers = set()
        self.mobile_card_links = []
        self.in_mobile_card = False
        self.mobile_copy = {}
        self.current_mobile_copy = None
        self.links = []
        self.mobile_summaries = []
        self.in_mobile_summary = False
        self.mobile_service_links = []
        self.desktop_service_links = []
        self.mobile_controls_hidden = {}
        self.mobile_hero_summary = ""
        self.in_mobile_hero_summary = False
        self.tag_sequence = []
        self.service_rail_cards = 0
        self.rail_card_count = 0
        self.feed(page.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.tag_sequence.append((tag, attrs))
        if tag == "article" and "station" in attrs.get("class", "") and "data-mobile-rail-card" in attrs:
            self.service_rail_cards += 1
        if "data-mobile-rail-card" in attrs:
            self.rail_card_count += 1
        if "id" in attrs:
            self.ids.append(attrs["id"])
        self.markers.update(name for name in attrs if name.startswith("data-mobile-"))
        for control in ("data-mobile-rail-prev", "data-mobile-rail-next"):
            if control in attrs:
                self.mobile_controls_hidden[control] = "hidden" in attrs
        if tag == "a":
            self.links.append(attrs.get("href"))
            if "data-mobile-service-link" in attrs:
                self.mobile_service_links.append(attrs.get("href"))
            if "service-step__direct" in attrs.get("class", ""):
                href = attrs.get("href")
                if href not in self.desktop_service_links:
                    self.desktop_service_links.append(href)
        if tag == "p" and "data-mobile-service-summary" in attrs:
            self.in_mobile_summary = True
            self.mobile_summaries.append("")
        if tag == "p" and "data-mobile-copy" in attrs:
            self.current_mobile_copy = attrs["data-mobile-copy"]
            self.mobile_copy[self.current_mobile_copy] = ""
        if tag == "p" and "data-mobile-hero-summary" in attrs:
            self.in_mobile_hero_summary = True
        if tag == "article" and "data-mobile-rail-card" in attrs:
            self.in_mobile_card = True
            self.mobile_card_links.append([])
        elif self.in_mobile_card and tag == "a":
            self.mobile_card_links[-1].append(attrs.get("href"))

    def handle_endtag(self, tag):
        if tag == "p":
            self.current_mobile_copy = None
            self.in_mobile_summary = False
            self.in_mobile_hero_summary = False
        if tag == "article" and self.in_mobile_card:
            self.in_mobile_card = False

    def handle_data(self, data):
        if self.current_mobile_copy is not None:
            self.mobile_copy[self.current_mobile_copy] += data
        if self.in_mobile_summary:
            self.mobile_summaries[-1] += data
        if self.in_mobile_hero_summary:
            self.mobile_hero_summary += data


class MobileHomeTests(unittest.TestCase):
    def test_quiet_mobile_opening_keeps_primary_and_secondary_paths(self):
        page = PageProbe(ROOT / "dist" / "index.html")
        self.assertEqual(page.mobile_hero_summary.strip(),
                         "Abläufe ordnen. Team stärken. Arbeit abgeben.")
        self.assertTrue({"#leistungen", "/kontakt/", "/ueber/"}.issubset(page.links))
        self.assertIn("Wir ordnen Abläufe, schulen Ihr Team und übernehmen laufende Aufgaben.",
                      (ROOT / "dist" / "index.html").read_text(encoding="utf-8"))

    def test_mobile_offer_keyboard_focus_indicator(self):
        """The link focus ring must be inset rather than clipped by its card."""
        css = (ROOT / "src" / "styles" / "home.css").read_text(encoding="utf-8")
        self.assertTrue(".home-finder__mobile-card>a:focus-visible{outline:" in css,
                        "mobile card link needs an inset focus indicator")
        self.assertRegex(css, r"\.home-finder__mobile-card>a:focus-visible\{[^}]*outline-offset:-4px")

    def test_collaboration_copy_keeps_desktop_style(self):
        """Adding a mobile paragraph cannot remove the desktop intro styling."""
        css = (ROOT / "src" / "styles" / "home.css").read_text(encoding="utf-8")
        self.assertTrue(".home-approach__intro>p:not(.nc-kicker)" in css,
                        "both responsive copy variants need the intro styling")

    def test_finder_can_shrink_to_phone_width(self):
        """The scroll strip must not force its CSS grid column wider than a phone."""
        css = (ROOT / "src" / "styles" / "home.css").read_text(encoding="utf-8")
        self.assertRegex(css, r"@media\(max-width:999px\).*?\.home-finder\{grid-template-columns:minmax\(0,1fr\)")
        self.assertRegex(css, r"\.home-finder__intro\{[^}]*min-width:0")

    def test_three_linked_cards_and_controls(self):
        """Removing any phone offer or navigation control breaks discovery."""
        page = PageProbe(ROOT / "dist" / "index.html")
        self.assertEqual(
            page.mobile_card_links,
            [["/management/"], ["/akademie/"], ["/operation/"]],
        )
        self.assertTrue(
            {
                "data-mobile-rail",
                "data-mobile-rail-track",
                "data-mobile-rail-prev",
                "data-mobile-rail-next",
                "data-mobile-rail-status",
            }.issubset(page.markers)
        )
        self.assertEqual(len(page.ids), len(set(page.ids)))
        self.assertEqual(page.mobile_controls_hidden,
                         {"data-mobile-rail-prev": True, "data-mobile-rail-next": True})

    def test_concise_home_copy(self):
        """Phone overview copy stays short while the demo path remains available."""
        page = PageProbe(ROOT / "dist" / "index.html")
        self.assertEqual(
            set(page.mobile_copy),
            {"handbook-lead", "handbook-demo", "collaboration-intro", "collaboration-1", "collaboration-2", "collaboration-3"},
        )
        for copy in page.mobile_copy.values():
            self.assertLessEqual(copy.count("."), 2, copy)
        self.assertIn("Wir ordnen Abläufe, schulen Ihr Team und übernehmen laufende Aufgaben.",
                      (ROOT / "dist" / "index.html").read_text(encoding="utf-8"))
        self.assertIn(
            "/kontakt/?thema=betriebshandbuch&angebot=Demo-Zugang#contactform",
            page.links,
        )


class MobileServiceTests(unittest.TestCase):
    def test_image_follows_heading_before_mobile_lead_and_offers_swipe(self):
        for route, count in (("management", 4), ("akademie", 2), ("operation", 3)):
            with self.subTest(route=route):
                page = PageProbe(ROOT / "dist" / route / "index.html")
                tags = page.tag_sequence
                h1 = next(i for i, (tag, _) in enumerate(tags) if tag == "h1")
                visual = next(i for i, (_, attrs) in enumerate(tags)
                              if "service-hero__visual" in attrs.get("class", ""))
                lead = next(i for i, (_, attrs) in enumerate(tags) if "data-mobile-hero" in attrs)
                self.assertLess(h1, visual)
                self.assertLess(visual, lead)
                self.assertEqual(page.service_rail_cards, count)
                self.assertTrue({"data-mobile-rail", "data-mobile-rail-track",
                                 "data-mobile-rail-status"}.issubset(page.markers))
                self.assertTrue({"data-mobile-rail-prev": True,
                                 "data-mobile-rail-next": True}.items() <= page.mobile_controls_hidden.items())
                self.assertTrue(all(f"format-{step}" in page.ids for step in
                                    ({"management": ("handbuch", "mystery", "audit", "umsetzung"),
                                      "akademie": ("ki", "zusammenarbeit"),
                                      "operation": ("unterlagen", "kommunikation", "aktionen")}.get(route, ()))))

    def test_mobile_summaries_and_destinations(self):
        """Each overview exposes short direct cards without changing offer destinations."""
        for route, count in (("management", 4), ("akademie", 2), ("operation", 3)):
            with self.subTest(route=route):
                page = PageProbe(ROOT / "dist" / route / "index.html")
                self.assertEqual(len(page.mobile_summaries), count)
                self.assertTrue(all(summary.strip() and summary.count(".") == 1
                                    for summary in page.mobile_summaries))
                self.assertEqual(page.mobile_service_links, page.desktop_service_links)
                self.assertIn("data-mobile-hero", page.markers)
                self.assertIn("data-mobile-journey-intro", page.markers)
                self.assertEqual(len(page.ids), len(set(page.ids)))

    def test_supplemental_mobile_copy(self):
        """Short sections must keep qualification and contract conditions honest."""
        academy = PageProbe(ROOT / "dist" / "akademie" / "index.html")
        operation = PageProbe(ROOT / "dist" / "operation" / "index.html")
        self.assertEqual(academy.mobile_copy.get("academy-format"),
                         "Wir schulen Ihr Team zu einem vereinbarten Lernziel direkt in Ihrem Haus.")
        self.assertIn("AZAV-Zulassung ist noch in Vorbereitung",
                      (ROOT / "dist" / "akademie" / "index.html").read_text(encoding="utf-8"))
        self.assertEqual(operation.mobile_copy.get("operation-format"),
                         "Wir vereinbaren Aufgabe, Umfang und Termine vor dem Start.")
        self.assertIn("festen Leistungen, Abgabezeiten und Ansprechperson",
                      operation.mobile_copy.get("operation-month", ""))
        self.assertIn("Festpreis vor dem Start", operation.mobile_copy.get("operation-single", ""))
        self.assertIn("ohne automatische Verlängerung",
                      operation.mobile_copy.get("operation-trial", ""))
        self.assertIn("Preis auf Anfrage", operation.mobile_copy.get("operation-trial", ""))


class MobileDetailTests(unittest.TestCase):
    def test_image_bearing_detail_pages_put_visual_before_lead(self):
        for route in ("akademie/ki-grundlagen", "blog/fachkraeftemangel-ki-entlastung", "ueber", "kontakt"):
            with self.subTest(route=route):
                page = PageProbe(ROOT / "dist" / route / "index.html")
                tags = page.tag_sequence
                h1 = next(i for i, (tag, _) in enumerate(tags) if tag == "h1")
                visual = next(i for i, (_, attrs) in enumerate(tags)
                              if "detail-visual" in attrs.get("class", "") or "data-hero-visual" in attrs)
                lead = next(i for i, (_, attrs) in enumerate(tags) if "detail-lead" in attrs.get("class", ""))
                self.assertLess(h1, visual)
                self.assertLess(visual, lead)
        contact = (ROOT / "dist" / "kontakt" / "index.html").read_text(encoding="utf-8")
        self.assertIn('action="https://formsubmit.co/kontakt@next-course.de"', contact)

    def test_demo_covers_follow_headings_before_long_leads(self):
        for route, pdf in (("digital-audit-demo", "/demo/digital-audit/nextcourse-digital-audit-demo.pdf"),
                           ("mystery-check-demo", "/demo/mystery-check/nextcourse-mystery-check-demo.pdf")):
            with self.subTest(route=route):
                page = PageProbe(ROOT / "dist" / route / "index.html")
                tags = page.tag_sequence
                h1 = next(i for i, (tag, _) in enumerate(tags) if tag == "h1")
                cover = next(i for i, (_, attrs) in enumerate(tags) if "mc-demo__cover" in attrs.get("class", ""))
                lead = next(i for i, (_, attrs) in enumerate(tags) if "mc-demo__lead" in attrs.get("class", ""))
                self.assertLess(h1, cover)
                self.assertLess(cover, lead)
                self.assertIn(pdf, page.links)

    def test_text_only_pages_need_no_placeholder_visual(self):
        for route in ("impressum", "datenschutz", "404"):
            path = ROOT / "dist" / ("404.html" if route == "404" else f"{route}/index.html")
            page = PageProbe(path)
            self.assertFalse(any("detail-visual" in attrs.get("class", "") or "data-hero-visual" in attrs
                                 for _, attrs in page.tag_sequence))


class MobilePeerRailTests(unittest.TestCase):
    def test_peer_choices_swipe_without_losing_destinations_or_terms(self):
        cases = (
            ("blog", 3, ("/blog/fachkraeftemangel-ki-entlastung/",)),
            ("akademie/flying-academy", 2, ("/akademie/ki-grundlagen/", "/akademie/digitale-zusammenarbeit/")),
            ("operation/monatspakete", 3, ("/kontakt/?thema=entlastung",)),
            ("faq", 3, ("/management/betriebshandbuch/", "/akademie/flying-academy/", "/akademie/foerderung/")),
            ("404", 3, ("/management/", "/akademie/", "/operation/")),
        )
        for route, count, targets in cases:
            with self.subTest(route=route):
                path = ROOT / "dist" / ("404.html" if route == "404" else f"{route}/index.html")
                page = PageProbe(path)
                self.assertEqual(page.rail_card_count, count)
                self.assertTrue({"data-mobile-rail", "data-mobile-rail-track",
                                 "data-mobile-rail-status"}.issubset(page.markers))
                self.assertEqual(page.mobile_controls_hidden,
                                 {"data-mobile-rail-prev": True, "data-mobile-rail-next": True})
                for href in targets:
                    self.assertTrue(any(link and link.startswith(href) for link in page.links), href)
        packages = (ROOT / "dist" / "operation/monatspakete/index.html").read_text(encoding="utf-8")
        for term in ("ab 890 €", "ab 1.490 €", "ab 2.690 €", "Einrichtung ab 890 €", "Mindestlaufzeit: sechs Monate"):
            self.assertIn(term, packages)
        faq = (ROOT / "dist" / "faq/index.html").read_text(encoding="utf-8")
        self.assertIn("AZAV-Zulassung ist in Vorbereitung", faq)
