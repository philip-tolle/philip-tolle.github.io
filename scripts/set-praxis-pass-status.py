#!/usr/bin/env python3
"""Activate or deactivate an existing local Praxis-Hub pass.

This command changes only the ``active`` flag in the canonical local JSON and
its generated private PHP config. It never reads or prints the raw token or
manual code stored in a pass kit.

Examples:
    python scripts/set-praxis-pass-status.py --pass-id pilot-nord --inactive
    python scripts/set-praxis-pass-status.py --pass-id pilot-nord --active
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from types import ModuleType


SCRIPT_DIR = Path(__file__).resolve().parent
GENERATOR_PATH = SCRIPT_DIR / "create-praxis-pass.py"


def load_pass_module() -> ModuleType:
    """Load the generator module so both commands enforce one schema."""
    specification = importlib.util.spec_from_file_location(
        "nextcourse_praxis_pass_generator", GENERATOR_PATH
    )
    if specification is None or specification.loader is None:
        raise SystemExit(f"Gemeinsame Pass-Funktionen fehlen: {GENERATOR_PATH}")
    module = importlib.util.module_from_spec(specification)
    sys.modules[specification.name] = module
    specification.loader.exec_module(module)
    return module


PASS = load_pass_module()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Sperrt oder reaktiviert einen bestehenden Praxis-Hub-Pass, ohne "
            "neue Zugangsdaten zu erzeugen."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--pass-id",
        required=True,
        help="Technische ID des vorhandenen Passes.",
    )
    status = parser.add_mutually_exclusive_group(required=True)
    status.add_argument(
        "--inactive",
        action="store_true",
        help="Sperrt den Zugang sofort.",
    )
    status.add_argument(
        "--active",
        action="store_true",
        help="Reaktiviert den Zugang; sein Ablaufdatum gilt weiterhin.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=PASS.DEFAULT_OUTPUT_ROOT,
        help="Lokaler Pass-Stamm mit passes.json und deploy/praxis-passes.php.",
    )
    return parser.parse_args(argv)


def synchronize_config_files(
    *,
    state_path: Path,
    php_path: Path,
    state: dict[str, object],
    previous_state_json: str,
) -> None:
    """Atomically replace each config and roll JSON back if PHP writing fails."""
    next_state_json = json.dumps(
        state, ensure_ascii=False, indent=2, sort_keys=True
    ) + "\n"
    next_php_config = PASS.render_php_config(state)

    PASS.atomic_write(state_path, next_state_json)
    try:
        PASS.atomic_write(php_path, next_php_config)
    except BaseException:
        # Keep the canonical JSON/PHP pair in its validated previous state if
        # the second atomic replacement fails for any reason.
        try:
            PASS.atomic_write(state_path, previous_state_json)
        except BaseException as rollback_error:
            raise PASS.PassError(
                "PHP-Aktualisierung und anschließender JSON-Rollback sind "
                "fehlgeschlagen. Die lokalen Konfigurationsdateien müssen "
                "vor dem nächsten Einsatz manuell abgeglichen werden."
            ) from rollback_error
        raise


def set_status(args: argparse.Namespace) -> tuple[str, bool, bool]:
    pass_id = args.pass_id.strip().lower()
    if not PASS.PASS_ID_PATTERN.fullmatch(pass_id):
        raise PASS.PassError(
            "--pass-id muss 3–64 Zeichen aus a-z, 0-9 und Bindestrichen enthalten."
        )

    output_root = PASS.validate_output_root(args.output_root)
    state_path = output_root / "passes.json"
    php_path = output_root / "deploy" / "praxis-passes.php"
    for internal_path in (state_path, php_path):
        PASS.validate_internal_path(internal_path, output_root)

    if not state_path.exists():
        raise PASS.PassError(
            f"Keine lokale Pass-Konfiguration gefunden: {state_path}"
        )
    state = PASS.load_state(state_path)
    PASS.validate_existing_php_config(php_path, state)
    if pass_id not in state["passes"]:
        raise PASS.PassError(f"Unbekannte Pass-ID: {pass_id}")

    previous_state_json = state_path.read_text(encoding="utf-8")
    desired_active = bool(args.active)
    previous_active = bool(state["passes"][pass_id]["active"])
    if previous_active == desired_active:
        return pass_id, desired_active, False

    state["passes"][pass_id]["active"] = desired_active
    synchronize_config_files(
        state_path=state_path,
        php_path=php_path,
        state=state,
        previous_state_json=previous_state_json,
    )
    return pass_id, desired_active, True


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        pass_id, active, changed = set_status(args)
    except PASS.PassError as exc:
        print(f"Fehler: {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"Dateifehler: {exc}", file=sys.stderr)
        return 3

    status = "aktiv" if active else "gesperrt"
    if changed:
        print(f"Praxis-Hub-Pass {pass_id}: {status}.")
        print("passes.json und private PHP-Konfiguration wurden synchronisiert.")
    else:
        print(f"Praxis-Hub-Pass {pass_id} war bereits {status}; keine Änderung nötig.")
    print("Es wurden keine Zugangsdaten gelesen oder ausgegeben.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
