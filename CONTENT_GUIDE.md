# Content guide

How to write a page. Words live in `src/content/`, one Markdown file per page; layouts turn them into pages. Every build checks the front matter (`lib/content.js`): errors stop the build, warnings are printed. Samples: `src/content/facials/index.md` (hub) and `src/content/facials/dermaplaning.md` (treatment).

## Files and URLs

| Page | File | URL (set for you, never typed) |
| --- | --- | --- |
| Hub | `src/content/<section>/index.md` | `/<section>/` |
| Treatment | `src/content/<section>/<slug>.md` | `/<section>/<slug>/` |
| Text page (policies, trust pages) | `src/content/<folder>/<slug>.md` | `/<slug>/` |

- `section` is `aesthetics`, `facials` or `beauty`. A treatment `slug` must be a page listed for its section in `src/_data/sections.json` (the 32-page site map: page order, card name, card photos and card line) and matches the `page` field in `services.json`.
- Clean URLs only, never a medicine name: the lines and wrinkles page is `/aesthetics/lines-and-wrinkles-consultation/`.

## Rules for every page

- Compliance rules in `CLAUDE.md` apply to every field, URL and alt text. `npm run check` runs the banned-words check.
- Never type a price, phone number, address or opening hour: they come from `src/_data/`. Prices on treatment pages come only from `services`.
- Missing facts: write `[[TODO: what is needed]]` (quote it in front matter). It shows as a yellow mark.
- Typography is automatic in Markdown bodies (curly quotes, dashes). In front matter type `’` and `–` yourself.
- `metaTitle`: the brand is added after it (`Dermaplaning in Penketh, Warrington | The Urban Beauty Salon`); keep the whole title to 65 characters. `metaDescription`: 70 to 160 characters. Both unique per page.

## Treatment page

```yaml
layout: layouts/treatment.njk
title: Dermaplaning                 # the H1 (card names come from sections.json)
slug: dermaplaning                  # optional: defaults to the file name, must match it
section: facials
metaTitle: Dermaplaning in Penketh, Warrington
metaDescription: 70 to 160 characters, unique.
eyebrow: ""                         # optional: replaces the default "FACIALS · 04" (linked to the hub)
lead: One or two sentences under the H1.
heroPhoto: reception-flowers-products   # photos.json name, or "[[TODO: photo of ...]]"
facts:
  duration: ""                      # optional: defaults to the services' range, e.g. "60–75 min"
  resultsLast: "[[TODO: from the practitioner]]"
  downtime: "[[TODO: from the practitioner]]"
# Keep each fact value to about 24 characters ("Typically 6–18 months", "Builds over a course"); put any qualifier
# in the body copy (the end of "What to expect"). Long values wrap badly in the quick-facts strip.
services:                           # service ids from src/_data/services.json, in menu order
  - "20306605379443"
  - "20323785248627"
bookLabel: Book dermaplaning        # 22 characters or fewer; prescription pages: Book a free consultation
practitioner: "[[TODO: practitioner name]]"   # an id from practitioners.json once Yemi supplies details
faqs:                               # plain text answers (no Markdown)
  - q: How do I book?
    a: Book online at any time with any Book button, or call the salon during opening hours.
related: [glycolic-peel, crystal-clear, caci]  # slugs from sections.json, any section, 3 at most
reviews: []                         # ids from reviews.json (real Phorest reviews only)
pause: ""                           # optional: photos.json name for a full-width image pause
```

Prices from `services` (never typed): "From £X" is the lowest public price of a main service: services flagged `excludeFromFrom` in `services.json` (add-ons, standalone soak-offs, removals, repairs, infills, sensitivity or patch tests; set by `scripts/import-services.js`) stay in the price list but never set From £X, the card time or the duration range; the price list (dot leaders) shows public prices only. Prescription services show "Free consultation" and never a price. Held-back prices (Profhilo, microneedling, fat dissolving) show a `[[TODO]]` until Yemi decides. The build warns when a service for the page is left out.

Body: exactly these `##` headings, in this order. Each becomes a section in the sticky contents list. Use `###` only inside a section.

```markdown
## What it is
Two or three short paragraphs. (The "Your practitioner" card follows this section.)

## Who it suits
Who it is for, and who should not have it.

## What to expect
1. **Before your treatment.** One or two sentences.
2. **During your treatment.** One or two sentences.
3. **Afterwards.** One or two sentences.

## Aftercare
Plain advice. Link to the safety and aftercare page when it exists.
```

A numbered list becomes the numbered steps (01, 02 on a thin line): start each item with a short bold title ending in a full stop. The template then adds Prices and times, Questions (`faqs`), reviews (or a `[[TODO]]`), related treatments and the closing "See you soon." band.

Consultation-only pages (every listed service is prescription) use `facts: { duration, format }` and no `resultsLast` or `downtime`; list only the consultation services you want shown. A YAML comment `# remove if price published` marks FAQs that mention a held-back price. `noindex: true` keeps a page out of search and the sitemap.

## Trust page

`layout: layouts/trust.njk`, in `src/content/trust/<slug>.md`, URL `/<slug>/`. Front matter: title, slug, metaTitle, metaDescription, eyebrow, lead, optional heroPhoto, `urgent: { title, intro, items }`, `routes` (eyebrow, title, text, url), routesTitle, routesLead, faqs, print. Body: `##` sections.

## Hub page

```yaml
layout: layouts/hub.njk
title: Facials
section: facials
metaTitle: Facials in Penketh, Warrington
metaDescription: 70 to 160 characters, unique.
eyebrow: ""                         # optional: default "TREATMENTS · 02"
lead: One or two sentences.
heroPhoto: relaxation-room
bookLabel: Book a facial            # optional: default "Book now"
cardsTitle: Our facials             # optional: default "Our <section>"
cardsLead: One short line above the cards (optional).
pause: velvet-band                  # optional: image pause after the cards
notSure:                            # optional: defaults shown on the Facials hub
  title: Not sure what to book?
  text: One or two sentences.
  photo: treatment-room
```

Body (optional): one or two short paragraphs under the lead, no headings. The cards come from `sections.json`: every page planned for the section, in order, with "From £X" and time from `services.json` ("Free consultation" for prescription pages).

## Text page (policies)

```yaml
layout: layouts/text.njk
title: Privacy notice
slug: privacy                      # optional: defaults to the file name
metaTitle: Privacy notice
metaDescription: 70 to 160 characters, unique.
eyebrow: Policies                  # optional
lead: ""                           # optional
updated: "2026-11-08"              # optional, quoted: shows "Last updated 8 November 2026"
draft: true                        # shows the "Draft, pending legal review" note
```

Body: Markdown with `##` and `###` headings, lists and links. It prints cleanly.
