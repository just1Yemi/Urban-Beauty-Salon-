# Build plan: The Urban Beauty Salon website

One stage per session. Each stage ends with a review by Yemi, a commit, and a status update here. Content (words) is kept separate from code (templates) so practitioners can review copy without touching code.

## Quality bar (every stage is checked against this)

| Area | Target |
| --- | --- |
| Speed | Lighthouse Performance 95+ on mobile; largest content loads in under 2.5s on 4G; under 1 MB per page |
| Accessibility | WCAG 2.2 AA; Lighthouse Accessibility 100; keyboard navigation; alt text on every image |
| SEO | Lighthouse SEO 100; unique title and description on every page; schema markup validates |
| Conversion | Book Now visible at all times; at most 2 taps from any page to the Phorest booking panel |
| Compliance | Automated banned-words check passes (see `CLAUDE.md`); prescriber sign-off on aesthetics copy |
| Mobile | Works on a 360px-wide phone with no sideways scrolling |

## Premium details (applied in Stage 1, used on every page)

All motion respects `prefers-reduced-motion`. Nothing here may push a page past the speed targets above.

- **Type:** Jost light uppercase headings, tracked about 0.2em (echoes "S A L O N"); small eyebrow labels ("AESTHETICS · 01"); fluid sizes with `clamp()`; `text-wrap: balance` on headings and `pretty` on paragraphs (no single-word last lines); curly quotes, en dashes in times (10:00–20:00), tabular figures in prices, non-breaking space after £; 60–70 character line length.
- **Colour and texture:** Ivory backgrounds, Espresso text (never pure black or white for large areas); 1px Champagne hairline dividers (echo the logo's thin strokes); faint grain texture on Ivory (under 2 KB); Champagne on under 5% of any screen; branded text selection and focus ring; `theme-color` so the phone browser bar matches.
- **Brand motif:** the UB circle icon as a quiet watermark (about 3% opacity) and section divider; arched tops on team portraits; custom thin-line icons drawn at the logo's stroke weight (no generic icon set); large Ivory secondary logo on an Espresso footer; branded 404 page.
- **Logo draw-in:** the SVG logo is drawn with strokes, so it can trace itself in once per visit (about 1.2s).
- **Motion:** slow fade-and-rise reveals (600–800ms, 12–16px, staggered); hero slow zoom or short ambient video loop; header turns from transparent to Ivory with a soft shadow on scroll; links underline left to right; buttons fill with Champagne on hover with a 4px arrow nudge; images zoom 3% inside a fixed frame on hover; cross-fade between pages (View Transitions API); review count counts up once; smooth FAQ accordion.
- **Layout:** generous space (sections 96–160px tall padding on desktop); editorial asymmetric layouts with text cards overlapping images; at most 3 cards per row; 8px spacing scale; numbered lists (01, 02) for steps; thin vertical line linking consultation steps.
- **Imagery:** one warm colour grade across every photo; straightened verticals; fixed ratios (4:5 portrait, 3:2 landscape); detail crops (velvet desk, polish wall, pampas, product shelves) as accents; blurred colour preview while images load; AVIF/WebP at responsive sizes.
- **Booking feel:** frosted-glass sticky Book bar on mobile; specific button labels ("Book a free consultation"); live "Open now · closes 8pm" from the hours data; tap-to-call and tap-to-map; large Champagne quotation mark on reviews; floating-label contact form with a calm success message.
- **Treatment pages:** quick-facts strip under the heading (Duration · Results last · Downtime · From £X) with thin-line icons; sticky in-page contents that highlights the current section; 1px Champagne reading-progress line; "Your practitioner" mini card; FAQ "+" rotates to "×".
- **Cards:** hover reveals "From £X · 45 min"; cross-fade from room photo to detail photo on hover; one corner radius everywhere (sharp, 0–2px); warm-tinted soft shadows, never grey.
- **Image reveals:** hero and feature images reveal with a slow mask wipe (clip-path), not a plain fade; small tracked-caps captions; Espresso duotone behind any text laid over an image.
- **Typography fine-tuning:** fonts subset and preloaded, with size-matched fallbacks so text never jumps; Inter tabular figures for prices and times; tighter tracking on large headings, wider on small labels; larger lead paragraph; hanging quotation marks on pull quotes.
- **Small kindnesses:** today's row highlighted in the hours table; tap the address to copy it, with a quiet "Copied" note; phone shown as 01925 726 688; reviews dated by month with "Verified Phorest client"; press-down feedback on buttons on phones; small UB-icon back-to-top button on long pages; one soft Champagne sheen across the main Book button, once, a few seconds after load.
- **Map:** a brand-coloured static map image linking to Google Maps instead of the Google embed (faster, no Google cookies).
- **Shareability:** a branded share image for every page, so WhatsApp, Instagram and Facebook links look designed; "Urban Beauty" name and UB icon when saved to a phone home screen.
- **Speed that feels instant:** pages prefetched on hover or tap (Speculation Rules); every image has fixed dimensions so nothing shifts while loading; no spinners.
- **Print:** a clean print layout for the aftercare page, so clients can print their aftercare.
- **Footer sign-off:** "© 2026 Urban Beauty Salon Ltd · Registered in England No. [[TODO]] · Registered office [[TODO]]". This is also a legal requirement for a limited company website.
- **Joined-up brand:** match Phorest's booking panel colours to the palette where Phorest allows; branded QR code card for reception linking to booking; branded email signature for hello@ and bookings@ (optional, outside the site).
- **Heritage seal:** "THE URBAN BEAUTY SALON · EST. 2013 · PENKETH" set on a circle around the UB icon; used in the footer and About page. "Est. 2013" in small tracked caps beside the header logo on desktop.
- **Editorial touches:** a vertical tracked-caps label down the hero edge ("PENKETH · WARRINGTON · EST. 2013"); very faint oversized section words behind headings (for example "FACIALS" at about 4% opacity); full-width image pauses between long text sections; Jost's ampersand in Champagne ("Skin & Beauty").
- **From the real salon:** a thin inset frame on feature images, echoing the white ornate frames on the salon walls; a crop of the crushed-velvet reception desk as a texture band in one section; pampas grass detail crops as quiet accents.
- **Luxury menu styling:** "From" in small tracked caps, a smaller £ sign and light-weight numerals; dot leaders on short price lists (Lash lift ........ from £48), like a fine-dining menu; hairline separators instead of bullets.
- **Navigation:** a small Champagne dot (the circle motif) marks the current page; links underline thin, offset 4px, in Champagne; mobile menu opens full-screen in Espresso with large tracked links easing in one by one, and address, hours and Book at the bottom.
- **Buttons:** two styles only: solid Espresso and hairline outline; small tracked uppercase labels.
- **Warm light:** a faint warm light wash across the top corner of hero photos to bring them to "golden hour".
- **Closing line:** every page ends above the footer with a large, light "See you soon." and the Book button.
- **Restraint rule:** every detail is judged in the Stage 1 style guide. Anything that feels busy, slows a page or competes with the photos is cut.
- **Calm by omission:** no custom cursors, magnetic buttons, scroll-jacking, mobile parallax or typewriter text; no pop-ups, no cookie banner (Plausible), no chat bubble, no autoplay sound, no carousel heroes, no stock or AI-generated people, no glitter or gradient effects, maximum two fonts.

## Photos

Source: `C:\Users\olaye\Downloads\Empty Salon Photos-20261108T152613Z-1-001.zip` (49 photos, 3 videos, 9 March 2026, phone camera, empty salon).

- **Use:** reception desk wide and details (photos 15, 18, 19, 21), relaxation room with wood floor (31 to 33), polish wall (14), nail stations (16, 17), product shelves (44 to 48), lash prints (25, 26), treatment room (22, 29) for "clean and safe".
- **Do not use:** the "brazilian reasons to get waxed" print (27): the pun undercuts a premium clinic. Duplicates and ceiling-heavy shots (36 to 43).
- **Process in Stage 1:** warm grade, straighten verticals, crop out ceiling tiles and clutter, export AVIF/WebP (from 4 to 28 MB down to about 150 to 250 KB each).
- **Gaps:** no exterior, no people, no treatments in progress, no aesthetics room. Placeholders until a professional shoot.

## Status

| Stage | Name | Status |
| --- | --- | --- |
| 0 | Foundations | Done |
| 1 | Design system | Done – signed off by Yemi at Checkpoint 1 (8 Nov 2026), all premium details kept |
| 2 | Templates and booking | Done |
| 3 | Home page | Done |
| 4 | Aesthetics (hub + 8) | Done – copy awaiting practitioner sign-off (prescriber) |
| 5 | Facials (hub + 5) | Done – copy awaiting practitioner sign-off |
| 6 | Beauty (hub + 7) | Done – copy awaiting practitioner sign-off |
| 7 | Trust pages | Done – copy awaiting practitioner sign-off |
| 8 | Policies, analytics, SEO | Done – policies are drafts pending legal review |
| 9 | Quality and compliance check | Not started |
| 10 | Go live | Not started |

---

## Stage 0: Foundations

**Goal:** a clean project with the assets and data in place, before any design.

- Set up Eleventy, `package.json`, `.gitignore`, folder structure (below).
- Copy the logo SVGs, favicon and app icons into `src/assets/img/brand/`.
- Convert `services.csv` into `src/_data/services.json`: cleaned names, category mapped to website section, and a `public` flag. Toxin services and held-back prices are marked not public.
- Create `src/_data/site.json`: business details, hours, booking link, socials (single source of truth).
- Write the banned-words check script (`scripts/compliance-check.js`).
- Extract photos from the zip into `src/assets/img/source/` (git-ignored originals); review the 3 videos for a possible hero loop.
- Add check scripts: `npm run check` (build, compliance, links) and Playwright screenshots at 360, 768 and 1440px.

**Done when:** `npm run build` produces an empty site with no errors; the data files match `CLAUDE.md`.
**Yemi reviews:** the cleaned service names list.

## Stage 1: Design system

**Goal:** agree the look once, so every page after this is consistent.

- Colour and spacing tokens, Jost and Inter (self-hosted), type scale.
- Components: header, mobile menu, footer, buttons, sticky mobile Book Now bar, treatment card, review card, "From £X" price line, FAQ accordion, placeholder style for missing photos.
- A private style guide page showing every component.

**Done when:** contrast checks pass and the style guide works on phone and desktop.
**Yemi reviews:** the style guide in the browser. **This is the main design sign-off.**

## Stage 2: Templates and booking

**Goal:** the reusable page layouts, and Book Now buttons that work.

- Layouts: base, hub page, treatment page, simple text page.
- Treatment page template: what it is, who it suits, what to expect, duration, how long results last, aftercare, "From £X", FAQs, reviews, related treatments, Book Now.
- Phorest booking: confirm how Phorest's widget script works for this account. Fall back to opening the booking link in a new tab if the widget can't be styled. One setting controls every button.

**Done when:** one sample treatment page renders from a Markdown file; Book Now opens the Phorest booking page.
**Risk:** the Phorest widget only fully works on the live domain. Test it properly in Stage 10.

## Stage 3: Home page

Hero, review proof (6,700+ five-star reviews), featured treatments, "Not sure what to book?", team preview, Instagram (static grid), map, hours.

**Map (built here, reused in Stage 7):** approved by Yemi. `scripts/make-map.js` fetches OpenStreetMap data once (Overpass API, small area around the salon) and renders an SVG in the palette: Espresso ground, Ivory/Champagne roads, buildings as faint tints, a few street labels (Meeting Ln, Honiton Way, Greystone Rd) in tracked caps, the UB circle icon as the marker. Credit "© OpenStreetMap contributors" under the map; the map links to Google Maps for the address. Marker position (from Yemi's Google Maps screenshot, 8 Nov 2026): the building on the north side of the Penketh Pool and Community Centre precinct, just south of Meeting Lane, between William Penn Close and Greystone Road. Do not use or trace the Google screenshot itself. Contact directions line: "In the Penketh precinct beside Penketh Pool and Community Centre, just off Meeting Lane" [[TODO: Yemi to confirm wording]].

**Yemi reviews:** the home page. Placeholders show where real photos go.

## Stages 4 to 6: Treatment sections

| Stage | Pages | Notes |
| --- | --- | --- |
| 4 Aesthetics | Hub + lines and wrinkles consultation, dermal fillers, skin boosters, polynucleotides, biostimulators, microneedling, fat dissolving, hair loss | Compliance-heavy: copy drafted, then flagged for prescriber sign-off |
| 5 Facials | Hub + CACI, COMCIT, Crystal Clear, dermaplaning, glycolic peel | Course totals shown |
| 6 Beauty | Hub + lashes and brows, nails and pedicures, Little Miss Urban, massage, body and tanning, waxing, men | Patch test link on lash and brow pages |

Each stage: draft copy as Markdown files in `src/content/`, build pages, then export a copy review document for practitioners. Copy is written from the services list and the website plan, never invented results or credentials.

**Done when:** all pages in the stage build, pass the banned-words check, and have a review document ready.

## Stage 7: Trust pages

Your consultation and first visit, safety and aftercare, about and practitioners, contact (Netlify form, map, hours, free parking).

**Needs from Yemi:** practitioner details, salon story, aftercare hours. Placeholders until then.

## Stage 8: Policies, analytics, SEO

- Privacy, cookies, cancellation and booking terms pages (drafted; need a legal check).
- Plausible analytics script.
- Page titles and descriptions for all 32 pages; schema markup (BeautySalon, opening hours, services, reviews); `sitemap.xml`; `robots.txt`; 404 page; social share images.

**Needs from Yemi:** company number, registered office, ICO number, cancellation and deposit terms.

## Stage 9: Quality and compliance check

- Lighthouse on every page type; fix anything below the quality bar.
- Accessibility check (keyboard, screen reader labels, contrast).
- Test on iPhone, Android, tablet and desktop sizes.
- Broken links check; phone and email links work.
- Banned-words check across all pages, URLs, titles and alt text.
- List of every remaining `[[TODO]]` placeholder for Yemi.

**Done when:** no blocking issues; the launch checklist in the website plan is ready to tick.

## Stage 10: Go live (done together, about 1 hour)

1. Screenshot the current one.com DNS records.
2. Push to GitHub and connect the repo to Netlify.
3. Add the domain in Netlify; add the A record and `www` CNAME at one.com. Touch nothing else.
4. Confirm HTTPS on both addresses and that email still sends and receives.
5. Test the Phorest widget on the live domain: book and cancel a test appointment.
6. Test the contact form reaches hello@.
7. Verify Search Console, submit the sitemap, set up Plausible, update Google Business Profile.

---

## Folder structure

```
src/
  _data/        site.json, services.json, reviews.json, practitioners.json
  _includes/    layouts and components
  content/      one Markdown file per page (the words)
  assets/       css/, js/, img/, fonts/
scripts/        compliance-check.js, services import
```

## How the build runs

**Models:** Opus 5.5 (extra high effort) for Stage 1 (design system), Stage 2 (templates), Stage 4 (aesthetics compliance copy) and all independent reviewers. Sonnet 5.5 (high effort) for Stages 0, 3, 5, 6, 7, 8 and 9.

**Three runs, two human checkpoints:**

| Run | Stages | Mode | Ends with |
| --- | --- | --- | --- |
| A | 0 and 1 | Automatic | **Checkpoint 1:** Yemi reviews the style guide and cleaned service names. Cut anything busy |
| B | 2 to 9 | Automatic | **Checkpoint 2:** Yemi reviews the full site locally, the copy review documents and the `[[TODO]]` list |
| C | 10 | Together | Site live |

**Every stage, run by its own agent with a fresh context:**

1. Read `CLAUDE.md`, this file, and only the source files that stage needs.
2. Do the stage. Words go in `src/content/`, facts in `src/_data/`, never hard-coded.
3. Self-check: `npm run build` passes; compliance check passes; screenshots at 360px, 768px and 1440px (Playwright) reviewed against the quality bar and premium details; Lighthouse on new page types.
4. Fix anything that fails, then re-check (at most 2 rounds; anything still failing is logged, not hidden).
5. Update the Status table and the stage log below, commit with a clear message. **Never push.**
6. Hand a short summary to the next stage: what was built, what is a placeholder, what failed.

**Independent review:** after Stages 1, 4 and 9, a separate reviewer agent checks the work cold (visual quality, compliance wording, accessibility) without seeing the builder's reasoning.

**Parallel work:** in Stages 4 to 6, copy for each treatment page is drafted in parallel, then assembled into the shared templates by one agent.

**Efficiency rules (save tokens, never quality):**

- Mechanical work runs as scripts, not by hand: image resize and grade, services import, compliance, links, Lighthouse.
- Process only the selected photos listed under Photos; do not re-view all 49.
- Build components and templates once; generate pages from content files.
- Screenshot each page type (and every page only where its layout differs), not all 32 pages.
- Read only the files the stage needs. Hand the next stage a short summary, not the working history.
- Start the build from a fresh chat, not the long planning chat.
- Every agent prompt starts with the same shared block (CLAUDE.md and this file) so it can be cached.
- Agents never read the full website plan or the raw CSV after Stage 0: Stage 0 distils them into `src/_data/` JSON and a short `COMPONENTS.md` (Stage 1) describing every component and token, so later stages do not read the CSS to learn it.
- Automated checks before eyes: build, compliance, axe accessibility, contrast, horizontal-overflow and page-weight scripts run first and print failures only. Screenshots are viewed only once those pass.
- Screenshots are combined into one sheet per page type and viewed downscaled; full-resolution crops only for fine detail (type, hairlines, icons).
- Videos are checked as frame contact sheets, not watched.
- Copy agents run in parallel with small contexts: their treatment's services, the tone and compliance rules, and the template headings only.
- Practitioner review documents are generated by script from the content files, not rewritten.
- Mechanical agents (running scripts, moving files) use the cheapest model at low effort; the output is produced by the script, so quality is unchanged.
- Edits are targeted; files are not re-read after editing; command output is trimmed to errors.
- Agents return short structured summaries.
- Premium details, reviewers, model split, fix rounds and copy length are not reduced.

**Stop rules (the run pauses and reports instead of guessing):** a build that cannot be fixed in 2 rounds; any wording that might breach a compliance rule and cannot be rewritten safely; anything needing a login, payment or a decision not in `CLAUDE.md`.

## Stage log

| Stage | Date | Summary | Placeholders left | Issues |
| --- | --- | --- | --- | --- |
| 0 | 2026-11-08 | Eleventy 3.1.8 set up (input src, output _site); folder structure; 21 logo SVGs and 5 icon PNGs in src/assets/img/brand/; src/_data/site.json; 157 services imported to services.json (11 prescription, 6 more with price held back, 17 not public) plus scripts/services-review.md for Yemi; scripts: compliance-check, link-check, check (npm run check), shots (Playwright, axe, 360px overflow, page weight, one contact sheet per page), import-services; sharp, ffmpeg-static, Playwright Chromium installed. build and check pass. | companyNumber, registeredOffice, icoNumber in site.json (all [[TODO]]) | Photos zip not extracted and videos not reviewed (not in the Stage 0 task; do at the start of Stage 1). 16 service names need Yemi to confirm (see scripts/services-review.md). Compliance check scans _site, src and the public fields of services.json. shots.js assumes a built _site. |
| Photos | 2026-11-08 | scripts/process-photos.js (sharp: crop, small straightening where measured, one warm grade, AVIF + WebP at 480/960/1600, plus 2400 for 4 landscape hero candidates, 24px blurred previews) produced 14 photos in src/assets/img/salon/ (92 files, 14 MB) and src/_data/photos.json (name, alt, use, ratio, size, widths, base64 preview). Rejected 5 near-duplicates or poor frames. All 3 videos reviewed: none suitable, so no hero loop. eleventy.config.js now copies assets folder by folder so src/assets/img/source (500 MB originals) never reaches _site. build and check pass. | none | Videos are portrait 4K handheld clips of a door swinging shut with a '2' plate, not a calm loop: use a slow zoom on a still for the hero. reception-wide is 3000px source (low resolution) and trims the pampas edge to hide a fire extinguisher. 2400px hero files are 0.7 to 1.3 MB: use only on large screens. |
| 1 | 2026-11-08 | Design system: tokens (palette + 4 tints, warm shadows, 8px scale, fluid clamp type, 2px radius, motion), self-hosted Jost 300/400/500 and Inter 400/500/600 (latin woff2, 2 preloaded, size-matched Arial fallbacks); CSS in 4 source files bundled to one /assets/css/site.css (8.7 KB gzipped); site.js (4.2 KB gzipped, no framework); 26 macros in src/_includes/ui.njk; base layout and partials (header with once-per-visit logo draw-in, full-screen Espresso menu dialog, frosted mobile Book bar, "See you soon." band, Espresso footer with Ivory secondary logo, heritage seal, live open status, today's hours, copy address, legal line); 23 custom thin-line icons; /styleguide/ (noindex) and branded /404.html; favicon.svg (dark-mode aware), manifest ("Urban Beauty"), theme-color, print styles; COMPONENTS.md. New checks: contrast step in npm run check (13 pairs, Champagne-text rule), link check reports pages not built yet (scripts/link-pending.json) instead of failing. check and shots pass: no 360px overflow, no axe violations, under 1 MB. | companyNumber and registeredOffice (footer); static brand-coloured map image; review texts, names and dates; practitioner name and role; results-last and downtime facts; team portraits and aesthetics room photo (placeholders in style guide) | Lighthouse not run this stage (do on the first real page types in Stage 2/3). Mobile crop of the reception hero shows the glitter wall and ring light: Stage 3 to choose the hero crop. Ampersand is Champagne on Espresso only (CLAUDE.md rule beats the premium-details example on Ivory). Book sheen and logo draw-in run once per visit, not per page. Hero uses slow zoom, not the mask wipe (keeps LCP fast). Confirm legal-line wording ("Registered in England" vs "England and Wales") with the company number. shots.js now waits 400ms before capturing (a scroll-to-top repaint lag hid the header logo in some captures). |
| 1 review | 2026-11-08 | Independent review applied (all 2 must, 6 should, 6 nice). --measure 34em (about 65 characters); scroll-padding-bottom under 1024px so focus never sits under the Book bar (tab-through at 360 and 768: 0 hidden); header fixed by default, solid Ivory without JS; hero and 404 use a CSS-only entrance (no data-reveal above the fold); art-directed crops in process-photos.js (hero-desk + hero-desk-portrait, velvet-band, polish-band, pampas, tight treatment-room) so no monitor, ring light, leaflets, sockets or radiator show; phone buttons full width with balanced labels; section-head word anchored to the heading; field and contactForm macros (Netlify Forms, honeypot, floating labels, error and success states) in ui.njk and the style guide; Inter 600 removed (strong and today row use 500); hero theme-color Espresso; map pin 34% on phones; closing watermark 2.5% and larger; ivory-shade role text; footer legal line now "England and Wales" per CLAUDE.md. check and shots pass (no overflow, no axe violations, under 1 MB). | Contact form reply time ([[TODO]]) | Partly hidden textarea at 768px is allowed by WCAG 2.4.11 (only fully hidden fails). Desktop hero shows the Urban Beauty gift-voucher card behind the h1 (legible under the shade; Stage 3 may adjust). The live contact form needs the /contact/ page (Stage 7). |
| 2 | 2026-11-08 | Layouts: treatment, hub and text (all from front matter; base reads metaTitle/metaDescription). Content model in lib/content.js: validated `content` collection (errors stop the build, warnings print), clean URLs from section + slug (src/content/content.11tydata.js), offer filter (From £X = lowest public price; dot-leader list of public prices; prescription = "Free consultation", never a price; held-back prices = TODO), sections.json site map (page order, card names and photos for all 20 treatment pages), practitioners.json and reviews.json (empty). Data deep merge off so front matter `services`/`reviews` id lists replace the global data. CONTENT_GUIDE.md (schema and body headings). Booking: one setting `site.booking.mode` ("overlay" default, "newTab"); markup is always the new-tab link with an outward arrow and hidden "(opens in a new tab)"; overlay mode loads Phorest's OBWidget on intent, opens via #onlinebookings (phones too, force_slide_over), labels the panel, returns focus and scroll on close, Ivory/Espresso frame header. Tested locally in desktop and phone emulation: panel loads Phorest's booking app (CORS and frame headers allow any domain). Sample pages /facials/ and /facials/dermaplaning/ (placeholder copy). npm run lh (Lighthouse 13.6, Playwright Chromium, fresh browser per page) and scripts/static-server.js shared with shots. Mobile Lighthouse 100/100/100/100 on both pages (LCP 1.2 s, CLS 0). check and shots pass (no overflow, no axe violations, under 1 MB). | Sample copy (lead, sections, results last, downtime, one FAQ answer), practitioner, reviews for the page; Facials hub intro; card photos are interim picks from the 14 salon photos | Not live-tested: a real booking and cancellation inside the panel (Stage 10, desktop and a real iPhone: Safari blocks third-party cookies in frames; switch overlayOnPhones or mode if it fails). Phorest's booking app shows its own cookie banner and a "Special offers" category inside the panel, in its brand colour #c4a7a1. reception-flowers-products shows the edge of a ring light (used once as the COMCIT card): re-crop in Stage 5. Hub page weight 820 KB at 360px (AVIF card images at 960w): under the bar, tighten in Stage 9 if more cards are added. Lighthouse notes only: site.js not minified (6 KB), unused CSS in the single bundle (23 KB). |
| 3 | 2026-11-08 | Home page (src/index.njk): hero (hero-desk crops, headline "Aesthetics & beauty in Warrington", positioning line, Book now, edge label, live open status), review proof (count-up to 6,736, source line, average and Google rating as TODO, 3 review placeholders), section links plus 6 featured treatment cards (prices from services.json), velvet texture band, "Not sure what to book?", team and results placeholders, static Instagram grid (6 salon photos), visit block (hours, address, directions line, map), closing band. scripts/make-map.js: Overpass data cached in scripts/data/osm-penketh.json, renders src/_includes/map.svg (21 KB, Espresso ground, Ivory/Champagne roads, tinted buildings, labels Meeting Ln, Honiton Way, Greystone Rd, precinct buildings tinted), inlined by the map macro with the OSM credit; map pin now Ivory with Champagne ring. New patterns .hubs, .igrid, .visit documented in COMPONENTS.md. site.json gets directions; sections.json gets photos and lines for 4 more cards. Mobile Lighthouse 100/100/100/100 (LCP 1.4 s, CLS 0, 446 KiB). check and shots pass. | Review texts, names and dates; average and Google rating; team names, roles, portraits; results; team intro line | Map marker is approximate (building level, from Yemi's description); Yemi to confirm it looks right. Link check: 4 treatment pages linked from the home cards are pending (added to link-pending.json). Featured-card photos for dermal fillers, lashes, nails and massage are interim. Directions line wording still TODO for Yemi to confirm. |
| 4 | 2026-11-08 | Aesthetics hub + 8 pages (lines and wrinkles consultation, dermal fillers, skin boosters, polynucleotides, biostimulators, microneedling, fat dissolving, hair loss) assembled from parallel-written content files into the existing hub and treatment layouts; no new components or CSS. Toxin consultation shows Free consultation only; microneedling, Profhilo and fat dissolving prices held back (Price on consultation). review/aesthetics.md generated by scripts/make-review-docs.js (npm run review-docs): full copy, Facts to confirm checklist and open placeholders per page. build, check (no new allowlist entries), shots (no overflow, no axe violations, weight OK) pass; Lighthouse mobile 100/100/100/100 on /aesthetics/ and /aesthetics/dermal-fillers/. | Practitioner names, roles and registrations; fat dissolving product, contents and massage advice; hair filler product; Newest product name; photos for cards (interim placeholders) | Prescriber sign-off needed on all aesthetics copy and every Typically range. Writers assumed 18+ policy for all aesthetics, 60 min consultation duration and the 45 min appointment length: confirm. |
| 5 | 2026-11-08 | Facials hub + CACI, COMCIT, Crystal Clear, dermaplaning, glycolic peel (hub and dermaplaning sample updated to final copy). review/facials.md generated. Same checks pass; shots on all 6 pages clean. | Exact contents of Ultimate Anti-Ageing Facial, COMCIT mechanism and Prime & Peel, Crystal Clear inclusions, glycolic peel steps, strength and pre-peel pause, course lengths and totals for CACI | Aftercare sections say the safety and aftercare page will have more advice once published: link or remove when that page exists (Stage 7). Course totals not shown where course length is unknown. |
| 6 | 2026-11-08 | Beauty hub + lashes and brows, nails and pedicures, Little Miss Urban, massage, body and tanning, waxing, men. review/beauty.md generated. Compliance check caught Gel cured under a lamp on the nails page (banned word cured): reworded to set. Same checks pass; shots on all 8 pages clean. | Express Lashes and Eye Package contents, Shrinking Violet, CACI Bum Lift and Signature Back and Body contents, gentleman manicure and pedicure contents, Little Miss Urban treatment contents | Patch test link on lash and brow pages depends on the Stage 7 safety page. Men brow wax is booked from the waxing page. Free parking line appears on massage and men leads only. |

| Aesthetics review | 2026-11-08 | Independent review applied (7 must, 7 should). Consultation page: no results or downtime facts (new Format fact), "Consultations" heading, general-reviews prompt only, sweating and teeth grinding consultations removed from the page and FAQ, "impartial" and "treatment elsewhere" wording removed, Book buttons to the contact form (launch gate). Filler dissolving (and refill) now marked prescription in services.json and the import script, dropped from the filler page and replaced by a filler review consultation line with a TODO. Vision line (999 or A&E) added to filler and biostimulator aftercare. Fat dissolving: no permanence or course claims, results "Discussed at your consultation", noindex. Hair loss, skin booster and biostimulator wording softened to "designed to"; PRP sign-off note. Price lists use sentence-case menu names; held-back prices show "Price on consultation" (strip, list, cards, hub), FAQs marked "remove if price published"; hub lead corrected. CACI and COMCIT card lines toned down. | Filler review consultation (service and wording), prescriber sign-off | Tear trough renamed "Dermal Filler: Tear Trough" (confirm). 1ml filler area unknown (TODO in the row). |
| 7 | 2026-11-08 | Trust pages: /consultation/ (routes for aesthetics, skin and beauty, how it works, consultation, patch tests, preparing, FAQs) and /aftercare/ (emergency callout, normal recovery, warning signs, contact, complications, links to every treatment's aftercare, complaints; print button and print styles), /about/ (story placeholder, seal, approach, three practitioner cards with fields, business details), /contact/ (Netlify form, details, hours with today highlighted, directions, brand map). New: trust layout, callout, pcard, contact styles, footer links; lashes page links to patch tests and aftercare. | Salon story; practitioner names, roles, registration, training, insurance, treatments; aftercare contact hours, out-of-hours route, complication escalation, complaints procedure; patch test lead time; health form method; guests policy; step-free access | Contact form needs a real Netlify deploy to receive messages (Stage 10). |
| 8 | 2026-11-08 | Privacy, cookies, cancellation and booking terms drafted in plain English, each with "Draft, pending legal review". Plausible (production build only). Unique titles and descriptions, canonical, Open Graph and Twitter tags; 31 branded share images (npm run share-images); JSON-LD (BeautySalon, Service with public non-prescription minimum price, BreadcrumbList; no review markup); sitemap.xml, robots.txt, netlify.toml (build, headers, asset caching, www to apex). scripts/seo-check.js added to npm run check; compliance check now bans hyaluronidase. Lighthouse mobile 100/100/100/100 on /contact/, /privacy/, /about/, /aftercare/. | ICO number; cancellation, deposit, late and no-show terms; retention periods; Phorest cookies and data terms; photo practice; legal review of all four policies; geo point and priceRange to confirm | No Content-Security-Policy yet (inline scripts, Phorest frames): add after the live Phorest test. Netlify installs devDependencies (Playwright, ffmpeg-static, Lighthouse): consider trimming at Stage 10. Plausible account must exist for the domain. |

## Waiting on Yemi (blocks launch, not the build)

- **LAUNCH GATE, Phorest:** rename all 11 toxin services to "Lines and wrinkles consultation", "Excessive sweating consultation" and "Teeth grinding consultation" and set them to £0 or hide the price; remove any from Special offers; likewise rename filler dissolving and "dissolving and refill" (prescription-only medicine) and remove their prices. Until then the consultation page Book button goes to the contact form (`site.booking.consultationVia`), but the header, mobile bar and closing Book buttons still open Phorest.
- Prescriber and Yemi decisions: excessive sweating and teeth grinding consultations are removed from the site (restore only with prescriber sign-off); a "free filler review consultation" must exist as a service before the filler page promises it; fat dissolving stays noindex until the product is confirmed (if it is a prescription medicine, make it consultation-only); PRP wording, blood draw and who performs it.

- Practitioner details and registrations
- Prescriber sign-off on aesthetics wording
- Phorest clean-up (toxin services into one free consultation, name spellings, fat dissolving product; no toxin offers in the booking menu's "Special offers", which shows inside the site's booking panel)
- Phorest booking colours: Manager > Settings > Online > Setup & Appearance, brand colour from #c4a7a1 to Champagne #C6A77D or Espresso #3B302A
- Company number, registered office, ICO number, cancellation and deposit terms
- Aftercare hours and how complications are escalated
- Photos, salon story, 10 to 20 full review texts, total review count and average rating, Google rating
- Profhilo, microneedling and fat dissolving price decision
