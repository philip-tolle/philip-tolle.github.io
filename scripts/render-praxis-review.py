#!/usr/bin/env python3
"""Render a static Praxis-Hub review from the restricted PHP tip dataset.

The source file is treated as data, never executed.  The parser accepts only
PHP array literals containing strings, integers, booleans, null and nested
arrays.  Functions, variables, constants, interpolation and expressions are
rejected.
"""

from __future__ import annotations

import argparse
import html
import os
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_PATH = PROJECT_ROOT / "public" / "prompt-studio" / "kunden" / "tipps.php"
OUTPUT_PATH = PROJECT_ROOT / "reviews" / "praxis-hub" / "index.html"

CATEGORY_LABELS = {
    "sprechen": {"label": "Sprechen statt tippen", "icon": "🎙️"},
    "ki-vorarbeit": {"label": "KI übernimmt Vorarbeit", "icon": "🧠"},
    "einrichten": {"label": "Einmal einrichten", "icon": "⚡"},
    "geraete": {"label": "Geräte-Tricks", "icon": "📱"},
    "kopf": {"label": "Kopf entlasten", "icon": "🧩"},
}
FORMAT_LABELS = {
    "tipp": "Abkürzung",
    "trick": "Geräte-Trick",
    "prompt-rezept": "Prompt",
    "skill-ablauf": "Mini-System",
}
ALLOWED_GOALS = {"zeit", "energie", "prompts", "skills"}
REQUIRED_FIELDS = {
    "id",
    "number",
    "title",
    "summary",
    "categories",
    "goals",
    "format",
    "try_time",
    "cost",
    "device",
    "setup",
    "benefit",
    "problem",
    "before",
    "after",
    "steps",
    "template",
    "copy_label",
    "tools",
    "saving",
    "why",
    "warning",
    "featured",
    "skill_name",
}
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class DataError(ValueError):
    """Raised when the PHP data literal or its schema is invalid."""


class RestrictedPhpArrayParser:
    """Parse the small, literal-only PHP subset used by ``tipps.php``."""

    def __init__(self, source: str, source_name: str) -> None:
        self.source = source
        self.source_name = source_name
        self.pos = self._find_return_value()

    def parse(self) -> Any:
        value = self._parse_value()
        self._skip_trivia()
        self._expect(";")
        self._skip_trivia()
        if self.source.startswith("?>", self.pos):
            self.pos += 2
            self._skip_trivia()
        if self.pos != len(self.source):
            self._fail("Unerwarteter Inhalt nach dem return-Ausdruck")
        return value

    def _find_return_value(self) -> int:
        pos = 0
        length = len(self.source)
        while pos < length:
            char = self.source[pos]
            if char.isspace():
                pos += 1
                continue
            if self.source.startswith("//", pos):
                pos = self._skip_line_comment(pos + 2)
                continue
            if char == "#":
                pos = self._skip_line_comment(pos + 1)
                continue
            if self.source.startswith("/*", pos):
                end = self.source.find("*/", pos + 2)
                if end < 0:
                    self.pos = pos
                    self._fail("Nicht abgeschlossener Blockkommentar")
                pos = end + 2
                continue
            if char in {"'", '"'}:
                pos = self._skip_quoted(pos, char)
                continue
            if self.source.startswith("return", pos):
                before_ok = pos == 0 or not (
                    self.source[pos - 1].isalnum() or self.source[pos - 1] == "_"
                )
                end = pos + len("return")
                after_ok = end == length or not (
                    self.source[end].isalnum() or self.source[end] == "_"
                )
                if before_ok and after_ok:
                    return end
            pos += 1
        self.pos = length
        self._fail("Kein return-Ausdruck gefunden")

    def _skip_quoted(self, pos: int, quote: str) -> int:
        pos += 1
        while pos < len(self.source):
            if self.source[pos] == "\\":
                pos += 2
                continue
            if self.source[pos] == quote:
                return pos + 1
            pos += 1
        self.pos = max(0, pos - 1)
        self._fail("Nicht abgeschlossene Zeichenkette")

    def _skip_line_comment(self, pos: int) -> int:
        newline = self.source.find("\n", pos)
        return len(self.source) if newline < 0 else newline + 1

    def _skip_trivia(self) -> None:
        while self.pos < len(self.source):
            if self.source[self.pos].isspace():
                self.pos += 1
                continue
            if self.source.startswith("//", self.pos):
                self.pos = self._skip_line_comment(self.pos + 2)
                continue
            if self.source[self.pos] == "#":
                self.pos = self._skip_line_comment(self.pos + 1)
                continue
            if self.source.startswith("/*", self.pos):
                end = self.source.find("*/", self.pos + 2)
                if end < 0:
                    self._fail("Nicht abgeschlossener Blockkommentar")
                self.pos = end + 2
                continue
            break

    def _parse_value(self) -> Any:
        self._skip_trivia()
        if self.pos >= len(self.source):
            self._fail("Wert erwartet, Dateiende erreicht")
        char = self.source[self.pos]
        if char == "[":
            return self._parse_array()
        if char in {"'", '"'}:
            return self._parse_string()
        if char == "-" or char.isdigit():
            return self._parse_integer()
        if char.isalpha() or char == "_":
            return self._parse_keyword()
        self._fail(f"Nicht erlaubter Wertbeginn {char!r}")

    def _parse_array(self) -> list[Any] | dict[str | int, Any]:
        self._expect("[")
        sequence: list[Any] = []
        mapping: dict[str | int, Any] = {}
        mode: str | None = None
        self._skip_trivia()
        if self._consume("]"):
            return sequence

        while True:
            first = self._parse_value()
            self._skip_trivia()
            if self._consume("=>"):
                if mode == "sequence":
                    self._fail("Gemischte indizierte und assoziative Arrays sind nicht erlaubt")
                if not isinstance(first, (str, int)) or isinstance(first, bool):
                    self._fail("Array-Schlüssel müssen Strings oder Integer sein")
                mode = "mapping"
                value = self._parse_value()
                if first in mapping:
                    self._fail(f"Doppelter Array-Schlüssel {first!r}")
                mapping[first] = value
            else:
                if mode == "mapping":
                    self._fail("Gemischte assoziative und indizierte Arrays sind nicht erlaubt")
                mode = "sequence"
                sequence.append(first)

            self._skip_trivia()
            if self._consume("]"):
                break
            self._expect(",")
            self._skip_trivia()
            if self._consume("]"):
                break

        return mapping if mode == "mapping" else sequence

    def _parse_string(self) -> str:
        quote = self.source[self.pos]
        self.pos += 1
        result: list[str] = []
        escapes = {
            "n": "\n",
            "r": "\r",
            "t": "\t",
            "v": "\v",
            "e": "\x1b",
            "f": "\f",
            "\\": "\\",
            '"': '"',
            "$": "$",
        }

        while self.pos < len(self.source):
            char = self.source[self.pos]
            if char == quote:
                self.pos += 1
                return "".join(result)
            if char == "$" and quote == '"':
                self._fail("PHP-Interpolation ist im Datensatz nicht erlaubt")
            if char != "\\":
                result.append(char)
                self.pos += 1
                continue

            self.pos += 1
            if self.pos >= len(self.source):
                self._fail("Nicht abgeschlossene Escape-Sequenz")
            escaped = self.source[self.pos]
            self.pos += 1
            if quote == "'":
                if escaped in {"'", "\\"}:
                    result.append(escaped)
                else:
                    result.extend(("\\", escaped))
                continue
            if escaped in escapes:
                result.append(escapes[escaped])
                continue
            if escaped == "x":
                digits = self.source[self.pos : self.pos + 2]
                if len(digits) != 2 or not re.fullmatch(r"[0-9A-Fa-f]{2}", digits):
                    self._fail("Ungültige hexadezimale Escape-Sequenz")
                result.append(chr(int(digits, 16)))
                self.pos += 2
                continue
            if escaped in "01234567":
                digits = escaped
                while len(digits) < 3 and self.pos < len(self.source):
                    if self.source[self.pos] not in "01234567":
                        break
                    digits += self.source[self.pos]
                    self.pos += 1
                result.append(chr(int(digits, 8)))
                continue
            result.extend(("\\", escaped))

        self._fail("Nicht abgeschlossene Zeichenkette")

    def _parse_integer(self) -> int:
        match = re.match(r"-?(?:0|[1-9][0-9]*)", self.source[self.pos :])
        if match is None:
            self._fail("Ungültiger Integer")
        token = match.group(0)
        self.pos += len(token)
        return int(token)

    def _parse_keyword(self) -> bool | None:
        match = re.match(r"[A-Za-z_][A-Za-z0-9_]*", self.source[self.pos :])
        if match is None:
            self._fail("Ungültiges Schlüsselwort")
        token = match.group(0)
        self.pos += len(token)
        if token == "true":
            return True
        if token == "false":
            return False
        if token == "null":
            return None
        self._fail(f"Nicht erlaubtes PHP-Schlüsselwort {token!r}")

    def _consume(self, token: str) -> bool:
        self._skip_trivia()
        if self.source.startswith(token, self.pos):
            self.pos += len(token)
            return True
        return False

    def _expect(self, token: str) -> None:
        if not self._consume(token):
            self._fail(f"{token!r} erwartet")

    def _fail(self, message: str) -> None:
        line = self.source.count("\n", 0, self.pos) + 1
        previous_newline = self.source.rfind("\n", 0, self.pos)
        column = self.pos - previous_newline
        raise DataError(f"{self.source_name}:{line}:{column}: {message}")


def load_tips(path: Path) -> list[dict[str, Any]]:
    try:
        source = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise DataError(f"Datensatz kann nicht gelesen werden: {path}: {exc}") from exc
    if "\x00" in source:
        raise DataError(f"Datensatz enthält ein Nullbyte: {path}")
    parsed = RestrictedPhpArrayParser(source, str(path)).parse()
    return validate_tips(parsed)


def validate_tips(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        raise DataError("Der Datensatz muss ein indiziertes PHP-Array sein")
    if len(value) != 15:
        raise DataError(f"Genau 15 Tipps erwartet, gefunden: {len(value)}")

    ids: set[str] = set()
    numbers: set[str] = set()
    featured_count = 0
    popular_ranks: set[int] = set()

    for index, tip in enumerate(value, start=1):
        label = f"Tipp {index:02d}"
        if not isinstance(tip, dict):
            raise DataError(f"{label} muss ein assoziatives Array sein")
        missing = REQUIRED_FIELDS.difference(tip)
        if missing:
            raise DataError(f"{label} fehlen Felder: {', '.join(sorted(missing))}")

        for field in (
            "id",
            "number",
            "title",
            "summary",
            "format",
            "try_time",
            "cost",
            "device",
            "setup",
            "benefit",
            "problem",
            "before",
            "after",
            "why",
            "warning",
        ):
            _require_text(tip[field], f"{label}.{field}")

        tip_id = tip["id"]
        if not ID_PATTERN.fullmatch(tip_id):
            raise DataError(f"{label}.id ist kein sicherer Slug: {tip_id!r}")
        if tip_id in ids:
            raise DataError(f"Doppelte Tipp-ID: {tip_id}")
        ids.add(tip_id)

        expected_number = f"{index:02d}"
        if tip["number"] != expected_number:
            raise DataError(
                f"{label}.number muss {expected_number!r} sein, ist aber {tip['number']!r}"
            )
        if tip["number"] in numbers:
            raise DataError(f"Doppelte Tipp-Nummer: {tip['number']}")
        numbers.add(tip["number"])

        _require_string_list(tip["categories"], f"{label}.categories", minimum=1)
        unknown_categories = set(tip["categories"]).difference(CATEGORY_LABELS)
        if unknown_categories:
            raise DataError(
                f"{label}.categories enthält unbekannte Werte: "
                f"{', '.join(sorted(unknown_categories))}"
            )
        if len(set(tip["categories"])) != len(tip["categories"]):
            raise DataError(f"{label}.categories enthält Duplikate")

        _require_string_list(tip["goals"], f"{label}.goals", minimum=1)
        unknown_goals = set(tip["goals"]).difference(ALLOWED_GOALS)
        if unknown_goals:
            raise DataError(
                f"{label}.goals enthält unbekannte Werte: "
                f"{', '.join(sorted(unknown_goals))}"
            )
        if len(set(tip["goals"])) != len(tip["goals"]):
            raise DataError(f"{label}.goals enthält Duplikate")

        if tip["format"] not in FORMAT_LABELS:
            raise DataError(f"{label}.format ist unbekannt: {tip['format']!r}")
        _require_string_list(tip["steps"], f"{label}.steps", minimum=1, maximum=4)
        _require_string_list(tip["tools"], f"{label}.tools", minimum=1)
        if "tags" in tip:
            _require_string_list(tip["tags"], f"{label}.tags", minimum=1)

        template = tip["template"]
        copy_label = tip["copy_label"]
        if template is None or copy_label is None:
            if template is not None or copy_label is not None:
                raise DataError(f"{label}: template und copy_label müssen gemeinsam gesetzt sein")
        else:
            _require_text(template, f"{label}.template")
            _require_text(copy_label, f"{label}.copy_label")

        saving = tip["saving"]
        if saving is not None:
            _require_text(saving, f"{label}.saving")
            if not saving.startswith("geschätzt "):
                raise DataError(f"{label}.saving muss als Schätzung markiert sein")

        if not isinstance(tip["featured"], bool):
            raise DataError(f"{label}.featured muss boolesch sein")
        featured_count += int(tip["featured"])

        skill_name = tip["skill_name"]
        if skill_name is not None:
            _require_text(skill_name, f"{label}.skill_name")

        popular_rank = tip.get("popular_rank")
        if popular_rank is not None:
            if isinstance(popular_rank, bool) or not isinstance(popular_rank, int):
                raise DataError(f"{label}.popular_rank muss ein Integer oder null sein")
            if popular_rank < 1:
                raise DataError(f"{label}.popular_rank muss positiv sein")
            if popular_rank in popular_ranks:
                raise DataError(f"Doppelter popular_rank: {popular_rank}")
            popular_ranks.add(popular_rank)

    if featured_count != 1:
        raise DataError(f"Genau ein Starte-hier-Tipp erwartet, gefunden: {featured_count}")
    return value


def _require_text(value: Any, field: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise DataError(f"{field} muss ein nicht leerer String sein")
    if "\x00" in value:
        raise DataError(f"{field} enthält ein Nullbyte")


def _require_string_list(
    value: Any,
    field: str,
    *,
    minimum: int = 0,
    maximum: int | None = None,
) -> None:
    if not isinstance(value, list):
        raise DataError(f"{field} muss ein indiziertes Array sein")
    if len(value) < minimum:
        raise DataError(f"{field} benötigt mindestens {minimum} Eintrag/Einträge")
    if maximum is not None and len(value) > maximum:
        raise DataError(f"{field} darf höchstens {maximum} Einträge enthalten")
    for item_index, item in enumerate(value, start=1):
        _require_text(item, f"{field}[{item_index}]")


def h(value: Any) -> str:
    return html.escape(str(value), quote=True)


ARROW_SVG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M5 12h14m-5-5 5 5-5 5"></path></svg>'
)
CHEVRON_SVG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="m7 10 5 5 5-5"></path></svg>'
)
COPY_SVG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<rect x="8" y="8" width="10" height="11" rx="2"></rect>'
    '<path d="M16 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1"></path>'
    "</svg>"
)


def render_category_buttons(tips: list[dict[str, Any]]) -> str:
    visible = {category for tip in tips for category in tip["categories"]}
    buttons = [
        '              <button type="button" class="filter-button filter-button--category is-active" '
        'data-filter-category="all" aria-pressed="true">Alle</button>'
    ]
    for key, category in CATEGORY_LABELS.items():
        if key not in visible:
            continue
        buttons.append(
            "              "
            f'<button type="button" class="filter-button filter-button--category" '
            f'data-filter-category="{h(key)}" aria-pressed="false">\n'
            f'                <span class="filter-icon" aria-hidden="true">{h(category["icon"])}</span>\n'
            f'                {h(category["label"])}\n'
            "              </button>"
        )
    return "\n".join(buttons)


def render_card(tip: dict[str, Any]) -> str:
    tip_id = tip["id"]
    primary_category = CATEGORY_LABELS[tip["categories"][0]]
    featured_class = " is-featured" if tip["featured"] else ""
    tags = tip.get("tags", [])
    searchable_parts = [
        tip["title"],
        tip["summary"],
        tip["problem"],
        tip["before"],
        tip["after"],
        tip["device"],
        tip["cost"],
        tip["setup"],
        tip["benefit"],
        *tip["steps"],
        *tip["tools"],
        *tags,
    ]
    searchable = " ".join(searchable_parts).lower()
    steps = "\n".join(f"                        <li>{h(step)}</li>" for step in tip["steps"])
    tools = "\n".join(f"                        <li>{h(tool)}</li>" for tool in tip["tools"])

    template_section = ""
    if tip["template"] is not None:
        template_section = f"""
                  <section class="template-section">
                    <div class="template-heading">
                      <h4>Direkt ausprobieren</h4>
                      <button type="button" class="copy-button" data-copy-target="template-{h(tip_id)}">
                        {COPY_SVG}
                        <span data-copy-label>{h(tip["copy_label"])}</span>
                      </button>
                    </div>
                    <pre id="template-{h(tip_id)}">{h(tip["template"])}</pre>
                  </section>
"""

    saving = ""
    if tip["saving"] is not None:
        saving = f'\n                      <p><strong>Zeitersparnis:</strong> {h(tip["saving"])}</p>'

    skill_note = ""
    if tip["skill_name"] is not None:
        skill_note = (
            "\n                    "
            f'<p class="skill-note">Daraus kann dein eigener Skill „{h(tip["skill_name"])}“ werden.</p>'
        )

    return f"""            <article
              class="impulse-card{featured_class}"
              id="tipp-{h(tip_id)}"
              data-card
              data-categories="{h(' '.join(tip['categories']))}"
              data-search="{h(searchable)}"
            >
              <header class="card-header">
                <div class="card-header-main">
                  <span class="card-number">{h(tip['number'])}</span>
                  <span class="category-mark" aria-hidden="true">{h(primary_category['icon'])}</span>
                  <span class="category-name">{h(primary_category['label'])}</span>
                </div>
                <span class="format-badge">{h(FORMAT_LABELS[tip['format']])} · leicht</span>
              </header>
              <div class="card-copy card-copy--toolbox">
                <h3>{h(tip['title'])}</h3>
                <p>{h(tip['summary'])}</p>
                <span class="card-benefit">{h(tip['benefit'])}</span>
              </div>

              <div class="card-transformation" aria-label="Vorher-Nachher">
                <div class="transform-side">
                  <small>Vorher</small>
                  <strong>{h(tip['before'])}</strong>
                </div>
                {ARROW_SVG}
                <div class="transform-side transform-side--after">
                  <small>Nachher</small>
                  <strong>{h(tip['after'])}</strong>
                </div>
              </div>

              <dl class="card-facts" aria-label="Aufwand und Voraussetzungen">
                <div><dt>Ausprobieren</dt><dd>{h(tip['try_time'])}</dd></div>
                <div><dt>Kosten</dt><dd>{h(tip['cost'])}</dd></div>
                <div><dt>Gerät</dt><dd>{h(tip['device'])}</dd></div>
                <div><dt>Einrichtung</dt><dd>{h(tip['setup'])}</dd></div>
              </dl>

              <details class="card-details" data-card-details>
                <summary>
                  <span data-details-label>Abkürzung öffnen</span>
                  {CHEVRON_SVG}
                </summary>
                <div class="detail-content">
                  <section class="problem-panel">
                    <h4>Das Problem</h4>
                    <p>{h(tip['problem'])}</p>
                  </section>
{template_section}
                  <section>
                    <h4>So geht's</h4>
                    <ol>
{steps}
                    </ol>
                  </section>

                  <section>
                    <h4>Werkzeug</h4>
                    <ul class="tools-list">
{tools}
                    </ul>
                  </section>

                  <div class="insight-grid">
                    <section>
                      <h4>Nutzen</h4>
                      <p>{h(tip['why'])}</p>{saving}
                    </section>
                    <section>
                      <h4>Darauf achten</h4>
                      <p>{h(tip['warning'])}</p>
                    </section>
                  </div>

                  <div class="detail-actions">
                    <a class="studio-cta" href="../../public/prompt-studio/index.html#/dashboard">
                      <span>
                        <small>Speichern oder anpassen</small>
                        Im Prompt Studio weiterbauen
                      </span>
                      {ARROW_SVG}
                    </a>{skill_note}
                  </div>
                </div>
              </details>
            </article>"""


def render_review(tips: list[dict[str, Any]]) -> str:
    starter = next(tip for tip in tips if tip["featured"])
    category_buttons = render_category_buttons(tips)
    cards = "\n".join(render_card(tip) for tip in tips)

    return f"""<!doctype html>
<!-- Generated by scripts/render-praxis-review.py from public/prompt-studio/kunden/tipps.php. -->
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#122A2F">
  <meta name="description" content="Statische Review-Vorschau der NextCourse Werkzeugkiste mit 15 Alltags-Abkürzungen.">
  <meta name="generator" content="scripts/render-praxis-review.py">
  <title>Review: Dein Praxis-Hub | NextCourse</title>
  <link rel="icon" type="image/png" href="../../public/prompt-studio/favicon.png">
  <link rel="stylesheet" href="../../public/prompt-studio/kunden/praxis.css?v=20260906-3">
  <script src="../../public/prompt-studio/kunden/praxis.js?v=20260906-3" defer></script>
</head>
<body class="hub-page" data-review-preview>
  <a class="skip-link" href="#praxis-inhalte">Direkt zu den Alltags-Abkürzungen</a>

  <header class="hub-topbar">
    <a class="hub-brand" href="../../public/prompt-studio/index.html" aria-label="NextCourse Prompt Studio öffnen">
      <img src="../../public/prompt-studio/assets/nc-logo-BZSH1Yoa.png" alt="" width="46" height="46">
      <span><strong>NextCourse</strong><small>Prompt Studio</small></span>
    </a>
    <nav class="hub-topnav" aria-label="Direkte Wege">
      <a class="topnav-link topnav-link--hub" href="../../public/prompt-studio/index.html">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h14M7 16V8l5-4 5 4v8M10 19v-5h4v5"></path></svg>
        <span>Prompt Studio</span>
      </a>
      <a class="topnav-link topnav-link--site" href="https://www.next-course.de/">
        <span>Zur Website</span>
        {ARROW_SVG}
      </a>
      <span class="logout-button" aria-label="Statische Review-Vorschau ohne Anmeldung">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z"></path></svg>
        <span>Demo-Zugang</span>
      </span>
    </nav>
  </header>

  <main>
    <section class="hub-hero" aria-labelledby="hub-title">
      <div class="hero-copy hero-copy--toolbox">
        <p class="eyebrow"><span></span> Deine Werkzeugkiste · Demo-Vorschau</p>
        <h1 id="hub-title">Kleine Abkürzungen für einen <em>leichteren Alltag.</em></h1>
        <p class="hero-promise">Weniger tippen. Weniger suchen. Weniger im Kopf behalten.</p>
        <p class="hero-intro">Praktische Funktionen, Prompts und Mini-Systeme, die Zeit sparen, Denkaufwand reduzieren und lästige Aufgaben vereinfachen.</p>
        <div class="hero-actions">
          <a class="button button--primary" href="#praxis-inhalte">Abkürzungen entdecken</a>
          <a class="button button--secondary" href="../../public/prompt-studio/index.html">Prompt Studio kennenlernen</a>
        </div>
      </div>
      <div class="hero-path hero-path--toolbox" aria-label="Von der Abkürzung zum eigenen Werkzeug">
        <div class="path-line" aria-hidden="true"></div>
        <article class="path-step path-step--one">
          <span>01</span>
          <div><strong>Entdecken</strong><small>Was soll gerade leichter werden?</small></div>
        </article>
        <article class="path-step path-step--two">
          <span>02</span>
          <div><strong>Ausprobieren</strong><small>Funktion, Satz oder Prompt direkt nutzen.</small></div>
        </article>
        <article class="path-step path-step--three">
          <span>03</span>
          <div><strong>Wiederverwenden</strong><small>Gute Abläufe im Studio weiterbauen.</small></div>
        </article>
        <p class="path-note">Kein Technik-Wissen nötig. Beginne mit genau einem kleinen Helfer.</p>
      </div>
    </section>

    <section class="finder" id="praxis-inhalte" aria-labelledby="finder-title">
      <div class="finder-heading">
        <div>
          <p class="eyebrow"><span></span> Entdecken</p>
          <h2 id="finder-title">Was soll gerade leichter werden?</h2>
        </div>
        <p><strong>{len(tips)}</strong> direkt nutzbare Abkürzungen</p>
      </div>

      <article class="starter-spotlight" aria-labelledby="starter-title">
        <div class="starter-copy">
          <span class="starter-label">Starte hier · keine Einrichtung</span>
          <h3 id="starter-title">{h(starter['title'])}</h3>
          <p>{h(starter['summary'])}</p>
          <a class="starter-link" href="#tipp-{h(starter['id'])}" data-open-tip>
            Jetzt ausprobieren
            {ARROW_SVG}
          </a>
        </div>
        <div class="starter-flow" aria-label="Vorher-Nachher-Beispiel">
          <div class="flow-state">
            <small>Vorher</small>
            <strong>{h(starter['before'])}</strong>
          </div>
          {ARROW_SVG}
          <div class="flow-state flow-state--after">
            <small>Nachher</small>
            <strong>{h(starter['after'])}</strong>
          </div>
        </div>
      </article>

      <div class="filter-panel filter-panel--toolbox" data-filter-panel>
        <label class="search-field">
          <span class="visually-hidden">Alltags-Abkürzungen durchsuchen</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path></svg>
          <input type="search" placeholder="Zum Beispiel: Dokument, Windows, Nachricht …" autocomplete="off" data-filter-search>
        </label>

        <div class="filter-group category-filter" aria-labelledby="category-filter-label">
          <span class="filter-label" id="category-filter-label">Kategorie wählen</span>
          <div class="filter-buttons" role="group" aria-labelledby="category-filter-label">
{category_buttons}
          </div>
        </div>
      </div>

      <p class="result-status" aria-live="polite" data-result-status>{len(tips)} Abkürzungen angezeigt</p>

      <div class="impulse-grid" data-card-grid>
{cards}
      </div>
      <div class="empty-state" data-empty-state hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M7 12h10M10 19h4"></path></svg>
        <h3>Noch kein Treffer</h3>
        <p>Ändere den Suchbegriff oder setze einen Filter zurück.</p>
        <button type="button" class="button button--secondary" data-reset-filters>Alle Abkürzungen zeigen</button>
      </div>
    </section>

    <section class="concept-guide" aria-labelledby="concept-title">
      <div class="concept-guide__heading">
        <p class="eyebrow"><span></span> Drei einfache Bausteine</p>
        <h2 id="concept-title">Was ist eine Abkürzung, ein Prompt oder ein Skill?</h2>
        <p>Du musst die Begriffe nicht kennen, um loszulegen. Diese kurze Einordnung zeigt dir nur, wie aus einer kleinen Idee ein wiederverwendbarer Helfer werden kann.</p>
      </div>
      <div class="concept-grid">
        <article class="concept-card">
          <span aria-hidden="true">💡</span>
          <h3>Abkürzung</h3>
          <p>Eine kleine Funktion oder Idee, die sofort etwas leichter macht – etwa Text aus einem Screenshot zu kopieren.</p>
        </article>
        <article class="concept-card">
          <span aria-hidden="true">📋</span>
          <h3>Prompt</h3>
          <p>Eine fertige Anweisung für eine KI, die du kopierst, mit deinen Angaben ergänzt und direkt ausprobierst.</p>
        </article>
        <article class="concept-card">
          <span aria-hidden="true">⚙️</span>
          <h3>Skill</h3>
          <p>Ein wiederverwendbarer Arbeitsablauf mit festen Regeln – zum Beispiel dein persönlicher Dokumenten-Prüfer.</p>
        </article>
      </div>
    </section>

    <section class="studio-bridge" aria-labelledby="studio-bridge-title">
      <p class="bridge-kicker">Ausprobiert? Dann mach es zu deinem Werkzeug.</p>
      <h2 id="studio-bridge-title">Im Prompt Studio wird aus einer guten Abkürzung dein eigener Helfer.</h2>
      <p>Übernimm einen Prompt, passe ihn an deinen Alltag an und entwickle daraus bei Bedarf einen wiederverwendbaren Skill.</p>
      <div class="hero-actions">
        <a class="button button--primary" href="../../public/prompt-studio/index.html">Prompt Studio öffnen</a>
        <a class="text-link" href="https://www.next-course.de/">
          NextCourse Website
          {ARROW_SVG}
        </a>
      </div>
    </section>
  </main>

  <footer class="hub-footer">
    <p>NextCourse · KI, die im Arbeitsalltag ankommt.</p>
    <nav aria-label="Rechtliches">
      <a href="https://www.next-course.de/impressum/">Impressum</a>
      <a href="https://www.next-course.de/datenschutz/">Datenschutz</a>
    </nav>
  </footer>

  <div class="copy-toast" role="status" aria-live="polite" aria-atomic="true" data-copy-toast></div>
</body>
</html>
"""


class ReviewHtmlInspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.cards: list[dict[str, str | None]] = []
        self.card_details = 0
        self.copy_targets: list[str] = []
        self.filter_categories: list[str] = []
        self.local_references: list[str] = []
        self.starter_count = 0
        self.concept_count = 0
        self.forms = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        classes = set((values.get("class") or "").split())
        if "id" in values and values["id"] is not None:
            self.ids.append(values["id"])
        if tag == "article" and "data-card" in values:
            self.cards.append(values)
        if tag == "details" and "data-card-details" in values:
            self.card_details += 1
        if "data-copy-target" in values and values["data-copy-target"] is not None:
            self.copy_targets.append(values["data-copy-target"])
        if "data-filter-category" in values and values["data-filter-category"] is not None:
            self.filter_categories.append(values["data-filter-category"])
        if "starter-spotlight" in classes:
            self.starter_count += 1
        if "concept-card" in classes:
            self.concept_count += 1
        if tag == "form":
            self.forms += 1
        reference = values.get("href") if tag in {"a", "link"} else values.get("src")
        if reference:
            parsed = urlsplit(reference)
            if not parsed.scheme and not parsed.netloc and not reference.startswith("#"):
                self.local_references.append(reference)


def validate_review_html(document: str, tips: list[dict[str, Any]], output_path: Path) -> None:
    inspector = ReviewHtmlInspector()
    inspector.feed(document)
    inspector.close()
    errors: list[str] = []

    expected_card_ids = [f"tipp-{tip['id']}" for tip in tips]
    actual_card_ids = [attrs.get("id") for attrs in inspector.cards]
    if actual_card_ids != expected_card_ids:
        errors.append("Karten-IDs oder Reihenfolge stimmen nicht mit dem Datensatz überein")
    if len(inspector.cards) != 15:
        errors.append(f"15 Karten erwartet, gefunden: {len(inspector.cards)}")
    if inspector.card_details != len(tips):
        errors.append(
            f"{len(tips)} Detailbereiche erwartet, gefunden: {inspector.card_details}"
        )
    if len(inspector.ids) != len(set(inspector.ids)):
        errors.append("Die Review-Datei enthält doppelte HTML-IDs")

    expected_copy_targets = [
        f"template-{tip['id']}" for tip in tips if tip["template"] is not None
    ]
    if inspector.copy_targets != expected_copy_targets:
        errors.append("Copy-Buttons oder ihre Zielreihenfolge sind unvollständig")
    missing_copy_targets = set(inspector.copy_targets).difference(inspector.ids)
    if missing_copy_targets:
        errors.append(
            "Copy-Ziele fehlen: " + ", ".join(sorted(missing_copy_targets))
        )

    expected_categories = ["all", *CATEGORY_LABELS]
    if inspector.filter_categories != expected_categories:
        errors.append(
            "Kategoriefilter stimmen nicht: " + ", ".join(inspector.filter_categories)
        )
    for tip, card in zip(tips, inspector.cards):
        if card.get("data-categories") != " ".join(tip["categories"]):
            errors.append(f"Kategorien an Karte {tip['id']} stimmen nicht")
        if not (card.get("data-search") or "").strip():
            errors.append(f"Suchtext an Karte {tip['id']} fehlt")

    if inspector.starter_count != 1:
        errors.append(f"Ein Starte-hier-Bereich erwartet, gefunden: {inspector.starter_count}")
    if inspector.concept_count != 3:
        errors.append(f"Drei Begriffskarten erwartet, gefunden: {inspector.concept_count}")
    if inspector.forms:
        errors.append("Die statische Review-Datei darf kein Formular enthalten")
    if "logout.php" in document or ">Abmelden<" in document:
        errors.append("Die Review-Datei enthält einen echten oder irreführenden Logout")
    if "Demo-Zugang" not in document:
        errors.append("Der Demo-Zugang ist nicht gekennzeichnet")

    for reference in inspector.local_references:
        relative_path = unquote(urlsplit(reference).path)
        resolved = (output_path.parent / relative_path).resolve()
        try:
            resolved.relative_to(PROJECT_ROOT.resolve())
        except ValueError:
            errors.append(f"Lokaler Link verlässt das Projekt: {reference}")
            continue
        if not resolved.exists():
            errors.append(f"Lokales Link-/Asset-Ziel fehlt: {reference}")

    if errors:
        raise DataError("Review-Prüfung fehlgeschlagen:\n- " + "\n- ".join(errors))


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.replace(temporary_path, path)
    except BaseException:
        temporary_path.unlink(missing_ok=True)
        raise


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Erzeugt und prüft die statische Praxis-Hub-Review-Vorschau."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Prüft, ob die vorhandene Review-Datei aktuell und strukturell gültig ist.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    tips = load_tips(DATA_PATH)
    rendered = render_review(tips)
    validate_review_html(rendered, tips, OUTPUT_PATH)

    if args.check:
        try:
            existing = OUTPUT_PATH.read_text(encoding="utf-8")
        except OSError as exc:
            raise DataError(f"Review-Datei kann nicht gelesen werden: {OUTPUT_PATH}: {exc}") from exc
        if existing != rendered:
            raise DataError(
                "Die Review-Datei ist nicht aktuell. "
                "Bitte scripts/render-praxis-review.py ohne --check ausführen."
            )
        validate_review_html(existing, tips, OUTPUT_PATH)
        print(f"OK: {OUTPUT_PATH.relative_to(PROJECT_ROOT)} ist aktuell und strukturell gültig.")
        return 0

    write_atomic(OUTPUT_PATH, rendered)
    print(
        f"Erstellt: {OUTPUT_PATH.relative_to(PROJECT_ROOT)} "
        f"({len(tips)} Tipps, {len(rendered.encode('utf-8'))} Bytes)"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except DataError as exc:
        raise SystemExit(f"Fehler: {exc}") from exc
