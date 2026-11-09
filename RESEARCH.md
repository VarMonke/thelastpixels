# RESEARCH.md — NGOs, vetting, and the "good parks" problem

Everything found digging on donation targets and how to tell apart places that
actually care for animals from places that exploit them. Written so each entry
can later drop into `species.json` as a `donate[]` field or a parks layer.

Last verified: 2025-ish (ratings change — re-check before publishing any page).

---

## 1. Vetting infrastructure (don't build our own — cite theirs)

| Watchdog | Covers | Notes |
|---|---|---|
| Charity Navigator | US 501(c)(3) only, ~245k rated | Star rating, paid GraphQL API ($25/mo+) — overkill; just link profiles |
| CharityWatch | US charities | Letter grades (A+..F), stricter than CN |
| Candid/GuideStar | US | Transparency seals (Platinum etc.) |
| Give.org / BBB | US | Accreditation |
| UK Charity Commission | UK/Wales | Registered charity lookup — for SCA, DSWF, ZSL etc. |

Non-US field orgs often have **no US rating** — that's a coverage gap, not a red
flag. Our listing criteria should say so, or we'd exclude the best on-the-ground
orgs (Phoenix Fund, NRT, Ewaso Lions...).

### Our listing criteria (adapted from extinctioncheck.org, which does this well)
1. Species-specific or place-specific work — not just awareness campaigns
2. Publishes activities + finances (annual report, 990, charity register)
3. Recognized by experts — cited in IUCN assessments/recovery plans/research
4. A direct donation route to the org itself (not a middleman)
5. Bonus: pass-through models where 100% of earmarked donations reach the field

We link out; we don't score. Curate + point, same as the species data.

---

## 2. Donation targets for our current species

| Species | Best-fit NGOs (in rough priority order) | Notes |
|---|---|---|
| Northern white rhino | **Ol Pejeta Conservancy** (they literally house Najin & Fatu) · Save the Rhino Intl · International Rhino Foundation · BioRescue (the IVF program) | Ol Pejeta is the most direct: donor funds the rangers around the actual 2 animals |
| Vaquita | **Sea Shepherd** (on-water net removal, only constant presence) · Viva Vaquita / CETOS Research | CIRVA does the surveys (science body, not a donation target). SSC also runs the actual census surveys — double duty |
| Kākāpō | **NZ DOC Kākāpō Recovery** (official program, run with Ngāi Tahu) · World Parrot Trust · Re:wild | Government program that takes donations — unusual and charming |
| Amur leopard | **WildCats Conservation Alliance** (ZSL+Dreamworld, 100% of donations → field) · Phoenix Fund (Russian anti-poaching) · WCS | WildCats claims their projects protect 93% of remaining wild Amur leopards |
| Mountain gorilla | **Dian Fossey Gorilla Fund** (A- CharityWatch, tracker teams daily) · Conservation Through Public Health · Gorilla Doctors | CTPH/Gorilla Doctors are the vets keeping individuals alive |
| California condor | **Ventana Wildlife Society** (central CA releases, lead-poisoning work) · Peregrine Fund (breeding/release) · **Yurok Tribe condor program** (indigenous-led reintroduction — great story) | Lead ammo is the #1 preventable killer — Ventana runs the outreach program on it |
| Tiger | **Panthera** · WCS Tigers · WildCats Conservation Alliance · Wildlife Trust of India | TX2 goal (double wild tigers) was actually met-ish — a comeback story to feature |
| African savanna elephant | **Save the Elephants** (WCN partner, Iain Douglas-Hamilton's org) · Sheldrick Wildlife Trust · Space for Giants (human-elephant conflict) · Tsavo Trust | For scale/habitat → African Parks; for orphans → Sheldrick |
| Saiga | **Saiga Conservation Alliance** (UK reg charity, THE saiga org; US donors route via WCN) · Altyn Dala Conservation Initiative (the actual steppe restoration — Frankfurt Zoological Society + ACBK + partners) | 48k→1.9M comeback was largely Kazakhstan aerial protection + Altyn Dala |

---

## 3. The meta-orgs (defaults when no specialist exists)

- **Wildlife Conservation Network (wildnet.org)** — the best default gateway.
  Vetted field partners organized BY SPECIES (Save the Elephants, Ewaso Lions,
  Painted Dog Conservation, Andean Cat Alliance, Saiga...), and 100% of
  species-designated donations reach the field. Their partner list is basically
  our `donate[]` field pre-made. 4-star CN.
- **Panthera** — all wild cats, overhead separately funded → 100% to field.
- **WWF** — 4-star CN but giant; prefer the specialists.
- **WCS** — A-rated CharityWatch, ~88% to programs, runs actual field projects.
- **Fauna & Flora** — world's oldest intl conservation NGO, strong local-partner model.
- **Re:wild** — lost-species niche, backs kākāpō recovery among others.
- **ZSL** — London-based, runs WildCats alliance, EDGE program for weird+endangered.
- **extinctioncheck.org** — a site doing nearly our exact donate-per-species
  concept, open about criteria, takes no payment for listings. Bookmark: both
  validation and a curation source.

---

## 4. "Which parks/sanctuaries are actually good" — the real taxonomy

The user's question conflates three different facility types. They have
three different certifiers:

### A. Protected areas (national parks, reserves, community conservancies)

**IUCN Green List** — the certification for "good parks." A protected area earns
listing only after independent evaluation across 4 components: good governance
(do locals get a say), sound design, effective management, and *successful
conservation results*. Re-evaluated every 5 years. ~114 listings / 240+ sites /
23 countries (late 2026). It's voluntary — bad parks simply never apply — but
that's fine: Green List membership is a positive signal, not an exhaustive set.
Data: sites appear on protectedplanet.net; WDPA API is free for non-commercial
use (bearer token, GeoJSON available) → **a future "vetted parks" map layer is
a real dataset, not editorial opinion.**

**Management models that reliably produce good parks:**
- **Community conservancies** — wildlife pays locals → locals protect it.
  - Namibia CBNRM/NACSO: ~86 communal conservancies, ~20% of the country.
    Gov now translocates black rhinos *into* conservancies because survival
    is better there. That stat is the pitch.
  - Kenya NRT (Northern Rangelands Trust): 45-47 member conservancies, ~15M
    acres, elephant poaching down ~35-40% since 2012, protects the hirola.
- **African Parks Network** — takes over failed state parks under government
  mandate (20+ parks, 11+ countries). Turnarounds: Zakouma, Akagera, Majete,
  Pendjari. Honest caveat: criticized for militarized anti-poaching and
  indigenous-rights issues in some parks (Odzala allegations) — the site
  should present certifiers as signals, not endorsements.
- **Buy-land-donate-to-state (Tompkins model)** — Rewilding Argentina/Iberá:
  bought estancia land, donated it, congress created Iberá National Park;
  jaguars back after ~70 years absent (50+ wild as of 2026), giant otters
  reintroduced continent-wide. Route of Parks, Chile. The single best
  "money → outcome" story in conservation.
- **Strong private reserves**: Gorongosa (Mozambique post-war recovery, Carr
  Foundation), Lewa (Kenya, rhino stronghold, UNESCO), Ol Pejeta (houses the
  last 2 NWR + largest E.African black rhino pop), Mara conservancies
  (Naboisho etc. — lease model paying Maasai landowners directly).

### B. Sanctuaries / rescue / rehab (lifetime care)

**GFAS — Global Federation of Animal Sanctuaries.** "Sanctuary" is an
unregulated word; GFAS is the certifier. Their bar is essentially a red-flag
filter: non-profit · no breeding in lifetime care · no buying/selling/trading
animals · **no public contact with wildlife** · guided tours only · ethical
fundraising. Two tiers (Verified / Accredited). ~200+ facilities globally.
If a "sanctuary" offers cub cuddles it fails by definition.

### C. Zoos & aquariums

**AZA** (US) / **EAZA** (Europe) accreditation — re-inspected every 5 years,
covers welfare/vet care/conservation contribution. Separates real zoos from
roadside attractions. USDA license ≠ endorsement — it's a floor, not a ceiling.

---

## 5. The red-flag taxonomy (for a "how to spot" page)

Sourced mainly from Blood Lions / FOUR PAWS / RSPCA / GFAS standards:

- **Touch/hold/feed/selfies with predators or cubs** → instant fail.
- **Always has cubs** → breeding mill. Ask where the adults go.
  (The SA pipeline is grim and documented: cub petting → lion walking →
  canned hunt → bone trade. ~200 facilities, 6-8k+ lions "bred for the bullet."
  SA government adopted a recommendation to end the industry 2021; not yet
  fully legislated.)
- **Breeds AND calls itself a sanctuary** → contradiction by definition.
- **"Voluntourism"** — paying $3k to bottle-feed "orphaned" cubs → likely
  grooming animals for the hunting pipeline (some facilities run 30-35
  paying volunteers/month → $100k+/mo).
- **Elephant riding/performances** → requires "crush" training to produce.
- **Drugged animals, photo ops, tricks** → welfare red flags.
- **Constant baby animals of non-native species** (tigers in Africa) → trading.
- Unguided contact, no privacy/retreat space for animals, bare enclosures.

Rule of thumb for the site: *money should flow to places where animals'
well-being doesn't depend on performing for visitors.*

---

## 6. Data notes for future build

- **WDPA / Protected Planet API** (api.protectedplanet.net): free token,
  non-commercial use allowed — we're fine. ~262k protected areas, GeoJSON,
  governance type + management authority fields. Green List sites are
  identifiable. → `data/parks.json` layer is feasible.
- **GFAS accredited facility list** — published on sanctuaryfederation.org.
- **IUCN Green List sites** — listed per-press-release; protectedplanet shows
  status. Scrape-at-build-time friendly (small list, cite it).
- Charity Navigator ratings are US-only and change → store
  `{name, url, scope, rating, rating_source, checked}` per NGO and re-verify
  periodically rather than hardcoding praise into pages.
