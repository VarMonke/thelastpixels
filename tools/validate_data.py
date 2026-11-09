#!/usr/bin/env python3
"""
Check the baked data files for the invariants the site relies on.

    python3 tools/validate_data.py

Reads data/grid.json, data/grid-440.json and data/species.json. Exits
non-zero if anything is off — this is the gate future "adopt a species"
PRs should pass before their numbers get rendered as pixels.

Stdlib only, no writes, ~1s.
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

IUCN_STATUSES = {"EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD"}
POP_KINDS = {"census", "estimate", "modeled"}
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

errors = []
warns = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warns.append(msg)


# --- grid files ---------------------------------------------------------------

def check_grid(path, strict_stamps=True):
    try:
        g = json.loads(path.read_text())
    except Exception as e:
        err(f"{path.name}: unreadable JSON ({e})")
        return
    for key in ("projection", "w", "h", "countries", "cells"):
        if key not in g:
            err(f"{path.name}: missing key {key!r}")
            return
    w, h, countries, cells = g["w"], g["h"], g["countries"], g["cells"]
    if not (isinstance(w, int) and isinstance(h, int) and w > 0 and h > 0):
        err(f"{path.name}: w/h must be positive ints, got {w}x{h}")
        return
    # two serialisations exist: flat [x, y, ci, x, y, ci, ...] (grid.json) and
    # list-of-triples [[x, y, ci], ...] (grid-440.json, for map.v1.js)
    if cells and isinstance(cells[0], list):
        flat = [v for c in cells for v in c]
    else:
        flat = cells
    if len(flat) % 3 or not all(isinstance(v, int) for v in flat[:300]):
        err(f"{path.name}: cells must be flat or nested [x, y, ci] int triples")
        return
    cells = flat
    if not countries or not all(
        c.get("code") and c.get("name") for c in countries
    ):
        err(f"{path.name}: countries must be non-empty {code, name} objects")

    n = len(cells) // 3  # dots — cells is flat triples, so 3 entries per dot
    seen = set()
    used = set()
    for i in range(n):
        x, y, ci = cells[i * 3], cells[i * 3 + 1], cells[i * 3 + 2]
        if not (0 <= x < w and 0 <= y < h):
            err(f"{path.name}: cell {i} at ({x},{y}) is outside {w}x{h}")
        if not (0 <= ci < len(countries)):
            err(f"{path.name}: cell {i} has country index {ci} (have {len(countries)})")
        if (x, y) in seen:
            err(f"{path.name}: duplicate cell at ({x},{y})")
        seen.add((x, y))
        used.add(ci)
        if len(errors) > 20:
            err(f"{path.name}: too many errors, giving up")
            return

    missing = [countries[ci]["name"] for ci in range(len(countries)) if ci not in used]
    if missing:
        # legacy grids baked before the stamp fix can't be regenerated —
        # warn there, fail on the live grid
        (err if strict_stamps else warn)(
            f"{path.name}: countries with no pixel: {missing}")
    print(f"{path.name}: ok — {n:,} dots on a {w}x{h} grid, "
          f"{len(countries)} countries, {len(countries) - len(missing)} have pixels")


# --- species file -------------------------------------------------------------

def check_species(path):
    try:
        species = json.loads(path.read_text())
    except Exception as e:
        err(f"{path.name}: unreadable JSON ({e})")
        return
    if not isinstance(species, list) or not species:
        err(f"{path.name}: must be a non-empty list")
        return

    slugs = set()
    this_year = date.today().year
    for i, s in enumerate(species):
        tag = f"{path.name}[{i}]"
        slug = s.get("slug")
        if not slug or not SLUG_RE.match(slug):
            err(f"{tag}: slug {slug!r} must be lowercase-dashed")
        elif slug in slugs:
            err(f"{tag}: duplicate slug {slug!r}")
        else:
            slugs.add(slug)

        for key in ("name", "scientific"):
            if not s.get(key):
                err(f"{tag}: missing {key!r}")

        if s.get("status") not in IUCN_STATUSES:
            err(f"{tag}: status {s.get('status')!r} not an IUCN code")

        for key in ("trend", "note"):
            if key in s and not isinstance(s[key], str):
                err(f"{tag}: {key} must be a string")

        if "regions" in s and (
            not isinstance(s["regions"], list)
            or not all(isinstance(r, str) and r for r in s["regions"])
        ):
            err(f"{tag}: regions must be a list of non-empty strings")

        p = s.get("population")
        if not isinstance(p, dict):
            err(f"{tag}: missing population object")
            continue
        for key in ("value", "kind", "year", "source"):
            if key not in p:
                err(f"{tag}: population missing {key!r}")
        if not isinstance(p.get("value"), int) or p["value"] < 0:
            err(f"{tag}: population.value must be an int >= 0")
        if p.get("kind") not in POP_KINDS:
            err(f"{tag}: population.kind {p.get('kind')!r} — want census|estimate|modeled")
        if not (isinstance(p.get("year"), int) and 1900 <= p["year"] <= this_year + 1):
            err(f"{tag}: population.year {p.get('year')!r} out of range")
        if not p.get("source"):
            err(f"{tag}: population.source missing")
        for bound in ("low", "high"):
            if bound in p:
                v = p[bound]
                if not (isinstance(v, int) and v >= 0):
                    err(f"{tag}: population.{bound} must be an int >= 0")
        if "low" in p and "high" in p and not (p["low"] <= p["value"] <= p["high"]):
            err(f"{tag}: value {p['value']} outside [{p['low']}, {p['high']}]")
        if p.get("year", 0) < this_year - 5:
            warn(f"{tag} ({slug}): population year {p['year']} is >5 years old — age-flag it in the UI")

        if "donate" in s:
            ds = s["donate"]
            if not isinstance(ds, list) or not ds:
                err(f"{tag}: donate must be a non-empty list")
            else:
                for d in ds:
                    if not d.get("name") or not d.get("url", "").startswith(("http://", "https://")):
                        err(f"{tag}: donate entry {d!r} needs name + http(s) url")

        for key in s:
            if key not in ("slug", "name", "scientific", "status", "trend",
                           "regions", "population", "note", "donate"):
                warn(f"{tag}: unknown field {key!r} — typo?")

    print(f"{path.name}: ok — {len(species)} species, {len(slugs)} unique slugs")


def main():
    check_grid(DATA / "grid.json")
    check_grid(DATA / "grid-440.json", strict_stamps=False)
    check_species(DATA / "species.json")

    for w in warns:
        print(f"warn: {w}")
    if errors:
        for e in errors:
            print(f"FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    print("all data checks passed")


if __name__ == "__main__":
    main()