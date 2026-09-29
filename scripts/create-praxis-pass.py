#!/usr/bin/env python3
"""Create a local Praxis-Hub access pass and a private PHP config.

The generated QR token and manual access code are written only below
``.local/praxis-passes`` by default. The public web directory is rejected as
an output destination. Console output never contains credentials.

Example:
    python scripts/create-praxis-pass.py \
        --label "Pilotkunde Nord" \
        --expires 2026-12-31 \
        --topics zeit,energie,prompts,skills
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import os
import re
import secrets
import shutil
import sys
import tempfile
import unicodedata
from datetime import date, datetime, time, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlsplit, urlunsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PUBLIC_ROOT = (PROJECT_ROOT / "public").resolve()
DEFAULT_OUTPUT_ROOT = PROJECT_ROOT / ".local" / "praxis-passes"
DEFAULT_BASE_URL = "https://www.next-course.de/prompt-studio/kunden/zugang/"

ALLOWED_TOPICS = ("zeit", "energie", "prompts", "skills")
MANUAL_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
PASS_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{2,63}$")
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")

# qrcodegen is vendored from Project Nayuki under the MIT license so pass
# creation stays offline and never sends access credentials to a third party.
sys.path.insert(0, str(SCRIPT_DIR / "vendor"))
try:
    from qrcodegen import QrCode
except ImportError as exc:  # pragma: no cover - actionable installation error
    raise SystemExit(
        "Die vendorte QR-Bibliothek scripts/vendor/qrcodegen.py fehlt. "
        "Bitte stelle die Projektdatei wieder her; Zugangsdaten werden nicht "
        "an einen Online-QR-Dienst gesendet."
    ) from exc


class PassError(ValueError):
    """Raised for invalid input or unsafe local state."""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Erzeugt einen Praxis-Hub-Pass, ein druckbares lokales Pass-Kit "
            "und eine deploybare private PHP-Konfiguration."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--label",
        required=True,
        help="Neutrale Bezeichnung des Zugangs, z. B. 'Pilotkunde Nord'.",
    )
    parser.add_argument(
        "--expires",
        required=True,
        help=(
            "Ablaufdatum als YYYY-MM-DD (bis 23:59:59 Europe/Berlin) oder "
            "ISO-8601-Zeitpunkt mit Zeitzone."
        ),
    )
    parser.add_argument(
        "--topics",
        default=",".join(ALLOWED_TOPICS),
        help="Kommagetrennte Freigaben: zeit, energie, prompts, skills.",
    )
    parser.add_argument(
        "--pass-id",
        help=(
            "Optionale technische ID (a-z, 0-9, Bindestrich). Ohne Angabe "
            "wird eine kollisionsarme ID aus Label und Zufallssuffix erzeugt."
        ),
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="HTTPS-Adresse der Zugang-Seite, noch ohne Fragment-Token.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT,
        help=(
            "Lokaler Ausgabestamm. Darf nicht innerhalb von public liegen; "
            "für den normalen Einsatz bitte den Standard beibehalten."
        ),
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help=(
            "Ersetzt einen bereits vorhandenen Pass mit derselben --pass-id "
            "durch neue Zugangsdaten."
        ),
    )
    return parser.parse_args(argv)


def _is_relative_to(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def validate_output_root(path: Path) -> Path:
    output_root = path.expanduser().resolve()
    if output_root == PUBLIC_ROOT or _is_relative_to(output_root, PUBLIC_ROOT):
        raise PassError(
            "Unsicheres Ausgabeziel: Zugangsdaten dürfen niemals unter public liegen."
        )
    if output_root.exists() and output_root.is_symlink():
        raise PassError("Das Ausgabeziel darf kein symbolischer Link sein.")
    return output_root


def validate_internal_path(path: Path, output_root: Path) -> None:
    """Reject a symlinked child directory that would escape the safe root."""
    resolved = path.resolve()
    if resolved != output_root and not _is_relative_to(resolved, output_root):
        raise PassError(f"Unsicherer Pfad außerhalb des Ausgabeziels: {path}")


def normalize_label(value: str) -> str:
    label = " ".join(value.split())
    if not (2 <= len(label) <= 80):
        raise PassError("--label muss zwischen 2 und 80 Zeichen lang sein.")
    return label


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    return (slug[:42].rstrip("-") or "praxis-pass")


def create_pass_id(label: str, requested: str | None) -> str:
    if requested is not None:
        pass_id = requested.strip().lower()
        if not PASS_ID_PATTERN.fullmatch(pass_id):
            raise PassError(
                "--pass-id muss 3–64 Zeichen aus a-z, 0-9 und Bindestrichen enthalten."
            )
        return pass_id
    return f"{slugify(label)}-{secrets.token_hex(4)}"


def parse_topics(value: str) -> list[str]:
    requested = [item.strip().lower() for item in value.split(",") if item.strip()]
    if not requested:
        raise PassError("Mindestens ein Thema muss freigegeben werden.")
    unknown = sorted(set(requested) - set(ALLOWED_TOPICS))
    if unknown:
        raise PassError(
            "Unbekannte Themen: "
            + ", ".join(unknown)
            + ". Erlaubt sind: "
            + ", ".join(ALLOWED_TOPICS)
            + "."
        )
    return [topic for topic in ALLOWED_TOPICS if topic in requested]


def parse_expiry(value: str) -> str:
    raw = value.strip()
    parsed: datetime
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
        try:
            expiry_date = date.fromisoformat(raw)
        except ValueError as exc:
            raise PassError("--expires enthält kein gültiges Kalenderdatum.") from exc
        try:
            berlin = ZoneInfo("Europe/Berlin")
        except ZoneInfoNotFoundError as exc:
            raise PassError(
                "Die Zeitzone Europe/Berlin fehlt. Verwende einen ISO-8601-"
                "Zeitpunkt mit explizitem Offset, z. B. 2026-12-31T23:59:59+01:00."
            ) from exc
        parsed = datetime.combine(expiry_date, time(23, 59, 59), tzinfo=berlin)
    else:
        normalized = raw[:-1] + "+00:00" if raw.endswith(("Z", "z")) else raw
        try:
            parsed = datetime.fromisoformat(normalized)
        except ValueError as exc:
            raise PassError(
                "--expires muss YYYY-MM-DD oder ein ISO-8601-Zeitpunkt sein."
            ) from exc
        if parsed.tzinfo is None or parsed.utcoffset() is None:
            raise PassError(
                "Ein Ablaufzeitpunkt benötigt eine Zeitzone, z. B. +01:00 oder Z."
            )

    parsed_utc = parsed.astimezone(timezone.utc).replace(microsecond=0)
    if parsed_utc <= datetime.now(timezone.utc):
        raise PassError("Das Ablaufdatum muss in der Zukunft liegen.")
    return parsed_utc.isoformat().replace("+00:00", "Z")


def normalize_base_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    if parsed.scheme.lower() != "https" or not parsed.netloc:
        raise PassError("--base-url muss eine vollständige HTTPS-Adresse sein.")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise PassError(
            "--base-url darf keine Zugangsdaten, Query-Parameter oder Fragmente enthalten."
        )
    path = parsed.path if parsed.path.endswith("/") else parsed.path + "/"
    return urlunsplit(("https", parsed.netloc, path, "", ""))


def make_token() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b"=").decode("ascii")


def make_manual_code() -> tuple[str, str]:
    normalized = "".join(secrets.choice(MANUAL_CODE_ALPHABET) for _ in range(12))
    display = "-".join(normalized[index : index + 4] for index in range(0, 12, 4))
    return display, normalized


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def render_qr_svg(payload: str, border: int = 4) -> str:
    qr = QrCode.encode_text(payload, QrCode.Ecc.MEDIUM)
    size = qr.get_size()
    dimension = size + border * 2
    path_parts: list[str] = []
    for y in range(size):
        x = 0
        while x < size:
            if not qr.get_module(x, y):
                x += 1
                continue
            run_start = x
            while x < size and qr.get_module(x, y):
                x += 1
            run_width = x - run_start
            path_parts.append(
                f"M{run_start + border},{y + border}h{run_width}v1h-{run_width}z"
            )
    modules = "".join(path_parts)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {dimension} {dimension}" width="900" height="900" '
        'role="img" aria-labelledby="title description" '
        'shape-rendering="crispEdges">\n'
        "  <title id=\"title\">QR-Code zum NextCourse Praxis-Hub</title>\n"
        "  <desc id=\"description\">Persönlicher Zugang; vertraulich behandeln.</desc>\n"
        f'  <rect width="{dimension}" height="{dimension}" fill="#FFFFFF"/>\n'
        f'  <path d="{modules}" fill="#122A2F"/>\n'
        "</svg>\n"
    )


def render_pass_kit(
    *,
    label: str,
    pass_id: str,
    access_url: str,
    manual_code: str,
    expires_at: str,
    topics: Iterable[str],
) -> str:
    topic_labels = {
        "zeit": "Zeit sparen",
        "energie": "Energie sparen",
        "prompts": "Bessere Prompts",
        "skills": "Skills & Abläufe",
    }
    expiry_local = datetime.fromisoformat(expires_at.replace("Z", "+00:00")).astimezone(
        ZoneInfo("Europe/Berlin")
    )
    topic_markup = "".join(
        f"<span>{html.escape(topic_labels[topic])}</span>" for topic in topics
    )
    escaped_label = html.escape(label)
    escaped_url = html.escape(access_url, quote=True)
    escaped_code = html.escape(manual_code)
    escaped_id = html.escape(pass_id)
    expiry_text = expiry_local.strftime("%d.%m.%Y, %H:%M Uhr")
    return f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>NextCourse Praxis-Hub – Zugang für {escaped_label}</title>
  <style>
    :root {{ color-scheme: light; font-family: Arial, Helvetica, sans-serif; }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; background: #f2eee7; color: #122a2f; }}
    main {{ width: min(920px, calc(100% - 32px)); margin: 32px auto; }}
    .pass {{ overflow: hidden; border: 1px solid #d9d0c4; border-radius: 28px;
      background: #fff; box-shadow: 0 20px 60px rgba(18,42,47,.12); }}
    header {{ padding: 34px 38px 28px; background: #122a2f; color: #fff; }}
    .eyebrow {{ margin: 0 0 12px; color: #ff9b83; font-size: 13px;
      font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }}
    h1 {{ max-width: 660px; margin: 0; font-size: clamp(30px, 5vw, 50px);
      line-height: 1.05; }}
    .intro {{ max-width: 660px; margin: 16px 0 0; color: #dbe6e4;
      font-size: 18px; line-height: 1.55; }}
    .content {{ display: grid; grid-template-columns: minmax(240px, 360px) 1fr;
      gap: 36px; align-items: center; padding: 38px; }}
    .qr {{ width: 100%; border: 1px solid #e8e1d7; border-radius: 22px;
      background: #fff; padding: 16px; }}
    h2 {{ margin: 0 0 20px; font-size: 27px; }}
    ol {{ margin: 0; padding-left: 22px; line-height: 1.65; }}
    li + li {{ margin-top: 8px; }}
    .code-label {{ margin: 26px 0 8px; font-size: 13px; font-weight: 800;
      letter-spacing: .08em; text-transform: uppercase; }}
    .code {{ display: inline-block; padding: 12px 16px; border: 2px solid #ff6b4a;
      border-radius: 12px; font: 800 22px/1.2 ui-monospace, Consolas, monospace;
      letter-spacing: .08em; }}
    .topics {{ display: flex; flex-wrap: wrap; gap: 7px; margin-top: 22px; }}
    .topics span {{ padding: 7px 10px; border-radius: 999px; background: #e6f2ef;
      color: #174f4b; font-size: 13px; font-weight: 700; }}
    .meta {{ padding: 18px 38px 24px; border-top: 1px solid #eee7de;
      color: #5a6d70; font-size: 13px; line-height: 1.55; }}
    .meta strong {{ color: #122a2f; }}
    .url {{ overflow-wrap: anywhere; }}
    @media (max-width: 680px) {{
      main {{ width: min(100% - 20px, 920px); margin: 10px auto; }}
      header, .content, .meta {{ padding-left: 24px; padding-right: 24px; }}
      .content {{ grid-template-columns: 1fr; }}
      .qr {{ max-width: 330px; justify-self: center; }}
    }}
    @media print {{
      @page {{ size: A4; margin: 13mm; }}
      body {{ background: #fff; }}
      main {{ width: 100%; margin: 0; }}
      .pass {{ box-shadow: none; break-inside: avoid; }}
    }}
  </style>
</head>
<body>
  <main>
    <article class="pass">
      <header>
        <p class="eyebrow">NextCourse · Persönlicher Praxiszugang</p>
        <h1>Scannen. Praxis-Tipp öffnen. Direkt ausprobieren.</h1>
        <p class="intro">Dieser Zugang ist für <strong>{escaped_label}</strong> freigeschaltet.</p>
      </header>
      <div class="content">
        <img class="qr" src="qr-zugang.svg" width="900" height="900"
          alt="QR-Code zum persönlichen Praxis-Hub-Zugang">
        <section aria-labelledby="steps-title">
          <h2 id="steps-title">So geht’s</h2>
          <ol>
            <li>QR-Code mit der Handykamera scannen.</li>
            <li>Praxisimpuls auswählen und den Prompt kopieren.</li>
            <li>Im Prompt Studio direkt weiterarbeiten.</li>
          </ol>
          <p class="code-label">Alternativer Zugangscode</p>
          <div class="code">{escaped_code}</div>
          <div class="topics" aria-label="Freigeschaltete Themen">{topic_markup}</div>
        </section>
      </div>
      <footer class="meta">
        <div><strong>Gültig bis:</strong> {html.escape(expiry_text)}</div>
        <div><strong>Zugangs-ID:</strong> {escaped_id}</div>
        <div class="url"><strong>Direktlink:</strong> <a href="{escaped_url}">{escaped_url}</a></div>
        <div>Persönlichen Link und Code bitte vertraulich behandeln.</div>
      </footer>
    </article>
  </main>
</body>
</html>
"""


def render_credentials_text(
    *,
    label: str,
    pass_id: str,
    access_url: str,
    manual_code: str,
    expires_at: str,
    topics: Iterable[str],
) -> str:
    return (
        "NEXTCOURSE PRAXIS-HUB – VERTRAULICHE ZUGANGSDATEN\n"
        "=================================================\n\n"
        f"Bezeichnung: {label}\n"
        f"Zugangs-ID: {pass_id}\n"
        f"Ablauf (UTC): {expires_at}\n"
        f"Themen: {', '.join(topics)}\n\n"
        f"QR-/Direktlink: {access_url}\n"
        f"Manueller Code: {manual_code}\n\n"
        "Diese Datei enthält die einzigen lesbaren Zugangsdaten. "
        "Nicht in public, Git, E-Mail-Entwürfe oder Tickets kopieren.\n"
    )


def validate_pass_record(pass_id: str, value: Any) -> dict[str, Any]:
    if not PASS_ID_PATTERN.fullmatch(pass_id) or not isinstance(value, dict):
        raise PassError(f"Ungültiger bestehender Pass-Eintrag: {pass_id!r}.")
    expected = {
        "label",
        "token_hash",
        "code_hash",
        "active",
        "expires_at",
        "topics",
    }
    if set(value) != expected:
        raise PassError(
            f"Bestehender Eintrag {pass_id!r} hat ein unbekanntes oder unvollständiges Schema."
        )
    if not isinstance(value["label"], str) or not value["label"]:
        raise PassError(f"Ungültiges Label in Eintrag {pass_id!r}.")
    if not SHA256_PATTERN.fullmatch(str(value["token_hash"])):
        raise PassError(f"Ungültiger Token-Hash in Eintrag {pass_id!r}.")
    if not SHA256_PATTERN.fullmatch(str(value["code_hash"])):
        raise PassError(f"Ungültiger Code-Hash in Eintrag {pass_id!r}.")
    if not isinstance(value["active"], bool):
        raise PassError(f"Ungültiger Aktiv-Status in Eintrag {pass_id!r}.")
    try:
        expiry = datetime.fromisoformat(str(value["expires_at"]).replace("Z", "+00:00"))
    except ValueError as exc:
        raise PassError(f"Ungültiges Ablaufdatum in Eintrag {pass_id!r}.") from exc
    if expiry.tzinfo is None:
        raise PassError(f"Ablaufdatum ohne Zeitzone in Eintrag {pass_id!r}.")
    if (
        not isinstance(value["topics"], list)
        or not value["topics"]
        or any(topic not in ALLOWED_TOPICS for topic in value["topics"])
    ):
        raise PassError(f"Ungültige Themenliste in Eintrag {pass_id!r}.")
    return value


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"version": 1, "passes": {}}
    if path.is_symlink():
        raise PassError("Die lokale Pass-Konfiguration darf kein symbolischer Link sein.")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PassError(f"Lokale Pass-Konfiguration kann nicht gelesen werden: {path}") from exc
    if (
        not isinstance(payload, dict)
        or set(payload) != {"version", "passes"}
        or payload.get("version") != 1
        or not isinstance(payload.get("passes"), dict)
    ):
        raise PassError("Die lokale Pass-Konfiguration hat ein unbekanntes Schema.")
    for pass_id, record in payload["passes"].items():
        validate_pass_record(pass_id, record)
    return payload


def php_quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def render_php_config(state: dict[str, Any]) -> str:
    lines = [
        "<?php",
        "declare(strict_types=1);",
        "",
        "// Generated by scripts/create-praxis-pass.py.",
        "// Deploy outside the public web root; this file contains hashes only.",
        "return [",
        "    'version' => 1,",
        "    'passes' => [",
    ]
    for pass_id in sorted(state["passes"]):
        record = validate_pass_record(pass_id, state["passes"][pass_id])
        topics = ", ".join(php_quote(topic) for topic in record["topics"])
        lines.extend(
            [
                f"        {php_quote(pass_id)} => [",
                f"            'label' => {php_quote(record['label'])},",
                f"            'token_hash' => {php_quote(record['token_hash'])},",
                f"            'code_hash' => {php_quote(record['code_hash'])},",
                f"            'active' => {'true' if record['active'] else 'false'},",
                f"            'expires_at' => {php_quote(record['expires_at'])},",
                f"            'topics' => [{topics}],",
                "        ],",
            ]
        )
    lines.extend(["    ],", "];", ""])
    return "\n".join(lines)


def validate_existing_php_config(path: Path, state: dict[str, Any]) -> None:
    """Prevent silently overwriting config entries not represented in JSON."""
    if not path.exists():
        return
    if path.is_symlink():
        raise PassError("Die private PHP-Konfiguration darf kein symbolischer Link sein.")
    try:
        current = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise PassError(f"Private PHP-Konfiguration kann nicht gelesen werden: {path}") from exc
    if current != render_php_config(state):
        raise PassError(
            "Die bestehende PHP-Konfiguration weicht von passes.json ab. "
            "Sie wurde nicht überschrieben; gleiche beide Dateien zuerst kontrolliert ab."
        )


def atomic_write(path: Path, content: str, mode: int = 0o600) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.is_symlink():
        raise PassError(f"Zieldatei darf kein symbolischer Link sein: {path}")
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
        os.chmod(temporary_path, mode)
        os.replace(temporary_path, path)
        try:
            os.chmod(path, mode)
        except OSError:
            # Windows ACLs are inherited from the local profile. The important
            # boundary is keeping all raw credentials out of public and Git.
            pass
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def create_pass(args: argparse.Namespace) -> tuple[str, Path, Path]:
    label = normalize_label(args.label)
    topics = parse_topics(args.topics)
    expires_at = parse_expiry(args.expires)
    base_url = normalize_base_url(args.base_url)
    output_root = validate_output_root(args.output_root)
    pass_id = create_pass_id(label, args.pass_id)

    state_path = output_root / "passes.json"
    php_path = output_root / "deploy" / "praxis-passes.php"
    kit_path = output_root / "kits" / pass_id
    for internal_path in (state_path, php_path, kit_path):
        validate_internal_path(internal_path, output_root)
    state = load_state(state_path)
    validate_existing_php_config(php_path, state)

    already_exists = pass_id in state["passes"] or kit_path.exists()
    if already_exists and not args.replace:
        raise PassError(
            f"Pass-ID {pass_id!r} existiert bereits. Nutze eine andere ID oder --replace."
        )
    if kit_path.exists() and kit_path.is_symlink():
        raise PassError("Das bestehende Pass-Kit darf kein symbolischer Link sein.")

    token = make_token()
    manual_code, normalized_code = make_manual_code()
    access_url = f"{base_url}#{token}"
    record = {
        "label": label,
        "token_hash": sha256_hex(token),
        "code_hash": sha256_hex(normalized_code),
        "active": True,
        "expires_at": expires_at,
        "topics": topics,
    }
    state["passes"][pass_id] = record

    qr_svg = render_qr_svg(access_url)
    pass_kit = render_pass_kit(
        label=label,
        pass_id=pass_id,
        access_url=access_url,
        manual_code=manual_code,
        expires_at=expires_at,
        topics=topics,
    )
    credentials = render_credentials_text(
        label=label,
        pass_id=pass_id,
        access_url=access_url,
        manual_code=manual_code,
        expires_at=expires_at,
        topics=topics,
    )
    state_json = json.dumps(state, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    php_config = render_php_config(state)

    staging_root = output_root / f".staging-{secrets.token_hex(8)}"
    staged_kit = staging_root / pass_id
    staged_kit.mkdir(parents=True, exist_ok=False)
    try:
        atomic_write(staged_kit / "qr-zugang.svg", qr_svg)
        atomic_write(staged_kit / "pass-kit.html", pass_kit)
        atomic_write(staged_kit / "zugang.txt", credentials)

        kit_path.parent.mkdir(parents=True, exist_ok=True)
        if kit_path.exists():
            backup_path = output_root / f".backup-{pass_id}-{secrets.token_hex(4)}"
            kit_path.replace(backup_path)
            try:
                staged_kit.replace(kit_path)
            except Exception:
                backup_path.replace(kit_path)
                raise
            shutil.rmtree(backup_path)
        else:
            staged_kit.replace(kit_path)

        atomic_write(state_path, state_json)
        atomic_write(php_path, php_config)
    finally:
        if staging_root.exists():
            shutil.rmtree(staging_root)

    return pass_id, kit_path, php_path


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        pass_id, kit_path, php_path = create_pass(args)
    except PassError as exc:
        print(f"Fehler: {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"Dateifehler: {exc}", file=sys.stderr)
        return 3

    print(f"Praxis-Hub-Pass erstellt: {pass_id}")
    print(f"Lokales Pass-Kit: {kit_path}")
    print(f"Private PHP-Konfiguration: {php_path}")
    print("Zugangsdaten wurden nicht auf der Konsole ausgegeben.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
