# SOURCES.md — where every number comes from, and what license rides along

Two layers, kept deliberately separate:

- **Code** (index.html, animal.*, map.js, tools/): **MIT** — see LICENSE.
- **Data** (data/*.json, this project's curation): **CC-BY 4.0** for our
  compilation — the selection, arrangement, notes and record structure are
  ours. The population figures inside are *facts*, and facts aren't
  copyrightable. Each record carries `source` + `year` for provenance
  because honesty is the brand, not because a license forces it.

data/ne_50m_admin_0_countries.geojson is Natural Earth — **public domain**.

## Rules for adding data (what keeps this clean)

1. **Cite the number, never mirror the database.** A population figure is a
   fact — quote it with source + year. Tables, bulk extractions and dataset
   *structure* are protectable; don't copy those. Want more than a bounded
   handful of values from one licensed source? Stop and check its license.
2. **Prefer CC0 / public-domain sources** (Wikidata, Natural Earth, US
   federal agencies) whenever a number exists in two places.
3. **NC-licensed sources are cite-only.** Facts fine; prose, tables, images
   and bulk extraction never — CC 4.0 licenses EU database rights, so
   mirroring a database is legally real, not just rude. And we're
   non-commercial, but contributors can't promise that for every future
   reuse of our files, so nothing NC-derived may ride along.
4. **SA stays out of our CC-BY files.** ShareAlike is a one-way ratchet — a
   substantial derivative must carry the same license, and one SA source
   can drag the whole file under it.
5. **No NC creative works anywhere on the site.** Facts are free; photos,
   prose and figures are not — regardless of how small the excerpt is.
6. **Every record needs source + year; every data file needs its license
   line here.** Old numbers age-flag in the UI (>5y), they don't get
   silently refreshed.

## Source ledger (current 9 records)

| Species | Figure source | License class | What we took |
| --- | --- | --- | --- |
| northern-white-rhino | Save the Rhino / IUCN SSC AfRSG | IUCN: CC BY-NC | the number 2 — a census fact |
| vaquita | IUCN SSC / CIRVA acoustic survey | IUCN: CC BY-NC; CIRVA report © | ~10 estimate |
| kakapo | NZ DOC Kākāpō Recovery | NZ Crown ©; figure is a census fact | 325 census |
| amur-leopard | Land of the Leopard NP camera-trap census | census paper © | ~120 estimate |
| mountain-gorilla | IUCN SSC / Gorilla census | IUCN: CC BY-NC | 1,063 census |
| california-condor | USFWS California Condor Recovery | US federal work — public domain | 561 census |
| tiger | Global Tiger Forum / national censuses | GTF report © | 4,500 estimate + range |
| african-savanna-elephant | African Elephant Status Report / AfESG | CC BY-NC-SA | 415,428 estimate + range |
| saiga | Kazakhstan aerial survey / IUCN | IUCN: CC BY-NC | 1,923,000 estimate |

The elephant record is the one to watch: AfESG publishes per-survey-zone
data under BY-NC-SA. The continental total is a cite-able fact, but if we
ever build a per-region elephant layer from their zone table, that becomes
a substantial derivative — license check required *before* the data PR, not
after.

## Watch-outs (already baked into how we source)

- **IUCN Red List** — CC BY-NC plus a ToU that bans reposting
  original-format data and can revoke API tokens for non-conservation
  visualization work. Build-time citations of individual numbers only;
  never a runtime dependency, never a mirrored table.
- **"Commercial use" under IUCN ToU is stricter than CC's NC** — it covers
  use that merely *informs* a commercial entity. Another reason to prefer
  the primary census paper over IUCN relaying it.
- **Donate links don't make us commercial** — money goes straight to the
  NGOs and never touches this site (see DIRECTION.md), and the legal test
  is on the use, not surrounding infrastructure (*Great Minds v. FedEx*,
  2d Cir. 2018). Still: keep NC-derived material out of pages with donate
  buttons as a matter of hygiene, not law.
