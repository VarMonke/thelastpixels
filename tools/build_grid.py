#!/usr/bin/env python3
"""
Bake the Natural Earth country polygons into a dot-grid for the map.

    python3 tools/build_grid.py

Reads  data/ne_50m_admin_0_countries.geojson  (Natural Earth 50m, public domain)
Writes data/grid.json

The grid: the world projected with Winkel tripel (the NatGeo compromise
projection — the familiar silhouette), rasterised into cells. Each land cell
becomes x, y, country_index — one dot on the map. Stdlib only, ~1s.
"""

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "ne_50m_admin_0_countries.geojson"
OUT = ROOT / "data" / "grid.json"

COLS = 500  # grid width in cells; height follows from the projection's aspect


# --- Winkel tripel projection: the mean of equirectangular and Aitoff --------
PHI1 = math.acos(2 / math.pi)  # ≈40.53°, the standard parallel


def project(lon: float, lat: float) -> tuple[float, float]:
    lam, phi = math.radians(lon), math.radians(lat)
    alpha = math.acos(max(-1.0, min(1.0, math.cos(phi) * math.cos(lam / 2))))
    sinc = math.sin(alpha) / alpha if alpha else 1.0
    x = 0.5 * (lam * math.cos(PHI1) + 2 * math.cos(phi) * math.sin(lam / 2) / sinc)
    y = 0.5 * (phi + math.sin(phi) / sinc)
    return x, y


def polygons(geom):
    """A Polygon is one list of rings; a MultiPolygon is several. Rings carry
    holes too — the even-odd fill below handles exterior + holes together."""
    if geom["type"] == "Polygon":
        yield geom["coordinates"]
    elif geom["type"] == "MultiPolygon":
        yield from geom["coordinates"]


def main():
    features = json.load(open(SRC))["features"]

    countries = []  # index into this list = the "ci" stored in each cell
    polys = []  # (ci, rings projected) per polygon part
    centroids = {}  # ci -> fallback point, for countries too small for a cell
    x0 = y0 = math.inf
    x1 = y1 = -math.inf

    for f in features:
        p = f["properties"]
        code = p.get("ISO_A3_EH")
        if not code or code == "-99":
            code = p.get("ADM0_A3") or p.get("ISO_A3") or "?"
        ci = len(countries)
        countries.append({"code": code, "name": p.get("NAME_EN") or p.get("NAME")})

        biggest_ring = []
        for rings in polygons(f["geometry"]):
            proj = [[project(lon, lat) for lon, lat in ring] for ring in rings]
            for ring in proj:
                for x, y in ring:
                    x0, x1 = min(x0, x), max(x1, x)
                    y0, y1 = min(y0, y), max(y1, y)
                if len(ring) > len(biggest_ring):
                    biggest_ring = ring
            polys.append((ci, proj))
        if biggest_ring:
            cx = sum(x for x, _ in biggest_ring) / len(biggest_ring)
            cy = sum(y for _, y in biggest_ring) / len(biggest_ring)
            centroids[ci] = (cx, cy)

    cell = (x1 - x0) / COLS
    rows = math.ceil((y1 - y0) / cell)
    span_x = x1 - x0
    grid = [-1] * (COLS * rows)

    # Even-odd scanline fill: for each row of cells, find where polygon edges
    # cross the row's centre-line, then fill between each pair of crossings.
    for ci, rings in polys:
        ys = [y for ring in rings for _, y in ring]
        r0 = max(0, int((y1 - max(ys)) / cell) - 1)  # row 0 is the top (max y)
        r1 = min(rows - 1, int((y1 - min(ys)) / cell) + 1)
        for r in range(r0, r1 + 1):
            y = y1 - (r + 0.5) * cell  # projected y at this row's cell centres
            xs = []
            for ring in rings:
                for (ax, ay), (bx, by) in zip(ring, ring[1:]):
                    if abs(bx - ax) > span_x / 2:
                        continue  # antimeridian artefact, not a real edge
                    if (ay <= y < by) or (by <= y < ay):
                        xs.append(ax + (y - ay) * (bx - ax) / (by - ay))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                c0 = math.ceil((a - x0) / cell - 0.5)
                c1 = math.floor((b - x0) / cell - 0.5)
                for c in range(max(0, c0), min(COLS - 1, c1) + 1):
                    if grid[r * COLS + c] < 0:
                        grid[r * COLS + c] = ci

    # Any country that fell between the cracks (Singapore, Vatican, small
    # islands) still gets a pixel, stamped at its centroid. Stamps may take a
    # filled cell (the dot belongs at the country's position — the filled
    # country has thousands of others), but never another stamp's cell (two
    # micro-states can share an island — Saint Martin/Sint Maarten) and never
    # a filled cell that is its owner's LAST pixel (Northern Cyprus's stamp
    # once erased Cyprus's only cell this way).
    present = set(grid)
    count = [0] * len(countries)
    for v in grid:
        if v >= 0:
            count[v] += 1
    taken = set()  # cells claimed by stamps
    stamped = []
    for ci, (cx, cy) in centroids.items():
        if ci in present:
            continue
        c, r = int((cx - x0) / cell), int((y1 - cy) / cell)
        for rr in range(12):
            ring = [
                (c + dc, r + dr)
                for dc in range(-rr, rr + 1)
                for dr in range(-rr, rr + 1)
                if max(abs(dc), abs(dr)) == rr
            ]
            free = [
                (cc, ry) for cc, ry in ring
                if 0 <= cc < COLS
                and 0 <= ry < rows
                and ry * COLS + cc not in taken
                and (grid[ry * COLS + cc] < 0 or count[grid[ry * COLS + cc]] > 1)
            ]
            if free:
                c, r = free[0]
                break
        if 0 <= c < COLS and 0 <= r < rows:
            old = grid[r * COLS + c]
            if old >= 0:
                count[old] -= 1
            grid[r * COLS + c] = ci
            taken.add(r * COLS + c)
            stamped.append(countries[ci]["name"])

    cells = [v for i, ci in enumerate(grid) if ci >= 0 for v in (i % COLS, i // COLS, ci)]
    OUT.write_text(
        json.dumps(
            {
                "projection": "winkel-tripel",
                "w": COLS,
                "h": rows,
                "countries": countries,
                "cells": cells,
            },
            separators=(",", ":"),
        )
    )
    print(
        f"{len(cells) // 3:,} dots on a {COLS}x{rows} grid "
        f"({len(cells):,} flat entries), "
        f"{len(countries)} countries -> {OUT.relative_to(ROOT)} "
        f"({OUT.stat().st_size / 1024:.0f} KB)"
    )
    if stamped:
        print(f"stamped {len(stamped)} sub-cell countries: {', '.join(sorted(stamped))}")


if __name__ == "__main__":
    main()
