# Contributing — adopt a species

The site is a dataset with a renderer on top. `data/species.json` is the whole
product: one record per species, every number cited. Pick a species you care
about and send a PR. We review the *source*, not the prose.

Before anything else:

```
python3 tools/validate_data.py
```

A PR that fails this gate doesn't get reviewed. It takes ~1s and needs nothing
but Python 3.

## What a record looks like

```json
{
  "slug": "kakapo",
  "name": "Kākāpō",
  "scientific": "Strigops habroptilus",
  "status": "CR",
  "trend": "slowly increasing",
  "regions": ["Codfish, Anchor & Little Barrier islands, NZ"],
  "population": {
    "value": 325,
    "kind": "census",
    "year": 2026,
    "source": "NZ DOC Kākāpō Recovery"
  },
  "note": "Every individual has a name, a transmitter and a dossier.",
  "donate": [
    { "name": "NZ DOC Kākāpō Recovery", "url": "https://…", "note": "…" }
  ]
}
```

## The fields that matter

- **`population.value`** — one integer. This becomes literal pixels on the
  page, so it must be the best honest number you can find, not the scariest
  or the most flattering.
- **`population.kind`** — `census` (actually counted, e.g. kākāpō 325),
  `estimate` (surveyed and extrapolated, e.g. elephant 415,428), or `modeled`
  (derived from density × range models, e.g. most bird abundances).
- **`population.year`** — the year the number is from, not the year you read
  it. Estimates older than ~5 years get age-flagged on the page automatically.
- **`population.source`** — cite the *primary* source where one exists: the
  census report, the specialist-group assessment, the national survey — not
  "IUCN" citing it, and never Wikipedia's uncited infobox number.
- **`population.low` / `high`** — optional, use when the source gives a range
  or when counts are genuinely disputed. If officials say 82 and an NGO's
  investigation says maybe 50, the range *is* the story — see `javan-rhino`.
- **`status`** — IUCN code: `EX EW CR EN VU NT LC DD`.
- **`trend`** — free text, one or two words: "declining", "increasing",
  "stable", "recovering", "uncertain".
- **`note`** — one line of context a number can't carry. Keep it factual;
  the pixels do the emoting.
- **`regions`** — where they live, short.
- **`donate`** — see below.

Extinct species are welcome and wanted: `status: "EX"`, `value: 0`. The page
renders an empty frame instead of a pixel field — that's the point.

## What counts as a good citation

In rough order of preference:

1. The primary census/survey paper or report (a camera-trap census, an aerial
   count, a recovery-programme tally).
2. An IUCN SSC specialist-group report (AfESG, cat specialists, crane groups).
3. A national census or official monitoring programme.
4. A peer-reviewed modeled estimate (say so via `kind: "modeled"`).
5. IUCN Red List assessment itself — fine as a fallback, always with `year`.

A number you can't source doesn't go in. A stale number with a real source
beats a fresh number with none — staleness is displayable, unverifiability
isn't.

## The `donate[]` rules

Donation links go straight to the NGO — nothing ever flows through this site.
Two links per species, tops. An org makes the list when it is:

1. Doing **species-specific or place-specific work** — not just awareness.
2. Publishing activities + finances (annual report, 990, charity register).
3. Recognized by experts — cited in IUCN assessments, recovery plans,
   research.
4. Reachable by a **direct donation route** — a link to the org itself, not a
   middleman.
5. Bonus: pass-through models where 100% of earmarked gifts reach the field
   (WCN partners, WildCats).

No US watchdog rating is not a red flag — most of the best field orgs are
non-US and unrated. `RESEARCH.md` §2–3 is the vetted shortlist; check there
before improvising a link. When in doubt, Wildlife Conservation Network
(wildnet.org) is the default gateway.

Every donate URL gets `?utm_source=thelastpixels` appended (preserving any
existing params) so NGOs can see where their visitors came from.

## Things this site will never take

- Sponsored placements, affiliate links, or "featured" orgs.
- Numbers without `source` and `year`.
- Copy-pasted prose. Facts aren't copyrightable — cite the number, write the
  note yourself. Don't mirror anyone's database. See `SOURCES.md` for the
  licensing model.

## Code changes

Vanilla JS, no dependencies, no build step. Keep it readable enough to port to
TypeScript later — the owner is coming from Python/C++/Rust, not frontend.
Test changes with `python3 -m http.server` and open the page.
