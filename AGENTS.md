# The Last Pixels

**thelastpixels.com** — an open-source animal conservation site. Every animal
species shown as its population in pixels: one pixel = one living individual.
A northern white rhino is 2 pixels. A vaquita is ~10. That's the whole point.

- **Strictly non-profit**: donation links go straight to real NGOs (species
  funds, IUCN specialist groups, recovery programs). No ads, no monetization.
- **Open source + open data**: all datasets public, every number carries a
  `source`/`year`/`license`. Code MIT; data files keep their original license
  (see "licensing" below — you can't relicense CC-BY-NC data as MIT).
- **Honest numbers**: always show approx/year/provenance, and distinguish
  census (counted) vs estimate vs modeled.

## Data source research (2026-11)

Population by *region* is the hard part — published for maybe a few hundred
charismatic species; the rest get global estimate + range + trend only.

**Open / free:**

| Source | What it has | License |
| --- | --- | --- |
| Living Planet Index DB (livingplanetindex.org/data_portal) | 35k+ population time series with locations (lat/long, site), 1970–2022. Powers regional views + decline-over-time animation. Units vary — filter to counts. | free w/ data-use agreement; 2016 snapshot on figshare |
| Callaghan et al. 2021 (PNAS) via Zenodo | modeled global abundance for ~9,700 bird species (92% of birds) + uncertainty. Includes PIF per-state/province estimates for N. America | open download |
| GBIF | occurrence map tiles (embeddable), species API, images | free API |
| Wikidata | `population` (P1082) w/ point-in-time qualifiers, IUCN status (P141) on ~144k taxa, IUCN IDs (P627). Spotty but zero friction | CC0 |
| Map of Life | expert range polygons, all ~6,360 mammals | non-commercial |
| Our World in Data | clean CSVs (elephants, LPI trends…) | CC-BY |
| TetraDENSITY (github) | 54k density records, 3,712 tetrapod spp., per country | open |
| Natural Earth | country polygons (admin_0) + admin_1 states/provinces for later | public domain |

**Verified per-region numbers exist for**: tigers (India's census is
per-state: MP 785, Karnataka 563…), african elephants (AfESG database is
per-survey-zone, CC BY-NC-SA), N. American birds (PIF), kangaroos (per
Australian state), pandas (per province), plus single-region species
(Florida panther, Galápagos).

**Census-tier species** (1px=1 animal literally true): N. white rhino 2 ·
vaquita ~10 · kakapo ~325 · Javan rhino ~50 · Amur leopard ~120 · mountain
gorilla ~1,063 · CA condor ~560 · whooping crane ~550. Sources: IUCN
specialist-group reports, national censuses, recovery programs — cite each.

**Watch out**: IUCN Red List API v4 — free Bearer token, but CC-BY-NC +
rate limits + anti-scraping ToU (they may restrict "visualization projects").
Build-time harvest into own JSON only, never runtime. Conservation status +
trend can come from CC0 Wikidata instead. GADM admin boundaries: great
detail, annoying license — prefer Natural Earth or geoBoundaries (CC-BY).

## Licensing conclusions (asked "would this be bad faith?" — it's not)

- Facts aren't copyrightable; a cited population figure is a fact. What
  licenses restrict is mirroring the *database* (compilation + prose). Cite
  numbers; don't rehost catalogs. (EU sui-generis database rights — same
  conclusion.)
- NC licenses (CC-BY-NC, CC BY-NC-SA, LPI agreement) are written for exactly
  this: non-commercial conservation/education.
- Repo hygiene: code MIT; every data file marked with source + license; a
  `SOURCES.md` (the live licensing model — code MIT, our compilation CC-BY
  4.0, per-record `source`/`year` in the JSON, facts cite-only).
- Prefer citing the *primary* census paper where one exists — cleaner and
  more precise than citing IUCN citing it.
- Avoid doom-only framing: show recoveries too (saiga 48k→1.9M, condor
  27→560). "Pixels coming back" is the donation pitch — it works, here's who.

## NGOs & "good parks" (see RESEARCH.md for the full directory)

- Donation links go in a `donate[]` field per species; best targets per
  current 9 species are in RESEARCH.md §2. WCN (wildnet.org) is the default
  gateway — vetted partners by species, 100% of earmarked donations → field.
- "Good park" = three different certifiers depending on facility type:
  IUCN Green List (protected areas), GFAS (sanctuaries — no breeding, no
  trade, no public contact), AZA/EAZA (zoos). Never say "good" ourselves —
  cite the certifier.
- WDPA/Protected Planet API is free for non-commercial use → a "vetted
  parks" map layer is a real dataset, not editorial opinion.
- Red flags to never recommend near: predator contact/selfies, always-cubs,
  breeds+sanctuary claims, voluntourism cub-rearing (canned hunt pipeline).
