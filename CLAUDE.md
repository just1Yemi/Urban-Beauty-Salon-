# The Urban Beauty Salon website

Working rules and agreed decisions for every Claude Code session on this repo. Read this file and `BUILD_PLAN.md` first. Do not re-open a decision listed here unless Yemi asks.

## Working rules

- **Only build when Yemi says "build".** Work one stage of `BUILD_PLAN.md` per session. Finish it, update its status in `BUILD_PLAN.md`, commit, and stop.
- Never push to GitHub without Yemi's go-ahead.
- Never invent facts: practitioner names, registrations, reviews, results, prices or claims. Use a visible placeholder: `[[TODO: what is needed]]`.
- British English. Tone: expert, warm, reassuring, plain English, no hype, no medical claims ("cure", "guaranteed", "best", "only", "first", "licensed").

## Business facts (confirmed by Yemi)

| Item | Value |
| --- | --- |
| Legal entity | Urban Beauty Salon Ltd |
| Trading name | The Urban Beauty Salon |
| Company number | 17031560 (England and Wales). Registered office: 40 Kipling Avenue, Tilbury RM18 8HF |
| Contact form reply promise | "We usually reply within an hour during opening hours." |
| Established | 2013 |
| Address | 5 Honiton Way, Penketh, Warrington WA5 2EY |
| Phone | 01925 726688 |
| Hours | Tue 10:00–20:00, Wed 10:00–18:00, Thu 10:00–20:00, Fri 10:00–18:00, Sat 09:00–15:00, closed Sun and Mon |
| Parking | Free parking right outside, in front of the shops |
| Directions (Contact page, map caption) | "Find us in the corner of the horseshoe of shops at Penketh precinct, just off Meeting Lane and beside Penketh Pool and Community Centre. Free parking right outside." Short version: "In the corner of the Penketh precinct shops, off Meeting Lane." |
| Domain | theurbanbeautysalon.co.uk (DNS at one.com) |
| Email | hello@, bookings@ (Google Workspace) |
| Booking | Phorest: https://phorest.com/book/salons/urbanbeautysalon (subdomain `urbanbeautysalon`) |
| Instagram | https://www.instagram.com/urban_beauty_salon/ |
| Facebook | https://www.facebook.com/urbanbeautysalonpenketh/ |
| Reviews | 6,736 five-star Phorest reviews, 2 Jul 2016 to 3 Nov 2026 (evidence: Phorest screenshots, 3 Nov 2026) |

## Agreed decisions

| Decision | Choice |
| --- | --- |
| Hosting | Netlify (free tier). DNS stays at one.com. Never touch MX, SPF, DKIM or DMARC records |
| Build | Eleventy (11ty) static site generator, outputs plain HTML/CSS/JS. No front-end framework |
| Pages | 32 in Phase 1, one page per treatment |
| Fonts | Jost (light, uppercase, tracked) for headings; Inter for body. Self-hosted |
| Colours | Espresso #3B302A, Champagne #C6A77D, Ivory #F6F1EA, Onyx #000000, White #FFFFFF. Champagne never as text on Ivory |
| Logo | Always the SVG files from the logo pack, never recreated in a font |
| Prices | "From £X" line on treatment pages only. No full Prices page (Phorest holds the menu). Held back until Yemi decides: Profhilo, microneedling, fat dissolving |
| Memberships | Phase 2 |
| Analytics | Plausible (no cookies) and Google Search Console at launch |
| Contact form | Netlify Forms, sending to hello@ |
| Book Now behaviour | Phorest booking overlay on the page where the widget works (desktop and mobile); otherwise open the Phorest booking page in a new tab, with an accessible "opens in a new tab" label and a small arrow icon |
| Legal line | "Registered in England and Wales No. [[TODO]]" (England and Wales is the Companies House jurisdiction) |
| Map | Brand-coloured OpenStreetMap SVG, see BUILD_PLAN Stage 3 |

## Compliance rules (non-negotiable)

- Botulinum toxin is a prescription-only medicine. Never name it, or a euphemism for it ("Botox", "anti-wrinkle injections", "tox", "baby botox"), anywhere on the site, in URLs, page titles, meta descriptions, alt text or schema. Use "Lines and wrinkles consultation".
- No prices, offers or bundles for toxin services (anti-wrinkle, hyperhidrosis, bruxism). Only "Free consultation".
- No before-and-after photos for prescription treatments.
- No "licensed" claims. No "nurse led" or "doctor led" unless confirmed for that named service.
- No near-identical area pages for nearby towns.
- Little Miss Urban: a parent or guardian must attend.
- Reviews: first name and surname initial only. Exclude any that mention prescription medicines.

## Source files (outside the repo, read-only)

- Logo pack: `C:\Users\olaye\Downloads\Urban-Beauty-Logo-Pack\Urban-Beauty-Logo-Pack`
- Phorest services export (157 services): `C:\Users\olaye\Downloads\services.csv`
- Full website plan: `C:\Users\olaye\Downloads\Urban Beauty Website Plan.md`
- Do NOT use `New list of services.csv` in the salon OneDrive folder: it contains internal margin data.
