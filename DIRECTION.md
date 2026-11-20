# DIRECTION.md — how the whole thing lands

What this site is, who it's for, and how the pieces fit. Written 2025-12,
after the map + first species page prototypes existed and the NGO research
(RESEARCH.md) was done.

---

## The one-sentence version

**thelastpixels.com makes extinction numbers physically felt — one pixel per
living animal — then turns the feeling into a donation routed to the people
actually standing between that species and zero.**

The pixel field is the hook. The donation links are the payload.
Everything else is connective tissue.

## Why it lands (the psychology)

- Numbers don't move people. 415,428 is trivia; **2** pixels you can see both
  of at once is a gut punch. The site trades precision for *felt scale* —
  which is the thing the number was trying to convey anyway.
- Fixed visual unit across all pages means browsing between species IS the
  comparison. Vaquita's page is nearly empty. Saiga's page scrolls for a
  long time. The difference *is* the conservation story.
- The "scroll length = abundance" mechanic quietly reframes hope: recovery
  stories get **longer** pages. Saiga's comeback (48k → 1.9M) literally
  fills your screen. The doom-and-gloom genre never rewards you; this one does.

## Who it's for

| Audience | What they get |
|---|---|
| Someone who saw a sad animal post | The visceral number + a vetted "donate to the people who fix this" link. 60-second journey, feel→act |
| Teachers / students | Legible scale comparisons between species, honest uncertainty labeling, citable sources — the "show the class" page |
| Tourists / volunteers | The red-flag guide + certifier links before booking a "sanctuary" that sells cub selfies (see RESEARCH.md §5 — that pipeline is grim and people genuinely don't know) |
| Conservation-curious donors | A pre-filtered map of "who's actually good" without doing the watchdog research themselves |
| The open-source crowd | A data project they can contribute to with a text editor and a citation |

## The structural insight: curation doesn't scale, so make it a commons

There are ~170k IUCN-assessed species. Hand-curating them is a dead end —
**unless curation is the community feature.**

That's the actual clever bit of this project, and it's also the answer to the
"community involvement" angle: the site should be an **open data repo with a
rendering layer on top**, not a website with some JSON.

- `data/species.json` grows via PRs: "adopt a species" — you add a record,
  with source+year+citation required, maintainer reviews the *source* not
  the prose
- Every record has provenance fields already — that's what makes
  community submissions *safe* (a bad number is traceable, not trusted)
- CONTRIBUTING.md becomes the real product: how to source a population
  number, what counts as a good citation, how to mark uncertainty
- People show up for the weird animals. Somebody always cares about the
  saiga or the axolotl. Let them maintain their species

This is also honest: a lone-maintainer dataset *will* go stale. Designed as
a commons, staleness becomes "needs contributors" instead of "dead site."

## The honest competitive landscape

- **extinctioncheck.org** already does species → vetted-NGO linking. It's
  good. We're differentiated by: the pixel visualization (the emotional
  layer they lack), the map/regional view, and open-source-as-method.
  Cite them as a source, don't compete with them.
- **IUCN Red List itself** is the data source — we're the *legible front
  end*, not a rival.
- **WWF/NGO sites** have budgets we don't — but their numbers hide behind
  marketing funnels. Our pitch is "the number, the pixels, the source, the
  donate link" in one scroll.

## What the site is NOT (scope discipline)

- Not a charity. No donations touch us — every link goes straight to the NGO.
  This is also legally important: we never hold money, so no fundraising
  registration obligations, no financial liability, clean conscience.
- Not an encyclopedia. Wikipedia does prose. We do *felt numbers*.
- Not an authority. We curate + point; certifiers (Green List, GFAS, AZA)
  and watchdogs (Charity Navigator) do the judging. The site's credibility
  comes from showing receipts, not claiming expertise.
- Not monetized. Ever. No ads, no affiliate, no "premium." The whole point
  is trust; a single sponsored slot would poison it.

## The map's real job

The world map isn't decoration — it's the **regional honesty** layer:

- Clicking a country should eventually answer "who lives here and how are
  they doing" — which is a real question nobody answers well
- It forces the two-tier data model: verified regional numbers (tiger/India,
  elephant/Botswana) vs "known to be present" vs no data — and the visual
  language has to say which is which
- Future layer: IUCN Green List sites + GFAS sanctuaries as "good places"
  markers (data exists — see RESEARCH.md §6)
- Practically: it's also the prettiest thing on the site and the thing
  that gets linked around. Fine. It earns its keep as the front door.

## Near-term build order (my read)

1. `donate[]` on species.json + "who protects them" section — payload first
2. Species index page (pick any animal, see all of them)
3. SOURCES.md + LICENSE split (code MIT / data per-source) — cheap, needed
   for the open-source pitch to be real
4. CONTRIBUTING.md with the data-citation rules — the community story
5. More species, prioritizing the spread: 0 (extinct, empty frame!) → 2 →
   hundreds → thousands → millions → recovery stories
6. Region/country pages once ~20+ species have data
7. Green List / good-places layer on the map (dataset, not opinion)

## Risks worth naming

- **A stale number is a lie.** Every record needs `year` front and center
  and the UI should age-flag old estimates (>5y) rather than silently rot.
- **One-pixel-per-animal breaks >~10M.** Scale badges ("1 px = 1,000") or
  virtualization needed eventually — noted for the rebuild.
- **Certifier ≠ gospel.** Green List is voluntary (bad parks don't apply);
  African Parks has real indigenous-rights criticisms. Present signals,
  let readers judge — that epistemic honesty is the brand anyway.
- **The emotional register.** Two pixels is devastating; done wrong it's
  manipulative. The counterweight is showing recoveries with equal weight —
  saiga gets the longest page on the site, and it should say so proudly.

## The HR-y part (since you asked)

The genuinely impressive thing here isn't the tech — it's the *story arc*:
"built an open-source conservation visualization where community members
contribute cited population data via PR; renders hundreds of thousands of
individual pixels; links 100% of donate buttons to vetted NGOs."
That's a portfolio piece with: a real domain, real data engineering, a real
open-source model, and a demo people remember. The 2-pixel rhino page is
the interview anecdote — "I made the last two northern white rhinos into
two pixels and that's the whole website."
