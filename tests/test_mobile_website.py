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
        self.feed(page.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        self.markers.update(name for name in attrs if name.startswith("data-mobile-"))
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
        if tag == "article" and "data-mobile-service-card" in attrs:
            self.in_mobile_card = True
            self.mobile_card_links.append([])
        elif self.in_mobile_card and tag == "a":
            self.mobile_card_links[-1].append(attrs.get("href"))

    def handle_endtag(self, tag):
        if tag == "p":
            self.current_mobile_copy = None
            self.in_mobile_summary = False
        if tag == "article" and self.in_mobile_card:
            self.in_mobile_card = False

    def handle_data(self, data):
        if self.current_mobile_copy is not None:
            self.mobile_copy[self.current_mobile_copy] += data
        if self.in_mobile_summary:
            self.mobile_summaries[-1] += data


class MobileHomeTests(unittest.TestCase):
    def test_three_linked_cards_and_controls(self):
        """Removing any phone offer or navigation control breaks discovery."""
        page = PageProbe(ROOT / "dist" / "index.html")
        self.assertEqual(
            page.mobile_card_links,
            [["/management/"], ["/akademie/"], ["/operation/"]],
        )
        self.assertTrue(
            {
                "data-mobile-finder",
                "data-mobile-service-track",
                "data-mobile-prev",
                "data-mobile-next",
                "data-mobile-status",
            }.issubset(page.markers)
        )
        self.assertEqual(len(page.ids), len(set(page.ids)))

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
